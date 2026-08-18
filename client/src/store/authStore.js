import { create } from "zustand";

const useAuthStore = create((set) => ({
  updateUser: (updates) => {
  set((state) => {
    const newUser = { ...state.user, ...updates };
    localStorage.setItem("user", JSON.stringify(newUser));
    return { user: newUser };
  });
},
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,

  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;