import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, CodeInput, Container, ErrorText, Field, Input, Label, Section } from "../../components/ui";
import { Seo } from "../../components/seo/Seo";
import { useToast } from "../../contexts/ToastContext";
import { authService } from "../../services/auth.service";
import { extractError } from "../../services/http";
import { PASSWORD_HINT, passwordProblem } from "../../utils/password";
import { AuthPanel } from "./AuthPanel";

/** Dois passos: e-mail -> código de 6 dígitos + senha nova. */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { push } = useToast();

  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requestCode = async (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setCodeSent(true);
      setCode("");
    } catch (err) {
      setError(extractError(err, "Não foi possível enviar o código agora."));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (code.length !== 6) return setError("Digite os 6 dígitos do código.");
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    setSubmitting(true);
    try {
      await authService.resetPasswordWithCode(email.trim().toLowerCase(), code, password);
      push({ variant: "success", title: "Senha redefinida", message: "Agora é só entrar com a senha nova." });
      navigate("/entrar", { replace: true });
    } catch (err) {
      setError(extractError(err, "Não foi possível redefinir a senha."));
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section $tight>
      <Seo title="Esqueci minha senha" description="Redefina a senha da sua conta." path="/esqueci-a-senha" noindex />
      <Container>
        <AuthPanel>
          <h1>Esqueci minha senha</h1>
          {codeSent ? (
            <>
              <p className="sub" role="status">
                Se existir uma conta com <strong>{email.trim()}</strong>, enviamos um código de 6 dígitos. Ele vale por
                15 minutos. Confira também o spam.
              </p>
              <form onSubmit={reset} noValidate>
                <CodeInput
                  value={code}
                  onChange={setCode}
                  invalid={Boolean(error) && code.length !== 6}
                  disabled={submitting}
                  autoFocus
                />
                <Field>
                  <Label htmlFor="forgot-password">Senha nova</Label>
                  <Input
                    id="forgot-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    aria-describedby={error ? "forgot-error forgot-hint" : "forgot-hint"}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="hint" id="forgot-hint">{PASSWORD_HINT}</p>
                </Field>
                {error && <ErrorText id="forgot-error" role="alert">{error}</ErrorText>}
                <Button $full $size="lg" type="submit" disabled={submitting || code.length !== 6 || !password}>
                  {submitting ? "Salvando..." : "Redefinir senha"}
                </Button>
              </form>
              <p className="alt">
                Não chegou?{" "}
                <Button $variant="ghost" $size="sm" type="button" disabled={submitting} onClick={() => void requestCode()}>
                  Reenviar código
                </Button>
              </p>
              <p className="alt">
                <Link to="/entrar">Voltar para o login</Link>
              </p>
            </>
          ) : (
            <>
              <p className="sub">
                Acontece com todo mundo. Informe o e-mail da conta e enviamos um código para criar uma senha nova.
              </p>
              <form onSubmit={requestCode} noValidate>
                <Field>
                  <Label htmlFor="forgot-email">E-mail</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    aria-invalid={Boolean(error) || undefined}
                    aria-describedby={error ? "forgot-error" : undefined}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                {error && <ErrorText id="forgot-error" role="alert">{error}</ErrorText>}
                <Button $full $size="lg" type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar código"}
                </Button>
              </form>
              <p className="alt">
                Lembrou? <Link to="/entrar">Entrar</Link>
              </p>
            </>
          )}
        </AuthPanel>
      </Container>
    </Section>
  );
}
