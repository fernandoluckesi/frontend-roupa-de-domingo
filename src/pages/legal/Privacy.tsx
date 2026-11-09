import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import { COMPANY, COMPANY_ADDRESS_LINE, LEGAL_VERSIONS } from "../../config/company";

const PURPOSES = [
  {
    data: "Nome, e-mail, senha (guardada só como hash bcrypt), telefone",
    purpose: "Criar e manter sua conta, autenticar o acesso",
    basis: "Execução de contrato (art. 7º, V)",
  },
  {
    data: "CPF",
    purpose: "Emissão de nota fiscal e identificação do pagador no Mercado Pago (prevenção a fraude)",
    basis: "Obrigação legal (art. 7º, II) e execução de contrato (art. 7º, V)",
  },
  {
    data: "Endereço de entrega e nome de quem recebe",
    purpose: "Calcular frete, produzir e entregar o pedido",
    basis: "Execução de contrato (art. 7º, V)",
  },
  {
    data: "Itens, valores, status do pedido e do pagamento",
    purpose: "Processar a compra, atendimento, trocas, garantia e obrigações fiscais",
    basis: "Execução de contrato (art. 7º, V) e obrigação legal (art. 7º, II)",
  },
  {
    data: "Mensagens enviadas ao SAC",
    purpose: "Responder solicitações, reclamações e pedidos de direitos do titular",
    basis: "Execução de contrato (art. 7º, V) e exercício regular de direitos (art. 7º, VI)",
  },
  {
    data: "Endereço IP, data e hora de acesso, tentativas de login",
    purpose: "Segurança da conta, bloqueio de abuso e guarda de registros de acesso",
    basis: "Obrigação legal (Marco Civil, art. 15) e legítimo interesse (art. 7º, IX)",
  },
  {
    data: "Escolha de cookies (registro do consentimento)",
    purpose: "Comprovar o consentimento dado ou recusado",
    basis: "Obrigação legal (art. 8º, § 2º)",
  },
  {
    data: "Preferências do site (tema, easter eggs)",
    purpose: "Lembrar suas preferências de navegação",
    basis: "Consentimento (art. 7º, I), revogável em /cookies",
  },
  {
    data: "E-mail para novidades e promoções",
    purpose: "Enviar comunicação de marketing, só se você marcar a opção",
    basis: "Consentimento (art. 7º, I), revogável a qualquer momento",
  },
];

const RETENTION = [
  { category: "Dados da conta (nome, e-mail, telefone, endereços)", period: "Enquanto a conta existir. Ao excluir, são apagados ou anonimizados." },
  { category: "Pedidos, notas fiscais e dados fiscais (inclui CPF e endereço do pedido)", period: "5 anos após o pedido (legislação tributária, CTN art. 173 e 174)" },
  { category: "Dados de pagamento", period: "5 anos. Guardamos apenas status, meio, parcelas, valor e identificadores da transação; não guardamos o retorno completo do Mercado Pago nem dados de cartão." },
  { category: "Registros de acesso (IP, data e hora)", period: "6 meses (Marco Civil da Internet, art. 15)" },
  { category: "Registros de consentimento", period: "5 anos após a última escolha" },
  { category: "Mensagens do SAC", period: "5 anos (prazo de reclamação do CDC, art. 27)" },
  { category: "Carrinho de visitante sem conta", period: "Até 90 dias sem uso" },
];

const PROCESSORS = [
  { name: "Mercado Pago (MercadoPago.com Representações Ltda.)", role: "Processamento do pagamento", data: "Nome, e-mail, CPF, telefone, endereço e valor do pedido", country: "Brasil" },
  { name: "Railway Corporation", role: "Hospedagem do site, da API e do banco de dados", data: "Todos os dados armazenados pela loja (criptografados em trânsito; CPF criptografado também em repouso)", country: "Estados Unidos" },
  { name: "Provedor de e-mail transacional (SMTP)", role: "Envio de confirmação de pedido, redefinição de senha e respostas do SAC", data: "Nome, e-mail e conteúdo da mensagem", country: "A definir; esta política será atualizada ao contratar" },
  { name: "ViaCEP", role: "Preenchimento automático do endereço pelo CEP", data: "Apenas o CEP digitado, consultado diretamente pelo seu navegador", country: "Brasil" },
  { name: "Empresa Brasileira de Correios e Telégrafos (Correios)", role: "Entrega e logística reversa de devoluções", data: "Nome e endereço de quem recebe, conteúdo e valor declarado do pacote", country: "Brasil" },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Política de Privacidade"
      description="Como a Roupa de Domingo trata seus dados pessoais conforme a LGPD: dados coletados, bases legais, retenção, compartilhamento e como exercer seus direitos."
      path="/privacidade"
      updatedAt="4 de novembro de 2026"
      version={LEGAL_VERSIONS.privacy}
      printable
    >
      <p>
        Coletamos só o que precisamos para vender, produzir e entregar uma camiseta sarcástica.
        Seus dados não são o produto. As estampas são.
      </p>

      <h2 id="controlador">1. Controlador e encarregado (DPO)</h2>
      <p>
        O controlador dos dados é <strong>{COMPANY.legalName}</strong>, CNPJ {COMPANY.cnpj},{" "}
        {COMPANY_ADDRESS_LINE}.
      </p>
      <p>
        Encarregado pelo tratamento de dados pessoais (LGPD, art. 41):{" "}
        <strong>{COMPANY.dpo.name}</strong> —{" "}
        <a href={`mailto:${COMPANY.dpo.email}`}>{COMPANY.dpo.email}</a>. Também é possível falar
        com o encarregado pelo formulário de{" "}
        <Link to="/contato?assunto=privacidade">contato</Link>, assunto “Privacidade e dados
        pessoais”.
      </p>

      <h2 id="dados">2. Dados coletados, finalidade e base legal</h2>
      <table>
        <thead>
          <tr>
            <th>Dado</th>
            <th>Para quê</th>
            <th>Base legal (LGPD)</th>
          </tr>
        </thead>
        <tbody>
          {PURPOSES.map((row) => (
            <tr key={row.data}>
              <td>{row.data}</td>
              <td>{row.purpose}</td>
              <td>{row.basis}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <strong>O que não coletamos:</strong> dados de cartão (digitados apenas no ambiente do
        Mercado Pago), dados sensíveis (art. 5º, II), localização precisa, biometria. Não usamos
        ferramentas de analytics, pixels de anúncio nem fontes ou scripts de terceiros que
        rastreiem você; as fontes do site são servidas pelo nosso próprio servidor.
      </p>
      <p>
        Não tomamos decisões automatizadas que afetem seus interesses (art. 20), além do bloqueio
        temporário de login após tentativas erradas, que é uma medida de segurança e pode ser
        contestada pelo SAC.
      </p>

      <h2 id="retencao">3. Por quanto tempo guardamos</h2>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Prazo</th>
          </tr>
        </thead>
        <tbody>
          {RETENTION.map((row) => (
            <tr key={row.category}>
              <td>{row.category}</td>
              <td>{row.period}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Vencido o prazo, os dados são eliminados ou anonimizados de forma irreversível.</p>

      <h2 id="compartilhamento">4. Com quem compartilhamos (operadores)</h2>
      <p>
        Compartilhamos dados apenas com os operadores abaixo, na medida necessária para cada
        finalidade. Não vendemos nem alugamos dados pessoais.
      </p>
      <table>
        <thead>
          <tr>
            <th>Operador</th>
            <th>Função</th>
            <th>Dados</th>
            <th>País</th>
          </tr>
        </thead>
        <tbody>
          {PROCESSORS.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.role}</td>
              <td>{row.data}</td>
              <td>{row.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Também podemos fornecer dados a autoridades públicas quando houver ordem judicial ou
        obrigação legal.
      </p>

      <h2 id="transferencia-internacional">5. Transferência internacional</h2>
      <p>
        A Railway (hospedagem) fica nos Estados Unidos, então os dados armazenados pela loja são
        transferidos para fora do Brasil. Essa transferência se baseia no art. 33 da LGPD: é
        necessária para executar o contrato de compra que você pediu (inciso IX) e é feita com um
        operador que se compromete contratualmente com padrões de proteção compatíveis com a LGPD
        (cláusulas contratuais, inciso II). A produção e o envio dos produtos são feitos por nós,
        no Brasil.
      </p>

      <h2 id="seguranca">6. Como protegemos seus dados</h2>
      <ul>
        <li>Conexão sempre criptografada (HTTPS, com HSTS).</li>
        <li>Senha guardada apenas como hash bcrypt; nem nós conseguimos lê-la.</li>
        <li>CPF criptografado no banco de dados (AES-256) e mascarado nos registros do sistema.</li>
        <li>Sessão de login em cookie protegido (httpOnly, SameSite), inacessível a scripts da página.</li>
        <li>Limite de tentativas de login e bloqueio temporário contra força bruta.</li>
        <li>Cabeçalhos de segurança (Content-Security-Policy, entre outros) contra injeção de código.</li>
        <li>Acesso administrativo com autenticação em dois fatores e registro de auditoria.</li>
        <li>Backups do banco de dados com restauração testada.</li>
        <li>Pagamento por redirecionamento ao Mercado Pago: dados de cartão nunca passam pelos nossos servidores.</li>
      </ul>

      <h2 id="direitos">7. Seus direitos (LGPD, art. 18) e como exercê-los</h2>
      <p>Você pode, a qualquer momento e de graça:</p>
      <ul>
        <li><strong>Confirmar</strong> se tratamos seus dados e <strong>acessá-los</strong>;</li>
        <li><strong>Corrigir</strong> dados incompletos, inexatos ou desatualizados;</li>
        <li>Pedir <strong>anonimização, bloqueio ou eliminação</strong> de dados desnecessários ou tratados em desconformidade;</li>
        <li>Obter a <strong>portabilidade</strong> dos dados em formato estruturado;</li>
        <li>Pedir a <strong>eliminação</strong> dos dados tratados com base no consentimento;</li>
        <li>Saber com quem os dados foram <strong>compartilhados</strong> (seção 4);</li>
        <li>Ser informado sobre a possibilidade de não consentir e suas consequências;</li>
        <li><strong>Revogar o consentimento</strong> dado para marketing ou cookies de preferência.</li>
      </ul>
      <h3>Pelo próprio site, na hora</h3>
      <p>
        Em <Link to="/conta">Minha conta</Link> → <strong>Privacidade e dados</strong> você pode:
      </p>
      <ul>
        <li>baixar todos os seus dados em arquivo JSON (acesso e portabilidade);</li>
        <li>corrigir nome, telefone, CPF e endereços;</li>
        <li>ligar ou desligar o recebimento de e-mails de marketing;</li>
        <li>excluir a conta.</li>
      </ul>
      <p>
        Na exclusão da conta, apagamos seus dados de cadastro, endereços, carrinho e preferências.
        Pedidos já feitos são mantidos com os dados mínimos exigidos pela legislação fiscal pelo
        prazo da seção 3, desvinculados do seu login. Cookies de preferência podem ser revogados
        em <Link to="/cookies">Cookies</Link>.
      </p>
      <h3>Por e-mail</h3>
      <p>
        Escreva para <a href={`mailto:${COMPANY.dpo.email}`}>{COMPANY.dpo.email}</a>. Para sua
        segurança, podemos pedir confirmação de identidade. Respondemos em até{" "}
        <strong>15 dias</strong> (art. 19, II). Você também pode reclamar à Autoridade Nacional de
        Proteção de Dados (ANPD) em gov.br/anpd.
      </p>

      <h2 id="incidentes">8. Incidentes de segurança</h2>
      <p>
        Se ocorrer um incidente que possa causar risco ou dano relevante a você, comunicaremos a
        ANPD e os titulares afetados em prazo razoável (art. 48), informando o que aconteceu, os
        dados envolvidos, os riscos e as medidas adotadas. Mantemos plano interno de resposta a
        incidentes e registro das operações de tratamento (art. 37).
      </p>

      <h2 id="cookies">9. Cookies e armazenamento no navegador</h2>
      <p>
        Usamos apenas armazenamento próprio e funcional. A lista completa, com finalidade e
        duração, e o botão para mudar sua escolha estão em <Link to="/cookies">Cookies</Link>.
      </p>

      <h2 id="menores">10. Crianças e adolescentes</h2>
      <p>
        O site não é direcionado a menores de 18 anos e não coletamos dados de crianças de forma
        intencional. Compras de adolescentes devem ser feitas pelo responsável legal. Se
        identificarmos dados de criança coletados sem consentimento do responsável (art. 14),
        eles serão eliminados.
      </p>

      <h2 id="alteracoes">11. Alterações desta política</h2>
      <p>
        Mudanças relevantes serão avisadas no site e, quando exigirem novo consentimento, pedidas
        de novo. A versão e a data de vigência ficam no topo desta página.
      </p>
    </LegalPage>
  );
}
