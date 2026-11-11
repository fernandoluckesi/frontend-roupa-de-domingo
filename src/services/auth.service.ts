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
  async login(email: string, password: string): Promise<Session> {
    const { data } = await api.post<Session>("/auth/login", {
      email,
      password,
      sessionId: getSessionId(),
    });
    return { user: data.user };
  },

  /** Cria a conta e envia o código por e-mail. A sessão só abre na confirmação. */
  async register(payload: RegisterInput): Promise<{ email: string }> {
    const { data } = await api.post<{ email: string }>(
      "/auth/register",
      payload,
    );
    return data;
  },

  async confirmRegistration(email: string, code: string): Promise<Session> {
    const { data } = await api.post<Session>("/auth/register/confirm", {
      email,
      code,
      sessionId: getSessionId(),
    });
    return { user: data.user };
  },

  async resendRegistrationCode(email: string): Promise<void> {
    await api.post("/auth/register/resend", { email });
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

  /** Confere a senha atual e envia o código de troca para o e-mail. Devolve o e-mail mascarado. */
  async requestPasswordChangeCode(currentPassword: string): Promise<string> {
    const { data } = await api.post<{ email: string }>("/auth/password/code", {
      currentPassword,
    });
    return data.email;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    code: string,
  ): Promise<User> {
    const { data } = await api.post<Session>("/auth/password", {
      currentPassword,
      newPassword,
      code,
    });
    return data.user;
  },

  /** Confere a senha atual e envia o código para o e-mail novo. Devolve o e-mail novo mascarado. */
  async requestEmailChangeCode(
    newEmail: string,
    currentPassword: string,
  ): Promise<string> {
    const { data } = await api.post<{ email: string }>(
      "/auth/email/change/code",
      { newEmail, currentPassword },
    );
    return data.email;
  },

  async changeEmail(code: string): Promise<User> {
    const { data } = await api.post<Session>("/auth/email/change", { code });
    return data.user;
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<{ message: string }>(
      "/auth/password/forgot",
      { email },
    );
    return data.message;
  },

  /** Links antigos de redefinição (token na URL). */
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/password/reset", { token, password });
  },

  /** Confere o código sem gastá-lo, para liberar a etapa da senha nova. */
  async verifyPasswordCode(email: string, code: string): Promise<void> {
    await api.post("/auth/password/code/verify", { email, code });
  },

  async resetPasswordWithCode(
    email: string,
    code: string,
    password: string,
  ): Promise<void> {
    await api.post("/auth/password/reset", { email, code, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post("/auth/email/verify", { token });
  },

  async resendVerification(): Promise<void> {
    await api.post("/auth/email/verification");
  },

  /** LGPD art. 18, II e V: todos os dados da conta em JSON */
  async exportData(): Promise<Blob> {
    const { data } = await api.get("/users/me/export", {
      responseType: "blob",
    });
    return data as Blob;
  },

  async setMarketingConsent(
    marketingOptIn: boolean,
  ): Promise<{ marketingOptIn: boolean }> {
    const { data } = await api.patch<{ marketingOptIn: boolean }>(
      "/users/me/consents",
      { marketingOptIn },
    );
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
