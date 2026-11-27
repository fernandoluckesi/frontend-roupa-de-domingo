import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { ordersService, paymentsService } from "../services/orders.service";
import { authService } from "../services/auth.service";
import { extractError } from "../services/http";
import { formatDeliveryEstimate } from "../utils/shipping";
import { Checkbox } from "../components/ui/Checkbox";
import { Icon } from "../components/ui/Icon";
import { LEGAL_VERSIONS } from "../config/company";
import { trackBeginCheckout } from "../lib/analytics";
import { trackEvent } from "../lib/visitTracking";
import { CheckoutSteps, type CheckoutStep } from "../components/checkout/CheckoutSteps";
import {
  AddressFields,
  AddressForm,
  EMPTY_ADDRESS,
  cleanAddress,
  validateAddress,
  type AddressValues,
} from "../components/checkout/AddressForm";
import {
  AlertDialog,
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
  Modal,
  Section,
} from "../components/ui";
import { formatBRL, maskDocument, maskPhone, maskZipCode } from "../utils/format";
import type { Address } from "../types";

// ---------------------------------------------------------------- estilos

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: ${({ theme }) => theme.spacing(6)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled(Card)`
  h2 {
    font-size: 1.2rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  > p.lead {
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.92rem;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
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

const AuthChoices = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Choice = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};

  h3 {
    font-size: 1.02rem;
  }

  p {
    flex: 1;
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.5;
  }
`;

const AddressCard = styled.label<{ $active?: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: start;
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;

  & + & {
    margin-top: ${({ theme }) => theme.spacing(3)};
  }

  input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: ${({ theme }) => theme.colors.accent};
  }

  .title {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    font-weight: 700;
  }

  .tag {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 8px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.bgSoft};
    color: ${({ theme }) => theme.colors.textSoft};
  }

  p {
    margin-top: 4px;
    font-size: 0.88rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  .actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing(1)};
  }
`;

const IconButton = styled.button`
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.textFaint};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bgSoft};
  }

  &.danger:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const SelectedAddress = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: start;
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radius.md};

  svg {
    color: ${({ theme }) => theme.colors.accent};
    margin-top: 2px;
  }

  strong {
    display: block;
  }

  p {
    margin-top: 4px;
    font-size: 0.88rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: auto 1fr;

    > button {
      grid-column: 2;
      justify-self: start;
    }
  }
`;

const Methods = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const Method = styled.label<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.accent};
  }

  span {
    flex: 1;
  }

  small {
    display: block;
    color: ${({ theme }) => theme.colors.textFaint};
    font-size: 0.8rem;
  }
`;

const SubHead = styled.h3`
  font-size: 1rem;
  margin: ${({ theme }) => theme.spacing(6)} 0 ${({ theme }) => theme.spacing(3)};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

const ReviewBlock = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)} 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  h3 {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.colors.textFaint};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    font-size: 0.92rem;
    line-height: 1.55;
  }

  a {
    flex-shrink: 0;
    font-size: 0.86rem;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Summary = styled(Card)`
  position: sticky;
  top: 120px;

  h2 {
    font-size: 1.05rem;
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
  }
`;

const Line = styled.div<{ $strong?: boolean; $positive?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: ${({ $strong }) => ($strong ? "1.2rem" : "0.9rem")};
  font-weight: ${({ $strong }) => ($strong ? 700 : 400)};
  font-family: ${({ theme, $strong }) => ($strong ? theme.fonts.heading : "inherit")};
  color: ${({ theme, $positive }) => ($positive ? theme.colors.success : "inherit")};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const MiniItem = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: center;
  font-size: 0.84rem;
  margin-bottom: ${({ theme }) => theme.spacing(3)};

  img {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.bgSoft};
  }

  small {
    display: block;
    color: ${({ theme }) => theme.colors.textFaint};
  }
`;

const Hint = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textFaint};
  line-height: 1.5;
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

/** Recado antes do pagamento, com cara de botão mas sem ação (não confundir com o botão de pagar). */
const MoneyJoke = styled.p`
  margin: ${({ theme }) => theme.spacing(4)} 0;
  padding: 11px 20px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radius.md};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
`;

// ---------------------------------------------------------------- helpers

const STEPS = ["identificacao", "entrega", "pagamento"] as const;
type Step = (typeof STEPS)[number];

const addressLine = (a: AddressValues) =>
  `${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ""} · ${a.district}, ${a.city}/${a.state} · CEP ${maskZipCode(a.zipCode)}`;

const toValues = (a: Address): AddressValues => ({
  label: a.label,
  recipient: a.recipient,
  zipCode: maskZipCode(a.zipCode),
  street: a.street,
  number: a.number,
  complement: a.complement ?? "",
  district: a.district,
  city: a.city,
  state: a.state,
});

interface Profile {
  name: string;
  phone: string;
  document: string;
}

/**
 * Etapas 2 a 4 da compra (a 1 é o carrinho):
 * - Identificação: sem login, entrar ou criar conta (e voltar para cá); com login, os dados da conta.
 * - Entrega: o endereço usado no último pedido já vem escolhido; dá para trocar, cadastrar, editar e
 *   excluir endereços. Na primeira compra o endereço é digitado aqui e fica salvo ao fechar o pedido.
 * - Pagamento: revisão, aceite dos termos e ida para o Mercado Pago.
 */
export default function Checkout() {
  const [params, setParams] = useSearchParams();
  const { cart, loading, shippingMethod, setShipping, zipCode: cartZipCode } = useCart();
  const { user, loading: authLoading, refresh } = useAuth();
  const { push } = useToast();

  const requested = params.get("etapa") as Step | null;
  const step: Step = requested && STEPS.includes(requested) ? requested : "identificacao";
  const goTo = useCallback(
    (next: Step) => {
      setParams({ etapa: next });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParams],
  );

  // ---------------------------------------------------------------- analytics

  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || !cart?.items.length) return;
    checkoutTracked.current = true;
    const selected = cart.items.filter((item) => item.selected);
    trackEvent("begin_checkout", undefined, cart?.totals.totalCents);
    trackBeginCheckout(
      selected.map((item) => ({
        id: item.sku,
        name: item.productName,
        category: item.categoryName,
        priceCents: item.unitPriceCents,
        quantity: item.quantity,
      })),
      selected.reduce((sum, item) => sum + item.totalCents, 0),
    );
  }, [cart]);

  const [paymentInfo, setPaymentInfo] = useState<{ simulated: boolean } | null>(null);
  useEffect(() => {
    void paymentsService
      .config()
      .then(setPaymentInfo)
      .catch(() => null);
  }, []);

  // ---------------------------------------------------------------- identificação

  const [profile, setProfile] = useState<Profile>({ name: "", phone: "", document: "" });
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile((current) => ({
      name: current.name || user.name,
      phone: current.phone || maskPhone(user.phone ?? ""),
      document: current.document || maskDocument(user.document ?? ""),
    }));
  }, [user]);

  const profileProblems = (p: Profile) => {
    const errors: Partial<Record<keyof Profile, string>> = {};
    if (p.name.trim().length < 2) errors.name = "Informe seu nome completo.";
    if (p.document.replace(/\D/g, "").length !== 11) errors.document = "CPF com 11 dígitos (o Mercado Pago exige).";
    const phone = p.phone.replace(/\D/g, "");
    if (phone && phone.length < 10) errors.phone = "Telefone com DDD.";
    return errors;
  };
  const profileComplete = Object.keys(profileProblems(profile)).length === 0;

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    const errors = profileProblems(profile);
    setProfileErrors(errors);
    if (Object.keys(errors).length || !user) return;

    const changes = {
      name: profile.name.trim(),
      phone: profile.phone.replace(/\D/g, ""),
      document: profile.document.replace(/\D/g, ""),
    };
    const changed =
      changes.name !== user.name ||
      changes.phone !== (user.phone ?? "").replace(/\D/g, "") ||
      changes.document !== (user.document ?? "").replace(/\D/g, "");

    if (changed) {
      setSavingProfile(true);
      try {
        // Os dados ficam na conta: a próxima compra já começa preenchida
        await authService.updateProfile({ ...changes, phone: changes.phone || undefined });
        await refresh();
      } catch (error) {
        push({ variant: "error", title: "Seus dados", message: extractError(error) });
        setSavingProfile(false);
        return;
      }
      setSavingProfile(false);
    }
    goTo("entrega");
  };

  // ---------------------------------------------------------------- entrega

  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [modal, setModal] = useState<{ mode: "new" } | { mode: "edit"; address: Address } | null>(null);
  const [toDelete, setToDelete] = useState<Address | null>(null);
  // Primeira compra (sem endereço salvo): digitado aqui, salvo ao fechar o pedido
  const [draft, setDraft] = useState<AddressValues>(EMPTY_ADDRESS);
  const [draftErrors, setDraftErrors] = useState<Partial<Record<keyof AddressValues, string>>>({});
  const [notes, setNotes] = useState("");

  const loadAddresses = useCallback(async () => {
    const list = await authService.listAddresses();
    setAddresses(list);
    // Mantém a escolha atual; sem escolha (ou se ela sumiu), o endereço do último pedido
    setSelectedId((current) => (current && list.some((a) => a.id === current) ? current : (list[0]?.id ?? null)));
    return list;
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadAddresses().catch(() => setAddresses([]));
  }, [user, loadAddresses]);

  // Rascunho da primeira compra: quem recebe é a própria pessoa e o CEP vem do carrinho
  useEffect(() => {
    if (!user) return;
    setDraft((current) => ({
      ...current,
      recipient: current.recipient || user.name,
      zipCode: current.zipCode || maskZipCode(cartZipCode),
    }));
  }, [user, cartZipCode]);

  const savedAddress = addresses?.find((a) => a.id === selectedId) ?? null;
  const hasSaved = Boolean(addresses && addresses.length > 0);
  const deliveryAddress: AddressValues | null = savedAddress
    ? toValues(savedAddress)
    : !hasSaved && Object.keys(validateAddress(draft)).length === 0
      ? draft
      : null;
  const deliveryZip = (savedAddress?.zipCode ?? draft.zipCode).replace(/\D/g, "");

  // Frete sempre cotado para o CEP do endereço escolhido
  useEffect(() => {
    if (!user || deliveryZip.length !== 8 || deliveryZip === (cart?.shipping.zipCode ?? "").replace(/\D/g, "")) return;
    void setShipping(deliveryZip, shippingMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, deliveryZip]);

  const quoteMatchesAddress =
    deliveryZip.length === 8 && (cart?.shipping.zipCode ?? "").replace(/\D/g, "") === deliveryZip && Boolean(cart?.shipping.selected);

  const submitDelivery = (event: FormEvent) => {
    event.preventDefault();
    if (!hasSaved) {
      const errors = validateAddress(draft);
      setDraftErrors(errors);
      if (Object.keys(errors).length) return;
    } else if (!savedAddress) {
      push({ variant: "error", title: "Entrega", message: "Escolha um endereço." });
      return;
    }
    if (!quoteMatchesAddress) {
      push({ variant: "error", title: "Frete", message: "Ainda calculando o frete para esse CEP. Tente de novo em instantes." });
      return;
    }
    goTo("pagamento");
  };

  const saveAddress = async (values: AddressValues) => {
    try {
      if (modal?.mode === "edit") {
        await authService.updateAddress(modal.address.id, { ...values, isDefault: modal.address.isDefault });
        await loadAddresses();
        push({ variant: "success", title: "Endereço atualizado" });
      } else {
        const created = await authService.createAddress({ ...values, isDefault: !hasSaved });
        await loadAddresses();
        setSelectedId(created.id);
        setChoosing(false);
        push({ variant: "success", title: "Endereço cadastrado" });
      }
      setModal(null);
    } catch (error) {
      push({ variant: "error", title: "Endereço", message: extractError(error) });
    }
  };

  const confirmDelete = async () => {
    const target = toDelete;
    setToDelete(null);
    if (!target) return;
    try {
      await authService.removeAddress(target.id);
      const list = await loadAddresses();
      if (selectedId === target.id) setSelectedId(list[0]?.id ?? null);
      if (!list.length) setChoosing(false);
      push({ variant: "success", title: "Endereço excluído" });
    } catch (error) {
      push({ variant: "error", title: "Endereço", message: extractError(error) });
    }
  };

  // ---------------------------------------------------------------- pagamento

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pay = async () => {
    if (!user || !deliveryAddress) return;
    if (!acceptTerms) {
      setTermsError("Aceite os termos e a política de trocas para continuar.");
      return;
    }
    setSubmitting(true);
    try {
      const address = cleanAddress(deliveryAddress);
      const result = await ordersService.checkout({
        customerName: profile.name.trim(),
        customerEmail: user.email,
        customerPhone: profile.phone.replace(/\D/g, "") || undefined,
        customerDocument: profile.document.replace(/\D/g, ""),
        addressId: savedAddress?.id,
        shippingAddress: {
          recipient: address.recipient,
          zipCode: address.zipCode,
          street: address.street,
          number: address.number,
          complement: address.complement || undefined,
          district: address.district,
          city: address.city,
          state: address.state,
        },
        shippingMethod,
        notes: notes.trim() || undefined,
        acceptTerms: true,
        termsVersion: LEGAL_VERSIONS.terms,
      });
      sessionStorage.setItem("rd:lastOrder", result.order.number);
      // Mercado Pago (ou a tela simulada, em ambiente local)
      window.location.href = result.paymentUrl;
    } catch (error) {
      push({ variant: "error", title: "Checkout travou", message: extractError(error) });
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------- guardas

  const selectedItems = useMemo(() => cart?.items.filter((item) => item.selected) ?? [], [cart]);

  if (loading || authLoading) return <Loading label="Montando o checkout..." />;

  if (!cart || cart.isEmpty || cart.totals.selectedCount === 0) {
    return (
      <Container>
        <EmptyState
          emoji="🧾"
          title={cart && !cart.isEmpty ? "Nenhum produto marcado" : "Sem itens para pagar"}
          description={
            cart && !cart.isEmpty
              ? "Marque no carrinho os produtos que você quer levar agora."
              : "Difícil cobrar por boas intenções. Escolha algo primeiro."
          }
        >
          <Button as={Link} to={cart && !cart.isEmpty ? "/carrinho" : "/catalogo"} style={{ textDecoration: "none" }}>
            {cart && !cart.isEmpty ? "Voltar ao carrinho" : "Ver o catálogo"}
          </Button>
        </EmptyState>
      </Container>
    );
  }

  // Sem conta, só a identificação; etapas seguintes exigem os dados e o endereço completos
  if (!user && step !== "identificacao") return <Navigate to="/checkout?etapa=identificacao" replace />;
  if (user && step !== "identificacao" && !profileComplete) return <Navigate to="/checkout?etapa=identificacao" replace />;
  // Sem endereço (ex.: recarregou a página no meio da primeira compra), volta para a entrega
  if (user && step === "pagamento" && addresses !== null && !deliveryAddress) {
    return <Navigate to="/checkout?etapa=entrega" replace />;
  }

  const { totals, shipping } = cart;
  const reachable: CheckoutStep[] = [
    "identificacao",
    ...(user && profileComplete ? (["entrega"] as const) : []),
    ...(user && profileComplete && deliveryAddress && quoteMatchesAddress ? (["pagamento"] as const) : []),
  ];

  // ---------------------------------------------------------------- telas

  const identification = !user ? (
    <Panel>
      <h2>Para fechar o pedido, entre na sua conta</h2>
      <p className="lead">O endereço fica salvo e a próxima compra sai em poucos cliques. Seu carrinho continua aqui.</p>
      <AuthChoices>
        <Choice>
          <h3>Já tenho conta</h3>
          <p>Entre com o seu e-mail e senha e volte direto para o pedido.</p>
          <Button as={Link} to="/entrar?voltar=/checkout" $full style={{ textDecoration: "none" }}>
            Entrar
          </Button>
        </Choice>
        <Choice>
          <h3>Sou novo por aqui</h3>
          <p>Crie a conta em um minuto. Depois de confirmar o e-mail, você volta para o checkout para informar o endereço.</p>
          <Button as={Link} to="/cadastro?voltar=/checkout" $variant="secondary" $full style={{ textDecoration: "none" }}>
            Criar conta
          </Button>
        </Choice>
      </AuthChoices>
    </Panel>
  ) : (
    <Panel as="form" onSubmit={submitProfile} noValidate>
      <h2>Seus dados</h2>
      <p className="lead">Confira os dados de quem está comprando. O CPF vai na nota fiscal e no pagamento.</p>
      <Grid>
        <Field $span={2}>
          <Label htmlFor="ck-name">Nome completo</Label>
          <Input
            id="ck-name"
            autoComplete="name"
            value={profile.name}
            $invalid={Boolean(profileErrors.name)}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          {profileErrors.name && <ErrorText>{profileErrors.name}</ErrorText>}
        </Field>
        <Field $span={2}>
          <Label htmlFor="ck-email">E-mail</Label>
          <Input id="ck-email" value={user.email} readOnly disabled />
        </Field>
        <Field $span={2}>
          <Label htmlFor="ck-document">CPF</Label>
          <Input
            id="ck-document"
            inputMode="numeric"
            value={profile.document}
            $invalid={Boolean(profileErrors.document)}
            onChange={(e) => setProfile({ ...profile, document: maskDocument(e.target.value) })}
          />
          {profileErrors.document && <ErrorText>{profileErrors.document}</ErrorText>}
        </Field>
        <Field $span={2}>
          <Label htmlFor="ck-phone">Telefone (opcional)</Label>
          <Input
            id="ck-phone"
            inputMode="tel"
            autoComplete="tel"
            value={profile.phone}
            $invalid={Boolean(profileErrors.phone)}
            onChange={(e) => setProfile({ ...profile, phone: maskPhone(e.target.value) })}
          />
          {profileErrors.phone && <ErrorText>{profileErrors.phone}</ErrorText>}
        </Field>
      </Grid>
      <Row>
        <Button as={Link} to="/carrinho" $variant="ghost" style={{ textDecoration: "none" }}>
          Voltar ao carrinho
        </Button>
        <Button type="submit" $size="lg" disabled={savingProfile}>
          {savingProfile ? "Salvando..." : "Continuar para entrega"}
        </Button>
      </Row>
    </Panel>
  );

  const shippingMethods =
    quoteMatchesAddress && shipping.options.length > 0 ? (
      <>
        <SubHead>Forma de envio</SubHead>
        <Methods>
          {shipping.options.map((option) => (
            <Method key={option.method} $active={shippingMethod === option.method}>
              <input
                type="radio"
                name="shipping-method"
                checked={shippingMethod === option.method}
                onChange={() => void setShipping(deliveryZip, option.method)}
              />
              <span>
                {option.label}
                <small>{formatDeliveryEstimate(option)}</small>
              </span>
              <strong>{option.priceCents === 0 ? "Grátis" : formatBRL(option.priceCents)}</strong>
            </Method>
          ))}
        </Methods>
      </>
    ) : deliveryZip.length === 8 ? (
      <Hint>Calculando o frete…</Hint>
    ) : null;

  const delivery = (
    <Panel as="form" onSubmit={submitDelivery} noValidate>
      <h2>Onde entregar?</h2>
      {addresses === null ? (
        <Loading label="Buscando seus endereços..." />
      ) : !hasSaved ? (
        <>
          <p className="lead">Esse endereço fica salvo na sua conta quando você fechar o pedido.</p>
          <AddressFields
            idPrefix="ck-address"
            values={draft}
            errors={draftErrors}
            onChange={(next) => {
              setDraft(next);
              setDraftErrors({});
            }}
          />
        </>
      ) : choosing ? (
        <>
          <p className="lead">Escolha o endereço de entrega.</p>
          <div role="radiogroup" aria-label="Endereços salvos">
            {addresses.map((address) => (
              <AddressCard key={address.id} $active={address.id === selectedId}>
                <input
                  type="radio"
                  name="address"
                  checked={address.id === selectedId}
                  onChange={() => setSelectedId(address.id)}
                />
                <span>
                  <span className="title">
                    {address.label}
                    {address.id === addresses[0].id && address.lastUsedAt && <span className="tag">último usado</span>}
                  </span>
                  <p>
                    {address.recipient}
                    <br />
                    {addressLine(toValues(address))}
                  </p>
                </span>
                <span className="actions">
                  <IconButton
                    type="button"
                    aria-label={`Editar ${address.label}`}
                    title="Editar"
                    onClick={(e) => {
                      e.preventDefault();
                      setModal({ mode: "edit", address });
                    }}
                  >
                    <Icon name="edit" size={18} />
                  </IconButton>
                  <IconButton
                    type="button"
                    className="danger"
                    aria-label={`Excluir ${address.label}`}
                    title="Excluir"
                    onClick={(e) => {
                      e.preventDefault();
                      setToDelete(address);
                    }}
                  >
                    <Icon name="trash" size={18} />
                  </IconButton>
                </span>
              </AddressCard>
            ))}
          </div>
          <Row style={{ marginTop: 16 }}>
            <Button type="button" $variant="secondary" onClick={() => setModal({ mode: "new" })}>
              <Icon name="plus" size={16} /> Cadastrar novo endereço
            </Button>
            <Button type="button" $variant="ghost" onClick={() => setChoosing(false)} disabled={!selectedId}>
              Usar o endereço selecionado
            </Button>
          </Row>
        </>
      ) : (
        savedAddress && (
          <>
            <p className="lead">
              {savedAddress.lastUsedAt && savedAddress.id === addresses[0]?.id
                ? "O mesmo endereço do seu último pedido."
                : "Endereço salvo na sua conta."}
            </p>
            <SelectedAddress>
              <Icon name="pin" size={22} />
              <div>
                <strong>
                  {savedAddress.label} · {savedAddress.recipient}
                </strong>
                <p>{addressLine(toValues(savedAddress))}</p>
              </div>
              <Button type="button" $variant="secondary" $size="sm" onClick={() => setChoosing(true)}>
                Escolher outro endereço
              </Button>
            </SelectedAddress>
          </>
        )
      )}

      {addresses !== null && !choosing && shippingMethods}

      {addresses !== null && !choosing && (
        <>
          <SubHead>Observação (opcional)</SubHead>
          <Input
            aria-label="Observação para a entrega"
            placeholder="Algo que a estamparia ou o entregador precise saber"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </>
      )}

      <Row>
        <Button type="button" $variant="ghost" onClick={() => goTo("identificacao")}>
          Voltar
        </Button>
        {!choosing && (
          <Button type="submit" $size="lg">
            Continuar para pagamento
          </Button>
        )}
      </Row>
    </Panel>
  );

  const payment = user && deliveryAddress && quoteMatchesAddress && (
    <Panel>
      <h2>Revise e pague</h2>
      <p className="lead">Confira tudo antes de ir para o Mercado Pago.</p>

      <ReviewBlock>
        <div>
          <h3>Comprador</h3>
          <p>
            {profile.name}
            <br />
            {user.email} · CPF {profile.document}
          </p>
        </div>
        <Link to="/checkout?etapa=identificacao">Alterar</Link>
      </ReviewBlock>

      <ReviewBlock>
        <div>
          <h3>Entrega</h3>
          <p>
            {deliveryAddress.recipient}
            <br />
            {addressLine(deliveryAddress)}
            {shipping.selected && (
              <>
                <br />
                {shipping.selected.label} · {formatDeliveryEstimate(shipping.selected)}
              </>
            )}
            {notes.trim() && (
              <>
                <br />
                Obs.: {notes.trim()}
              </>
            )}
          </p>
        </div>
        <Link to="/checkout?etapa=entrega">Alterar</Link>
      </ReviewBlock>

      <MoneyJoke>O dinheiro não é seu. É só a sua vez de gastar</MoneyJoke>

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
        <Link to="/trocas-e-devolucoes" target="_blank" rel="noopener">
          política de trocas e devoluções
        </Link>
        . Sei que posso desistir em até 7 dias do recebimento.
      </Checkbox>
      {termsError && (
        <ErrorText id="checkout-terms-error" role="alert">
          {termsError}
        </ErrorText>
      )}

      <Row>
        <Button type="button" $variant="ghost" onClick={() => goTo("entrega")}>
          Voltar
        </Button>
        <Button type="button" $size="lg" disabled={submitting} onClick={() => void pay()}>
          {submitting ? "Redirecionando..." : `Pagar ${formatBRL(totals.totalCents)}`}
        </Button>
      </Row>

      <Hint>
        No Mercado Pago você escolhe Pix, cartão (em até 12x; juros, se houver, aparecem antes de confirmar) ou boleto. Nenhum
        dado de cartão passa pela nossa loja. <Link to="/pagamentos">Condições de pagamento</Link> ·{" "}
        <Link to="/termos#cupons">regras de cupons</Link>.
        {paymentInfo?.simulated && " Ambiente local sem credenciais: será aberta a tela de pagamento simulada."}
      </Hint>
    </Panel>
  );

  return (
    <Section $tight>
      <Container>
        <CheckoutSteps current={step} reachable={reachable} />

        <Layout>
          <div>
            {step === "identificacao" && identification}
            {step === "entrega" && delivery}
            {step === "pagamento" && (payment || <Loading label="Calculando o frete..." />)}
          </div>

          <Summary>
            <h2>Resumo da compra</h2>
            {selectedItems.map((item) => (
              <MiniItem key={item.id}>
                {item.imageUrl ? <img src={item.imageUrl} alt="" width={44} height={44} loading="lazy" /> : <span />}
                <span>
                  {item.quantity}× {item.productName}
                  <small>
                    {item.categoryName} · {item.variantLabel}
                  </small>
                </span>
                <span>{formatBRL(item.totalCents)}</span>
              </MiniItem>
            ))}
            <Divider />
            <Line>
              <span>Produtos ({totals.selectedCount})</span>
              <span>{formatBRL(totals.subtotalCents)}</span>
            </Line>
            {totals.discountCents > 0 && (
              <Line $positive>
                <span>Desconto {cart.coupon ? `(${cart.coupon.code})` : ""}</span>
                <span>−{formatBRL(totals.discountCents)}</span>
              </Line>
            )}
            <Line $positive={Boolean(shipping.selected && shipping.selected.priceCents === 0)}>
              <span>Frete</span>
              <span>
                {shipping.selected ? (shipping.selected.priceCents === 0 ? "Grátis" : formatBRL(shipping.selected.priceCents)) : "—"}
              </span>
            </Line>
            <Divider />
            <Line $strong>
              <span>Total</span>
              <span>{formatBRL(totals.totalCents)}</span>
            </Line>
            <Button as={Link} to="/carrinho" $variant="ghost" $size="sm" $full style={{ textDecoration: "none" }}>
              Editar carrinho
            </Button>
          </Summary>
        </Layout>
      </Container>

      <Modal
        open={modal !== null}
        title={modal?.mode === "edit" ? "Editar endereço" : "Novo endereço"}
        onClose={() => setModal(null)}
      >
        {modal && (
          <AddressForm
            key={modal.mode === "edit" ? modal.address.id : "new"}
            initial={modal.mode === "edit" ? toValues(modal.address) : { ...EMPTY_ADDRESS, label: "", recipient: user?.name ?? "" }}
            submitLabel={modal.mode === "edit" ? "Salvar alterações" : "Cadastrar endereço"}
            onSubmit={saveAddress}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <AlertDialog
        open={toDelete !== null}
        title="Excluir endereço?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      >
        {toDelete ? `${toDelete.label}: ${addressLine(toValues(toDelete))}. Pedidos antigos não mudam.` : ""}
      </AlertDialog>
    </Section>
  );
}
