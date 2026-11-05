import type { ReactNode } from "react";
import styled from "styled-components";

const Row = styled.label`
  /* Clique só no quadrado e no texto, não na linha inteira */
  display: inline-flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
  width: fit-content;
  max-width: 100%;
  font-size: 0.88rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSoft};
  cursor: pointer;

  input {
    margin-top: 3px;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    accent-color: ${({ theme }) => theme.colors.accent};
    cursor: pointer;
  }

  input:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

export interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  required?: boolean;
  /** id do texto de erro associado (aria-describedby) */
  errorId?: string;
  invalid?: boolean;
}

export function Checkbox({ id, checked, onChange, children, required, errorId, invalid }: CheckboxProps) {
  return (
    <Row htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        required={required}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={errorId}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </Row>
  );
}
