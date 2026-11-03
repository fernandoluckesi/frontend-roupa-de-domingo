import { api, getSessionId } from "./http";
import type { Address, User } from "../types";

export interface Session {
  accessToken: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    const { data } = await api.post<Session>("/auth/login", {
      email,
      password,
      sessionId: getSessionId(),
    });
    return data;
  },

  async register(payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    document?: string;
  }): Promise<Session> {
    const { data } = await api.post<Session>("/auth/register", {
      ...payload,
      sessionId: getSessionId(),
    });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>("/users/me", payload);
    return data;
  },

  async listAddresses(): Promise<Address[]> {
    const { data } = await api.get<Address[]>("/users/me/addresses");
    return data;
  },

  async createAddress(payload: Omit<Address, "id">): Promise<Address> {
    const { data } = await api.post<Address>("/users/me/addresses", payload);
    return data;
  },

  async removeAddress(id: string): Promise<void> {
    await api.delete(`/users/me/addresses/${id}`);
  },
};
