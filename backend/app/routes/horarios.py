from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

horarios_bp = Blueprint("horarios", __name__)

# ─── Dados mock — substituir por queries reais após integração com BD ─────────
MOCK_HORARIOS = [
    {
        "id": 1,
        "data": "2026-04-24",
        "hora": "08:00",
        "paciente": "Maria Silva",
        "idade": 45,
        "peso": 68.0,
        "altura": 1.65,
        "comorbidades": "Hipertensão",
        "detalhes": "Consulta de rotina",
        "telefone": "(85) 98765-4321",
        "status": "agendado",
    },
    {
        "id": 2,
        "data": "2026-04-24",
        "hora": "09:00",
        "paciente": "João Santos",
        "idade": 32,
        "peso": 82.0,
        "altura": 1.78,
        "comorbidades": "Nenhuma",
        "detalhes": "Dor nas costas há 3 dias",
        "telefone": "(85) 91234-5678",
        "status": "agendado",
    },
    {
        "id": 3,
        "data": "2026-04-24",
        "hora": "10:00",
        "paciente": None,
        "status": "disponivel",
    },
    {
        "id": 4,
        "data": "2026-04-24",
        "hora": "11:00",
        "paciente": "Ana Costa",
        "idade": 28,
        "peso": 55.0,
        "altura": 1.60,
        "comorbidades": "Asma",
        "detalhes": "Renovação de receita",
        "telefone": "(85) 99876-5432",
        "status": "agendado",
    },
    {
        "id": 5,
        "data": "2026-04-24",
        "hora": "14:00",
        "paciente": None,
        "status": "disponivel",
    },
    {
        "id": 6,
        "data": "2026-04-24",
        "hora": "15:00",
        "paciente": "Pedro Oliveira",
        "idade": 58,
        "peso": 90.0,
        "altura": 1.75,
        "comorbidades": "Diabetes tipo 2",
        "detalhes": "Acompanhamento mensal",
        "telefone": "(85) 98321-7654",
        "status": "agendado",
    },
    {
        "id": 7,
        "data": "2026-04-25",
        "hora": "08:00",
        "paciente": "Carlos Lima",
        "idade": 41,
        "peso": 75.0,
        "altura": 1.70,
        "comorbidades": "Nenhuma",
        "detalhes": "Check-up anual",
        "telefone": "(85) 97654-3210",
        "status": "agendado",
    },
    {
        "id": 8,
        "data": "2026-04-25",
        "hora": "09:00",
        "paciente": None,
        "status": "disponivel",
    },
    {
        "id": 9,
        "data": "2026-04-26",
        "hora": "08:00",
        "paciente": "Lucia Ferreira",
        "idade": 35,
        "peso": 62.0,
        "altura": 1.58,
        "comorbidades": "Nenhuma",
        "detalhes": "Consulta pré-natal",
        "telefone": "(85) 96543-2109",
        "status": "agendado",
    },
    {
        "id": 10,
        "data": "2026-04-26",
        "hora": "09:00",
        "paciente": "Roberto Alves",
        "idade": 52,
        "peso": 88.0,
        "altura": 1.82,
        "comorbidades": "Hipertensão, Colesterol alto",
        "detalhes": "Revisão de medicamentos",
        "telefone": "(85) 95432-1098",
        "status": "agendado",
    },
]

# Simula persistência em memória durante a sessão do servidor
_status_overrides = {}

STATUS_VALIDOS = {"agendado", "concluido", "cancelado", "faltou"}


# ─── GET /api/horarios ────────────────────────────────────────────────────────
@horarios_bp.route("", methods=["GET"])
@jwt_required()
def get_horarios():
    horarios = []
    for h in MOCK_HORARIOS:
        item = dict(h)
        # Aplica override de status se houver
        if item["id"] in _status_overrides:
            item["status"] = _status_overrides[item["id"]]
        horarios.append(item)

    return jsonify({"horarios": horarios}), 200


# ─── PATCH /api/horarios/<id>/status ─────────────────────────────────────────
@horarios_bp.route("/<int:horario_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(horario_id):
    data = request.get_json(silent=True)

    if not data or "status" not in data:
        return jsonify({"error": "Campo 'status' é obrigatório."}), 422

    novo_status = data["status"]

    if novo_status not in STATUS_VALIDOS:
        return jsonify({
            "error": f"Status inválido. Use: {', '.join(STATUS_VALIDOS)}"
        }), 422

    horario = next((h for h in MOCK_HORARIOS if h["id"] == horario_id), None)

    if not horario:
        return jsonify({"error": "Horário não encontrado."}), 404

    if not horario.get("paciente"):
        return jsonify({"error": "Horário sem paciente agendado."}), 400

    _status_overrides[horario_id] = novo_status

    return jsonify({
        "message": "Status atualizado com sucesso.",
        "id": horario_id,
        "status": novo_status,
    }), 200
