import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../contexts/CartContext";
import {
  Button,
  Card,
  Container,
  Divider,
  EmptyState,
  Input,
  Label,
  Loading,
  QuantityStepper,
  Section,
  Select,
} from "../components/ui";
import { formatBRL, maskZipCode } from "../utils/format";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: ${({ theme }) => theme.spacing(8)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const Row = styled(Card)`
  display: grid;
  grid-template-columns: 92px 1fr auto;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 72px 1fr;
  }
`;

const Thumb = styled.div`
  width: 92px;
  height: 92px;
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

const Details = styled.div`
  h3 {
    font-size: 1rem;
    margin-bottom: 3px;
  }

  small {
    display: block;
    color: ${({ theme }) => theme.colors.textFaint};
    font-size: 0.8rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-top: ${({ theme }) => theme.spacing(3)};
    flex-wrap: wrap;
  }
`;

const LineTotal = styled.div`
  text-align: right;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;

  small {
    display: block;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textFaint};
    font-weight: 400;
  }
`;

const Summary = styled(Card)`
  position: sticky;
  top: 120px;

  h2 {
    font-size: 1.2rem;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
  }
`;

const SummaryLine = styled.div<{ $strong?: boolean; $positive?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: ${({ $strong }) => ($strong ? "1.15rem" : "0.92rem")};
  font-weight: ${({ $strong }) => ($strong ? 700 : 400)};
  font-family: ${({ theme, $strong }) =>
    $strong ? theme.fonts.heading : theme.fonts.body};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.success : "inherit"};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const CouponRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Hint = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textFaint};
  margin-top: ${({ theme }) => theme.spacing(3)};
  line-height: 1.5;
`;

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
    setShipping,
    zipCode,
    shippingMethod,
    registerEmptyCartView,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [zipInput, setZipInput] = useState(maskZipCode(zipCode));

  useEffect(() => {
    if (!loading && cart?.isEmpty) registerEmptyCartView();
  }, [loading, cart?.isEmpty, registerEmptyCartView]);

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

  return (
    <Section $tight>
      <Container>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "28px" }}>
          Carrinho ({totals.itemCount}{" "}
          {totals.itemCount === 1 ? "item" : "itens"})
        </h1>

        <Layout>
          <Items>
            {cart.items.map((item) => (
              <Row key={item.id}>
                <Thumb>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.productName} />
                  )}
                </Thumb>

                <Details>
                  <h3>
                    <Link to={`/produto/${item.productSlug}`}>
                      {item.productName}
                    </Link>
                  </h3>
                  <small>{item.variantLabel}</small>
                  {item.customText && <small>Texto: “{item.customText}”</small>}
                  <div className="controls">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(quantity) =>
                        void updateItem(item.id, quantity)
                      }
                    />
                    <Button
                      $variant="ghost"
                      $size="sm"
                      onClick={() => void removeItem(item.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </Details>

                <LineTotal>
                  {formatBRL(item.totalCents)}
                  <small>{formatBRL(item.unitPriceCents)} cada</small>
                </LineTotal>
              </Row>
            ))}
          </Items>

          <Summary>
            <h2>Resumo</h2>

            <SummaryLine>
              <span>Subtotal</span>
              <span>{formatBRL(totals.subtotalCents)}</span>
            </SummaryLine>

            {totals.discountCents > 0 && (
              <SummaryLine $positive>
                <span>
                  Desconto {cart.coupon ? `(${cart.coupon.code})` : ""}
                </span>
                <span>−{formatBRL(totals.discountCents)}</span>
              </SummaryLine>
            )}

            <SummaryLine>
              <span>Frete</span>
              <span>
                {shipping.selected
                  ? shipping.selected.priceCents === 0
                    ? "Grátis"
                    : formatBRL(shipping.selected.priceCents)
                  : "Informe o CEP"}
              </span>
            </SummaryLine>

            <Divider />

            <SummaryLine $strong>
              <span>Total</span>
              <span>{formatBRL(totals.totalCents)}</span>
            </SummaryLine>

            <Label htmlFor="cart-zip">Calcular frete</Label>
            <CouponRow>
              <Input
                id="cart-zip"
                inputMode="numeric"
                placeholder="00000-000"
                value={zipInput}
                onChange={(e) => setZipInput(maskZipCode(e.target.value))}
              />
              <Button
                $variant="secondary"
                onClick={() => void setShipping(zipInput, shippingMethod)}
                disabled={zipInput.replace(/\D/g, "").length !== 8}
              >
                OK
              </Button>
            </CouponRow>

            {shipping.options.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <Label htmlFor="cart-shipping">Modalidade</Label>
                <Select
                  id="cart-shipping"
                  value={shippingMethod}
                  onChange={(e) =>
                    void setShipping(
                      zipInput,
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
                      · {option.estimatedDays} dias
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <Divider />

            <Label htmlFor="cart-coupon">Cupom</Label>
            {cart.coupon ? (
              <>
                <SummaryLine>
                  <span>
                    <strong>{cart.coupon.code}</strong>
                  </span>
                  <Button
                    $variant="ghost"
                    $size="sm"
                    onClick={() => void removeCoupon()}
                  >
                    remover
                  </Button>
                </SummaryLine>
                <Hint>{cart.coupon.description}</Hint>
              </>
            ) : (
              <CouponRow>
                <Input
                  id="cart-coupon"
                  placeholder="DOMINGO10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                />
                <Button
                  $variant="secondary"
                  onClick={async () => {
                    if (await applyCoupon(couponInput)) setCouponInput("");
                  }}
                  disabled={!couponInput.trim()}
                >
                  Aplicar
                </Button>
              </CouponRow>
            )}

            {shipping.missingForFreeShippingCents > 0 && (
              <Hint>
                Faltam {formatBRL(shipping.missingForFreeShippingCents)} para
                frete grátis. Nada como uma compra por impulso bem justificada.
              </Hint>
            )}

            <Button
              $size="lg"
              $full
              style={{ marginTop: "20px" }}
              onClick={() => navigate("/checkout")}
            >
              Fechar pedido
            </Button>

            <Hint>
              Você será redirecionado para o Mercado Pago. Não guardamos dados
              de cartão — não temos competência nem vontade para isso.
            </Hint>
          </Summary>
        </Layout>
      </Container>
    </Section>
  );
}
