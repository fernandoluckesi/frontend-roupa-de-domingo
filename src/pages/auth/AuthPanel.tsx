import styled from "styled-components";
import { Card } from "../../components/ui";

/** Cartão centralizado das telas de senha e e-mail. */
export const AuthPanel = styled(Card)`
  max-width: 440px;
  margin: 0 auto;

  h1 {
    font-size: 1.6rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  .sub {
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.92rem;
    margin-bottom: ${({ theme }) => theme.spacing(6)};
  }

  .hint {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textFaint};
    margin-top: ${({ theme }) => theme.spacing(1)};
  }

  .alt {
    text-align: center;
    margin-top: ${({ theme }) => theme.spacing(5)};
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.textSoft};

    a {
      color: ${({ theme }) => theme.colors.accent};
      font-weight: 600;
    }
  }
`;
