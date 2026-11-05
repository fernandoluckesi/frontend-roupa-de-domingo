import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { Icon, type IconName } from "../ui/Icon";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useEasterEggs } from "../../contexts/EasterEggContext";
import { catalogService } from "../../services/catalog.service";
import type { Category, HumorOption } from "../../types";

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.6);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: opacity 0.2s ease;
`;

const Drawer = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 301;
  width: min(88vw, 380px);
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bg};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 12px 0 40px rgba(0, 0, 0, 0.45);
  transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
  visibility: ${({ $open }) => ($open ? "visible" : "hidden")};
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.25s;
`;

const Profile = styled.div`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  padding: ${({ theme }) => theme.spacing(5)};
  padding-top: ${({ theme }) => theme.spacing(4)};

  .top {
    display: flex;
    justify-content: flex-end;
  }

  .close {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: inherit;
  }

  .close:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  .who {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
  }

  .avatar {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: 800;
    font-size: 1.05rem;
  }

  strong {
    display: block;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.15rem;
    line-height: 1.2;
  }

  .link {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 0.86rem;
    font-weight: 600;
    color: inherit;
  }

  .auth {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing(2)};
    margin-top: ${({ theme }) => theme.spacing(4)};
  }

  .auth a {
    text-align: center;
    padding: 10px;
    border-radius: ${({ theme }) => theme.radius.md};
    font-weight: 700;
    font-size: 0.9rem;
  }

  .auth a:first-child {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.accent};
  }

  .auth a:last-child {
    border: 1.5px solid currentColor;
    color: inherit;
  }
`;

const Scroll = styled.div`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

const Group = styled.nav`
  padding: ${({ theme }) => theme.spacing(2)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textFaint};
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(1)};
  }
`;

const itemStyle = css`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  min-height: 48px;
  padding: 0 ${({ theme }) => theme.spacing(5)};
  font-size: 0.95rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;

  svg {
    color: ${({ theme }) => theme.colors.textSoft};
    flex-shrink: 0;
  }

  .badge {
    margin-left: auto;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
    font-size: 0.72rem;
    font-weight: 800;
    display: grid;
    place-items: center;
  }

  &:hover,
  &[aria-current="page"] {
    background: ${({ theme }) => theme.colors.surface};
  }

  &[aria-current="page"] svg {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Item = styled(Link)`
  ${itemStyle}
`;

const ItemButton = styled.button`
  ${itemStyle}
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(3)};
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 7px 13px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.accentText : theme.colors.textSoft)};
`;

const FilterActions = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(4)};

  button {
    min-height: 44px;
    border-radius: ${({ theme }) => theme.radius.md};
    font-weight: 700;
    font-size: 0.9rem;
    padding: 0 ${({ theme }) => theme.spacing(4)};
  }

  .clear {
    color: ${({ theme }) => theme.colors.textSoft};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  .clear:disabled {
    opacity: 0.5;
  }

  .apply {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const readList = (value: string | null) => (value ?? "").split(",").filter(Boolean);

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  /** "filters" rola direto para os filtros (botão "Filtrar" do catálogo) */
  focusSection?: "filters" | null;
}

/**
 * Menu lateral do mobile: perfil no topo, navegação com ícones e filtros
 * combinados (categoria + tipo de humor) com contagem antes de aplicar.
 */
export function MobileMenu({ open, onClose, focusSection }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { progress } = useEasterEggs();
  const location = useLocation();
  const navigate = useNavigate();
  const closeRef = useRef<HTMLButtonElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [humors, setHumors] = useState<HumorOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedHumors, setSelectedHumors] = useState<string[]>([]);
  const [preview, setPreview] = useState<number | null>(null);

  // Carrega categorias e humores só na primeira abertura
  useEffect(() => {
    if (!open || categories.length) return;
    void Promise.all([catalogService.categories(), catalogService.humors()]).then(([cats, hums]) => {
      setCategories(cats);
      setHumors(hums);
    });
  }, [open, categories.length]);

  // Ao abrir: filtros espelham a URL do catálogo, foco no fechar, sem rolagem da página por trás
  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams(location.search);
    const onCatalog = location.pathname === "/catalogo";
    setSelectedCategories(onCatalog ? readList(params.get("category")) : []);
    setSelectedHumors(onCatalog ? readList(params.get("humor")) : []);

    lastFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      if (focusSection === "filters") filtersRef.current?.scrollIntoView({ block: "start" });
      closeRef.current?.focus();
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Fecha ao navegar
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Quantos produtos o filtro vai mostrar (antes de aplicar)
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void catalogService
        .list({
          category: selectedCategories.join(",") || undefined,
          humor: selectedHumors.join(",") || undefined,
          limit: 1,
        })
        .then((data) => setPreview(data.meta.total))
        .catch(() => setPreview(null));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open, selectedCategories, selectedHumors]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    if (selectedHumors.length) params.set("humor", selectedHumors.join(","));
    const query = params.toString();
    navigate(`/catalogo${query ? `?${query}` : ""}`);
    onClose();
  };

  const current = (path: string) => (location.pathname === path ? "page" : undefined);
  const hasFilters = selectedCategories.length > 0 || selectedHumors.length > 0;

  const links: { to: string; label: string; icon: IconName; badge?: string | number }[] = [
    { to: "/", label: "Início", icon: "home" },
    { to: "/catalogo", label: "Todos os produtos", icon: "grid" },
    { to: "/carrinho", label: "Carrinho", icon: "cart", badge: itemCount || undefined },
    ...(user ? [{ to: "/conta/pedidos", label: "Meus pedidos", icon: "bag" as IconName }] : []),
    {
      to: "/trofeus",
      label: "Troféus",
      icon: "trophy",
      badge: progress ? `${progress.found}/${progress.total}` : undefined,
    },
  ];

  const helpLinks: { to: string; label: string; icon: IconName }[] = [
    { to: "/guia-de-tamanhos", label: "Guia de tamanhos", icon: "ruler" },
    { to: "/entrega", label: "Entrega e prazos", icon: "truck" },
    { to: "/trocas-e-devolucoes", label: "Trocas e devoluções", icon: "swap" },
    { to: "/contato", label: "Ajuda e contato", icon: "help" },
    { to: "/privacidade", label: "Privacidade", icon: "shield" },
  ];

  // Portal no <body>: o header usa backdrop-filter, que prenderia o position: fixed dentro dele
  return createPortal(
    <>
      <Overlay $open={open} onClick={onClose} aria-hidden="true" />
      <Drawer
        $open={open}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
      >
        <Profile>
          <div className="top">
            <button ref={closeRef} type="button" className="close" onClick={onClose} aria-label="Fechar menu">
              <Icon name="close" size={24} />
            </button>
          </div>
          {user ? (
            <div className="who">
              <span className="avatar" aria-hidden="true">
                {initials(user.name)}
              </span>
              <div>
                <strong>{user.name.split(" ")[0]}</strong>
                <Link className="link" to="/conta">
                  Minha conta <Icon name="chevronRight" size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="who">
                <span className="avatar" aria-hidden="true">
                  <Icon name="user" size={26} />
                </span>
                <div>
                  <strong>Olá!</strong>
                  <span style={{ fontSize: "0.86rem" }}>Entre para ver pedidos e troféus.</span>
                </div>
              </div>
              <div className="auth">
                <Link to="/entrar">Entrar</Link>
                <Link to="/cadastro">Criar conta</Link>
              </div>
            </>
          )}
        </Profile>

        <Scroll>
          <Group aria-label="Navegação">
            {links.map((link) => (
              <Item key={link.to} to={link.to} aria-current={current(link.to)}>
                <Icon name={link.icon} />
                {link.label}
                {link.badge !== undefined && <span className="badge">{link.badge}</span>}
              </Item>
            ))}
          </Group>

          <Group aria-label="Filtrar produtos" ref={filtersRef as never}>
            <h3>Categorias</h3>
            <Chips>
              {categories.map((category) => (
                <Chip
                  key={category.slug}
                  type="button"
                  $active={selectedCategories.includes(category.slug)}
                  aria-pressed={selectedCategories.includes(category.slug)}
                  onClick={() => toggle(selectedCategories, setSelectedCategories, category.slug)}
                >
                  {category.emoji ? `${category.emoji} ` : ""}
                  {category.name}
                </Chip>
              ))}
            </Chips>
            <h3>Tipo de humor</h3>
            <Chips>
              {humors.map((humor) => (
                <Chip
                  key={humor.value}
                  type="button"
                  title={humor.description}
                  $active={selectedHumors.includes(humor.value)}
                  aria-pressed={selectedHumors.includes(humor.value)}
                  onClick={() => toggle(selectedHumors, setSelectedHumors, humor.value)}
                >
                  {humor.label}
                </Chip>
              ))}
            </Chips>
            <FilterActions>
              <button
                type="button"
                className="clear"
                disabled={!hasFilters}
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedHumors([]);
                }}
              >
                Limpar
              </button>
              <button type="button" className="apply" onClick={applyFilters}>
                {preview === null
                  ? "Ver produtos"
                  : preview === 0
                    ? "Nenhum produto"
                    : `Ver ${preview} produto${preview === 1 ? "" : "s"}`}
              </button>
            </FilterActions>
          </Group>

          <Group aria-label="Ajuda">
            <h3>Ajuda</h3>
            {helpLinks.map((link) => (
              <Item key={link.to} to={link.to} aria-current={current(link.to)}>
                <Icon name={link.icon} />
                {link.label}
              </Item>
            ))}
          </Group>

          {user && (
            <Group aria-label="Sessão">
              <ItemButton
                type="button"
                onClick={() => {
                  void logout();
                  onClose();
                  navigate("/");
                }}
              >
                <Icon name="logout" />
                Sair
              </ItemButton>
            </Group>
          )}
        </Scroll>
      </Drawer>
    </>,
    document.body,
  );
}
