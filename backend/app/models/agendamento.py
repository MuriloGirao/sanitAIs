from app import db
from datetime import datetime, timezone


class Agendamento(db.Model):
    __tablename__ = "agendamento"

    id           = db.Column(db.Integer, primary_key=True)
    id_paciente  = db.Column(db.Integer, db.ForeignKey("paciente.id"), nullable=False)
    id_horario   = db.Column(db.Integer, db.ForeignKey("horario.id"),  nullable=False, unique=True)

    # ENUM no banco: agendado | completo | cancelado | faltou
    status       = db.Column(db.String(20), nullable=False, default="agendado")
    motivo       = db.Column(db.String(500))

    # Snapshots dos dados clínicos no momento do agendamento
    # (evita perda de histórico se o paciente atualizar os dados depois)
    idade_snapshot        = db.Column(db.Integer)
    peso_snapshot         = db.Column(db.Float)
    altura_snapshot       = db.Column(db.Float)
    comorbidades_snapshot = db.Column(db.JSON)

    created_at   = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at   = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                             onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id":          self.id,
            "id_paciente": self.id_paciente,
            "id_horario":  self.id_horario,
            "status":      self.status,
            "motivo":      self.motivo,
            "created_at":  self.created_at.isoformat(),
            "updated_at":  self.updated_at.isoformat(),
        }
