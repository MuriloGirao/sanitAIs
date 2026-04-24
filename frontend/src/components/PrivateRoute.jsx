import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Protege rotas que exigem autenticação.
 * Se não autenticado, redireciona para a raiz (login).
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
