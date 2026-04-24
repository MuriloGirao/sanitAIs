import { createContext, useState, useCallback, useEffect } from "react";
import { loginRequest, registerRequest } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("sanitais_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("sanitais_token") || null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = useCallback((tokenValue, userValue) => {
    localStorage.setItem("sanitais_token", tokenValue);
    localStorage.setItem("sanitais_user", JSON.stringify(userValue));
    setToken(tokenValue);
    setUser(userValue);
  }, []);

  const login = useCallback(async (email, senha) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginRequest(email, senha);
      persistSession(data.token, data.user);
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.error || "Erro ao fazer login.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async (nome, email, senha) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await registerRequest(nome, email, senha);
      persistSession(data.token, data.user);
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.error || "Erro ao criar conta.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem("sanitais_token");
    localStorage.removeItem("sanitais_user");
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, isAuthenticated, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
