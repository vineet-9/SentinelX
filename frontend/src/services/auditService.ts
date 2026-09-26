import api from "@/api/client";

export type AuditLog = {
  id: string;
  event: string;
  user_email: string;
  ip_address: string;
  created_at: string;
};

export async function getAuditLogs(
  userEmail?: string,
  limit = 100
): Promise<AuditLog[]> {
  const response = await api.get<AuditLog[]>("/audit/logs", {
    params: {
      user_email: userEmail || undefined,
      limit,
    },
  });

  return response.data;
}