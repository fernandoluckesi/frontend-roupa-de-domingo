import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, Container, ErrorText, Field, Input, Label, Section } from "../../components/ui";
import { Seo } from "../../components/seo/Seo";
import { authService } from "../../services/auth.service";
import { extractError } from "../../services/http";
import { AuthPanel } from "./AuthPanel";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }
    setSubmitting(true);
    try {
      setSent(await authService.forgotPassword(email.trim().toLowerCase()));
    } catch (err) {
      setError(extractError(err, "Não foi possível enviar o link agora."));
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
          {sent ? (
            <>
              <p className="sub" role="status">
                {sent} O link vale por 1 hora. Confira também a caixa de spam.
              </p>
              <p className="alt">
                <Link to="/entrar">Voltar para o login</Link>
              </p>
            </>
          ) : (
            <>
              <p className="sub">Acontece com todo mundo. Informe o e-mail da conta e enviamos um link para criar uma senha nova.</p>
              <form onSubmit={submit} noValidate>
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
                  {submitting ? "Enviando..." : "Enviar link"}
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
