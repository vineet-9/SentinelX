import { useRef, useState } from "react";
import axios from "axios";
import {
  Upload as UploadIcon,
  File as FileIcon,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";

import Card from "@/components/ui/Card";
import api from "@/api/client";

type UploadResult = {
  id?: string;
  filename?: string;
  sha256?: string;
  is_malicious?: boolean;
  matched_rule?: string | null;
  scan_status?: string;
  uploaded_at?: string;
  vt_found?: boolean;
  vt_malicious?: number;
  vt_suspicious?: number;
  vt_harmless?: number;
  vt_undetected?: number;
  vt_reputation?: number;
  vt_last_analysis_date?: number | null;
};

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post<UploadResult>(
        "/scan/upload",
        formData
      );

      setResult(response.data);
    } catch (err: unknown) {
      console.error("Upload error:", err);

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map(
                (item: { msg?: string }) =>
                  item.msg ?? "Validation error"
              )
              .join(", ")
          );
        } else if (typeof detail === "string") {
          setError(detail);
        } else {
          setError("Upload failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          Upload Sample
        </h1>

        <p className="mt-2 text-zinc-400">
          Upload a file for malware analysis using YARA rules.
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <div
          className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 px-6 transition-colors hover:border-blue-500/60 hover:bg-zinc-800/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="mb-5 rounded-full bg-blue-500/10 p-5">
            <UploadIcon className="h-10 w-10 text-blue-400" />
          </div>

          <h2 className="text-lg font-semibold text-white">
            Choose a file to analyze
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Click here to browse files
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            SentinelX will calculate the SHA256 hash and scan the file.
          </p>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-zinc-800 p-3">
                <FileIcon className="h-6 w-6 text-blue-400" />
              </div>

              <div>
                <p className="font-medium text-white">
                  {file.name}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                removeFile();
              }}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Upload Button */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleUpload();
          }}
          disabled={!file || uploading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? "Analyzing..." : "Start Malware Scan"}
        </button>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <div>
            <h3 className="font-semibold text-red-400">
              Scan failed
            </h3>

            <p className="mt-1 text-sm text-red-300">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Scan Result */}
      {result && (
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-400" />

            <div>
              <h2 className="text-xl font-semibold text-white">
                Scan completed
              </h2>

              <p className="text-sm text-zinc-500">
                Malware analysis result
              </p>
            </div>
          </div>

          <div className="space-y-5">

            {/* Filename */}
            {result.filename && (
              <div>
                <p className="text-sm text-zinc-500">
                  File
                </p>

                <p className="mt-1 text-white">
                  {result.filename}
                </p>
              </div>
            )}

            {/* SHA256 */}
            {result.sha256 && (
              <div>
                <p className="text-sm text-zinc-500">
                  SHA256
                </p>

                <code className="mt-1 block break-all text-sm text-zinc-300">
                  {result.sha256}
                </code>
              </div>
            )}

            {/* Detection */}
            {typeof result.is_malicious === "boolean" && (
              <div>
                <p className="text-sm text-zinc-500">
                  Detection
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    result.is_malicious
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {result.is_malicious
                    ? "Malicious"
                    : "Clean"}
                </p>
              </div>
            )}

            {/* Matched Rule */}
            {result.matched_rule && (
              <div>
                <p className="text-sm text-zinc-500">
                  Matched Rule
                </p>

                <p className="mt-1 text-red-400">
                  {result.matched_rule}
                </p>
              </div>
            )}

            {/* Scan Status */}
            {result.scan_status && (
              <div>
                <p className="text-sm text-zinc-500">
                  Scan Status
                </p>

                <p className="mt-1 text-zinc-300">
                  {result.scan_status}
                </p>
              </div>
            )}

            {/* VirusTotal */}
            {typeof result.vt_found === "boolean" && (
              <div>
                <p className="text-sm text-zinc-500">
                  VirusTotal
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    result.vt_found
                      ? "text-blue-400"
                      : "text-zinc-400"
                  }`}
                >
                  {result.vt_found
                    ? "Hash found in VirusTotal"
                    : "Hash not found in VirusTotal"}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}