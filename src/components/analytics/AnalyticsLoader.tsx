import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useConsent } from "../../contexts/ConsentContext";
import { disableGa, disablePixel, enableGa, enablePixel, trackPageView } from "../../lib/analytics";

/**
 * Liga/desliga GA4 (Estatísticas) e Meta Pixel (Marketing) conforme o consentimento
 * e registra um page_view a cada troca de rota. Sem IDs configurados, não faz nada.
 */
export function AnalyticsLoader() {
  const { choice } = useConsent();
  const { pathname } = useLocation();
  const statistics = choice?.statistics === true;
  const marketing = choice?.marketing === true;

  useEffect(() => {
    if (statistics) enableGa();
    else disableGa();
  }, [statistics]);

  useEffect(() => {
    if (marketing) enablePixel();
    else disablePixel();
  }, [marketing]);

  useEffect(() => {
    // Espera o Helmet atualizar o <title> da nova rota
    const timer = window.setTimeout(() => trackPageView(pathname), 0);
    return () => window.clearTimeout(timer);
  }, [pathname, statistics, marketing]);

  return null;
}
