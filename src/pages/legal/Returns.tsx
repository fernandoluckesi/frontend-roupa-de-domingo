import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import { COMPANY, LEGAL_VERSIONS } from "../../config/company";

export default function Returns() {
  return (
    <LegalPage
      title="Trocas e devoluções"
      description="Direito de arrependimento em 7 dias, garantia por defeito de 90 dias, como pedir a devolução pelo site e como funciona o reembolso na Roupa de Domingo."
      path="/trocas-e-devolucoes"
      updatedAt="4 de novembro de 2026"
      version={LEGAL_VERSIONS.returns}
      printable
    >
      <p>
        Comprou, a estampa chegou e você descobriu que o sarcasmo era demais até para você? Sem
        drama: devolver é um direito seu, e o processo é feito pelo site.
      </p>

      <h2 id="arrependimento">1. Direito de arrependimento (7 dias)</h2>
      <p>
        Toda compra feita pelo site pode ser cancelada em até <strong>7 dias corridos contados
        do recebimento</strong> do produto, sem precisar explicar o motivo (Código de Defesa do
        Consumidor, art. 49).
      </p>
      <ul>
        <li>
          <strong>Vale para todos os produtos</strong>, inclusive os produzidos sob demanda. As
          estampas são do nosso catálogo e você escolhe só tamanho, cor ou modelo, então não se
          trata de produto feito sob medida.
        </li>
        <li>
          A devolução é <strong>integral</strong>: valor dos produtos <strong>e do frete</strong>{" "}
          que você pagou, descontado apenas o que já tenha sido abatido por cupom.
        </li>
        <li>A postagem de volta é <strong>gratuita</strong>: enviamos um código de postagem reversa.</li>
        <li>
          O produto deve voltar com as condições em que chegou (sem uso além do necessário para
          experimentar, sem lavagem), de preferência na embalagem original.
        </li>
        <li>
          Se o pedido ainda não foi enviado, você pode cancelá-lo direto na página do pedido e o
          estorno é solicitado na hora.
        </li>
      </ul>

      <h2 id="defeito">2. Produto com defeito (garantia legal de 90 dias)</h2>
      <p>
        Camisetas, moletons, canecas e garrafas são produtos duráveis: você tem{" "}
        <strong>90 dias a partir do recebimento</strong> para reclamar de defeito aparente (CDC,
        art. 26, II). Defeito que só aparece com o uso (vício oculto) tem o mesmo prazo, contado a
        partir de quando ele aparecer (art. 26, § 3º).
      </p>
      <p>Exemplos de defeito: estampa descascando ou trincada, costura aberta, caneca rachada, capa que não encaixa no modelo comprado, garrafa vazando, produto diferente do pedido ou tamanho trocado.</p>
      <p>
        Temos até <strong>30 dias</strong> para resolver o problema (art. 18, § 1º). Se não
        resolvermos nesse prazo — ou se preferir desde já quando o defeito tornar o produto
        impróprio —, você escolhe entre:
      </p>
      <ol>
        <li>troca por outro produto igual, em perfeito estado;</li>
        <li>devolução integral do valor pago, corrigido;</li>
        <li>abatimento proporcional do preço.</li>
      </ol>
      <p>Também nesse caso o frete de devolução é por nossa conta.</p>

      <h2 id="nao-e-defeito">3. O que não é defeito</h2>
      <ul>
        <li>
          <strong>Variação de cor entre tela e impressão:</strong> cada monitor e celular mostra
          as cores de um jeito, e a impressão direta no tecido tem leve variação de tom entre lotes.
          Diferenças pequenas de tonalidade, dentro dessa tolerância, não são defeito. Diferença
          grande (por exemplo, cor de peça errada) é.
        </li>
        <li>Desgaste natural pelo uso ou por lavagem fora das instruções do <Link to="/guia-de-tamanhos">guia de cuidados</Link>.</li>
        <li>Tamanho que não serviu: isso é arrependimento (seção 1), não defeito — e também é aceito em 7 dias.</li>
      </ul>

      <h2 id="como-pedir">4. Como pedir a devolução pelo site</h2>
      <ol>
        <li>
          Entre em <Link to="/conta/pedidos">Minha conta → Meus pedidos</Link> e abra o pedido
          (<em>/conta/pedidos/&lt;número do pedido&gt;</em>).
        </li>
        <li>
          Clique em <strong>“Solicitar devolução”</strong>, escolha os itens, o motivo
          (arrependimento ou defeito) e, se for defeito, descreva o problema.
        </li>
        <li>
          Analisamos e respondemos em até <strong>2 dias úteis</strong>. O andamento aparece na
          própria página do pedido: <em>solicitada → aprovada → produto recebido → reembolsada</em>.
        </li>
        <li>
          Aprovada a solicitação, enviamos por e-mail o <strong>código de postagem reversa
          gratuita dos Correios</strong>. É só levar o pacote a uma agência.
        </li>
        <li>
          Quando o produto chega até nós, o reembolso (ou a troca) é feito em até{" "}
          <strong>10 dias</strong>.
        </li>
      </ol>
      <p>
        Comprou sem conta, ou prefere não usar o site? Use o formulário de{" "}
        <Link to="/contato?assunto=troca-devolucao">contato</Link> com o número do pedido, ou
        escreva para <a href={`mailto:${COMPANY.sacEmail}`}>{COMPANY.sacEmail}</a>. O prazo de 7
        dias conta pela data em que você nos avisou, não pela data em que o pacote chega.
      </p>

      <h2 id="reembolso">5. Como o dinheiro volta</h2>
      <p>O reembolso é feito sempre <strong>pelo mesmo meio de pagamento</strong> usado na compra:</p>
      <ul>
        <li>
          <strong>Cartão de crédito:</strong> pedimos o estorno ao Mercado Pago, que o envia à
          administradora do cartão. O crédito pode aparecer na próxima fatura ou na seguinte
          (1 a 2 faturas), conforme a data de fechamento.
        </li>
        <li><strong>Pix:</strong> o valor volta para a conta de origem do Pix.</li>
        <li><strong>Saldo do Mercado Pago ou boleto:</strong> o valor volta para a conta Mercado Pago do pagador.</li>
      </ul>

      <h2 id="contato">6. Ainda com dúvida?</h2>
      <p>
        SAC: <a href={`mailto:${COMPANY.sacEmail}`}>{COMPANY.sacEmail}</a> · {COMPANY.phone} ·
        WhatsApp {COMPANY.whatsapp} · {COMPANY.sacHours}. Respondemos em até{" "}
        {COMPANY.sacResponseBusinessDays} dias úteis.
      </p>
    </LegalPage>
  );
}
