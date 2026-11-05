import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { ordersService } from "../services/orders.service";
import { useAuth } from "../contexts/AuthContext";
import {
  Badge,
  Button,
  Card,
  Container,
  EmptyState,
  Loading,
  Section,
} from "../components/ui";
import { formatBRL, formatDate } from "../utils/format";
import type { Order } from "../types";

const Row = styled(Card)`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  transition: ${({ theme }) => theme.transition};

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  .meta {
    display: flex;
    gap: ${({ theme }) => theme.spacing(3)};
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
    letter-spacing: 0.04em;
  }

  small {
    color: ${({ theme }) => theme.colors.textFaint};
    font-size: 0.82rem;
  }

  .items {
    font-size: 0.86rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  .total {
    text-align: right;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.15rem;
  }
`;

export default function Orders() {
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    void ordersService
      .listMine()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (loading || authLoading)
    return <Loading label="Buscando seus pedidos..." />;

  if (!user) {
    return (
      <Container>
        <EmptyState
          emoji="🔐"
          title="Entre para ver seus pedidos"
          description="Pedidos de convidado podem ser acompanhados pelo número recebido no e-mail."
        >
          <Button as={Link} to="/entrar" style={{ textDecoration: "none" }}>
            Entrar
          </Button>
        </EmptyState>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container>
        <EmptyState
          emoji="📦"
          title="Nenhum pedido ainda"
          description="Sua lista de compras está tão vazia quanto sua agenda de domingo."
        >
          <Button as={Link} to="/catalogo" style={{ textDecoration: "none" }}>
            Ver o catálogo
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Section $tight>
      <Container>
        <h1 style={{ fontSize: "1.8rem", marginBottom: 28 }}>Meus pedidos</h1>

        {orders.map((order) => (
          <Row key={order.id} as={Link} to={`/conta/pedidos/${order.number}`}>
            <div>
              <div className="meta">
                <strong>{order.number}</strong>
                <Badge $color={theme.orderStatus[order.status]}>
                  {order.statusLabel}
                </Badge>
                <small>{formatDate(order.createdAt)}</small>
              </div>
              <p className="items">
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "itens"}:{" "}
                {order.items.map((item) => item.productName).join(", ")}
              </p>
            </div>
            <div className="total">{formatBRL(order.totalCents)}</div>
          </Row>
        ))}
      </Container>
    </Section>
  );
}
