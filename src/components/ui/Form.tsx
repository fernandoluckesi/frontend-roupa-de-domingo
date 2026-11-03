import styled, { css } from "styled-components";

const fieldBase = css`
  width: 100%;
  background: ${({ theme }) => theme.colors.bgSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  padding: 11px 14px;
  font-size: 0.95rem;
  transition: ${({ theme }) => theme.transition};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textFaint};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: ${({ theme }) => theme.shadow.glow};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = styled.input<{ $invalid?: boolean }>`
  ${fieldBase}
  ${({ $invalid, theme }) =>
    $invalid &&
    css`
      border-color: ${theme.colors.danger};
    `}
`;

export const Textarea = styled.textarea`
  ${fieldBase}
  min-height: 96px;
  resize: vertical;
`;

export const Select = styled.select`
  ${fieldBase}
  cursor: pointer;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    calc(100% - 18px) calc(50% + 1px),
    calc(100% - 13px) calc(50% + 1px);
  background-size: 5px 5px;
  background-repeat: no-repeat;
  padding-right: 36px;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSoft};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const Field = styled.div<{ $span?: number }>`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  ${({ $span }) => $span && `grid-column: span ${$span};`}
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.82rem;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;
