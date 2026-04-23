"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Jan", total: 1200 },
  { month: "Feb", total: 2100 },
  { month: "Mar", total: 1800 },
  { month: "Apr", total: 2400 },
  { month: "May", total: 2800 },
  { month: "Jun", total: 3200 },
  { month: "Jul", total: 2900 },
  { month: "Aug", total: 3500 },
  { month: "Sep", total: 3100 },
  { month: "Oct", total: 3800 },
  { month: "Nov", total: 4200 },
  { month: "Dec", total: 4800 },
];

export function OverviewChart() {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Overview</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
