from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.scan import ScanResponse
from app.services.scan_service import (
    analyze_file,
    create_scan,
    get_scan_by_sha256,
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
    # Save the uploaded file and calculate its SHA-256 hash
    file_path, sha256 = save_file(file)

    # Return existing scan if this file was already scanned
    existing_scan = get_scan_by_sha256(db, sha256)
    if existing_scan:
        return existing_scan

    # Analyze the file
    is_malicious, matched_rule = analyze_file(file_path)

    # Save scan result
    scan = create_scan(
        db=db,
        filename=file.filename,
        sha256=sha256,
        is_malicious=is_malicious,
        matched_rule=matched_rule,
        scan_status="COMPLETED",
    )

    return scan