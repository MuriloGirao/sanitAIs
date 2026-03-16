import os
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt

from utils.database import get_connection
from seguranca import hash_password, check_password

# ── JWT ────────────────────────────────────────────────────────────
SECRET_KEY        = os.getenv("SECRET_KEY", "changeme")
ALGORITHM         = "HS256"
TOKEN_EXP_MINUTES = 60 * 8  # 8 horas

# ── App ────────────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ────────────────────────────────────────────────────────
class RegisterBody(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    data_nascimento: str
    classe: str = "aluno"   # 'aluno' | 'admin'

class LoginBody(BaseModel):
    email: EmailStr
    password: str           # front manda "password", não "senha"

# ── Helpers JWT ────────────────────────────────────────────────────
def criar_token(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_EXP_MINUTES)
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def decodificar_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("sub"):
            raise ValueError
        return payload
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

def get_token_from_request(request: Request) -> str:
    """Lê o Bearer token do header Authorization."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não fornecido")
    return auth.split(" ", 1)[1]

# ── Helpers de banco ───────────────────────────────────────────────
def buscar_usuario_por_email(email: str):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT id, nome, email, senha_hash, classe FROM usuarios WHERE email = %s",
        (email,)
    )
    row = cur.fetchone()
    cur.close(); conn.close()
    return row

def buscar_usuario_por_id(user_id: str):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT id, nome, email, classe FROM usuarios WHERE id = %s",
        (user_id,)
    )
    row = cur.fetchone()
    cur.close(); conn.close()
    return row

def inserir_usuario(nome: str, email: str, senha_hash: str,
                    data_nascimento: str, classe: str) -> int:
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO usuarios (nome, email, senha_hash, data_nascimento, classe)
               VALUES (%s, %s, %s, %s, %s) RETURNING id""",
            (nome, email, senha_hash, data_nascimento, classe),
        )
        user_id = cur.fetchone()["id"]
        conn.commit()
        return user_id
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()

# ── /api/register/registeruser ─────────────────────────────────────
@app.post("/api/register/registeruser", status_code=201)
def registrar(body: RegisterBody):
    if buscar_usuario_por_email(body.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    senha_hash = hash_password(body.senha)
    user_id    = inserir_usuario(
        body.nome, body.email, senha_hash,
        body.data_nascimento, body.classe
    )
    return {"message": "Usuário registrado com sucesso", "id": user_id}


# ── /api/login/login ───────────────────────────────────────────────
@app.post("/api/login/login")
def login(body: LoginBody):
    usuario = buscar_usuario_por_email(body.email)

    if not usuario or not check_password(body.password, usuario["senha_hash"]):
        raise HTTPException(status_code=400, detail="E-mail ou senha incorretos")

    token = criar_token({
        "sub":    str(usuario["id"]),
        "email":  usuario["email"],
        "classe": usuario["classe"],
    })
    return {"access_token": token, "token_type": "bearer"}


# ── /api/me/me ─────────────────────────────────────────────────────
@app.get("/api/me/me")
def me(request: Request):
    token   = get_token_from_request(request)
    payload = decodificar_token(token)
    usuario = buscar_usuario_por_id(payload["sub"])

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return {
        "id":     usuario["id"],
        "nome":   usuario["nome"],
        "email":  usuario["email"],
        "classe": usuario["classe"],  # front usa para redirecionar admin/aluno
    }


# ── /horarios (rota existente) ─────────────────────────────────────
def get_all_horarios():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        SELECT id, data, hora, disponivel, paciente, idade, altura, peso, telefone
        FROM horarios_disponiveis
        ORDER BY data, hora;
    """)
    horarios = [
        {
            "id":         r["id"],
            "data":       r["data"].isoformat(),
            "hora":       str(r["hora"]),
            "disponivel": r["disponivel"],
            "paciente":   r["paciente"],
            "idade":      r["idade"],
            "altura":     r["altura"],
            "peso":       r["peso"],
            "telefone":   r["telefone"],
        }
        for r in cur.fetchall()
    ]
    cur.close(); conn.close()
    return horarios

@app.get("/horarios")
def listar_horarios():
    return {"horarios": get_all_horarios()}
