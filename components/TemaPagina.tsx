"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ține tema pe regula stabilită: **întunericul există doar în dashboard**.
 *
 * - Paginile publice (Home, prețuri, termeni, conectare, înregistrare…) sunt
 *   întotdeauna deschise, indiferent ce temă și-a ales utilizatorul.
 * - În `/dashboard/*` se aplică preferința lui, ținută în `profiluri.tema` și
 *   păstrată în localStorage doar ca să nu clipească ecranul la încărcare.
 * - `/admin` are paleta lui, scrisă în pagină — nu depinde de `data-theme`.
 *
 * Scriptul din `app/layout.tsx` face aceeași verificare înainte de prima
 * afișare, ca să nu se vadă un fulger alb. Componenta asta o repetă la fiecare
 * schimbare de rută, când navigarea se face din React și scriptul nu mai rulează.
 */
export default function TemaPagina() {
  const pathname = usePathname();

  useEffect(() => {
    const inDashboard = pathname?.startsWith("/dashboard") ?? false;
    if (!inDashboard) {
      document.documentElement.dataset.theme = "";
      return;
    }
    try {
      if (localStorage.getItem("calyhub_theme") === "dark") {
        document.documentElement.dataset.theme = "dark";
      }
    } catch {}
  }, [pathname]);

  return null;
}
