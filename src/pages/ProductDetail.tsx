import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { catalogService } from "../services/catalog.service";
import { useCart } from "../contexts/CartContext";
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
import { formatBRL } from "../utils/format";
import type { Product, ProductVariant } from "../types";

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

const Breadcrumb = styled.nav`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textFaint};
  margin-bottom: ${({ theme }) => theme.spacing(6)};

  a:hover {
    color: ${({ theme }) => theme.colors.accent};
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

const unique = (values: (string | null | undefined)[]) =>
  Array.from(new Set(values.filter((v): v is string => Boolean(v))));

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setImageIndex(0);
    setQuantity(1);

    void catalogService
      .bySlug(slug)
      .then((data) => {
        setProduct(data);
        const first = data.variants[0];
        setSize(first?.size ?? null);
        setColor(first?.color ?? null);
        setModel(first?.model ?? null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const sizes = useMemo(
    () => unique(product?.variants.map((v) => v.size) ?? []),
    [product],
  );
  const colors = useMemo(
    () => unique(product?.variants.map((v) => v.color) ?? []),
    [product],
  );
  const models = useMemo(
    () => unique(product?.variants.map((v) => v.model) ?? []),
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

  const handleAdd = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    await addItem(selectedVariant.id, quantity, customText || undefined);
    setAdding(false);
  };

  return (
    <Section $tight>
      <Container>
        <Breadcrumb>
          <Link to="/">Início</Link> / <Link to="/catalogo">Catálogo</Link> /{" "}
          <Link to={`/catalogo?category=${product.category.slug}`}>
            {product.category.name}
          </Link>
        </Breadcrumb>

        <Layout>
          <Gallery>
            <MainImage>
              {image && <img src={image.url} alt={image.alt} />}
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
                    <img src={img.url} alt={img.alt} />
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
            <p className="installment">
              em até 6x de {formatBRL(Math.ceil(priceCents / 6))} sem juros no
              Mercado Pago
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
                      onClick={() => setColor(value)}
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

            <OptionRow>
              <Label htmlFor="custom-text">
                Texto personalizado (opcional, até 60 caracteres)
              </Label>
              <Input
                id="custom-text"
                maxLength={60}
                placeholder="Algo que você vai se arrepender de estampar"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </OptionRow>

            <BuyRow>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={99}
              />
              <Button
                $size="lg"
                onClick={handleAdd}
                disabled={adding || !selectedVariant?.isAvailable}
              >
                {adding ? "Adicionando..." : "Adicionar ao carrinho"}
              </Button>
            </BuyRow>

            <p className="description">{product.description}</p>

            <Divider />

            <Facts>
              <li>SKU {selectedVariant?.sku}</li>
              <li>Produção sob demanda em 2 a 4 dias úteis</li>
              <li>Enviado direto pela estamparia parceira</li>
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
