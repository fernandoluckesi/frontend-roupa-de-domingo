import { Component, type ErrorInfo, type ReactNode } from "react";
import styled from "styled-components";
import { Button } from "./ui/Button";
import { isChunkLoadError } from "../utils/lazyWithReload";

const Box = styled.div`
  max-width: 520px;
  margin: ${({ theme }) => theme.spacing(16)} auto;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};

  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.4rem;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
    margin-bottom: ${({ theme }) => theme.spacing(6)};
  }

  .actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing(3)};
    justify-content: center;
    flex-wrap: wrap;
  }
`;

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Evita a tela branca: se uma página quebrar ao renderizar, mostra um aviso
 * com opção de recarregar, mantendo header e rodapé. Use com `key` da rota
 * para limpar o erro ao navegar.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro ao renderizar a página", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const outdated = isChunkLoadError(error);
    return (
      <Box role="alert">
        <h1>{outdated ? "O site foi atualizado" : "Algo deu errado por aqui"}</h1>
        <p>
          {outdated
            ? "Publicamos uma versão nova enquanto você navegava. Recarregue para continuar de onde parou — seu carrinho continua salvo."
            : "Essa tela tropeçou. Recarregar costuma resolver, e seu carrinho continua salvo."}
        </p>
        <div className="actions">
          <Button onClick={() => window.location.reload()}>Recarregar página</Button>
          <Button $variant="ghost" onClick={() => window.location.assign("/")}>
            Ir para o início
          </Button>
        </div>
      </Box>
    );
  }
}
