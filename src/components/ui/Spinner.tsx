import styled, { keyframes } from "styled-components";

const spin = keyframes`to { transform: rotate(360deg); }`;

export const Spinner = styled.div<{ $size?: number }>`
  width: ${({ $size = 24 }) => $size}px;
  height: ${({ $size = 24 }) => $size}px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: ${spin} 700ms linear infinite;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(16)} 0;
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 0.9rem;
`;

export function Loading({ label = "Carregando..." }: { label?: string }) {
  return (
    <LoadingWrapper>
      <Spinner $size={32} />
      <span>{label}</span>
    </LoadingWrapper>
  );
}
