import React from "react";

const ThemeContext = React.createContext(null);
const THEME_KEY = "catbureau_theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(() => localStorage.getItem(THEME_KEY) || "nord");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "nord" ? "abyss" : "nord"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}