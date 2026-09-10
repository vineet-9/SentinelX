from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ScanResponse(BaseModel):
    id: UUID
    filename: str
    sha256: str
    is_malicious: bool
    matched_rule: str | None
    scan_status: str
    uploaded_at: datetime
    vt_found: bool
    vt_malicious: int
    vt_suspicious: int
    vt_harmless: int
    vt_undetected: int
    vt_reputation: int
    vt_last_analysis_date: int | None

    model_config = ConfigDict(from_attributes=True)


class ScanStatsResponse(BaseModel):
    total_scans: int
    malicious: int
    clean: int
    last_scan: datetime | None