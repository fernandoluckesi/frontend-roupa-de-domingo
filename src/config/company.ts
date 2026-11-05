/**
 * Identificação do fornecedor (Decreto 7.962/2013, art. 2º) e dados de contato.
 *
 * ATENÇÃO: razão social, CNPJ, inscrição estadual, endereço e telefone são
 * PROVISÓRIOS (fictícios). O CNPJ abaixo tem dígito verificador inválido de
 * propósito, para não coincidir com nenhuma empresa real. Trocar pelos dados
 * reais antes de operar comercialmente: este é o único lugar a alterar.
 */
export const COMPANY = {
  tradeName: "Roupa de Domingo",
  legalName: "Roupa de Domingo Comércio de Vestuário Ltda.",
  cnpj: "12.345.678/0001-00",
  stateRegistration: "000.000.000.000",
  address: {
    street: "Rua do Domingo Eterno",
    number: "100",
    complement: "Sala 7",
    district: "Vila Mariana",
    city: "São Paulo",
    state: "SP",
    zipCode: "04000-000",
  },
  sacEmail: "sac@roupadedomingo.com.br",
  privacyEmail: "privacidade@roupadedomingo.com.br",
  copyrightEmail: "direitos@roupadedomingo.com.br",
  phone: "(11) 4000-0000",
  whatsapp: "(11) 90000-0000",
  sacHours: "segunda a sexta, das 9h às 18h (exceto feriados)",
  /** Prazo máximo de resposta do SAC (Decreto 7.962/2013, art. 4º, parágrafo único) */
  sacResponseBusinessDays: 5,
  dpo: {
    name: "Equipe de Privacidade Roupa de Domingo",
    email: "privacidade@roupadedomingo.com.br",
  },
  /** Foro do consumidor prevalece (CDC art. 101, I); este é o foro subsidiário */
  forumCity: "São Paulo/SP",
  siteUrl: "https://frontend-roupa-de-domingo-production.up.railway.app",
} as const;

export const COMPANY_ADDRESS_LINE = (() => {
  const a = COMPANY.address;
  return `${a.street}, ${a.number}${a.complement ? ` – ${a.complement}` : ""}, ${a.district}, ${a.city}/${a.state}, CEP ${a.zipCode}`;
})();

/** Versões vigentes dos documentos legais: mudar a versão exige novo aceite. */
export const LEGAL_VERSIONS = {
  terms: "2026-11-04",
  privacy: "2026-11-04",
  cookies: "2026-11-04",
  returns: "2026-11-04",
} as const;
