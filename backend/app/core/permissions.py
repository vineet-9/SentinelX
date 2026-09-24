from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_current_user, get_db
from app.models.user import User
from app.services.audit_service import create_audit_log


def require_superuser(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        create_audit_log(
            db=db,
            event="Unauthorized Admin Access",
            user_email=current_user.email,
            ip_address=request.client.host,
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return current_user