import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { extractError, extractErrorCode } from "../services/http";
import { setPendingSignupEmail } from "../utils/pendingSignup";
import { Seo } from "../components/seo/Seo";
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
  const [otp, setOtp] = useState("");
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email.trim().toLowerCase(), password, needsOtp ? otp : undefined);
      push({ variant: "success", title: "Bem-vindo de volta" });
      navigate("/conta");
    } catch (err) {
      const code = extractErrorCode(err);
      if (code === "EMAIL_NOT_VERIFIED") {
        const pending = email.trim().toLowerCase();
        setPendingSignupEmail(pending);
        push({ variant: "info", title: "Confirme o seu cadastro", message: "Enviamos um código de 6 dígitos para o seu e-mail." });
        navigate("/confirmar-cadastro", { state: { email: pending } });
        return;
      }
      if (code === "OTP_REQUIRED") {
        setNeedsOtp(true);
        setError("");
        return;
      }
      setError(extractError(err, "Não foi possível entrar."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section $tight>
      <Seo title="Entrar" description="Entre na sua conta da Roupa de Domingo." path="/entrar" noindex />
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

            {needsOtp && (
              <Field>
                <Label htmlFor="login-otp">Código do aplicativo autenticador</Label>
                <Input
                  id="login-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </Field>
            )}

            {error && <ErrorText role="alert">{error}</ErrorText>}

            <Button $full $size="lg" type="submit" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="alt">
            <Link to="/esqueci-a-senha">Esqueci minha senha</Link>
          </p>

          <p className="alt">
            Sem conta ainda? <Link to="/cadastro">Criar agora</Link>
          </p>

          {/* Credenciais de demonstração só no ambiente local, nunca em produção */}
          {import.meta.env.DEV && (
            <div className="demo">
              Ambiente local com dados de demonstração:
              <br />
              <strong>cliente@roupadedomingo.com</strong> · senha{" "}
              <strong>domingo123</strong>
            </div>
          )}
        </Panel>
      </Container>
    </Section>
  );
}
