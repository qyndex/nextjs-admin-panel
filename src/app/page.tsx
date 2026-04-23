import { StatsCard } from "@/components/StatsCard";
import { OverviewChart } from "@/components/OverviewChart";
import { Users, ShoppingCart, DollarSign, Activity } from "lucide-react";

const stats = [
  { title: "Total Users", value: "2,420", icon: Users, change: "+12%" },
  { title: "Total Orders", value: "1,210", icon: ShoppingCart, change: "+8%" },
  { title: "Revenue", value: "$34,500", icon: DollarSign, change: "+23%" },
  { title: "Active Now", value: "573", icon: Activity, change: "+2%" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatsCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            change={s.change}
          />
        ))}
      </div>
      <OverviewChart />
    </div>
  );
}
