import { useCallback, useEffect, useState } from "react";
import {
  FileArchive,
  FileCode2,
  FileImage,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import {
  getScanHistory,
  type Scan,
} from "@/services/scanService";

function getFileIcon(filename: string) {
  const extension = filename
    .split(".")
    .pop()
    ?.toLowerCase();

  switch (extension) {
    case "exe":
      return (
        <FileCode2 className="h-5 w-5 text-red-400" />
      );

    case "jpg":
    case "jpeg":
    case "png":
      return (
        <FileImage className="h-5 w-5 text-blue-400" />
      );

    case "zip":
      return (
        <FileArchive className="h-5 w-5 text-yellow-400" />
      );

    default:
      return (
        <FileText className="h-5 w-5 text-zinc-400" />
      );
  }
}

export default function History() {
  const navigate = useNavigate();

  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getScanHistory();
      setScans(data);
    } catch (err: unknown) {
      console.error("Failed to load scan history:", err);
      setError("Unable to load scan history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await getScanHistory();

        if (cancelled) {
          return;
        }

        setScans(data);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load scan history:", err);
        setError("Unable to load scan history.");
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

  function openScan(scanId: string) {
    navigate(`/scan/${scanId}`);
  }

  function handleRowKeyDown(
    event: React.KeyboardEvent<HTMLTableRowElement>,
    scanId: string,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openScan(scanId);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-400" />

          <p className="mt-3 text-zinc-400">
            Loading scan history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Scan History
          </h1>

          <p className="mt-2 text-zinc-400">
            Review previous malware analysis activity.
          </p>
        </div>

        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-6"
        >
          <h2 className="font-semibold text-red-400">
            History unavailable
          </h2>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={loadHistory}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Scan History
          </h1>

          <p className="mt-2 text-zinc-400">
            Review previous malware analysis activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            All Scans
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Complete malware analysis history.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-800 text-sm text-zinc-500">
              <tr>
                <th className="pb-4 font-medium">
                  File
                </th>

                <th className="pb-4 font-medium">
                  Status
                </th>

                <th className="pb-4 font-medium">
                  YARA Rule
                </th>

                <th className="pb-4 font-medium">
                  SHA256
                </th>
              </tr>
            </thead>

            <tbody>
              {scans.map((scan) => (
                <tr
                  key={scan.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open scan details for ${scan.filename}`}
                  onClick={() => openScan(scan.id)}
                  onKeyDown={(event) =>
                    handleRowKeyDown(event, scan.id)
                  }
                  className="cursor-pointer border-b border-zinc-800/70 transition-colors hover:bg-zinc-800/40 focus:bg-zinc-800/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 last:border-none"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(scan.filename)}

                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {scan.filename}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {scan.filename
                            .split(".")
                            .pop()
                            ?.toUpperCase() ?? "FILE"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <Badge
                      text={
                        scan.is_malicious
                          ? "Malicious"
                          : "Clean"
                      }
                      type={
                        scan.is_malicious
                          ? "malicious"
                          : "clean"
                      }
                    />
                  </td>

                  <td className="py-4 text-zinc-400">
                    {scan.matched_rule ?? "—"}
                  </td>

                  <td className="py-4">
                    <code className="text-xs text-zinc-500">
                      {scan.sha256.slice(0, 16)}...
                    </code>
                  </td>
                </tr>
              ))}

              {scans.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center"
                  >
                    <FileText className="mx-auto h-10 w-10 text-zinc-700" />

                    <p className="mt-4 text-zinc-400">
                      No scans found.
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">
                      Uploaded files will appear here after
                      scanning.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}