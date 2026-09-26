from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = Field(min_length=1, max_length=100)
    database_url: str = Field(min_length=1)

    debug: bool = False

    secret_key: str = Field(min_length=32)
    algorithm: Literal["HS256"] = "HS256"

    access_token_expire_minutes: int = Field(
        default=30,
        ge=5,
        le=1440,
    )

    vt_api_key: str = Field(
        alias="VT_API_KEY",
        min_length=1,
    )

    max_upload_size_mb: int = Field(
        default=10,
        ge=1,
        le=100,
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()