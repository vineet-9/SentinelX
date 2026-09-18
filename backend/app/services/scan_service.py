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
    user_id: UUID,
) -> Scan | None:
    """
    Find a scan by SHA256 belonging to the specified user.
    """
    statement = select(Scan).where(
        Scan.sha256 == sha256,
        Scan.user_id == user_id,
    )

    return db.execute(statement).scalar_one_or_none()


def get_scan_by_id(
    db: Session,
    scan_id: UUID,
    user_id: UUID,
) -> Scan | None:
    """
    Find a scan by ID belonging to the specified user.
    """
    statement = select(Scan).where(
        Scan.id == scan_id,
        Scan.user_id == user_id,
    )

    return db.execute(statement).scalar_one_or_none()


def get_all_scans(
    db: Session,
    user_id: UUID,
) -> list[Scan]:
    """
    Return scans belonging only to the specified user.
    """
    statement = (
        select(Scan)
        .where(Scan.user_id == user_id)
        .order_by(Scan.uploaded_at.desc())
    )

    return list(db.execute(statement).scalars().all())


def create_scan(
    db: Session,
    user_id: UUID,
    filename: str,
    sha256: str,
    is_malicious: bool,
    matched_rule: str | None,
    scan_status: str,
) -> Scan:
    """
    Create a scan owned by the specified user.
    """
    scan = Scan(
        user_id=user_id,
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


def get_scan_stats(
    db: Session,
    user_id: UUID,
) -> dict:
    """
    Return scan statistics for the specified user only.
    """
    user_filter = Scan.user_id == user_id

    total_scans = (
        db.scalar(
            select(func.count())
            .select_from(Scan)
            .where(user_filter)
        )
        or 0
    )

    malicious = (
        db.scalar(
            select(func.count())
            .select_from(Scan)
            .where(
                user_filter,
                Scan.is_malicious.is_(True),
            )
        )
        or 0
    )

    clean = (
        db.scalar(
            select(func.count())
            .select_from(Scan)
            .where(
                user_filter,
                Scan.is_malicious.is_(False),
            )
        )
        or 0
    )

    last_scan = db.scalar(
        select(Scan.uploaded_at)
        .where(user_filter)
        .order_by(Scan.uploaded_at.desc())
        .limit(1)
    )

    return {
        "total_scans": total_scans,
        "malicious": malicious,
        "clean": clean,
        "last_scan": last_scan,
    }


def update_scan_virustotal(
    db: Session,
    scan: Scan,
    vt_data: dict,
) -> Scan:
    """
    Save VirusTotal analysis results to the database.
    Ownership is already verified before this function is called.
    """
    scan.vt_found = True
    scan.vt_malicious = vt_data.get("malicious", 0)
    scan.vt_suspicious = vt_data.get("suspicious", 0)
    scan.vt_harmless = vt_data.get("harmless", 0)
    scan.vt_undetected = vt_data.get("undetected", 0)
    scan.vt_reputation = vt_data.get("reputation", 0)
    scan.vt_last_analysis_date = vt_data.get("last_analysis_date")

    db.commit()
    db.refresh(scan)

    return scan