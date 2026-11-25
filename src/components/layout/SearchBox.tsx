import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Input } from "../ui/Form";
import { Icon } from "../ui/Icon";
import { catalogService, type SearchSuggestion } from "../../services/catalog.service";
import { useDebouncedValue } from "../../hooks/useEasterEggTriggers";
import { formatBRL } from "../../utils/format";

const Form = styled.form`
  position: relative;
`;

const Field = styled.div`
  position: relative;

  > svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textFaint};
    pointer-events: none;
  }

  input {
    padding-left: 40px;
  }
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 120;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  overflow: hidden;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: ${({ theme }) => theme.spacing(1)} 0;
  max-height: min(70vh, 460px);
  overflow-y: auto;
`;

const Option = styled.li<{ $active: boolean }>`
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
  background: ${({ $active, theme }) => ($active ? theme.colors.surfaceHover : "transparent")};

  img,
  .thumb {
    width: 48px;
    height: 48px;
    border-radius: ${({ theme }) => theme.radius.md};
    object-fit: cover;
    background: ${({ theme }) => theme.colors.bgSoft};
  }

  .name {
    display: block;
    font-size: 0.9rem;
    line-height: 1.3;
    color: ${({ theme }) => theme.colors.text};
  }

  .name mark {
    background: none;
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 700;
  }

  .pieces {
    display: block;
    margin-top: 2px;
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }

  .price {
    font-size: 0.88rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    white-space: nowrap;
  }
`;

const Footer = styled.button<{ $active: boolean }>`
  display: block;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)};
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) => ($active ? theme.colors.surfaceHover : "transparent")};
  color: ${({ theme }) => theme.colors.accent};
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
`;

const Empty = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing(4)};
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.textSoft};
  text-align: center;
`;

/** Minúsculas e sem acento, um caractere por vez (mantém as posições do texto original). */
const fold = (text: string) =>
  Array.from(text, (ch) => ch.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().charAt(0) || ch).join("");

/** Destaca no nome as palavras digitadas, ignorando acento e maiúsculas ("tao" marca "Tão"). */
function highlight(name: string, query: string): ReactNode {
  const tokens = fold(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2)
    .sort((a, b) => b.length - a.length);
  if (!tokens.length) return name;
  const folded = fold(name);
  const marks = new Array<boolean>(name.length).fill(false);
  for (const token of tokens) {
    let from = 0;
    for (;;) {
      const at = folded.indexOf(token, from);
      if (at < 0) break;
      // Só no começo de palavra: "cu" não marca o meio de "escutei"
      if (at === 0 || !/[a-z0-9]/.test(folded[at - 1])) for (let i = at; i < at + token.length; i++) marks[i] = true;
      from = at + 1;
    }
  }
  const parts: ReactNode[] = [];
  let i = 0;
  while (i < name.length) {
    const marked = marks[i];
    let j = i;
    while (j < name.length && marks[j] === marked) j++;
    const chunk = name.slice(i, j);
    parts.push(marked ? <mark key={i}>{chunk}</mark> : chunk);
    i = j;
  }
  return parts;
}

interface SearchBoxProps {
  placeholder: string;
}

/**
 * Barra de busca com sugestões: enquanto a pessoa digita, mostra todos os produtos que casam com o texto,
 * cada peça separada e com o seu preço
 * (o backend ignora acento e maiúsculas, aceita palavra incompleta e erro de digitação). Enter ou
 * "Ver todos os resultados" abre o catálogo com a busca; escolher uma frase abre o produto.
 */
export function SearchBox({ placeholder }: SearchBoxProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const listId = useId();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loadedFor, setLoadedFor] = useState("");
  const [active, setActive] = useState(-1);
  const formRef = useRef<HTMLFormElement>(null);
  const query = useDebouncedValue(value.trim(), 180);

  // No catálogo, o campo mostra a busca da URL
  useEffect(() => {
    if (location.pathname === "/catalogo") setValue(new URLSearchParams(location.search).get("search") ?? "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setTotal(0);
      setLoadedFor("");
      return;
    }
    let cancelled = false;
    void catalogService
      .suggest(query)
      .then((result) => {
        if (cancelled) return;
        setSuggestions(result.items);
        setTotal(result.total);
        setLoadedFor(query);
        setActive(-1);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  // Clique fora fecha as sugestões
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!formRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const goToResults = () => {
    const text = value.trim();
    setOpen(false);
    navigate(text ? `/catalogo?search=${encodeURIComponent(text)}` : "/catalogo");
  };

  const goToProduct = (item: SearchSuggestion) => {
    setOpen(false);
    navigate(`/produto/${item.slug}`);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (open && active >= 0 && active < suggestions.length) goToProduct(suggestions[active]);
    else goToResults();
  };

  const showPanel = open && value.trim().length >= 2 && loadedFor !== "";
  // A última posição da navegação por teclado é o "Ver todos os resultados"
  const lastIndex = suggestions.length;

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showPanel || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
    event.preventDefault();
    setActive((current) => {
      if (event.key === "ArrowDown") return current >= lastIndex ? 0 : current + 1;
      return current <= 0 ? lastIndex : current - 1;
    });
  };

  const optionId = (index: number) => `${listId}-opt-${index}`;

  return (
    <Form ref={formRef} onSubmit={submit} role="search">
      <Field>
        <Icon name="search" size={18} />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Buscar produtos"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-activedescendant={showPanel && active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
        />
      </Field>

      {showPanel && (
        <Panel>
          {suggestions.length ? (
            <List id={listId} role="listbox" aria-label="Sugestões">
              {suggestions.map((item, index) => (
                <Option
                  key={item.slug}
                  id={optionId(index)}
                  role="option"
                  aria-selected={active === index}
                  $active={active === index}
                  onMouseEnter={() => setActive(index)}
                  // mousedown: escolhe antes do input perder o foco
                  onMouseDown={(event) => {
                    event.preventDefault();
                    goToProduct(item);
                  }}
                >
                  {item.imageUrl ? <img src={item.imageUrl} alt="" width={48} height={48} loading="lazy" /> : <span className="thumb" />}
                  <span>
                    <span className="name">{highlight(item.name, value)}</span>
                    <span className="pieces">{item.pieceLabel}</span>
                  </span>
                  <span className="price">{formatBRL(item.priceCents)}</span>
                </Option>
              ))}
            </List>
          ) : (
            <Empty>Nenhuma frase com “{value.trim()}”. Tente outra palavra.</Empty>
          )}
          <Footer
            type="button"
            id={optionId(lastIndex)}
            $active={active === lastIndex}
            onMouseEnter={() => setActive(lastIndex)}
            onMouseDown={(event) => {
              event.preventDefault();
              goToResults();
            }}
          >
            {total > suggestions.length
              ? `Ver todos os ${total} resultados para “${value.trim()}”`
              : `Ver no catálogo (${total} ${total === 1 ? "produto" : "produtos"})`}
          </Footer>
        </Panel>
      )}
    </Form>
  );
}
