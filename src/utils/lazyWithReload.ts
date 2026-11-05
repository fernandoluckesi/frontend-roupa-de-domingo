import { lazy, type ComponentType } from "react";

const RELOAD_KEY = "rd:chunkReloadAt";
const RELOAD_WINDOW_MS = 10_000;

/**
 * Recarrega a página uma vez quando um arquivo de página (chunk) não existe mais.
 * Acontece depois de um deploy: a aba aberta ainda conhece os nomes antigos dos
 * arquivos, que o servidor já não tem. O reload busca o index.html novo.
 * Retorna false se já recarregou há pouco (evita loop quando o erro é outro).
 */
export function reloadForStaleChunk(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_WINDOW_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage indisponível: recarrega mesmo assim (uma vez por carregamento)
  }
  window.location.reload();
  return true;
}

export const isChunkLoadError = (error: unknown) =>
  error instanceof Error &&
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
    error.message,
  );

/** `React.lazy` que se recupera de chunk antigo recarregando a página. */
export function lazyWithReload<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().catch((error: unknown) => {
      if (isChunkLoadError(error) && reloadForStaleChunk()) {
        // Mantém o Suspense mostrando "carregando" até o reload acontecer
        return new Promise<{ default: T }>(() => undefined);
      }
      throw error;
    }),
  );
}
