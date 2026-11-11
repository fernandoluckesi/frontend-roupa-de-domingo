import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  CodeInput,
  Container,
  ErrorText,
  Field,
  Input,
  Label,
  PasswordChecklist,
  PasswordInput,
  Section,
} from "../../components/ui";
import { Seo } from "../../components/seo/Seo";
import { useToast } from "../../contexts/ToastContext";
import { authService } from "../../services/auth.service";
import { extractError } from "../../services/http";
import { passwordProblem } from "../../utils/password";
import { AuthPanel } from "./AuthPanel";

/** Só permite pedir outro código depois de 1 minuto. */
const RESEND_COOLDOWN_S = 60;

/**
 * Tres etapas: e-mail -> codigo -> senha nova.
 *
 * O codigo e conferido antes de pedir a senha (`verifyPasswordCode`, que nao
 * consome o codigo). Assim ninguem preenche e confirma uma senha nova para
 * descobrir no fim que errou um digito.
 */
type Step = "email" | "code" | "password";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { push } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

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
      setStep("code");
      setCode("");
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(extractError(err, "Não foi possível enviar o código agora."));
    } finally {
      setSubmitting(false);
    }
  };

  /** Etapa 2: confere o código e só então libera os campos de senha. */
  const confirmCode = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (code.length !== 6) return setError("Digite os 6 dígitos do código.");

    setSubmitting(true);
    try {
      await authService.verifyPasswordCode(email.trim().toLowerCase(), code);
      setStep("password");
    } catch (err) {
      setError(extractError(err, "Não foi possível validar o código."));
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== confirmation) return setError("As senhas não são iguais.");

    setSubmitting(true);
    try {
      await authService.resetPasswordWithCode(
        email.trim().toLowerCase(),
        code,
        password,
      );
      push({
        variant: "success",
        title: "Senha redefinida",
        message: "Agora é só entrar com a senha nova.",
      });
      navigate("/entrar", { replace: true });
    } catch (err) {
      setError(extractError(err, "Não foi possível redefinir a senha."));
      // Codigo pode ter expirado no meio do caminho: volta para a etapa dele
      setStep("code");
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const resendLine = (
    <p className="alt">
      Não chegou? Confira o spam ou{" "}
      {cooldown > 0 ? (
        <span>reenvie em {cooldown}s</span>
      ) : (
        <Button
          $variant="ghost"
          $size="sm"
          type="button"
          disabled={submitting}
          onClick={() => void requestCode()}
        >
          Reenviar código
        </Button>
      )}
    </p>
  );

  return (
    <Section $tight>
      <Seo
        title="Esqueci minha senha"
        description="Redefina a senha da sua conta."
        path="/esqueci-a-senha"
        noindex
      />
      <Container>
        <AuthPanel>
          <h1>Esqueci minha senha</h1>

          {step === "email" && (
            <>
              <p className="sub">
                Acontece com todo mundo. Informe o e-mail da conta e enviamos um
                código para criar uma senha nova.
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
                {error && (
                  <ErrorText id="forgot-error" role="alert">
                    {error}
                  </ErrorText>
                )}
                <Button $full $size="lg" type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar código"}
                </Button>
              </form>
              <p className="alt">
                Lembrou? <Link to="/entrar">Entrar</Link>
              </p>
            </>
          )}

          {step === "code" && (
            <>
              <p className="sub" role="status">
                Se existir uma conta com <strong>{email.trim()}</strong>,
                enviamos um código de 6 dígitos. Ele vale por 15 minutos.
                Confira também o spam.
              </p>
              <form onSubmit={confirmCode} noValidate>
                <CodeInput
                  value={code}
                  onChange={setCode}
                  invalid={Boolean(error)}
                  disabled={submitting}
                  autoFocus
                />
                {error && (
                  <ErrorText id="forgot-error" role="alert">
                    {error}
                  </ErrorText>
                )}
                <Button
                  $full
                  $size="lg"
                  type="submit"
                  disabled={submitting || code.length !== 6}
                >
                  {submitting ? "Validando..." : "Validar código"}
                </Button>
              </form>
              {resendLine}
              <p className="alt">
                <Link to="/entrar">Voltar para o login</Link>
              </p>
            </>
          )}

          {step === "password" && (
            <>
              <p className="sub" role="status">
                Código confirmado. Agora escolha a senha nova.
              </p>
              <form onSubmit={reset} noValidate>
                <Field>
                  <Label htmlFor="forgot-password">Senha nova</Label>
                  <PasswordInput
                    id="forgot-password"
                    autoComplete="new-password"
                    value={password}
                    aria-describedby="forgot-rules"
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                  />
                  <PasswordChecklist id="forgot-rules" password={password} />
                </Field>

                <Field>
                  <Label htmlFor="forgot-password-confirm">
                    Confirmar senha
                  </Label>
                  <PasswordInput
                    id="forgot-password-confirm"
                    autoComplete="new-password"
                    value={confirmation}
                    $invalid={
                      confirmation.length > 0 && confirmation !== password
                    }
                    aria-invalid={
                      confirmation.length > 0 && confirmation !== password
                        ? true
                        : undefined
                    }
                    onChange={(e) => setConfirmation(e.target.value)}
                    required
                  />
                  {confirmation.length > 0 && confirmation !== password && (
                    <ErrorText>As senhas não são iguais.</ErrorText>
                  )}
                </Field>

                {error && (
                  <ErrorText id="forgot-error" role="alert">
                    {error}
                  </ErrorText>
                )}
                <Button
                  $full
                  $size="lg"
                  type="submit"
                  disabled={
                    submitting ||
                    Boolean(passwordProblem(password)) ||
                    password !== confirmation
                  }
                >
                  {submitting ? "Salvando..." : "Redefinir senha"}
                </Button>
              </form>
              <p className="alt">
                <Link to="/entrar">Voltar para o login</Link>
              </p>
            </>
          )}
        </AuthPanel>
      </Container>
    </Section>
  );
}
