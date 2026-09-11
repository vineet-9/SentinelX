import { useEffect, useState } from "react";

import {
  getDashboardStats,
  getScanHistory,
  type DashboardStats,
  type Scan,
} from "@/services/scanService";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [statsData, historyData] = await Promise.all([
          getDashboardStats(),
          getScanHistory(),
        ]);

        setStats(statsData);
        setScans(historyData);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return {
    stats,
    scans,
    loading,
    error,
  };
}