import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { extractError } from "../services/http";
import {
  Button,
  Card,
  Container,
  ErrorText,
  Field,
  Input,
  Label,
  Section,
} from "../components/ui";

const Panel = styled(Card)`
  max-width: 420px;
  margin: 0 auto;

  h1 {
    font-size: 1.6rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  .sub {
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.92rem;
    margin-bottom: ${({ theme }) => theme.spacing(6)};
  }

  .alt {
    text-align: center;
    margin-top: ${({ theme }) => theme.spacing(5)};
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.textSoft};

    a {
      color: ${({ theme }) => theme.colors.accent};
      font-weight: 600;
    }
  }

  .demo {
    margin-top: ${({ theme }) => theme.spacing(5)};
    padding: ${({ theme }) => theme.spacing(3)};
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textFaint};
    line-height: 1.6;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { push } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email.trim().toLowerCase(), password);
      push({ variant: "success", title: "Bem-vindo de volta" });
      navigate("/conta");
    } catch (err) {
      setError(extractError(err, "Não foi possível entrar."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section $tight>
      <Container>
        <Panel>
          <h1>Entrar</h1>
          <p className="sub">
            Sua conta guarda endereços, pedidos e os easter eggs que você
            encontrou.
          </p>

          <form onSubmit={submit} noValidate>
            <Field>
              <Label htmlFor="login-email">E-mail</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            {error && <ErrorText>{error}</ErrorText>}

            <Button $full $size="lg" type="submit" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="alt">
            Sem conta ainda? <Link to="/cadastro">Criar agora</Link>
          </p>

          <div className="demo">
            Ambiente local com dados de demonstração:
            <br />
            <strong>cliente@roupadedomingo.com</strong> · senha{" "}
            <strong>domingo123</strong>
          </div>
        </Panel>
      </Container>
    </Section>
  );
}
