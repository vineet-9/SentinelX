import {
  Shield,
  Bug,
  CheckCircle,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import RecentScans from "@/components/dashboard/RecentScans";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard() {
  const {
    stats,
    scans,
    loading,
    error,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-zinc-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <h2 className="font-semibold text-red-400">
          Dashboard unavailable
        </h2>

        <p className="mt-2 text-sm text-red-300">
          {error ?? "Unable to load dashboard data."}
        </p>
      </div>
    );
  }

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

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Scans"
          value={stats.total_scans}
          icon={Shield}
          iconColor="text-blue-400"
          accentColor="bg-blue-500"
          trend="Live"
        />

        <StatCard
          title="Malicious"
          value={stats.malicious}
          icon={Bug}
          iconColor="text-red-400"
          accentColor="bg-red-500"
          trend="Detected"
        />

        <StatCard
          title="Clean"
          value={stats.clean}
          icon={CheckCircle}
          iconColor="text-green-400"
          accentColor="bg-green-500"
          trend="Safe"
        />
      </div>

      {/* Recent Scans */}
      <RecentScans scans={scans} />
    </div>
  );
}