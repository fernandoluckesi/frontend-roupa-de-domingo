import { api, getSessionId } from "./http";

export const consentService = {
  /** Registra a escolha de cookies no servidor (prova do consentimento). */
  async record(choice: {
    version: string;
    preferences: boolean;
    statistics: boolean;
    marketing: boolean;
  }): Promise<void> {
    await api.post("/privacy/consents/cookies", {
      ...choice,
      sessionId: getSessionId(),
    });
  },
};
