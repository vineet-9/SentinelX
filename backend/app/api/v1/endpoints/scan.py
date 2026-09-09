from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.scan import ScanResponse
from app.services.scan_service import (
    create_scan,
    save_file,
)
from app.services.scan_service import (
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
    print("Reached endpoint")
    print(file.filename)

    _, sha256 = save_file(file)

    print(sha256)

    existing_scan = get_scan_by_sha256(db, sha256)

    if existing_scan:
        return existing_scan

    scan = create_scan(
        db=db,
        filename=file.filename,
        sha256=sha256,
    )

    print(scan)

    return scan