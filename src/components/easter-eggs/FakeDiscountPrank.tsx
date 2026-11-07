import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { Button } from "../ui";
import { hasConsent, useConsent } from "../../contexts/ConsentContext";
import { useToast } from "../../contexts/ToastContext";

/**
 * Pegadinha do "desconto de 20%":
 * 1. Depois de 30s no site, abre um modal oferecendo 20% de desconto.
 * 2. Toda vez que a pessoa tenta clicar em "Quero", o modal foge para outro lugar.
 * 3. Depois de algumas tentativas, fecha o modal e mostra um snackbar zombando.
 * 4. 20s depois, um segundo modal manda procurar o código "olhando para o teto",
 *    troca o texto após 3s e some aos poucos.
 *
 * Regras de bom gosto (docs/EASTER-EGGS.md): não aparece no carrinho, checkout,
 * pagamento nem na conta. Depois de mostrar, só volta a aparecer 5 dias depois
 * (data gravada no localStorage quando há consentimento de "preferências";
 * sem consentimento, vale só enquanto a aba estiver aberta).
 */

const START_DELAY_MS = 30_000;
const MOCK_AFTER_DODGES = 12;
const MOCK_AFTER_MS = 16_000;
const SECOND_MODAL_DELAY_MS = 20_000;
const TEXT_SWAP_MS = 6_000;
const FADE_START_AFTER_SWAP_MS = 1_600;
const FADE_MS = 3_000;

const SHOWN_KEY = "rd:fakeDiscountShownAt";
const COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;
const BLOCKED_PATHS = [
  "/carrinho",
  "/checkout",
  "/pagamento",
  "/conta",
  "/login",
  "/cadastro",
];

let shownInMemory = false;

/** Já mostrou nos últimos 5 dias? */
function alreadyShown(): boolean {
  if (shownInMemory) return true;
  try {
    if (!hasConsent("preferences")) return false;
    const shownAt = Number(localStorage.getItem(SHOWN_KEY));
    return (
      Number.isFinite(shownAt) &&
      shownAt > 0 &&
      Date.now() - shownAt < COOLDOWN_MS
    );
  } catch {
    return false;
  }
}

function markShown() {
  shownInMemory = true;
  try {
    if (hasConsent("preferences"))
      localStorage.setItem(SHOWN_KEY, String(Date.now()));
  } catch {
    // localStorage indisponível: fica só na memória da aba
  }
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const Overlay = styled.div<{ $passThrough?: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 210;
  background: ${({ theme }) => theme.colors.overlay};
  ${({ $passThrough }) =>
    $passThrough &&
    css`
      pointer-events: none;
    `}
`;

const Panel = styled.div<{ $floating: boolean }>`
  position: fixed;
  width: min(440px, calc(100vw - 32px));
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  padding: ${({ theme }) => theme.spacing(7)};
  text-align: center;

  ${({ $floating }) =>
    !$floating &&
    css`
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    `}

  transition: left 0.18s ease-out, top 0.18s ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  .badge {
    display: inline-block;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 2.6rem;
    line-height: 1;
    color: ${({ theme }) => theme.colors.accent};
  }

  h2 {
    font-size: 1.35rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.55;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-top: ${({ theme }) => theme.spacing(6)};
  }
`;

type Stage = "waiting" | "offer" | "mocked" | "ceiling" | "done";

export function FakeDiscountPrank() {
  const { pathname } = useLocation();
  const { bannerOpen, preferencesOpen } = useConsent();
  const { push } = useToast();

  const [stage, setStage] = useState<Stage>(() =>
    alreadyShown() ? "done" : "waiting",
  );
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [lookedUp, setLookedUp] = useState(false);
  const [fading, setFading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const dodges = useRef(0);
  const mockTimer = useRef<number>();

  const blockedRoute = BLOCKED_PATHS.some((p) => pathname.startsWith(p));
  const cookieUiOpen = bannerOpen || preferencesOpen;

  // 1. Espera 30s em página permitida, com o aviso de cookies já resolvido
  useEffect(() => {
    if (stage !== "waiting" || blockedRoute || cookieUiOpen) return;
    const id = window.setTimeout(() => {
      markShown();
      setStage("offer");
    }, START_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [stage, blockedRoute, cookieUiOpen]);

  // Se a pessoa entrar no carrinho/checkout no meio da pegadinha, ela some
  useEffect(() => {
    if (blockedRoute && stage !== "waiting" && stage !== "done")
      setStage("done");
  }, [blockedRoute, stage]);

  const mock = useCallback(() => {
    window.clearTimeout(mockTimer.current);
    setStage("mocked");
    push({ variant: "egg", title: "Como é engraçado te fazer de trouxa." });
  }, [push]);

  /** Move o modal para um lugar aleatório da tela, longe do ponteiro. */
  const dodge = useCallback(
    (pointer?: { x: number; y: number }) => {
      const panel = panelRef.current;
      if (!panel) return;
      const { width, height } = panel.getBoundingClientRect();
      const margin = 16;
      const maxLeft = Math.max(margin, window.innerWidth - width - margin);
      const maxTop = Math.max(margin, window.innerHeight - height - margin);

      let next = { left: margin, top: margin };
      for (let attempt = 0; attempt < 12; attempt++) {
        next = {
          left: margin + Math.random() * (maxLeft - margin),
          top: margin + Math.random() * (maxTop - margin),
        };
        const coversPointer =
          pointer &&
          pointer.x >= next.left - 24 &&
          pointer.x <= next.left + width + 24 &&
          pointer.y >= next.top - 24 &&
          pointer.y <= next.top + height + 24;
        if (!coversPointer) break;
      }
      setPosition(next);

      dodges.current += 1;
      if (dodges.current === 1)
        mockTimer.current = window.setTimeout(mock, MOCK_AFTER_MS);
      if (dodges.current >= MOCK_AFTER_DODGES) mock();
    },
    [mock],
  );

  // 3 -> 4. Vinte segundos depois do deboche, o segundo modal
  useEffect(() => {
    if (stage !== "mocked") return;
    const id = window.setTimeout(
      () => setStage("ceiling"),
      SECOND_MODAL_DELAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [stage]);

  // 4. Troca o texto depois de 3s, some aos poucos e desmonta
  useEffect(() => {
    if (stage !== "ceiling") return;
    const reduced = prefersReducedMotion();
    const swap = window.setTimeout(() => setLookedUp(true), TEXT_SWAP_MS);
    const fade = window.setTimeout(
      () => setFading(true),
      TEXT_SWAP_MS + FADE_START_AFTER_SWAP_MS,
    );
    const end = window.setTimeout(
      () => setStage("done"),
      TEXT_SWAP_MS + FADE_START_AFTER_SWAP_MS + (reduced ? 1_500 : FADE_MS),
    );
    return () => [swap, fade, end].forEach((id) => window.clearTimeout(id));
  }, [stage]);

  // Escape fecha a oferta (acessibilidade: nunca prender ninguém)
  useEffect(() => {
    if (stage !== "offer") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [stage]);

  useEffect(() => () => window.clearTimeout(mockTimer.current), []);

  function close() {
    window.clearTimeout(mockTimer.current);
    setStage("done");
  }

  if (stage === "offer") {
    return (
      <Overlay>
        <Panel
          ref={panelRef}
          $floating={position !== null}
          style={position ?? undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fake-discount-title"
        >
          <span className="badge">20% OFF</span>
          <h2 id="fake-discount-title">Você quer 20% de desconto?!</h2>
          <p>Clique em "Quero" para regastar seu código</p>
          <div className="actions">
            <Button $variant="secondary" type="button" onClick={close}>
              Não quero
            </Button>
            <Button
              type="button"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse")
                  dodge({ x: e.clientX, y: e.clientY });
              }}
              onPointerDown={(e) => {
                // Toque: foge antes do clique acontecer
                e.preventDefault();
                dodge({ x: e.clientX, y: e.clientY });
              }}
              onClick={(e) => {
                e.preventDefault();
                dodge();
              }}
            >
              Quero
            </Button>
          </div>
        </Panel>
      </Overlay>
    );
  }

  if (stage === "ceiling") {
    const style: CSSProperties = {
      opacity: fading ? 0 : 1,
      transition: prefersReducedMotion() ? "none" : `opacity ${FADE_MS}ms ease`,
    };
    return (
      <Overlay $passThrough style={style}>
        <Panel $floating={false} role="status" aria-live="polite">
          {lookedUp ? (
            <h2>Você olhou mesmo? haha</h2>
          ) : (
            <>
              <h2>Achou mesmo que iria ganhar desconto assim fácil?</h2>
              <p>
                Se você quer mesmo o desconto, ache o código secreto olhando
                para o teto.
              </p>
            </>
          )}
        </Panel>
      </Overlay>
    );
  }

  return null;
}
