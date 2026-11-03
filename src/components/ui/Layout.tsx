import styled from "styled-components";

export const Container = styled.div<{ $narrow?: boolean }>`
  width: 100%;
  max-width: ${({ $narrow }) => ($narrow ? "760px" : "1240px")};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing(5)};
`;

export const Section = styled.section<{ $tight?: boolean }>`
  padding: ${({ theme, $tight }) =>
      $tight ? theme.spacing(8) : theme.spacing(14)}
    0;
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(7)};
  flex-wrap: wrap;

  h2 {
    font-size: clamp(1.5rem, 3vw, 2.1rem);
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.95rem;
    max-width: 52ch;
    margin-top: ${({ theme }) => theme.spacing(2)};
  }
`;

export const Card = styled.div<{ $padding?: number }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme, $padding }) => theme.spacing($padding ?? 6)};
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing(5)} 0;
`;

export const Stack = styled.div<{
  $gap?: number;
  $row?: boolean;
  $wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${({ $row }) => ($row ? "row" : "column")};
  gap: ${({ theme, $gap }) => theme.spacing($gap ?? 4)};
  ${({ $wrap }) => $wrap && "flex-wrap: wrap;"}
`;
