"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle({ size = 36 }: { size?: number }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("calyhub_theme")) as Theme | null;
    const initial: Theme = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("calyhub_theme", next); } catch {}
  }

  if (!mounted) {
    return <div style={{ width: size, height: size }} aria-hidden="true" />;
  }

  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      title={isDark ? "Comută la light mode" : "Comută la dark mode"}
      aria-label="Comută tema"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1.5px solid var(--ch-border)",
        background: "var(--ch-surface)",
        color: "var(--ch-text)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: Math.round(size * 0.5),
        padding: 0,
        flexShrink: 0,
        fontFamily: "Nunito, sans-serif",
        lineHeight: 1,
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
