import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Container } from "../ui/Layout";
import { Input } from "../ui/Form";
import { Button } from "../ui/Button";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEasterEggs } from "../../contexts/EasterEggContext";
import { useClickStreak } from "../../hooks/useEasterEggTriggers";

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
`;

const Logo = styled.button`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-align: left;
  flex-shrink: 0;

  span {
    display: block;
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing(5)};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSoft};

  a:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const SearchForm = styled.form`
  flex: 1;
  max-width: 320px;
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

const CartButton = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 0.9rem;
  font-weight: 600;
  transition: ${({ theme }) => theme.transition};

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Count = styled.em`
  position: absolute;
  top: -7px;
  right: -7px;
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
  const { user, logout } = useAuth();
  const { discover, themeMode, setThemeMode, progress } = useEasterEggs();
  const [search, setSearch] = useState("");

  // Easter egg #2: sete cliques no logo ligam o "modo domingo de manhã"
  const handleLogoClick = useClickStreak(7, () => {
    setThemeMode(themeMode === "sunday" ? "default" : "sunday");
    void discover("LOGO_SETE_CLIQUES");
  });

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(
      search.trim()
        ? `/catalogo?search=${encodeURIComponent(search.trim())}`
        : "/catalogo",
    );
  };

  return (
    <Bar>
      <Strip>
        Produção on-demand · frete grátis acima de R$ 249 · arrependimento não
        incluso
      </Strip>
      <Inner>
        <Logo
          type="button"
          onClick={() => {
            handleLogoClick();
            navigate("/");
          }}
          aria-label="Roupa de Domingo - início"
        >
          Roupa de Domingo
          <span>estampas sem anestesia</span>
        </Logo>

        <Nav>
          <Link to="/catalogo">Tudo</Link>
          <Link to="/catalogo?category=camisetas">Camisetas</Link>
          <Link to="/catalogo?category=canecas">Canecas</Link>
          <Link to="/catalogo?category=capas-de-celular">Capas</Link>
          <Link to="/trofeus">
            Troféus{progress ? ` ${progress.found}/${progress.total}` : ""}
          </Link>
        </Nav>

        <SearchForm onSubmit={submitSearch} role="search">
          <Input
            type="search"
            placeholder="Busque por frase, humor, produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar produtos"
          />
        </SearchForm>

        <Actions>
          {user ? (
            <>
              <Button
                as={Link}
                to="/conta"
                $variant="ghost"
                $size="sm"
                style={{ textDecoration: "none" }}
              >
                {user.name.split(" ")[0]}
              </Button>
              <Button $variant="ghost" $size="sm" onClick={logout}>
                Sair
              </Button>
            </>
          ) : (
            <Button
              as={Link}
              to="/entrar"
              $variant="ghost"
              $size="sm"
              style={{ textDecoration: "none" }}
            >
              Entrar
            </Button>
          )}

          <CartButton
            to="/carrinho"
            aria-label={`Carrinho com ${itemCount} itens`}
          >
            Carrinho
            {itemCount > 0 && <Count>{itemCount}</Count>}
          </CartButton>
        </Actions>
      </Inner>
    </Bar>
  );
}
