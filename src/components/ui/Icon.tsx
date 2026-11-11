import type { SVGProps } from "react";

/** Ícones de traço (24x24, currentColor). Decorativos por padrão: o texto ao lado ou o aria-label do botão descreve a ação. */
const PATHS = {
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
  cart: "M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L21 8H6.2M10 20.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm8 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0",
  home: "M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  bag: "M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01",
  ruler: "M3 15L15 3l6 6L9 21zM7 11l2 2M10 8l2 2M13 5l2 2",
  truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  swap: "M7 7h12l-3-3M17 17H5l3 3",
  logout: "M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 16l-4-4 4-4M6 12h10",
  chevronRight: "M9 6l6 6-6 6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  filter: "M4 5h16l-6 8v5l-4 2v-7z",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z",
  chat: "M4 12a8 8 0 1 1 3.4 6.5L4 20l1.3-3.7A7.9 7.9 0 0 1 4 12zM9 10.5h6M9 13.5h4",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12S18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff:
    "M3 3l18 18M10.6 6.2A7.9 7.9 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.9 3.5M6.4 8.1A16 16 0 0 0 2.5 12S6 18 12 18a8 8 0 0 0 3-.5M9.9 9.9a3 3 0 0 0 4.2 4.2",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 22,
  title,
  ...props
}: { name: IconName; size?: number; title?: string } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {title && <title>{title}</title>}
      <path d={PATHS[name]} />
    </svg>
  );
}
