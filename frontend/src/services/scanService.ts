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

export type ScanDetails = {
  id: string;
  filename: string;
  sha256: string;
  is_malicious: boolean;
  matched_rule: string | null;
  scan_status: string;
  uploaded_at: string;
  vt_found: boolean;
  vt_malicious: number;
  vt_suspicious: number;
  vt_harmless: number;
  vt_undetected: number;
  vt_reputation: number;
  vt_last_analysis_date: number | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/scan/stats");
  return response.data;
}

export async function getScanHistory(): Promise<Scan[]> {
  const response = await api.get<Scan[]>("/scan/history");
  return response.data;
}

export async function getScanDetails(
  scanId: string
): Promise<ScanDetails> {
  const response = await api.get<ScanDetails>(
    `/scan/${scanId}`
  );

  return response.data;
}