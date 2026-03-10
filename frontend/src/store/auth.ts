import { create } from "zustand";
import { User } from "../features/auth/auth.types";

interface AuthState {
  user: User | null;
  loggedIn: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loggedIn: false,

  setUser: (user) =>
    set({ user, loggedIn: true }),

  clearUser: () =>
    set({ user: null, loggedIn: false }),
}));