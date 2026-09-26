import { Bell, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/context/useAuth";

function getPageTitle(pathname: string): string {
  if (pathname === "/") {
    return "Dashboard";
  }

  if (pathname === "/upload") {
    return "Upload Sample";
  }

  if (pathname === "/history") {
    return "Scan History";
  }

  if (pathname === "/profile") {
    return "Profile";
  }

  if (pathname === "/admin/security") {
    return "Security";
  }

  if (pathname.startsWith("/scan/")) {
    return "Scan Details";
  }

  return "SentinelX";
}

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-8">
      <h2 className="text-xl font-semibold text-white sm:text-2xl">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-4 sm:gap-5">
        <Bell
          className="text-slate-400"
          aria-hidden="true"
        />

        <div className="flex items-center gap-2">
          <UserCircle
            className="text-blue-400"
            aria-hidden="true"
          />

          <span className="max-w-[140px] truncate text-slate-300 sm:max-w-none">
            {user?.username ?? "User"}
          </span>
        </div>
      </div>
    </header>
  );
}