import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import { Button } from "../../components/ui";
import { LEGAL_VERSIONS } from "../../config/company";
import { useConsent } from "../../contexts/ConsentContext";

const STORAGE_ITEMS = [
  { key: "rd_session", type: "Cookie (httpOnly)", category: "Essencial", purpose: "Mantém você logado com segurança. Não pode ser lido por scripts da página.", duration: "7 dias, ou até sair da conta" },
  { key: "rd:sessionId", type: "localStorage", category: "Essencial", purpose: "Identifica o carrinho de quem ainda não tem conta.", duration: "Até você limpar os dados do navegador" },
  { key: "rd:zipCode", type: "localStorage", category: "Essencial", purpose: "Lembra o CEP para recalcular o frete.", duration: "Até você limpar os dados do navegador" },
  { key: "rd:lastOrder", type: "sessionStorage", category: "Essencial", purpose: "Mostra o pedido certo ao voltar do Mercado Pago.", duration: "Até fechar a aba" },
  { key: "rd:cookieConsent", type: "localStorage", category: "Essencial", purpose: "Guarda a sua escolha sobre cookies (e a versão desta política).", duration: "Até mudar a versão da política ou você limpar o navegador" },
  { key: "rd:themeMode", type: "localStorage", category: "Preferências", purpose: "Lembra o tema visual escolhido (incluindo o modo caos).", duration: "Até revogar ou limpar o navegador" },
  { key: "rd:emptyCartViews", type: "sessionStorage", category: "Preferências", purpose: "Conta visitas ao carrinho vazio (easter egg).", duration: "Até fechar a aba" },
];

const CATEGORIES = [
  { name: "Essenciais", status: "Sempre ativos", text: "Necessários para o login, o carrinho, o frete e o pagamento funcionarem. Não dependem de consentimento (LGPD, art. 7º, V)." },
  { name: "Preferências", status: "Opcional", text: "Lembram escolhas de navegação, como o tema e os easter eggs. Se recusar, o site funciona normalmente, só esquece essas escolhas." },
  { name: "Estatísticas", status: "Opcional · nenhum em uso", text: "Mediriam o uso do site de forma agregada. Hoje não usamos nenhuma ferramenta de analytics." },
  { name: "Marketing", status: "Opcional · nenhum em uso", text: "Serviriam para anúncios personalizados. Hoje não há pixel de anúncio nem cookie de terceiros." },
];

export default function Cookies() {
  const { openPreferences, choice } = useConsent();

  return (
    <LegalPage
      title="Política de Cookies"
      description="Quais cookies e dados de navegador a Roupa de Domingo usa, para quê, por quanto tempo, e como aceitar, recusar ou mudar sua escolha."
      path="/cookies"
      updatedAt="4 de novembro de 2026"
      version={LEGAL_VERSIONS.cookies}
    >
      <p>
        Cookies aqui são só os de computador. Os de comer, infelizmente, não entregamos. Esta
        página lista tudo o que o site guarda no seu navegador.
      </p>

      <h2 id="sua-escolha">Sua escolha</h2>
      <p>
        {choice
          ? `Escolha registrada em ${new Date(choice.decidedAt).toLocaleString("pt-BR")}: preferências ${choice.preferences ? "permitidas" : "recusadas"}, estatísticas ${choice.statistics ? "permitidas" : "recusadas"}, marketing ${choice.marketing ? "permitido" : "recusado"}.`
          : "Você ainda não fez uma escolha. Até lá, só os itens essenciais são usados."}
      </p>
      <p>
        <Button type="button" $variant="secondary" onClick={openPreferences}>
          Alterar preferências de cookies
        </Button>
      </p>
      <p>
        Recusar é tão fácil quanto aceitar: o aviso de cookies tem os botões “Aceitar todos” e
        “Recusar opcionais” lado a lado, com o mesmo destaque, e você pode mudar de ideia a
        qualquer momento por este botão ou pelo link “Preferências de cookies” no rodapé. Ao
        recusar, apagamos na hora o que dependia do consentimento.
      </p>

      <h2 id="categorias">Categorias</h2>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Situação</th>
            <th>Para quê</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.status}</td>
              <td>{row.text}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id="lista">Lista completa</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Finalidade</th>
            <th>Duração</th>
          </tr>
        </thead>
        <tbody>
          {STORAGE_ITEMS.map((row) => (
            <tr key={row.key}>
              <td>
                <code>{row.key}</code>
              </td>
              <td>{row.type}</td>
              <td>{row.category}</td>
              <td>{row.purpose}</td>
              <td>{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id="terceiros">Terceiros</h2>
      <p>
        Não há cookies de terceiros no site. Ao pagar, você é levado ao ambiente do Mercado Pago,
        que tem a própria política de cookies. Se um dia adicionarmos ferramentas de estatística
        ou marketing, elas só serão carregadas <strong>depois</strong> do seu consentimento na
        categoria correspondente, e esta página será atualizada com uma nova versão — o que faz o
        aviso aparecer de novo para você decidir.
      </p>

      <h2 id="registro">Registro da escolha</h2>
      <p>
        Guardamos a sua escolha, a data e a versão desta política no navegador e em nosso
        servidor (associada ao identificador anônimo da sessão ou à sua conta), para comprovar o
        consentimento como exige a LGPD (art. 8º, § 2º). Mais detalhes na{" "}
        <Link to="/privacidade">Política de Privacidade</Link>.
      </p>
    </LegalPage>
  );
}
