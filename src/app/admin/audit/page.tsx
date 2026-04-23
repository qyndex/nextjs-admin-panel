"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { AuditLogEntryWithUser } from "@/types/database";

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionBadgeColor(action: string): string {
  if (action.startsWith("user.login")) return "bg-green-100 text-green-800";
  if (action.startsWith("user.")) return "bg-blue-100 text-blue-800";
  if (action.startsWith("settings.")) return "bg-yellow-100 text-yellow-800";
  if (action.startsWith("system.")) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntryWithUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);

      const res = await fetch(`/api/admin/audit?${params}`);
      if (!res.ok) throw new Error("Failed to fetch audit log");

      const data = await res.json();
      setEntries(data.entries);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">{total} entries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search actions, resources..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search audit log"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by action"
        >
          <option value="">All actions</option>
          <option value="user.login">User Login</option>
          <option value="user.role_change">Role Change</option>
          <option value="user.create">User Create</option>
          <option value="settings.update">Settings Update</option>
          <option value="settings.create">Settings Create</option>
          <option value="settings.delete">Settings Delete</option>
          <option value="system.backup">System Backup</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-md border bg-muted/50" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border bg-background p-8 text-center text-muted-foreground">
          No audit log entries found.
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-background divide-y">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionBadgeColor(
                        entry.action
                      )}`}
                    >
                      {entry.action}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {entry.profiles?.full_name ||
                        entry.profiles?.email ||
                        "System"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(entry.created_at)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {entry.resource_type && (
                    <span>
                      Resource:{" "}
                      <span className="font-mono">
                        {entry.resource_type}
                        {entry.resource_id && `/${entry.resource_id}`}
                      </span>
                    </span>
                  )}
                  {entry.ip_address && <span>IP: {entry.ip_address}</span>}
                </div>

                {entry.details &&
                  Object.keys(entry.details).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Details
                      </summary>
                      <pre className="mt-1 rounded bg-muted p-2 overflow-x-auto font-mono text-xs">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    </details>
                  )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
