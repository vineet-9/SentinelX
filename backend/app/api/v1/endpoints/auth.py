from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, Token
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


@router.post(
    "/login",
    response_model=Token,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, credentials.email)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(
        credentials.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(str(user.id))

    return Token(
        access_token=access_token,
    )