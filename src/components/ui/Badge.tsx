import styled from "styled-components";
import { HUMOR_LABELS } from "../../utils/format";
import type { Humor } from "../../types";

export const Badge = styled.span<{ $color?: string; $bg?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $color, theme }) => $color ?? theme.colors.textSoft};
  background: ${({ $bg, theme }) => $bg ?? theme.colors.surface};
  border: 1px solid
    ${({ $color, theme }) => ($color ? `${$color}66` : theme.colors.border)};
  white-space: nowrap;
`;

const HumorPill = styled(Badge)<{ $humor: Humor }>`
  color: ${({ theme, $humor }) => theme.humor[$humor] ?? theme.colors.textSoft};
  border-color: ${({ theme, $humor }) =>
    `${theme.humor[$humor] ?? theme.colors.border}55`};
  background: ${({ theme, $humor }) =>
    `${theme.humor[$humor] ?? theme.colors.surface}18`};
`;

export function HumorBadge({ humor }: { humor: Humor }) {
  return <HumorPill $humor={humor}>{HUMOR_LABELS[humor] ?? humor}</HumorPill>;
}
