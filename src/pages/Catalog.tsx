import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  catalogService,
  type ProductFilters,
} from "../services/catalog.service";
import { ProductCard, ProductGrid } from "../components/product/ProductCard";
import {
  Button,
  Container,
  EmptyState,
  Input,
  Label,
  Loading,
  Section,
  Select,
} from "../components/ui";
import { useDebouncedValue } from "../hooks/useEasterEggTriggers";
import { useEasterEggs } from "../contexts/EasterEggContext";
import type { Category, HumorOption, Paginated, Product } from "../types";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: ${({ theme }) => theme.spacing(8)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 120px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(6)};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
  }
`;

const FilterBlock = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Chip = styled.button<{ $active?: boolean }>`
  padding: 5px 11px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.border};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.accentText : theme.colors.textSoft};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accent : "transparent"};
  transition: ${({ theme }) => theme.transition};

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  flex-wrap: wrap;

  h1 {
    font-size: 1.7rem;
  }

  span {
    font-size: 0.86rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(10)};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSoft};
`;

const SORTS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "populares", label: "Mais populares" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "nome", label: "Nome (A-Z)" },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const { progress } = useEasterEggs();

  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [humors, setHumors] = useState<HumorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");

  const debouncedSearch = useDebouncedValue(searchInput, 450);

  const filters = useMemo<ProductFilters>(
    () => ({
      category: params.get("category") ?? undefined,
      humor: params.get("humor") ?? undefined,
      search: debouncedSearch || undefined,
      sort: params.get("sort") ?? "recentes",
      page: Number(params.get("page") ?? "1"),
      limit: 12,
      // só tem efeito no backend se o visitante achou easter eggs suficientes
      includeSecret: progress?.secretProductUnlocked ?? false,
    }),
    [params, debouncedSearch, progress?.secretProductUnlocked],
  );

  useEffect(() => {
    void Promise.all([
      catalogService.categories(),
      catalogService.humors(),
    ]).then(([cats, hums]) => {
      setCategories(cats);
      setHumors(hums);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    void catalogService
      .list(filters)
      .then(setData)
      .finally(() => setLoading(false));
  }, [filters]);

  const setParam = useCallback(
    (key: string, value?: string) => {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      setParams(next);
    },
    [params, setParams],
  );

  const activeCategory = params.get("category");
  const activeHumor = params.get("humor");
  const currentPage = Number(params.get("page") ?? "1");
  const hasFilters = Boolean(activeCategory || activeHumor || searchInput);

  return (
    <Section $tight>
      <Container>
        <Layout>
          <Sidebar>
            <FilterBlock>
              <Label htmlFor="catalog-search">Buscar</Label>
              <Input
                id="catalog-search"
                type="search"
                placeholder="frase, tag, produto..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </FilterBlock>

            <FilterBlock>
              <Label>Categoria</Label>
              <Chips>
                <Chip
                  $active={!activeCategory}
                  onClick={() => setParam("category", undefined)}
                >
                  Todas
                </Chip>
                {categories.map((category) => (
                  <Chip
                    key={category.slug}
                    $active={activeCategory === category.slug}
                    onClick={() => setParam("category", category.slug)}
                  >
                    {category.name}
                  </Chip>
                ))}
              </Chips>
            </FilterBlock>

            <FilterBlock>
              <Label>Tipo de humor</Label>
              <Chips>
                <Chip
                  $active={!activeHumor}
                  onClick={() => setParam("humor", undefined)}
                >
                  Qualquer
                </Chip>
                {humors.map((humor) => (
                  <Chip
                    key={humor.value}
                    $active={activeHumor === humor.value}
                    onClick={() => setParam("humor", humor.value)}
                    title={humor.description}
                  >
                    {humor.label}
                  </Chip>
                ))}
              </Chips>
            </FilterBlock>

            <FilterBlock>
              <Label htmlFor="catalog-sort">Ordenar por</Label>
              <Select
                id="catalog-sort"
                value={params.get("sort") ?? "recentes"}
                onChange={(e) => setParam("sort", e.target.value)}
              >
                {SORTS.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </Select>
            </FilterBlock>

            {hasFilters && (
              <Button
                $variant="ghost"
                $size="sm"
                $full
                onClick={() => {
                  setSearchInput("");
                  setParams(new URLSearchParams());
                }}
              >
                Limpar filtros
              </Button>
            )}
          </Sidebar>

          <div>
            <TopBar>
              <h1>
                {activeCategory
                  ? (categories.find((c) => c.slug === activeCategory)?.name ??
                    "Catálogo")
                  : "Catálogo completo"}
              </h1>
              {data && (
                <span>
                  {data.meta.total} produto{data.meta.total === 1 ? "" : "s"}
                </span>
              )}
            </TopBar>

            {loading ? (
              <Loading label="Filtrando sarcasmo..." />
            ) : data && data.items.length > 0 ? (
              <>
                <ProductGrid>
                  {data.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </ProductGrid>

                {data.meta.totalPages > 1 && (
                  <Pagination>
                    <Button
                      $variant="secondary"
                      $size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setParam("page", String(currentPage - 1))}
                    >
                      ← Anterior
                    </Button>
                    <span>
                      Página {data.meta.page} de {data.meta.totalPages}
                    </span>
                    <Button
                      $variant="secondary"
                      $size="sm"
                      disabled={!data.meta.hasNext}
                      onClick={() => setParam("page", String(currentPage + 1))}
                    >
                      Próxima →
                    </Button>
                  </Pagination>
                )}
              </>
            ) : (
              <EmptyState
                emoji="🔍"
                title="Nada encontrado"
                description="Nenhum produto combina com esses filtros. Talvez o problema seja a sua expectativa, não o nosso catálogo."
              >
                <Button
                  $variant="secondary"
                  onClick={() => {
                    setSearchInput("");
                    setParams(new URLSearchParams());
                  }}
                >
                  Limpar filtros
                </Button>
              </EmptyState>
            )}
          </div>
        </Layout>
      </Container>
    </Section>
  );
}
