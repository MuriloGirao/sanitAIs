from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User


def jwt_required_custom(fn):
    """
    Decorator que protege rotas verificando o JWT e
    injetando o usuário atual no contexto da função.

    Uso:
        @app.route("/rota-protegida")
        @jwt_required_custom
        def rota(current_user):
            return jsonify(current_user.to_dict())
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())
            current_user = User.query.get(user_id)

            if not current_user or not current_user.is_active:
                return jsonify({"error": "Usuário não encontrado ou inativo."}), 401

            return fn(current_user, *args, **kwargs)

        except Exception as e:
            return jsonify({"error": "Token inválido ou expirado.", "detail": str(e)}), 401

    return wrapper
