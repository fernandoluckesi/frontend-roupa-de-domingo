import { useLocation } from "react-router-dom";
import { Seo } from "./Seo";

/** Rotas privadas ou transacionais: nunca indexar. */
const PRIVATE_PREFIXES = [
  "/conta",
  "/checkout",
  "/carrinho",
  "/pagamento",
  "/entrar",
  "/cadastro",
  "/esqueci-a-senha",
  "/redefinir-senha",
  "/verificar-email",
  "/confirmar-cadastro",
  "/trofeus",
  // Destino do QR impresso: indexar entregaria a piada antes do escaneamento
  "/segredo",
  "/tchau",
];

const TITLES: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Roupa de Domingo — estampas com humor ácido",
    description:
      "Camisetas, moletons, canecas e garrafas com estampas de humor de péssima qualidade. Compre hoje e não se arrependa amanhã. Deixe para se arrepender quando chegar na tua casa",
  },
  "/catalogo": {
    title: "Catálogo completo",
    description:
      "Todas as estampas de humor ácido em camisetas, moletons, canecas e garrafas.",
  },
  "/carrinho": {
    title: "Carrinho",
    description: "Seu carrinho na Roupa de Domingo.",
  },
  "/checkout": {
    title: "Finalizar compra",
    description: "Checkout seguro pelo Mercado Pago.",
  },
  "/conta": {
    title: "Minha conta",
    description: "Dados, endereços, pedidos e privacidade.",
  },
  "/trofeus": { title: "Troféus", description: "Easter eggs encontrados." },
  "/segredo": {
    title: "Você desbloqueou um segredo",
    description: "Spoiler: não é um segredo.",
  },
  "/tchau": { title: "Tchau, pamonha", description: "Saiu cedo demais." },
};

/**
 * SEO padrão por rota (título, canonical sem query string, noindex nas rotas privadas).
 * Páginas com SEO próprio (produto, páginas legais) renderizam <Seo> mais fundo e prevalecem.
 */
export function RouteSeo() {
  const { pathname } = useLocation();
  const isPrivate = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const meta =
    TITLES[pathname] ??
    (pathname.startsWith("/conta") ? TITLES["/conta"] : TITLES["/"]);

  return (
    <Seo
      title={meta.title}
      description={meta.description}
      path={pathname}
      noindex={isPrivate}
    />
  );
}
