import {
  Shield,
  Bug,
  CheckCircle,
  RefreshCw,
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
    refresh,
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

        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Dashboard
          </h1>

          <p className="mt-2 text-zinc-400">
            Monitor malware scans, upload activity, and system health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-4">
            <p className="text-sm text-zinc-500">
              System Status
            </p>

            <p className="font-semibold text-green-400">
              ● Healthy
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Scans"
          value={stats.total_scans}
          icon={Shield}
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

      <RecentScans scans={scans} />
    </div>
  );
}