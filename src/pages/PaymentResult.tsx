import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { ordersService } from "../services/orders.service";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import {
  Button,
  Card,
  Container,
  Divider,
  Loading,
  Section,
  Stack,
} from "../components/ui";
import { formatBRL } from "../utils/format";
import { extractError } from "../services/http";
import type { Order } from "../types";
import { trackPurchase } from "../lib/analytics";

/** Pedido com pagamento confirmado (conta como compra no GA4/Pixel). */
const PAID_STATUSES: Order["status"][] = ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"];

const Hero = styled.div<{ $tone: "success" | "warning" | "danger" }>`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(10)} 0
    ${({ theme }) => theme.spacing(8)};

  span {
    font-size: 3rem;
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  h1 {
    font-size: clamp(1.6rem, 4vw, 2.3rem);
    color: ${({ theme, $tone }) => theme.colors[$tone]};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
    max-width: 56ch;
    margin: 0 auto;
  }

  code {
    display: inline-block;
    margin-top: ${({ theme }) => theme.spacing(5)};
    padding: 7px 16px;
    border-radius: ${({ theme }) => theme.radius.md};
    border: 1px dashed ${({ theme }) => theme.colors.border};
    font-size: 1.05rem;
    letter-spacing: 0.08em;
    font-weight: 700;
  }
`;

const Line = styled.div<{ $strong?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: ${({ $strong }) => ($strong ? "1.1rem" : "0.9rem")};
  font-weight: ${({ $strong }) => ($strong ? 700 : 400)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const COPY = {
  sucesso: {
    tone: "success" as const,
    emoji: "✅",
    title: "Pagamento aprovado",
    text: "Seu pedido entrou na fila de produção. Agora é com a máquina de impressão e com a sua paciência.",
  },
  pendente: {
    tone: "warning" as const,
    emoji: "⏳",
    title: "Pagamento pendente",
    text: "Estamos aguardando a confirmação. Pix e boleto levam um tempo; ansiedade não acelera o processo.",
  },
  falha: {
    tone: "danger" as const,
    emoji: "❌",
    title: "Pagamento não aprovado",
    text: "O pagamento foi recusado. Pode ser o banco, pode ser o universo. Tente outro método.",
  },
};

export default function PaymentResult() {
  const { outcome = "sucesso" } = useParams<{ outcome: keyof typeof COPY }>();
  const [params] = useSearchParams();
  const { reload } = useCart();
  const { push } = useToast();

  const copy = COPY[outcome as keyof typeof COPY] ?? COPY.sucesso;

  const orderNumber =
    params.get("external_reference") ??
    sessionStorage.getItem("rd:lastOrder") ??
    "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    void reload();
  }, [reload]);

  // O webhook do Mercado Pago é assíncrono: fazemos polling curto na volta
  useEffect(() => {
    if (!orderNumber) return;

    let cancelled = false;

    const fetchOrder = async () => {
      try {
        const data = await ordersService.byNumber(orderNumber);
        if (cancelled) return;
        setOrder(data);
        if (PAID_STATUSES.includes(data.status)) {
          trackPurchase(
            data.number,
            data.items.map((item) => ({
              id: item.sku,
              name: item.productName,
              priceCents: item.unitPriceCents,
              quantity: item.quantity,
            })),
            data.totalCents,
            data.shippingCents,
          );
        }
        if (data.status === "PENDING" && attempts < 6) {
          window.setTimeout(() => setAttempts((n) => n + 1), 2500);
        }
      } catch (error) {
        if (!cancelled) {
          push({
            variant: "error",
            title: "Pedido",
            message: extractError(error),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, attempts, push]);

  return (
    <Section $tight>
      <Container $narrow>
        <Hero $tone={copy.tone}>
          <span role="img" aria-hidden="true">
            {copy.emoji}
          </span>
          <h1>{copy.title}</h1>
          <p>{copy.text}</p>
          {orderNumber && <code>{orderNumber}</code>}
        </Hero>

        {loading ? (
          <Loading label="Conferindo o pagamento..." />
        ) : order ? (
          <Card>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
              {order.statusLabel}
            </h2>

            {order.items.map((item) => (
              <Line key={item.id}>
                <span>
                  {item.quantity}× {item.productName} ({item.variantLabel})
                </span>
                <span>{formatBRL(item.totalCents)}</span>
              </Line>
            ))}

            <Divider />

            <Line>
              <span>Subtotal</span>
              <span>{formatBRL(order.subtotalCents)}</span>
            </Line>
            {order.discountCents > 0 && (
              <Line>
                <span>Desconto</span>
                <span>−{formatBRL(order.discountCents)}</span>
              </Line>
            )}
            <Line>
              <span>Frete</span>
              <span>
                {order.shippingCents === 0
                  ? "Grátis"
                  : formatBRL(order.shippingCents)}
              </span>
            </Line>
            <Line $strong>
              <span>Total</span>
              <span>{formatBRL(order.totalCents)}</span>
            </Line>

            {order.trackingCode && (
              <>
                <Divider />
                <Line>
                  <span>Rastreio</span>
                  <span>{order.trackingCode}</span>
                </Line>
              </>
            )}

            <Divider />

            <Stack $row $wrap $gap={3}>
              <Button
                as={Link}
                to={`/conta/pedidos/${order.number}`}
                style={{ textDecoration: "none" }}
              >
                Acompanhar pedido
              </Button>
              <Button
                as={Link}
                to="/catalogo"
                $variant="secondary"
                style={{ textDecoration: "none" }}
              >
                Continuar comprando
              </Button>
            </Stack>
          </Card>
        ) : (
          <Card>
            <p style={{ marginBottom: "16px" }}>
              Não localizamos o pedido nesta sessão. Se você pagou, o e-mail de
              confirmação chega em instantes.
            </p>
            <Button
              as={Link}
              to="/conta/pedidos"
              style={{ textDecoration: "none" }}
            >
              Ver meus pedidos
            </Button>
          </Card>
        )}
      </Container>
    </Section>
  );
}
