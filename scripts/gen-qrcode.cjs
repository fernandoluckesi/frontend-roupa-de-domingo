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
const TARGET = `${SITE.replace(/\/$/, "")}/segredo`;

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

  // SVG: vetor para usar em qualquer tamanho de impressao sem perder nitidez.
  const svg = await QRCode.toString(TARGET, { ...OPTIONS, type: "svg" });
  fs.writeFileSync(path.join(OUT_DIR, "segredo.svg"), svg);

  // PNG 1024: para quem precisa de bitmap (etiqueta, post, marketplace).
  await QRCode.toFile(path.join(OUT_DIR, "segredo-1024.png"), TARGET, {
    ...OPTIONS,
    width: 1024,
  });

  console.log(`QR Code gerado para ${TARGET}`);
  console.log(`  ${path.join(OUT_DIR, "segredo.svg")}`);
  console.log(`  ${path.join(OUT_DIR, "segredo-1024.png")}`);
}

main().catch((error) => {
  console.error("Falha ao gerar o QR Code:", error.message);
  process.exit(1);
});
