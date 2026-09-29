type BadgeProps = {
  text: string;
  type: "clean" | "malicious" | "pending";
};

export default function Badge({ text, type }: BadgeProps) {
  const colors = {
    clean: "bg-green-500/20 text-green-400",
    malicious: "bg-red-500/20 text-red-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[type]}`}
    >
      {text}
    </span>
  );
}