import hashlib
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.scan import Scan

UPLOAD_DIR = Path("app/uploads")


def save_file(file: UploadFile) -> tuple[str, str]:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    file_path = UPLOAD_DIR / file.filename

    content = file.file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    sha256 = hashlib.sha256(content).hexdigest()

    return str(file_path), sha256


def create_scan(
    db: Session,
    filename: str,
    sha256: str,
) -> Scan:
    scan = Scan(
        filename=filename,
        sha256=sha256,
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return scan

from sqlalchemy import select

def get_scan_by_sha256(
    db: Session,
    sha256: str,
) -> Scan | None:
    statement = select(Scan).where(Scan.sha256 == sha256)
    return db.execute(statement).scalar_one_or_none()