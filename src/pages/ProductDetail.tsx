import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { catalogService } from "../services/catalog.service";
import { useCart } from "../contexts/CartContext";
import { cartService } from "../services/cart.service";
import { extractError } from "../services/http";
import { ProductCard, ProductGrid } from "../components/product/ProductCard";
import {
  Button,
  Container,
  Divider,
  EmptyState,
  HumorBadge,
  Input,
  Label,
  Loading,
  QuantityStepper,
  Section,
  SectionTitle,
} from "../components/ui";
import { formatBRL, maskZipCode } from "../utils/format";
import { formatDeliveryEstimate } from "../utils/shipping";
import type { Product, ProductImage, ProductVariant, ShippingOption } from "../types";
import { sortVariants, sortedOptionValues } from "../utils/variantOrder";
import { Seo, absoluteUrl } from "../components/seo/Seo";
import { Breadcrumb } from "../components/seo/Breadcrumb";
import { sizeGuideFor } from "../content/sizeGuide";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: ${({ theme }) => theme.spacing(10)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing(7)};
  }
`;

const Gallery = styled.div`
  position: sticky;
  top: 120px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
  }
`;

const MainImage = styled.div`
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Thumbs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const Thumb = styled.button<{ $active?: boolean }>`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
  border: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.border};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Info = styled.div`
  h1 {
    font-size: clamp(1.7rem, 3.5vw, 2.4rem);
    margin: ${({ theme }) => theme.spacing(3)} 0;
  }

  .short {
    font-size: 1.05rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  .price {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 2rem;
    margin: ${({ theme }) => theme.spacing(5)} 0
      ${({ theme }) => theme.spacing(1)};
  }

  .installment {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }

  .description {
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.94rem;
    line-height: 1.65;
  }
`;

const Specs = styled.details`
  margin-top: ${({ theme }) => theme.spacing(6)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing(4)};

  summary {
    cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
  }

  h3 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.textFaint};
    margin: ${({ theme }) => theme.spacing(4)} 0 ${({ theme }) => theme.spacing(2)};
  }

  li {
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.6;
    list-style: disc;
    margin-left: ${({ theme }) => theme.spacing(5)};
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }
`;

const OptionRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Option = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  min-width: 48px;
  padding: 9px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 0.88rem;
  font-weight: 600;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.bgSoft};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.accentText : theme.colors.text};
  opacity: ${({ $disabled }) => ($disabled ? 0.35 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition: ${({ theme }) => theme.transition};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const BuyRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const ShippingBox = styled.form`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};

  .row {
    display: flex;
    gap: ${({ theme }) => theme.spacing(2)};
    margin-top: ${({ theme }) => theme.spacing(2)};
  }

  .row input {
    flex: 1;
    min-width: 0;
  }

  ul {
    list-style: none;
    margin-top: ${({ theme }) => theme.spacing(3)};
    display: grid;
    gap: ${({ theme }) => theme.spacing(2)};
  }

  li {
    display: flex;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(3)};
    font-size: 0.88rem;
  }

  li small {
    display: block;
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.8rem;
  }

  .hint {
    margin-top: ${({ theme }) => theme.spacing(2)};
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }

  .error {
    margin-top: ${({ theme }) => theme.spacing(2)};
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.danger};
  }

  a {
    color: inherit;
  }
`;

const Facts = styled.ul`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.textSoft};

  li::before {
    content: "·";
    margin-right: ${({ theme }) => theme.spacing(2)};
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 800;
  }
`;

const imageIndexForColor = (images: ProductImage[], color?: string | null) =>
  Math.max(0, color ? images.findIndex((img) => img.color === color) : 0);

const unique = (values: (string | null | undefined)[]) =>
  Array.from(new Set(values.filter((v): v is string => Boolean(v))));

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { addItem, zipCode: savedZipCode, setShipping } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState<"cart" | "buy" | null>(null);
  const [zipInput, setZipInput] = useState(() => maskZipCode(savedZipCode));
  const [quote, setQuote] = useState<ShippingOption[] | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setImageIndex(0);
    setQuantity(1);

    void catalogService
      .bySlug(slug)
      .then((data) => {
        const variants = sortVariants(data.variants);
        setProduct({ ...data, variants });
        const first = variants[0];
        setSize(first?.size ?? null);
        setColor(first?.color ?? null);
        setImageIndex(imageIndexForColor(data.images, first?.color));
        setModel(first?.model ?? null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const sizes = useMemo(
    () => sortedOptionValues(product?.variants.map((v) => v.size) ?? []),
    [product],
  );
  const colors = useMemo(
    () => unique(product?.variants.map((v) => v.color) ?? []),
    [product],
  );
  const models = useMemo(
    () => sortedOptionValues(product?.variants.map((v) => v.model) ?? []),
    [product],
  );

  const selectedVariant = useMemo<ProductVariant | undefined>(() => {
    if (!product) return undefined;
    return (
      product.variants.find(
        (v) =>
          (sizes.length === 0 || v.size === size) &&
          (colors.length === 0 || v.color === color) &&
          (models.length === 0 || v.model === model),
      ) ?? product.variants[0]
    );
  }, [product, size, color, model, sizes.length, colors.length, models.length]);

  // Variante ou quantidade mudou: a cotação anterior não vale mais
  useEffect(() => {
    setQuote(null);
    setQuoteError("");
  }, [selectedVariant?.id, quantity]);

  if (loading) return <Loading label="Abrindo a gaveta..." />;

  if (notFound || !product) {
    return (
      <Container>
        <EmptyState
          emoji="🕳️"
          title="Esse produto não existe"
          description="Ou existiu e desistiu, como muita coisa. O catálogo continua aberto."
        >
          <Button as={Link} to="/catalogo" style={{ textDecoration: "none" }}>
            Voltar ao catálogo
          </Button>
        </EmptyState>
      </Container>
    );
  }

  const priceCents = selectedVariant?.priceCents ?? product.basePriceCents;
  const image = product.images[imageIndex] ?? product.images[0];

  // Escolher a cor leva a galeria para a foto dessa cor (trocar a foto não muda a cor)
  const selectColor = (value: string) => {
    setColor(value);
    const index = product.images.findIndex((img) => img.color === value);
    if (index >= 0) setImageIndex(index);
  };

  const handleAdd = async (mode: "cart" | "buy") => {
    if (!selectedVariant) return;
    setAdding(mode);
    const added = await addItem(selectedVariant.id, quantity, {
      silent: mode === "buy",
    });
    setAdding(null);
    // Comprar agora: o item já está no carrinho, segue direto para o checkout
    if (added && mode === "buy") navigate("/checkout");
  };

  const simulateShipping = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedVariant) return;
    const digits = zipInput.replace(/\D/g, "");
    if (digits.length !== 8) {
      setQuoteError("Informe um CEP com 8 dígitos.");
      setQuote(null);
      return;
    }
    setQuoting(true);
    setQuoteError("");
    try {
      const result = await cartService.quoteShipping({
        zipCode: digits,
        variantId: selectedVariant.id,
        quantity,
      });
      setQuote(result.options);
      // Guarda o CEP: carrinho e checkout já abrem com ele
      void setShipping(digits);
    } catch (error) {
      setQuote(null);
      setQuoteError(extractError(error));
    } finally {
      setQuoting(false);
    }
  };

  const guide = sizeGuideFor(product.category.slug);
  const availablePrices = product.variants.filter((v) => v.isAvailable !== false).map((v) => v.priceCents);
  const lowPrice = availablePrices.length ? Math.min(...availablePrices) : product.basePriceCents;
  const highPrice = availablePrices.length ? Math.max(...availablePrices) : product.basePriceCents;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: selectedVariant?.sku ?? product.slug,
    category: product.category.name,
    brand: { "@type": "Brand", name: "Roupa de Domingo" },
    image: product.images.map((img) => absoluteUrl(img.url)),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: (lowPrice / 100).toFixed(2),
      highPrice: (highPrice / 100).toFixed(2),
      offerCount: product.variants.length || 1,
      availability: availablePrices.length ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/produto/${product.slug}`),
    },
    ...(product.ratingCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.ratingCount } }
      : {}),
  };

  return (
    <Section $tight>
      <Seo
        title={product.name}
        description={product.shortDescription}
        path={`/produto/${product.slug}`}
        image={product.images[0]?.url}
        type="product"
        noindex={product.isSecret}
        jsonLd={productJsonLd}
      />
      <Container>
        <Breadcrumb
          items={[
            { label: "Início", to: "/" },
            { label: "Catálogo", to: "/catalogo" },
            { label: product.category.name, to: `/catalogo?category=${product.category.slug}` },
            { label: product.name, to: `/produto/${product.slug}` },
          ]}
        />

        <Layout>
          <Gallery>
            <MainImage>
              {image && (
                <img src={image.url} alt={image.alt || product.name} width={800} height={800} fetchPriority="high" />
              )}
            </MainImage>
            {product.images.length > 1 && (
              <Thumbs>
                {product.images.map((img, index) => (
                  <Thumb
                    key={img.url}
                    $active={index === imageIndex}
                    onClick={() => setImageIndex(index)}
                    aria-label={`Imagem ${index + 1}`}
                  >
                    <img src={img.url} alt={img.alt || `${product.name}, foto ${index + 1}`} width={120} height={120} loading="lazy" />
                  </Thumb>
                ))}
              </Thumbs>
            )}
          </Gallery>

          <Info>
            <HumorBadge humor={product.humor} />
            <h1>{product.name}</h1>
            <p className="short">{product.shortDescription}</p>

            <p className="price">{formatBRL(priceCents)}</p>
            {/* Sem "sem juros": o parcelamento é do Mercado Pago e pode ter juros, exibidos antes de pagar */}
            <p className="installment">
              Pix ou cartão em até 12x pelo Mercado Pago (juros do parcelamento, se houver, aparecem antes de você
              confirmar). <Link to="/pagamentos">Ver condições</Link>
            </p>

            <Divider />

            {sizes.length > 0 && (
              <OptionRow>
                <Label>Tamanho</Label>
                <Options>
                  {sizes.map((value) => (
                    <Option
                      key={value}
                      type="button"
                      $active={size === value}
                      onClick={() => setSize(value)}
                    >
                      {value}
                    </Option>
                  ))}
                </Options>
              </OptionRow>
            )}

            {colors.length > 0 && (
              <OptionRow>
                <Label>Cor</Label>
                <Options>
                  {colors.map((value) => (
                    <Option
                      key={value}
                      type="button"
                      $active={color === value}
                      onClick={() => selectColor(value)}
                    >
                      {value}
                    </Option>
                  ))}
                </Options>
              </OptionRow>
            )}

            {models.length > 0 && (
              <OptionRow>
                <Label>Modelo do aparelho</Label>
                <Options>
                  {models.map((value) => (
                    <Option
                      key={value}
                      type="button"
                      $active={model === value}
                      onClick={() => setModel(value)}
                    >
                      {value}
                    </Option>
                  ))}
                </Options>
              </OptionRow>
            )}

            <BuyRow>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={99}
              />
              <Button
                $size="lg"
                $variant="secondary"
                onClick={() => void handleAdd("cart")}
                disabled={adding !== null || !selectedVariant?.isAvailable}
              >
                {adding === "cart" ? "Adicionando..." : "Adicionar ao carrinho"}
              </Button>
              <Button
                $size="lg"
                onClick={() => void handleAdd("buy")}
                disabled={adding !== null || !selectedVariant?.isAvailable}
              >
                {adding === "buy" ? "Indo para o checkout..." : "Comprar agora"}
              </Button>
            </BuyRow>

            <ShippingBox onSubmit={simulateShipping} noValidate>
              <Label htmlFor="pdp-zip">Calcular frete e prazo</Label>
              <div className="row">
                <Input
                  id="pdp-zip"
                  inputMode="numeric"
                  placeholder="00000-000"
                  value={zipInput}
                  onChange={(e) => setZipInput(maskZipCode(e.target.value))}
                />
                <Button type="submit" $variant="secondary" disabled={quoting}>
                  {quoting ? "Calculando..." : "Calcular"}
                </Button>
              </div>
              {quoteError && <p className="error">{quoteError}</p>}
              {quote && (
                <ul>
                  {quote.map((option) => (
                    <li key={option.method}>
                      <span>
                        {option.label}
                        <small>{formatDeliveryEstimate(option)}</small>
                      </span>
                      <strong>
                        {option.priceCents === 0
                          ? "Grátis"
                          : formatBRL(option.priceCents)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
              {quote && (
                <p className="hint">
                  Para {quantity} {quantity === 1 ? "unidade" : "unidades"}. O
                  valor final é recalculado no carrinho.
                </p>
              )}
              <p className="hint">
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noreferrer"
                >
                  Não sei meu CEP
                </a>
              </p>
            </ShippingBox>

            <p className="description">{product.description}</p>

            {guide && (
              <Specs>
                <summary>{guide.kind === "apparel" ? "Medidas, composição e cuidados" : "Especificações e cuidados"}</summary>
                {guide.kind === "apparel" ? (
                  <>
                    <h3>Composição</h3>
                    <ul>
                      {guide.composition.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <h3>Especificações</h3>
                    <ul>
                      {guide.specs.map((spec) => (
                        <li key={spec.label}>
                          {spec.label}: {spec.value}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <h3>Cuidados</h3>
                <ul>
                  {guide.care.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>Cor</h3>
                <ul>
                  <li>A cor impressa pode variar levemente em relação à tela, conforme o monitor e a impressão.</li>
                </ul>
                <p style={{ marginTop: 12 }}>
                  <Link to="/guia-de-tamanhos">
                    {guide.kind === "apparel" ? "Ver a tabela de medidas completa" : "Ver o guia completo"}
                  </Link>
                </p>
              </Specs>
            )}

            <Divider />

            <Facts>
              <li>SKU {selectedVariant?.sku}</li>
              <li>Produção sob demanda em 2 a 4 dias úteis, mais o prazo de transporte</li>
              <li>Estampado e embalado por nós, enviado pelos Correios</li>
              <li>Pagamento processado pelo Mercado Pago</li>
              <li>
                ★ {product.rating.toFixed(1)} de {product.ratingCount}{" "}
                avaliações
              </li>
            </Facts>
          </Info>
        </Layout>

        {product.related && product.related.length > 0 && (
          <Section $tight>
            <SectionTitle>
              <div>
                <h2>Quem levou isso, levou também</h2>
                <p>Correlação não implica bom gosto.</p>
              </div>
            </SectionTitle>
            <ProductGrid>
              {product.related.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </ProductGrid>
          </Section>
        )}
      </Container>
    </Section>
  );
}
