import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, CodeInput, Container, ErrorText, Section } from "../../components/ui";
import { Seo } from "../../components/seo/Seo";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { authService } from "../../services/auth.service";
import { extractError } from "../../services/http";
import { clearPendingSignupEmail, getPendingSignupEmail, setPendingSignupEmail } from "../../utils/pendingSignup";
import { AuthPanel } from "./AuthPanel";

const RESEND_COOLDOWN_S = 60;

/** Tela do código de 6 dígitos que confirma o cadastro (e abre a sessão). */
export default function ConfirmRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmRegistration } = useAuth();
  const { push } = useToast();

  const stateEmail = (location.state as { email?: string } | null)?.email;
  const [email] = useState(() => stateEmail ?? getPendingSignupEmail());
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  useEffect(() => {
    if (email) setPendingSignupEmail(email);
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  if (!email) return <Navigate to="/cadastro" replace />;

  const confirm = async (value = code) => {
    if (value.length !== 6) {
      setError("Digite os 6 dígitos do código.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await confirmRegistration(email, value);
      clearPendingSignupEmail();
      push({
        variant: "success",
        title: "Cadastro confirmado",
        message: "Agora você é oficialmente responsável pelas próprias escolhas de estampa.",
      });
      navigate("/conta", { replace: true });
    } catch (err) {
      setError(extractError(err, "Não foi possível confirmar o código."));
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError("");
    try {
      await authService.resendRegistrationCode(email);
      setCooldown(RESEND_COOLDOWN_S);
      push({ variant: "info", title: "Código reenviado", message: "Confira a caixa de entrada e o spam." });
    } catch (err) {
      setError(extractError(err, "Não foi possível reenviar agora. Tente em alguns minutos."));
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void confirm();
  };

  return (
    <Section $tight>
      <Seo title="Confirmar cadastro" description="Confirme o seu cadastro." path="/confirmar-cadastro" noindex />
      <Container>
        <AuthPanel>
          <h1>Confirme o seu e-mail</h1>
          <p className="sub">
            Enviamos um código de 6 dígitos para <strong>{email}</strong>. Ele vale por 15 minutos.
          </p>

          <form onSubmit={submit} noValidate>
            <CodeInput
              value={code}
              onChange={setCode}
              onComplete={(value) => void confirm(value)}
              invalid={Boolean(error)}
              disabled={submitting}
              describedBy={error ? "confirm-error" : undefined}
              autoFocus
            />
            {error && (
              <ErrorText id="confirm-error" role="alert">
                {error}
              </ErrorText>
            )}
            <Button $full $size="lg" type="submit" disabled={submitting || code.length !== 6}>
              {submitting ? "Confirmando..." : "Confirmar cadastro"}
            </Button>
          </form>

          <p className="alt">
            Não chegou? Confira o spam ou{" "}
            {cooldown > 0 ? (
              <span>reenvie em {cooldown}s</span>
            ) : (
              <Button $variant="ghost" $size="sm" type="button" onClick={() => void resend()}>
                Reenviar código
              </Button>
            )}
          </p>
          <p className="alt">
            E-mail errado? <Link to="/cadastro">Voltar ao cadastro</Link>
          </p>
        </AuthPanel>
      </Container>
    </Section>
  );
}
