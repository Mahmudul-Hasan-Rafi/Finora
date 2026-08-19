import { create } from "zustand";

const useThemeStore = create((set) => ({
  theme: localStorage.getItem("theme") || "dark",

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return { theme: newTheme };
    });
  },

  initTheme: () => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", saved === "dark");
    set({ theme: saved });
  },
}));

export default useThemeStore;