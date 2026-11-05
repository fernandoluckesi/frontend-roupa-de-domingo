import { api } from "./http";

export type ContactSubject =
  | "pedido"
  | "troca-devolucao"
  | "privacidade"
  | "direito-autoral"
  | "pagamento"
  | "outro";

export const CONTACT_SUBJECTS: { value: ContactSubject; label: string }[] = [
  { value: "pedido", label: "Meu pedido" },
  { value: "troca-devolucao", label: "Troca, devolução ou arrependimento" },
  { value: "pagamento", label: "Pagamento ou reembolso" },
  { value: "privacidade", label: "Privacidade e dados pessoais (LGPD)" },
  { value: "direito-autoral", label: "Direito autoral ou marca (notificação)" },
  { value: "outro", label: "Outro assunto" },
];

export interface ContactPayload {
  name: string;
  email: string;
  subject: ContactSubject;
  orderNumber?: string;
  message: string;
}

export interface ContactReceipt {
  protocol: string;
  /** Data limite de resposta (ISO), 5 dias úteis */
  respondBy: string;
}

export const contactService = {
  async send(payload: ContactPayload): Promise<ContactReceipt> {
    const { data } = await api.post<ContactReceipt>("/contact", payload);
    return data;
  },
};
