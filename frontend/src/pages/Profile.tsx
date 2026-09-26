import { Mail, Shield, User, UserCheck } from "lucide-react";

import Card from "@/components/ui/Card";
import { useAuth } from "@/context/useAuth";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="mt-2 text-zinc-400">
          View your SentinelX account information.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
            <User className="h-10 w-10 text-blue-400" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">
              {user.username}
            </h2>

            <p className="mt-1 text-zinc-400">{user.email}</p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300">
              <Shield className="h-4 w-4" />
              {user.is_superuser ? "Administrator" : "User"}
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Account Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-zinc-800 p-2">
                <UserCheck className="h-5 w-5 text-zinc-300" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-zinc-500">Username</p>
                <p className="mt-1 break-words font-medium text-white">
                  {user.username}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-zinc-800 p-2">
                <Mail className="h-5 w-5 text-zinc-300" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-zinc-500">Email</p>
                <p className="mt-1 break-words font-medium text-white">
                  {user.email}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-zinc-800 p-2">
                <Shield className="h-5 w-5 text-zinc-300" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-zinc-500">Account Role</p>
                <p className="mt-1 font-medium text-white">
                  {user.is_superuser ? "Administrator" : "Standard User"}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-zinc-800 p-2">
                <UserCheck className="h-5 w-5 text-zinc-300" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-zinc-500">Account Status</p>
                <p className="mt-1 font-medium text-emerald-400">
                  Active
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div>
          <p className="text-sm text-zinc-500">User ID</p>
          <p className="mt-1 break-all font-mono text-sm text-zinc-300">
            {user.id}
          </p>
        </div>
      </Card>
    </div>
  );
}