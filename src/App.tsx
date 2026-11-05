import { Suspense, lazy, useCallback } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global";
import { themesByMode } from "./styles/theme";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Loading, ToastViewport } from "./components/ui";
import { useEasterEggs } from "./contexts/EasterEggContext";
import { useKonamiCode, useTypedPhrase } from "./hooks/useEasterEggTriggers";
import { CookieBanner } from "./components/legal/CookieBanner";
import { RouteSeo } from "./components/seo/RouteSeo";

const Home = lazy(() => import("./pages/Home"));
const Catalog = lazy(() => import("./pages/Catalog"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CartPage = lazy(() => import("./pages/CartPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentResult = lazy(() => import("./pages/PaymentResult"));
const MockCheckout = lazy(() => import("./pages/MockCheckout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Account = lazy(() => import("./pages/Account"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Trophies = lazy(() => import("./pages/Trophies"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Returns = lazy(() => import("./pages/legal/Returns"));
const Cookies = lazy(() => import("./pages/legal/Cookies"));
const About = lazy(() => import("./pages/legal/About"));
const Contact = lazy(() => import("./pages/legal/Contact"));
const Shipping = lazy(() => import("./pages/legal/Shipping"));
const SizeGuide = lazy(() => import("./pages/legal/SizeGuide"));
const Payments = lazy(() => import("./pages/legal/Payments"));

export default function App() {
  const { themeMode, setThemeMode, discover } = useEasterEggs();

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
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/trocas-e-devolucoes" element={<Returns />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/quem-somos" element={<About />} />
            <Route path="/contato" element={<Contact />} />
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
      </main>
      <Footer />
      <ToastViewport />
      <CookieBanner />
    </ThemeProvider>
  );
}
