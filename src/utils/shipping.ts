import type { ShippingOption } from "../types";

/** "16/11" a partir de "2026-11-16", sem passar por Date (evita cair 1 dia antes no fuso BR). */
function formatDayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

/** Prazo legível: "9 a 10 dias · chega até 16/11". */
export function formatDeliveryEstimate(option: ShippingOption): string {
  const min = option.minDays ?? option.estimatedDays;
  const max = option.maxDays ?? option.estimatedDays;
  const days = min && min !== max ? `${min} a ${max} dias` : `${max} dias`;
  return option.estimatedDeliveryDate
    ? `${days} · chega até ${formatDayMonth(option.estimatedDeliveryDate)}`
    : days;
}
