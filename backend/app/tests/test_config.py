import pytest
from pydantic import ValidationError

from app.core.config import Settings


def valid_settings() -> dict[str, object]:
    return {
        "app_name": "SentinelX",
        "database_url": "postgresql://user:password@localhost:5432/sentinelx",
        "debug": False,
        "secret_key": "a" * 32,
        "algorithm": "HS256",
        "access_token_expire_minutes": 30,
        "VT_API_KEY": "test-api-key",
        "max_upload_size_mb": 10,
    }


def test_settings_accept_valid_configuration():
    settings = Settings(**valid_settings())

    assert settings.app_name == "SentinelX"
    assert settings.algorithm == "HS256"
    assert settings.access_token_expire_minutes == 30
    assert settings.max_upload_size_mb == 10


@pytest.mark.parametrize(
    "field, value",
    [
        ("secret_key", "a" * 31),
        ("access_token_expire_minutes", 4),
        ("access_token_expire_minutes", 1441),
        ("max_upload_size_mb", 0),
        ("max_upload_size_mb", 101),
    ],
)
def test_settings_reject_invalid_values(field, value):
    values = valid_settings()
    values[field] = value

    with pytest.raises(ValidationError):
        Settings(**values)


def test_settings_rejects_unsupported_algorithm():
    values = valid_settings()
    values["algorithm"] = "HS384"

    with pytest.raises(ValidationError):
        Settings(**values)