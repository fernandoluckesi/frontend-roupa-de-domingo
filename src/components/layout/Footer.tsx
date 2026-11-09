import { Link } from "react-router-dom";
import styled from "styled-components";
import { Container } from "../ui/Layout";
import { useEasterEggs } from "../../contexts/EasterEggContext";
import { useLongHover } from "../../hooks/useEasterEggTriggers";
import { useConsent } from "../../contexts/ConsentContext";
import { COMPANY, COMPANY_ADDRESS_LINE } from "../../config/company";
import { LEGAL_LINKS } from "../../pages/legal";

const Wrapper = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgSoft};
  margin-top: ${({ theme }) => theme.spacing(16)};
  padding: ${({ theme }) => theme.spacing(12)} 0
    ${({ theme }) => theme.spacing(8)};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing(8)};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  h4 {
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textFaint};
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  a,
  span {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSoft};
    max-width: 38ch;
  }

  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.05rem;
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const LinkButton = styled.button`
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSoft};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Identification = styled.address`
  font-style: normal;
  margin-top: ${({ theme }) => theme.spacing(6)};
  font-size: 0.8rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textFaint};

  a {
    color: ${({ theme }) => theme.colors.textSoft};
  }
`;

const Bottom = styled.div`
  margin-top: ${({ theme }) => theme.spacing(10)};
  padding-top: ${({ theme }) => theme.spacing(5)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textFaint};
`;

export function Footer() {
  const { discover } = useEasterEggs();
  const { openPreferences } = useConsent();

  // Easter egg #6: cinco segundos de hover no rodapé
  const hoverProps = useLongHover(
    5000,
    () => void discover("RODAPE_CONFISSAO"),
  );

  return (
    <Wrapper {...hoverProps}>
      <Container>
        <Grid>
          <Column>
            <strong>Roupa de Domingo</strong>
            <p>
              Estampas de humor ácido em camisetas, moletons, canecas, capas e
              garrafas. Estampamos sob demanda, então
              nada fica encalhado no estoque — só as nossas ideias.
            </p>
          </Column>

          <Column>
            <h4>Loja</h4>
            <ul>
              <li>
                <Link to="/catalogo">Catálogo completo</Link>
              </li>
              <li>
                <Link to="/catalogo?category=camisetas">Camisetas</Link>
              </li>
              <li>
                <Link to="/catalogo?category=canecas">Canecas</Link>
              </li>
              <li>
                <Link to="/catalogo?category=moletons">Moletons</Link>
              </li>
              <li>
                <Link to="/catalogo?category=capas-de-celular">Capas</Link>
              </li>
              <li>
                <Link to="/catalogo?category=garrafas">Garrafas</Link>
              </li>
            </ul>
          </Column>

          <Column>
            <h4>Conta</h4>
            <ul>
              <li>
                <Link to="/entrar">Entrar</Link>
              </li>
              <li>
                <Link to="/cadastro">Criar conta</Link>
              </li>
              <li>
                <Link to="/conta/pedidos">Meus pedidos</Link>
              </li>
              <li>
                <Link to="/trofeus">Troféus</Link>
              </li>
            </ul>
          </Column>

          <Column>
            <h4>Ajuda</h4>
            <ul>
              {LEGAL_LINKS.slice(0, 6).map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </Column>

          <Column>
            <h4>Transparência</h4>
            <ul>
              {LEGAL_LINKS.slice(6).map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
              <li>
                <LinkButton type="button" onClick={openPreferences}>
                  Preferências de cookies
                </LinkButton>
              </li>
            </ul>
          </Column>
        </Grid>

        <Identification aria-label="Identificação do fornecedor">
          {COMPANY.legalName} · CNPJ {COMPANY.cnpj} · IE{" "}
          {COMPANY.stateRegistration}
          <br />
          {COMPANY_ADDRESS_LINE}
          <br />
          SAC: <a href={`mailto:${COMPANY.sacEmail}`}>
            {COMPANY.sacEmail}
          </a> · {COMPANY.phone} · {COMPANY.sacHours} · resposta em até{" "}
          {COMPANY.sacResponseBusinessDays} dias úteis
        </Identification>

        <Bottom>
          <span>
            © {new Date().getFullYear()} Roupa de Domingo. Nenhum domingo foi
            poupado.
          </span>
          <span>
            Pagamento processado pelo Mercado Pago · produção sob demanda
          </span>
        </Bottom>
      </Container>
    </Wrapper>
  );
}
