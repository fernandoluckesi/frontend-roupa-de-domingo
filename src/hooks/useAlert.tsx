import { useCallback, useState } from "react";
import { AlertDialog } from "../components/ui/AlertDialog";

interface AlertState {
  title?: string;
  message: string;
  confirmLabel?: string;
  /** Roda depois de fechar: usado para aplicar o efeito que o aviso explica. */
  onClose?: () => void;
}

/**
 * Alerta do design system com estado embutido.
 *
 *   const { alert, alertElement } = useAlert();
 *   alert({ message: "..." , onClose: () => aplicarAlgo() });
 *   return <>{alertElement}</>;
 *
 * Preferir isso a window.alert(): segue o tema, nao bloqueia a thread e e
 * anunciado como alertdialog por leitor de tela.
 */
export function useAlert() {
  const [state, setState] = useState<AlertState | null>(null);

  const alert = useCallback((next: AlertState) => setState(next), []);

  // O efeito roda fora do setState: atualizador precisa ser puro, senao o
  // StrictMode o executa duas vezes e o callback dispara em dobro.
  const close = useCallback(() => {
    const pending = state?.onClose;
    setState(null);
    pending?.();
  }, [state]);

  const alertElement = (
    <AlertDialog
      open={state !== null}
      title={state?.title}
      confirmLabel={state?.confirmLabel}
      onConfirm={close}
    >
      {state?.message ?? ""}
    </AlertDialog>
  );

  return { alert, alertElement };
}
