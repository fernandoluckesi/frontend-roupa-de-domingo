import { api } from "./http";
import type { Cart, ShippingOption } from "../types";

export const cartService = {
  async get(zipCode?: string, method?: string): Promise<Cart> {
    const { data } = await api.get<Cart>("/cart", {
      params: { zipCode, method },
    });
    return data;
  },

  async addItem(variantId: string, quantity = 1): Promise<Cart> {
    const { data } = await api.post<Cart>("/cart/items", {
      variantId,
      quantity,
    });
    return data;
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const { data } = await api.patch<Cart>(`/cart/items/${itemId}`, {
      quantity,
    });
    return data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const { data } = await api.delete<Cart>(`/cart/items/${itemId}`);
    return data;
  },

  async clear(): Promise<Cart> {
    const { data } = await api.delete<Cart>("/cart");
    return data;
  },

  async applyCoupon(code: string): Promise<Cart> {
    const { data } = await api.post<Cart>("/cart/coupon", { code });
    return data;
  },

  async removeCoupon(): Promise<Cart> {
    const { data } = await api.delete<Cart>("/cart/coupon");
    return data;
  },

  /** Simula o frete de um produto (página de produto), com a cotação real quando houver. */
  async quoteShipping(payload: {
    zipCode: string;
    variantId: string;
    quantity: number;
  }): Promise<{
    options: ShippingOption[];
    freeShippingThresholdCents: number;
  }> {
    const { data } = await api.post("/shipping/quote", payload);
    return data;
  },
};
