import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// 5273 em vez da 5173 padrao do Vite: a 5173 costuma estar ocupada por outro
// projeto na maquina de desenvolvimento, e o browser acaba abrindo a aplicacao
// errada. Sobreponha com a variavel PORT se precisar.
const PORT = Number(process.env.PORT ?? 5273);

export default defineConfig({
  plugins: [react()],
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
});
