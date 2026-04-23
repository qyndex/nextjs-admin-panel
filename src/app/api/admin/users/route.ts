import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    users: data ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();
  const { userId, role } = body as { userId: string; role: string };

  if (!userId || !role) {
    return NextResponse.json(
      { error: "userId and role are required" },
      { status: 400 }
    );
  }

  if (!["admin", "editor", "viewer"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be admin, editor, or viewer" },
      { status: 400 }
    );
  }

  // Get old role for audit log
  const { data: oldProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the role change
  await supabase.from("audit_log").insert({
    action: "user.role_change",
    resource_type: "user",
    resource_id: userId,
    details: {
      old_role: oldProfile?.role,
      new_role: role,
    },
  });

  return NextResponse.json({ user: data });
}
