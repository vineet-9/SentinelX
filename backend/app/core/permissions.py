from fastapi import Depends, HTTPException, status

from app.database.dependencies import get_current_user
from app.models.user import User


def require_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return current_user