from app import db
from datetime import datetime, timezone


class Paciente(db.Model):
    __tablename__ = "paciente"

    id              = db.Column(db.Integer, primary_key=True)
    nome            = db.Column(db.String(120), nullable=False)
    telefone        = db.Column(db.String(20),  nullable=False, unique=True)
    data_nascimento = db.Column(db.Date)
    sexo            = db.Column(db.String(1))   # M | F | O
    peso            = db.Column(db.Float)
    altura          = db.Column(db.Float)
    comorbidades    = db.Column(db.JSON, default=list)
    created_at      = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                                onupdate=lambda: datetime.now(timezone.utc))
