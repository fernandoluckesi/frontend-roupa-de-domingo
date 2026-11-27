import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../ui/Button";
import { Input, Select } from "../ui/Form";
import { QuantityStepper } from "../ui/QuantityStepper";
import { Icon } from "../ui/Icon";
import { useCart } from "../../contexts/CartContext";
import { useCartDrawer } from "../../contexts/CartDrawerContext";
import { catalogService } from "../../services/catalog.service";
import { formatBRL, maskZipCode } from "../../utils/format";
import { formatDeliveryEstimate } from "../../utils/shipping";
import { sortVariants } from "../../utils/variantOrder";
import type { Product, ProductVariant } from "../../types";

const MAX_INSTALLMENTS = 12;

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 310;
  background: ${({ theme }) => theme.colors.overlay};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: opacity 0.2s ease;
`;

const Drawer = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 311;
  width: min(94vw, 440px);
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bg};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  transform: translateX(${({ $open }) => ($open ? "0" : "100%")});
  visibility: ${({ $open }) => ($open ? "visible" : "hidden")};
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.25s;
`;

const Head = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(5)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h2 {
    font-size: 1.15rem;
  }

  .close {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 50%;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  .close:hover {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Scroll = styled.div`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: ${({ theme }) => theme.spacing(5)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const Item = styled.article`
  display: grid;
  grid-template-columns: 76px 1fr auto;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: start;
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }

  .thumb {
    width: 76px;
    height: 76px;
    border-radius: ${({ theme }) => theme.radius.md};
    overflow: hidden;
    background: ${({ theme }) => theme.colors.bgSoft};
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  h3 {
    font-size: 0.95rem;
    line-height: 1.3;
  }

  .variant {
    display: block;
    margin-top: 2px;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }

  .line {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-top: ${({ theme }) => theme.spacing(3)};
    flex-wrap: wrap;
  }

  .price {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.02rem;
  }

  .unit {
    display: block;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.74rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textFaint};
  }

  .remove {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: ${({ theme }) => theme.radius.md};
    color: ${({ theme }) => theme.colors.textFaint};
  }

  .remove:hover {
    color: ${({ theme }) => theme.colors.danger};
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const CrossSell = styled.section`
  padding-top: ${({ theme }) => theme.spacing(4)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  h3 {
    font-size: 0.74rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  .nav {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }

  .nav button {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  .nav button:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }

  .nav button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Offer = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: center;
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};

  .thumb {
    width: 64px;
    height: 64px;
    border-radius: ${({ theme }) => theme.radius.sm};
    overflow: hidden;
    background: ${({ theme }) => theme.colors.bgSoft};
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  h4 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 0.92rem;
    line-height: 1.25;
  }

  strong {
    display: block;
    margin-top: 2px;
    font-size: 0.95rem;
  }

  .pick {
    display: flex;
    gap: ${({ theme }) => theme.spacing(2)};
    margin-top: ${({ theme }) => theme.spacing(2)};
  }

  .pick select {
    padding: 7px 30px 7px 10px;
    font-size: 0.85rem;
  }

  .add {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
  }

  .add:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentDark};
  }

  .add:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Foot = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgSoft};
  padding: ${({ theme }) => theme.spacing(5)};
`;

const ShippingToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  font-size: 0.92rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  svg:last-child {
    margin-left: auto;
    color: ${({ theme }) => theme.colors.textSoft};
  }
`;

const ShippingBox = styled.div`
  margin-top: ${({ theme }) => theme.spacing(3)};

  .row {
    display: flex;
    gap: ${({ theme }) => theme.spacing(2)};
  }

  ul {
    margin-top: ${({ theme }) => theme.spacing(3)};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }
`;

const Totals = styled.div`
  margin: ${({ theme }) => theme.spacing(4)} 0
    ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  .total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(3)};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.35rem;
  }

  .before {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.9rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textFaint};
    text-decoration: line-through;
    margin-right: ${({ theme }) => theme.spacing(2)};
  }

  .saving {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    margin-top: ${({ theme }) => theme.spacing(1)};
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.success};
  }

  .installment {
    margin-top: 2px;
    text-align: right;
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  .shippingLine {
    display: flex;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Empty = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  padding: ${({ theme }) => theme.spacing(8)};

  .emoji {
    font-size: 2.4rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.5;
  }
`;

const variantLabel = (variant: ProductVariant) =>
  [variant.size, variant.color, variant.model].filter(Boolean).join(" · ") ||
  variant.sku;

/**
 * Gaveta do carrinho: abre ao adicionar um item e resume a compra sem tirar a
 * pessoa da página. Itens com quantidade e remoção, sugestões de produto,
 * cálculo de prazo e os dois caminhos possíveis (fechar ou continuar).
 */
export function CartDrawer() {
  const { open, closeCart } = useCartDrawer();
  const {
    cart,
    addItem,
    updateItem,
    removeItem,
    setShipping,
    zipCode,
    shippingMethod,
  } = useCart();
  const navigate = useNavigate();

  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const [offers, setOffers] = useState<Product[]>([]);
  const [offerIndex, setOfferIndex] = useState(0);
  const [offerVariant, setOfferVariant] = useState<Record<string, string>>({});
  const [addingOffer, setAddingOffer] = useState<string | null>(null);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [zipInput, setZipInput] = useState(maskZipCode(zipCode));

  // Ao abrir: foco no fechar, Esc fecha, página de trás não rola
  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
  }, [open, closeCart]);

  // Sugestões carregam uma vez, na primeira abertura
  useEffect(() => {
    if (!open || offers.length) return;
    void catalogService
      .featured()
      .then(setOffers)
      .catch(() => setOffers([]));
  }, [open, offers.length]);

  const inCart = useMemo(
    () => new Set(cart?.items.map((item) => item.productId) ?? []),
    [cart],
  );

  const suggestions = useMemo(
    () => offers.filter((product) => !inCart.has(product.id)),
    [offers, inCart],
  );

  const offer = suggestions[Math.min(offerIndex, suggestions.length - 1)];

  const offerVariants = useMemo(
    () =>
      offer
        ? sortVariants(
            offer.variants.filter((variant) => variant.isAvailable !== false),
          )
        : [],
    [offer],
  );

  const selectedOfferVariant = offer
    ? (offerVariants.find((v) => v.id === offerVariant[offer.id]) ??
      offerVariants[0])
    : undefined;

  const addOffer = async () => {
    if (!offer || !selectedOfferVariant) return;
    setAddingOffer(offer.id);
    await addItem(selectedOfferVariant.id, 1);
    setAddingOffer(null);
    setOfferIndex(0);
  };

  const isEmpty = !cart || cart.isEmpty;
  const totals = cart?.totals;
  const shipping = cart?.shipping;
  const beforeDiscountCents =
    (totals?.subtotalCents ?? 0) + (totals?.shippingCents ?? 0);
  const installmentCents = Math.round(
    (totals?.totalCents ?? 0) / MAX_INSTALLMENTS,
  );

  return createPortal(
    <>
      <Overlay $open={open} onClick={closeCart} aria-hidden="true" />
      <Drawer
        $open={open}
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
        aria-hidden={!open}
      >
        <Head>
          <h2>
            Carrinho de compras
            {totals?.itemCount ? ` (${totals.itemCount})` : ""}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="close"
            onClick={closeCart}
            aria-label="Fechar carrinho"
          >
            <Icon name="close" size={24} />
          </button>
        </Head>

        {isEmpty ? (
          <Empty>
            <span className="emoji" aria-hidden="true">
              🛒
            </span>
            <h3>Carrinho vazio</h3>
            <p>
              Nada aqui ainda. O catálogo continua aberto e cheio de decisões
              questionáveis.
            </p>
            <Button as={Link} to="/catalogo" onClick={closeCart}>
              Ver o catálogo
            </Button>
          </Empty>
        ) : (
          <>
            <Scroll>
              {cart.items.map((item) => (
                <Item key={item.id} style={item.selected ? undefined : { opacity: 0.55 }}>
                  <div className="thumb">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        width={76}
                        height={76}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>

                  <div>
                    <h3>
                      <Link
                        to={`/produto/${item.productSlug}`}
                        onClick={closeCart}
                      >
                        {item.productName}
                      </Link>
                    </h3>
                    <small className="variant">{item.variantLabel}</small>
                    {!item.selected && (
                      <small className="variant">Desmarcado: fica no carrinho, fora desta compra</small>
                    )}
                    {item.customText && (
                      <small className="variant">
                        Texto: “{item.customText}”
                      </small>
                    )}
                    <div className="line">
                      <span className="price">
                        {formatBRL(item.totalCents)}
                        <small className="unit">
                          {formatBRL(item.unitPriceCents)} cada
                        </small>
                      </span>
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(quantity) =>
                          void updateItem(item.id, quantity)
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove"
                    onClick={() => void removeItem(item.id)}
                    aria-label={`Remover ${item.productName}`}
                  >
                    <Icon name="trash" size={20} />
                  </button>
                </Item>
              ))}

              {offer && (
                <CrossSell aria-label="Sugestões">
                  <div className="head">
                    <h3>Aproveite e leve também</h3>
                    <div className="nav">
                      <button
                        type="button"
                        onClick={() => setOfferIndex((i) => i - 1)}
                        disabled={offerIndex === 0}
                        aria-label="Sugestão anterior"
                      >
                        <Icon name="chevronLeft" size={18} />
                      </button>
                      <span aria-hidden="true">
                        {Math.min(offerIndex, suggestions.length - 1) + 1}/
                        {suggestions.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOfferIndex((i) => i + 1)}
                        disabled={offerIndex >= suggestions.length - 1}
                        aria-label="Próxima sugestão"
                      >
                        <Icon name="chevronRight" size={18} />
                      </button>
                    </div>
                  </div>

                  <Offer>
                    <Link
                      to={`/produto/${offer.slug}`}
                      className="thumb"
                      onClick={closeCart}
                    >
                      {offer.images[0] && (
                        <img
                          src={offer.images[0].url}
                          alt={offer.images[0].alt || offer.name}
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </Link>
                    <div>
                      <h4>
                        <Link to={`/produto/${offer.slug}`} onClick={closeCart}>
                          {offer.name}
                        </Link>
                      </h4>
                      <strong>
                        {formatBRL(
                          selectedOfferVariant?.priceCents ??
                            offer.basePriceCents,
                        )}
                      </strong>
                      <div className="pick">
                        {offerVariants.length > 1 && (
                          <Select
                            value={selectedOfferVariant?.id ?? ""}
                            onChange={(e) =>
                              setOfferVariant((current) => ({
                                ...current,
                                [offer.id]: e.target.value,
                              }))
                            }
                            aria-label={`Opção de ${offer.name}`}
                          >
                            {offerVariants.map((variant) => (
                              <option key={variant.id} value={variant.id}>
                                {variantLabel(variant)}
                              </option>
                            ))}
                          </Select>
                        )}
                        <button
                          type="button"
                          className="add"
                          onClick={() => void addOffer()}
                          disabled={
                            !selectedOfferVariant || addingOffer === offer.id
                          }
                          aria-label={`Adicionar ${offer.name} ao carrinho`}
                        >
                          <Icon name="plus" size={20} />
                        </button>
                      </div>
                    </div>
                  </Offer>
                </CrossSell>
              )}
            </Scroll>

            <Foot>
              <ShippingToggle
                type="button"
                onClick={() => setShippingOpen((value) => !value)}
                aria-expanded={shippingOpen}
                aria-controls="cart-drawer-shipping"
              >
                <Icon name="truck" size={20} />
                Calcular prazo de entrega
                <Icon name={shippingOpen ? "close" : "plus"} size={18} />
              </ShippingToggle>

              {shippingOpen && (
                <ShippingBox id="cart-drawer-shipping">
                  <div className="row">
                    <Input
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={zipInput}
                      onChange={(e) => setZipInput(maskZipCode(e.target.value))}
                      aria-label="CEP"
                    />
                    <Button
                      $variant="secondary"
                      onClick={() => void setShipping(zipInput, shippingMethod)}
                      disabled={zipInput.replace(/\D/g, "").length !== 8}
                    >
                      OK
                    </Button>
                  </div>
                  {shipping && shipping.options.length > 0 && (
                    <ul>
                      {shipping.options.map((option) => (
                        <li key={option.method}>
                          {option.label} ·{" "}
                          {option.priceCents === 0
                            ? "grátis"
                            : formatBRL(option.priceCents)}{" "}
                          · {formatDeliveryEstimate(option)}
                        </li>
                      ))}
                    </ul>
                  )}
                </ShippingBox>
              )}

              <Totals>
                {shipping?.selected && (
                  <div className="shippingLine">
                    <span>Frete ({shipping.selected.label})</span>
                    <span>
                      {shipping.selected.priceCents === 0
                        ? "Grátis"
                        : formatBRL(shipping.selected.priceCents)}
                    </span>
                  </div>
                )}

                <div className="total">
                  <span>Total</span>
                  <span>
                    {(totals?.discountCents ?? 0) > 0 && (
                      <span className="before">
                        {formatBRL(beforeDiscountCents)}
                      </span>
                    )}
                    {formatBRL(totals?.totalCents ?? 0)}
                  </span>
                </div>

                {(totals?.discountCents ?? 0) > 0 && (
                  <p className="saving">
                    ✓ Você está economizando{" "}
                    <strong>{formatBRL(totals?.discountCents ?? 0)}</strong>
                  </p>
                )}

                <p className="installment">
                  ou até {MAX_INSTALLMENTS}x de {formatBRL(installmentCents)} no
                  cartão
                </p>
              </Totals>

              <Actions>
                <Button
                  $size="lg"
                  $full
                  onClick={() => {
                    closeCart();
                    // Etapa 1: o carrinho, onde a pessoa escolhe o que levar agora
                    navigate("/carrinho");
                  }}
                >
                  Finalizar compra
                </Button>
                <Button $variant="secondary" $full onClick={closeCart}>
                  Continuar gastando
                </Button>
              </Actions>
            </Foot>
          </>
        )}
      </Drawer>
    </>,
    document.body,
  );
}
