import styled from "styled-components";

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgSoft};

  button {
    width: 34px;
    height: 36px;
    font-size: 1.05rem;
    color: ${({ theme }) => theme.colors.textSoft};
    transition: ${({ theme }) => theme.transition};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.surfaceHover};
      color: ${({ theme }) => theme.colors.accent};
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  input {
    width: 48px;
    height: 36px;
    text-align: center;
    background: transparent;
    border: none;
    border-left: 1px solid ${({ theme }) => theme.colors.border};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    font-weight: 600;

    &:focus {
      outline: none;
    }

    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <Wrapper>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          if (!Number.isNaN(parsed)) onChange(clamp(parsed));
        }}
        aria-label="Quantidade"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </Wrapper>
  );
}
