import styled, { css, keyframes } from "styled-components";
import { useToast, type ToastVariant } from "../../contexts/ToastContext";

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Viewport = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing(5)};
  right: ${({ theme }) => theme.spacing(5)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  z-index: 300;
  max-width: 380px;
  width: calc(100% - 32px);

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    left: ${({ theme }) => theme.spacing(4)};
    right: ${({ theme }) => theme.spacing(4)};
    max-width: none;
    width: auto;
  }
`;

const Item = styled.div<{ $variant: ToastVariant }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left-width: 4px;
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: ${({ theme }) => theme.spacing(4)};
  animation: ${slideIn} 220ms ease-out;
  cursor: pointer;

  strong {
    display: block;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 0.95rem;
    margin-bottom: 2px;
  }

  p {
    font-size: 0.86rem;
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.45;
  }

  code {
    display: inline-block;
    margin-top: ${({ theme }) => theme.spacing(2)};
    padding: 3px 8px;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.06em;
  }

  ${({ $variant, theme }) => {
    const color = {
      info: theme.colors.info,
      success: theme.colors.success,
      error: theme.colors.danger,
      egg: theme.colors.accent,
    }[$variant];

    return css`
      border-left-color: ${color};
      strong {
        color: ${color};
      }
    `;
  }}
`;

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <Viewport role="status" aria-live="polite">
      {toasts.map((toast) => (
        <Item
          key={toast.id}
          $variant={toast.variant}
          onClick={() => dismiss(toast.id)}
        >
          <strong>{toast.title}</strong>
          {toast.message && <p>{toast.message}</p>}
          {toast.coupon && <code>{toast.coupon}</code>}
        </Item>
      ))}
    </Viewport>
  );
}
