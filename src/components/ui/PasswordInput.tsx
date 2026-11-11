import { useId, useState, type ComponentPropsWithoutRef } from "react";
import styled from "styled-components";
import { Input } from "./Form";
import { Icon } from "./Icon";

/**
 * Campo de senha com botao de mostrar/esconder.
 *
 * O botao fica dentro do campo, e o padding da direita do input abre espaco
 * para ele nao cobrir o texto digitado. Alternar nao perde o foco nem o
 * conteudo: so troca o `type`.
 */

const Wrapper = styled.div`
  position: relative;

  /* Espaco para o botao: sem isso a senha passa por baixo do icone */
  input {
    padding-right: 44px;
  }
`;

const Toggle = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 4px;
  display: grid;
  place-items: center;
  width: 36px;
  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.textFaint};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: ${({ theme }) => theme.transition};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: -2px;
  }
`;

type PasswordInputProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "type"
> & {
  $invalid?: boolean;
};

export function PasswordInput({ id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const fallbackId = useId();
  const inputId = id ?? fallbackId;

  return (
    <Wrapper>
      <Input {...props} id={inputId} type={visible ? "text" : "password"} />
      <Toggle
        type="button"
        // tabIndex -1 seria pior: quem navega por teclado tambem precisa do botao.
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Esconder senha" : "Mostrar senha"}
        aria-pressed={visible}
        aria-controls={inputId}
      >
        <Icon name={visible ? "eyeOff" : "eye"} size={20} />
      </Toggle>
    </Wrapper>
  );
}
