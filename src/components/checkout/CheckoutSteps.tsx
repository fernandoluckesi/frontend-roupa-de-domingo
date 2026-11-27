import { Link } from "react-router-dom";
import styled from "styled-components";
import { Icon } from "../ui/Icon";

export type CheckoutStep = "carrinho" | "identificacao" | "entrega" | "pagamento";

const STEPS: { key: CheckoutStep; label: string; to: string }[] = [
  { key: "carrinho", label: "Carrinho", to: "/carrinho" },
  { key: "identificacao", label: "Identificação", to: "/checkout?etapa=identificacao" },
  { key: "entrega", label: "Entrega", to: "/checkout?etapa=entrega" },
  { key: "pagamento", label: "Pagamento", to: "/checkout?etapa=pagamento" },
];

const List = styled.ol`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.spacing(7)};
  padding: 0;
  overflow-x: auto;
`;

const Item = styled.li<{ $state: "done" | "current" | "next" }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-shrink: 0;
  font-size: 0.88rem;
  font-weight: ${({ $state }) => ($state === "current" ? 700 : 500)};
  color: ${({ theme, $state }) => ($state === "next" ? theme.colors.textFaint : theme.colors.text)};

  .dot {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    font-size: 0.78rem;
    font-weight: 700;
    border: 1px solid ${({ theme, $state }) => ($state === "next" ? theme.colors.border : theme.colors.accent)};
    background: ${({ theme, $state }) => ($state === "next" ? "transparent" : theme.colors.accent)};
    color: ${({ theme, $state }) => ($state === "next" ? theme.colors.textFaint : theme.colors.accentText)};
  }

  a {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  &:not(:last-child)::after {
    content: "";
    width: 32px;
    height: 1px;
    margin-left: ${({ theme }) => theme.spacing(2)};
    background: ${({ theme, $state }) => ($state === "done" ? theme.colors.accent : theme.colors.border)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    .label {
      display: ${({ $state }) => ($state === "current" ? "inline" : "none")};
    }
    &:not(:last-child)::after {
      width: 16px;
    }
  }
`;

/**
 * Etapas da compra: Carrinho -> Identificação -> Entrega -> Pagamento. As etapas já feitas viram
 * link para voltar; as próximas só aparecem.
 */
export function CheckoutSteps({ current, reachable = [] }: { current: CheckoutStep; reachable?: CheckoutStep[] }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);
  return (
    <nav aria-label="Etapas da compra">
      <List>
        {STEPS.map((step, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "next";
          const content = (
            <>
              <span className="dot" aria-hidden="true">
                {state === "done" ? <Icon name="check" size={14} /> : index + 1}
              </span>
              <span className="label">{step.label}</span>
            </>
          );
          const canGo = state === "done" || reachable.includes(step.key);
          return (
            <Item key={step.key} $state={state} aria-current={state === "current" ? "step" : undefined}>
              {canGo && state !== "current" ? <Link to={step.to}>{content}</Link> : <span style={{ display: "flex", alignItems: "center", gap: 8 }}>{content}</span>}
            </Item>
          );
        })}
      </List>
    </nav>
  );
}
