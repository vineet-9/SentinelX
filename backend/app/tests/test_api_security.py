import hashlib
import uuid
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, hash_password
from app.database.dependencies import get_db
from app.database.session import SessionLocal
from app.main import app
from app.models.audit_log import AuditLog
from app.models.scan import Scan
from app.models.user import User


@pytest.fixture
def db():
    session = SessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def create_test_user(
    db,
    *,
    is_superuser: bool = False,
) -> User:
    unique_id = uuid.uuid4().hex

    user = User(
        username=f"test_{unique_id}",
        email=f"test_{unique_id}@example.com",
        hashed_password=hash_password("TestPassword123!"),
        is_active=True,
        is_superuser=is_superuser,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def create_test_scan(db, user: User) -> Scan:
    scan = Scan(
        user_id=user.id,
        filename="test-sample.exe",
        sha256=uuid.uuid4().hex + uuid.uuid4().hex,
        is_malicious=False,
        matched_rule=None,
        scan_status="COMPLETED",
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return scan


def auth_headers(user: User) -> dict[str, str]:
    token = create_access_token(str(user.id))

    return {
        "Authorization": f"Bearer {token}",
    }


def test_scan_history_requires_authentication(client):
    response = client.get("/scan/history")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_user_can_access_own_scan(client, db):
    user = create_test_user(db)
    scan = create_test_scan(db, user)

    response = client.get(
        f"/scan/{scan.id}",
        headers=auth_headers(user),
    )

    assert response.status_code == 200
    assert response.json()["id"] == str(scan.id)

    db.delete(scan)
    db.delete(user)
    db.commit()


def test_user_cannot_access_another_users_scan(client, db):
    user_a = create_test_user(db)
    user_b = create_test_user(db)

    scan_b = create_test_scan(db, user_b)

    response = client.get(
        f"/scan/{scan_b.id}",
        headers=auth_headers(user_a),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Scan not found"

    db.delete(scan_b)
    db.delete(user_a)
    db.delete(user_b)
    db.commit()


def test_normal_user_cannot_access_audit_logs(client, db):
    user = create_test_user(db, is_superuser=False)

    response = client.get(
        "/audit/logs",
        headers=auth_headers(user),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"

    audit_log = (
        db.query(AuditLog)
        .filter(
            AuditLog.event == "Unauthorized Admin Access",
            AuditLog.user_email == user.email,
        )
        .order_by(AuditLog.created_at.desc())
        .first()
    )

    if audit_log:
        db.delete(audit_log)

    db.delete(user)
    db.commit()


def test_admin_can_access_audit_logs(client, db):
    admin = create_test_user(db, is_superuser=True)

    response = client.get(
        "/audit/logs",
        headers=auth_headers(admin),
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)

    db.delete(admin)
    db.commit()


def test_duplicate_file_from_another_user_returns_conflict(client, db):
    user_a = create_test_user(db)
    user_b = create_test_user(db)

    file_content = b"SentinelX test sample"
    expected_sha256 = hashlib.sha256(file_content).hexdigest()

    try:
        with patch(
            "app.api.v1.endpoints.scan.analyze_file",
            return_value=(False, None),
        ):
            first_response = client.post(
                "/scan/upload",
                files={
                    "file": (
                        "sample.txt",
                        file_content,
                        "text/plain",
                    )
                },
                headers=auth_headers(user_a),
            )

            assert first_response.status_code == 200

            second_response = client.post(
                "/scan/upload",
                files={
                    "file": (
                        "sample.txt",
                        file_content,
                        "text/plain",
                    )
                },
                headers=auth_headers(user_b),
            )

        assert second_response.status_code == 409
        assert second_response.json()["detail"] == (
            "A scan for this file already exists."
        )

    finally:
        created_scan = (
            db.query(Scan)
            .filter(
                Scan.user_id == user_a.id,
                Scan.sha256 == expected_sha256,
            )
            .first()
        )

        if created_scan:
            db.delete(created_scan)

        upload_path = (
            Path("app/uploads")
            / f"{expected_sha256}.bin"
        )

        if upload_path.exists():
            upload_path.unlink()

        db.delete(user_a)
        db.delete(user_b)
        db.commit()


def test_unauthorized_admin_access_creates_audit_event(client, db):
    user = create_test_user(db, is_superuser=False)

    response = client.get(
        "/audit/logs",
        headers=auth_headers(user),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"

    audit_log = (
        db.query(AuditLog)
        .filter(
            AuditLog.event == "Unauthorized Admin Access",
            AuditLog.user_email == user.email,
        )
        .order_by(AuditLog.created_at.desc())
        .first()
    )

    assert audit_log is not None
    assert audit_log.user_email == user.email
    assert audit_log.ip_address == "testclient"

    db.delete(audit_log)
    db.delete(user)
    db.commit()


def test_empty_file_upload_is_rejected(client, db):
    user = create_test_user(db)

    try:
        response = client.post(
            "/scan/upload",
            files={
                "file": (
                    "empty.txt",
                    b"",
                    "text/plain",
                )
            },
            headers=auth_headers(user),
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Uploaded file is empty."

    finally:
        db.delete(user)
        db.commit()


def test_oversized_file_upload_is_rejected(client, db):
    user = create_test_user(db)

    try:
        oversized_content = b"A" * (10 * 1024 * 1024 + 1)

        response = client.post(
            "/scan/upload",
            files={
                "file": (
                    "oversized.bin",
                    oversized_content,
                    "application/octet-stream",
                )
            },
            headers=auth_headers(user),
        )

        assert response.status_code == 400
        assert (
            "maximum allowed size of 10 MB"
            in response.json()["detail"]
        )

    finally:
        db.delete(user)
        db.commit()


def test_upload_uses_sha256_storage_filename(client, db):
    user = create_test_user(db)

    file_content = b"SentinelX secure storage test"
    expected_sha256 = hashlib.sha256(file_content).hexdigest()

    try:
        with patch(
            "app.api.v1.endpoints.scan.analyze_file",
            return_value=(False, None),
        ):
            response = client.post(
                "/scan/upload",
                files={
                    "file": (
                        "original-name.txt",
                        file_content,
                        "text/plain",
                    )
                },
                headers=auth_headers(user),
            )

        assert response.status_code == 200

        stored_path = (
            Path("app/uploads")
            / f"{expected_sha256}.bin"
        )

        assert stored_path.exists()
        assert stored_path.read_bytes() == file_content

        scan = (
            db.query(Scan)
            .filter(
                Scan.user_id == user.id,
                Scan.sha256 == expected_sha256,
            )
            .first()
        )

        assert scan is not None
        assert scan.filename == "original-name.txt"

    finally:
        scan = (
            db.query(Scan)
            .filter(
                Scan.user_id == user.id,
                Scan.sha256 == expected_sha256,
            )
            .first()
        )

        if scan:
            db.delete(scan)

        stored_path = (
            Path("app/uploads")
            / f"{expected_sha256}.bin"
        )

        if stored_path.exists():
            stored_path.unlink()

        db.delete(user)
        db.commit()


def test_path_traversal_filename_is_sanitized(client, db):
    user = create_test_user(db)

    file_content = b"SentinelX filename security test"
    expected_sha256 = hashlib.sha256(file_content).hexdigest()

    try:
        with patch(
            "app.api.v1.endpoints.scan.analyze_file",
            return_value=(False, None),
        ):
            response = client.post(
                "/scan/upload",
                files={
                    "file": (
                        "..\\..\\malicious.txt",
                        file_content,
                        "text/plain",
                    )
                },
                headers=auth_headers(user),
            )

        assert response.status_code == 200

        scan = (
            db.query(Scan)
            .filter(
                Scan.user_id == user.id,
                Scan.sha256 == expected_sha256,
            )
            .first()
        )

        assert scan is not None
        assert scan.filename == "malicious.txt"

        stored_path = (
            Path("app/uploads")
            / f"{expected_sha256}.bin"
        )

        assert stored_path.exists()

        # The original traversal path must never become
        # the storage path.
        assert not Path("malicious.txt").exists()

    finally:
        scan = (
            db.query(Scan)
            .filter(
                Scan.user_id == user.id,
                Scan.sha256 == expected_sha256,
            )
            .first()
        )

        if scan:
            db.delete(scan)

        stored_path = (
            Path("app/uploads")
            / f"{expected_sha256}.bin"
        )

        if stored_path.exists():
            stored_path.unlink()

        db.delete(user)
        db.commit()