import requests

from app.core.config import settings


BASE_URL = "https://www.virustotal.com/api/v3/files"


def lookup_file(sha256: str) -> dict:
    """
    Query VirusTotal by SHA-256 hash.

    Returns a normalized dictionary regardless of whether the file
    exists in VirusTotal.
    """

    headers = {
        "x-apikey": settings.vt_api_key,
    }

    try:
        response = requests.get(
            f"{BASE_URL}/{sha256}",
            headers=headers,
            timeout=15,
        )

        if response.status_code == 404:
            return {
                "sha256": sha256,
                "found": False,
                "malicious": 0,
                "suspicious": 0,
                "harmless": 0,
                "undetected": 0,
                "reputation": 0,
                "last_analysis_date": None,
            }

        response.raise_for_status()

        attributes = response.json()["data"]["attributes"]

        stats = attributes["last_analysis_stats"]

        return {
            "sha256": sha256,
            "found": True,
            "malicious": stats.get("malicious", 0),
            "suspicious": stats.get("suspicious", 0),
            "harmless": stats.get("harmless", 0),
            "undetected": stats.get("undetected", 0),
            "reputation": attributes.get("reputation", 0),
            "last_analysis_date": attributes.get("last_analysis_date"),
        }

    except requests.RequestException:
        return {
            "sha256": sha256,
            "found": False,
            "malicious": 0,
            "suspicious": 0,
            "harmless": 0,
            "undetected": 0,
            "reputation": 0,
            "last_analysis_date": None,
        }