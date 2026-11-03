import type { ReactNode } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(16)}
    ${({ theme }) => theme.spacing(5)};

  span {
    font-size: 2.6rem;
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
    max-width: 46ch;
    margin: 0 auto ${({ theme }) => theme.spacing(6)};
    font-size: 0.95rem;
  }
`;

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({
  emoji = "🫥",
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <Wrapper>
      <span role="img" aria-hidden="true">
        {emoji}
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </Wrapper>
  );
}
