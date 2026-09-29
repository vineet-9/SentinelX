import { useCallback, useEffect, useState } from "react";

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [statsData, historyData] = await Promise.all([
        getDashboardStats(),
        getScanHistory(),
      ]);

      setStats(statsData);
      setScans(historyData);
    } catch (err: unknown) {
      console.error("Failed to load dashboard data:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDashboard() {
      try {
        setError(null);

        const [statsData, historyData] = await Promise.all([
          getDashboardStats(),
          getScanHistory(),
        ]);

        if (cancelled) {
          return;
        }

        setStats(statsData);
        setScans(historyData);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load dashboard data:", err);
        setError("Unable to load dashboard data.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    stats,
    scans,
    loading,
    refreshing,
    error,
    refresh: loadDashboard,
  };
}