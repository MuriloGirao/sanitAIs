from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models.models import Usuario

auth_bp = Blueprint("auth", __name__)


# ─── POST /api/auth/register ──────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Corpo da requisição inválido."}), 400

    nome  = (data.get("nome")  or "").strip()
    email = (data.get("email") or "").strip().lower()
    senha = data.get("senha")  or ""

    if not nome or not email or not senha:
        return jsonify({"error": "nome, email e senha são obrigatórios."}), 422
    if len(senha) < 6:
        return jsonify({"error": "A senha deve ter no mínimo 6 caracteres."}), 422
    if Usuario.query.filter_by(email=email).first():
        return jsonify({"error": "E-mail já cadastrado."}), 409

    password_hash = bcrypt.generate_password_hash(senha).decode("utf-8")
    usuario = Usuario(nome=nome, email=email, password_hash=password_hash)
    db.session.add(usuario)
    db.session.commit()

    token = create_access_token(identity=str(usuario.id))
    return jsonify({"message": "Usuário criado com sucesso.", "token": token, "user": usuario.to_dict()}), 201


# ─── POST /api/auth/login ─────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Corpo da requisição inválido."}), 400

    email = (data.get("email") or "").strip().lower()
    senha = data.get("senha")  or ""

    if not email or not senha:
        return jsonify({"error": "email e senha são obrigatórios."}), 422

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or not bcrypt.check_password_hash(usuario.password_hash, senha):
        return jsonify({"error": "Credenciais inválidas."}), 401

    token = create_access_token(identity=str(usuario.id))
    return jsonify({"message": "Login realizado com sucesso.", "token": token, "user": usuario.to_dict()}), 200


# ─── GET /api/auth/me ─────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    usuario_id = int(get_jwt_identity())
    usuario = db.session.get(Usuario, usuario_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado."}), 404
    return jsonify({"user": usuario.to_dict()}), 200
