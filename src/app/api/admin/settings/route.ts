import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("key");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data ?? [] });
}

export async function PUT(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();
  const { id, key, value } = body as { id?: string; key: string; value: unknown };

  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  if (id) {
    // Update existing setting
    const { data: oldSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the update
    await supabase.from("audit_log").insert({
      action: "settings.update",
      resource_type: "setting",
      resource_id: key,
      details: { old_value: oldSetting?.value, new_value: value },
    });

    return NextResponse.json({ setting: data });
  } else {
    // Create new setting
    const { data, error } = await supabase
      .from("settings")
      .insert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("audit_log").insert({
      action: "settings.create",
      resource_type: "setting",
      resource_id: key,
      details: { value },
    });

    return NextResponse.json({ setting: data });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const key = searchParams.get("key");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("settings").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_log").insert({
    action: "settings.delete",
    resource_type: "setting",
    resource_id: key || id,
    details: {},
  });

  return NextResponse.json({ success: true });
}
