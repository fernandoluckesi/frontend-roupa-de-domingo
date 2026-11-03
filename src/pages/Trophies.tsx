import { Link } from "react-router-dom";
import styled from "styled-components";
import { useEasterEggs } from "../contexts/EasterEggContext";
import { Button, Card, Container, Loading, Section } from "../components/ui";

const Head = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};

  h1 {
    font-size: clamp(1.7rem, 4vw, 2.3rem);
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
    max-width: 62ch;
  }
`;

const Progress = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};

  .top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: ${({ theme }) => theme.spacing(4)};
    margin-bottom: ${({ theme }) => theme.spacing(4)};
    flex-wrap: wrap;
  }

  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.5rem;
  }

  .rank {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
    font-size: 0.92rem;
  }

  .note {
    font-size: 0.84rem;
    color: ${({ theme }) => theme.colors.textFaint};
    margin-top: ${({ theme }) => theme.spacing(3)};
  }
`;

const Bar = styled.div<{ $percent: number }>`
  height: 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.bgSoft};
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $percent }) => $percent}%;
    background: ${({ theme }) => theme.colors.accent};
    transition: width 400ms ease;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const Egg = styled(Card)<{ $found: boolean }>`
  border-color: ${({ theme, $found }) =>
    $found ? theme.colors.accent : theme.colors.border};
  border-style: ${({ $found }) => ($found ? "solid" : "dashed")};
  opacity: ${({ $found }) => ($found ? 1 : 0.78)};

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  h3 {
    font-size: 1rem;
  }

  .points {
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 700;
    white-space: nowrap;
  }

  .hint {
    font-size: 0.86rem;
    color: ${({ theme }) => theme.colors.textFaint};
    font-style: italic;
  }

  .message {
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.55;
  }

  code {
    display: inline-block;
    margin-top: ${({ theme }) => theme.spacing(3)};
    padding: 4px 10px;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.06em;
  }
`;

export default function Trophies() {
  const { items, progress, themeMode, setThemeMode } = useEasterEggs();

  if (!progress) return <Loading label="Contando troféus..." />;

  return (
    <Section $tight>
      <Container>
        <Head>
          <h1>Troféus</h1>
          <p>
            Esta loja tem {progress.total} easter eggs escondidos. Alguns
            liberam cupom real. Nenhum deles tem botão. As dicas abaixo são tudo
            o que você vai receber.
          </p>
        </Head>

        <Progress>
          <div className="top">
            <strong>
              {progress.found} de {progress.total} encontrados
            </strong>
            <span className="rank">{progress.rank}</span>
          </div>
          <Bar $percent={progress.percent} />
          <p className="note">
            {progress.earnedPoints} de {progress.totalPoints} pontos ·{" "}
            {progress.secretProductUnlocked
              ? "Produto secreto liberado no catálogo."
              : `Faltam ${progress.secretProductIn} para liberar o produto secreto.`}
          </p>

          {themeMode !== "default" && (
            <Button
              $variant="ghost"
              $size="sm"
              style={{ marginTop: 16 }}
              onClick={() => setThemeMode("default")}
            >
              Voltar ao tema padrão ({themeMode})
            </Button>
          )}
        </Progress>

        <Grid>
          {items.map((egg) => (
            <Egg key={egg.code} $found={egg.discovered}>
              <div className="row">
                <h3>{egg.discovered ? `🏆 ${egg.title}` : "🔒 ???"}</h3>
                <span className="points">{egg.points} pts</span>
              </div>

              {egg.discovered ? (
                <>
                  <p className="message">{egg.message}</p>
                  {egg.rewardCoupon && <code>{egg.rewardCoupon.code}</code>}
                </>
              ) : (
                <p className="hint">{egg.hint}</p>
              )}
            </Egg>
          ))}
        </Grid>

        <div style={{ marginTop: 40 }}>
          <Button
            as={Link}
            to="/catalogo"
            $variant="secondary"
            style={{ textDecoration: "none" }}
          >
            Voltar ao catálogo
          </Button>
        </div>
      </Container>
    </Section>
  );
}
