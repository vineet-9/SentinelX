from pathlib import Path

from app.rules.signatures import (
    SUSPICIOUS_EXTENSIONS,
    SUSPICIOUS_KEYWORDS,
)


def analyze_file(file_path: str) -> tuple[bool, str | None]:
    path = Path(file_path)

    # Rule 1
    if path.suffix.lower() in SUSPICIOUS_EXTENSIONS:
        return True, "Suspicious Extension"

    # Rule 2
    data = path.read_bytes()

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword.lower() in data.lower():
            return True, keyword.decode(errors="ignore")

    return False, None