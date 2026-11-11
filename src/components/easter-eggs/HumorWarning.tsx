import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../ui";
import { isQuietRoute } from "../../config/quietRoutes";
import { acceptHumorWarning, useHumorWarningAccepted } from "../../hooks/useHumorWarning";

/**
 * Aviso de entrada: "Este é um site de humor...".
 * Aparece na primeira visita deste navegador, em qualquer tela menos as rotas
 * silenciosas (destino do QR Code e a tela de saida). Quem escolhe sair vai
 * para /tchau e ve o aviso de novo se voltar.
 */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 220;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.overlayStrong};
  backdrop-filter: blur(4px);
`;

const Panel = styled.div`
  width: min(480px, 100%);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  padding: ${({ theme }) => theme.spacing(7)};
  text-align: center;

  .badge {
    display: inline-block;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.accent};
  }

  h2 {
    font-size: 1.35rem;
    line-height: 1.35;
  }

  .actions {
    display: grid;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-top: ${({ theme }) => theme.spacing(6)};
  }
`;

export function HumorWarning() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const accepted = useHumorWarningAccepted();
  const stayButton = useRef<HTMLButtonElement>(null);

  const open = !accepted && !isQuietRoute(pathname);

  useEffect(() => {
    if (!open) return;
    stayButton.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <Overlay>
      <Panel
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="humor-warning-title"
      >
        <span className="badge">Aviso</span>
        <h2 id="humor-warning-title">
          Este é um site de humor, contém sarcasmos, ofensas e piadas de
          qualidade duvidosa
        </h2>
        <div className="actions">
          <Button
            ref={stayButton}
            type="button"
            $size="lg"
            onClick={acceptHumorWarning}
          >
            Não sou gato gago pra ficar de "mimimi"
          </Button>
          <Button
            type="button"
            $variant="secondary"
            $size="lg"
            onClick={() => navigate("/tchau")}
          >
            Sou pamonha mole, quero sair 😭
          </Button>
        </div>
      </Panel>
    </Overlay>
  );
}
