import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, type RegisterInput } from "../services/auth.service";
import { hasSessionHint, setSessionHint, setUnauthorizedHandler } from "../services/http";
import type { User } from "../types";

export type RegisterPayload = RegisterInput;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, code?: string) => Promise<void>;
  /** Cria a conta e envia o código; devolve o e-mail que precisa ser confirmado */
  register: (payload: RegisterPayload) => Promise<string>;
  /** Confirma o cadastro com o código do e-mail e abre a sessão */
  confirmRegistration: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Sai de todos os dispositivos (revoga todas as sessões no servidor) */
  logoutEverywhere: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Atualiza o usuário em memória depois de uma operação que já devolveu o perfil */
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasSessionHint());

  const clearLocal = useCallback(() => {
    setSessionHint(false);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* mesmo offline, a sessão local sai */
    } finally {
      clearLocal();
    }
  }, [clearLocal]);

  const logoutEverywhere = useCallback(async () => {
    try {
      await authService.logoutAll();
    } finally {
      clearLocal();
    }
  }, [clearLocal]);

  const refresh = useCallback(async () => {
    if (!hasSessionHint()) {
      setUser(null);
      return;
    }
    try {
      setUser(await authService.me());
    } catch {
      clearLocal();
    }
  }, [clearLocal]);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string, code?: string) => {
    const session = await authService.login(email, password, code);
    setSessionHint(true);
    setUser(session.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { email } = await authService.register(payload);
    return email;
  }, []);

  const confirmRegistration = useCallback(async (email: string, code: string) => {
    const session = await authService.confirmRegistration(email, code);
    setSessionHint(true);
    setUser(session.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      confirmRegistration,
      logout,
      logoutEverywhere,
      refresh,
      setUser,
    }),
    [user, loading, login, register, confirmRegistration, logout, logoutEverywhere, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
