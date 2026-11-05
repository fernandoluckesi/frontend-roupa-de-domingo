import { api, getSessionId } from "./http";
import type { Address, User } from "../types";

export interface Session {
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  document?: string;
  acceptTerms: boolean;
  termsVersion: string;
  privacyVersion: string;
  marketingOptIn?: boolean;
}

export const authService = {
  async login(email: string, password: string, otp?: string): Promise<Session> {
    const { data } = await api.post<Session>("/auth/login", {
      email,
      password,
      ...(otp ? { otp } : {}),
      sessionId: getSessionId(),
    });
    return { user: data.user };
  },

  async register(payload: RegisterInput): Promise<Session> {
    const { data } = await api.post<Session>("/auth/register", {
      ...payload,
      sessionId: getSessionId(),
    });
    return { user: data.user };
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async logoutAll(): Promise<void> {
    await api.post("/auth/logout-all");
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<User> {
    const { data } = await api.post<Session>("/auth/password", { currentPassword, newPassword });
    return data.user;
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<{ message: string }>("/auth/password/forgot", { email });
    return data.message;
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/password/reset", { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post("/auth/email/verify", { token });
  },

  async resendVerification(): Promise<void> {
    await api.post("/auth/email/verification");
  },

  /** LGPD art. 18, II e V: todos os dados da conta em JSON */
  async exportData(): Promise<Blob> {
    const { data } = await api.get("/users/me/export", { responseType: "blob" });
    return data as Blob;
  },

  async setMarketingConsent(marketingOptIn: boolean): Promise<{ marketingOptIn: boolean }> {
    const { data } = await api.patch<{ marketingOptIn: boolean }>("/users/me/consents", { marketingOptIn });
    return data;
  },

  /** LGPD art. 18, VI: exclui a conta e anonimiza os dados */
  async deleteAccount(password: string, reason?: string): Promise<void> {
    await api.delete("/users/me", { data: { password, reason } });
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
