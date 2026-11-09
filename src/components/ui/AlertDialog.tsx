import { useEffect, useRef, type ReactNode } from "react";
import styled from "styled-components";
import { Button } from "./Button";

/**
 * Alerta padrao da loja: substitui o window.alert(), que nao segue o tema,
 * nao e estilizavel e trava a thread do navegador.
 *
 * Use `useAlert()` para o caso simples (uma mensagem e um botao de OK) ou
 * monte o componente direto quando precisar de confirmacao com duas acoes.
 */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayStrong};
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(5)};
  z-index: 300;
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: ${({ theme }) => theme.spacing(7)};
  width: 100%;
  max-width: 420px;
  text-align: left;

  h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.2rem;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  p {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.55;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

export interface AlertDialogProps {
  open: boolean;
  /** Titulo curto. Omitido, o alerta mostra so a mensagem. */
  title?: string;
  /** Texto principal ou conteudo livre. */
  children: ReactNode;
  /** Rotulo do botao que confirma e fecha. */
  confirmLabel?: string;
  /** Presente, habilita o segundo botao (confirmacao em vez de aviso). */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function AlertDialog({
  open,
  title,
  children,
  confirmLabel = "Entendi",
  cancelLabel,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Esc fecha pelo caminho menos destrutivo e o foco vai para o botao principal,
  // para o alerta ser utilizavel sem mouse e anunciavel por leitor de tela.
  useEffect(() => {
    if (!open) return;
    const dismiss = onCancel ?? onConfirm;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <Overlay
      role="alertdialog"
      aria-modal="true"
      aria-label={title ?? "Aviso"}
      onClick={() => (onCancel ?? onConfirm)()}
    >
      <Panel onClick={(event) => event.stopPropagation()}>
        {title && <h3>{title}</h3>}
        {typeof children === "string" ? <p>{children}</p> : children}
        <Actions>
          {cancelLabel && (
            <Button type="button" $variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="button" ref={confirmRef} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Actions>
      </Panel>
    </Overlay>
  );
}
