from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.scan import ScanResponse, ScanStatsResponse
from app.services.scan_service import (
    analyze_file,
    create_scan,
    get_all_scans,
    get_scan_by_id,
    get_scan_by_sha256,
    get_scan_stats,
    save_file,
)

router = APIRouter(
    prefix="/scan",
    tags=["Scanning"],
)


@router.post(
    "/upload",
    response_model=ScanResponse,
)
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    file_path, sha256 = save_file(file)

    existing_scan = get_scan_by_sha256(db, sha256)

    if existing_scan:
        return existing_scan

    is_malicious, matched_rule = analyze_file(file_path)

    scan = create_scan(
        db=db,
        filename=file.filename,
        sha256=sha256,
        is_malicious=is_malicious,
        matched_rule=matched_rule,
        scan_status="COMPLETED",
    )

    return scan


@router.get(
    "/history",
    response_model=list[ScanResponse],
)
def scan_history(
    db: Session = Depends(get_db),
):

    return get_all_scans(db)


@router.get(
    "/stats",
    response_model=ScanStatsResponse,
)
def scan_stats(
    db: Session = Depends(get_db),
):

    return get_scan_stats(db)


@router.get(
    "/{scan_id}",
    response_model=ScanResponse,
)
def get_scan(
    scan_id: UUID,
    db: Session = Depends(get_db),
):

    scan = get_scan_by_id(db, scan_id)

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    return scan