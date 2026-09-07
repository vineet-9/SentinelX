from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import hash_password
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.services.user_service import (
    create_user,
    get_user_by_email,
    get_user_by_username,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    return create_user(db, user)