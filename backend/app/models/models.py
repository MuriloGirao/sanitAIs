from app import db
from datetime import datetime, timezone


# ─── Usuario ──────────────────────────────────────────────────────────────────

class Usuario(db.Model):
    __tablename__ = "usuario"

    id            = db.Column(db.Integer, primary_key=True)
    nome          = db.Column(db.String(120), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at    = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at    = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    horarios = db.relationship("Horario", backref="usuario", lazy=True)

    def to_dict(self):
        return {
            "id":         self.id,
            "nome":       self.nome,
            "email":      self.email,
            "created_at": self.created_at.isoformat(),
        }


# ─── Paciente ─────────────────────────────────────────────────────────────────

class Paciente(db.Model):
    __tablename__ = "paciente"

    id              = db.Column(db.Integer, primary_key=True)
    nome            = db.Column(db.String(120), nullable=False)
    telefone        = db.Column(db.String(20), unique=True, nullable=False, index=True)
    data_nascimento = db.Column(db.Date, nullable=True)
    sexo            = db.Column(db.String(1), nullable=True)
    peso            = db.Column(db.Float, nullable=True)
    altura          = db.Column(db.Float, nullable=True)
    comorbidades    = db.Column(db.JSON, default=list)
    created_at      = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    agendamentos = db.relationship("Agendamento", backref="paciente", lazy=True)

    def calcular_idade(self):
        if not self.data_nascimento:
            return None
        hoje = datetime.now().date()
        nascimento = self.data_nascimento
        return hoje.year - nascimento.year - (
            (hoje.month, hoje.day) < (nascimento.month, nascimento.day)
        )

    def to_dict(self):
        return {
            "id":              self.id,
            "nome":            self.nome,
            "telefone":        self.telefone,
            "data_nascimento": self.data_nascimento.isoformat() if self.data_nascimento else None,
            "idade":           self.calcular_idade(),
            "sexo":            self.sexo,
            "peso":            self.peso,
            "altura":          self.altura,
            "comorbidades":    self.comorbidades or [],
        }


# ─── Horario ──────────────────────────────────────────────────────────────────

class Horario(db.Model):
    __tablename__ = "horario"

    id           = db.Column(db.Integer, primary_key=True)
    id_usuario   = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False, index=True)
    data         = db.Column(db.Date, nullable=False, index=True)
    time_start   = db.Column(db.Time, nullable=False)
    time_end     = db.Column(db.Time, nullable=False)
    disponivel   = db.Column(db.Boolean, default=True, nullable=False)
    created_at   = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    agendamento = db.relationship("Agendamento", backref="horario", lazy=True, uselist=False)

    def to_dict(self):
        ag = self.agendamento
        paciente = ag.paciente if ag else None

        # Monta comorbidades como string para o front
        comorbidades = ""
        if paciente and paciente.comorbidades:
            c = paciente.comorbidades
            if isinstance(c, list):
                comorbidades = ", ".join(c) if c else "Nenhuma"
            else:
                comorbidades = str(c)

        return {
            "id":           self.id,
            "data":         self.data.isoformat(),
            "hora":         self.time_start.strftime("%H:%M"),
            "hora_fim":     self.time_end.strftime("%H:%M"),
            "disponivel":   self.disponivel,
            "paciente":     paciente.nome if paciente else None,
            "telefone":     paciente.telefone if paciente else None,
            "idade":        paciente.calcular_idade() if paciente else None,
            "peso":         paciente.peso if paciente else None,
            "altura":       paciente.altura if paciente else None,
            "comorbidades": comorbidades or "Nenhuma",
            "detalhes":     ag.motivo if ag else None,
            "status":       ag.status if ag else ("disponivel" if self.disponivel else "bloqueado"),
        }


# ─── Agendamento ──────────────────────────────────────────────────────────────

class Agendamento(db.Model):
    __tablename__ = "agendamento"

    id          = db.Column(db.Integer, primary_key=True)
    id_paciente = db.Column(db.Integer, db.ForeignKey("paciente.id"), nullable=False, index=True)
    id_horario  = db.Column(db.Integer, db.ForeignKey("horario.id"), nullable=False, unique=True)
    status      = db.Column(db.String(20), nullable=False, default="agendado")
    motivo      = db.Column(db.String(500), nullable=True)
    created_at  = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at  = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id":         self.id,
            "id_paciente": self.id_paciente,
            "id_horario":  self.id_horario,
            "status":      self.status,
            "motivo":      self.motivo,
            "created_at":  self.created_at.isoformat(),
            "updated_at":  self.updated_at.isoformat(),
        }


# ─── Sessao ───────────────────────────────────────────────────────────────────

class Sessao(db.Model):
    __tablename__ = "sessoes"

    id           = db.Column(db.Integer, primary_key=True)
    id_paciente  = db.Column(db.Integer, db.ForeignKey("paciente.id"), nullable=False, index=True)
    contexto     = db.Column(db.JSON, default=dict)
    last_message = db.Column(db.String(500), nullable=True)
    created_at   = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at   = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
