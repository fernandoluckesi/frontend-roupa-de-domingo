import { useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useEasterEggs } from "../contexts/EasterEggContext";
import { Button, Container, Section } from "../components/ui";

const Wrapper = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(20)} 0;

  h1 {
    font-size: clamp(4rem, 14vw, 9rem);
    line-height: 0.9;
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }

  h2 {
    font-size: clamp(1.3rem, 3vw, 1.9rem);
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
    max-width: 48ch;
    margin: 0 auto ${({ theme }) => theme.spacing(8)};
  }

  .actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing(3)};
    justify-content: center;
    flex-wrap: wrap;
  }
`;

export default function NotFound() {
  const { discover } = useEasterEggs();

  // Easter egg #8: errar o endereço também conta como descoberta
  useEffect(() => {
    void discover("QUATRO_ZERO_QUATRO");
  }, [discover]);

  return (
    <Section>
      <Container>
        <Wrapper>
          <h1>404</h1>
          <h2>Esta página não existe</h2>
          <p>
            Igual aos seus planos para domingo à noite. A boa notícia: errar o
            endereço desbloqueou um troféu. A má: você ainda não comprou nada.
          </p>
          <div className="actions">
            <Button as={Link} to="/" style={{ textDecoration: "none" }}>
              Voltar ao início
            </Button>
            <Button
              as={Link}
              to="/trofeus"
              $variant="secondary"
              style={{ textDecoration: "none" }}
            >
              Ver troféus
            </Button>
          </div>
        </Wrapper>
      </Container>
    </Section>
  );
}
