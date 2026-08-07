"use client";
import { useEffect } from "react";

/**
 * Mișcarea paginilor publice la derulare.
 *
 * Două lucruri diferite, pe două niveluri:
 *
 * 1. **Intrarea, element cu element.** Orice element cu `data-reveal` apare când
 *    ajunge în ecran, în cascadă după poziția lui în părinte. Stilul e în
 *    `globals.css`; aici doar decidem când și cu ce decalaj.
 *
 * 2. **Ieșirea, pe secțiune întreagă.** Când o secțiune părăsește ecranul, se
 *    estompează urcând. Dacă fiecare element ar pleca separat, blocul s-ar
 *    destrăma; așa pleacă tot odată.
 *
 *    Secțiunile primesc clasa `ch-bloc`, iar aici le scriem `--iesire`, de la 0
 *    la 1, la fiecare cadru de derulare. Fiind calculat din poziție, nu din timp,
 *    efectul arată identic derulând în jos și înapoi în sus.
 *
 *    Am încercat întâi `animation-timeline: view()`, care ar fi fost mai ieftin,
 *    dar nu merge în toate browserele și nu i-am putut verifica rezultatul —
 *    valorile rămâneau înghețate la măsurare. Aici se pot măsura.
 *
 * Urmărește și elementele apărute ulterior (carduri re-randate după un
 * comutator). Fără asta, un element nou rămânea invizibil, pentru că nu apucase
 * niciodată să fie observat.
 */

/**
 * Cât din secțiune mai trebuie să rămână pe ecran, ca fracțiune din înălțimea
 * ecranului, când estomparea începe (`START`) și când e completă (`FINAL`).
 * Măsurăm cât a rămas vizibil sus, nu cât la sută din secțiune a trecut. De aceea
 * efectul e identic pe o secțiune scurtă și pe una de trei ecrane, și de aceea
 * merge la fel pe telefon, unde conținutul se așază pe verticală și secțiunile
 * devin mult mai înalte. Nimic lizibil nu dispare sub ochii cuiva: când
 * estomparea începe, din secțiune a mai rămas mai puțin de un sfert de ecran.
 */
const START = 0.72;
const FINAL = 0.10;

const intre01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(el => el.classList.add("is-revealed"));
      return;
    }

    /* ── 1. Intrarea ── */
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
      // Cascadă: decalaj după poziția în părinte. Pe telefon cardurile stau unul
      // sub altul, deci un decalaj mare le-ar face să apară pe rând, vizibil —
      // acolo îl înjumătățim.
      const idx = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
      const pas = window.innerWidth <= 760 ? 32 : 65;
      el.style.transitionDelay = `${Math.min(Math.max(idx, 0), 6) * pas}ms`;
      io.observe(el);
    };

    /* ── 2. Ieșirea ── */
    let blocuri: HTMLElement[] = [];

    const marcheazaBlocuri = () => {
      blocuri = [...document.querySelectorAll<HTMLElement>("main > section")];
      blocuri.forEach(sec => sec.classList.add("ch-bloc"));
    };

    let cerut = false;
    const actualizeaza = () => {
      cerut = false;
      const vh = window.innerHeight;
      const sus = START * vh;
      const jos = FINAL * vh;
      for (const sec of blocuri) {
        const r = sec.getBoundingClientRect();
        // cât din secțiune mai e vizibil deasupra marginii de sus
        const ramas = r.bottom;
        const p = ramas >= sus ? 0 : intre01((sus - ramas) / (sus - jos));
        sec.style.setProperty("--iesire", p.toFixed(3));
      }
    };
    const laDerulare = () => {
      if (cerut) return;
      cerut = true;
      requestAnimationFrame(actualizeaza);
    };

    const scaneaza = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(inregistreaza);
      marcheazaBlocuri();
      laDerulare();
    };

    scaneaza();

    window.addEventListener("scroll", laDerulare, { passive: true });

    // La rotirea telefonului sau la redimensionarea ferestrei, recalculăm.
    let t: ReturnType<typeof setTimeout>;
    const laRedimensionare = () => {
      clearTimeout(t);
      t = setTimeout(actualizeaza, 200);
    };
    window.addEventListener("resize", laRedimensionare);

    // Elementele adăugate după prima randare (comutatoare, liste filtrate) intră și ele sub observație.
    const mo = new MutationObserver((mutatii) => {
      if (mutatii.some(m => m.addedNodes.length > 0)) scaneaza();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", laDerulare);
      window.removeEventListener("resize", laRedimensionare);
      clearTimeout(t);
    };
  }, []);
  return null;
}
