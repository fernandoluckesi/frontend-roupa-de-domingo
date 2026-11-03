import { api } from "./http";
import type {
  DiscoverResult,
  EasterEggItem,
  EasterEggProgress,
} from "../types";

export const easterEggsService = {
  async list(): Promise<{
    items: EasterEggItem[];
    progress: EasterEggProgress;
  }> {
    const { data } = await api.get("/easter-eggs");
    return data;
  },

  async progress(): Promise<EasterEggProgress> {
    const { data } = await api.get<EasterEggProgress>("/easter-eggs/progress");
    return data;
  },

  async discover(code: string): Promise<DiscoverResult> {
    const { data } = await api.post<DiscoverResult>(
      `/easter-eggs/${code}/discover`,
    );
    return data;
  },
};
