import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { Button, Container, Section } from "../ui";
import { Seo } from "../seo/Seo";
import { Breadcrumb } from "../seo/Breadcrumb";

const Article = styled.article`
  max-width: 78ch;

  h1 {
    font-size: clamp(1.7rem, 3.5vw, 2.4rem);
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  .meta {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textFaint};
    margin-bottom: ${({ theme }) => theme.spacing(8)};
  }

  h2 {
    font-size: 1.25rem;
    margin: ${({ theme }) => theme.spacing(10)} 0 ${({ theme }) => theme.spacing(3)};
  }

  h3 {
    font-size: 1.02rem;
    margin: ${({ theme }) => theme.spacing(6)} 0 ${({ theme }) => theme.spacing(2)};
  }

  p,
  li {
    color: ${({ theme }) => theme.colors.textSoft};
    line-height: 1.7;
    font-size: 0.96rem;
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  ul,
  ol {
    padding-left: ${({ theme }) => theme.spacing(6)};
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  ul {
    list-style: disc;
  }

  ol {
    list-style: decimal;
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
    font-size: 0.88rem;
    display: block;
    overflow-x: auto;
  }

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
    text-align: left;
    vertical-align: top;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  th {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface};
  }

  .print-actions {
    margin-bottom: ${({ theme }) => theme.spacing(8)};
  }

  @media print {
    max-width: none;

    h1,
    h2,
    h3,
    p,
    li,
    th,
    td,
    strong {
      color: #000 !important;
    }

    th {
      background: #eee !important;
    }

    a {
      color: #000 !important;
    }

    .print-actions {
      display: none;
    }
  }
`;

/** Ao imprimir uma página legal, só o documento vai para o papel/PDF. */
const PrintOnlyDocument = createGlobalStyle`
  @media print {
    body > #root > header,
    body > #root > footer,
    #root header,
    #root footer,
    nav[aria-label="Você está em"],
    [role="region"][aria-label*="cookies" i] {
      display: none !important;
    }

    body {
      background: #fff !important;
    }
  }
`;

export interface LegalPageProps {
  title: string;
  description: string;
  path: string;
  /** Data de vigência, ex. "4 de novembro de 2026" */
  updatedAt?: string;
  version?: string;
  /** Mostra o botão "Imprimir / salvar em PDF" (contrato que o consumidor pode arquivar) */
  printable?: boolean;
  children: ReactNode;
}

/** Moldura comum das páginas institucionais e legais (título, vigência, SEO, breadcrumb). */
export function LegalPage({ title, description, path, updatedAt, version, printable, children }: LegalPageProps) {
  return (
    <Section $tight>
      <PrintOnlyDocument />
      <Seo title={title} description={description} path={path} type="article" />
      <Container>
        <Breadcrumb items={[{ label: "Início", to: "/" }, { label: title, to: path }]} />
        <Article>
          <h1>{title}</h1>
          {(updatedAt || version) && (
            <p className="meta">
              {updatedAt && <>Vigente desde {updatedAt}</>}
              {updatedAt && version && " · "}
              {version && <>Versão {version}</>}
            </p>
          )}
          {printable && (
            <div className="print-actions">
              <Button $variant="secondary" $size="sm" type="button" onClick={() => window.print()}>
                Imprimir / salvar em PDF
              </Button>
            </div>
          )}
          {children}
          <p className="meta" style={{ marginTop: 48 }}>
            Dúvidas? Fale com a gente pela página de <Link to="/contato">contato</Link>.
          </p>
        </Article>
      </Container>
    </Section>
  );
}
