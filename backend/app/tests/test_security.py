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


def test_wrong_password_fails():
    password = "SentinelX123!"
    wrong_password = "WrongPassword123!"

    hashed = hash_password(password)

    assert not verify_password(wrong_password, hashed)


def test_create_access_token():
    token = create_access_token("vineet")

    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == "vineet"


def test_invalid_access_token_returns_none():
    payload = decode_access_token("this-is-not-a-valid-token")

    assert payload is None


def test_access_token_contains_subject():
    user_id = "2bd63f5a-a32b-45f8-afe1-7926ceba56f4"

    token = create_access_token(user_id)
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == user_id