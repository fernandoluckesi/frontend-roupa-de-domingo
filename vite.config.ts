import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// 5273 em vez da 5173 padrao do Vite: a 5173 costuma estar ocupada por outro
// projeto na maquina de desenvolvimento, e o browser acaba abrindo a aplicacao
// errada. Sobreponha com a variavel PORT se precisar.
const PORT = Number(process.env.PORT ?? 5273);

/**
 * Meta tags de verificação de propriedade (Google Search Console e Bing Webmaster).
 * Só entram no index.html quando a variável existe no build. A alternativa sem
 * código é verificar o domínio por registro TXT no Cloudflare.
 */
function siteVerification(env: Record<string, string>): Plugin {
  const tags = [
    ["google-site-verification", env.VITE_GOOGLE_SITE_VERIFICATION],
    ["msvalidate.01", env.VITE_BING_SITE_VERIFICATION],
  ]
    .filter(([, value]) => value && /^[A-Za-z0-9_-]{8,100}$/.test(value.trim()))
    .map(([name, value]) => ({ tag: "meta", attrs: { name, content: value.trim() }, injectTo: "head" as const }));
  return { name: "site-verification", transformIndexHtml: () => tags };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), siteVerification({ ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env } as Record<string, string>)],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: "0.0.0.0",
    port: PORT,
    // falha explicitamente se a porta estiver ocupada, em vez de escolher outra
    // silenciosamente e deixar voce achando que abriu a loja errada
    strictPort: true,
    // necessario para hot reload dentro do container no Windows
    watch: { usePolling: true },
  },
  preview: { host: "0.0.0.0", port: PORT, strictPort: true },
  build: { outDir: "dist", sourcemap: false },
}));
