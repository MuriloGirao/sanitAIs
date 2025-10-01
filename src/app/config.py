from __future__ import annotations
import os
from typing import Type
from dotenv import load_dotenv
load_dotenv()

class BaseConfig:
    ENV = os.getenv("FLASK_ENV", "production")
    DEBUG = os.getenv("DEBUG", "False").lower() in ("1", "true", "yes")
    TESTING = False

    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    SECURITY_SALT = os.getenv("SECURITY_SALT", "change-salt")

    TIMEZONE = os.getenv("TIMEZONE", "America/Fortaleza")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/mydb"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "False").lower() in ("1", "true", "yes")

    # tuning de conexão
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": int(os.getenv("DB_POOL_SIZE", 10)),
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", 20)),
        "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", 30)),
    }

    BOT_SECRET_KEY = os.getenv("BOT_SECRET_KEY", "")
    BOT_REQUEST_SIGNATURE_HEADER = os.getenv("BOT_REQUEST_SIGNATURE_HEADER", "X-Bot-Signature")

    JWT_SECRET = os.getenv("JWT_SECRET", SECRET_KEY)
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXP_SECONDS = int(os.getenv("JWT_EXP_SECONDS", 3600))

    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", None)
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", None)

    # observability
    SENTRY_DSN = os.getenv("SENTRY_DSN", None)
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    # regras de negócio/config operacionais
    PAGINATION_DEFAULT = int(os.getenv("PAGINATION_DEFAULT", 20))
    MAX_TRIAGE_AGE_DAYS = int(os.getenv("MAX_TRIAGE_AGE_DAYS", 30))  # ex.: não aceitar triagens muito antigas

    BASE_API_PREFIX = os.getenv("BASE_API_PREFIX", "/api/v1")


class DevConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_ECHO = True
    ENV = "development"


class TestConfig(BaseConfig):
    TESTING = True
    ENV = "testing"
    # em testes, usar sqlite in-memory por padrão (ou use TEST_DATABASE_URL se definido)
    SQLALCHEMY_DATABASE_URI = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")
    SQLALCHEMY_ECHO = False
    # evitar CSRF em testes se estiver usando Flask-WTF
    WTF_CSRF_ENABLED = False


class ProdConfig(BaseConfig):
    DEBUG = False
    ENV = "production"
    # em produção, normalmente não queremos inserir defaults inseguros:
    SECRET_KEY = os.getenv("SECRET_KEY")  # deve estar setado no ambiente


# mapeamento útil
_CONFIG_MAP = {
    "development": DevConfig,
    "dev": DevConfig,
    "testing": TestConfig,
    "test": TestConfig,
    "production": ProdConfig,
    "prod": ProdConfig,
}


def get_config(env_name: str | None = None) -> Type[BaseConfig]:
    """
    Retorna a classe de configuração para o nome de ambiente.
    Se env_name for None, usa FLASK_ENV ou 'production' como fallback.
    """
    name = env_name or os.getenv("FLASK_ENV", "production")
    return _CONFIG_MAP.get(name.lower(), ProdConfig)
