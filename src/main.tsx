import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import { EasterEggProvider } from "./contexts/EasterEggContext";
import { CartProvider } from "./contexts/CartContext";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Elemento #root não encontrado. Alguém mexeu no index.html.");
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <EasterEggProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </EasterEggProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
