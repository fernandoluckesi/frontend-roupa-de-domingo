import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button, Container, Section } from "../components/ui";

/**
 * Destino de quem escolhe "Sou pamonha mole, quero sair" no aviso de humor.
 * Conteudo provisorio: a zoeira definitiva ainda vai ser definida.
 * Rota silenciosa (config/quietRoutes.ts): nenhum modal por cima.
 */

const Wrapper = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(18)} 0;

  .emoji {
    font-size: clamp(3rem, 10vw, 5rem);
    line-height: 1;
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(1.8rem, 5.5vw, 3rem);
    line-height: 1.1;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: ${({ theme }) => theme.spacing(8)};
  }
`;

export default function Goodbye() {
  return (
    <Section>
      <Container>
        <Wrapper>
          <p className="emoji" aria-hidden="true">
            😭
          </p>
          <h1>Que tistreza</h1>
          <Button
            as={Link}
            to="/"
            $size="lg"
            style={{ textDecoration: "none" }}
          >
            Me arrependi, quero voltar (Isso não é uma mensagem para teu ou tua
            ex)
          </Button>
        </Wrapper>
      </Container>
    </Section>
  );
}
