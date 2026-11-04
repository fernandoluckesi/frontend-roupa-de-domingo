import { Link } from "react-router-dom";
import styled from "styled-components";
import { Container } from "../ui/Layout";
import { useEasterEggs } from "../../contexts/EasterEggContext";
import { useLongHover } from "../../hooks/useEasterEggTriggers";

const Wrapper = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgSoft};
  margin-top: ${({ theme }) => theme.spacing(16)};
  padding: ${({ theme }) => theme.spacing(12)} 0
    ${({ theme }) => theme.spacing(8)};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
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
              Estampas de humor ácido em camisetas, moletons, canecas, capas e garrafas. Produzimos
              sob demanda com parceiro de estamparia, então nada fica encalhado
              no estoque — só as nossas ideias.
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
            <h4>Transparência</h4>
            <ul>
              <li>
                <span>Pagamento via Mercado Pago</span>
              </li>
              <li>
                <span>Produção em 2 a 4 dias úteis</span>
              </li>
              <li>
                <span>Troca por defeito em 30 dias</span>
              </li>
              <li>
                <span>Troca por arrependimento: 7 dias</span>
              </li>
            </ul>
          </Column>
        </Grid>

        <Bottom>
          <span>
            © {new Date().getFullYear()} Roupa de Domingo. Nenhum domingo foi
            poupado.
          </span>
          <span>CNPJ 00.000.000/0001-00 · São Paulo, SP</span>
        </Bottom>
      </Container>
    </Wrapper>
  );
}
