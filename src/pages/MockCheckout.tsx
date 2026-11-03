import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { ordersService, paymentsService } from "../services/orders.service";
import { useToast } from "../contexts/ToastContext";
import { extractError } from "../services/http";
import {
  Button,
  Card,
  Container,
  Divider,
  Loading,
  Section,
} from "../components/ui";
import { formatBRL } from "../utils/format";
import type { Order } from "../types";

const Panel = styled(Card)`
  max-width: 520px;
  margin: 0 auto;

  h1 {
    font-size: 1.35rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  .warn {
    font-size: 0.84rem;
    color: ${({ theme }) => theme.colors.warning};
    background: ${({ theme }) => `${theme.colors.warning}14`};
    border: 1px solid ${({ theme }) => `${theme.colors.warning}44`};
    border-radius: ${({ theme }) => theme.radius.md};
    padding: ${({ theme }) => theme.spacing(3)};
    margin-bottom: ${({ theme }) => theme.spacing(5)};
    line-height: 1.5;
  }
`;

const Line = styled.div<{ $strong?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: ${({ $strong }) => ($strong ? "1.15rem" : "0.9rem")};
  font-weight: ${({ $strong }) => ($strong ? 700 : 400)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Actions = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

/**
 * Tela local que substitui o Checkout Pro quando MP_ACCESS_TOKEN nao esta configurado.
 * Com credenciais reais, o usuario nunca chega aqui: vai direto para o Mercado Pago.
 */
export default function MockCheckout() {
  const { orderNumber = "" } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    void ordersService
      .byNumber(orderNumber)
      .then(setOrder)
      .catch((error) =>
        push({
          variant: "error",
          title: "Pedido",
          message: extractError(error),
        }),
      )
      .finally(() => setLoading(false));
  }, [orderNumber, push]);

  const decide = async (outcome: "approve" | "reject" | "pending") => {
    setWorking(true);
    try {
      await paymentsService.simulate(orderNumber, outcome);
      const target =
        outcome === "approve"
          ? "sucesso"
          : outcome === "pending"
            ? "pendente"
            : "falha";
      navigate(`/pagamento/${target}?external_reference=${orderNumber}`);
    } catch (error) {
      push({
        variant: "error",
        title: "Simulação",
        message: extractError(error),
      });
      setWorking(false);
    }
  };

  if (loading) return <Loading label="Abrindo o checkout simulado..." />;

  return (
    <Section $tight>
      <Container>
        <Panel>
          <h1>Checkout simulado</h1>
          <p className="warn">
            Esta tela só existe porque <code>MP_ACCESS_TOKEN</code> não está
            configurado. Com credenciais reais, esse passo acontece no ambiente
            do Mercado Pago.
          </p>

          {order ? (
            <>
              <Line>
                <span>Pedido</span>
                <span>
                  <strong>{order.number}</strong>
                </span>
              </Line>
              <Line>
                <span>Cliente</span>
                <span>{order.customerName}</span>
              </Line>
              <Line>
                <span>Entrega</span>
                <span>
                  {order.shippingCity}/{order.shippingState}
                </span>
              </Line>

              <Divider />

              {order.items.map((item) => (
                <Line key={item.id}>
                  <span>
                    {item.quantity}× {item.productName}
                  </span>
                  <span>{formatBRL(item.totalCents)}</span>
                </Line>
              ))}

              <Divider />

              <Line $strong>
                <span>Total</span>
                <span>{formatBRL(order.totalCents)}</span>
              </Line>
            </>
          ) : (
            <p>Pedido não encontrado.</p>
          )}

          <Actions>
            <Button
              $size="lg"
              disabled={working}
              onClick={() => void decide("approve")}
            >
              Pagar e aprovar
            </Button>
            <Button
              $variant="secondary"
              disabled={working}
              onClick={() => void decide("pending")}
            >
              Simular pagamento pendente (Pix/boleto)
            </Button>
            <Button
              $variant="danger"
              disabled={working}
              onClick={() => void decide("reject")}
            >
              Simular recusa
            </Button>
          </Actions>
        </Panel>
      </Container>
    </Section>
  );
}
