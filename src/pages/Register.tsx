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
import { maskDocument, maskPhone } from "../utils/format";

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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("A senha precisa de ao menos 8 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.replace(/\D/g, "") || undefined,
        document: form.document.replace(/\D/g, "") || undefined,
      });
      push({
        variant: "success",
        title: "Conta criada",
        message:
          "Agora você é oficialmente responsável pelas próprias escolhas de estampa.",
      });
      navigate("/conta");
    } catch (err) {
      setError(extractError(err, "Não foi possível criar a conta."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section $tight>
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
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="reg-email">E-mail</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="reg-password">Senha (mínimo 8 caracteres)</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="reg-phone">Telefone (opcional)</Label>
              <Input
                id="reg-phone"
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
                value={form.document}
                onChange={(e) =>
                  update("document", maskDocument(e.target.value))
                }
              />
            </Field>

            {error && <ErrorText>{error}</ErrorText>}

            <Button $full $size="lg" type="submit" disabled={submitting}>
              {submitting ? "Criando..." : "Criar conta"}
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
