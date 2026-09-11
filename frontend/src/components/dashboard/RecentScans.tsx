import {
  FileText,
  FileImage,
  FileArchive,
  FileCode2,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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

export default function RecentScans({ scans }: Props) {
  return (
    <Card>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Recent Scans
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Latest malware analysis activity
        </p>
      </div>

      {/* Table */}
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
                Rule
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
                className="border-b border-zinc-800/70 transition-colors hover:bg-zinc-800/40 last:border-none"
              >
                {/* File */}
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

                {/* Status */}
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

                {/* Rule */}
                <td className="py-4 text-zinc-400">
                  {scan.matched_rule ?? "—"}
                </td>

                {/* SHA256 */}
                <td className="py-4">
                  <code className="text-xs text-zinc-500">
                    {scan.sha256.slice(0, 12)}...
                  </code>
                </td>
              </tr>
            ))}

            {/* Empty State */}
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