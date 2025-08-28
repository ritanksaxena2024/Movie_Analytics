'use client'
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import Header from "./common/Header";
import Footer from "./common/Footer";
import { usePathname } from "next/navigation";
import { darkTheme, lightTheme } from "./Theme";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  colors: typeof lightTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  colors: lightTheme,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      return savedTheme || "light";
    }
    return "light";
  });

  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const colors = theme === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const root = document.documentElement;
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--surface", colors.surface);
    root.style.setProperty("--overlay", colors.overlay);
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--highlight", colors.highlight);
    root.style.setProperty("--text-primary", colors.textPrimary);
    root.style.setProperty("--text-secondary", colors.textSecondary);
    root.style.setProperty("--text-disabled", colors.textDisabled);
  }, [isClient, colors]);

  const hideLayout = ["/login", "/register"].includes(pathname || "");

  if (!isClient) {
    return (
      <div className="p-4 h-screen bg-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundColor: colors.background,
          color: colors.textPrimary,
        }}
      >
        {!hideLayout && <Header />}
        <main className="flex-1">{children}</main>
        {!hideLayout && <Footer />}
      </div>
    </ThemeContext.Provider>
  );
}
