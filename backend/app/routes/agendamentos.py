from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.agendamento import Agendamento

agendamentos_bp = Blueprint("agendamentos", __name__)


# ─── GET /api/horarios ───────────────────────────────────────────────────────
# Retorna todos os horários com dados do paciente e status do agendamento.
# O front usa essa rota para montar o calendário.
@agendamentos_bp.route("/horarios", methods=["GET"])
@jwt_required()
def get_horarios():
    from app.models.horario import Horario
    from app.models.paciente import Paciente

    horarios = Horario.query.order_by(Horario.data, Horario.time_start).all()

    resultado = []
    for h in horarios:
        agendamento = Agendamento.query.filter_by(id_horario=h.id).first()
        paciente = None
        if agendamento:
            paciente = Paciente.query.get(agendamento.id_paciente)

        resultado.append({
            "id_horario":    h.id,
            "data":          h.data.isoformat(),
            "hora":          h.time_start.strftime("%H:%M"),
            "hora_fim":      h.time_end.strftime("%H:%M"),
            "disponivel":    h.disponivel,
            "id_agendamento": agendamento.id if agendamento else None,
            "status":        agendamento.status if agendamento else None,
            "motivo":        agendamento.motivo if agendamento else None,
            "paciente":      paciente.nome if paciente else None,
            "telefone":      paciente.telefone if paciente else None,
            "idade":         agendamento.idade_snapshot if agendamento else None,
            "peso":          agendamento.peso_snapshot if agendamento else None,
            "altura":        agendamento.altura_snapshot if agendamento else None,
            "comorbidades":  agendamento.comorbidades_snapshot if agendamento else None,
        })

    return jsonify({"horarios": resultado}), 200


# ─── PATCH /api/agendamentos/<id>/status ────────────────────────────────────
# Atualiza o status de um agendamento: 'agendado', 'completo', 'cancelado', 'faltou'
@agendamentos_bp.route("/agendamentos/<int:id>/status", methods=["PATCH"])
@jwt_required()
def atualizar_status(id):
    agendamento = Agendamento.query.get_or_404(id)

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Corpo da requisição inválido."}), 400

    novo_status = data.get("status")
    STATUS_VALIDOS = {"agendado", "completo", "cancelado", "faltou"}

    if novo_status not in STATUS_VALIDOS:
        return jsonify({
            "error": f"Status inválido. Use: {', '.join(STATUS_VALIDOS)}"
        }), 422

    agendamento.status = novo_status
    db.session.commit()

    return jsonify({
        "message": "Status atualizado.",
        "id":      agendamento.id,
        "status":  agendamento.status,
    }), 200
