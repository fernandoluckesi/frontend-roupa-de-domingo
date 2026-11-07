import { Suspense, useCallback } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { lazyWithReload } from "./utils/lazyWithReload";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global";
import { themesByMode } from "./styles/theme";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Loading, ToastViewport } from "./components/ui";
import { useEasterEggs } from "./contexts/EasterEggContext";
import { useKonamiCode, useTypedPhrase } from "./hooks/useEasterEggTriggers";
import { CookieBanner } from "./components/legal/CookieBanner";
import { FakeDiscountPrank } from "./components/easter-eggs/FakeDiscountPrank";
import { RouteSeo } from "./components/seo/RouteSeo";

const Home = lazyWithReload(() => import("./pages/Home"));
const Catalog = lazyWithReload(() => import("./pages/Catalog"));
const ProductDetail = lazyWithReload(() => import("./pages/ProductDetail"));
const CartPage = lazyWithReload(() => import("./pages/CartPage"));
const Checkout = lazyWithReload(() => import("./pages/Checkout"));
const PaymentResult = lazyWithReload(() => import("./pages/PaymentResult"));
const MockCheckout = lazyWithReload(() => import("./pages/MockCheckout"));
const Login = lazyWithReload(() => import("./pages/Login"));
const Register = lazyWithReload(() => import("./pages/Register"));
const Account = lazyWithReload(() => import("./pages/Account"));
const Orders = lazyWithReload(() => import("./pages/Orders"));
const OrderDetail = lazyWithReload(() => import("./pages/OrderDetail"));
const Trophies = lazyWithReload(() => import("./pages/Trophies"));
const NotFound = lazyWithReload(() => import("./pages/NotFound"));
const ForgotPassword = lazyWithReload(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazyWithReload(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazyWithReload(() => import("./pages/auth/VerifyEmail"));
const ConfirmRegistration = lazyWithReload(() => import("./pages/auth/ConfirmRegistration"));
const Terms = lazyWithReload(() => import("./pages/legal/Terms"));
const Privacy = lazyWithReload(() => import("./pages/legal/Privacy"));
const Returns = lazyWithReload(() => import("./pages/legal/Returns"));
const Cookies = lazyWithReload(() => import("./pages/legal/Cookies"));
const About = lazyWithReload(() => import("./pages/legal/About"));
const Contact = lazyWithReload(() => import("./pages/legal/Contact"));
const Shipping = lazyWithReload(() => import("./pages/legal/Shipping"));
const SizeGuide = lazyWithReload(() => import("./pages/legal/SizeGuide"));
const Payments = lazyWithReload(() => import("./pages/legal/Payments"));

export default function App() {
  const { themeMode, setThemeMode, discover } = useEasterEggs();
  const location = useLocation();

  // Easter egg #1: Konami code liga o modo caos
  const handleKonami = useCallback(() => {
    setThemeMode(themeMode === "chaos" ? "default" : "chaos");
    void discover("KONAMI_CAOS");
  }, [themeMode, setThemeMode, discover]);

  useKonamiCode(handleKonami);

  // Easter egg #3: digitar "desculpa" em qualquer tela
  const handleApology = useCallback(() => {
    void discover("PEDIDO_DE_DESCULPAS");
  }, [discover]);

  useTypedPhrase("desculpa", handleApology);

  return (
    <ThemeProvider theme={themesByMode[themeMode]}>
      <GlobalStyle />
      <RouteSeo />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/produto/:slug" element={<ProductDetail />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/pagamento/simulado/:orderNumber"
              element={<MockCheckout />}
            />
            <Route path="/pagamento/:outcome" element={<PaymentResult />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/conta" element={<Account />} />
            <Route path="/conta/pedidos" element={<Orders />} />
            <Route path="/conta/pedidos/:number" element={<OrderDetail />} />
            <Route path="/trofeus" element={<Trophies />} />
            <Route path="/esqueci-a-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />
            <Route path="/verificar-email" element={<VerifyEmail />} />
            <Route path="/confirmar-cadastro" element={<ConfirmRegistration />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/trocas-e-devolucoes" element={<Returns />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/quem-somos" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/fale-conosco" element={<Navigate to="/contato" replace />} />
            <Route path="/entrega" element={<Shipping />} />
            <Route path="/guia-de-tamanhos" element={<SizeGuide />} />
            <Route path="/pagamentos" element={<Payments />} />
            <Route
              path="/pedidos"
              element={<Navigate to="/conta/pedidos" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <ToastViewport />
      <CookieBanner />
      <FakeDiscountPrank />
    </ThemeProvider>
  );
}
