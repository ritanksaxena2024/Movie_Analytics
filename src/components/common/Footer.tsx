'use client';
import { useTheme } from "../Layout";

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer
      className="w-full px-6 py-4 text-center"
      style={{
        backgroundColor: `var(--surface)`,
        color: `var(--text-primary)`,
        borderTop: `1px solid var(--overlay)`,
      }}
    >
      <p className="text-sm sm:text-base md:text-lg">
        © 2025 Ritank Saxena. All rights reserved.
      </p>

    </footer>
  );
}
