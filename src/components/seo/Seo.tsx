import { Helmet } from "react-helmet-async";
import { COMPANY } from "../../config/company";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? COMPANY.siteUrl;
const DEFAULT_IMAGE = "/og-default.png";

export interface SeoProps {
  /** Título da página, sem o nome da loja (ele é acrescentado) */
  title: string;
  description: string;
  /** Caminho canônico, ex. "/produto/slug". Sem ele, usa a rota atual sem query string. */
  path?: string;
  image?: string;
  type?: "website" | "product" | "article";
  /** Rotas privadas (conta, checkout, pagamento): não indexar */
  noindex?: boolean;
  /** Um ou mais objetos schema.org (JSON-LD) */
  jsonLd?: object | object[];
}

export const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;

/** Meta tags por rota: title, description, canonical, Open Graph, Twitter Card e JSON-LD. */
export function Seo({ title, description, path, image, type = "website", noindex, jsonLd }: SeoProps) {
  const fullTitle = title.includes(COMPANY.tradeName) ? title : `${title} | ${COMPANY.tradeName}`;
  const canonical = absoluteUrl(path ?? (typeof window !== "undefined" ? window.location.pathname : "/"));
  const ogImage = absoluteUrl(image ?? DEFAULT_IMAGE);
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:site_name" content={COMPANY.tradeName} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:type" content={type === "product" ? "product" : type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
