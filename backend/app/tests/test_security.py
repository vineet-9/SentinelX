from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    password = "SentinelX123!"

    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)


def test_create_access_token():
    token = create_access_token("vineet")

    payload = decode_access_token(token)

    assert payload["sub"] == "vineet"