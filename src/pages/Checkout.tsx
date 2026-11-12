import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { ordersService, paymentsService } from "../services/orders.service";
import { extractError } from "../services/http";
import { lookupZipCode } from "../services/zipCode.service";
import { formatDeliveryEstimate } from "../utils/shipping";
import { Checkbox } from "../components/ui/Checkbox";
import { LEGAL_VERSIONS } from "../config/company";
import { trackBeginCheckout } from "../lib/analytics";
import {
  Button,
  Card,
  Container,
  Divider,
  EmptyState,
  ErrorText,
  Field,
  Input,
  Label,
  Loading,
  Section,
  Select,
} from "../components/ui";
import {
  formatBRL,
  maskDocument,
  maskPhone,
  maskZipCode,
} from "../utils/format";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: ${({ theme }) => theme.spacing(8)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0 ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Summary = styled(Card)`
  position: sticky;
  top: 120px;

  h2 {
    font-size: 1.15rem;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
  }
`;

const Line = styled.div<{ $strong?: boolean; $positive?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: ${({ $strong }) => ($strong ? "1.15rem" : "0.9rem")};
  font-weight: ${({ $strong }) => ($strong ? 700 : 400)};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.success : "inherit"};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const MiniItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: 0.84rem;
  color: ${({ theme }) => theme.colors.textSoft};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Notice = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textFaint};
  line-height: 1.5;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const Hint = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textFaint};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

/**
 * Recado antes do pagamento. Tem a forma de um botao (mesma altura, raio e
 * tipografia), mas e so texto: sem background e sem acao, para ninguem tentar
 * clicar e confundir com o botao de pagar que fica logo abaixo.
 */
const MoneyJoke = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(4)};
  padding: 11px 20px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radius.md};
  background: transparent;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.text};
`;

const CheckRow = styled.label`
  /* inline-flex: a área clicável é só o checkbox + texto, não a linha inteira */
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: 0.9rem;
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.accent};
  }

  span {
    color: ${({ theme }) => theme.colors.textFaint};
  }
`;

const SectionHead = styled.h2`
  font-size: 1.15rem;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

interface FormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocument: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  state: string;
  city: string;
  notes: string;
}

const EMPTY: FormState = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerDocument: "",
  recipient: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  state: "",
  city: "",
  notes: "",
};

export default function Checkout() {
  const {
    cart,
    loading,
    shippingMethod,
    setShipping,
    zipCode: cartZipCode,
  } = useCart();
  const { user } = useAuth();
  const { push } = useToast();

  // begin_checkout uma vez por visita ao checkout, quando o carrinho carrega
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || !cart?.items.length) return;
    checkoutTracked.current = true;
    trackBeginCheckout(
      cart.items.map((item) => ({
        id: item.sku,
        name: item.productName,
        category: item.categoryName,
        priceCents: item.unitPriceCents,
        quantity: item.quantity,
      })),
      cart.items.reduce((sum, item) => sum + item.totalCents, 0),
    );
  }, [cart]);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [zipStatus, setZipStatus] = useState<"loading" | "notFound" | null>(
    null,
  );
  const numberRef = useRef<HTMLInputElement>(null);
  const zipPrefilled = useRef(false);
  // Padrão: o próprio comprador recebe (nome dos dados pessoais)
  const [selfRecipient, setSelfRecipient] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<{ simulated: boolean } | null>(
    null,
  );

  useEffect(() => {
    void paymentsService
      .config()
      .then(setPaymentInfo)
      .catch(() => null);
  }, []);

  // Pré-preenche com os dados da conta e endereço padrão
  useEffect(() => {
    if (!user) return;
    const address =
      user.addresses?.find((a) => a.isDefault) ?? user.addresses?.[0];
    setForm((current) => ({
      ...current,
      customerName: current.customerName || user.name,
      customerEmail: current.customerEmail || user.email,
      customerPhone: current.customerPhone || maskPhone(user.phone ?? ""),
      customerDocument:
        current.customerDocument || maskDocument(user.document ?? ""),
      ...(address
        ? {
            recipient: current.recipient || address.recipient,
            zipCode: current.zipCode || maskZipCode(address.zipCode),
            street: current.street || address.street,
            number: current.number || address.number,
            complement: current.complement || address.complement || "",
            district: current.district || address.district,
            city: current.city || address.city,
            state: current.state || address.state,
          }
        : {}),
    }));
  }, [user]);

  // Endereço salvo com outro destinatário: mostra o campo já preenchido
  useEffect(() => {
    const address =
      user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0];
    if (
      address?.recipient &&
      user?.name &&
      address.recipient.trim().toLowerCase() !== user.name.trim().toLowerCase()
    ) {
      setSelfRecipient(false);
    }
  }, [user]);

  const recipientName = selfRecipient
    ? form.customerName.trim()
    : form.recipient.trim();

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /** Recalcula o frete e preenche rua, bairro, cidade e UF a partir do CEP (ViaCEP). */
  const lookupZip = async (masked: string) => {
    const digits = masked.replace(/\D/g, "");
    if (digits.length !== 8) {
      setZipStatus(null);
      return;
    }

    void setShipping(digits, shippingMethod);

    setZipStatus("loading");
    const address = await lookupZipCode(digits);
    if (!address) {
      setZipStatus("notFound");
      return;
    }
    setZipStatus(null);
    setForm((current) => ({
      ...current,
      street: address.street || current.street,
      district: address.district || current.district,
      city: address.city || current.city,
      state: address.state || current.state,
    }));
    setErrors((current) => ({
      ...current,
      zipCode: undefined,
      street: address.street ? undefined : current.street,
      district: address.district ? undefined : current.district,
      city: undefined,
      state: undefined,
    }));
    numberRef.current?.focus();
  };

  // CEP já informado no carrinho: preenche o endereço sem precisar digitar de novo
  useEffect(() => {
    if (zipPrefilled.current || !cartZipCode || form.zipCode) return;
    // Endereço salvo na conta tem prioridade (preenchido pelo efeito acima)
    if (user?.addresses?.length) return;
    zipPrefilled.current = true;
    const masked = maskZipCode(cartZipCode);
    setForm((current) => ({ ...current, zipCode: masked }));
    void lookupZip(masked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartZipCode, form.zipCode, user]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (form.customerName.trim().length < 2)
      next.customerName = "Informe seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(form.customerEmail))
      next.customerEmail = "E-mail inválido.";
    if (form.customerDocument.replace(/\D/g, "").length !== 11)
      next.customerDocument =
        "CPF precisa de 11 dígitos (o Mercado Pago exige).";
    if (!selfRecipient && form.recipient.trim().length < 2)
      next.recipient = "Quem recebe?";
    if (form.zipCode.replace(/\D/g, "").length !== 8)
      next.zipCode = "CEP inválido.";
    if (form.street.trim().length < 2) next.street = "Informe a rua.";
    if (!form.number.trim()) next.number = "Número?";
    if (form.district.trim().length < 2) next.district = "Informe o bairro.";
    if (form.city.trim().length < 2) next.city = "Informe a cidade.";
    if (form.state.trim().length !== 2) next.state = "UF com 2 letras.";

    setErrors(next);
    const termsOk = acceptTerms;
    setTermsError(
      termsOk ? "" : "Aceite os termos e a política de trocas para continuar.",
    );
    return Object.keys(next).length === 0 && termsOk;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      push({
        variant: "error",
        title: "Faltou coisa",
        message: "Confira os campos destacados antes de seguir.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await ordersService.checkout({
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim().toLowerCase(),
        customerPhone: form.customerPhone.replace(/\D/g, "") || undefined,
        customerDocument: form.customerDocument.replace(/\D/g, "") || undefined,
        shippingMethod: shippingMethod,
        notes: form.notes.trim() || undefined,
        acceptTerms: true,
        termsVersion: LEGAL_VERSIONS.terms,
        shippingAddress: {
          recipient: recipientName,
          zipCode: form.zipCode.replace(/\D/g, ""),
          street: form.street.trim(),
          number: form.number.trim(),
          complement: form.complement.trim() || undefined,
          district: form.district.trim(),
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
        },
      });

      sessionStorage.setItem("rd:lastOrder", result.order.number);

      // Redirecionamento real para a tela de pagamento do Mercado Pago
      window.location.href = result.paymentUrl;
    } catch (error) {
      push({
        variant: "error",
        title: "Checkout travou",
        message: extractError(error),
      });
      setSubmitting(false);
    }
  };

  if (loading) return <Loading label="Montando o checkout..." />;

  if (!cart || cart.isEmpty) {
    return (
      <Container>
        <EmptyState
          emoji="🧾"
          title="Sem itens para pagar"
          description="Difícil cobrar por boas intenções. Escolha algo primeiro."
        >
          <Button as={Link} to="/catalogo" style={{ textDecoration: "none" }}>
            Ver o catálogo
          </Button>
        </EmptyState>
      </Container>
    );
  }

  const { totals, shipping } = cart;

  return (
    <Section $tight>
      <Container>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "28px" }}>Checkout</h1>

        <form onSubmit={submit} noValidate>
          <Layout>
            <div>
              <Card style={{ marginBottom: "20px" }}>
                <SectionHead>Seus dados</SectionHead>
                <Grid>
                  <Field $span={2}>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={form.customerName}
                      $invalid={Boolean(errors.customerName)}
                      onChange={(e) => update("customerName", e.target.value)}
                    />
                    {errors.customerName && (
                      <ErrorText>{errors.customerName}</ErrorText>
                    )}
                  </Field>

                  <Field $span={2}>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.customerEmail}
                      $invalid={Boolean(errors.customerEmail)}
                      onChange={(e) => update("customerEmail", e.target.value)}
                    />
                    {errors.customerEmail && (
                      <ErrorText>{errors.customerEmail}</ErrorText>
                    )}
                  </Field>

                  <Field $span={2}>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={form.customerPhone}
                      onChange={(e) =>
                        update("customerPhone", maskPhone(e.target.value))
                      }
                    />
                  </Field>

                  <Field $span={2}>
                    <Label htmlFor="document">CPF</Label>
                    <Input
                      id="document"
                      value={form.customerDocument}
                      $invalid={Boolean(errors.customerDocument)}
                      onChange={(e) =>
                        update("customerDocument", maskDocument(e.target.value))
                      }
                    />
                    {errors.customerDocument && (
                      <ErrorText>{errors.customerDocument}</ErrorText>
                    )}
                  </Field>
                </Grid>
              </Card>

              <Card>
                <SectionHead>Entrega</SectionHead>
                <Grid>
                  <Field $span={2}>
                    <Label htmlFor="zip">CEP</Label>
                    <Input
                      id="zip"
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={form.zipCode}
                      $invalid={Boolean(errors.zipCode)}
                      onChange={(e) => {
                        const masked = maskZipCode(e.target.value);
                        update("zipCode", masked);
                        void lookupZip(masked);
                      }}
                    />
                    {errors.zipCode ? (
                      <ErrorText>{errors.zipCode}</ErrorText>
                    ) : zipStatus === "loading" ? (
                      <Hint>Buscando endereço…</Hint>
                    ) : zipStatus === "notFound" ? (
                      <Hint>
                        CEP não encontrado. Preencha o endereço manualmente.
                      </Hint>
                    ) : null}
                  </Field>

                  <Field $span={3}>
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={form.street}
                      $invalid={Boolean(errors.street)}
                      onChange={(e) => update("street", e.target.value)}
                    />
                    {errors.street && <ErrorText>{errors.street}</ErrorText>}
                  </Field>

                  <Field>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      ref={numberRef}
                      value={form.number}
                      $invalid={Boolean(errors.number)}
                      onChange={(e) => update("number", e.target.value)}
                    />
                    {errors.number && <ErrorText>{errors.number}</ErrorText>}
                  </Field>

                  <Field $span={2}>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={form.complement}
                      onChange={(e) => update("complement", e.target.value)}
                    />
                  </Field>

                  <Field $span={2}>
                    <Label htmlFor="district">Bairro</Label>
                    <Input
                      id="district"
                      value={form.district}
                      $invalid={Boolean(errors.district)}
                      onChange={(e) => update("district", e.target.value)}
                    />
                    {errors.district && (
                      <ErrorText>{errors.district}</ErrorText>
                    )}
                  </Field>

                  <Field $span={3}>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={form.city}
                      $invalid={Boolean(errors.city)}
                      onChange={(e) => update("city", e.target.value)}
                    />
                    {errors.city && <ErrorText>{errors.city}</ErrorText>}
                  </Field>

                  <Field>
                    <Label htmlFor="state">UF</Label>
                    <Input
                      id="state"
                      maxLength={2}
                      value={form.state}
                      $invalid={Boolean(errors.state)}
                      onChange={(e) =>
                        update("state", e.target.value.toUpperCase())
                      }
                    />
                    {errors.state && <ErrorText>{errors.state}</ErrorText>}
                  </Field>

                  <Field $span={4}>
                    <CheckRow>
                      <input
                        type="checkbox"
                        checked={selfRecipient}
                        onChange={(e) => {
                          setSelfRecipient(e.target.checked);
                          setErrors((c) => ({ ...c, recipient: undefined }));
                        }}
                      />
                      Eu mesmo vou receber
                      {form.customerName.trim() && (
                        <span>({form.customerName.trim()})</span>
                      )}
                    </CheckRow>
                  </Field>

                  {!selfRecipient && (
                    <Field $span={4}>
                      <Label htmlFor="recipient">Quem recebe</Label>
                      <Input
                        id="recipient"
                        placeholder="Nome de quem vai receber a encomenda"
                        value={form.recipient}
                        $invalid={Boolean(errors.recipient)}
                        onChange={(e) => update("recipient", e.target.value)}
                      />
                      {errors.recipient && (
                        <ErrorText>{errors.recipient}</ErrorText>
                      )}
                    </Field>
                  )}

                  {shipping.options.length > 0 && (
                    <Field $span={4}>
                      <Label htmlFor="method">Modalidade de envio</Label>
                      <Select
                        id="method"
                        value={shippingMethod}
                        onChange={(e) =>
                          void setShipping(
                            form.zipCode,
                            e.target.value as "economico" | "expresso",
                          )
                        }
                      >
                        {shipping.options.map((option) => (
                          <option key={option.method} value={option.method}>
                            {option.label} ·{" "}
                            {option.priceCents === 0
                              ? "grátis"
                              : formatBRL(option.priceCents)}{" "}
                            · {formatDeliveryEstimate(option)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  )}

                  <Field $span={4}>
                    <Label htmlFor="notes">Observação (opcional)</Label>
                    <Input
                      id="notes"
                      placeholder="Algo que a estamparia precise saber"
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                    />
                  </Field>
                </Grid>
              </Card>
            </div>

            <Summary>
              <h2>Seu pedido</h2>

              {cart.items.map((item) => (
                <MiniItem key={item.id}>
                  <span>
                    {item.quantity}× {item.productName}
                  </span>
                  <span>{formatBRL(item.totalCents)}</span>
                </MiniItem>
              ))}

              <Divider />

              <Line>
                <span>Subtotal</span>
                <span>{formatBRL(totals.subtotalCents)}</span>
              </Line>

              {totals.discountCents > 0 && (
                <Line $positive>
                  <span>Desconto</span>
                  <span>−{formatBRL(totals.discountCents)}</span>
                </Line>
              )}

              <Line>
                <span>Frete</span>
                <span>
                  {totals.shippingCents === 0
                    ? shipping.selected
                      ? "Grátis"
                      : "informe o CEP"
                    : formatBRL(totals.shippingCents)}
                </span>
              </Line>
              {shipping.selected && (
                <Hint style={{ marginTop: 0, marginBottom: 8 }}>
                  Entrega: {formatDeliveryEstimate(shipping.selected)}
                </Hint>
              )}

              <Divider />

              <Line $strong>
                <span>Total</span>
                <span>{formatBRL(totals.totalCents)}</span>
              </Line>

              <MoneyJoke>
                O dinheiro não é seu. É só a sua vez de gastar
              </MoneyJoke>

              <div style={{ margin: "12px 0" }}>
                <Checkbox
                  id="checkout-terms"
                  checked={acceptTerms}
                  onChange={(value) => {
                    setAcceptTerms(value);
                    if (value) setTermsError("");
                  }}
                  required
                  invalid={Boolean(termsError)}
                  errorId={termsError ? "checkout-terms-error" : undefined}
                >
                  Li e aceito os{" "}
                  <Link to="/termos" target="_blank" rel="noopener">
                    termos de uso
                  </Link>{" "}
                  e a{" "}
                  <Link
                    to="/trocas-e-devolucoes"
                    target="_blank"
                    rel="noopener"
                  >
                    política de trocas e devoluções
                  </Link>
                  . Sei que posso desistir em até 7 dias do recebimento.
                </Checkbox>
                {termsError && (
                  <ErrorText id="checkout-terms-error" role="alert">
                    {termsError}
                  </ErrorText>
                )}
              </div>

              <Button $size="lg" $full type="submit" disabled={submitting}>
                {submitting ? "Redirecionando..." : "Ir para pagamento"}
              </Button>

              <Notice>
                Ao continuar você vai para o ambiente do Mercado Pago, onde
                escolhe entre Pix, cartão (em até 12x; juros, se houver,
                aparecem antes de confirmar) ou boleto. Nenhum dado de cartão
                passa pela nossa loja.{" "}
                <Link to="/pagamentos">Condições de pagamento</Link> ·{" "}
                <Link to="/termos#cupons">regras de cupons</Link>.
                {paymentInfo?.simulated &&
                  " Ambiente local sem credenciais: será aberta a tela de pagamento simulada."}
              </Notice>
            </Summary>
          </Layout>
        </form>
      </Container>
    </Section>
  );
}
