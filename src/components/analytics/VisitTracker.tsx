import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useConsent } from "../../contexts/ConsentContext";
import { trackPage } from "../../lib/visitTracking";

/** Página vista a cada troca de rota (ver src/lib/visitTracking.ts). */
export function VisitTracker() {
  const { pathname, search } = useLocation();
  const { choice } = useConsent();
  // Só quem escolheu recusar "Estatísticas" fica no modo mínimo; sem escolha ainda, conta normal
  const refused = choice?.statistics === false;

  useEffect(() => {
    trackPage(pathname, search, refused);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  return null;
}
