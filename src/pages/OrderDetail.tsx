import { OrderInvoice, OrderReturns } from "../components/account/OrderReturns";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { ordersService } from "../services/orders.service";
import { useToast } from "../contexts/ToastContext";
import { extractError } from "../services/http";
import {
  Badge,
  Button,
  Card,
  Container,
  Divider,
  EmptyState,
  Loading,
  Section,
  Stack,
} from "../components/ui";
import { formatBRL, formatDateTime, maskZipCode } from "../utils/format";
import type { Order } from "../types";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: ${({ theme }) => theme.spacing(6)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing(7)};

  h1 {
    font-size: 1.7rem;
    letter-spacing: 0.03em;
  }
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: center;
  padding: ${({ theme }) => theme.spacing(3)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius.md};
  }

  h3 {
    font-size: 0.95rem;
  }

  small {
    color: ${({ theme }) => theme.colors.textFaint};
    font-size: 0.8rem;
  }
`;

const Timeline = styled.ol`
  position: relative;
  padding-left: ${({ theme }) => theme.spacing(6)};

  &::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 6px;
    bottom: 6px;
    width: 2px;
    background: ${({ theme }) => theme.colors.border};
  }

  li {
    position: relative;
    padding-bottom: ${({ theme }) => theme.spacing(5)};

    &::before {
      content: "";
      position: absolute;
      left: -${({ theme }) => theme.spacing(6)};
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.accent};
      border: 2px solid ${({ theme }) => theme.colors.surface};
    }

    &:last-child {
      padding-bottom: 0;
    }

    strong {
      display: block;
      font-size: 0.9rem;
    }

    small {
      color: ${({ theme }) => theme.colors.textFaint};
      font-size: 0.78rem;
    }

    p {
      font-size: 0.84rem;
      color: ${({ theme }) => theme.colors.textSoft};
      margin-top: 2px;
    }
  }
`;

const Line = styled.div<{ $strong?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: ${({ $strong }) => ($strong ? "1.1rem" : "0.88rem")};
  font-weight: ${({ $strong }) => ($strong ? 700 : 400)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const AddressBlock = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSoft};
  line-height: 1.6;
`;

const FULFILLMENT_LABELS: Record<string, string> = {
  QUEUED: "Na fila de produção",
  IN_PRODUCTION: "Em produção",
  PACKED: "Embalado, aguardando postagem",
  SHIPPED: "Postado nos Correios",
  DELIVERED: "Entregue",
};

export default function OrderDetail() {
  const theme = useTheme();
  const { number = "" } = useParams();
  const { push } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrder(await ordersService.byNumber(number));
    } catch (error) {
      push({ variant: "error", title: "Pedido", message: extractError(error) });
    } finally {
      setLoading(false);
    }
  }, [number, push]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = async () => {
    setWorking(true);
    await load();
    setWorking(false);
  };

  const cancel = async () => {
    setWorking(true);
    try {
      setOrder(await ordersService.cancel(number));
      push({ variant: "info", title: "Pedido cancelado" });
    } catch (error) {
      push({
        variant: "error",
        title: "Cancelar",
        message: extractError(error),
      });
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Loading />;

  if (!order) {
    return (
      <Container>
        <EmptyState
          emoji="🧐"
          title="Pedido não encontrado"
          description="O número informado não corresponde a nenhum pedido acessível nesta sessão."
        >
          <Button
            as={Link}
            to="/conta/pedidos"
            style={{ textDecoration: "none" }}
          >
            Ver meus pedidos
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Section $tight>
      <Container>
        <Head>
          <h1>{order.number}</h1>
          <Badge $color={theme.orderStatus[order.status]}>{order.statusLabel}</Badge>
        </Head>

        <Layout>
          <div>
            <Card style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Itens</h2>
              {order.items.map((item) => (
                <ItemRow key={item.id}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} width={96} height={96} loading="lazy" decoding="async" />
                  ) : (
                    <div />
                  )}
                  <div>
                    <h3>{item.productName}</h3>
                    <small>
                      {item.variantLabel} · {item.sku}
                    </small>
                    {item.customText && <small> · “{item.customText}”</small>}
                  </div>
                  <div>
                    {item.quantity}× {formatBRL(item.unitPriceCents)}
                  </div>
                </ItemRow>
              ))}
            </Card>

            <Card>
              <h2 style={{ fontSize: "1.05rem", marginBottom: 20 }}>
                Histórico do pedido
              </h2>
              <Timeline>
                {order.timeline.map((entry, index) => (
                  <li key={`${entry.status}-${index}`}>
                    <strong>{entry.status}</strong>
                    <small>{formatDateTime(entry.at)}</small>
                    {entry.note && <p>{entry.note}</p>}
                  </li>
                ))}
              </Timeline>
            </Card>
          </div>

          <div>
            <Card style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.05rem", marginBottom: 16 }}>
                Pagamento
              </h2>
              <Line>
                <span>Subtotal</span>
                <span>{formatBRL(order.subtotalCents)}</span>
              </Line>
              {order.discountCents > 0 && (
                <Line>
                  <span>
                    Desconto {order.coupon ? `(${order.coupon.code})` : ""}
                  </span>
                  <span>−{formatBRL(order.discountCents)}</span>
                </Line>
              )}
              <Line>
                <span>Frete ({order.shippingMethod})</span>
                <span>
                  {order.shippingCents === 0
                    ? "Grátis"
                    : formatBRL(order.shippingCents)}
                </span>
              </Line>
              <Divider />
              <Line $strong>
                <span>Total</span>
                <span>{formatBRL(order.totalCents)}</span>
              </Line>

              {order.payment && (
                <>
                  <Divider />
                  <Line>
                    <span>Status</span>
                    <span>{order.payment.status}</span>
                  </Line>
                  {order.payment.method && (
                    <Line>
                      <span>Método</span>
                      <span>{order.payment.method}</span>
                    </Line>
                  )}
                  <Line>
                    <span>Provedor</span>
                    <span>{order.payment.provider}</span>
                  </Line>

                  {order.status === "PENDING" && order.payment.initPoint && (
                    <Button
                      $full
                      style={{ marginTop: 16 }}
                      onClick={() => {
                        window.location.href = order.payment!.initPoint!;
                      }}
                    >
                      Pagar agora
                    </Button>
                  )}
                </>
              )}
            </Card>

            <Card style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Entrega</h2>
              <AddressBlock>
                {order.shippingRecipient}
                <br />
                {order.shippingStreet}, {order.shippingNumber}
                {order.shippingComplement
                  ? ` - ${order.shippingComplement}`
                  : ""}
                <br />
                {order.shippingDistrict}
                <br />
                {order.shippingCity}/{order.shippingState} ·{" "}
                {maskZipCode(order.shippingZipCode)}
                <br />
                <br />
                Prazo estimado: {order.estimatedDays} dias úteis após a
                produção.
              </AddressBlock>

              {order.fulfillment && (
                <>
                  <Divider />
                  <Line>
                    <span>Produção</span>
                    <span>{FULFILLMENT_LABELS[order.fulfillment.status] ?? order.fulfillment.status}</span>
                  </Line>
                  {order.fulfillment.trackingCode && (
                    <Line>
                      <span>Rastreio</span>
                      <span>
                        {order.fulfillment.trackingUrl ? (
                          <a
                            href={order.fulfillment.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "underline" }}
                          >
                            {order.fulfillment.trackingCode}
                          </a>
                        ) : (
                          order.fulfillment.trackingCode
                        )}
                      </span>
                    </Line>
                  )}
                </>
              )}
            </Card>

            <OrderInvoice order={order} />
            <OrderReturns order={order} onChange={setOrder} />

            <Stack $gap={3}>
              {order.status !== "PENDING" && order.status !== "CANCELLED" && (
                <Button
                  $variant="secondary"
                  disabled={working}
                  onClick={refresh}
                >
                  Atualizar status do pedido
                </Button>
              )}
              {order.status === "PENDING" && (
                <Button $variant="danger" disabled={working} onClick={cancel}>
                  Cancelar pedido
                </Button>
              )}
              <Button
                as={Link}
                to="/conta/pedidos"
                $variant="ghost"
                style={{ textDecoration: "none" }}
              >
                ← Todos os pedidos
              </Button>
            </Stack>
          </div>
        </Layout>
      </Container>
    </Section>
  );
}
