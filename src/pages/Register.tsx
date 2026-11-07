import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { extractError, extractErrorCode } from "../services/http";
import { setPendingSignupEmail } from "../utils/pendingSignup";
import {
  Button,
  Card,
  Checkbox,
  Container,
  ErrorText,
  Field,
  Input,
  Label,
  Section,
} from "../components/ui";
import { Seo } from "../components/seo/Seo";
import { maskDocument, maskPhone } from "../utils/format";
import { PASSWORD_HINT, passwordProblem } from "../utils/password";
import { LEGAL_VERSIONS } from "../config/company";

const Panel = styled(Card)`
  max-width: 440px;
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

  .hint {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textFaint};
    margin-top: ${({ theme }) => theme.spacing(1)};
  }

  .consents {
    display: grid;
    gap: ${({ theme }) => theme.spacing(3)};
    margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(5)};
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
`;

type FieldKey = "name" | "email" | "password" | "terms";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { push } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    document: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (form.name.trim().length < 2) next.name = "Informe o seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Informe um e-mail válido.";
    const problem = passwordProblem(form.password);
    if (problem) next.password = problem;
    if (!acceptTerms) next.terms = "Para criar a conta, aceite os termos de uso e a política de privacidade.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const email = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.replace(/\D/g, "") || undefined,
        document: form.document.replace(/\D/g, "") || undefined,
        acceptTerms: true,
        termsVersion: LEGAL_VERSIONS.terms,
        privacyVersion: LEGAL_VERSIONS.privacy,
        marketingOptIn,
      });
      setPendingSignupEmail(email);
      push({ variant: "info", title: "Falta pouco", message: "Enviamos um código de 6 dígitos para o seu e-mail." });
      navigate("/confirmar-cadastro", { state: { email } });
    } catch (err) {
      if (extractErrorCode(err) === "EMAIL_NOT_VERIFIED") {
        // Cadastro antigo nao confirmado: o login com a senha reenvia o codigo
        setError(extractError(err));
        return;
      }
      setError(extractError(err, "Não foi possível criar a conta."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section $tight>
      <Seo title="Criar conta" description="Crie sua conta na Roupa de Domingo." path="/cadastro" noindex />
      <Container>
        <Panel>
          <h1>Criar conta</h1>
          <p className="sub">
            Leva menos tempo do que escolher entre duas camisetas quase iguais.
          </p>

          <form onSubmit={submit} noValidate>
            <Field>
              <Label htmlFor="reg-name">Nome completo</Label>
              <Input
                id="reg-name"
                autoComplete="name"
                value={form.name}
                $invalid={Boolean(errors.name)}
                aria-invalid={Boolean(errors.name) || undefined}
                aria-describedby={errors.name ? "reg-name-error" : undefined}
                onChange={(e) => update("name", e.target.value)}
                required
              />
              {errors.name && <ErrorText id="reg-name-error">{errors.name}</ErrorText>}
            </Field>

            <Field>
              <Label htmlFor="reg-email">E-mail</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                $invalid={Boolean(errors.email)}
                aria-invalid={Boolean(errors.email) || undefined}
                aria-describedby={errors.email ? "reg-email-error" : undefined}
                onChange={(e) => update("email", e.target.value)}
                required
              />
              {errors.email && <ErrorText id="reg-email-error">{errors.email}</ErrorText>}
            </Field>

            <Field>
              <Label htmlFor="reg-password">Senha</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                $invalid={Boolean(errors.password)}
                aria-invalid={Boolean(errors.password) || undefined}
                aria-describedby={errors.password ? "reg-password-error reg-password-hint" : "reg-password-hint"}
                onChange={(e) => update("password", e.target.value)}
                required
              />
              <p className="hint" id="reg-password-hint">{PASSWORD_HINT}</p>
              {errors.password && <ErrorText id="reg-password-error">{errors.password}</ErrorText>}
            </Field>

            <Field>
              <Label htmlFor="reg-phone">Telefone (opcional)</Label>
              <Input
                id="reg-phone"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => update("phone", maskPhone(e.target.value))}
              />
            </Field>

            <Field>
              <Label htmlFor="reg-document">
                CPF (opcional, agiliza o checkout)
              </Label>
              <Input
                id="reg-document"
                inputMode="numeric"
                value={form.document}
                onChange={(e) =>
                  update("document", maskDocument(e.target.value))
                }
              />
              <p className="hint">Guardado cifrado. Usado na nota fiscal e no envio. <Link to="/privacidade">Saiba mais</Link>.</p>
            </Field>

            <div className="consents">
              <Checkbox
                id="reg-terms"
                checked={acceptTerms}
                onChange={setAcceptTerms}
                required
                invalid={Boolean(errors.terms)}
                errorId={errors.terms ? "reg-terms-error" : undefined}
              >
                Li e aceito os{" "}
                <Link to="/termos" target="_blank" rel="noopener">
                  termos de uso
                </Link>{" "}
                e a{" "}
                <Link to="/privacidade" target="_blank" rel="noopener">
                  política de privacidade
                </Link>
                .
              </Checkbox>
              {errors.terms && <ErrorText id="reg-terms-error">{errors.terms}</ErrorText>}

              <Checkbox id="reg-marketing" checked={marketingOptIn} onChange={setMarketingOptIn}>
                Quero receber novidades e ofertas por e-mail (opcional; dá para cancelar quando quiser).
              </Checkbox>
            </div>

            {error && <ErrorText role="alert">{error}</ErrorText>}

            <Button $full $size="lg" type="submit" disabled={submitting}>
              {submitting ? "Enviando código..." : "Cadastrar"}
            </Button>
          </form>

          <p className="alt">
            Já tem conta? <Link to="/entrar">Entrar</Link>
          </p>
        </Panel>
      </Container>
    </Section>
  );
}
