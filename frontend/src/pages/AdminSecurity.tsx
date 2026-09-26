import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getAuditLogs, type AuditLog } from "@/services/auditService";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getEventIcon(event: string) {
  switch (event) {
    case "Failed Login":
      return AlertTriangle;

    case "Unauthorized Admin Access":
      return ShieldAlert;

    case "User Login":
      return ShieldCheck;

    default:
      return CheckCircle;
  }
}

function getEventClass(event: string) {
  switch (event) {
    case "Failed Login":
    case "Unauthorized Admin Access":
      return "bg-red-500/10 text-red-400";

    case "VirusTotal Lookup":
    case "VirusTotal Cache Used":
      return "bg-blue-500/10 text-blue-400";

    case "Scan Uploaded":
      return "bg-emerald-500/10 text-emerald-400";

    case "Scan Duplicate Detected":
      return "bg-amber-500/10 text-amber-400";

    default:
      return "bg-slate-500/10 text-slate-300";
  }
}

export default function AdminSecurity() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      setError(null);

      const data = await getAuditLogs(undefined, 100);

      setLogs(data);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const response = err.response;

        if (
          typeof response === "object" &&
          response !== null &&
          "status" in response &&
          response.status === 403
        ) {
          setError(
            "You do not have permission to view the security audit log."
          );
          return;
        }
      }

      setError("Unable to load security audit events.");
    }
  }, []);

  useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      setError(null);

      const data = await getAuditLogs(undefined, 100);

      if (cancelled) {
        return;
      }

      setLogs(data);
    } catch (err: unknown) {
      if (cancelled) {
        return;
      }

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const response = err.response;

        if (
          typeof response === "object" &&
          response !== null &&
          "status" in response &&
          response.status === 403
        ) {
          setError(
            "You do not have permission to view the security audit log."
          );
          return;
        }
      }

      setError("Unable to load security audit events.");
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  load();

  return () => {
    cancelled = true;
  };
}, []);

  function handleRefresh() {
    setRefreshing(true);
    loadLogs();
  }

  const failedLogins = useMemo(
    () => logs.filter((log) => log.event === "Failed Login").length,
    [logs]
  );

  const unauthorizedAccess = useMemo(
    () =>
      logs.filter((log) => log.event === "Unauthorized Admin Access").length,
    [logs]
  );

  const scanEvents = useMemo(
    () =>
      logs.filter(
        (log) =>
          log.event === "Scan Uploaded" ||
          log.event === "Scan Duplicate Detected"
      ).length,
    [logs]
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading security events...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-red-400" />

          <div>
            <h2 className="font-semibold text-white">
              Security audit unavailable
            </h2>

            <p className="mt-1 text-sm text-red-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-blue-500" />

            <h1 className="text-3xl font-bold text-white">
              Security Audit
            </h1>
          </div>

          <p className="mt-2 text-slate-400">
            Monitor security-sensitive activity across SentinelX.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Total Events
            </p>

            <Clock className="h-5 w-5 text-slate-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-white">
            {logs.length}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Failed Logins
            </p>

            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-white">
            {failedLogins}
          </p>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Unauthorized Access
            </p>

            <ShieldAlert className="h-5 w-5 text-orange-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-white">
            {unauthorizedAccess}
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Scan Events
            </p>

            <ShieldCheck className="h-5 w-5 text-blue-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-white">
            {scanEvents}
          </p>
        </div>
      </div>

      {/* Audit table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">
            Recent Security Events
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Latest security-sensitive activity recorded by SentinelX.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            No audit events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Event
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    IP Address
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => {
                  const Icon = getEventIcon(log.event);

                  return (
                    <tr
                      key={log.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${getEventClass(
                              log.event
                            )}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <span className="font-medium text-slate-200">
                            {log.event}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {log.user_email}
                      </td>

                      <td className="px-6 py-4 font-mono text-sm text-slate-400">
                        {log.ip_address}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}