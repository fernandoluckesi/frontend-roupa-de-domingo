import { api } from "./http";
import type { CheckoutResponse, Order } from "../types";

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerDocument?: string;
  shippingAddress: {
    recipient: string;
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
  shippingMethod?: "economico" | "expresso";
  notes?: string;
}

export const ordersService = {
  async checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    const { data } = await api.post<CheckoutResponse>("/orders", payload);
    return data;
  },

  async listMine(): Promise<Order[]> {
    const { data } = await api.get<Order[]>("/orders");
    return data;
  },

  async byNumber(number: string): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${number}`);
    return data;
  },

  async cancel(number: string): Promise<Order> {
    const { data } = await api.post<Order>(`/orders/${number}/cancel`);
    return data;
  },
};

export const paymentsService = {
  async config(): Promise<{
    driver: string;
    simulated: boolean;
    message: string;
  }> {
    const { data } = await api.get("/payments/config");
    return data;
  },

  async status(orderNumber: string) {
    const { data } = await api.get(`/payments/${orderNumber}/status`);
    return data;
  },

  /** Só funciona no driver mock, usado pela tela de checkout simulado. */
  async simulate(
    orderNumber: string,
    outcome: "approve" | "reject" | "pending",
  ) {
    const { data } = await api.post(`/payments/mock/${orderNumber}/${outcome}`);
    return data;
  },

  async syncFulfillment(orderNumber: string) {
    const { data } = await api.get(`/fulfillment/${orderNumber}/sync`);
    return data;
  },
};
