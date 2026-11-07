import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import styled from "styled-components";

const LENGTH = 6;

const Boxes = styled.div`
  display: grid;
  grid-template-columns: repeat(${LENGTH}, minmax(0, 52px));
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(4)};
`;

const Box = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  aspect-ratio: 5 / 6;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme, $invalid }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: ${({ theme }) => theme.transition};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.accent}33`};
  }
`;

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Chamado quando os 6 dígitos foram preenchidos */
  onComplete?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** id do texto de erro/ajuda para leitores de tela */
  describedBy?: string;
  label?: string;
}

/**
 * Seis caixas para o código enviado por e-mail. Aceita colar o código inteiro,
 * avança/volta o foco sozinho e usa autocomplete="one-time-code" (o celular
 * sugere o código recebido).
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
  autoFocus,
  describedBy,
  label = "Código de 6 dígitos",
}: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const commit = (next: string, focusIndex: number) => {
    const clean = next.replace(/\D/g, "").slice(0, LENGTH);
    onChange(clean);
    refs.current[Math.min(focusIndex, LENGTH - 1)]?.focus();
    if (clean.length === LENGTH) onComplete?.(clean);
  };

  const handleInput = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    // Mais de um dígito: autocomplete do celular ou digitação rápida
    const next = (value.slice(0, index) + typed).slice(0, LENGTH);
    commit(next, index + typed.length);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        commit(value.slice(0, index) + value.slice(index + 1), index);
      } else if (index > 0) {
        commit(value.slice(0, index - 1) + value.slice(index), index - 1);
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    commit(pasted, pasted.length);
  };

  return (
    <Boxes role="group" aria-label={label}>
      {digits.map((digit, index) => (
        <Box
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={index === 0 ? LENGTH : 1}
          aria-label={`Dígito ${index + 1} de ${LENGTH}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          $invalid={invalid}
          disabled={disabled}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </Boxes>
  );
}
