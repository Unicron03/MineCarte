"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    
    // Détecte l'état actuel
    const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded bg-gray-100 dark:bg-[#27272a] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2"
            title="Changer la couleur du thème"
        >
            {isDark ? (
                <>
                    <Sun className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm">Clair</span>
                </>
            ) : (
                <>
                    <Moon className="h-5 w-5 text-gray-800" />
                    <span className="text-sm">Sombre</span>
                </>
            )}
        </button>
    );
}
