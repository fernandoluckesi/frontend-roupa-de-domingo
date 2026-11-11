import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { Icon } from "../ui/Icon";

/**
 * Menu do usuario no header (desktop).
 *
 * Fecha ao clicar fora, no Esc e ao trocar de rota. A navegacao por teclado
 * usa setas, Home e End, como manda o padrao de menu: Tab sozinho sairia do
 * menu no primeiro item.
 */

const Wrapper = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 42px;
  height: 42px;
  padding: 0 8px;
  border: 0;
  background: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};

  &:hover,
  &[aria-expanded="true"] {
    color: ${({ theme }) => theme.colors.accent};
  }

  .name {
    max-width: 10ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .caret {
    transition: transform 0.15s ease;
  }

  &[aria-expanded="true"] .caret {
    transform: rotate(180deg);
  }

  /* Em telas pequenas o menu do usuario vive no drawer lateral */
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 120;
  min-width: 232px;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.lg};
`;

const Identity = styled.div`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)}
    ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing(2)};

  strong {
    display: block;
    font-size: 0.92rem;
    line-height: 1.3;
  }

  small {
    display: block;
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textFaint};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const itemStyles = `
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  background: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
`;

const ItemLink = styled(Link)`
  ${itemStyles}
  color: ${({ theme }) => theme.colors.text};

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.bgSoft};
    color: ${({ theme }) => theme.colors.accent};
    outline: none;
  }

  small {
    display: block;
    font-size: 0.76rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textFaint};
  }
`;

const ItemButton = styled.button`
  ${itemStyles}
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacing(1)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0 0 8px 8px;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.bgSoft};
    outline: none;
  }
`;

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Trocar de rota com o menu aberto deixaria o painel sobre a tela nova
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        // Devolve o foco ao gatilho: fechar nao deve perder o lugar na pagina
        wrapperRef.current?.querySelector("button")?.focus();
        return;
      }

      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("[data-menu-item]") ??
          [],
      );
      if (items.length === 0) return;

      const current = items.indexOf(document.activeElement as HTMLElement);
      const move = (next: number) => {
        event.preventDefault();
        items[(next + items.length) % items.length]?.focus();
      };

      if (event.key === "ArrowDown") move(current + 1);
      if (event.key === "ArrowUp") move(current - 1);
      if (event.key === "Home") move(0);
      if (event.key === "End") move(items.length - 1);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const firstName = user.name.split(" ")[0];

  return (
    <Wrapper ref={wrapperRef}>
      <Trigger
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-menu"
        aria-label={`Menu da conta (${firstName})`}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="user" />
        <span className="name">{firstName}</span>
        <Icon name="chevronDown" size={16} className="caret" />
      </Trigger>

      {open && (
        <Panel ref={panelRef} id="user-menu" role="menu">
          <Identity>
            <strong>{user.name}</strong>
            <small title={user.email}>{user.email}</small>
          </Identity>

          <ItemLink to="/conta" role="menuitem" data-menu-item>
            <Icon name="user" size={18} />
            <span>
              Minha conta
              <small>Dados, endereços e privacidade</small>
            </span>
          </ItemLink>

          <ItemLink to="/conta/pedidos" role="menuitem" data-menu-item>
            <Icon name="bag" size={18} />
            <span>
              Meus pedidos
              <small>Entregas, datas e rastreio</small>
            </span>
          </ItemLink>

          <ItemButton
            type="button"
            role="menuitem"
            data-menu-item
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate("/");
            }}
          >
            <Icon name="logout" size={18} />
            Sair
          </ItemButton>
        </Panel>
      )}
    </Wrapper>
  );
}
