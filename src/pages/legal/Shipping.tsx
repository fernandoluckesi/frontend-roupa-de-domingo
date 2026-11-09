import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import { COMPANY } from "../../config/company";

/** Mesmo limite do backend (FREE_SHIPPING_THRESHOLD_CENTS, padrão 24900). */
const FREE_SHIPPING_FROM = "R$ 249,00";

export default function Shipping() {
  return (
    <LegalPage
      title="Entrega e prazos"
      description="Como funciona a produção sob demanda e a entrega da Roupa de Domingo pelos Correios: prazo por CEP, PAC e SEDEX, frete grátis e rastreio."
      path="/entrega"
    >
      <p>
        Sua peça não está parada numa prateleira esperando você. Ela só passa a existir depois
        que você compra. Por isso o prazo tem duas partes: produção e transporte.
      </p>

      <h2 id="producao">1. Produção sob demanda</h2>
      <p>
        Depois que o pagamento é aprovado, o pedido entra na nossa fila de produção: a gente
        estampa, confere e embala cada item. A produção leva em média{" "}
        <strong>2 a 4 dias úteis</strong>, e todos os itens do pedido seguem juntos no mesmo
        pacote.
      </p>
      <p>
        O pagamento por Pix ou cartão costuma ser aprovado em minutos; boleto pode levar até 3
        dias úteis para compensar, e o prazo só começa a contar depois disso.
      </p>

      <h2 id="prazo">2. Prazo e valor do frete pelo seu CEP</h2>
      <p>
        Enviamos pelos <strong>Correios</strong>, em duas modalidades: <strong>PAC</strong>{" "}
        (econômico) e <strong>SEDEX</strong> (expresso). O valor e o prazo são calculados pelo seu
        CEP e pelo peso do pedido:
      </p>
      <ul>
        <li>na página de cada produto, no campo “Calcular frete e prazo”;</li>
        <li>no carrinho e no checkout, antes de confirmar o pedido.</li>
      </ul>
      <p>
        O prazo exibido é o de transporte depois da postagem, que acontece ao fim da produção. É
        uma estimativa; atrasos dos Correios, greves ou eventos climáticos podem alterá-la, e
        nesses casos avisamos você por e-mail.
      </p>

      <h2 id="frete-gratis">3. Frete grátis</h2>
      <p>
        Pedidos com subtotal de produtos a partir de <strong>{FREE_SHIPPING_FROM}</strong> (já com
        desconto de cupom) têm frete grátis no PAC. Cupons de frete grátis também zeram o frete,
        conforme as regras em <Link to="/termos#cupons">Termos de Uso</Link>.
      </p>

      <h2 id="rastreio">4. Acompanhamento e rastreio</h2>
      <p>
        Acompanhe cada etapa (pagamento aprovado, em produção, postado, entregue) em{" "}
        <Link to="/conta/pedidos">Meus pedidos</Link>. Quando o pacote é postado, o código de
        rastreio dos Correios aparece no pedido e é enviado por e-mail.
      </p>

      <h2 id="endereco">5. Endereço errado ou ninguém para receber</h2>
      <ul>
        <li>
          Confira o endereço no checkout. Dá para corrigi-lo até o pedido ser postado, pelo{" "}
          <Link to="/contato?assunto=pedido">contato</Link>; depois disso o pacote já está a
          caminho.
        </li>
        <li>
          Se não houver ninguém no endereço, os Correios fazem novas tentativas ou deixam o pacote
          para retirada na agência indicada no rastreio.
        </li>
        <li>
          Se o pacote voltar para nós por endereço incorreto informado no pedido ou por não ter
          sido retirado, combinamos com você um novo envio (com novo frete) ou o reembolso dos
          produtos.
        </li>
      </ul>

      <h2 id="atraso">6. Atrasou?</h2>
      <p>
        Se a data prevista passou e o rastreio não andou, fale com a gente em{" "}
        <a href={`mailto:${COMPANY.sacEmail}`}>{COMPANY.sacEmail}</a> ou pelo{" "}
        <Link to="/contato?assunto=pedido">formulário</Link>. Extravio é problema nosso: enviamos
        outro produto ou devolvemos o valor, você escolhe.
      </p>
    </LegalPage>
  );
}
