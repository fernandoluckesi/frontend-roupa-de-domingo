import axios, { AxiosError } from "axios";

/**
 * Sessão: o token fica num cookie httpOnly (rd_session) que o JavaScript não lê,
 * o que protege contra roubo de sessão por XSS. Aqui só guardamos um marcador
 * "há sessão" para não perguntar /auth/me a quem nunca entrou.
 */
const SIGNED_IN_KEY = "rd:signedIn";
const LEGACY_TOKEN_KEY = "rd:token";
const SESSION_KEY = "rd:sessionId";

// Versões antigas guardavam o JWT no localStorage: remove
try {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
} catch {
  /* navegador sem storage */
}

export function hasSessionHint(): boolean {
  try {
    return localStorage.getItem(SIGNED_IN_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSessionHint(signedIn: boolean): void {
  try {
    if (signedIn) localStorage.setItem(SIGNED_IN_KEY, "1");
    else localStorage.removeItem(SIGNED_IN_KEY);
  } catch {
    /* navegador sem storage */
  }
}

/** Id estável da sessão anônima: permite carrinho e troféus sem cadastro. */
export function getSessionId(): string {
  let id: string | null = null;
  try {
    id = localStorage.getItem(SESSION_KEY);
  } catch {
    /* sem storage */
  }
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      localStorage.setItem(SESSION_KEY, id);
    } catch {
      /* sem storage */
    }
  }
  return id;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333/api",
  timeout: 20000,
  // Envia o cookie de sessão; X-Requested-With é a trava anti-CSRF exigida pela API
  withCredentials: true,
  headers: { "Content-Type": "application/json", "X-Requested-With": "rd-web" },
});

api.interceptors.request.use((config) => {
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
    // 401 de sessão expirada/revogada. Login errado também é 401, mas aí não há sessão para limpar.
    const url = String(error.config?.url ?? "");
    if (error.response?.status === 401 && hasSessionHint() && !url.includes("/auth/login")) {
      setSessionHint(false);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Código de erro da API (ex.: "OTP_REQUIRED"), quando houver. */
export function extractErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error;
  }
  return undefined;
}

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
    if (error.response?.status === 429) {
      return "Muitas tentativas em pouco tempo. Respire e tente de novo em instantes.";
    }
    if (error.code === "ERR_NETWORK") {
      return "A API não respondeu. Ela também tem seus dias.";
    }
  }
  return fallback;
}
