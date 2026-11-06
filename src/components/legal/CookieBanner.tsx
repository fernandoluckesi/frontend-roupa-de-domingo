import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button, Checkbox } from "../ui";
import { useConsent } from "../../contexts/ConsentContext";

const Banner = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 60;
  max-width: 660px;
  width: calc(100% - ${({ theme }) => theme.spacing(8)});
  max-height: calc(100dvh - ${({ theme }) => theme.spacing(8)});
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(5)};
  box-shadow: ${({ theme }) => theme.shadow.lg};

  h2 {
    font-size: 1rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    font-size: 0.86rem;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.textSoft};
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing(2)};
  }

  .configure {
    grid-column: 1 / -1;
  }

  .categories {
    display: grid;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  .category small {
    display: block;
    color: ${({ theme }) => theme.colors.textFaint};
    font-size: 0.78rem;
    margin-left: 24px;
  }

  @media print {
    display: none;
  }
`;

/**
 * Banner de consentimento. "Aceitar todos" e "Recusar opcionais" têm o mesmo
 * peso visual (recusar tão fácil quanto aceitar). Nada opcional roda antes da escolha.
 */
export function CookieBanner() {
  const { bannerOpen, preferencesOpen, acceptAll, rejectAll, save, openPreferences, closePreferences, choice } =
    useConsent();
  const [prefs, setPrefs] = useState({ preferences: false, statistics: false, marketing: false });
  const firstButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (preferencesOpen) {
      setPrefs({
        preferences: choice?.preferences ?? false,
        statistics: choice?.statistics ?? false,
        marketing: choice?.marketing ?? false,
      });
    }
  }, [preferencesOpen, choice]);

  useEffect(() => {
    if (preferencesOpen) firstButton.current?.focus();
  }, [preferencesOpen]);

  if (!bannerOpen && !preferencesOpen) return null;

  if (preferencesOpen) {
    return (
      <Banner role="dialog" aria-modal="false" aria-labelledby="cookie-prefs-title" aria-label="Preferências de cookies">
        <h2 id="cookie-prefs-title">Preferências de cookies</h2>
        <div className="categories">
          <div className="category">
            <Checkbox id="cookie-essential" checked onChange={() => undefined}>
              <strong>Essenciais</strong> (sempre ativos)
            </Checkbox>
            <small>Sessão, carrinho, CEP do frete e a sua escolha de cookies. Sem eles a loja não funciona.</small>
          </div>
          <div className="category">
            <Checkbox
              id="cookie-preferences"
              checked={prefs.preferences}
              onChange={(v) => setPrefs((p) => ({ ...p, preferences: v }))}
            >
              <strong>Preferências</strong>
            </Checkbox>
            <small>Lembra o tema visual e alguns easter eggs entre visitas.</small>
          </div>
          <div className="category">
            <Checkbox
              id="cookie-statistics"
              checked={prefs.statistics}
              onChange={(v) => setPrefs((p) => ({ ...p, statistics: v }))}
            >
              <strong>Estatísticas</strong>
            </Checkbox>
            <small>Hoje não usamos nenhuma ferramenta de estatística. Se um dia usarmos, só com o seu sim.</small>
          </div>
          <div className="category">
            <Checkbox
              id="cookie-marketing"
              checked={prefs.marketing}
              onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
            >
              <strong>Marketing</strong>
            </Checkbox>
            <small>Nenhum pixel de anúncio instalado hoje. Mesma regra: só com o seu sim.</small>
          </div>
        </div>
        <div className="actions">
          <Button ref={firstButton} $variant="secondary" $size="sm" type="button" onClick={rejectAll}>
            Recusar opcionais
          </Button>
          <Button $size="sm" type="button" onClick={() => save(prefs)}>
            Salvar escolha
          </Button>
          {choice && (
            <Button className="configure" $variant="ghost" $size="sm" type="button" onClick={closePreferences}>
              Fechar sem alterar
            </Button>
          )}
        </div>
      </Banner>
    );
  }

  return (
    <Banner role="region" aria-label="Aviso de cookies">
      <h2>Cookies, só os que precisamos</h2>
      <p>
        Usamos armazenamento essencial para a loja funcionar (sessão, carrinho, frete). Os opcionais, como lembrar o
        tema, só com a sua permissão. Detalhes na <Link to="/cookies">política de cookies</Link>.
      </p>
      <div className="actions">
        <Button $variant="secondary" $size="sm" type="button" onClick={rejectAll}>
          Recusar opcionais
        </Button>
        <Button $size="sm" type="button" onClick={acceptAll}>
          Aceitar todos
        </Button>
        <Button className="configure" $variant="ghost" $size="sm" type="button" onClick={openPreferences}>
          Configurar
        </Button>
      </div>
    </Banner>
  );
}
