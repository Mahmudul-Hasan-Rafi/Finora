import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="neo mx-4 mt-4 px-6 py-4 flex items-center justify-between relative">
      <h1
        className="text-2xl font-bold text-(--accent) cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        Finora
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="neo px-3 py-2 text-sm text-(--text) hover:text-(--accent) transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="neo px-4 py-2 text-sm text-(--text) flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-full bg-(--accent) text-white flex items-center justify-center text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
            {user?.name || "User"}
          </button>

          {menuOpen && (
            <div className="neo absolute right-0 mt-2 w-40 py-2 z-10">
              <button
                onClick={() => { navigate("/settings"); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-(--text) hover:text-(--accent) transition"
              >
                Settings
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}