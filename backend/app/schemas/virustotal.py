from pydantic import BaseModel


class VirusTotalResponse(BaseModel):
    sha256: str
    found: bool

    malicious: int
    suspicious: int
    harmless: int
    undetected: int

    reputation: int
    last_analysis_date: int | None