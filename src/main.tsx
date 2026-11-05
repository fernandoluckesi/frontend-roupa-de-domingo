// Fontes servidas pelo próprio site (sem Google Fonts: nenhum IP de visitante vai a terceiros)
import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-600.css";
import "@fontsource/archivo/latin-800.css";
import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import { EasterEggProvider } from "./contexts/EasterEggContext";
import { CartProvider } from "./contexts/CartContext";
import { ConsentProvider } from "./contexts/ConsentContext";

// O nginx injeta meta tags por rota (SSI) para robôs e previews de link. No navegador
// o react-helmet-async assume: remove as do servidor para não duplicar canonical/JSON-LD.
document.querySelectorAll("[data-ssi]").forEach((node) => {
  if (node.tagName !== "TITLE") node.remove();
});

const container = document.getElementById("root");

if (!container) {
  throw new Error("Elemento #root não encontrado. Alguém mexeu no index.html.");
}

createRoot(container).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ConsentProvider>
          <ToastProvider>
            <AuthProvider>
              <EasterEggProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </EasterEggProvider>
            </AuthProvider>
          </ToastProvider>
        </ConsentProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
