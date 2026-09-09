from pathlib import Path

import yara

RULES_PATH = Path("app/rules/malware.yar")

# Compile once when this module is imported
rules = yara.compile(filepath=str(RULES_PATH))


def scan_file(file_path: str) -> tuple[bool, str | None]:
    """
    Scan a file using the compiled YARA rules.

    Returns:
        (is_malicious, matched_rule)
    """
    matches = rules.match(file_path)

    if matches:
        return True, matches[0].rule

    return False, None