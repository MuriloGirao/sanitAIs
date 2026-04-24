from app import db
from datetime import datetime, timezone


class Horario(db.Model):
    __tablename__ = "horario"

    id            = db.Column(db.Integer, primary_key=True)
    id_usuario    = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    data          = db.Column(db.Date,    nullable=False)
    time_start    = db.Column(db.Time,    nullable=False)
    time_end      = db.Column(db.Time,    nullable=False)
    disponivel    = db.Column(db.Boolean, nullable=False, default=True)
    created_at    = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
