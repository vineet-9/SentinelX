import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import axios from "axios";
import {
  AlertTriangle,
  CheckCircle,
  File as FileIcon,
  Upload as UploadIcon,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Card from "@/components/ui/Card";
import {
  MAX_UPLOAD_SIZE_BYTES,
  uploadScan,
  type ScanDetails,
} from "@/services/scanService";

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ScanDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setResult(null);
    setError(null);

    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError("File size must not exceed 10 MB.");
      return;
    }

    setFile(selectedFile);
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFilePickerKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError("File size must not exceed 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setResult(null);

      const scanResult = await uploadScan(file);
      setResult(scanResult);
    } catch (err: unknown) {
      console.error("Upload error:", err);

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map(
                (item: { msg?: string }) =>
                  item.msg ?? "Validation error",
              )
              .join(", "),
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

  function viewScanDetails() {
    if (result) {
      navigate(`/scan/${result.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Upload Sample
        </h1>

        <p className="mt-2 text-zinc-400">
          Upload a file for malware analysis using YARA rules.
        </p>
      </div>

      <Card>
        <div
          role="button"
          tabIndex={0}
          aria-label="Choose a file to analyze"
          className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 px-6 transition-colors hover:border-blue-500/60 hover:bg-zinc-800/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={openFilePicker}
          onKeyDown={handleFilePickerKeyDown}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="mb-5 rounded-full bg-blue-500/10 p-5">
            <UploadIcon
              className="h-10 w-10 text-blue-400"
              aria-hidden="true"
            />
          </div>

          <h2 className="text-lg font-semibold text-white">
            Choose a file to analyze
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Click here to browse files
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Maximum file size: 10 MB
          </p>
        </div>

        {file && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="rounded-lg bg-zinc-800 p-3">
                <FileIcon
                  className="h-6 w-6 text-blue-400"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {file.name}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Remove selected file"
              onClick={(event) => {
                event.stopPropagation();
                removeFile();
              }}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

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

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
            aria-hidden="true"
          />

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

      {result && (
        <Card>
          <div className="mb-6 flex items-center gap-3">
            {result.is_malicious ? (
              <AlertTriangle
                className="h-6 w-6 text-red-400"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle
                className="h-6 w-6 text-green-400"
                aria-hidden="true"
              />
            )}

            <div>
              <h2 className="text-xl font-semibold text-white">
                Scan completed
              </h2>

              <p className="text-sm text-zinc-500">
                Malware analysis result
              </p>
            </div>
          </div>

          <div
            className={`mb-6 rounded-xl border p-5 ${
              result.is_malicious
                ? "border-red-500/30 bg-red-500/10"
                : "border-green-500/30 bg-green-500/10"
            }`}
          >
            <p className="text-sm text-zinc-400">
              Detection Result
            </p>

            <p
              className={`mt-1 text-2xl font-bold ${
                result.is_malicious
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {result.is_malicious ? "Malicious" : "Clean"}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {result.filename && (
              <div>
                <p className="text-sm text-zinc-500">
                  File
                </p>

                <p className="mt-1 break-words font-medium text-white">
                  {result.filename}
                </p>
              </div>
            )}

            {result.scan_status && (
              <div>
                <p className="text-sm text-zinc-500">
                  Scan Status
                </p>

                <p className="mt-1 font-medium text-green-400">
                  {result.scan_status}
                </p>
              </div>
            )}

            {result.matched_rule && (
              <div>
                <p className="text-sm text-zinc-500">
                  Matched YARA Rule
                </p>

                <p className="mt-1 break-words font-medium text-red-400">
                  {result.matched_rule}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-zinc-500">
                VirusTotal
              </p>

              <p className="mt-1 font-medium text-blue-400">
                {result.vt_found
                  ? "Hash found"
                  : "Hash not found"}
              </p>
            </div>
          </div>

          {result.sha256 && (
            <div className="mt-5">
              <p className="text-sm text-zinc-500">
                SHA256
              </p>

              <code className="mt-2 block break-all rounded-lg bg-zinc-950 p-3 text-xs text-zinc-300">
                {result.sha256}
              </code>
            </div>
          )}

          <button
            type="button"
            onClick={viewScanDetails}
            className="mt-6 w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 font-semibold text-blue-300 transition-colors hover:bg-blue-500/20 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View Scan Details
          </button>
        </Card>
      )}
    </div>
  );
}