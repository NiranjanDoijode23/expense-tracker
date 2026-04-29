"use client";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn
        relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer border
        ${isDark
          ? "bg-indigo-500/20 border-indigo-500/30"
          : "bg-amber-400/20 border-amber-400/30"
        }
      `}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Track */}
      <div className={`
        absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm
        transition-all duration-300 shadow-md
        ${isDark
          ? "translate-x-0 bg-indigo-500"
          : "translate-x-7 bg-amber-400"
        }
      `}>
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}