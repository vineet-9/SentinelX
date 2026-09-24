from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    event: str,
    user_email: str,
    ip_address: str,
) -> AuditLog:
    log = AuditLog(
        event=event,
        user_email=user_email,
        ip_address=ip_address,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def get_audit_logs(
    db: Session,
    limit: int = 100,
) -> list[AuditLog]:
    statement = (
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
    )

    return list(db.execute(statement).scalars().all())


def get_audit_logs_for_user(
    db: Session,
    user_email: str,
    limit: int = 100,
) -> list[AuditLog]:
    statement = (
        select(AuditLog)
        .where(AuditLog.user_email == user_email)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
    )

    return list(db.execute(statement).scalars().all())