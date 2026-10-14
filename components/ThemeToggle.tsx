"use client";

import { useTheme } from "./ThemeProvider";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs">
      <button
        type="button"
        onClick={() => setTheme("system")}
        title={`System theme (${resolvedTheme === "dark" ? "Dark detected" : "Light detected"})`}
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
          theme === "system"
            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
            : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <Monitor size={13} />
        <span className="hidden sm:inline">System</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Force Dark mode"
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
          theme === "dark"
            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
            : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <Moon size={13} />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Force Light mode"
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
          theme === "light"
            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
            : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <Sun size={13} />
        <span className="hidden sm:inline">Light</span>
      </button>
    </div>
  );
}
