import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { LegalPage } from "../../components/legal/LegalPage";
import { Button, ErrorText, Field, Input, Label, Select, Textarea } from "../../components/ui";
import { COMPANY, COMPANY_ADDRESS_LINE } from "../../config/company";
import { useToast } from "../../contexts/ToastContext";
import {
  CONTACT_SUBJECTS,
  contactService,
  type ContactReceipt,
  type ContactSubject,
} from "../../services/contact.service";
import { extractError } from "../../services/http";

const Channels = styled.ul`
  list-style: none !important;
  padding-left: 0 !important;
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Form = styled.form`
  max-width: 560px;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const Counter = styled.p`
  font-size: 0.78rem !important;
  text-align: right;
  margin: ${({ theme }) => theme.spacing(1)} 0 0 !important;
  color: ${({ theme }) => theme.colors.textFaint} !important;
`;

const Receipt = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(5)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  max-width: 560px;
`;

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "subject" | "orderNumber" | "message", string>>;

const isSubject = (value: string | null): value is ContactSubject =>
  CONTACT_SUBJECTS.some((s) => s.value === value);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

export default function Contact() {
  const [params] = useSearchParams();
  const { push } = useToast();
  const initialSubject = params.get("assunto");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<ContactSubject | "">(isSubject(initialSubject) ? initialSubject : "");
  const [orderNumber, setOrderNumber] = useState(params.get("pedido") ?? "");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<ContactReceipt | null>(null);

  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Informe seu nome.";
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "Informe um e-mail válido para a resposta.";
    if (!subject) next.subject = "Escolha o assunto.";
    if (orderNumber && !/^RD-?[A-Z0-9]{4,}$/i.test(orderNumber.trim()))
      next.orderNumber = "O número do pedido tem o formato RD-XXXXXX.";
    const length = message.trim().length;
    if (length < MESSAGE_MIN) next.message = `Escreva pelo menos ${MESSAGE_MIN} caracteres.`;
    else if (length > MESSAGE_MAX) next.message = `A mensagem pode ter até ${MESSAGE_MAX} caracteres.`;
    return next;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !subject) {
      const first = Object.keys(found)[0];
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const result = await contactService.send({
        name: name.trim(),
        email: email.trim(),
        subject,
        orderNumber: orderNumber.trim().toUpperCase() || undefined,
        message: message.trim(),
      });
      setReceipt(result);
    } catch (error) {
      push({
        variant: "error",
        title: "Não deu para enviar",
        message: extractError(error, "Tente de novo ou escreva para " + COMPANY.sacEmail + "."),
      });
    } finally {
      setSending(false);
    }
  };

  const errorProps = (field: keyof Errors) =>
    errors[field]
      ? { "aria-invalid": true as const, "aria-describedby": `contact-${field}-error`, $invalid: true }
      : {};

  return (
    <LegalPage
      title="Contato e SAC"
      description="Fale com a Roupa de Domingo: e-mail, telefone, WhatsApp e formulário de atendimento. Respondemos em até 5 dias úteis."
      path="/contato"
    >
      <p>
        Pode reclamar, elogiar ou só desabafar sobre a segunda-feira. Toda mensagem recebe um
        número de protocolo e resposta em até <strong>{COMPANY.sacResponseBusinessDays} dias
        úteis</strong>.
      </p>

      <h2 id="canais">Canais de atendimento</h2>
      <Channels>
        <li>
          <strong>E-mail:</strong> <a href={`mailto:${COMPANY.sacEmail}`}>{COMPANY.sacEmail}</a>
        </li>
        <li>
          <strong>Telefone:</strong> {COMPANY.phone}
        </li>
        <li>
          <strong>WhatsApp:</strong> {COMPANY.whatsapp}
        </li>
        <li>
          <strong>Horário:</strong> {COMPANY.sacHours}
        </li>
        <li>
          <strong>Privacidade (encarregado):</strong>{" "}
          <a href={`mailto:${COMPANY.dpo.email}`}>{COMPANY.dpo.email}</a>
        </li>
        <li>
          <strong>Direito autoral e marcas:</strong>{" "}
          <a href={`mailto:${COMPANY.copyrightEmail}`}>{COMPANY.copyrightEmail}</a>
        </li>
        <li>
          <strong>Endereço:</strong> {COMPANY_ADDRESS_LINE} (não atendemos presencialmente)
        </li>
      </Channels>
      <p>
        Quer devolver um produto? É mais rápido pela página do pedido em{" "}
        <Link to="/conta/pedidos">Meus pedidos</Link>. Regras em{" "}
        <Link to="/trocas-e-devolucoes">Trocas e devoluções</Link>.
      </p>

      <h2 id="formulario">Formulário</h2>
      {receipt ? (
        <Receipt role="status" aria-live="polite">
          <p>
            <strong>Mensagem recebida.</strong> Seu protocolo é <strong>{receipt.protocol}</strong>.
          </p>
          <p>
            Responderemos até <strong>{formatDate(receipt.respondBy)}</strong> no e-mail{" "}
            {email.trim()}. Guarde o protocolo para acompanhar o atendimento.
          </p>
          <Button
            type="button"
            $variant="secondary"
            $size="sm"
            onClick={() => {
              setReceipt(null);
              setMessage("");
            }}
          >
            Enviar outra mensagem
          </Button>
        </Receipt>
      ) : (
        <Form onSubmit={handleSubmit} noValidate>
          <Field>
            <Label htmlFor="contact-name">Nome</Label>
            <Input
              id="contact-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              {...errorProps("name")}
            />
            {errors.name && <ErrorText id="contact-name-error">{errors.name}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="contact-email">E-mail</Label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...errorProps("email")}
            />
            {errors.email && <ErrorText id="contact-email-error">{errors.email}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="contact-subject">Assunto</Label>
            <Select
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value as ContactSubject)}
              aria-invalid={errors.subject ? true : undefined}
              aria-describedby={errors.subject ? "contact-subject-error" : undefined}
            >
              <option value="">Escolha…</option>
              {CONTACT_SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            {errors.subject && <ErrorText id="contact-subject-error">{errors.subject}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="contact-orderNumber">Número do pedido (opcional)</Label>
            <Input
              id="contact-orderNumber"
              placeholder="RD-XXXXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              {...errorProps("orderNumber")}
            />
            {errors.orderNumber && <ErrorText id="contact-orderNumber-error">{errors.orderNumber}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="contact-message">Mensagem</Label>
            <Textarea
              id="contact-message"
              rows={6}
              maxLength={MESSAGE_MAX}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={["contact-message-count", errors.message ? "contact-message-error" : ""].filter(Boolean).join(" ")}
            />
            <Counter id="contact-message-count">
              {message.trim().length}/{MESSAGE_MAX}
            </Counter>
            {errors.message && <ErrorText id="contact-message-error">{errors.message}</ErrorText>}
          </Field>

          <p className="meta">
            Usamos seus dados só para responder esta mensagem. Veja a{" "}
            <Link to="/privacidade">Política de Privacidade</Link>.
          </p>

          <Button type="submit" disabled={sending}>
            {sending ? "Enviando…" : "Enviar mensagem"}
          </Button>
        </Form>
      )}
    </LegalPage>
  );
}
