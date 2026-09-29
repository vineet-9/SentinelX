from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: UUID
    event: str
    user_email: str
    ip_address: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)