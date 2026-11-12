import type { Humor, OrderStatus } from "../types";

/**
 * Paleta da identidade visual da Roupa de Domingo.
 *
 * Fonte única das cores do projeto: componentes nunca usam hex/rgba direto,
 * sempre `theme.colors.*`, `theme.humor.*`, `theme.orderStatus.*` etc.
 * Para mudar uma cor da marca, altere aqui.
 */
export const palette = {
  // Marca
  lime: "#d7ff3e", // cor principal (destaques, botões, logo)
  limeDark: "#b2d61f", // hover/pressionado da principal
  ink: "#121212", // texto sobre a cor principal

  // Neutros (escuros, do fundo para a superfície)
  black: "#0f0f10",
  graphite900: "#17171a",
  graphite800: "#1e1e22",
  graphite700: "#26262c",
  graphite600: "#2e2e36",
  graphite400: "#6b6b74",

  // Neutros (claros, para texto)
  white: "#ffffff",
  snow: "#f4f4f5",
  silver: "#a1a1aa",
  steel: "#8b8b95",

  // Cores dos tipos de humor (secundárias)
  orange: "#ff9f40",
  violet: "#9d8cff",
  mint: "#4ee6c1",
  pink: "#ff6b9d",
  cyan: "#3fd0ff",

  // Feedback
  red: "#ff5c5c",
  amber: "#ffb020",
  green: "#3ddc84",
  blue: "#58a6ff",
} as const;

export interface AppTheme {
  colors: {
    bg: string;
    bgSoft: string;
    surface: string;
    surfaceHover: string;
    border: string;
    text: string;
    textSoft: string;
    textFaint: string;
    muted: string;
    accent: string;
    accentDark: string;
    accentText: string;
    danger: string;
    dangerText: string;
    warning: string;
    success: string;
    info: string;
    /** Fundo escurecido atrás de modais e do menu mobile */
    overlay: string;
    overlayStrong: string;
    /** Realce sutil sobre a cor principal (ex.: hover do X no menu) */
    accentHover: string;
  };
  humor: Record<Humor, string>;
  orderStatus: Record<OrderStatus, string>;
  /** Cores para impressão/PDF das páginas legais */
  print: { text: string; bg: string; tableHead: string };
  fonts: { heading: string; body: string };
  radius: { sm: string; md: string; lg: string; pill: string };
  spacing: (n: number) => string;
  shadow: { sm: string; md: string; lg: string; drawer: string; glow: string };
  breakpoints: { sm: string; md: string; lg: string; xl: string };
  transition: string;
}

export const theme: AppTheme = {
  colors: {
    bg: palette.black,
    bgSoft: palette.graphite900,
    surface: palette.graphite800,
    surfaceHover: palette.graphite700,
    border: palette.graphite600,
    text: palette.snow,
    textSoft: palette.silver,
    // Contraste WCAG AA (>= 4.5:1) sobre bg, bgSoft e surface
    textFaint: palette.steel,
    muted: palette.graphite400,
    accent: palette.lime,
    accentDark: palette.limeDark,
    accentText: palette.ink,
    danger: palette.red,
    dangerText: palette.white,
    warning: palette.amber,
    success: palette.green,
    info: palette.blue,
    overlay: "rgba(0, 0, 0, 0.6)",
    overlayStrong: "rgba(0, 0, 0, 0.72)",
    accentHover: "rgba(0, 0, 0, 0.08)",
  },
  humor: {
    ACIDO: palette.lime,
    SARCASTICO: palette.orange,
    EXISTENCIAL: palette.violet,
    MEMES: palette.blue,
    PARA_CASAIS: palette.pink,
    POLITICO: palette.mint,
    NERD: palette.cyan,
  },
  orderStatus: {
    PENDING: palette.amber,
    PAID: palette.green,
    IN_PRODUCTION: palette.blue,
    SHIPPED: palette.blue,
    DELIVERED: palette.green,
    CANCELLED: palette.graphite400,
    REFUNDED: palette.graphite400,
    FAILED: palette.red,
  },
  print: {
    text: "#000000",
    bg: palette.white,
    tableHead: "#eeeeee",
  },
  fonts: {
    heading: "'Archivo', system-ui, sans-serif",
    body: "'Space Grotesk', system-ui, sans-serif",
  },
  radius: {
    sm: "6px",
    md: "12px",
    lg: "20px",
    pill: "999px",
  },
  spacing: (n: number) => `${n * 4}px`,
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.4)",
    md: "0 8px 24px rgba(0,0,0,0.45)",
    lg: "0 18px 50px rgba(0,0,0,0.45)",
    drawer: "12px 0 40px rgba(0,0,0,0.45)",
    glow: "0 0 0 3px rgba(215,255,62,0.25)",
  },
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
  transition: "180ms cubic-bezier(0.4, 0, 0.2, 1)",
};

/** Easter egg #2: paleta esmaecida de "domingo de manhã". */
export const sundayTheme: AppTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    bg: "#f3f1ec",
    bgSoft: "#eae7df",
    surface: "#ffffff",
    surfaceHover: "#f6f4ef",
    border: "#d9d4c9",
    text: "#2b2a27",
    // Tons ajustados para contraste WCAG AA no fundo claro
    textSoft: "#5c5a54",
    textFaint: "#6a675f",
    accent: "#7a5a1c",
    accentDark: "#5f4615",
    accentText: "#ffffff",
    danger: "#b42318",
    success: "#17703a",
  },
};

/** Easter egg #1: paleta do modo caos. */
export const chaosTheme: AppTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    bg: "#15021f",
    bgSoft: "#1f0430",
    surface: "#2a0742",
    surfaceHover: "#390a58",
    border: "#54107f",
    accent: "#ff2bd1",
    accentDark: "#d0149f",
    // Texto escuro sobre o rosa: branco dava 3.2:1 (abaixo do AA)
    accentText: "#15021f",
    textFaint: "#9a8fa6",
  },
};

export type ThemeMode = "default" | "sunday" | "chaos";

export const themesByMode: Record<ThemeMode, AppTheme> = {
  default: theme,
  sunday: sundayTheme,
  chaos: chaosTheme,
};
