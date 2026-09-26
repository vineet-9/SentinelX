import hashlib
import re
from pathlib import Path
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.yara_engine import scan_file
from app.models.scan import Scan


UPLOAD_DIR = Path("app/uploads")


def sanitize_filename(filename: str | None) -> str:
    """
    Sanitize a client-provided filename for safe database storage.

    The filename is never used as a filesystem path.
    """
    if not filename:
        return "unnamed_file"

    # Remove both Unix and Windows path components.
    safe_name = re.split(r"[\\/]", filename)[-1]

    # Remove control characters.
    safe_name = "".join(
        character
        for character in safe_name
        if character.isprintable()
    )

    safe_name = safe_name.strip()

    if not safe_name:
        return "unnamed_file"

    # Keep database values reasonably bounded.
    return safe_name[:255]


def save_file(file: UploadFile) -> tuple[str, str, bool]:
    """
    Save an uploaded file using its SHA-256 hash as the filesystem name.

    Returns:
        (file_path, sha256_hash, file_created)

    Security properties:
    - Rejects empty files.
    - Enforces the configured maximum size.
    - Never uses the client filename as a filesystem path.
    - Hashes content while reading.
    - Uses the SHA-256 hash as the storage filename.
    """
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    max_size = settings.max_upload_size_mb * 1024 * 1024

    hasher = hashlib.sha256()
    total_size = 0
    chunks: list[bytes] = []

    while True:
        chunk = file.file.read(1024 * 1024)

        if not chunk:
            break

        total_size += len(chunk)

        if total_size > max_size:
            raise ValueError(
                f"File exceeds the maximum allowed size of "
                f"{settings.max_upload_size_mb} MB."
            )

        hasher.update(chunk)
        chunks.append(chunk)

    if total_size == 0:
        raise ValueError("Uploaded file is empty.")

    sha256 = hasher.hexdigest()

    # Never use the original filename for filesystem storage.
    file_path = UPLOAD_DIR / f"{sha256}.bin"

    file_created = False

    # Avoid overwriting an existing file with the same content.
    if not file_path.exists():
        with open(file_path, "wb") as buffer:
            for chunk in chunks:
                buffer.write(chunk)

        file_created = True

    return str(file_path), sha256, file_created


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
    scan.vt_found = vt_data.get("found", False)
    scan.vt_malicious = vt_data.get("malicious", 0)
    scan.vt_suspicious = vt_data.get("suspicious", 0)
    scan.vt_harmless = vt_data.get("harmless", 0)
    scan.vt_undetected = vt_data.get("undetected", 0)
    scan.vt_reputation = vt_data.get("reputation", 0)
    scan.vt_last_analysis_date = vt_data.get("last_analysis_date")

    db.commit()
    db.refresh(scan)

    return scan