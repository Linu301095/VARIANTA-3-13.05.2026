"use client";
import { useEffect } from "react";

/**
 * Dezvăluie la scroll orice element cu atributul `data-reveal`.
 * Elementele dintr-o grilă primesc un mic decalaj (cascadă) după index.
 * Respectă prefers-reduced-motion (CSS-ul le lasă vizibile oricum).
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    // cascadă: decalaj după poziția în părinte
    els.forEach((el) => {
      const idx = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
      el.style.transitionDelay = `${Math.min(Math.max(idx, 0), 6) * 70}ms`;
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
