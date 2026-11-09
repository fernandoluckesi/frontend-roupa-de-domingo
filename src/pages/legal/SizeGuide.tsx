import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import {
  SIZE_GUIDES,
  SIZES,
  formatMeasure,
  type ApparelGuide,
  type MeasurementRow,
  type ObjectGuide,
} from "../../content/sizeGuide";

function MeasurementTable({ caption, rows }: { caption: string; rows: MeasurementRow[] }) {
  return (
    <table>
      <caption style={{ textAlign: "left", marginBottom: 8, fontWeight: 600 }}>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Medida (cm)</th>
          {SIZES.map((size) => (
            <th key={size} scope="col">
              {size}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">
              {row.label}
              <br />
              <small style={{ fontWeight: 400 }}>{row.hint}</small>
            </th>
            {SIZES.map((size) => (
              <td key={size}>{formatMeasure(row.values[size])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Apparel({ guide }: { guide: ApparelGuide }) {
  return (
    <>
      <h2 id={guide.categorySlug}>{guide.title}</h2>
      <p>
        <strong>Peça base:</strong> {guide.base}. {guide.fit}
      </p>
      <MeasurementTable caption="Medidas da peça (esticada sobre uma mesa)" rows={guide.product} />
      <MeasurementTable caption="Medidas do corpo (para escolher o tamanho)" rows={guide.body} />
      <h3>Composição</h3>
      <ul>
        {guide.composition.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3>Como lavar</h3>
      <ul>
        {guide.care.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>
        <strong>Origem:</strong> {guide.origin}
      </p>
      {guide.notes?.map((note) => (
        <p key={note}>{note}</p>
      ))}
    </>
  );
}

function ObjectSpecs({ guide }: { guide: ObjectGuide }) {
  return (
    <>
      <h2 id={guide.categorySlug}>{guide.title}</h2>
      <p>
        <strong>Peça base:</strong> {guide.base}.
      </p>
      <table>
        <tbody>
          {guide.specs.map((spec) => (
            <tr key={spec.label}>
              <th scope="row">{spec.label}</th>
              <td>{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Cuidados</h3>
      <ul>
        {guide.care.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>
        <strong>Origem:</strong> {guide.origin}
      </p>
      {guide.notes?.map((note) => (
        <p key={note}>{note}</p>
      ))}
    </>
  );
}

export default function SizeGuide() {
  return (
    <LegalPage
      title="Guia de tamanhos e cuidados"
      description="Tabela de medidas das camisetas e moletons, composição do tecido, instruções de lavagem e especificações de canecas e garrafas da Roupa de Domingo."
      path="/guia-de-tamanhos"
    >
      <p>
        O tamanho certo evita a troca, e a troca evita que você tenha que ir aos Correios. Todo
        mundo ganha. As medidas abaixo são das peças que usamos, fornecidas pelo fabricante; pode
        haver variação de até 2 cm.
      </p>
      <p>
        <strong>Como medir:</strong> pegue uma camiseta ou moletom que veste bem em você, estique
        sobre uma mesa e compare com a tabela “medidas da peça”. Ou meça o seu tórax com fita
        métrica e use a tabela “medidas do corpo”.
      </p>
      <p>
        Ir direto para:{" "}
        {SIZE_GUIDES.map((guide, i) => (
          <span key={guide.categorySlug}>
            {i > 0 && " · "}
            <a href={`#${guide.categorySlug}`}>{guide.title}</a>
          </span>
        ))}
      </p>

      {SIZE_GUIDES.map((guide) =>
        guide.kind === "apparel" ? (
          <Apparel key={guide.categorySlug} guide={guide} />
        ) : (
          <ObjectSpecs key={guide.categorySlug} guide={guide} />
        ),
      )}

      <h2 id="variacao-de-cor">Variação de cor entre tela e impressão</h2>
      <p>
        As fotos do site são simulações fiéis feitas a partir do arquivo de impressão, mas cada
        tela mostra as cores de um jeito (brilho, calibração, modo noturno). Além disso, a
        impressão direta no tecido (DTG) e a sublimação têm pequena variação de tom entre lotes e
        entre tecidos de cores diferentes — branco sobre tecido preto, por exemplo, fica levemente
        mais suave do que na tela.
      </p>
      <p>
        Pequenas diferenças de tonalidade fazem parte do processo e não são defeito. Cor de peça
        diferente da escolhida, estampa borrada, deslocada ou falhada é defeito: veja{" "}
        <Link to="/trocas-e-devolucoes#defeito">Trocas e devoluções</Link>.
      </p>
    </LegalPage>
  );
}
