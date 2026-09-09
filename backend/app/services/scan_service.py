import hashlib
from pathlib import Path
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.yara_engine import scan_file
from app.models.scan import Scan

UPLOAD_DIR = Path("app/uploads")


def save_file(file: UploadFile) -> tuple[str, str]:
    """
    Save uploaded file and return:
    (file_path, sha256_hash)
    """

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    file_path = UPLOAD_DIR / file.filename

    content = file.file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    sha256 = hashlib.sha256(content).hexdigest()

    return str(file_path), sha256


def analyze_file(file_path: str) -> tuple[bool, str | None]:
    return scan_file(file_path)


def get_scan_by_sha256(
    db: Session,
    sha256: str,
) -> Scan | None:

    statement = select(Scan).where(Scan.sha256 == sha256)

    return db.execute(statement).scalar_one_or_none()


def get_scan_by_id(
    db: Session,
    scan_id: UUID,
) -> Scan | None:

    statement = select(Scan).where(Scan.id == scan_id)

    return db.execute(statement).scalar_one_or_none()


def get_all_scans(
    db: Session,
) -> list[Scan]:

    statement = (
        select(Scan)
        .order_by(Scan.uploaded_at.desc())
    )

    return list(db.execute(statement).scalars().all())


def create_scan(
    db: Session,
    filename: str,
    sha256: str,
    is_malicious: bool,
    matched_rule: str | None,
    scan_status: str,
) -> Scan:

    scan = Scan(
        filename=filename,
        sha256=sha256,
        is_malicious=is_malicious,
        matched_rule=matched_rule,
        scan_status=scan_status,
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return scan


def get_scan_stats(db: Session):

    total_scans = db.scalar(
        select(func.count()).select_from(Scan)
    ) or 0

    malicious = db.scalar(
        select(func.count())
        .select_from(Scan)
        .where(Scan.is_malicious.is_(True))
    ) or 0

    clean = db.scalar(
        select(func.count())
        .select_from(Scan)
        .where(Scan.is_malicious.is_(False))
    ) or 0

    last_scan = db.scalar(
        select(Scan.uploaded_at)
        .order_by(Scan.uploaded_at.desc())
        .limit(1)
    )

    return {
        "total_scans": total_scans,
        "malicious": malicious,
        "clean": clean,
        "last_scan": last_scan,
    }