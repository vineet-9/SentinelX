from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.permissions import require_superuser
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserRead
from app.services.audit_service import create_audit_log
from app.services.user_service import (
    create_user,
    get_user_by_email,
    get_user_by_username,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    created_user = create_user(db, user)

    create_audit_log(
        db=db,
        event="User Registered",
        user_email=created_user.email,
        ip_address=request.client.host,
    )

    return created_user


@router.post(
    "/login",
    response_model=Token,
)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, form_data.username)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(str(user.id))

    create_audit_log(
        db=db,
        event="User Login",
        user_email=user.email,
        ip_address=request.client.host,
    )

    return Token(
        access_token=access_token,
    )


@router.get(
    "/me",
    response_model=UserRead,
)
def read_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.get("/admin")
def admin_dashboard(
    current_user: User = Depends(require_superuser),
):
    return {
        "message": "Welcome, administrator!",
    }