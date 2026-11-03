import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "info" | "success" | "error" | "egg";

export interface Toast {
  id: number;
  title: string;
  message?: string;
  variant: ToastVariant;
  coupon?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = nextId++;
      setToasts((current) => [...current, { ...toast, id }]);
      // Easter eggs ficam mais tempo na tela: o texto é parte do prêmio
      window.setTimeout(
        () => dismiss(id),
        toast.variant === "egg" ? 9000 : 5000,
      );
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast precisa estar dentro de ToastProvider");
  return context;
}
