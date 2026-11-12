import { ANALYTICS } from "../config/analytics";

/**
 * GA4 e Meta Pixel, carregados só depois do consentimento (LGPD art. 7º, I).
 *
 * - GA4 depende da categoria "Estatísticas"; o Pixel, de "Marketing".
 * - Os scripts são injetados por código (sem <script> inline): a CSP continua
 *   sem 'unsafe-inline' e só libera os domínios do Google e da Meta.
 * - Revogar o consentimento desliga o envio na hora e apaga os cookies das ferramentas.
 * - Nada de dado pessoal nos eventos: só produto, valor e número do pedido.
 */

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: (...args: unknown[]) => void; loaded?: boolean; version?: string; push?: unknown };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let gaActive = false;
let pixelActive = false;

function injectScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function deleteCookies(prefixes: string[]) {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const raw of document.cookie.split(";")) {
    const name = raw.split("=")[0]?.trim();
    if (!name || !prefixes.some((p) => name.startsWith(p))) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

// ------------------------------------------------------------------ GA4

export function enableGa() {
  const id = ANALYTICS.gaMeasurementId;
  if (!id) return;
  if (!window.gtag) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag() {
      // gtag.js espera o objeto "arguments", não um array
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    window.gtag("js", new Date());
    // page_view manual: a SPA troca de rota sem recarregar
    window.gtag("config", id, { send_page_view: false, anonymize_ip: true });
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  }
  window.gtag("consent", "update", { analytics_storage: "granted" });
  gaActive = true;
}

export function disableGa() {
  if (!ANALYTICS.gaMeasurementId) return;
  if (window.gtag) window.gtag("consent", "update", { analytics_storage: "denied" });
  gaActive = false;
  deleteCookies(["_ga", "_gid", "_gat"]);
}

// ------------------------------------------------------------------ Meta Pixel

export function enablePixel() {
  const id = ANALYTICS.metaPixelId;
  if (!id) return;
  if (!window.fbq) {
    // Equivalente ao snippet oficial, sem script inline
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue!.push(args);
    }) as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    injectScript("https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", id);
  }
  window.fbq("consent", "grant");
  pixelActive = true;
}

export function disablePixel() {
  if (!ANALYTICS.metaPixelId) return;
  if (window.fbq) window.fbq("consent", "revoke");
  pixelActive = false;
  deleteCookies(["_fbp", "_fbc"]);
}

// ------------------------------------------------------------------ eventos

export interface TrackedItem {
  id: string;
  name: string;
  priceCents: number;
  quantity?: number;
  category?: string;
}

const reais = (cents: number) => Math.round(cents) / 100;

const gaItems = (items: TrackedItem[]) =>
  items.map((i) => ({ item_id: i.id, item_name: i.name, item_category: i.category, price: reais(i.priceCents), quantity: i.quantity ?? 1 }));

const sumCents = (items: TrackedItem[]) => items.reduce((acc, i) => acc + i.priceCents * (i.quantity ?? 1), 0);

export function trackPageView(path: string) {
  if (gaActive && window.gtag) {
    window.gtag("event", "page_view", { page_path: path, page_location: window.location.origin + path, page_title: document.title });
  }
  if (pixelActive && window.fbq) window.fbq("track", "PageView");
}

export function trackViewItem(item: TrackedItem) {
  if (gaActive && window.gtag) window.gtag("event", "view_item", { currency: "BRL", value: reais(item.priceCents), items: gaItems([item]) });
  if (pixelActive && window.fbq) window.fbq("track", "ViewContent", { content_ids: [item.id], content_name: item.name, content_type: "product", value: reais(item.priceCents), currency: "BRL" });
}

export function trackAddToCart(item: TrackedItem) {
  const value = reais(sumCents([item]));
  if (gaActive && window.gtag) window.gtag("event", "add_to_cart", { currency: "BRL", value, items: gaItems([item]) });
  if (pixelActive && window.fbq) window.fbq("track", "AddToCart", { content_ids: [item.id], content_type: "product", value, currency: "BRL" });
}

export function trackBeginCheckout(items: TrackedItem[], totalCents: number) {
  if (gaActive && window.gtag) window.gtag("event", "begin_checkout", { currency: "BRL", value: reais(totalCents), items: gaItems(items) });
  if (pixelActive && window.fbq) window.fbq("track", "InitiateCheckout", { content_ids: items.map((i) => i.id), num_items: items.length, value: reais(totalCents), currency: "BRL" });
}

const PURCHASE_SENT_KEY = "rd:purchaseTracked";

/** Compra paga. Idempotente por pedido nesta aba (voltar/recarregar a página não duplica). */
export function trackPurchase(orderNumber: string, items: TrackedItem[], totalCents: number, shippingCents: number) {
  if (!gaActive && !pixelActive) return;
  try {
    if (sessionStorage.getItem(PURCHASE_SENT_KEY) === orderNumber) return;
    sessionStorage.setItem(PURCHASE_SENT_KEY, orderNumber);
  } catch {
    /* sem storage: segue, no pior caso duplica num reload */
  }
  if (gaActive && window.gtag) {
    window.gtag("event", "purchase", { transaction_id: orderNumber, currency: "BRL", value: reais(totalCents), shipping: reais(shippingCents), items: gaItems(items) });
  }
  if (pixelActive && window.fbq) {
    window.fbq("track", "Purchase", { content_ids: items.map((i) => i.id), content_type: "product", num_items: items.length, value: reais(totalCents), currency: "BRL" }, { eventID: orderNumber });
  }
}
