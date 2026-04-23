"use client";

import Link from "next/link";
import type { AuditLogEntryWithUser } from "@/types/database";

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    "user.login": "Signed in",
    "user.logout": "Signed out",
    "user.create": "Created user",
    "user.role_change": "Changed role",
    "settings.update": "Updated setting",
    "settings.create": "Created setting",
    "settings.delete": "Deleted setting",
    "system.backup": "System backup",
  };
  return labels[action] || action;
}

interface RecentActivityProps {
  entries: AuditLogEntryWithUser[];
}

export function RecentActivity({ entries }: RecentActivityProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Link
          href="/admin/audit"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {actionLabel(entry.action)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {entry.profiles?.full_name || entry.profiles?.email || "System"}
                {entry.resource_id && ` - ${entry.resource_id}`}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(entry.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
