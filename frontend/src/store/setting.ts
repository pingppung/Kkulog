import { create } from "zustand";

export type Theme = "lavender" | "sage" | "mono" | "stitch" | "default";

export const useSettingsStore = create<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>(set => ({
  theme: "default",
  setTheme: theme => set({ theme }),
}));
