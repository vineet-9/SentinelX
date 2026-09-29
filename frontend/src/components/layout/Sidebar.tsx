import {
  History,
  LayoutDashboard,
  LogOut,
  Shield,
  ShieldAlert,
  Upload,
  User,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/useAuth";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Upload",
    path: "/upload",
    icon: Upload,
  },
  {
    name: "History",
    path: "/history",
    icon: History,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const visibleMenuItems = user?.is_superuser
    ? [
        ...menuItems,
        {
          name: "Security",
          path: "/admin/security",
          icon: ShieldAlert,
        },
      ]
    : menuItems;

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:w-64">
      <div className="flex items-center justify-center gap-3 border-b border-slate-800 p-4 md:justify-start md:p-6">
        <Shield
          className="h-8 w-8 shrink-0 text-blue-500"
          aria-hidden="true"
        />

        <h1 className="hidden text-xl font-bold text-white md:block">
          SentinelX
        </h1>
      </div>

      <nav className="flex-1 space-y-2 px-2 py-6 md:px-4">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={item.name}
              aria-label={item.name}
              className={({ isActive }) =>
                `flex items-center justify-center gap-3 rounded-lg px-3 py-3 transition md:justify-start md:px-4 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon
                size={20}
                className="shrink-0"
                aria-hidden="true"
              />

              <span className="hidden md:block">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-2 md:p-4">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-3 text-slate-300 transition hover:bg-red-600 hover:text-white md:justify-start md:px-4"
        >
          <LogOut
            size={20}
            className="shrink-0"
            aria-hidden="true"
          />

          <span className="hidden md:block">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}