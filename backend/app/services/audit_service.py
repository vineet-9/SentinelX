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