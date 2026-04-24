# SanitAIs — Estrutura do Projeto

```
sanitais/
│
├── ESTRUTURA.md               ← este arquivo
│
├── backend/                   ← API Flask (Python)
│   ├── run.py                 ← entrypoint: inicia o servidor Flask
│   ├── config.py              ← configurações (env vars, JWT secret, DB URL)
│   ├── requirements.txt       ← dependências Python
│   ├── .env                   ← variáveis de ambiente (NÃO versionar)
│   ├── .env.example           ← template do .env (versionar)
│   │
│   ├── migrations/            ← migrações do banco (Flask-Migrate / Alembic)
│   │   └── ...
│   │
│   └── app/
│       ├── __init__.py        ← factory function create_app()
│       │
│       ├── models/
│       │   ├── __init__.py
│       │   └── user.py        ← modelo User (email, password_hash, nome, crm...)
│       │
│       ├── routes/
│       │   ├── __init__.py
│       │   └── auth.py        ← rotas: POST /auth/register, POST /auth/login
│       │
│       └── middleware/
│           ├── __init__.py
│           └── jwt_guard.py   ← decorator @jwt_required para rotas protegidas
│
└── frontend/                  ← App React + Vite
    ├── index.html
    ├── vite.config.js         ← proxy para /api → localhost:5000
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    │
    └── src/
        ├── main.jsx           ← entrypoint React
        ├── App.jsx            ← roteamento (React Router): / e /dashboard
        │
        ├── contexts/
        │   └── AuthContext.jsx ← contexto global: token JWT, user, login(), logout()
        │
        ├── services/
        │   └── api.js         ← funções: loginRequest(), registerRequest()
        │                         axios com interceptor para injetar Bearer token
        │
        ├── hooks/
        │   └── useAuth.js     ← hook que consome AuthContext
        │
        └── components/
            ├── auth/
            │   └── LoginPage.jsx    ← tela de login/register
            │
            └── dashboard/
                └── Dashboard.jsx   ← calendário + agendamentos (sua tela atual)
```

## Fluxo de Autenticação

1. Usuário acessa `/` → renderiza `LoginPage`
2. Envia email+senha para `POST /auth/login`
3. Flask valida, retorna `{ token, user }`
4. Front salva token no `AuthContext` (+ localStorage)
5. React Router redireciona para `/dashboard`
6. Todas as chamadas a `/horarios` incluem `Authorization: Bearer <token>`
7. Flask-JWT verifica o token em rotas protegidas via `@jwt_required`

## Variáveis de Ambiente (.env)

```env
# Backend
FLASK_ENV=development
SECRET_KEY=troque-por-chave-forte
JWT_SECRET_KEY=outra-chave-forte-aqui
DATABASE_URL=postgresql://usuario:senha@localhost:5432/sanitais

# Frontend (Vite)
VITE_API_URL=http://localhost:5000
```

## Como rodar localmente

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
python run.py

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```
