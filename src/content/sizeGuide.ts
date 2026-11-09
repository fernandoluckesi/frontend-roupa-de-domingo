/**
 * Guia de tamanhos e especificações das peças base usadas na produção
 * (GET /products/{id} e /products/{id}/sizes?unit=cm, consultados em 04/11/2026).
 * Tamanhos do fornecedor convertidos para os nossos: S→P, M→M, L→G, XL→GG, 2XL→XGG.
 */

export type ClothingSize = "P" | "M" | "G" | "GG" | "XGG";

/** Medida em cm: valor único ou faixa [mín, máx] */
export type Measure = number | [number, number];

export interface MeasurementRow {
  label: string;
  /** Como medir */
  hint: string;
  values: Record<ClothingSize, Measure>;
}

export interface ApparelGuide {
  kind: "apparel";
  categorySlug: string;
  title: string;
  base: string;
  fit: string;
  /** Medidas da peça, tirada esticada sobre uma mesa */
  product: MeasurementRow[];
  /** Medidas do corpo, para escolher o tamanho */
  body: MeasurementRow[];
  composition: string[];
  care: string[];
  origin: string;
  notes?: string[];
}

export interface ObjectGuide {
  kind: "object";
  categorySlug: string;
  title: string;
  base: string;
  specs: { label: string; value: string }[];
  care: string[];
  origin: string;
  notes?: string[];
}

export type SizeGuide = ApparelGuide | ObjectGuide;

export const SIZES: ClothingSize[] = ["P", "M", "G", "GG", "XGG"];

const DTG_CARE = [
  "Lave do avesso, em água fria (até 30 °C), com cores parecidas.",
  "Não use alvejante nem amaciante direto sobre a estampa.",
  "Seque à sombra ou na secadora em temperatura baixa.",
  "Não passe ferro sobre a estampa; se precisar, passe do avesso em temperatura baixa.",
  "Não lave a seco.",
];

export const SIZE_GUIDES: SizeGuide[] = [
  {
    kind: "apparel",
    categorySlug: "camisetas",
    title: "Camisetas",
    base: "Dimona Quality T-Shirt (corte reto masculino)",
    fit: "Modelagem regular (reta). Se estiver entre dois tamanhos e gostar de folga, escolha o maior.",
    product: [
      {
        label: "Comprimento",
        hint: "Do ponto mais alto do ombro, junto à gola, até a barra.",
        values: { P: [66, 69], M: [69, 72], G: [71, 74], GG: [73, 76], XGG: [74, 77] },
      },
      {
        label: "Largura",
        hint: "De um lado ao outro, 2 cm abaixo da cava, com a peça esticada.",
        values: { P: [49, 52], M: [50, 53], G: [54, 57], GG: [57, 60], XGG: [59, 63] },
      },
    ],
    body: [
      {
        label: "Tórax",
        hint: "Contorno do peito na parte mais larga, com a fita na horizontal.",
        values: { P: [78, 86], M: [87, 97], G: [98, 104], GG: [105, 113], XGG: [114, 122] },
      },
    ],
    composition: ["100% algodão fio penteado (ring-spun)", "Gola canelada com elastano", "Reforço de ombro a ombro"],
    care: DTG_CARE,
    origin: "Peça básica fabricada e estampada no Brasil.",
    notes: [
      "Estampa em impressão direta no tecido (DTG), na frente.",
      "Algodão pode encolher até cerca de 3% nas primeiras lavagens, principalmente se for à secadora quente.",
    ],
  },
  {
    kind: "apparel",
    categorySlug: "moletons",
    title: "Moletons",
    base: "Gildan 18500 Heavy Blend (canguru com capuz)",
    fit: "Modelagem unissex ampla. Para um caimento mais justo, escolha um tamanho abaixo do habitual.",
    product: [
      {
        label: "Comprimento",
        hint: "Do ponto mais alto do ombro até a barra.",
        values: { P: 68.6, M: 71.1, G: 73.7, GG: 76.2, XGG: 78.7 },
      },
      {
        label: "Largura",
        hint: "De um lado ao outro, logo abaixo da cava, com a peça esticada.",
        values: { P: 50.8, M: 55.9, G: 61, GG: 66, XGG: 71.1 },
      },
      {
        label: "Manga (centro das costas ao punho)",
        hint: "Do centro da nuca, passando pelo ombro, até o fim do punho.",
        values: { P: 85.1, M: 87.6, G: 90.2, GG: 92.7, XGG: 95.3 },
      },
    ],
    body: [
      {
        label: "Tórax",
        hint: "Contorno do peito na parte mais larga.",
        values: { P: [96.5, 104.1], M: [106.7, 114.3], G: [116.8, 124.5], GG: [127, 134.6], XGG: [137.2, 144.8] },
      },
    ],
    composition: [
      "50% algodão pré-encolhido e 50% poliéster",
      "Gramatura 271 g/m²",
      "Capuz forrado com cordão, bolso canguru",
      "Punhos e barra em ribana 1×1 com elastano",
    ],
    care: DTG_CARE,
    origin: "Peça básica fabricada em Bangladesh, Nicarágua, Honduras ou El Salvador; estampada no Brasil quando há estoque local, senão no exterior.",
  },
  {
    kind: "object",
    categorySlug: "canecas",
    title: "Canecas",
    base: "White Glossy Mug 11 oz",
    specs: [
      { label: "Capacidade", value: "325 ml (11 oz)" },
      { label: "Altura", value: "9,6 cm" },
      { label: "Diâmetro", value: "8,2 cm" },
      { label: "Material", value: "Cerâmica branca com acabamento brilhante" },
      { label: "Estampa", value: "Sublimação em volta da caneca" },
    ],
    care: ["Pode ir ao micro-ondas e à lava-louças.", "Evite choque térmico (água fervente em caneca gelada)."],
    origin: "Peça fabricada na China; estampada no Brasil.",
  },
  {
    kind: "object",
    categorySlug: "capas-de-celular",
    title: "Capas de celular",
    base: "Clear Case para iPhone e Samsung Galaxy",
    specs: [
      { label: "Modelos", value: "iPhone 13 a 17 (incluindo Pro e Pro Max) e Galaxy S23 a S25 (incluindo Ultra)" },
      { label: "Material", value: "Fundo rígido de policarbonato e laterais flexíveis transparentes" },
      { label: "Borda", value: "0,5 mm elevada em volta da tela" },
      { label: "Recortes", value: "Alinhados com botões, câmeras e conectores do modelo escolhido" },
      { label: "Carregamento sem fio", value: "Compatível" },
    ],
    care: [
      "Remova a película protetora interna antes de usar, se houver.",
      "Limpe com pano macio levemente úmido; não use solventes.",
    ],
    origin: "Fabricada na China ou na Coreia do Sul e enviada do exterior.",
    notes: ["Confira o modelo exato do seu aparelho antes de comprar: capa de iPhone 16 não serve no 16 Pro."],
  },
  {
    kind: "object",
    categorySlug: "garrafas",
    title: "Garrafas",
    base: "Stainless Steel Water Bottle 17 oz",
    specs: [
      { label: "Capacidade", value: "500 ml (17 oz)" },
      { label: "Dimensões", value: "27 cm de altura × 7 cm de diâmetro" },
      { label: "Material", value: "Aço inoxidável com parede dupla a vácuo" },
      { label: "Térmica", value: "Mantém a bebida quente ou gelada por cerca de 6 horas" },
      { label: "Tampa", value: "Rosqueável, sem odor e à prova de vazamento" },
    ],
    care: [
      "Lave apenas à mão; não vai à lava-louças nem ao micro-ondas.",
      "Não deixe líquido dentro por mais de 24 horas.",
    ],
    origin: "Fabricada na China e enviada do exterior.",
  },
];

/** Guia de uma categoria, para link direto a partir da página do produto. */
export function sizeGuideFor(categorySlug: string): SizeGuide | undefined {
  return SIZE_GUIDES.find((guide) => guide.categorySlug === categorySlug);
}

export function formatMeasure(value: Measure): string {
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return Array.isArray(value) ? `${fmt(value[0])}–${fmt(value[1])}` : fmt(value);
}
