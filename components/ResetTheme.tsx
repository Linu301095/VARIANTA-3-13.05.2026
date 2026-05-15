"use client";
import { useEffect } from "react";

export default function ResetTheme() {
  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");
    try { localStorage.removeItem("calyhub_theme"); } catch {}
  }, []);
  return null;
}
