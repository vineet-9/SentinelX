import api from "@/api/client";

export type DashboardStats = {
  total_scans: number;
  malicious: number;
  clean: number;
  last_scan: string | null;
};

export type Scan = {
  id: string;
  filename: string;
  sha256: string;
  is_malicious: boolean;
  matched_rule: string | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/scan/stats");

  return response.data;
}

export async function getScanHistory(): Promise<Scan[]> {
  const response = await api.get<Scan[]>("/scan/history");

  return response.data;
}