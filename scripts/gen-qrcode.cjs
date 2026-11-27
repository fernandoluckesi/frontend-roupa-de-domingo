/**
 * Gera os QR Codes de /segredo em src/assets/brand/QRCodes.
 *
 * Nao e parte do build: roda sob demanda quando a URL muda.
 *   node scripts/gen-qrcode.cjs [url-base]
 *
 * A dependencia "qrcode" e resolvida pelo npx, para nao entrar no
 * package.json de um app que nao gera QR em tempo de execucao.
 */
const fs = require("node:fs");
const path = require("node:path");
const QRCode = require("qrcode");

const SITE =
  process.argv[2] ?? "https://roupadedomingo.com.br";
const BASE = `${SITE.replace(/\/$/, "")}/segredo`;

// Um QR por local de impressao: o ?q= diz ao painel de analise de onde veio o acesso
// (ver docs-roupa-de-domingo/ANALISE-DE-ACESSOS.md). "segredo" e o QR original, sem local.
const VARIANTS = [
  { file: "segredo", url: BASE },
  { file: "camiseta-costas", url: `${BASE}?q=costas`, printPx: 3000 },
];

const OUT_DIR = path.join(__dirname, "..", "src", "assets", "brand", "QRCodes");

// Preto no branco: maior contraste e leitura mais tolerante na impressao.
// margin 2 = quiet zone minima recomendada pela especificacao.
// correcao "H" (30%): sobrevive a etiqueta amassada, dobra e tinta falhada.
const OPTIONS = {
  errorCorrectionLevel: "H",
  margin: 2,
  color: { dark: "#111111", light: "#FFFFFF" },
};

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const { file, url, printPx } of VARIANTS) {
    // SVG: vetor para usar em qualquer tamanho de impressao sem perder nitidez.
    const svg = await QRCode.toString(url, { ...OPTIONS, type: "svg" });
    fs.writeFileSync(path.join(OUT_DIR, `${file}.svg`), svg);

    // PNG 1024: para quem precisa de bitmap (etiqueta, post, marketplace).
    await QRCode.toFile(path.join(OUT_DIR, `${file}-1024.png`), url, { ...OPTIONS, width: 1024 });

    // Arte de impressao (300 DPI): vai junto das outras artes em docs/catalog/print-arts
    if (printPx) {
      const printDir = path.join(__dirname, "..", "..", "docs-roupa-de-domingo", "catalog", "print-arts", "qrcode");
      fs.mkdirSync(printDir, { recursive: true });
      await QRCode.toFile(path.join(printDir, `${file}-${printPx}px.png`), url, { ...OPTIONS, width: printPx });
    }

    console.log(`QR Code gerado para ${url} (${file})`);
  }
}

main().catch((error) => {
  console.error("Falha ao gerar o QR Code:", error.message);
  process.exit(1);
});
