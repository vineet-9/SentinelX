import {
  FileArchive,
  FileCode2,
  FileImage,
  FileText,
} from "lucide-react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

type Scan = {
  id: string;
  filename: string;
  sha256: string;
  is_malicious: boolean;
  matched_rule: string | null;
};

type Props = {
  scans: Scan[];
};

function getFileIcon(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "exe":
      return (
        <FileCode2
          className="h-5 w-5 text-red-400"
          aria-hidden="true"
        />
      );

    case "jpg":
    case "jpeg":
    case "png":
      return (
        <FileImage
          className="h-5 w-5 text-blue-400"
          aria-hidden="true"
        />
      );

    case "zip":
      return (
        <FileArchive
          className="h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
      );

    default:
      return (
        <FileText
          className="h-5 w-5 text-zinc-400"
          aria-hidden="true"
        />
      );
  }
}

export default function RecentScans({ scans }: Props) {
  const navigate = useNavigate();

  function openScan(scanId: string) {
    navigate(`/scan/${scanId}`);
  }

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    scanId: string,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openScan(scanId);
    }
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Recent Scans
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Latest malware analysis activity
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-800 text-sm text-zinc-500">
            <tr>
              <th className="pb-4 font-medium">File</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Rule</th>
              <th className="pb-4 font-medium">SHA256</th>
            </tr>
          </thead>

          <tbody>
            {scans.map((scan) => (
              <tr
                key={scan.id}
                role="button"
                tabIndex={0}
                aria-label={`View scan details for ${scan.filename}`}
                onClick={() => openScan(scan.id)}
                onKeyDown={(event) =>
                  handleRowKeyDown(event, scan.id)
                }
                className="cursor-pointer border-b border-zinc-800/70 transition-colors hover:bg-zinc-800/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 last:border-none"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(scan.filename)}

                    <div>
                      <p className="font-medium text-white">
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
                    {scan.sha256.slice(0, 12)}...
                  </code>
                </td>
              </tr>
            ))}

            {scans.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-zinc-500"
                >
                  No scans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}