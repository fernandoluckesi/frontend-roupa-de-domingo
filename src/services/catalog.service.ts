import { api } from "./http";
import type {
  Category,
  GenderOption,
  HumorOption,
  Paginated,
  Product,
} from "../types";

export interface ProductFilters {
  category?: string;
  humor?: string;
  /** Lista separada por vírgula. O backend soma as peças unissex. */
  gender?: string;
  search?: string;
  tags?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  includeSecret?: boolean;
}

/** Sugestão da barra de busca: um produto (cada peça da frase aparece separada). */
export interface SearchSuggestion {
  slug: string;
  name: string;
  /** Tipo da peça: "Camiseta de algodão", "Caneca"... */
  pieceLabel: string;
  imageUrl: string | null;
  priceCents: number;
}

export interface SearchSuggestions {
  /** Quantos produtos a busca encontrou */
  total: number;
  items: SearchSuggestion[];
}

export const catalogService = {
  async suggest(q: string): Promise<SearchSuggestions> {
    const { data } = await api.get<SearchSuggestions>("/products/suggest", { params: { q } });
    return data;
  },

  async list(filters: ProductFilters = {}): Promise<Paginated<Product>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== "" && value !== null,
      ),
    );
    const { data } = await api.get<Paginated<Product>>("/products", { params });
    return data;
  },

  async featured(): Promise<Product[]> {
    const { data } = await api.get<Product[]>("/products/featured");
    return data;
  },

  async bySlug(slug: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${slug}`);
    return data;
  },

  async categories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>("/categories");
    return data;
  },

  async humors(): Promise<HumorOption[]> {
    const { data } = await api.get<HumorOption[]>("/humors");
    return data;
  },

  async genders(): Promise<GenderOption[]> {
    const { data } = await api.get<GenderOption[]>("/genders");
    return data;
  },
};
