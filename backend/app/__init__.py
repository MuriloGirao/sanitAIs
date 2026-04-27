from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

from config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})

    from app.routes.auth import auth_bp
    from app.routes.horarios import horarios_bp

    app.register_blueprint(auth_bp,     url_prefix="/api/auth")
    app.register_blueprint(horarios_bp, url_prefix="/api/horarios")

    # Importa todos os models para o Migrate detectar
    from app.models.models import Usuario, Paciente, Horario, Agendamento, Sessao  # noqa: F401

    return app
