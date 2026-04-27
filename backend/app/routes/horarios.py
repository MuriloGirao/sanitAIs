from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.models import Horario, Agendamento, Usuario

horarios_bp = Blueprint("horarios", __name__)

STATUS_VALIDOS = {"agendado", "concluido", "cancelado", "faltou"}


# GET /api/horarios
@horarios_bp.route("", methods=["GET"])
@jwt_required()
def get_horarios():
    usuario_id = int(get_jwt_identity())
    data_filtro = request.args.get("data")

    query = Horario.query.filter_by(id_usuario=usuario_id)

    if data_filtro:
        try:
            data_obj = datetime.strptime(data_filtro, "%Y-%m-%d").date()
            query = query.filter_by(data=data_obj)
        except ValueError:
            return jsonify({"error": "Formato de data inválido. Use YYYY-MM-DD."}), 422

    horarios = query.order_by(Horario.data.asc(), Horario.time_start.asc()).all()
    return jsonify({"horarios": [h.to_dict() for h in horarios]}), 200


# PATCH /api/horarios/<id>/status
@horarios_bp.route("/<int:horario_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(horario_id):
    usuario_id = int(get_jwt_identity())

    data = request.get_json(silent=True)
    if not data or "status" not in data:
        return jsonify({"error": "Campo 'status' e obrigatorio."}), 422

    novo_status = data["status"]
    if novo_status not in STATUS_VALIDOS:
        return jsonify({"error": f"Status invalido. Use: {', '.join(STATUS_VALIDOS)}"}), 422

    horario = Horario.query.filter_by(id=horario_id, id_usuario=usuario_id).first()
    if not horario:
        return jsonify({"error": "Horario nao encontrado."}), 404

    agendamento = horario.agendamento
    if not agendamento:
        return jsonify({"error": "Horario sem paciente agendado."}), 400

    agendamento.status = novo_status
    db.session.commit()

    return jsonify({"message": "Status atualizado.", "id": horario_id, "status": novo_status}), 200
