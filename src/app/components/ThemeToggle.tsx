import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  /** Variante para fundos coloridos (ex.: tela de login) */
  onDark?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  onDark = false,
  className = "",
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      onClick={(e) => {
        setTheme(isDark ? "light" : "dark");
        // Drop focus so a USB QR scanner's Enter doesn't toggle the theme again
        e.currentTarget.blur();
      }}
      className={`relative inline-flex h-8 w-[3.75rem] shrink-0 items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003087] ${
        onDark
          ? "border-white/30 bg-white/15 hover:bg-white/25"
          : "border-gray-200 bg-gray-100 hover:bg-gray-200"
      } ${className}`}
    >
      <Sun
        size={14}
        className={`absolute left-2 transition-opacity ${
          onDark ? "text-white/80" : "text-amber-500"
        } ${isDark ? "opacity-40" : "opacity-0"}`}
      />
      <Moon
        size={14}
        className={`absolute right-2 transition-opacity ${
          onDark ? "text-white/80" : "text-gray-500"
        } ${isDark ? "opacity-0" : "opacity-60"}`}
      />
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-transform duration-200 ${
          isDark
            ? "translate-x-[1.9rem] bg-[#2c4a8a] text-[#fde68a]"
            : "translate-x-1 bg-[#ffffff] text-amber-500"
        }`}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  );
};
