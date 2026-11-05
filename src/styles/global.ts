import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  * { margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 16px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    transition: background ${({ theme }) => theme.transition},
      color ${({ theme }) => theme.transition};
  }

  h1, h2, h3, h4 {
    font-family: ${({ theme }) => theme.fonts.heading};
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  a { color: inherit; text-decoration: none; }

  button, input, select, textarea { font: inherit; color: inherit; }

  button { cursor: pointer; background: none; border: none; }

  img { max-width: 100%; display: block; }

  ul, ol { list-style: none; }

  ::selection {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  /* Acessibilidade: atalho de teclado para pular o menu */
  .skip-link {
    position: absolute;
    left: 12px;
    top: -60px;
    z-index: 100;
    padding: 10px 16px;
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
    font-weight: 700;
    transition: top 0.15s ease;
  }

  .skip-link:focus {
    top: 12px;
  }

  main:focus {
    outline: none;
  }

  .visually-hidden {
    position: absolute !important;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  ::-webkit-scrollbar { width: 10px; }
  ::-webkit-scrollbar-track { background: ${({ theme }) => theme.colors.bgSoft}; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.pill};
  }

  /* Easter eggs nao devem agredir quem pediu menos movimento */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
