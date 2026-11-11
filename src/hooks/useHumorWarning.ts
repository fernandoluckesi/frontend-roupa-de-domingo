import { useSyncExternalStore } from "react";

/**
 * Aviso de conteudo de humor ("Este é um site de humor...").
 *
 * A confirmacao fica no localStorage SEM depender do consentimento de cookies:
 * e um aviso de conteudo, nao uma preferencia. Guardar que a pessoa ja leu o
 * aviso e o que evita mostra-lo a cada visita (categoria Essencial na
 * Politica de Cookies). O valor nao identifica ninguem.
 */
const ACCEPTED_KEY = "rd:humorWarningAccepted";

let acceptedInMemory = readAccepted();
const listeners = new Set<() => void>();

function readAccepted(): boolean {
  try {
    return localStorage.getItem(ACCEPTED_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** A pessoa ja confirmou o aviso neste navegador? */
export function isHumorWarningAccepted(): boolean {
  return acceptedInMemory;
}

export function acceptHumorWarning() {
  acceptedInMemory = true;
  try {
    localStorage.setItem(ACCEPTED_KEY, "1");
  } catch {
    // storage indisponivel (aba anonima restrita): vale enquanto a aba estiver aberta
  }
  listeners.forEach((listener) => listener());
}

/** Reativo: re-renderiza quando o aviso for confirmado. */
export function useHumorWarningAccepted(): boolean {
  return useSyncExternalStore(subscribe, isHumorWarningAccepted, () => false);
}
