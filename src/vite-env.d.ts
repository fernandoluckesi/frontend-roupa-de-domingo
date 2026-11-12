/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_STORE_NAME: string;
  /** Google Analytics 4 (opcional) */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /** Meta Pixel (opcional) */
  readonly VITE_META_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
