import { create } from "zustand";

export type Theme = "lavender" | "sage" | "mono" | "stitch";

export const useSettingsStore = create<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>(set => ({
  theme: "stitch",
  setTheme: theme => set({ theme }),
}));
