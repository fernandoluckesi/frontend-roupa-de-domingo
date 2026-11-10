import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button, Container, Section } from "../components/ui";

/**
 * Destino do QR Code impresso em etiqueta, embalagem e adesivo.
 * O QR aponta para /segredo (ver src/assets/brand/QRCodes/README.md).
 *
 * A rota e proposital: quem escaneia espera um conteudo exclusivo e recebe
 * a piada de que nao existe segredo nenhum.
 */

const Wrapper = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(18)} 0;

  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(1.8rem, 5.5vw, 3rem);
    line-height: 1.1;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  .aside {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(1rem, 2.6vw, 1.3rem);
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing(8)};
  }

  .reveal {
    font-size: clamp(1.05rem, 2.4vw, 1.25rem);
    color: ${({ theme }) => theme.colors.textSoft};
    max-width: 46ch;
    margin: 0 auto ${({ theme }) => theme.spacing(10)};
    line-height: 1.6;

    strong {
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

export default function SecretQr() {
  // Sem discover() de easter egg aqui: a notificacao de troféu competia com a
  // piada da tela e entregava que havia mesmo "um segredo".
  return (
    <Section>
      <Container>
        <Wrapper>
          <h1>Você desbloqueou um segredo.</h1>
          <p className="aside">(como macarrão com feijão)</p>

          <p className="reveal">
            <strong>Mentira.</strong> É só uma loja de artigos estampados com
            humor de péssima qualidade.
          </p>

          <Button
            as={Link}
            to="/catalogo"
            $size="lg"
            style={{ textDecoration: "none" }}
          >
            Clique aqui para se arrepender
          </Button>
        </Wrapper>
      </Container>
    </Section>
  );
}
