import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import { COMPANY } from "../../config/company";

/** Mesmo limite do backend (FREE_SHIPPING_THRESHOLD_CENTS, padrão 24900). */
const FREE_SHIPPING_FROM = "R$ 249,00";

export default function Shipping() {
  return (
    <LegalPage
      title="Entrega e prazos"
      description="Como funciona a produção sob demanda e a entrega da Roupa de Domingo: prazo por CEP, frete grátis, rastreio e produtos enviados do exterior."
      path="/entrega"
    >
      <p>
        Sua peça não está parada numa prateleira esperando você. Ela só passa a existir depois
        que você compra. Por isso o prazo tem duas partes: produção e transporte.
      </p>

      <h2 id="producao">1. Produção sob demanda</h2>
      <p>
        Depois que o pagamento é aprovado, o pedido vai para o nosso parceiro de produção
        (Printful), que estampa e embala cada item. A produção leva em média{" "}
        <strong>2 a 4 dias úteis</strong>. Pedidos com mais de um produto podem ser produzidos em
        unidades diferentes e chegar em pacotes separados.
      </p>
      <p>
        O pagamento por Pix ou cartão costuma ser aprovado em minutos; boleto pode levar até 3
        dias úteis para compensar, e o prazo só começa a contar depois disso.
      </p>

      <h2 id="prazo">2. Prazo e valor do frete pelo seu CEP</h2>
      <p>
        O valor do frete e a previsão de entrega são calculados em tempo real pelo seu CEP, com
        base no endereço, no peso e no local de produção de cada item:
      </p>
      <ul>
        <li>na página de cada produto, no campo “Calcular frete e prazo”;</li>
        <li>no carrinho e no checkout, antes de confirmar o pedido.</li>
      </ul>
      <p>
        A previsão exibida (por exemplo, “9 a 10 dias · chega até 16/11”) <strong>já inclui a
        produção e o transporte</strong>. É uma estimativa do parceiro logístico; atrasos de
        transportadora, greves ou eventos climáticos podem alterá-la, e nesses casos avisamos
        você por e-mail.
      </p>

      <h2 id="frete-gratis">3. Frete grátis</h2>
      <p>
        Pedidos com subtotal de produtos a partir de <strong>{FREE_SHIPPING_FROM}</strong> (já com
        desconto de cupom) têm frete grátis na entrega padrão. Cupons de frete grátis também
        zeram o frete, conforme as regras em <Link to="/termos#cupons">Termos de Uso</Link>.
      </p>

      <h2 id="exterior">4. Produtos enviados do exterior e tributos</h2>
      <p>
        Camisetas e canecas são produzidas no Brasil. Já <strong>capas de celular</strong>,{" "}
        <strong>garrafas</strong> e <strong>alguns tamanhos e cores de moletom</strong> podem ser
        produzidos e enviados do exterior, quando não há estoque da peça básica no Brasil. Nesses
        casos:
      </p>
      <ul>
        <li>o prazo é maior (em geral de 10 a 25 dias), e já aparece assim no cálculo do frete;</li>
        <li>
          a remessa internacional pode estar sujeita a <strong>tributos de importação</strong>{" "}
          cobrados pela Receita Federal e a taxa de despacho dos Correios, pagos pelo destinatário
          na entrega, conforme as regras vigentes de importação;
        </li>
        <li>a página do produto avisa antes da compra quando o item pode vir de fora do Brasil.</li>
      </ul>
      <p>
        Se um tributo for cobrado e você não quiser pagá-lo, você pode recusar a encomenda e
        exercer o direito de arrependimento: veja{" "}
        <Link to="/trocas-e-devolucoes">Trocas e devoluções</Link>.
      </p>

      <h2 id="rastreio">5. Acompanhamento e rastreio</h2>
      <p>
        Acompanhe cada etapa (pagamento aprovado, em produção, enviado, entregue) em{" "}
        <Link to="/conta/pedidos">Meus pedidos</Link>. Quando o pacote é postado, o código de
        rastreio aparece no pedido e é enviado por e-mail.
      </p>

      <h2 id="endereco">6. Endereço errado ou ninguém para receber</h2>
      <ul>
        <li>
          Confira o endereço no checkout. Dá para corrigi-lo até o pedido entrar em produção,
          pelo <Link to="/contato?assunto=pedido">contato</Link>; depois disso o pacote já está a
          caminho da etiqueta.
        </li>
        <li>
          Se não houver ninguém no endereço, a transportadora faz novas tentativas ou deixa o
          pacote para retirada na agência indicada no rastreio.
        </li>
        <li>
          Se o pacote voltar para nós por endereço incorreto informado no pedido ou por não ter
          sido retirado, combinamos com você um novo envio (com novo frete) ou o reembolso dos
          produtos.
        </li>
      </ul>

      <h2 id="atraso">7. Atrasou?</h2>
      <p>
        Se a data prevista passou e o rastreio não andou, fale com a gente em{" "}
        <a href={`mailto:${COMPANY.sacEmail}`}>{COMPANY.sacEmail}</a> ou pelo{" "}
        <Link to="/contato?assunto=pedido">formulário</Link>. Extravio é problema nosso: enviamos
        outro produto ou devolvemos o valor, você escolhe.
      </p>
    </LegalPage>
  );
}
