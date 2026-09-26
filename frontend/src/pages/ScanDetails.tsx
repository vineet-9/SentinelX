import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@/components/ui/Card";
import {
  getScanDetails,
  type ScanDetails as ScanDetailsType,
} from "@/services/scanService";

export default function ScanDetails() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();

  const [scan, setScan] = useState<ScanDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadScan() {
      if (!scanId) {
        if (!cancelled) {
          setError("Invalid scan ID.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getScanDetails(scanId);

        if (!cancelled) {
          setScan(data);
        }
      } catch (err: unknown) {
        console.error("Failed to load scan details:", err);

        if (!cancelled) {
          setError("Unable to load scan details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadScan();

    return () => {
      cancelled = true;
    };
  }, [scanId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-zinc-400">
          Loading scan details...
        </p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-6"
        >
          <h2 className="font-semibold text-red-400">
            Scan unavailable
          </h2>

          <p className="mt-2 text-sm text-red-300">
            {error ?? "Unable to load scan details."}
          </p>
        </div>
      </div>
    );
  }

  const malicious = scan.is_malicious;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <h1 className="text-4xl font-bold text-white">
          Scan Details
        </h1>

        <p className="mt-2 text-zinc-400">
          Detailed malware analysis information.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div
            className={`rounded-xl p-4 ${
              malicious
                ? "bg-red-500/10"
                : "bg-green-500/10"
            }`}
          >
            {malicious ? (
              <AlertTriangle className="h-8 w-8 text-red-400" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-400" />
            )}
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Detection Result
            </p>

            <h2
              className={`text-3xl font-bold ${
                malicious
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {malicious ? "Malicious" : "Clean"}
            </h2>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-white">
          File Information
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-zinc-500">
              Filename
            </p>

            <p className="mt-1 break-words font-medium text-white">
              {scan.filename}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Scan Status
            </p>

            <p className="mt-1 font-medium text-green-400">
              {scan.scan_status}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Uploaded At
            </p>

            <p className="mt-1 text-zinc-300">
              {new Date(scan.uploaded_at).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Matched YARA Rule
            </p>

            <p className="mt-1 break-words font-medium text-red-400">
              {scan.matched_rule ?? "No rule matched"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-zinc-500">
            SHA256
          </p>

          <code className="mt-2 block break-all rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
            {scan.sha256}
          </code>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-white">
          VirusTotal
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Hash reputation information.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-zinc-950/70 p-4">
            <p className="text-sm text-zinc-500">
              Malicious
            </p>

            <p className="mt-1 text-2xl font-bold text-red-400">
              {scan.vt_malicious}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950/70 p-4">
            <p className="text-sm text-zinc-500">
              Suspicious
            </p>

            <p className="mt-1 text-2xl font-bold text-yellow-400">
              {scan.vt_suspicious}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950/70 p-4">
            <p className="text-sm text-zinc-500">
              Harmless
            </p>

            <p className="mt-1 text-2xl font-bold text-green-400">
              {scan.vt_harmless}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950/70 p-4">
            <p className="text-sm text-zinc-500">
              Undetected
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-300">
              {scan.vt_undetected}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-zinc-500">
              Hash Found
            </p>

            <p className="mt-1 font-medium text-blue-400">
              {scan.vt_found ? "Yes" : "No"}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Reputation
            </p>

            <p className="mt-1 font-medium text-white">
              {scan.vt_reputation}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Last Analysis
            </p>

            <p className="mt-1 text-zinc-300">
              {scan.vt_last_analysis_date
                ? new Date(
                    scan.vt_last_analysis_date * 1000,
                  ).toLocaleString()
                : "Not available"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}