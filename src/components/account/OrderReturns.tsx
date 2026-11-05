import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button, Card, Checkbox, ErrorText, Field, Label, Modal, Select, Textarea } from "../ui";
import { useToast } from "../../contexts/ToastContext";
import { api, extractError } from "../../services/http";
import { formatBRL } from "../../utils/format";
import type { Order, ReturnRequest, ReturnType } from "../../types";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Solicitação recebida",
  APPROVED: "Aprovada: use o código de postagem",
  REJECTED: "Não aprovada",
  IN_TRANSIT: "Produto a caminho",
  RECEIVED: "Produto recebido",
  REFUNDED: "Reembolsada",
  EXCHANGED: "Trocada",
};

const Box = styled.div`
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.textSoft};
  line-height: 1.6;

  strong {
    color: ${({ theme }) => theme.colors.text};
  }

  ol {
    margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(3)};
    padding-left: ${({ theme }) => theme.spacing(5)};
    list-style: decimal;
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }
`;

const ItemsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(3)} 0;
`;

const OPEN_STATUSES = ["REQUESTED", "APPROVED", "IN_TRANSIT", "RECEIVED"];
const ELIGIBLE = ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"];

/** Devolução por arrependimento (7 dias, CDC art. 49) ou defeito (90 dias, art. 26) direto no pedido. */
export function OrderReturns({ order, onChange }: { order: Order; onChange: (order: Order) => void }) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReturnType>("REGRET");
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(order.items.map((item) => [item.id, true])),
  );
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const requests = order.returns ?? [];
  const current = requests.find((r) => OPEN_STATUSES.includes(r.status));
  const canRequest = ELIGIBLE.includes(order.status) && !current;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const items = order.items.filter((item) => selected[item.id]).map((item) => ({ orderItemId: item.id, quantity: item.quantity }));
    if (items.length === 0) return setError("Escolha ao menos um item.");
    if (reason.trim().length < 5) return setError("Conte em poucas palavras o motivo.");
    setError("");
    setSending(true);
    try {
      await api.post<ReturnRequest>(`/orders/${order.number}/returns`, { type, reason: reason.trim(), items });
      const { data } = await api.get<Order>(`/orders/${order.number}`);
      onChange(data);
      setOpen(false);
      push({
        variant: "success",
        title: "Solicitação registrada",
        message: "Respondemos em até 2 dias úteis com o código de postagem gratuita.",
      });
    } catch (err) {
      setError(extractError(err, "Não foi possível registrar a solicitação."));
    } finally {
      setSending(false);
    }
  };

  if (!ELIGIBLE.includes(order.status) && requests.length === 0) return null;

  return (
    <Card style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Trocas e devoluções</h2>
      <Box>
        {requests.map((request) => (
          <div key={request.id} style={{ marginBottom: 16 }}>
            <strong>{request.protocol}</strong> · {request.type === "REGRET" ? "Arrependimento" : "Defeito"}
            <br />
            Status: <strong>{STATUS_LABELS[request.status] ?? request.status}</strong>
            {request.reverseCode && (
              <>
                <br />
                Código de postagem reversa: <strong>{request.reverseCode}</strong>
              </>
            )}
            {request.refundCents != null && request.status === "REFUNDED" && (
              <>
                <br />
                Reembolso: <strong>{formatBRL(request.refundCents)}</strong> no mesmo meio de pagamento
              </>
            )}
            {request.resolution && (
              <>
                <br />
                {request.resolution}
              </>
            )}
          </div>
        ))}

        {canRequest && (
          <>
            <p>
              Desistiu? Você tem <strong>7 dias corridos</strong> do recebimento para devolver, com reembolso integral
              (frete incluso). Defeito: <strong>90 dias</strong>. <Link to="/trocas-e-devolucoes">Como funciona</Link>.
            </p>
            <Button $variant="secondary" $size="sm" type="button" onClick={() => setOpen(true)} style={{ marginTop: 12 }}>
              Solicitar devolução
            </Button>
          </>
        )}
      </Box>

      <Modal open={open} title="Solicitar devolução" onClose={() => setOpen(false)}>
        <form onSubmit={submit} noValidate>
          <Field>
            <Label htmlFor="ret-type">Motivo</Label>
            <Select id="ret-type" value={type} onChange={(e) => setType(e.target.value as ReturnType)}>
              <option value="REGRET">Desisti da compra (arrependimento, até 7 dias do recebimento)</option>
              <option value="DEFECT">Produto com defeito (até 90 dias)</option>
            </Select>
          </Field>

          <Label as="p">Itens</Label>
          <ItemsList>
            {order.items.map((item) => (
              <Checkbox
                key={item.id}
                id={`ret-item-${item.id}`}
                checked={Boolean(selected[item.id])}
                onChange={(value) => setSelected((s) => ({ ...s, [item.id]: value }))}
              >
                {item.quantity}x {item.productName} ({item.variantLabel})
              </Checkbox>
            ))}
          </ItemsList>

          <Field>
            <Label htmlFor="ret-reason">Conte o que aconteceu</Label>
            <Textarea
              id="ret-reason"
              rows={4}
              maxLength={1000}
              value={reason}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? "ret-error" : undefined}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          {error && (
            <ErrorText id="ret-error" role="alert">
              {error}
            </ErrorText>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Button type="submit" disabled={sending}>
              {sending ? "Enviando..." : "Enviar solicitação"}
            </Button>
            <Button $variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

/** Nota fiscal do pedido, quando emitida. */
export function OrderInvoice({ order }: { order: Order }) {
  if (!order.invoice || order.invoice.status !== "ISSUED") return null;
  return (
    <Card style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Nota fiscal</h2>
      <Box>
        Número: <strong>{order.invoice.number}</strong>
        {order.invoice.issuedAt && <> · emitida em {new Date(order.invoice.issuedAt).toLocaleDateString("pt-BR")}</>}
        {order.invoice.accessKey && (
          <>
            <br />
            Chave de acesso: <strong>{order.invoice.accessKey}</strong>
          </>
        )}
        {order.invoice.pdfUrl && (
          <>
            <br />
            <a href={order.invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
              Baixar DANFE
            </a>
          </>
        )}
      </Box>
    </Card>
  );
}
