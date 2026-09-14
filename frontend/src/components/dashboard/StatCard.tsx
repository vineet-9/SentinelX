import type { LucideIcon } from "lucide-react";

import Card from "@/components/ui/Card";

type Props = {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor?: string;
  accentColor?: string;
  trend?: string;
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-400",
  accentColor = "bg-blue-500",
  trend,
}: Props) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${accentColor}`}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            {title}
          </p>

          <h2 className="mt-2 text-5xl font-bold text-white">
            {value}
          </h2>

          {trend && (
            <p className="mt-3 text-sm text-zinc-400">
              {trend}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-zinc-800 p-4">
          <Icon className={`h-10 w-10 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}