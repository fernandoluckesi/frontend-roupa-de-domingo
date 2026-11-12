/**
 * IDs das ferramentas de medição, embutidos no build (variáveis VITE_* do Railway).
 * Sem o ID, a ferramenta simplesmente não existe no site: nenhum script é baixado.
 * Valores fora do formato esperado são ignorados (evita injetar lixo numa URL de script).
 */
const read = (value: unknown, pattern: RegExp): string | null => {
  const text = typeof value === "string" ? value.trim() : "";
  return pattern.test(text) ? text : null;
};

export const ANALYTICS = {
  /** Google Analytics 4: "G-XXXXXXXXXX" (categoria Estatísticas) */
  gaMeasurementId: read(import.meta.env.VITE_GA_MEASUREMENT_ID, /^G-[A-Z0-9]{4,20}$/),
  /** Meta Pixel: só dígitos (categoria Marketing) */
  metaPixelId: read(import.meta.env.VITE_META_PIXEL_ID, /^\d{6,20}$/),
} as const;

export const hasAnyTracker = Boolean(ANALYTICS.gaMeasurementId || ANALYTICS.metaPixelId);
