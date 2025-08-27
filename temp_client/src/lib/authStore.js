import { create } from "zustand";

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem("accessToken") || "",
  user: null,

  setSession: ({ accessToken, user }) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    set({ accessToken, user });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    set({ accessToken: "", user: null });
  },
}));

export default useAuthStore;
