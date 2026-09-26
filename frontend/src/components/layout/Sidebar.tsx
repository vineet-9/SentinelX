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
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-800 p-6">
        <Shield className="h-8 w-8 text-blue-500" />

        <h1 className="text-xl font-bold text-white">
          SentinelX
        </h1>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-300 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}