import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Container } from "../ui/Layout";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEasterEggs } from "../../contexts/EasterEggContext";
import { useClickStreak } from "../../hooks/useEasterEggTriggers";
import { Icon } from "../ui/Icon";
import { MobileMenu } from "./MobileMenu";
import { UserMenu } from "./UserMenu";
import { SearchBox } from "./SearchBox";

/** Abre o menu lateral de qualquer lugar (ex.: botão "Filtrar" do catálogo no mobile). */
export const openMobileMenu = (section?: "filters") =>
  window.dispatchEvent(new CustomEvent("rd:open-menu", { detail: section ?? null }));

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => `${theme.colors.bg}ee`};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Strip = styled.div`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 6px ${({ theme }) => theme.spacing(4)};
`;

const Inner = styled(Container)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(5)};
  height: 72px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    gap: ${({ theme }) => theme.spacing(2)};
    height: 60px;
  }
`;

const MenuButton = styled.button`
  display: none;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-left: -8px;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
  }
`;

/** Busca em linha própria, largura total, abaixo do header no mobile */
const MobileSearch = styled.div`
  display: none;
  padding: 0 ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const IconLink = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 42px;
  height: 42px;
  padding: 0 8px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition};

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surface};
  }

  .name {
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    .name {
      max-width: 72px;
    }
  }
`;

const MobileOnly = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: contents;
  }
`;

const Logo = styled.button`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-align: left;
  flex-shrink: 0;

  .tagline {
    display: block;
    margin-top: 5px;
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 1rem;

    .tagline {
      display: none;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing(5)};
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSoft};

  a:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const SearchForm = styled.div`
  flex: 1;
  max-width: 640px;
  margin-left: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-left: auto;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-left: 0;
  }
`;

const Count = styled.em`
  position: absolute;
  top: 0;
  right: 0;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  font-size: 0.68rem;
  font-weight: 800;
  font-style: normal;
  display: grid;
  place-items: center;
`;

export function Header() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { discover, themeMode, setThemeMode, progress } = useEasterEggs();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState<"filters" | null>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      setMenuSection((event as CustomEvent<"filters" | null>).detail ?? null);
      setMenuOpen(true);
    };
    window.addEventListener("rd:open-menu", onOpen);
    return () => window.removeEventListener("rd:open-menu", onOpen);
  }, []);

  // Easter egg #2: sete cliques no logo ligam o "modo domingo de manhã"
  const handleLogoClick = useClickStreak(7, () => {
    setThemeMode(themeMode === "sunday" ? "default" : "sunday");
    void discover("LOGO_SETE_CLIQUES");
  });

  return (
    <Bar>
      <Strip>Frete grátis acima de R$ 249</Strip>
      <Inner>
        <MenuButton
          type="button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => {
            setMenuSection(null);
            setMenuOpen(true);
          }}
        >
          <Icon name="menu" size={26} />
        </MenuButton>

        <Logo
          type="button"
          onClick={() => {
            handleLogoClick();
            navigate("/");
          }}
          aria-label="Roupa de Domingo - início"
        >
          <span>
            Roupa de Domingo
            <span className="tagline">estampas sem anestesia</span>
          </span>
        </Logo>

        <SearchForm>
          <SearchBox placeholder="Busque por frase, humor, produto..." />
        </SearchForm>

        <Nav>
          <Link to="/trofeus">
            Troféus{progress ? ` ${progress.found}/${progress.total}` : ""}
          </Link>
        </Nav>

        <Actions>
          {user ? (
            <>
              {/* Desktop: dropdown com conta, pedidos e sair */}
              <UserMenu />
              {/* Mobile: o atalho leva direto à conta; o menu fica no drawer */}
              <MobileOnly>
                <IconLink to="/conta" aria-label={`Minha conta (${user.name.split(" ")[0]})`}>
                  <Icon name="user" />
                  <span className="name">{user.name.split(" ")[0]}</span>
                </IconLink>
              </MobileOnly>
            </>
          ) : (
            <IconLink to="/entrar" aria-label="Entrar">
              <Icon name="user" />
              <span className="name">Entrar</span>
            </IconLink>
          )}

          <IconLink
            to="/carrinho"
            aria-label={itemCount > 0 ? `Carrinho com ${itemCount} ${itemCount === 1 ? "item" : "itens"}` : "Carrinho vazio"}
          >
            <Icon name="cart" size={26} />
            {itemCount > 0 && <Count aria-hidden="true">{itemCount > 99 ? "99+" : itemCount}</Count>}
          </IconLink>
        </Actions>
      </Inner>

      <MobileSearch>
        <SearchBox placeholder="Estou buscando..." />
      </MobileSearch>

      <MobileMenu open={menuOpen} onClose={closeMenu} focusSection={menuSection} />
    </Bar>
  );
}
