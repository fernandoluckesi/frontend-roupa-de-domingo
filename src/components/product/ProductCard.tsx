import { Link } from "react-router-dom";
import styled from "styled-components";
import { HumorBadge } from "../ui/Badge";
import { formatBRL } from "../../utils/format";
import type { Product } from "../../types";

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  transition: ${({ theme }) => theme.transition};

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.bgSoft};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 320ms ease;
  }

  ${Card}:hover & img {
    transform: scale(1.04);
  }
`;

const Flag = styled.span`
  position: absolute;
  top: ${({ theme }) => theme.spacing(3)};
  left: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 9px;
  border-radius: ${({ theme }) => theme.radius.sm};
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;

  h3 {
    font-size: 1rem;
    line-height: 1.3;
  }

  p {
    font-size: 0.84rem;
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.4;
    flex: 1;
  }
`;

const Price = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};

  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.15rem;
  }

  small {
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }
`;

export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce(
    (min, v) => Math.min(min, v.priceCents),
    product.basePriceCents,
  );

  return (
    <Card to={`/produto/${product.slug}`}>
      <Thumb>
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            loading="lazy"
            decoding="async"
            width={600}
            height={600}
          />
        ) : null}
        {product.isSecret && <Flag>secreto</Flag>}
        {!product.isSecret && product.isFeatured && <Flag>destaque</Flag>}
      </Thumb>

      <Body>
        <HumorBadge humor={product.humor} />
        <h3>{product.name}</h3>
        <p>{product.shortDescription}</p>
        <Price>
          <strong>{formatBRL(cheapest)}</strong>
          <small>
            ★ {product.rating.toFixed(1)} ({product.ratingCount})
          </small>
        </Price>
      </Body>
    </Card>
  );
}

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(238px, 1fr));
  gap: ${({ theme }) => theme.spacing(5)};
`;
