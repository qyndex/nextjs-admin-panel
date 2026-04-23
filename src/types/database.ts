/** Database row types matching the Supabase schema */

export type UserRole = "admin" | "editor" | "viewer";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogEntryWithUser extends AuditLogEntry {
  profiles: Pick<Profile, "full_name" | "email"> | null;
}

export interface DashboardStats {
  total_users: number;
  admin_count: number;
  editor_count: number;
  viewer_count: number;
  recent_signups: number;
  recent_actions: number;
}
