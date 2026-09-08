from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ScanResponse(BaseModel):
    id: UUID
    filename: str
    sha256: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)