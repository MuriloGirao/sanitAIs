import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sanitais_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sanitais_token");
      localStorage.removeItem("sanitais_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const loginRequest        = (email, senha)        => api.post("/auth/login",    { email, senha });
export const registerRequest     = (nome, email, senha)  => api.post("/auth/register", { nome, email, senha });
export const getMeRequest        = ()                    => api.get("/auth/me");
export const getHorariosRequest  = ()                    => api.get("/horarios");
export const updateStatusRequest = (id, status)          => api.patch(`/horarios/${id}/status`, { status });

export default api;
