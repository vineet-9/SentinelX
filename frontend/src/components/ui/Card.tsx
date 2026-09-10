import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`
        rounded-2xl
        border border-zinc-800
        bg-zinc-900/70
        backdrop-blur-md
        p-6
        shadow-lg
        transition-all
        duration-300
        hover:border-blue-500/40
        hover:shadow-blue-500/10
        hover:-translate-y-1
        ${className}
      `}
    >
      {children}
    </div>
  );
}