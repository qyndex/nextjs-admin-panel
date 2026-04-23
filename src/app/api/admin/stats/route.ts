import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient();

  const [profilesRes, auditRes] = await Promise.all([
    supabase.from("profiles").select("id, role, created_at"),
    supabase
      .from("audit_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  const profiles = profilesRes.data ?? [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const stats = {
    total_users: profiles.length,
    admin_count: profiles.filter((p) => p.role === "admin").length,
    editor_count: profiles.filter((p) => p.role === "editor").length,
    viewer_count: profiles.filter((p) => p.role === "viewer").length,
    recent_signups: profiles.filter((p) => p.created_at >= sevenDaysAgo).length,
    recent_actions: auditRes.count ?? 0,
  };

  return NextResponse.json({ stats });
}
