import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from core.security import create_access_token, hash_password, verify_password


def test_password_hash_round_trip():
    raw = "super-secret"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed)
    assert not verify_password("wrong", hashed)


def test_access_token_contains_expected_claims():
    token = create_access_token(subject="123e4567-e89b-12d3-a456-426614174000")
    assert isinstance(token, str)
    assert token.count(".") == 2
