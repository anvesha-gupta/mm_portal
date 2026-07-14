from __future__ import annotations

import json
import os
import urllib.request
from typing import Any

import jwt
from jwt.algorithms import RSAAlgorithm

TENANT_ID = os.getenv("AZURE_TENANT_ID", "")
CLIENT_ID = os.getenv("AZURE_CLIENT_ID", "")

_JWKS_URL = (
    f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
)
_ISSUER = f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"


def _fetch_jwks() -> dict:
    with urllib.request.urlopen(_JWKS_URL, timeout=5) as resp:
        return json.loads(resp.read())


def validate_azure_id_token(token: str) -> dict[str, Any]:
    """
    Validate an Azure AD ID token (RS256).
    Fetches the tenant JWKS, verifies signature + audience + issuer,
    and returns the decoded claims dict.
    Raises jwt.PyJWTError or ValueError on any failure.
    """
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")

    jwks = _fetch_jwks()
    matching_key = next(
        (k for k in jwks.get("keys", []) if k.get("kid") == kid),
        None,
    )
    if not matching_key:
        raise ValueError(f"No JWKS key found for kid={kid!r}")

    public_key = RSAAlgorithm.from_jwk(json.dumps(matching_key))

    claims = jwt.decode(
        token,
        public_key,
        algorithms=["RS256"],
        audience=CLIENT_ID,
        issuer=_ISSUER,
        options={"verify_exp": True},
    )
    return claims
