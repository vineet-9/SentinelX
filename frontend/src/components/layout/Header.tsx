import { Bell, UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
      <h2 className="text-2xl font-semibold text-white">
        Dashboard
      </h2>

      <div className="flex items-center gap-5">
        <Bell className="text-slate-300 cursor-pointer hover:text-white" />

        <div className="flex items-center gap-2">
          <UserCircle className="text-blue-400" />
          <span className="text-slate-300">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}