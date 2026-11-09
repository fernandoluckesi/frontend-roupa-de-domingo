import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import {
  COMPANY,
  COMPANY_ADDRESS_LINE,
  LEGAL_VERSIONS,
} from "../../config/company";

export default function Terms() {
  return (
    <LegalPage
      title="Termos de Uso"
      description="Regras de uso do site e de compra na Roupa de Domingo: cadastro, preços, propriedade intelectual, cupons, foro e notificação de direito autoral."
      path="/termos"
      updatedAt="4 de novembro de 2026"
      version={LEGAL_VERSIONS.terms}
      printable
    >
      <p>
        Ninguém lê termos de uso. Você está lendo. Isso já te coloca acima da
        média. Abaixo estão as regras, escritas da forma mais clara que
        conseguimos — sem ironia nas cláusulas.
      </p>

      <h2 id="objeto">1. Quem somos e o que este documento regula</h2>
      <p>
        Este site é operado por <strong>{COMPANY.legalName}</strong>, CNPJ{" "}
        {COMPANY.cnpj}, com endereço em {COMPANY_ADDRESS_LINE} (“
        {COMPANY.tradeName}”, “nós”). Estes Termos regulam o acesso ao site e a
        compra de produtos (camisetas, moletons, canecas e garrafas com estampas
        próprias).
      </p>
      <p>
        Todos os produtos têm <strong>estampa fechada</strong>, definida por
        nós. Não vendemos produtos personalizados pelo cliente: você escolhe
        apenas as variantes do catálogo (tamanho, cor ou modelo do aparelho).
      </p>

      <h2 id="aceite">2. Aceite</h2>
      <p>
        Ao criar uma conta você declara ter lido e aceitado estes Termos e a{" "}
        <Link to="/privacidade">Política de Privacidade</Link>, marcando a caixa
        de aceite no cadastro. Registramos a data e a versão aceita. Ao
        finalizar um pedido, você também concorda com estes Termos. Se não
        concordar, não use o site.
      </p>
      <p>
        Quando estes Termos mudarem de forma relevante, avisaremos no site e
        pediremos um novo aceite. Pedidos já feitos seguem a versão vigente na
        data da compra.
      </p>

      <h2 id="cadastro">3. Cadastro, senha e responsabilidade pela conta</h2>
      <ul>
        <li>
          O cadastro é pessoal e exige ser maior de 18 anos ou estar assistido
          pelo responsável legal.
        </li>
        <li>
          Você deve informar dados verdadeiros e mantê-los atualizados (nome,
          e-mail, CPF e endereço).
        </li>
        <li>
          A senha é pessoal e intransferível, com no mínimo 8 caracteres, letras
          e números. Não a compartilhe. Você responde pelo uso da conta até nos
          avisar de acesso indevido.
        </li>
        <li>
          Após várias tentativas de login erradas, a conta é bloqueada
          temporariamente para proteger você. É possível redefinir a senha pelo
          link “Esqueci minha senha”.
        </li>
        <li>
          Podemos suspender contas usadas para fraude, chargeback indevido,
          abuso de cupons ou violação destes Termos, informando o motivo.
        </li>
        <li>
          Você pode excluir a conta a qualquer momento em{" "}
          <Link to="/conta">Minha conta</Link> → Privacidade e dados.
        </li>
      </ul>

      <h2 id="precos">4. Preços, pagamento e erro de precificação</h2>
      <ul>
        <li>
          Os preços estão em reais (R$) e incluem os tributos incidentes sobre a
          venda.
        </li>
        <li>
          O frete é calculado pelo CEP antes da confirmação e aparece separado
          no resumo, junto com o subtotal, o desconto e o total.
        </li>
        <li>
          O pagamento é processado pelo Mercado Pago. Veja os meios e o
          parcelamento em <Link to="/pagamentos">Pagamentos</Link>.
        </li>
        <li>
          Preços e disponibilidade podem mudar sem aviso, mas o preço que vale é
          o exibido no momento em que você confirma o pedido.
        </li>
        <li>
          <strong>Erro evidente de preço:</strong> se um produto for anunciado
          por valor claramente equivocado (por exemplo, um moletom por R$ 2,19
          em vez de R$ 219,90), por falha técnica ou de digitação, poderemos
          cancelar o pedido antes do envio, com devolução integral do valor
          pago, avisando você por e-mail. Você também pode optar por manter a
          compra pelo preço correto.
        </li>
      </ul>

      <h2 id="cupons">5. Cupons de desconto</h2>
      <ul>
        <li>
          É permitido <strong>um cupom por pedido</strong>. Cupons não são
          acumulativos entre si.
        </li>
        <li>
          Cada cupom pode ter <strong>valor mínimo de compra</strong> (calculado
          sobre o subtotal dos produtos, sem frete),{" "}
          <strong>data de validade</strong> e{" "}
          <strong>limite total de usos</strong>. As condições aparecem ao
          aplicar o cupom; se não forem atendidas, o site explica o motivo.
        </li>
        <li>
          Cupons de porcentagem ou de valor fixo incidem sobre os produtos,
          nunca sobre o frete. Cupons de frete grátis zeram o valor do frete da
          entrega escolhida.
        </li>
        <li>
          Alguns cupons são prêmios de “easter eggs” escondidos no site. Eles
          seguem as mesmas regras e podem ter número limitado de usos.
        </li>
        <li>
          O uso do cupom só é contabilizado quando o pagamento é aprovado.
        </li>
        <li>
          Cupom não tem valor em dinheiro, não é trocado por crédito e não se
          aplica a pedidos já pagos.
        </li>
        <li>
          Na devolução por arrependimento, é restituído o valor efetivamente
          pago (com o desconto).
        </li>
      </ul>

      <h2 id="propriedade-intelectual">
        6. Propriedade intelectual das estampas
      </h2>
      <p>
        Frases, ilustrações, artes, marca “{COMPANY.tradeName}”, textos e layout
        do site são de nossa titularidade ou licenciados para nós, protegidos
        pela Lei 9.610/1998 (direitos autorais) e pela Lei 9.279/1996
        (propriedade industrial). A compra dá direito ao uso pessoal do produto,
        não à reprodução da estampa. É proibido copiar, revender a arte,
        estampar em outros produtos ou usar a marca sem autorização por escrito.
      </p>

      <h2 id="humor">7. Conteúdo humorístico e satírico</h2>
      <p>
        As estampas e textos do site são <strong>humor e sátira</strong> sobre
        situações do cotidiano (trabalho, segunda-feira, vida social, cafeína).
        Não representam fatos, acusações nem opiniões sobre pessoas reais, e não
        têm intenção de ofender grupos ou indivíduos. Não usamos humor baseado
        em raça, etnia, religião, gênero, orientação sexual, deficiência ou
        origem. Se alguma peça incomodar você por um desses motivos, conte para
        nós em <Link to="/contato">Contato</Link>: vamos avaliar.
      </p>

      <h2 id="marcas-de-terceiros">8. Marcas, nomes e imagens de terceiros</h2>
      <p>
        Não usamos marcas, personagens, nomes ou imagens de terceiros nas
        estampas sem autorização. Qualquer marca citada em descrição de produto
        pertence aos seus titulares, que não patrocinam nem endossam nossos
        produtos.
      </p>

      <h2 id="notificacao">
        9. Notificação de violação de direito autoral (notice and takedown)
      </h2>
      <p>
        Se você acredita que alguma estampa ou conteúdo viola um direito seu,
        envie uma notificação para{" "}
        <a href={`mailto:${COMPANY.copyrightEmail}`}>
          {COMPANY.copyrightEmail}
        </a>{" "}
        ou pelo formulário de{" "}
        <Link to="/contato?assunto=direito-autoral">contato</Link>, assunto
        “Direito autoral ou marca”, com:
      </p>
      <ol>
        <li>seu nome completo e documento (ou os da empresa titular);</li>
        <li>identificação da obra ou marca protegida;</li>
        <li>link do produto ou página que viola o direito;</li>
        <li>
          explicação da violação e, se houver, prova de titularidade ou
          registro;
        </li>
        <li>declaração de que as informações são verdadeiras.</li>
      </ol>
      <p>
        Confirmamos o recebimento em até {COMPANY.sacResponseBusinessDays} dias
        úteis. Se a notificação for procedente, retiramos o produto de venda e
        informamos o resultado. Quem criou o conteúdo questionado pode
        apresentar contranotificação pelo mesmo canal.
      </p>

      <h2 id="classificacao">10. Classificação indicativa</h2>
      <p>
        As estampas atuais são de humor leve e não contêm palavrão, conteúdo
        sexual ou violência, sendo adequadas para todas as idades. Se algum
        produto futuro tiver conteúdo inadequado para menores, ele será
        sinalizado como “não recomendado para menores de 18 anos” na página do
        produto.
      </p>

      <h2 id="conduta">11. Conduta proibida e limites de uso</h2>
      <p>Ao usar o site, você não pode:</p>
      <ul>
        <li>
          usar robôs, scrapers ou automações para copiar o catálogo, testar
          cupons ou fazer pedidos em massa;
        </li>
        <li>
          tentar acessar contas, dados ou áreas restritas que não são suas, ou
          burlar limites de segurança;
        </li>
        <li>
          enviar código malicioso, sobrecarregar a infraestrutura ou explorar
          falhas (encontrou uma? avise em {COMPANY.sacEmail});
        </li>
        <li>
          fazer pedidos com dados de terceiros sem autorização ou com meio de
          pagamento que não seja seu;
        </li>
        <li>
          revender produtos como se fossem de fabricação própria, ou usar a
          marca para enganar consumidores.
        </li>
      </ul>
      <p>
        Bloqueamos automaticamente excesso de requisições (por exemplo, muitas
        tentativas de login ou de cupom em pouco tempo).
      </p>

      <h2 id="entrega-trocas">12. Entrega, arrependimento e trocas</h2>
      <p>
        Os produtos são fabricados sob demanda. Prazos e regras de envio estão
        em <Link to="/entrega">Entrega</Link>. O direito de arrependimento de 7
        dias e a garantia por defeito estão em{" "}
        <Link to="/trocas-e-devolucoes">Trocas e devoluções</Link>. Nada nestes
        Termos limita os direitos previstos no Código de Defesa do Consumidor.
      </p>

      <h2 id="responsabilidade">13. Disponibilidade do site</h2>
      <p>
        Fazemos o possível para manter o site no ar e sem erros, mas ele pode
        ficar indisponível para manutenção ou por falhas de terceiros
        (hospedagem, pagamento, transportadora). Não respondemos por danos
        causados por indisponibilidade alheia ao nosso controle, sem prejuízo
        dos direitos do consumidor.
      </p>

      <h2 id="foro">14. Legislação e foro</h2>
      <p>
        Estes Termos seguem as leis brasileiras, em especial o Código de Defesa
        do Consumidor (Lei 8.078/1990), o Decreto 7.962/2013, o Marco Civil da
        Internet (Lei 12.965/2014) e a LGPD (Lei 13.709/2018). Fica eleito o
        foro do <strong>domicílio do consumidor</strong> (CDC, art. 101, I).
        Para quem não for consumidor, o foro é o da comarca de{" "}
        {COMPANY.forumCity}.
      </p>

      <h2 id="contato">15. Contato</h2>
      <p>
        SAC: <a href={`mailto:${COMPANY.sacEmail}`}>{COMPANY.sacEmail}</a> ·{" "}
        {COMPANY.phone} · {COMPANY.sacHours}. Respondemos em até{" "}
        {COMPANY.sacResponseBusinessDays} dias úteis.
      </p>

      <h2 id="historico">16. Vigência e histórico de versões</h2>
      <table>
        <thead>
          <tr>
            <th>Versão</th>
            <th>Vigência</th>
            <th>Mudanças</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{LEGAL_VERSIONS.terms}</td>
            <td>4 de novembro de 2026</td>
            <td>Primeira versão publicada.</td>
          </tr>
        </tbody>
      </table>
    </LegalPage>
  );
}
