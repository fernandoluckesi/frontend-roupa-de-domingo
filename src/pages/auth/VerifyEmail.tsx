import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Container, Loading, Section } from "../../components/ui";
import { Seo } from "../../components/seo/Seo";
import { authService } from "../../services/auth.service";
import { extractError } from "../../services/http";
import { useAuth } from "../../contexts/AuthContext";
import { AuthPanel } from "./AuthPanel";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { refresh } = useAuth();
  const [state, setState] = useState<"loading" | "done" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "Link incompleto.");
  const ran = useRef(false);

  useEffect(() => {
    // StrictMode roda efeitos duas vezes em dev; o token é de uso único
    if (!token || ran.current) return;
    ran.current = true;
    authService
      .verifyEmail(token)
      .then(() => {
        setState("done");
        void refresh();
      })
      .catch((err) => {
        setState("error");
        setMessage(extractError(err, "Link inválido ou expirado."));
      });
  }, [token, refresh]);

  return (
    <Section $tight>
      <Seo title="Confirmar e-mail" description="Confirmação de e-mail." path="/verificar-email" noindex />
      <Container>
        <AuthPanel>
          <h1>Confirmação de e-mail</h1>
          {state === "loading" && <Loading label="Conferindo o link..." />}
          {state === "done" && (
            <p className="sub" role="status">
              E-mail confirmado. Agora a gente sabe onde te encontrar (só para assuntos do pedido).
            </p>
          )}
          {state === "error" && (
            <p className="sub" role="alert">
              {message} Você pode pedir um novo link em <Link to="/conta">Minha conta</Link>.
            </p>
          )}
          <p className="alt">
            <Link to="/conta">Ir para Minha conta</Link>
          </p>
        </AuthPanel>
      </Container>
    </Section>
  );
}
