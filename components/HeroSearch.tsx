"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Scissors, Search, MapPin } from "lucide-react";

const C = {
  surface: "var(--pub-surface)",
  line: "var(--pub-line)",
  muted: "var(--pub-muted)",
  dim: "var(--pub-dim)",
  text: "var(--pub-text)",
  orange: "var(--pub-orange)",
};

type Mod = "beauty" | "grooming";

export default function HeroSearch() {
  const [mod, setMod] = useState<Mod>("beauty");
  const [q, setQ] = useState("");
  const [oras, setOras] = useState("");
  const router = useRouter();
  const grooming = mod === "grooming";

  function cauta() {
    // Căutarea reală se face în dashboard, deci mai întâi trebuie cont.
    // Ducem omul la conectare, nu la înregistrare: cei mai mulți dintre cei
    // care caută au deja cont, iar cine nu are găsește acolo „Nu ai cont?
    // Înregistrează-te gratuit". Ce a scris în căutare merge mai departe în
    // adresă, ca să nu se piardă când vom lega căutarea reală.
    const params = new URLSearchParams();
    params.set("mod", mod);
    if (q.trim()) params.set("q", q.trim());
    if (oras.trim()) params.set("oras", oras.trim());
    router.push(`/login?${params.toString()}`);
  }

  const tabBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7, border: "none", borderRadius: 50,
    padding: "9px 18px", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, cursor: "pointer",
  };

  return (
    <>
      {/* toggle */}
      <div className="ch-hero-anim" style={{ display: "inline-flex", gap: 4, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 50, padding: 4, marginTop: 30, boxShadow: "0 2px 16px rgba(120,90,60,.08)", animationDelay: ".42s" }}>
        <button type="button" onClick={() => setMod("beauty")} aria-pressed={!grooming}
          style={{ ...tabBase, background: !grooming ? C.orange : "transparent", color: !grooming ? "#fff" : C.muted }}>
          <Scissors size={15} strokeWidth={2} /> Înfrumusețare
        </button>
        <button type="button" onClick={() => setMod("grooming")} aria-pressed={grooming}
          style={{ ...tabBase, background: grooming ? C.orange : "transparent", color: grooming ? "#fff" : C.muted }}>
          <PawPrint size={15} strokeWidth={2} /> Grooming
        </button>
      </div>

      {/* search */}
      <div className="ch-hero-anim ch-search" style={{ display: "flex", alignItems: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 20, boxShadow: "0 20px 50px rgba(120,90,60,.14)", maxWidth: 660, margin: "14px auto 0", padding: 6, textAlign: "left", animationDelay: ".52s" }}>
        <div className="ch-search-field" style={{ flex: 1.5, display: "flex", alignItems: "center", gap: 11, padding: "6px 16px", minWidth: 0 }}>
          <Search size={19} color={C.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") cauta(); }}
            placeholder={grooming ? "Grooming, tuns, baie, deghajare…" : "Frizerie, coafor, unghii, cosmetică…"}
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: C.text }}
          />
        </div>
        <div className="ch-search-sep" style={{ width: 1, height: 30, background: C.line, flexShrink: 0 }} />
        <div className="ch-search-field" style={{ flex: 1, display: "flex", alignItems: "center", gap: 11, padding: "6px 16px", minWidth: 0 }}>
          <MapPin size={19} color={C.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            value={oras}
            onChange={(e) => setOras(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") cauta(); }}
            placeholder="Orașul tău"
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: C.text }}
          />
        </div>
        <button type="button" onClick={cauta} className="ch-search-btn"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 12, border: "none", background: C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 22px rgba(255,107,0,.32)", flexShrink: 0 }}>
          <Search size={17} strokeWidth={2.4} /> Caută
        </button>
      </div>
    </>
  );
}
