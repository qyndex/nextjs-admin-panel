"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { RecentActivity } from "@/components/RecentActivity";
import { Users, Shield, Edit3, Eye, UserPlus, Activity } from "lucide-react";
import type { DashboardStats } from "@/types/database";
import type { AuditLogEntryWithUser } from "@/types/database";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLogEntryWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/audit?limit=5"),
        ]);

        if (!statsRes.ok || !activityRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const statsData = await statsRes.json();
        const activityData = await activityRes.json();

        setStats(statsData.stats);
        setRecentActivity(activityData.entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border bg-muted/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        {
          title: "Total Users",
          value: stats.total_users.toString(),
          icon: Users,
          description: "All registered users",
        },
        {
          title: "Admins",
          value: stats.admin_count.toString(),
          icon: Shield,
          description: "Full access users",
        },
        {
          title: "Editors",
          value: stats.editor_count.toString(),
          icon: Edit3,
          description: "Content editors",
        },
        {
          title: "Viewers",
          value: stats.viewer_count.toString(),
          icon: Eye,
          description: "Read-only users",
        },
        {
          title: "New This Week",
          value: stats.recent_signups.toString(),
          icon: UserPlus,
          description: "Signups in last 7 days",
        },
        {
          title: "Recent Actions",
          value: stats.recent_actions.toString(),
          icon: Activity,
          description: "Audit events this week",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <StatsCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            description={s.description}
          />
        ))}
      </div>

      <RecentActivity entries={recentActivity} />
    </div>
  );
}
