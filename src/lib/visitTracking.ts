import { api, getSessionId } from "../services/http";

/**
 * Análise de acessos própria (vista no backoffice, no formato do Google Analytics).
 *
 * - Sem cookie e sem ferramenta de terceiros: tudo vai só para a nossa API, ligado ao id
 *   anônimo da sessão que o carrinho já usa. Legítimo interesse (LGPD art. 7º, IX).
 * - A cada troca de página: página vista (com a origem na primeira: UTM, QR Code, site de origem).
 * - Tempo na página: só conta com a aba visível; é enviado ao trocar de página, ao sair
 *   e a cada 30 s (o que também mantém a pessoa em "Tempo real").
 * - Quem recusa "Estatísticas" no banner conta só como visita (de onde veio), sem páginas,
 *   tempo, local ou eventos.
 */

type EventName = "view_item" | "add_to_cart" | "begin_checkout" | "search";

const HEARTBEAT_MS = 30_000;
let firstLoad = true;
let minimal = false;
let minimalSent = false;
let pageviewId: string | null = null;
let visibleSince: number | null = null;
let pendingMs = 0;
let pageSeq = 0;

const endpoint = () => `${String(api.defaults.baseURL ?? "").replace(/\/$/, "")}/analytics/collect`;

/** fetch com keepalive: chega mesmo quando a aba está fechando. */
function send(body: Record<string, unknown>): Promise<{ pageviewId?: string } | null> {
  try {
    return fetch(endpoint(), {
      method: "POST",
      keepalive: true,
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-Requested-With": "rd-web", "x-session-id": getSessionId() },
      body: JSON.stringify(body),
    })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
}

function collectVisible() {
  if (visibleSince !== null) {
    pendingMs += Date.now() - visibleSince;
    visibleSince = document.visibilityState === "visible" ? Date.now() : null;
  }
}

/** Envia o tempo acumulado da página atual. */
function flushEngagement() {
  collectVisible();
  const ms = Math.min(Math.round(pendingMs), 30 * 60_000);
  pendingMs = 0;
  if (!pageviewId || ms < 500) return;
  void send({ type: "engagement", pageviewId, ms });
}

let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") visibleSince = Date.now();
    else flushEngagement();
  });
  window.addEventListener("pagehide", flushEngagement);
  window.setInterval(() => {
    if (document.visibilityState === "visible") flushEngagement();
  }, HEARTBEAT_MS);
}

/** Página vista. `refusedStatistics`: a pessoa recusou "Estatísticas" no banner de cookies. */
export function trackPage(pathname: string, search: string, refusedStatistics: boolean) {
  const params = new URLSearchParams(search);
  const clickId = params.has("fbclid") ? "fb" : params.has("gclid") ? "google" : params.has("ttclid") ? "tiktok" : undefined;
  const utmSource = params.get("utm_source") ?? undefined;
  const qrLanding = pathname === "/segredo";
  // Referrer só vale na primeira página: depois a navegação é interna (SPA)
  const referrer = firstLoad ? document.referrer || undefined : undefined;
  firstLoad = false;

  const origin = {
    path: pathname,
    referrer,
    utmSource,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmContent: params.get("utm_content") ?? undefined,
    qr: qrLanding ? (params.get("q") ?? undefined) : undefined,
    clickId,
  };

  minimal = refusedStatistics;
  if (minimal) {
    // Só a chegada (e uma nova origem, se vier por outro link)
    const hasSignal = Boolean(utmSource || clickId || qrLanding || referrer);
    if (minimalSent && !hasSignal) return;
    minimalSent = true;
    flushEngagement();
    pageviewId = null;
    void send({ type: "page_view", minimal: true, ...origin });
    return;
  }

  listen();
  flushEngagement();
  pageviewId = null;
  visibleSince = document.visibilityState === "visible" ? Date.now() : null;
  pendingMs = 0;
  const seq = ++pageSeq;

  // Espera o título da nova rota (Helmet)
  window.setTimeout(() => {
    void send({
      type: "page_view",
      ...origin,
      title: document.title.replace(/\s*\|\s*Roupa de Domingo$/, "").slice(0, 200),
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    }).then((result) => {
      // Resposta atrasada de uma página anterior não vira a página atual
      if (result?.pageviewId && seq === pageSeq) pageviewId = result.pageviewId;
    });
  }, 50);
}

/** Produto visto, carrinho, checkout e busca: alimentam o funil e os relatórios do backoffice. */
export function trackEvent(name: EventName, label?: string, valueCents?: number) {
  if (minimal) return;
  void send({
    type: "event",
    name,
    label: label?.slice(0, 120),
    valueCents: valueCents !== undefined ? Math.max(0, Math.round(valueCents)) : undefined,
    path: window.location.pathname,
  });
}
