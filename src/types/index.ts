export type Humor =
  | "ACIDO"
  | "SARCASTICO"
  | "EXISTENCIAL"
  | "MEMES"
  | "PARA_CASAIS"
  | "POLITICO"
  | "NERD";

/**
 * Publico-alvo da peca. UNISSEX funciona como "qualquer" no filtro: escolher
 * MASCULINO ou FEMININO tambem traz as pecas unissex (caneca, garrafa e
 * modelagem sem corte especifico).
 */
export type Gender = "UNISSEX" | "MASCULINO" | "FEMININO";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "FAILED";

export interface ProductImage {
  id?: string;
  url: string;
  alt: string;
  /** Cor da variante que aparece na foto; sem cor = vale para todas */
  color?: string | null;
  position?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  model?: string | null;
  priceCents: number;
  weightGrams?: number;
  isAvailable?: boolean;
}

export interface CategoryRef {
  slug: string;
  name: string;
  emoji?: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description?: string;
  humor: Humor;
  gender: Gender;
  basePriceCents: number;
  tags: string[];
  isFeatured: boolean;
  isSecret: boolean;
  rating: number;
  ratingCount: number;
  category: CategoryRef;
  images: ProductImage[];
  variants: ProductVariant[];
  related?: Product[];
}

export interface Category extends CategoryRef {
  id: string;
  description?: string | null;
  _count?: { products: number };
}

export interface HumorOption {
  value: Humor;
  label: string;
  description: string;
}

export interface GenderOption {
  value: Gender;
  label: string;
  description: string;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  categoryName: string;
  humor: Humor;
  sku: string;
  variantLabel: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;
  weightGrams: number;
  customText?: string | null;
}

export interface ShippingOption {
  method: "economico" | "expresso";
  label: string;
  priceCents: number;
  estimatedDays: number;
  minDays?: number;
  maxDays?: number;
  /** YYYY-MM-DD, quando a transportadora informa */
  estimatedDeliveryDate?: string | null;
  carrier: string;
  /** "tabela" = tabela própria por região (Correios) */
  source?: "tabela";
}

export interface Cart {
  id: string;
  items: CartItem[];
  totals: {
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
    weightGrams: number;
    itemCount: number;
  };
  coupon: {
    code: string;
    description: string;
    type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
    value: number;
  } | null;
  shipping: {
    zipCode: string | null;
    selected: ShippingOption | null;
    options: ShippingOption[];
    freeShippingThresholdCents: number;
    missingForFreeShippingCents: number;
  };
  isEmpty: boolean;
  easterEggTrigger?: string | null;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  document?: string | null;
  role: "CUSTOMER" | "ADMIN";
  humorLevel: number;
  addresses?: Address[];
  stats?: { orders: number; easterEggsFound: number };
  emailVerifiedAt?: string | null;
  marketingOptIn?: boolean;
  termsVersion?: string | null;
  privacyVersion?: string | null;
}

export type ReturnType = "REGRET" | "DEFECT";
export type ReturnStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "REFUNDED"
  | "EXCHANGED";

export interface ReturnRequest {
  id: string;
  protocol: string;
  type: ReturnType;
  status: ReturnStatus;
  reason: string;
  items: { orderItemId: string; quantity: number }[];
  reverseCode?: string | null;
  refundCents?: number | null;
  resolution?: string | null;
  timeline: { status: string; at: string; note?: string }[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantLabel: string;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;
  imageUrl?: string | null;
  customText?: string | null;
}

export interface TimelineEntry {
  status: OrderStatus;
  at: string;
  note?: string | null;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  statusLabel: string;
  customerName: string;
  customerEmail: string;
  shippingRecipient: string;
  shippingZipCode: string;
  shippingStreet: string;
  shippingNumber: string;
  shippingComplement?: string | null;
  shippingDistrict: string;
  shippingCity: string;
  shippingState: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  shippingMethod: string;
  estimatedDays: number;
  trackingCode?: string | null;
  notes?: string | null;
  timeline: TimelineEntry[];
  createdAt: string;
  items: OrderItem[];
  payment?: {
    status: string;
    method?: string | null;
    installments?: number | null;
    initPoint?: string | null;
    provider: string;
    paidAt?: string | null;
  } | null;
  fulfillment?: {
    status: string;
    trackingCode?: string | null;
    trackingUrl?: string | null;
    serviceCode?: "PAC" | "SEDEX" | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  } | null;
  coupon?: { code: string; description: string } | null;
  invoice?: {
    status: "PENDING" | "ISSUED" | "ERROR" | "CANCELLED";
    number?: string | null;
    series?: string | null;
    accessKey?: string | null;
    pdfUrl?: string | null;
    issuedAt?: string | null;
  } | null;
  returns?: ReturnRequest[];
}

export interface CheckoutResponse {
  order: Order;
  payment: { provider: string; preferenceId: string; simulated: boolean };
  paymentUrl: string;
}

export interface EasterEggItem {
  code: string;
  title: string;
  hint: string;
  points: number;
  discovered: boolean;
  discoveredAt: string | null;
  message: string | null;
  rewardCoupon: { code: string; description: string } | null;
}

export interface EasterEggProgress {
  found: number;
  total: number;
  percent: number;
  earnedPoints: number;
  totalPoints: number;
  rank: string;
  secretProductUnlocked: boolean;
  secretProductIn: number;
}

export interface DiscoverResult {
  code: string;
  title: string;
  message: string;
  points: number;
  alreadyFound: boolean;
  reward: {
    code: string;
    description: string;
    type: string;
    value: number;
  } | null;
  progress: EasterEggProgress;
}
