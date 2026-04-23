"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";
import type { Setting } from "@/types/database";

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showNew, setShowNew] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");

      const data = await res.json();
      setSettings(data.settings);

      // Initialize edit values
      const values: Record<string, string> = {};
      for (const s of data.settings) {
        values[s.id] = formatValue(s.value);
      }
      setEditValues(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave(setting: Setting) {
    setSavingId(setting.id);
    setError(null);

    try {
      let parsedValue: unknown;
      const raw = editValues[setting.id];
      try {
        parsedValue = JSON.parse(raw);
      } catch {
        // If not valid JSON, treat as string
        parsedValue = raw;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: setting.id,
          key: setting.key,
          value: parsedValue,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save setting");
      }

      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(setting: Setting) {
    if (!confirm(`Delete setting "${setting.key}"?`)) return;

    setError(null);
    try {
      const res = await fetch(
        `/api/admin/settings?id=${setting.id}&key=${setting.key}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete setting");
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleCreate() {
    if (!newKey.trim()) return;
    setError(null);
    setSavingId("new");

    try {
      let parsedValue: unknown;
      try {
        parsedValue = JSON.parse(newValue);
      } catch {
        parsedValue = newValue;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey.trim(), value: parsedValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create setting");
      }

      setNewKey("");
      setNewValue("");
      setShowNew(false);
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        {isAdmin && (
          <Button onClick={() => setShowNew(!showNew)} aria-label="Add new setting">
            <Plus className="mr-2 h-4 w-4" />
            Add Setting
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {/* New setting form */}
      {showNew && (
        <div className="rounded-xl border bg-background p-4 space-y-3">
          <h3 className="text-sm font-medium">New Setting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Key (e.g. site.name)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Setting key"
            />
            <input
              type="text"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Setting value"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={savingId === "new"}>
              {savingId === "new" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNew(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Settings list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md border bg-muted/50" />
          ))}
        </div>
      ) : settings.length === 0 ? (
        <div className="rounded-xl border bg-background p-8 text-center text-muted-foreground">
          No settings found. Click &quot;Add Setting&quot; to create one.
        </div>
      ) : (
        <div className="rounded-xl border bg-background divide-y">
          {settings.map((setting) => {
            const hasChanged =
              editValues[setting.id] !== formatValue(setting.value);
            return (
              <div
                key={setting.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4"
              >
                <div className="sm:w-1/3">
                  <p className="text-sm font-medium font-mono">{setting.key}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {new Date(setting.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex-1">
                  {isAdmin ? (
                    <input
                      type="text"
                      value={editValues[setting.id] ?? ""}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          [setting.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Value for ${setting.key}`}
                    />
                  ) : (
                    <p className="text-sm font-mono px-3 py-2">
                      {formatValue(setting.value)}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-2 sm:ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(setting)}
                      disabled={!hasChanged || savingId === setting.id}
                      aria-label={`Save ${setting.key}`}
                    >
                      {savingId === setting.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(setting)}
                      aria-label={`Delete ${setting.key}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
