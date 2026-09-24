from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.permissions import require_superuser
from app.database.dependencies import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import (
    get_audit_logs,
    get_audit_logs_for_user,
)

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


@router.get(
    "/logs",
    response_model=list[AuditLogResponse],
)
def read_audit_logs(
    user_email: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superuser),
):
    if user_email:
        return get_audit_logs_for_user(
            db=db,
            user_email=user_email,
            limit=limit,
        )

    return get_audit_logs(
        db=db,
        limit=limit,
    )