import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { easterEggsService } from "../services/easterEggs.service";
import { useToast } from "./ToastContext";
import type { EasterEggItem, EasterEggProgress } from "../types";
import type { ThemeMode } from "../styles/theme";

interface EasterEggContextValue {
  items: EasterEggItem[];
  progress: EasterEggProgress | null;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  discover: (code: string) => Promise<void>;
  reload: () => Promise<void>;
  lastReward: string | null;
}

const EasterEggContext = createContext<EasterEggContextValue | null>(null);

const THEME_KEY = "rd:themeMode";

const CONSOLE_ART = `
   ____                             __        ____                  _
  / __ \\___  __ ______  ____ _     / /__     / __ \\___  __ _  (_)__  ___ _ ___
 / /_/ / _ \\/ // / __ \\/ _  /  / // -_)  / /_/ / _ \\/  ' \\/ / _ \\/ _ \`// _ \\
/_/ |_|\\___/\\_,_/ .__/\\_,_/   \\_,_/\\__/  /_____/\\___/_/_/_/_/_//_/\\_, / \\___/
               /_/                                               /___/
`;

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const { push } = useToast();
  const [items, setItems] = useState<EasterEggItem[]>([]);
  const [progress, setProgress] = useState<EasterEggProgress | null>(null);
  const [lastReward, setLastReward] = useState<string | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(THEME_KEY) as ThemeMode) ?? "default",
  );

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_KEY, mode);
  }, []);

  const reload = useCallback(async () => {
    try {
      const data = await easterEggsService.list();
      setItems(data.items);
      setProgress(data.progress);
    } catch {
      // Easter eggs são acessórios: falha aqui não deve atrapalhar a loja
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const discover = useCallback(
    async (code: string) => {
      try {
        const result = await easterEggsService.discover(code);

        if (!result.alreadyFound) {
          push({
            variant: "egg",
            title: `🥚 ${result.title}`,
            message: result.message,
            coupon: result.reward?.code,
          });
          if (result.reward) setLastReward(result.reward.code);
        }

        setProgress(result.progress);
        void reload();
      } catch {
        // idem: silencioso de propósito
      }
    },
    [push, reload],
  );

  // Easter egg #5: mensagem no console, uma vez por sessão
  useEffect(() => {
    if (sessionStorage.getItem("rd:consoleGreeted")) return;
    sessionStorage.setItem("rd:consoleGreeted", "1");

    /* eslint-disable no-console */
    console.log(`%c${CONSOLE_ART}`, "color:#d7ff3e;font-family:monospace");
    console.log(
      "%cVocê abriu o console de uma loja de camiseta.",
      "font-size:14px;font-weight:bold;color:#d7ff3e",
    );
    console.log(
      "%cIsso tecnicamente é invadir a cozinha do restaurante. Respeitamos.",
      "color:#a1a1aa",
    );
    console.log(
      "%cEstamos contratando gente que faz exatamente isso: vagas@roupadedomingo.com",
      "color:#58a6ff",
    );
    console.log(
      "%cTotal de easter eggs escondidos: 9. Boa sorte.",
      "color:#ff9f40",
    );
    /* eslint-enable no-console */

    void discover("CONSOLE_CURIOSO");
  }, [discover]);

  const value = useMemo(
    () => ({
      items,
      progress,
      themeMode,
      setThemeMode,
      discover,
      reload,
      lastReward,
    }),
    [items, progress, themeMode, setThemeMode, discover, reload, lastReward],
  );

  return (
    <EasterEggContext.Provider value={value}>
      {children}
    </EasterEggContext.Provider>
  );
}

export function useEasterEggs(): EasterEggContextValue {
  const context = useContext(EasterEggContext);
  if (!context) {
    throw new Error("useEasterEggs precisa estar dentro de EasterEggProvider");
  }
  return context;
}
