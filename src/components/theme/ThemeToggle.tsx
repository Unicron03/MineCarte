"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    
   
    React.useEffect(() => {
        setMounted(true);
    }, []);
    
    //eviter les problèmes d'hydratation en ne rendant rien côté serveur
    if (!mounted) {
        return (
            <button
                className="p-2 rounded bg-gray-100 dark:bg-[#27272a] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2 cursor-pointer"
                title="Changer la couleur du thème"
                disabled
            >
                <Sun className="h-5 w-5 text-gray-400" />
                <span className="text-sm">Thème</span>
            </button>
        );
    }
    
   
    const isDark = theme === "dark";
    
    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded bg-gray-100 dark:bg-[#27272a] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2 cursor-pointer"
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
