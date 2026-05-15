"use client";
import { useEffect } from "react";

export default function ResetTheme() {
  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");
  }, []);
  return null;
}
