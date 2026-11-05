import { useEffect, type ReactNode } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayStrong};
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(5)};
  z-index: 200;
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: ${({ theme }) => theme.spacing(7)};
  width: 100%;
  max-width: 520px;
  max-height: 86vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};

  h3 {
    font-size: 1.3rem;
  }

  button {
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 1.4rem;
    line-height: 1;
    &:hover {
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Overlay
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </Header>
        {children}
      </Panel>
    </Overlay>
  );
}
