"use client";
import { useEffect } from "react";

/**
 * Pornește animația de intrare a semnului din antet — o singură dată pe sesiune.
 *
 * Antetul apare pe fiecare pagină. Dacă mișcarea s-ar relua la fiecare
 * navigare, ar deveni obositoare după două clicuri. Ținem minte în
 * `sessionStorage` că a rulat: se repetă abia la o vizită nouă.
 *
 * Clasa se pune pe `<html>`, ca CSS-ul din `globals.css` să prindă semnul
 * înainte de prima afișare, indiferent pe ce pagină a intrat omul.
 */
export default function MarcaAnim() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("calyhub_marca_vazuta")) return;
      sessionStorage.setItem("calyhub_marca_vazuta", "1");
    } catch {
      // fără sessionStorage (navigare privată), animația rulează de fiecare dată
    }
    const el = document.documentElement;
    el.classList.add("ch-anim-marca");
    // scoatem clasa după ce s-a terminat, ca o re-randare să n-o repornească
    const t = setTimeout(() => el.classList.remove("ch-anim-marca"), 2000);
    return () => clearTimeout(t);
  }, []);
  return null;
}
