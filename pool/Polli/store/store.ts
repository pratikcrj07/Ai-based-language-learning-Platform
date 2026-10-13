import { create } from "zustand";

interface UserStore {
  user: any;
  token: string | null;
  selectedLang: string;
  languages: string[];
  setSelectedLang: (lang: string) => void;
  setLanguages: (languages: string[]) => void;
  setUser: (user: any) => void;
  setToken: (token: string | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,
  selectedLang: "de",
  languages: ["de"],
  setSelectedLang: (lang) => set({ selectedLang: lang }),
  setLanguages: (languages) => set({ languages }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));
