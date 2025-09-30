import os
import hmac
import hashlib
from itsdangerous import URLSafeTimedSerializer
from werkzeug.security import generate_password_hash, check_password_hash

# Chaves sensíveis ficam no .env
SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
SECURITY_SALT = os.getenv("SECURITY_SALT", "default-salt")

# Serializer para tokens temporários
serializer = URLSafeTimedSerializer(SECRET_KEY)


# HMAC (validação de requisições do bot)
def generate_signature(message: str) -> str:

    return hmac.new(
        SECRET_KEY.encode(),
        msg=message.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()


def verify_signature(message: str, signature: str) -> bool:

    expected = generate_signature(message)
    return hmac.compare_digest(expected, signature)


# Tokens temporários
def generate_token(data: dict, expires_sec: int = 3600) -> str:

    return serializer.dumps(data, salt=SECURITY_SALT)


def verify_token(token: str, max_age: int = 3600) -> dict | None:

    try:
        return serializer.loads(token, salt=SECURITY_SALT, max_age=max_age)
    except Exception:
        return None


# Hash de senhas
def hash_password(password: str) -> str:
    return generate_password_hash(password)


def check_password(password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, password)
