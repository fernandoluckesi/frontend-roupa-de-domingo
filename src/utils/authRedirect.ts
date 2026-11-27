/**
 * Para onde voltar depois de entrar ou criar a conta (ex.: o checkout). Fica no sessionStorage
 * porque o cadastro passa por várias telas (cadastro -> código por e-mail -> conta criada).
 * Só aceita caminhos internos ("/checkout"), nunca outro site.
 */
const KEY = "rd:afterAuth";

const safe = (path: string | null | undefined) =>
  path && path.startsWith("/") && !path.startsWith("//") ? path : null;

/** Guarda o destino (normalmente vindo de ?voltar=/checkout). */
export function setAfterAuth(path: string | null | undefined) {
  const target = safe(path);
  try {
    if (target) sessionStorage.setItem(KEY, target);
  } catch {
    // sem sessionStorage: volta para a conta, como antes
  }
}

/** Lê e apaga o destino; sem destino guardado, usa o padrão. */
export function consumeAfterAuth(fallback = "/conta"): string {
  try {
    const target = safe(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
    return target ?? fallback;
  } catch {
    return fallback;
  }
}
