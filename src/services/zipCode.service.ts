export interface ZipCodeAddress {
  street: string;
  district: string;
  city: string;
  state: string;
}

const cache = new Map<string, ZipCodeAddress | null>();

/**
 * Busca o endereço do CEP no ViaCEP (público, com CORS liberado).
 * Retorna null se o CEP não existir ou o serviço estiver fora: o formulário continua editável.
 */
export async function lookupZipCode(
  value: string,
): Promise<ZipCodeAddress | null> {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  if (cache.has(digits)) return cache.get(digits) ?? null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;
    const data = await response.json();
    const result: ZipCodeAddress | null = data.erro
      ? null
      : {
          street: data.logradouro ?? "",
          district: data.bairro ?? "",
          city: data.localidade ?? "",
          state: data.uf ?? "",
        };
    cache.set(digits, result);
    return result;
  } catch {
    return null;
  }
}
