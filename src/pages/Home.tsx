import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { catalogService } from "../services/catalog.service";
import { ProductCard, ProductGrid } from "../components/product/ProductCard";
import {
  Button,
  Container,
  Loading,
  Section,
  SectionTitle,
} from "../components/ui";
import { useEasterEggs } from "../contexts/EasterEggContext";
import type { Category, Product } from "../types";

const Hero = styled.section`
  padding: ${({ theme }) => theme.spacing(20)} 0
    ${({ theme }) => theme.spacing(16)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h1 {
    font-size: clamp(2.3rem, 6vw, 4.2rem);
    max-width: 20ch;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }

  mark {
    background: none;
    color: ${({ theme }) => theme.colors.accent};
  }

  p {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: ${({ theme }) => theme.colors.textSoft};
    max-width: 56ch;
    margin-bottom: ${({ theme }) => theme.spacing(8)};
  }
`;

const HeroActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const CategoryCard = styled(Link)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(7)};
  transition: ${({ theme }) => theme.transition};

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-2px);
  }

  span {
    font-size: 1.9rem;
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  h3 {
    font-size: 1.1rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    font-size: 0.86rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  small {
    display: block;
    margin-top: ${({ theme }) => theme.spacing(3)};
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }
`;

const EggStrip = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(7)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(6)};
  flex-wrap: wrap;

  h3 {
    font-size: 1.25rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.92rem;
    max-width: 60ch;
  }
`;

export default function Home() {
  const { progress } = useEasterEggs();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([catalogService.featured(), catalogService.categories()])
      .then(([products, cats]) => {
        setFeatured(products);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero>
        <Container>
          <h1>
            Roupa que diz <mark>o que você não diz</mark> em voz alta.
          </h1>
          <p>
            Camisetas, moletons, canecas e garrafas com estampas de humor de
            péssima qualidade. Compre hoje e não se arrependa amanhã. Deixe para
            se arrepender quando chegar na tua casa
          </p>
          <HeroActions>
            <Button
              as={Link}
              to="/catalogo"
              $size="lg"
              style={{ textDecoration: "none" }}
            >
              Ver o catálogo
            </Button>
            <Button
              as={Link}
              to="/trofeus"
              $variant="secondary"
              $size="lg"
              style={{ textDecoration: "none" }}
            >
              {progress
                ? `Troféus ${progress.found}/${progress.total}`
                : "Caçar easter eggs"}
            </Button>
          </HeroActions>
        </Container>
      </Hero>

      <Section>
        <Container>
          <SectionTitle>
            <div>
              <h2>Mais vendidos</h2>
              <p>
                O que as pessoas compram quando desistem de explicar seus
                sentimentos com palavras próprias.
              </p>
            </div>
            <Button
              as={Link}
              to="/catalogo"
              $variant="ghost"
              style={{ textDecoration: "none" }}
            >
              Ver tudo →
            </Button>
          </SectionTitle>

          {loading ? (
            <Loading label="Buscando estampas..." />
          ) : (
            <ProductGrid>
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          )}
        </Container>
      </Section>

      <Section $tight>
        <Container>
          <SectionTitle>
            <div>
              <h2>Por categoria</h2>
              <p>Escolha o suporte físico do seu sarcasmo.</p>
            </div>
          </SectionTitle>

          <CategoryGrid>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                to={`/catalogo?category=${category.slug}`}
              >
                <span role="img" aria-hidden="true">
                  {category.emoji}
                </span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <small>{category._count?.products ?? 0} produtos</small>
              </CategoryCard>
            ))}
          </CategoryGrid>
        </Container>
      </Section>

      <Section $tight>
        <Container>
          <EggStrip>
            <div>
              <h3>Existem 8 easter eggs escondidos nesta loja</h3>
              <p>
                Alguns liberam cupom de verdade. Nenhum deles aparece em menu.
                Dica gratuita: códigos de videogame dos anos 80 ainda funcionam
                em 2026.
              </p>
            </div>
            <Button
              as={Link}
              to="/trofeus"
              $variant="secondary"
              style={{ textDecoration: "none" }}
            >
              {progress
                ? `${progress.found} de ${progress.total} encontrados`
                : "Ver progresso"}
            </Button>
          </EggStrip>
        </Container>
      </Section>
    </>
  );
}
