import type { Humor } from "../types";

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
    accent: string;
    accentDark: string;
    accentText: string;
    danger: string;
    warning: string;
    success: string;
    info: string;
  };
  humor: Record<Humor, string>;
  fonts: { heading: string; body: string };
  radius: { sm: string; md: string; lg: string; pill: string };
  spacing: (n: number) => string;
  shadow: { sm: string; md: string; glow: string };
  breakpoints: { sm: string; md: string; lg: string; xl: string };
  transition: string;
}

export const theme: AppTheme = {
  colors: {
    bg: "#0f0f10",
    bgSoft: "#17171a",
    surface: "#1e1e22",
    surfaceHover: "#26262c",
    border: "#2e2e36",
    text: "#f4f4f5",
    textSoft: "#a1a1aa",
    textFaint: "#6b6b74",
    accent: "#d7ff3e",
    accentDark: "#b2d61f",
    accentText: "#121212",
    danger: "#ff5c5c",
    warning: "#ffb020",
    success: "#3ddc84",
    info: "#58a6ff",
  },
  humor: {
    ACIDO: "#d7ff3e",
    SARCASTICO: "#ff9f40",
    EXISTENCIAL: "#9d8cff",
    ABSURDO: "#4ee6c1",
    PASSIVO_AGRESSIVO: "#ff6b9d",
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
    textSoft: "#6c6a63",
    textFaint: "#9b988f",
    accent: "#c3a46a",
    accentDark: "#a4874f",
    accentText: "#ffffff",
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
    accentText: "#ffffff",
  },
};

export type ThemeMode = "default" | "sunday" | "chaos";

export const themesByMode: Record<ThemeMode, AppTheme> = {
  default: theme,
  sunday: sundayTheme,
  chaos: chaosTheme,
};
