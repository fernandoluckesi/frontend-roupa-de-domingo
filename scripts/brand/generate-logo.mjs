// Gera a logo da Roupa de Domingo e todos os derivados (favicon, ícones PWA, imagem OG).
// Uso: npm run brand:generate
//
// - Logotipo: só texto ("Roupa de Domingo" + "ESTAMPAS SEM ANESTESIA").
// - Monograma "RD": para espaços pequenos (favicon, ícones, avatar).
// - Textos convertidos em path: os SVGs não dependem das fontes instaladas.
// Fontes em scripts/brand/fonts (Archivo Black e Space Grotesk, licença SIL OFL).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const BRAND = path.join(ROOT, "src", "assets", "brand");
const PUBLIC = path.join(ROOT, "public");

// Mesmos valores de `palette` em src/styles/theme.ts
const C = {
  lime: "#d7ff3e",
  ink: "#121212",
  black: "#0f0f10",
  snow: "#f4f4f5",
  silver: "#a1a1aa",
  white: "#ffffff",
};

const archivo = opentype.loadSync(path.join(HERE, "fonts", "ArchivoBlack-Regular.ttf"));
const grotesk = opentype.loadSync(path.join(HERE, "fonts", "SpaceGrotesk-var.ttf"));
const groteskSemi = opentype.loadSync(path.join(HERE, "fonts", "SpaceGrotesk-SemiBold.woff"));

/** Texto -> path SVG. tracking em unidades da fonte (1/1000 em). */
function textPath(font, text, { size, x = 0, y = 0, anchor = "start", tracking = 0 }) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  const step = (g, i) =>
    g.advanceWidth * scale +
    (i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) * scale + tracking * scale : 0);
  const width = glyphs.reduce((sum, g, i) => sum + step(g, i), 0);
  let cx = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  const d = glyphs
    .map((g, i) => {
      const part = g.getPath(cx, y, size).toPathData(2);
      cx += step(g, i);
      return part;
    })
    .join("");
  return { d, width };
}

// ---------- Logotipo (só texto) ----------
const TITLE = { size: 96, tracking: -20 };
const TAG = { size: 30, tracking: 160 };
const TITLE_BASELINE = 90;
const TAG_BASELINE = 158; // espaço maior entre o título e a frase
const LOGO_PAD = 4;

function wordmark({ title, tagline, x = 0, y = 0, scale = 1 }) {
  const t = textPath(archivo, "Roupa de Domingo", { ...TITLE, x: LOGO_PAD, y: TITLE_BASELINE });
  const s = textPath(groteskSemi, "ESTAMPAS SEM ANESTESIA", { ...TAG, x: LOGO_PAD + 4, y: TAG_BASELINE });
  const width = Math.ceil(Math.max(t.width, s.width) + LOGO_PAD * 2 + 4);
  const height = TAG_BASELINE + 14;
  const g = `<g transform="translate(${x} ${y}) scale(${scale})"><path d="${t.d}" fill="${title}"/><path d="${s.d}" fill="${tagline}"/></g>`;
  return { g, width, height };
}

function logoSvg({ title, tagline, bg }) {
  const pad = bg ? 48 : 0;
  const w = wordmark({ title, tagline, x: pad, y: pad });
  const width = w.width + pad * 2;
  const height = w.height + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bg ? `<rect width="${width}" height="${height}" fill="${bg}"/>` : ""}
  ${w.g}
</svg>
`;
}

// ---------- Monograma "RD" ----------
const rd = textPath(archivo, "RD", { size: 300, x: 256, y: 364, anchor: "middle", tracking: -40 });

/** Ícone quadrado 512 com fundo. inset encolhe o "RD" (área segura do ícone maskable). */
function monogramSvg({ letters, bg, radius = 112, size = 512, inset = 0 }) {
  const s = 1 - inset;
  const t = 256 * inset;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  ${bg ? `<rect width="512" height="512" rx="${radius}" fill="${bg}"/>` : ""}
  <path transform="translate(${t} ${t}) scale(${s})" d="${rd.d}" fill="${letters}"/>
</svg>
`;
}

// ---------- Imagem Open Graph ----------
function ogSvg() {
  const w = wordmark({ title: C.snow, tagline: C.lime, x: 80, y: 170, scale: 1.05 });
  const l1 = textPath(grotesk, "Camisetas, moletons, canecas, capas e garrafas", { size: 32, x: 84, y: 470 });
  const l2 = textPath(grotesk, "com humor ácido. Produção sob demanda.", { size: 32, x: 84, y: 518 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.black}"/>
  <rect width="1200" height="14" fill="${C.lime}"/>
  ${w.g}
  <path d="${l1.d}" fill="${C.silver}"/>
  <path d="${l2.d}" fill="${C.silver}"/>
</svg>
`;
}

const png = (svg, width) => new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(`${path.relative(ROOT, file)}  ${data.length} bytes`);
}

// Logotipo
const logoDark = logoSvg({ title: C.snow, tagline: C.lime }); // para fundo escuro
const logoLight = logoSvg({ title: C.ink, tagline: C.ink }); // para fundo claro
write(path.join(BRAND, "logo.svg"), logoDark);
write(path.join(BRAND, "logo-light.svg"), logoLight);
write(path.join(BRAND, "logo.png"), png(logoSvg({ title: C.snow, tagline: C.lime, bg: C.black }), 1600));
write(path.join(BRAND, "logo-light.png"), png(logoSvg({ title: C.ink, tagline: C.ink, bg: C.white }), 1600));

// Monograma
write(path.join(BRAND, "rd-dark.svg"), monogramSvg({ letters: C.lime, bg: C.black })); // RD lima no preto
write(path.join(BRAND, "rd-lime.svg"), monogramSvg({ letters: C.ink, bg: C.lime })); // RD preto no lima
write(path.join(BRAND, "rd-white.svg"), monogramSvg({ letters: C.ink, bg: C.white })); // RD preto no branco
write(path.join(BRAND, "rd-dark-1024.png"), png(monogramSvg({ letters: C.lime, bg: C.black }), 1024));
write(path.join(BRAND, "rd-lime-1024.png"), png(monogramSvg({ letters: C.ink, bg: C.lime }), 1024));

// Favicon e ícones
write(path.join(PUBLIC, "favicon.svg"), monogramSvg({ letters: C.lime, bg: C.black }));
write(path.join(PUBLIC, "favicon-32.png"), png(monogramSvg({ letters: C.lime, bg: C.black, radius: 96 }), 32));
write(path.join(PUBLIC, "icons", "apple-touch-icon.png"), png(monogramSvg({ letters: C.lime, bg: C.black, radius: 0 }), 180));
write(path.join(PUBLIC, "icons", "icon-192.png"), png(monogramSvg({ letters: C.lime, bg: C.black }), 192));
write(path.join(PUBLIC, "icons", "icon-512.png"), png(monogramSvg({ letters: C.lime, bg: C.black }), 512));
write(
  path.join(PUBLIC, "icons", "icon-maskable-512.png"),
  png(monogramSvg({ letters: C.lime, bg: C.black, radius: 0, inset: 0.2 }), 512),
);
write(path.join(PUBLIC, "og-default.png"), png(ogSvg(), 1200));

// Paths para o componente React (herda as cores do tema)
write(
  path.join(ROOT, "src", "components", "brand", "brandPaths.ts"),
  `// Gerado por scripts/brand/generate-logo.mjs. Não edite à mão: rode npm run brand:generate.
export const RD_MONOGRAM = {
  viewBox: "0 0 512 512",
  letters: "${rd.d}",
} as const;
`,
);
