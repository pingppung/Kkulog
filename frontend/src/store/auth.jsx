import { create } from "zustand";

export const useAuthStore = create((set) => ({
    username: null,
    loggedIn: false,

    setUser: (username) => set({ username, loggedIn: true }),
    clearUser: () => set({ username: null, loggedIn: false }),
}));
