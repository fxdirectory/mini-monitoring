import jwt
from datetime import datetime, timedelta


def generate_token(username, secret_key, expire_hours=8):
    payload = {
        "username": username,
        "exp": datetime.utcnow() + timedelta(hours=expire_hours)
    }
    return jwt.encode(
        payload,
        secret_key,
        algorithm="HS256"
    )


def verify_token(token, secret_key):
    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=["HS256"]
        )
        return payload
    except Exception:
        return None