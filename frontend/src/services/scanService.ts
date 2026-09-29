import api from "@/api/client";

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

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

export async function uploadScan(file: File): Promise<ScanDetails> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ScanDetails>(
    "/scan/upload",
    formData,
  );

  return response.data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/scan/stats");
  return response.data;
}

export async function getScanHistory(): Promise<Scan[]> {
  const response = await api.get<Scan[]>("/scan/history");
  return response.data;
}

export async function getScanDetails(
  scanId: string,
): Promise<ScanDetails> {
  const response = await api.get<ScanDetails>(
    `/scan/${scanId}`,
  );

  return response.data;
}