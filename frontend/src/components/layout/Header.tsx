import { useEffect, useState } from "react";
import { Bell, UserCircle } from "lucide-react";

import {
  getCurrentUser,
  type User,
} from "@/services/authService";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Unable to load current user:", error);
      }
    }

    loadUser();
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-8">
      <h2 className="text-2xl font-semibold text-white">
        Dashboard
      </h2>

      <div className="flex items-center gap-5">
        <Bell className="cursor-pointer text-slate-300 hover:text-white" />

        <div className="flex items-center gap-2">
          <UserCircle className="text-blue-400" />

          <span className="text-slate-300">
            {user?.username ?? "User"}
          </span>
        </div>
      </div>
    </header>
  );
}