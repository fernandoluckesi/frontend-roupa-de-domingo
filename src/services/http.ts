import axios, { AxiosError } from "axios";

const TOKEN_KEY = "rd:token";
const SESSION_KEY = "rd:sessionId";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Id estável da sessão anônima: permite carrinho e troféus sem cadastro. */
export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["x-session-id"] = getSessionId();
  return config;
});

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setToken(null);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Extrai a mensagem da API, que já vem em tom de voz da marca. */
export function extractError(
  error: unknown,
  fallback = "Algo deu errado.",
): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] })
      ?.message;
    if (Array.isArray(message)) return message[0];
    if (typeof message === "string") return message;
    if (error.code === "ERR_NETWORK") {
      return "A API não respondeu. Ela também tem seus dias.";
    }
  }
  return fallback;
}
