from fastapi import FastAPI
from utils.database import get_connection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS (para permitir seu front acessar a API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_all_horarios():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            id,
            data,
            hora,
            disponivel,
            paciente,
            idade,
            altura,
            peso,
            telefone
        FROM horarios_disponiveis
        ORDER BY data, hora;
    """)

    rows = cur.fetchall()

    horarios = []
    for r in rows:
        horarios.append({
            "id": r["id"],
            "data": r["data"].isoformat(),
            "hora": str(r["hora"]),
            "disponivel": r["disponivel"],
            "paciente": r["paciente"],
            "idade": r["idade"],
            "altura": r["altura"],
            "peso": r["peso"],
            "telefone": r["telefone"]
        })

    cur.close()
    conn.close()

    return horarios


@app.get("/horarios")
def listar_horarios():
    return {"horarios": get_all_horarios()}
