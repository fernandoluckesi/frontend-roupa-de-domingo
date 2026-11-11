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
import { useConsent } from "../../contexts/ConsentContext";
import { useHumorWarningAccepted } from "../../hooks/useHumorWarning";
import { useToast } from "../../contexts/ToastContext";
import { QUIET_ROUTES } from "../../config/quietRoutes";

/**
 * Pegadinha do "desconto de 20%":
 * 1. Depois de 30s no site, abre um modal oferecendo 20% de desconto.
 * 2. Toda vez que a pessoa tenta clicar em "Quero", o modal foge para outro lugar.
 * 3. Depois de algumas tentativas, fecha o modal e mostra um snackbar zombando.
 * 4. 20s depois, um segundo modal manda procurar o código "olhando para o teto",
 *    troca o texto após 3s e some aos poucos.
 *
 * Regras de bom gosto (docs/EASTER-EGGS.md): não aparece no carrinho, checkout,
 * pagamento, conta nem nas rotas silenciosas (ver config/quietRoutes.ts), e só
 * começa a contar depois do aviso de humor respondido.
 * Aparece UMA vez por navegador: a marca fica no localStorage sem depender do
 * consentimento de cookies (categoria Essencial na Política de Cookies). Ela
 * existe só para não repetir uma janela que a pessoa já viu e não identifica
 * ninguém.
 */

const START_DELAY_MS = 30_000;
const MOCK_AFTER_DODGES = 12;
const MOCK_AFTER_MS = 16_000;
const SECOND_MODAL_DELAY_MS = 20_000;
const TEXT_SWAP_MS = 6_000;
const FADE_START_AFTER_SWAP_MS = 1_600;
const FADE_MS = 3_000;

const SHOWN_KEY = "rd:fakeDiscountShown";
/** Chave antiga (repetia a cada 5 dias e dependia de consentimento): ainda conta como "já viu" */
const LEGACY_SHOWN_KEY = "rd:fakeDiscountShownAt";
const BLOCKED_PATHS = [
  "/carrinho",
  "/checkout",
  "/pagamento",
  "/conta",
  "/login",
  "/cadastro",
  // Destino do QR Code: a pegadinha roubaria o clique do unico CTA da tela
  ...QUIET_ROUTES,
];

let shownInMemory = false;

/** Este navegador já viu a pegadinha alguma vez? */
function alreadyShown(): boolean {
  if (shownInMemory) return true;
  try {
    return (
      localStorage.getItem(SHOWN_KEY) === "1" ||
      localStorage.getItem(LEGACY_SHOWN_KEY) !== null
    );
  } catch {
    return false;
  }
}

function markShown() {
  shownInMemory = true;
  try {
    localStorage.setItem(SHOWN_KEY, "1");
    localStorage.removeItem(LEGACY_SHOWN_KEY);
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
  const humorWarningAccepted = useHumorWarningAccepted();

  // 1. Espera 30s em página permitida, com o aviso de humor e o de cookies já resolvidos
  useEffect(() => {
    if (stage !== "waiting" || blockedRoute || cookieUiOpen || !humorWarningAccepted) return;
    const id = window.setTimeout(() => {
      markShown();
      setStage("offer");
    }, START_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [stage, blockedRoute, cookieUiOpen, humorWarningAccepted]);

  // Se a pessoa entrar no carrinho/checkout no meio da pegadinha, ela some.
  // O timer do deboche precisa ser cancelado junto: pendente, ele dispararia o
  // snackbar na tela nova, mesmo com a pegadinha ja encerrada.
  useEffect(() => {
    if (!blockedRoute) return;
    window.clearTimeout(mockTimer.current);
    if (stage !== "waiting" && stage !== "done") setStage("done");
  }, [blockedRoute, stage]);

  // blockedRoute em ref: o timer do deboche e agendado uma vez e precisa
  // consultar a rota do momento em que dispara, nao a da criacao.
  const blockedRouteRef = useRef(blockedRoute);
  blockedRouteRef.current = blockedRoute;

  const mock = useCallback(() => {
    window.clearTimeout(mockTimer.current);

    // Trocou para uma rota sem modal enquanto o timer corria: encerra calado.
    if (blockedRouteRef.current) {
      setStage("done");
      return;
    }

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
