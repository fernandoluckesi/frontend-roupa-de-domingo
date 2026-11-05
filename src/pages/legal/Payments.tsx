import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import { COMPANY } from "../../config/company";

export default function Payments() {
  return (
    <LegalPage
      title="Pagamentos"
      description="Meios de pagamento aceitos na Roupa de Domingo via Mercado Pago, parcelamento, segurança, reembolso, estorno e nota fiscal."
      path="/pagamentos"
    >
      <p>
        Pagar é a parte menos divertida da compra. Pelo menos aqui ela é segura e sem surpresa no
        valor.
      </p>

      <h2 id="meios">1. Meios de pagamento</h2>
      <p>
        O pagamento é feito no ambiente do <strong>Mercado Pago (Checkout Pro)</strong>: ao
        confirmar o pedido, você é levado para o site do Mercado Pago, escolhe a forma de pagamento
        e volta para a loja no fim. Estão disponíveis os meios que o Mercado Pago oferece para a
        sua compra, entre eles:
      </p>
      <ul>
        <li><strong>Pix</strong> — aprovação em instantes;</li>
        <li><strong>Cartão de crédito</strong> das principais bandeiras, à vista ou parcelado;</li>
        <li><strong>Saldo ou crédito na conta Mercado Pago</strong>;</li>
        <li><strong>Boleto bancário</strong> — compensação em até 3 dias úteis.</li>
      </ul>
      <p>
        O link de pagamento vale por <strong>24 horas</strong>. Depois disso ele expira, nada é
        cobrado, e você pode fazer um novo pedido.
      </p>

      <h2 id="parcelamento">2. Parcelamento e juros</h2>
      <p>
        O parcelamento no cartão de crédito é oferecido pelo Mercado Pago, com o número de
        parcelas e as condições exibidos na tela de pagamento.{" "}
        <strong>Parcelas podem ter juros</strong>, cobrados pelo Mercado Pago conforme a
        quantidade de parcelas escolhida. O valor de cada parcela, a taxa de juros e o total
        final aparecem antes de você confirmar o pagamento. Pix, boleto e cartão à vista não têm
        acréscimo: você paga o total mostrado no resumo do pedido.
      </p>

      <h2 id="seguranca">3. Segurança</h2>
      <ul>
        <li>
          Os dados do cartão são digitados apenas no ambiente do Mercado Pago.{" "}
          <strong>Eles nunca passam pelos nossos servidores</strong> e não ficam guardados conosco.
        </li>
        <li>
          Por isso a loja se enquadra no nível mais simples do padrão de segurança de cartões
          (PCI-DSS SAQ-A): a responsabilidade por processar o cartão é do Mercado Pago, certificado
          nesse padrão.
        </li>
        <li>
          A aprovação do pagamento é sempre confirmada pelo nosso servidor diretamente com o
          Mercado Pago, e o valor pago é conferido com o total do pedido antes de liberar a
          produção.
        </li>
        <li>
          Na fatura do cartão, a compra aparece como <strong>ROUPADEDOMINGO</strong>.
        </li>
      </ul>

      <h2 id="recusa">4. Pagamento recusado ou em análise</h2>
      <p>
        Se o pagamento for recusado, o pedido aparece como “falhou” e nada é cobrado; você pode
        tentar de novo com outro meio. Pagamentos em análise pelo Mercado Pago podem levar até 2
        dias úteis. O status fica sempre visível em <Link to="/conta/pedidos">Meus pedidos</Link>.
      </p>

      <h2 id="reembolso">5. Reembolso e estorno</h2>
      <p>O valor volta sempre pelo mesmo meio usado na compra:</p>
      <ul>
        <li>
          <strong>Cartão de crédito:</strong> pedimos o estorno ao Mercado Pago, e ele aparece na
          próxima fatura ou na seguinte (1 a 2 faturas), conforme a data de fechamento do cartão.
          Compras parceladas são estornadas integralmente.
        </li>
        <li><strong>Pix:</strong> devolução para a conta de origem, normalmente no mesmo dia.</li>
        <li><strong>Boleto e saldo Mercado Pago:</strong> crédito na conta Mercado Pago do pagador.</li>
      </ul>
      <p>
        Pedimos o reembolso em até 10 dias depois de cancelar um pedido ainda não enviado ou de
        recebermos o produto devolvido. As regras de devolução estão em{" "}
        <Link to="/trocas-e-devolucoes">Trocas e devoluções</Link>.
      </p>

      <h2 id="nota-fiscal">6. Nota fiscal</h2>
      <p>
        Emitimos nota fiscal eletrônica para cada pedido pago, em nome e CPF informados na
        compra. Ela é enviada para o seu e-mail e fica disponível na página do pedido.
      </p>

      <h2 id="cupons">7. Cupons</h2>
      <p>
        Um cupom por pedido, aplicado no carrinho. Validade, valor mínimo e demais condições estão
        em <Link to="/termos#cupons">Termos de Uso → Cupons</Link>.
      </p>

      <p>
        Dúvida sobre uma cobrança? Fale com o SAC em{" "}
        <a href={`mailto:${COMPANY.sacEmail}`}>{COMPANY.sacEmail}</a> ou pelo{" "}
        <Link to="/contato?assunto=pagamento">formulário</Link>.
      </p>
    </LegalPage>
  );
}
