import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LEGAL_VERSIONS } from "../config/company";
import { consentService } from "../services/consent.service";

/**
 * Consentimento de cookies e armazenamento local (LGPD + orientação da ANPD).
 *
 * - essenciais: sempre ativos (sessão, carrinho, CEP do frete, último pedido)
 * - preferências: tema "caos" e easter eggs de console/carrinho
 * - estatísticas / marketing: nenhum script de terceiro instalado hoje; as
 *   categorias existem para que qualquer tag futura só dispare com consentimento
 *   (use `hasConsent("statistics")` antes de carregar o script).
 */
export type ConsentCategory = "preferences" | "statistics" | "marketing";

export interface ConsentChoice {
  version: string;
  decidedAt: string;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "rd:cookieConsent";

/** Chaves de armazenamento que dependem da categoria "preferências". */
export const PREFERENCE_KEYS = ["rd:themeMode", "rd:consoleGreeted", "rd:emptyCartViews", "rd:fakeDiscountShownAt"];

function readChoice(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentChoice;
    // Política mudou de versão: pede a escolha de novo
    return parsed.version === LEGAL_VERSIONS.cookies ? parsed : null;
  } catch {
    return null;
  }
}

/** Leitura síncrona para código fora do React (ex.: antes de gravar preferência). */
export function hasConsent(category: ConsentCategory): boolean {
  return readChoice()?.[category] === true;
}

interface ConsentContextValue {
  choice: ConsentChoice | null;
  /** Banner aberto (primeira visita ou nova versão da política) */
  bannerOpen: boolean;
  /** Painel de configuração aberto */
  preferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (choice: Pick<ConsentChoice, ConsentCategory>) => void;
  /** Reabre as preferências a qualquer momento (rodapé e página /cookies) */
  openPreferences: () => void;
  closePreferences: () => void;
  hasConsent: (category: ConsentCategory) => boolean;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(() => readChoice());
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const persist = useCallback((next: Pick<ConsentChoice, ConsentCategory>) => {
    const full: ConsentChoice = {
      version: LEGAL_VERSIONS.cookies,
      decidedAt: new Date().toISOString(),
      ...next,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
      if (!full.preferences) {
        // Revogação: apaga o que dependia do consentimento
        for (const key of PREFERENCE_KEYS) {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      /* navegador sem storage: a escolha vale só nesta aba */
    }
    setChoice(full);
    setPreferencesOpen(false);
    // Registro auditável da escolha (prova do consentimento, art. 8º §2º da LGPD)
    void consentService.record(full).catch(() => undefined);
  }, []);

  const acceptAll = useCallback(
    () => persist({ preferences: true, statistics: true, marketing: true }),
    [persist],
  );
  const rejectAll = useCallback(
    () => persist({ preferences: false, statistics: false, marketing: false }),
    [persist],
  );

  useEffect(() => {
    // Outra aba mudou a escolha
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setChoice(readChoice());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      choice,
      bannerOpen: choice === null && !preferencesOpen,
      preferencesOpen,
      acceptAll,
      rejectAll,
      save: persist,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      hasConsent: (category) => choice?.[category] === true,
    }),
    [choice, preferencesOpen, acceptAll, rejectAll, persist],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent precisa estar dentro de ConsentProvider");
  return context;
}
