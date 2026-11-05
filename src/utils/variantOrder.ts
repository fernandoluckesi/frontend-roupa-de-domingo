import type { ProductVariant } from "../types";

/** Tamanhos de roupa do menor para o maior. */
const CLOTHING_SIZES = ["PP", "P", "M", "G", "GG", "XG", "XGG", "XXG", "XXGG", "EXG", "G1", "G2", "G3"];

/** Fator para converter medidas para uma unidade base (ml, g, cm). */
const UNIT_FACTORS: Record<string, number> = {
  ml: 1,
  l: 1000,
  oz: 29.5735,
  g: 1,
  kg: 1000,
  mm: 0.1,
  cm: 1,
  m: 100,
};

const MEASURE = /^\s*(\d+(?:[.,]\d+)?)\s*(ml|l|oz|g|kg|mm|cm|m)\s*$/i;

const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });

function rank(value: string): [number, number] | null {
  const clothing = CLOTHING_SIZES.indexOf(value.trim().toUpperCase());
  if (clothing >= 0) return [0, clothing];
  const measure = MEASURE.exec(value);
  if (measure) {
    const amount = Number(measure[1].replace(",", "."));
    return [1, amount * UNIT_FACTORS[measure[2].toLowerCase()]];
  }
  return null;
}

/**
 * Ordem crescente para opções de variante: tamanhos de roupa (P < M < G < GG),
 * medidas com unidade (325ml < 500ml < 1L) e, no resto, ordem natural
 * (iPhone 9 < iPhone 13 < iPhone 13 Pro).
 */
export function compareOptionValues(a: string, b: string): number {
  const ra = rank(a);
  const rb = rank(b);
  if (ra && rb) return ra[0] - rb[0] || ra[1] - rb[1];
  if (ra) return -1;
  if (rb) return 1;
  return collator.compare(a, b);
}

const compareNullable = (a?: string | null, b?: string | null) => {
  if (a && b) return compareOptionValues(a, b);
  if (a) return -1;
  if (b) return 1;
  return 0;
};

/** Variantes em ordem crescente de modelo e tamanho (cor mantém a ordem do catálogo). */
export function sortVariants<T extends Pick<ProductVariant, "size" | "model">>(variants: T[]): T[] {
  return [...variants].sort(
    (a, b) => compareNullable(a.model, b.model) || compareNullable(a.size, b.size),
  );
}

/** Valores únicos de uma opção, em ordem crescente. */
export function sortedOptionValues(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort(compareOptionValues);
}
