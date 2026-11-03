import { api } from "./http";
import type { Cart, ShippingOption } from "../types";

export const cartService = {
  async get(zipCode?: string, method?: string): Promise<Cart> {
    const { data } = await api.get<Cart>("/cart", {
      params: { zipCode, method },
    });
    return data;
  },

  async addItem(
    variantId: string,
    quantity = 1,
    customText?: string,
  ): Promise<Cart> {
    const { data } = await api.post<Cart>("/cart/items", {
      variantId,
      quantity,
      customText,
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

  async quoteShipping(
    zipCode: string,
    weightGrams: number,
    subtotalCents: number,
  ): Promise<{
    options: ShippingOption[];
    freeShippingThresholdCents: number;
  }> {
    const { data } = await api.post("/shipping/quote", {
      zipCode,
      weightGrams,
      subtotalCents,
    });
    return data;
  },
};
