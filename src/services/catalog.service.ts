import { api } from "./http";
import type { Category, HumorOption, Paginated, Product } from "../types";

export interface ProductFilters {
  category?: string;
  humor?: string;
  search?: string;
  tags?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  includeSecret?: boolean;
}

export const catalogService = {
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
};
