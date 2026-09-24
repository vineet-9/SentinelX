from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.dependencies import get_current_user, get_db
from app.models.scan import Scan
from app.models.user import User
from app.schemas.scan import ScanResponse, ScanStatsResponse
from app.schemas.virustotal import VirusTotalResponse
from app.services.audit_service import create_audit_log
from app.services.scan_service import (
    analyze_file,
    create_scan,
    get_all_scans,
    get_scan_by_id,
    get_scan_by_sha256,
    get_scan_stats,
    save_file,
    update_scan_virustotal,
)
from app.services.virustotal import lookup_file


router = APIRouter(
    prefix="/scan",
    tags=["Scanning"],
)


@router.post(
    "/upload",
    response_model=ScanResponse,
)
def upload_file(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file_path, sha256 = save_file(file)

    # First check whether this user already has this scan.
    existing_scan = get_scan_by_sha256(
        db=db,
        sha256=sha256,
        user_id=current_user.id,
    )

    if existing_scan:
        create_audit_log(
            db=db,
            event="Scan Duplicate Detected",
            user_email=current_user.email,
            ip_address=request.client.host,
        )

        return existing_scan

    # The database currently enforces globally unique SHA256 values.
    # Check for another user's scan without exposing its details.
    global_existing_scan = db.scalar(
        select(Scan).where(Scan.sha256 == sha256)
    )

    if global_existing_scan:
        create_audit_log(
            db=db,
            event="Scan Duplicate Detected",
            user_email=current_user.email,
            ip_address=request.client.host,
        )

        raise HTTPException(
            status_code=409,
            detail="A scan for this file already exists.",
        )

    is_malicious, matched_rule = analyze_file(file_path)

    try:
        scan = create_scan(
            db=db,
            user_id=current_user.id,
            filename=file.filename,
            sha256=sha256,
            is_malicious=is_malicious,
            matched_rule=matched_rule,
            scan_status="COMPLETED",
        )
    except IntegrityError:
        db.rollback()

        # Protect against a race where another request created
        # the same SHA256 between the checks above.
        existing_scan = get_scan_by_sha256(
            db=db,
            sha256=sha256,
            user_id=current_user.id,
        )

        if existing_scan:
            create_audit_log(
                db=db,
                event="Scan Duplicate Detected",
                user_email=current_user.email,
                ip_address=request.client.host,
            )

            return existing_scan

        create_audit_log(
            db=db,
            event="Scan Duplicate Detected",
            user_email=current_user.email,
            ip_address=request.client.host,
        )

        raise HTTPException(
            status_code=409,
            detail="A scan for this file already exists.",
        )

    create_audit_log(
        db=db,
        event="Scan Uploaded",
        user_email=current_user.email,
        ip_address=request.client.host,
    )

    return scan


@router.get(
    "/history",
    response_model=list[ScanResponse],
)
def scan_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_scans(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/stats",
    response_model=ScanStatsResponse,
)
def scan_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_scan_stats(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{scan_id}",
    response_model=ScanResponse,
)
def get_scan(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = get_scan_by_id(
        db=db,
        scan_id=scan_id,
        user_id=current_user.id,
    )

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    return scan


@router.get(
    "/{scan_id}/virustotal",
    response_model=VirusTotalResponse,
)
def get_virustotal_report(
    request: Request,
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = get_scan_by_id(
        db=db,
        scan_id=scan_id,
        user_id=current_user.id,
    )

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    # Return cached data.
    if scan.vt_found:
        create_audit_log(
            db=db,
            event="VirusTotal Cache Used",
            user_email=current_user.email,
            ip_address=request.client.host,
        )

        return VirusTotalResponse(
            sha256=scan.sha256,
            found=scan.vt_found,
            malicious=scan.vt_malicious,
            suspicious=scan.vt_suspicious,
            harmless=scan.vt_harmless,
            undetected=scan.vt_undetected,
            reputation=scan.vt_reputation,
            last_analysis_date=scan.vt_last_analysis_date,
            cached=True,
        )

    # Query VirusTotal.
    vt_result = lookup_file(scan.sha256)

    # Save results.
    update_scan_virustotal(
        db=db,
        scan=scan,
        vt_data=vt_result,
    )

    create_audit_log(
        db=db,
        event="VirusTotal Lookup",
        user_email=current_user.email,
        ip_address=request.client.host,
    )

    return VirusTotalResponse(
        **vt_result,
        cached=False,
    )