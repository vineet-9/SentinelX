import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const scans = [
  {
    id: 1,
    filename: "invoice.exe",
    status: "Malicious",
    badge: "malicious",
    rule: "Emotet",
    time: "2 min ago",
  },
  {
    id: 2,
    filename: "photo.jpg",
    status: "Clean",
    badge: "clean",
    rule: "-",
    time: "8 min ago",
  },
  {
    id: 3,
    filename: "setup.exe",
    status: "Malicious",
    badge: "malicious",
    rule: "WannaCry",
    time: "15 min ago",
  },
  {
    id: 4,
    filename: "notes.pdf",
    status: "Pending",
    badge: "pending",
    rule: "-",
    time: "Just now",
  },
] as const;

export default function RecentScans() {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold text-white">
        Recent Scans
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-800 text-zinc-400">
            <tr>
              <th className="pb-3">Filename</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Rule</th>
              <th className="pb-3">Time</th>
            </tr>
          </thead>

          <tbody>
            {scans.map((scan) => (
              <tr
                key={scan.id}
                className="border-b border-zinc-800 last:border-none"
              >
                <td className="py-4">{scan.filename}</td>

                <td>
                  <Badge
                    text={scan.status}
                    type={scan.badge}
                  />
                </td>

                <td>{scan.rule}</td>

                <td className="text-zinc-400">
                  {scan.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}