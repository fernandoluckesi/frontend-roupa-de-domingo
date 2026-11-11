import styled from "styled-components";
import { passwordRules } from "../../utils/password";

/**
 * Requisitos da senha abaixo do campo, marcando o que ja foi cumprido.
 *
 * Mostra o progresso em vez de uma mensagem de erro por vez, para a pessoa
 * saber o que falta antes de enviar o formulario.
 */

const List = styled.ul`
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(2)};
  list-style: none;
  padding: 0;
`;

const Item = styled.li<{ $ok: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: 0.8rem;
  line-height: 1.4;
  color: ${({ theme, $ok }) =>
    $ok ? theme.colors.success : theme.colors.textFaint};
  transition: ${({ theme }) => theme.transition};

  /* O simbolo e decorativo: o texto de cada item ja diz o requisito, e o
     aria-label do <li> informa se esta cumprido. */
  .mark {
    flex: 0 0 14px;
    font-size: 0.9rem;
    line-height: 1;
    text-align: center;
  }
`;

interface PasswordChecklistProps {
  password: string;
  /** Liga o <ul> ao campo via aria-describedby. */
  id?: string;
}

export function PasswordChecklist({ password, id }: PasswordChecklistProps) {
  const rules = passwordRules(password);

  return (
    <List id={id} aria-label="Requisitos da senha">
      {rules.map((rule) => (
        <Item
          key={rule.label}
          $ok={rule.ok}
          aria-label={`${rule.label}: ${rule.ok ? "cumprido" : "pendente"}`}
        >
          <span className="mark" aria-hidden="true">
            {rule.ok ? "✓" : "•"}
          </span>
          {rule.label}
        </Item>
      ))}
    </List>
  );
}
