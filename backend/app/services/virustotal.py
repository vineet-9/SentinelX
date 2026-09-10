import requests

from app.core.config import settings


BASE_URL = "https://www.virustotal.com/api/v3/files"


def lookup_file(sha256: str) -> dict | None:
    """
    Query VirusTotal using a file SHA-256 hash.

    Returns None if the hash is unknown or an error occurs.
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
            return None

        response.raise_for_status()

        data = response.json()["data"]["attributes"]

        stats = data["last_analysis_stats"]

        return {
            "found": True,
            "malicious": stats.get("malicious", 0),
            "suspicious": stats.get("suspicious", 0),
            "harmless": stats.get("harmless", 0),
            "undetected": stats.get("undetected", 0),
            "reputation": data.get("reputation", 0),
            "last_analysis_date": data.get("last_analysis_date"),
        }

    except requests.RequestException:
        return None