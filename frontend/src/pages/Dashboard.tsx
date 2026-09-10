import {
  Shield,
  Bug,
  CheckCircle,
  Clock,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import RecentScans from "@/components/dashboard/RecentScans";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Dashboard
          </h1>

          <p className="mt-2 text-zinc-400">
            Monitor malware scans, upload activity, and system health.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-4">
          <p className="text-sm text-zinc-500">
            System Status
          </p>

          <p className="font-semibold text-green-400">
            ● Healthy
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Scans"
          value={124}
          icon={Shield}
          trend="+14 today"
        />

        <StatCard
          title="Malicious"
          value={12}
          icon={Bug}
          iconColor="text-red-400"
          trend="+2 today"
        />

        <StatCard
          title="Clean"
          value={108}
          icon={CheckCircle}
          iconColor="text-green-400"
          trend="+11 today"
        />

        <StatCard
          title="Pending"
          value={4}
          icon={Clock}
          iconColor="text-yellow-400"
          trend="Processing"
        />
      </div>

      {/* Recent Scans */}
      <RecentScans />
    </div>
  );
}