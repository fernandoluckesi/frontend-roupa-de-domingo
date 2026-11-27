import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../contexts/CartContext";
import {
  Button,
  Card,
  Container,
  EmptyState,
  Input,
  Loading,
  QuantityStepper,
  Section,
} from "../components/ui";
import { Icon } from "../components/ui/Icon";
import { CheckoutSteps } from "../components/checkout/CheckoutSteps";
import { formatBRL, maskZipCode } from "../utils/format";
import { formatDeliveryEstimate } from "../utils/shipping";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: ${({ theme }) => theme.spacing(6)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Box = styled(Card).attrs({ $padding: 0 })`
  overflow: hidden;
`;

const SelectAllRow = styled(Card).attrs({ $padding: 0 })`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(5)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  small {
    color: ${({ theme }) => theme.colors.textFaint};
    font-size: 0.82rem;
  }
`;

/** Checkbox nativo grande, com o "meio marcado" quando só parte dos itens está selecionada. */
const Check = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
  font-size: 1rem;

  input {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    accent-color: ${({ theme }) => theme.colors.accent};
    cursor: pointer;
  }

  input:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const ListHead = styled.div`
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(5)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 700;
`;

const Row = styled.div<{ $muted: boolean }>`
  display: grid;
  grid-template-columns: 24px 96px 1fr auto;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: start;
  padding: ${({ theme }) => theme.spacing(5)};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  .thumb,
  .info,
  .price {
    opacity: ${({ $muted }) => ($muted ? 0.55 : 1)};
    transition: opacity 0.15s ease;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 24px 72px 1fr;

    .price {
      grid-column: 3;
      text-align: left;
    }
  }
`;

const Thumb = styled(Link)`
  display: block;
  width: 96px;
  height: 96px;
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgSoft};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 72px;
    height: 72px;
  }
`;

const Info = styled.div`
  min-width: 0;

  .name {
    display: flex;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing(2)};
  }

  h3 {
    font-size: 0.98rem;
    font-weight: 600;
    line-height: 1.35;
  }

  h3 a {
    color: inherit;
    text-decoration: none;
  }

  h3 a:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  small {
    display: block;
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.textFaint};
    font-size: 0.82rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-top: ${({ theme }) => theme.spacing(3)};
  }
`;

const TrashButton = styled.button`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.textFaint};

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    background: ${({ theme }) => theme.colors.bgSoft};
  }
`;

const Price = styled.div`
  text-align: right;
  white-space: nowrap;

  strong {
    display: block;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.25rem;
  }

  small {
    display: block;
    margin-top: 2px;
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }
`;

const Summary = styled(Card).attrs({ $padding: 0 })`
  position: sticky;
  top: 120px;
  overflow: hidden;

  h2 {
    font-size: 1.05rem;
    padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(5)};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  .body {
    padding: ${({ theme }) => theme.spacing(5)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
  }
`;

const Line = styled.div<{ $positive?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: 0.92rem;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme, $positive }) => ($positive ? theme.colors.success : "inherit")};
`;

const LinkButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.88rem;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const InlineForm = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(3)};
`;

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: ${({ theme }) => theme.spacing(5)} 0;
  padding-top: ${({ theme }) => theme.spacing(5)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
`;

const Hint = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textFaint};
  margin-top: ${({ theme }) => theme.spacing(3)};
  line-height: 1.5;
`;

const Positive = styled.p`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.success};
  margin: -${({ theme }) => theme.spacing(3)} 0 ${({ theme }) => theme.spacing(4)};
  text-align: right;
`;

/** Etapa 1 da compra: o carrinho, com a escolha de quais produtos levar agora. */
export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    updateItem,
    selectItem,
    selectAll,
    removeItem,
    applyCoupon,
    removeCoupon,
    setShipping,
    zipCode,
    shippingMethod,
    registerEmptyCartView,
  } = useCart();

  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [zipOpen, setZipOpen] = useState(false);
  const [zipInput, setZipInput] = useState(maskZipCode(zipCode));
  const allRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && cart?.isEmpty) registerEmptyCartView();
  }, [loading, cart?.isEmpty, registerEmptyCartView]);

  const items = cart?.items ?? [];
  const selectedItems = items.filter((item) => item.selected);
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && !allSelected;

  // "Meio marcado" quando só parte dos produtos está selecionada
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someSelected;
  }, [someSelected]);

  if (loading) return <Loading label="Conferindo suas escolhas..." />;

  if (!cart || cart.isEmpty) {
    return (
      <Container>
        <EmptyState
          emoji="🛒"
          title="Carrinho vazio"
          description="Nada aqui. Abrir o carrinho vazio repetidas vezes não é compra, é um hábito. Mas a gente não julga (muito)."
        >
          <Button as={Link} to="/catalogo" style={{ textDecoration: "none" }}>
            Ver o catálogo
          </Button>
        </EmptyState>
      </Container>
    );
  }

  const { totals, shipping } = cart;
  const selectedCount = totals.selectedCount;

  return (
    <Section $tight>
      <Container>
        <CheckoutSteps current="carrinho" />

        <Layout>
          <div>
            <SelectAllRow>
              <Check>
                <input
                  ref={allRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => void selectAll(!allSelected)}
                  aria-label="Selecionar todos os produtos"
                />
                Todos os produtos
              </Check>
              <small>
                {totals.itemCount} {totals.itemCount === 1 ? "unidade" : "unidades"} no carrinho
              </small>
            </SelectAllRow>

            <Box>
              <ListHead>Produtos</ListHead>
              {items.map((item) => (
                <Row key={item.id} $muted={!item.selected}>
                  <Check style={{ marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => void selectItem(item.id, e.target.checked)}
                      aria-label={`Comprar agora: ${item.productName}`}
                    />
                  </Check>

                  <Thumb className="thumb" to={`/produto/${item.productSlug}`} tabIndex={-1} aria-hidden="true">
                    {item.imageUrl && <img src={item.imageUrl} alt="" width={96} height={96} loading="lazy" decoding="async" />}
                  </Thumb>

                  <Info className="info">
                    <div className="name">
                      <h3>
                        <Link to={`/produto/${item.productSlug}`}>{item.productName}</Link>
                      </h3>
                      <TrashButton type="button" onClick={() => void removeItem(item.id)} aria-label={`Remover ${item.productName}`} title="Remover">
                        <Icon name="trash" size={18} />
                      </TrashButton>
                    </div>
                    <small>
                      {item.categoryName} · {item.variantLabel}
                    </small>
                    {item.customText && <small>Texto: “{item.customText}”</small>}
                    <div className="controls">
                      <QuantityStepper value={item.quantity} onChange={(quantity) => void updateItem(item.id, quantity)} />
                    </div>
                  </Info>

                  <Price className="price">
                    <strong>{formatBRL(item.totalCents)}</strong>
                    {item.quantity > 1 && <small>{formatBRL(item.unitPriceCents)} cada</small>}
                  </Price>
                </Row>
              ))}
            </Box>
          </div>

          <Summary>
            <h2>Resumo da compra</h2>
            <div className="body">
              <Line>
                <span>
                  Produtos ({selectedCount})
                </span>
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
                  {shipping.selected
                    ? shipping.selected.priceCents === 0
                      ? "Grátis"
                      : formatBRL(shipping.selected.priceCents)
                    : "—"}
                </span>
              </Line>

              {/* Cálculo do frete pelo CEP */}
              {zipOpen || !shipping.selected ? (
                <InlineForm>
                  <Input
                    aria-label="CEP para calcular o frete"
                    inputMode="numeric"
                    placeholder="Seu CEP"
                    value={zipInput}
                    onChange={(e) => setZipInput(maskZipCode(e.target.value))}
                  />
                  <Button
                    $variant="secondary"
                    onClick={() => {
                      void setShipping(zipInput, shippingMethod);
                      setZipOpen(false);
                    }}
                    disabled={zipInput.replace(/\D/g, "").length !== 8}
                  >
                    Calcular
                  </Button>
                </InlineForm>
              ) : (
                <Hint style={{ marginTop: -6, marginBottom: 12 }}>
                  CEP {maskZipCode(shipping.zipCode ?? zipCode)} · {formatDeliveryEstimate(shipping.selected)} ·{" "}
                  <LinkButton type="button" onClick={() => setZipOpen(true)}>
                    alterar
                  </LinkButton>
                </Hint>
              )}

              {/* Cupom */}
              {cart.coupon ? (
                <Line>
                  <span>
                    Cupom <strong>{cart.coupon.code}</strong>
                  </span>
                  <LinkButton type="button" onClick={() => void removeCoupon()}>
                    remover
                  </LinkButton>
                </Line>
              ) : couponOpen ? (
                <InlineForm>
                  <Input
                    aria-label="Código do cupom"
                    placeholder="DOMINGO10"
                    value={couponInput}
                    autoFocus
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  />
                  <Button
                    $variant="secondary"
                    onClick={async () => {
                      if (await applyCoupon(couponInput)) {
                        setCouponInput("");
                        setCouponOpen(false);
                      }
                    }}
                    disabled={!couponInput.trim()}
                  >
                    Aplicar
                  </Button>
                </InlineForm>
              ) : (
                <LinkButton type="button" onClick={() => setCouponOpen(true)}>
                  <Icon name="plus" size={16} /> Inserir código do cupom
                </LinkButton>
              )}

              <Total>
                <span>Total</span>
                <span>{formatBRL(totals.totalCents)}</span>
              </Total>
              {totals.discountCents > 0 && <Positive>Você economiza {formatBRL(totals.discountCents)}</Positive>}

              <Button $size="lg" $full disabled={selectedCount === 0} onClick={() => navigate("/checkout")}>
                Continuar ({selectedCount})
              </Button>

              {selectedCount === 0 ? (
                <Hint>Marque os produtos que você quer levar agora.</Hint>
              ) : shipping.missingForFreeShippingCents > 0 ? (
                <Hint>
                  Faltam {formatBRL(shipping.missingForFreeShippingCents)} para frete grátis. Nada como uma compra por impulso bem
                  justificada.
                </Hint>
              ) : null}
              {selectedItems.length < items.length && selectedCount > 0 && (
                <Hint>Os produtos desmarcados continuam no carrinho para outra compra.</Hint>
              )}
            </div>
          </Summary>
        </Layout>
      </Container>
    </Section>
  );
}
