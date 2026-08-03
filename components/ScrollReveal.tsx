"use client";
import { useEffect } from "react";

/**
 * Dezvăluie la scroll orice element cu atributul `data-reveal`.
 * Elementele dintr-o grilă primesc un mic decalaj (cascadă) după index.
 * Respectă prefers-reduced-motion (CSS-ul le lasă vizibile oricum).
 *
 * Urmărește și elementele apărute ulterior (ex. carduri re-randate după un
 * comutator). Fără asta, un element nou rămânea invizibil, pentru că nu apucase
 * niciodată să fie observat.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(el => el.classList.add("is-revealed"));
      return;
    }

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

    const observate = new WeakSet<HTMLElement>();
    const inregistreaza = (el: HTMLElement) => {
      if (observate.has(el) || el.classList.contains("is-revealed")) return;
      observate.add(el);
      // cascadă: decalaj după poziția în părinte
      const idx = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
      el.style.transitionDelay = `${Math.min(Math.max(idx, 0), 6) * 70}ms`;
      io.observe(el);
    };

    const scaneaza = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(inregistreaza);

    scaneaza();

    // Elementele adăugate după prima randare (comutatoare, liste filtrate) intră și ele sub observație.
    const mo = new MutationObserver((mutatii) => {
      if (mutatii.some(m => m.addedNodes.length > 0)) scaneaza();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
  return null;
}
