import styled, { css } from "styled-components";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export const Button = styled.button<{
  $variant?: Variant;
  $size?: Size;
  $full?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid transparent;
  transition: ${({ theme }) => theme.transition};
  white-space: nowrap;
  width: ${({ $full }) => ($full ? "100%" : "auto")};

  ${({ $size = "md" }) =>
    ({
      sm: css`
        padding: 7px 14px;
        font-size: 0.85rem;
      `,
      md: css`
        padding: 11px 20px;
        font-size: 0.95rem;
      `,
      lg: css`
        padding: 15px 28px;
        font-size: 1.05rem;
      `,
    })[$size]}

  ${({ $variant = "primary", theme }) => {
    switch ($variant) {
      case "secondary":
        return css`
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          border-color: ${theme.colors.border};
          &:hover:not(:disabled) {
            background: ${theme.colors.surfaceHover};
            border-color: ${theme.colors.accent};
          }
        `;
      case "ghost":
        return css`
          background: transparent;
          color: ${theme.colors.textSoft};
          &:hover:not(:disabled) {
            color: ${theme.colors.text};
            background: ${theme.colors.surface};
          }
        `;
      case "danger":
        return css`
          background: transparent;
          color: ${theme.colors.danger};
          border-color: ${theme.colors.danger};
          &:hover:not(:disabled) {
            background: ${theme.colors.danger};
            color: #fff;
          }
        `;
      default:
        return css`
          background: ${theme.colors.accent};
          color: ${theme.colors.accentText};
          &:hover:not(:disabled) {
            background: ${theme.colors.accentDark};
            transform: translateY(-1px);
          }
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
