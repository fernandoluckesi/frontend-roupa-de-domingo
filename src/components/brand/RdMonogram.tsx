import { useTheme } from "styled-components";
import { RD_MONOGRAM } from "./brandPaths";

interface RdMonogramProps {
  size?: number;
  /** Cor das letras (padrão: cor principal do tema) */
  color?: string;
  /** Fundo do quadrado; sem valor, só as letras */
  background?: string;
  title?: string;
}

/**
 * Monograma "RD" para espaços pequenos. Lima sobre escuro, preto sobre claro.
 * Desenhado inline para herdar as cores do tema. Arquivos estáticos: src/assets/brand.
 */
export function RdMonogram({ size = 32, color, background, title }: RdMonogramProps) {
  const theme = useTheme();
  return (
    <svg
      width={size}
      height={size}
      viewBox={RD_MONOGRAM.viewBox}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {background && <rect width="512" height="512" rx="112" fill={background} />}
      <path d={RD_MONOGRAM.letters} fill={color ?? theme.colors.accent} />
    </svg>
  );
}
