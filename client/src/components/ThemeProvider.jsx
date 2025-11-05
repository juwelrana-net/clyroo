// client/src/components/ThemeProvider.jsx

import React, { createContext, useContext, useEffect, useState } from "react";

// Theme types define karein
const initialState = {
    theme: "system",
    setTheme: () => null,
};

// Naya Context banayein
const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme", // Local storage mein save karne ke liye key
    ...props
}) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem(storageKey) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement; // <html> element

        root.classList.remove("light", "dark");

        if (theme === "system") {
            // System ki preference check karein
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";

            root.classList.add(systemTheme);
            return;
        }

        // "light" ya "dark" class ko add karein
        root.classList.add(theme);
    }, [theme]); // Jab bhi theme state badle, yeh effect run hoga

    const value = {
        theme,
        setTheme: (theme) => {
            localStorage.setItem(storageKey, theme); // Nayi theme ko save karein
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

// Ek custom hook banayein taaki theme ko aasani se istemal kar sakein
export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};