import requests
from unittest.mock import Mock, patch

import pytest

from app.services.scan_service import update_scan_virustotal
from app.services.virustotal import (
    VirusTotalResponseError,
    lookup_file,
)


def test_lookup_file_returns_not_found_for_404():
    response = Mock()
    response.status_code = 404

    with patch(
        "app.services.virustotal.requests.get",
        return_value=response,
    ):
        result = lookup_file("a" * 64)

    assert result == {
        "sha256": "a" * 64,
        "found": False,
        "malicious": 0,
        "suspicious": 0,
        "harmless": 0,
        "undetected": 0,
        "reputation": 0,
        "last_analysis_date": None,
    }


def test_lookup_file_returns_not_found_for_request_failure():
    with patch(
        "app.services.virustotal.requests.get",
        side_effect=requests.RequestException("network failure"),
    ):
        result = lookup_file("a" * 64)

    assert result["sha256"] == "a" * 64
    assert result["found"] is False


def test_lookup_file_rejects_malformed_success_response():
    response = Mock()
    response.status_code = 200
    response.raise_for_status.return_value = None
    response.json.return_value = {"data": {}}

    with patch(
        "app.services.virustotal.requests.get",
        return_value=response,
    ):
        with pytest.raises(VirusTotalResponseError):
            lookup_file("a" * 64)

def test_update_scan_virustotal_preserves_not_found_state():
    scan = Mock()
    db = Mock()

    result = update_scan_virustotal(
        db=db,
        scan=scan,
        vt_data={
            "sha256": "a" * 64,
            "found": False,
            "malicious": 0,
            "suspicious": 0,
            "harmless": 0,
            "undetected": 0,
            "reputation": 0,
            "last_analysis_date": None,
        },
    )

    assert result is scan
    assert scan.vt_found is False
    assert scan.vt_malicious == 0
    assert scan.vt_suspicious == 0
    assert scan.vt_harmless == 0
    assert scan.vt_undetected == 0
    assert scan.vt_reputation == 0
    assert scan.vt_last_analysis_date is None

    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(scan)