"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { normalizeaza } from "../lib/orase";

/**
 * Câmp cu listă derulantă în care se poate și scrie.
 *
 * Scopul e să scoatem greșelile de scriere din datele salonului: „Cluj",
 * „Cluj Napoca" și „cluj-napoca" ar fi trei orașe diferite pentru bază, iar
 * paginile de oraș și căutarea clientului se sprijină pe scrierea exactă.
 *
 * Scrisul filtrează lista, nu o înlocuiește. Căutarea ignoră diacriticele, ca
 * „targu mures" să găsească „Târgu Mureș". Dacă totuși nimic nu se potrivește —
 * o localitate care lipsește din listă — se poate păstra textul scris, ca să nu
 * blocăm pe nimeni; `permiteLiber` decide dacă e cazul.
 */
export default function SelectCautabil({
  valoare,
  optiuni,
  onSchimba,
  placeholder = "Alege sau scrie…",
  eroare = false,
  dezactivat = false,
  permiteLiber = true,
  id,
}: {
  valoare: string;
  optiuni: string[];
  onSchimba: (v: string) => void;
  placeholder?: string;
  eroare?: boolean;
  dezactivat?: boolean;
  permiteLiber?: boolean;
  id?: string;
}) {
  const [deschis, setDeschis] = useState(false);
  const [cauta, setCauta] = useState("");
  const [activ, setActiv] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const camp = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);

  const filtrate = useMemo(() => {
    const q = normalizeaza(cauta);
    if (!q) return optiuni;
    const incepe = optiuni.filter(o => normalizeaza(o).startsWith(q));
    const contine = optiuni.filter(o => !normalizeaza(o).startsWith(q) && normalizeaza(o).includes(q));
    return [...incepe, ...contine];
  }, [optiuni, cauta]);

  // Închidere la clic în afară
  useEffect(() => {
    if (!deschis) return;
    const afara = (e: MouseEvent) => {
      if (container.current && !container.current.contains(e.target as Node)) inchide();
    };
    document.addEventListener("mousedown", afara);
    return () => document.removeEventListener("mousedown", afara);
  }, [deschis, cauta]);

  // Ține opțiunea activă în ecran când navighezi cu tastele
  useEffect(() => {
    if (!deschis || !lista.current) return;
    const el = lista.current.children[activ] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activ, deschis]);

  function deschide() {
    if (dezactivat) return;
    setCauta("");
    setActiv(Math.max(0, optiuni.indexOf(valoare)));
    setDeschis(true);
    setTimeout(() => camp.current?.focus(), 0);
  }

  function inchide() {
    // Textul scris de mână se păstrează doar dacă nu se potrivește cu nimic
    // și dacă avem voie — altfel câmpul rămâne cum era.
    if (permiteLiber && cauta.trim() && filtrate.length === 0) onSchimba(cauta.trim());
    setDeschis(false);
    setCauta("");
  }

  function alege(v: string) {
    onSchimba(v);
    setDeschis(false);
    setCauta("");
  }

  const stilCamp: React.CSSProperties = {
    width: "100%", padding: "13px 40px 13px 16px", borderRadius: 14,
    border: `1.5px solid ${eroare ? "var(--pub-danger)" : deschis ? "var(--pub-orange)" : "var(--pub-line)"}`,
    fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box",
    background: dezactivat ? "var(--pub-surface2)" : "var(--pub-surface)",
    color: dezactivat ? "var(--pub-dim)" : "var(--pub-text)",
    textAlign: "left", cursor: dezactivat ? "not-allowed" : "pointer",
    boxShadow: deschis ? "0 0 0 4px rgba(255,107,0,.13)" : "none",
    transition: "border-color .18s, box-shadow .18s",
  };

  return (
    <div ref={container} style={{ position: "relative" }}>
      {!deschis ? (
        <button type="button" id={id} onClick={deschide} disabled={dezactivat} style={stilCamp}>
          <span style={{ color: valoare ? "var(--pub-text)" : "var(--pub-dim)", fontWeight: valoare ? 600 : 400 }}>
            {valoare || placeholder}
          </span>
        </button>
      ) : (
        <input
          ref={camp}
          value={cauta}
          onChange={e => { setCauta(e.target.value); setActiv(0); }}
          placeholder={valoare || placeholder}
          style={{ ...stilCamp, cursor: "text" }}
          onKeyDown={e => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActiv(a => Math.min(a + 1, filtrate.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActiv(a => Math.max(a - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); if (filtrate[activ]) alege(filtrate[activ]); else inchide(); }
            else if (e.key === "Escape") { e.preventDefault(); setDeschis(false); setCauta(""); }
          }}
        />
      )}

      <span aria-hidden style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", color: "var(--pub-dim)" }}>
        {deschis ? <Search size={16} strokeWidth={2.2} /> : <ChevronDown size={16} strokeWidth={2.2} />}
      </span>

      {deschis && (
        <div ref={lista} role="listbox"
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 60,
            maxHeight: 244, overflowY: "auto",
            background: "var(--pub-surface)", border: "1.5px solid var(--pub-line)", borderRadius: 14,
            boxShadow: "0 14px 40px rgba(120,90,60,.18)", padding: 5,
          }}>
          {filtrate.length === 0 ? (
            <div style={{ padding: "12px 14px", fontSize: 13, color: "var(--pub-muted)", lineHeight: 1.6 }}>
              Nimic găsit.
              {permiteLiber && cauta.trim() && <> Apasă Enter ca să folosești „<strong>{cauta.trim()}</strong>".</>}
            </div>
          ) : (
            filtrate.map((o, i) => {
              const ales = o === valoare;
              return (
                <button key={o} type="button" role="option" aria-selected={ales}
                  onMouseEnter={() => setActiv(i)}
                  onClick={() => alege(o)}
                  style={{
                    width: "100%", textAlign: "left", border: "none", borderRadius: 10,
                    padding: "10px 12px", fontFamily: "Nunito, sans-serif", fontSize: 14,
                    fontWeight: ales ? 800 : 600,
                    color: ales ? "var(--pub-orange-text)" : "var(--pub-text)",
                    background: i === activ ? "var(--pub-orange-soft)" : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                  }}>
                  {o}
                  {ales && <Check size={15} strokeWidth={2.8} />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
