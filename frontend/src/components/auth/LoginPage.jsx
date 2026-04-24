import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { login, register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirma: "" });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    setLocalError("");
  }, [tab, clearError]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError("");
    clearError();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.senha) {
      setLocalError("Preencha email e senha.");
      return;
    }
    const result = await login(form.email, form.senha);
    if (result.ok) navigate("/dashboard", { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha || !form.confirma) {
      setLocalError("Preencha todos os campos.");
      return;
    }
    if (form.senha.length < 6) {
      setLocalError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (form.senha !== form.confirma) {
      setLocalError("As senhas não coincidem.");
      return;
    }
    const result = await register(form.nome, form.email, form.senha);
    if (result.ok) navigate("/dashboard", { replace: true });
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-500/8 blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 mb-5 shadow-lg shadow-brand-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">SanitAIs</h1>
          <p className="text-brand-300/70 text-sm mt-1 font-sans">Triagem Médica Inteligente</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8">
            {[
              { key: "login", label: "Entrar" },
              { key: "register", label: "Criar conta" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === key
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {displayError && (
            <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium">
              {displayError}
            </div>
          )}

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <Field
                label="E-mail"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              <Field
                label="Senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <div className="text-right">
                <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition">
                  Esqueceu a senha?
                </a>
              </div>
              <SubmitButton loading={loading} label="Entrar" />
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <Field
                label="Nome completo"
                name="nome"
                type="text"
                placeholder="Dr. João Silva"
                value={form.nome}
                onChange={handleChange}
                autoComplete="name"
              />
              <Field
                label="E-mail"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              <Field
                label="Senha"
                name="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <Field
                label="Confirmar senha"
                name="confirma"
                type="password"
                placeholder="••••••••"
                value={form.confirma}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <SubmitButton loading={loading} label="Criar conta" />
            </form>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6 font-sans">
          © {new Date().getFullYear()} SanitAIs · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Field({ label, name, type, placeholder, value, onChange, autoComplete }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20
                   focus:outline-none focus:border-brand-400 focus:bg-white/8 transition text-sm"
      />
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed
                 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/30
                 hover:shadow-brand-400/40 hover:-translate-y-0.5 active:translate-y-0 text-sm mt-2"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Aguarde...
        </span>
      ) : label}
    </button>
  );
}
