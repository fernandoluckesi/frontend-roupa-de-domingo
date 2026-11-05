import { Fragment } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { absoluteUrl } from "./Seo";

const Nav = styled.nav`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textFaint};
  margin-bottom: ${({ theme }) => theme.spacing(5)};

  ol {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(2)};
    list-style: none;
    padding: 0;
    margin: 0;
  }

  a {
    color: ${({ theme }) => theme.colors.textSoft};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  [aria-current="page"] {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export interface BreadcrumbItem {
  label: string;
  to: string;
}

/** Breadcrumb visível + JSON-LD BreadcrumbList. O último item é a página atual. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.to),
    })),
  };

  return (
    <Nav aria-label="Você está em">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={item.to + i}>
              <li>
                {last ? (
                  <span aria-current="page">{item.label}</span>
                ) : (
                  <Link to={item.to}>{item.label}</Link>
                )}
              </li>
              {!last && <li aria-hidden="true">›</li>}
            </Fragment>
          );
        })}
      </ol>
    </Nav>
  );
}
