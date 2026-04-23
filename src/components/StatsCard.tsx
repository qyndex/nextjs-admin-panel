import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, change, description }: StatsCardProps) {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {change && (
          <p
            className={`text-xs mt-1 ${
              change.startsWith("+") ? "text-green-600" : "text-red-600"
            }`}
          >
            {change} from last month
          </p>
        )}
        {description && !change && (
          <p className="text-xs mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
