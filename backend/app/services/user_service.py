from sqlalchemy import select
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.execute(statement).scalar_one_or_none()


def get_user_by_username(db: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    return db.execute(statement).scalar_one_or_none()


def create_user(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_id(
    db: Session,
    user_id: str,
) -> User | None:
    return db.get(User, UUID(user_id))