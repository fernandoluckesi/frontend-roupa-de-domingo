/**
 * Rotas que nao exibem nenhuma camada sobreposta (banner de cookies, pegadinha
 * do desconto, qualquer modal futuro).
 *
 * `/segredo` e o destino do QR Code impresso: a tela tem uma unica mensagem e
 * um CTA para o catalogo. Qualquer modal por cima rouba o clique e estraga a
 * piada que justifica o QR.
 *
 * Suprimir o banner de cookies aqui e seguro do ponto de vista da LGPD: sem
 * escolha registrada, `hasConsent()` devolve false e nada opcional roda. O
 * consentimento e apenas adiado para a proxima tela, nunca presumido.
 */
export const QUIET_ROUTES = ["/segredo"];

/** A rota atual deve ficar livre de modais? */
export function isQuietRoute(pathname: string): boolean {
  return QUIET_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
