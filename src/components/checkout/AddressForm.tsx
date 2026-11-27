import { useRef, useState, type FormEvent } from "react";
import styled from "styled-components";
import { Button, ErrorText, Field, Input, Label } from "../ui";
import { lookupZipCode } from "../../services/zipCode.service";
import { maskZipCode } from "../../utils/format";
import type { Address } from "../../types";

export type AddressValues = Omit<Address, "id" | "isDefault" | "lastUsedAt">;

export const EMPTY_ADDRESS: AddressValues = {
  label: "Casa",
  recipient: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0 ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Hint = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textFaint};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
`;

type Errors = Partial<Record<keyof AddressValues, string>>;

export function validateAddress(values: AddressValues): Errors {
  const errors: Errors = {};
  if (values.recipient.trim().length < 2) errors.recipient = "Quem vai receber?";
  if (values.zipCode.replace(/\D/g, "").length !== 8) errors.zipCode = "CEP inválido.";
  if (values.street.trim().length < 2) errors.street = "Informe a rua.";
  if (!values.number.trim()) errors.number = "Número?";
  if (values.district.trim().length < 2) errors.district = "Informe o bairro.";
  if (values.city.trim().length < 2) errors.city = "Informe a cidade.";
  if (values.state.trim().length !== 2) errors.state = "UF com 2 letras.";
  return errors;
}

/** Endereço no formato da API (CEP só com dígitos, UF maiúscula, campos aparados). */
export function cleanAddress(values: AddressValues): AddressValues {
  return {
    label: values.label.trim() || "Casa",
    recipient: values.recipient.trim(),
    zipCode: values.zipCode.replace(/\D/g, ""),
    street: values.street.trim(),
    number: values.number.trim(),
    complement: values.complement?.trim() || undefined,
    district: values.district.trim(),
    city: values.city.trim(),
    state: values.state.trim().toUpperCase(),
  };
}

interface AddressFieldsProps {
  idPrefix: string;
  values: AddressValues;
  errors: Errors;
  onChange: (values: AddressValues) => void;
  /** CEP completo: usado para cotar o frete */
  onZipComplete?: (zip: string) => void;
}

/** Campos de endereço com busca do CEP (preenche rua, bairro, cidade e UF). */
export function AddressFields({ idPrefix, values, errors, onChange, onZipComplete }: AddressFieldsProps) {
  const [zipStatus, setZipStatus] = useState<"loading" | "notFound" | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const set = (key: keyof AddressValues, value: string) => onChange({ ...values, [key]: value });
  const id = (name: string) => `${idPrefix}-${name}`;

  const changeZip = async (raw: string) => {
    const masked = maskZipCode(raw);
    const next = { ...values, zipCode: masked };
    onChange(next);
    const digits = masked.replace(/\D/g, "");
    if (digits.length !== 8) {
      setZipStatus(null);
      return;
    }
    onZipComplete?.(digits);
    setZipStatus("loading");
    const found = await lookupZipCode(digits);
    if (!found) {
      setZipStatus("notFound");
      return;
    }
    setZipStatus(null);
    onChange({
      ...next,
      street: found.street || next.street,
      district: found.district || next.district,
      city: found.city || next.city,
      state: found.state || next.state,
    });
    numberRef.current?.focus();
  };

  return (
    <Grid>
      <Field $span={2}>
        <Label htmlFor={id("zip")}>CEP</Label>
        <Input
          id={id("zip")}
          inputMode="numeric"
          placeholder="00000-000"
          autoComplete="postal-code"
          value={values.zipCode}
          $invalid={Boolean(errors.zipCode)}
          onChange={(e) => void changeZip(e.target.value)}
        />
        {errors.zipCode ? (
          <ErrorText>{errors.zipCode}</ErrorText>
        ) : zipStatus === "loading" ? (
          <Hint>Buscando endereço…</Hint>
        ) : zipStatus === "notFound" ? (
          <Hint>CEP não encontrado. Preencha o endereço manualmente.</Hint>
        ) : null}
      </Field>

      <Field $span={2}>
        <Label htmlFor={id("label")}>Nome do endereço</Label>
        <Input id={id("label")} placeholder="Casa, Trabalho..." value={values.label} onChange={(e) => set("label", e.target.value)} />
      </Field>

      <Field $span={3}>
        <Label htmlFor={id("street")}>Rua</Label>
        <Input id={id("street")} autoComplete="address-line1" value={values.street} $invalid={Boolean(errors.street)} onChange={(e) => set("street", e.target.value)} />
        {errors.street && <ErrorText>{errors.street}</ErrorText>}
      </Field>

      <Field>
        <Label htmlFor={id("number")}>Número</Label>
        <Input id={id("number")} ref={numberRef} value={values.number} $invalid={Boolean(errors.number)} onChange={(e) => set("number", e.target.value)} />
        {errors.number && <ErrorText>{errors.number}</ErrorText>}
      </Field>

      <Field $span={2}>
        <Label htmlFor={id("complement")}>Complemento (opcional)</Label>
        <Input id={id("complement")} autoComplete="address-line2" value={values.complement ?? ""} onChange={(e) => set("complement", e.target.value)} />
      </Field>

      <Field $span={2}>
        <Label htmlFor={id("district")}>Bairro</Label>
        <Input id={id("district")} value={values.district} $invalid={Boolean(errors.district)} onChange={(e) => set("district", e.target.value)} />
        {errors.district && <ErrorText>{errors.district}</ErrorText>}
      </Field>

      <Field $span={3}>
        <Label htmlFor={id("city")}>Cidade</Label>
        <Input id={id("city")} autoComplete="address-level2" value={values.city} $invalid={Boolean(errors.city)} onChange={(e) => set("city", e.target.value)} />
        {errors.city && <ErrorText>{errors.city}</ErrorText>}
      </Field>

      <Field>
        <Label htmlFor={id("state")}>UF</Label>
        <Input id={id("state")} maxLength={2} autoComplete="address-level1" value={values.state} $invalid={Boolean(errors.state)} onChange={(e) => set("state", e.target.value.toUpperCase())} />
        {errors.state && <ErrorText>{errors.state}</ErrorText>}
      </Field>

      <Field $span={4}>
        <Label htmlFor={id("recipient")}>Quem vai receber</Label>
        <Input id={id("recipient")} autoComplete="name" value={values.recipient} $invalid={Boolean(errors.recipient)} onChange={(e) => set("recipient", e.target.value)} />
        {errors.recipient && <ErrorText>{errors.recipient}</ErrorText>}
      </Field>
    </Grid>
  );
}

interface AddressFormProps {
  initial: AddressValues;
  submitLabel: string;
  onSubmit: (values: AddressValues) => Promise<void>;
  onCancel: () => void;
}

/** Formulário completo (com salvar e cancelar), usado no modal de novo endereço e de edição. */
export function AddressForm({ initial, submitLabel, onSubmit, onCancel }: AddressFormProps) {
  const [values, setValues] = useState<AddressValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateAddress(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit(cleanAddress(values));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <AddressFields
        idPrefix="address-form"
        values={values}
        errors={errors}
        onChange={(next) => {
          setValues(next);
          setErrors({});
        }}
      />
      <Actions>
        <Button type="button" $variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : submitLabel}
        </Button>
      </Actions>
    </form>
  );
}
