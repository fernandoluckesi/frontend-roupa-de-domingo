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
import { useAlert } from "../hooks/useAlert";
import { useEasterEggs } from "../contexts/EasterEggContext";
import { openMobileMenu } from "../components/layout/Header";
import { Icon } from "../components/ui/Icon";
import type {
  Category,
  GenderOption,
  HumorOption,
  Paginated,
  Product,
} from "../types";

/**
 * Opção que não corresponde a nenhum valor do enum Gender do backend: existe
 * só para abrir o aviso e devolver a seleção para "Qualquer".
 */
const TODES = "TODES";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: ${({ theme }) => theme.spacing(8)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

// Rola junto com a página (sem sticky)
const Sidebar = styled.aside`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(6)};

  /* Mobile: busca fica no header, filtros no menu lateral e ordenação na barra do catálogo */
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobileTools = styled.div`
  display: none;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  select {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;

const FilterBlock = styled.div<{ $desktopOnly?: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing(6)};

  &:last-child {
    margin-bottom: 0;
  }

  /* No mobile, categoria e humor ficam no menu lateral (botão "Filtrar") */
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: ${({ $desktopOnly }) => ($desktopOnly ? "none" : "block")};
  }
`;

const FilterButton = styled.button`
  display: none;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: 9px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 0.9rem;
  font-weight: 600;

  .count {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
    font-size: 0.72rem;
    font-weight: 800;
    display: grid;
    place-items: center;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: inline-flex;
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

const ClearLink = styled.button`
  display: block;
  margin: -${({ theme }) => theme.spacing(1)} 0
    ${({ theme }) => theme.spacing(3)};
  padding: 0;
  background: none;
  border: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:disabled {
    color: ${({ theme }) => theme.colors.textFaint};
    text-decoration: none;
    cursor: default;
  }
`;

const Results = styled.div<{ $busy: boolean }>`
  opacity: ${({ $busy }) => ($busy ? 0.55 : 1)};
  transition: opacity 0.15s ease;
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

const readList = (params: URLSearchParams, key: string) =>
  (params.get(key) ?? "").split(",").filter(Boolean);

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const { progress } = useEasterEggs();

  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [humors, setHumors] = useState<HumorOption[]>([]);
  const [genders, setGenders] = useState<GenderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const { alert, alertElement } = useAlert();

  const debouncedSearch = useDebouncedValue(searchInput, 450);

  const filters = useMemo<ProductFilters>(
    () => ({
      category: params.get("category") ?? undefined,
      humor: params.get("humor") ?? undefined, // listas separadas por vírgula
      // UNISSEX é o "qualquer": não vai para a API, senão esconderia as peças
      // com modelagem masculina e feminina.
      gender: params.get("gender") ?? undefined,
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
      catalogService.genders(),
    ]).then(([cats, hums, gens]) => {
      setCategories(cats);
      setHumors(hums);
      setGenders(gens);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    void catalogService
      .list(filters)
      .then(setData)
      .finally(() => setLoading(false));
  }, [filters]);

  // Atualização funcional: cliques seguidos não se sobrescrevem
  const updateParam = useCallback(
    (key: string, compute: (current: string[]) => string[]) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        const value = compute(readList(prev, key)).join(",");
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.delete("page");
        return next;
      });
    },
    [setParams],
  );

  const setParam = useCallback(
    (key: string, value?: string) =>
      updateParam(key, () => (value ? [value] : [])),
    [updateParam],
  );

  // Chip de múltipla escolha: liga/desliga o valor sem mexer nos outros
  const toggleParam = (key: string, value: string) =>
    updateParam(key, (current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  const activeCategories = readList(params, "category");
  const activeHumors = readList(params, "humor");
  // Escolha única: sem parâmetro na URL significa "Qualquer".
  const activeGender = params.get("gender") ?? "UNISSEX";
  const currentPage = Number(params.get("page") ?? "1");
  const hasFilters = Boolean(
    activeCategories.length ||
    activeHumors.length ||
    params.get("gender") ||
    searchInput,
  );

  // Gênero conta como 1 filtro quando não está em "Qualquer".
  const mobileFilterCount =
    activeCategories.length +
    activeHumors.length +
    (params.get("gender") ? 1 : 0);

  const selectGender = useCallback(
    (value: string) => {
      if (value === TODES) {
        alert({
          title: "Calma lá",
          message: "Desde quando Todes é um genêro? Eu hein...",
          // Cai em "Qualquer", que mostra as peças de todos os públicos.
          onClose: () => setParam("gender", undefined),
        });
        return;
      }
      // "Qualquer" sai da URL: filtro ausente já devolve o catálogo inteiro.
      setParam("gender", value === "UNISSEX" ? undefined : value);
    },
    [alert, setParam],
  );

  return (
    <Section $tight>
      {alertElement}
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

            <FilterBlock $desktopOnly>
              <Label>Categoria</Label>
              <ClearLink
                type="button"
                disabled={activeCategories.length === 0}
                onClick={() => setParam("category", undefined)}
              >
                Limpar categorias
              </ClearLink>
              <Chips>
                <Chip
                  type="button"
                  aria-pressed={activeCategories.length === 0}
                  $active={activeCategories.length === 0}
                  onClick={() => setParam("category", undefined)}
                >
                  Todas
                </Chip>
                {categories.map((category) => (
                  <Chip
                    key={category.slug}
                    type="button"
                    aria-pressed={activeCategories.includes(category.slug)}
                    $active={activeCategories.includes(category.slug)}
                    onClick={() => toggleParam("category", category.slug)}
                  >
                    {category.name}
                  </Chip>
                ))}
              </Chips>
            </FilterBlock>

            <FilterBlock $desktopOnly>
              <Label>Tipo de humor</Label>
              <ClearLink
                type="button"
                disabled={activeHumors.length === 0}
                onClick={() => setParam("humor", undefined)}
              >
                Limpar tipos de humor
              </ClearLink>
              <Chips>
                <Chip
                  type="button"
                  aria-pressed={activeHumors.length === 0}
                  $active={activeHumors.length === 0}
                  onClick={() => setParam("humor", undefined)}
                >
                  Qualquer
                </Chip>
                {humors.map((humor) => (
                  <Chip
                    key={humor.value}
                    type="button"
                    aria-pressed={activeHumors.includes(humor.value)}
                    $active={activeHumors.includes(humor.value)}
                    onClick={() => toggleParam("humor", humor.value)}
                    title={humor.description}
                  >
                    {humor.label}
                  </Chip>
                ))}
              </Chips>
            </FilterBlock>

            <FilterBlock $desktopOnly>
              <Label>Gênero</Label>
              <Chips role="radiogroup" aria-label="Gênero">
                {genders.map((gender) => (
                  <Chip
                    key={gender.value}
                    type="button"
                    role="radio"
                    aria-checked={activeGender === gender.value}
                    $active={activeGender === gender.value}
                    onClick={() => selectGender(gender.value)}
                    title={gender.description}
                  >
                    {gender.label}
                  </Chip>
                ))}
                <Chip
                  type="button"
                  role="radio"
                  aria-checked={false}
                  onClick={() => selectGender(TODES)}
                >
                  Todes
                </Chip>
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
                {activeCategories.length === 1
                  ? (categories.find((c) => c.slug === activeCategories[0])
                      ?.name ?? "Catálogo")
                  : activeCategories.length > 1
                    ? "Catálogo filtrado"
                    : "Catálogo completo"}
              </h1>
              {data && (
                <span>
                  {data.meta.total} produto{data.meta.total === 1 ? "" : "s"}
                </span>
              )}
              <MobileTools>
                <FilterButton
                  type="button"
                  onClick={() => openMobileMenu("filters")}
                >
                  <Icon name="filter" size={18} />
                  Filtrar
                  {mobileFilterCount > 0 && (
                    <span className="count">{mobileFilterCount}</span>
                  )}
                </FilterButton>
                <Select
                  aria-label="Ordenar por"
                  value={params.get("sort") ?? "recentes"}
                  onChange={(e) => setParam("sort", e.target.value)}
                >
                  {SORTS.map((sort) => (
                    <option key={sort.value} value={sort.value}>
                      {sort.label}
                    </option>
                  ))}
                </Select>
              </MobileTools>
            </TopBar>

            {loading && !data ? (
              <Loading label="Filtrando sarcasmo..." />
            ) : data && data.items.length > 0 ? (
              <Results $busy={loading} aria-busy={loading}>
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
              </Results>
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
