import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Container, ErrorText, Field, Input, Label, Section } from "../../components/ui";
import { Seo } from "../../components/seo/Seo";
import { authService } from "../../services/auth.service";
import { extractError } from "../../services/http";
import { useToast } from "../../contexts/ToastContext";
import { PASSWORD_HINT, passwordProblem } from "../../utils/password";
import { AuthPanel } from "./AuthPanel";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { push } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== confirm) return setError("As duas senhas não são iguais.");
    setError("");
    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      push({ variant: "success", title: "Senha alterada", message: "Entre com a senha nova. As outras sessões foram encerradas." });
      navigate("/entrar");
    } catch (err) {
      setError(extractError(err, "Não foi possível redefinir a senha."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section $tight>
      <Seo title="Redefinir senha" description="Crie uma senha nova." path="/redefinir-senha" noindex />
      <Container>
        <AuthPanel>
          <h1>Criar senha nova</h1>
          {!token ? (
            <p className="sub">
              Link incompleto. Peça um novo em <Link to="/esqueci-a-senha">esqueci minha senha</Link>.
            </p>
          ) : (
            <form onSubmit={submit} noValidate>
              <Field>
                <Label htmlFor="reset-password">Senha nova</Label>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  aria-describedby="reset-hint"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="hint" id="reset-hint">{PASSWORD_HINT}</p>
              </Field>
              <Field>
                <Label htmlFor="reset-confirm">Repita a senha nova</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? "reset-error" : undefined}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </Field>
              {error && <ErrorText id="reset-error" role="alert">{error}</ErrorText>}
              <Button $full $size="lg" type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar senha nova"}
              </Button>
            </form>
          )}
        </AuthPanel>
      </Container>
    </Section>
  );
}
