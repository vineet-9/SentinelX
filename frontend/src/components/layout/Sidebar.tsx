import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  History,
  User,
  LogOut,
  Shield,
} from "lucide-react";

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
  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-800">
        <Shield className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold text-white">
          SentinelX
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
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

      {/* Logout */}
      <div className="border-t border-slate-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-red-600 hover:text-white transition">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}