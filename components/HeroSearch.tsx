"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Scissors, Search, MapPin } from "lucide-react";

const C = {
  surface: "#fff", line: "#EBEBEB", muted: "#6B7280", dim: "#9CA3AF",
  text: "#1A1A1A", orange: "#FF6B00",
};

type Mod = "grooming" | "beauty";

export default function HeroSearch() {
  const [mod, setMod] = useState<Mod>("grooming");
  const [q, setQ] = useState("");
  const [oras, setOras] = useState("");
  const router = useRouter();
  const grooming = mod === "grooming";

  function cauta() {
    // Căutarea reală vine ulterior; deocamdată ducem clientul spre înregistrare/conectare.
    const params = new URLSearchParams();
    params.set("mod", mod);
    if (q.trim()) params.set("q", q.trim());
    if (oras.trim()) params.set("oras", oras.trim());
    router.push(`/register?${params.toString()}`);
  }

  const tabBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7, border: "none", borderRadius: 50,
    padding: "9px 18px", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, cursor: "pointer",
  };

  return (
    <>
      {/* toggle */}
      <div className="ch-hero-anim" style={{ display: "inline-flex", gap: 4, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 50, padding: 4, marginTop: 30, boxShadow: "0 2px 16px rgba(120,90,60,.08)", animationDelay: ".42s" }}>
        <button type="button" onClick={() => setMod("grooming")} aria-pressed={grooming}
          style={{ ...tabBase, background: grooming ? C.orange : "transparent", color: grooming ? "#fff" : C.muted }}>
          <PawPrint size={15} strokeWidth={2} /> Grooming
        </button>
        <button type="button" onClick={() => setMod("beauty")} aria-pressed={!grooming}
          style={{ ...tabBase, background: !grooming ? C.orange : "transparent", color: !grooming ? "#fff" : C.muted }}>
          <Scissors size={15} strokeWidth={2} /> Înfrumusețare
        </button>
      </div>

      {/* search */}
      <div className="ch-hero-anim" style={{ display: "flex", alignItems: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 20, boxShadow: "0 20px 50px rgba(120,90,60,.14)", maxWidth: 660, margin: "14px auto 0", padding: 6, textAlign: "left", animationDelay: ".52s" }}>
        <div style={{ flex: 1.5, display: "flex", alignItems: "center", gap: 11, padding: "6px 16px", minWidth: 0 }}>
          <Search size={19} color={C.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") cauta(); }}
            placeholder={grooming ? "Grooming, tuns, baie, deghajare…" : "Frizerie, coafor, unghii, cosmetică…"}
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: C.text }}
          />
        </div>
        <div style={{ width: 1, height: 30, background: C.line, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 11, padding: "6px 16px", minWidth: 0 }}>
          <MapPin size={19} color={C.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            value={oras}
            onChange={(e) => setOras(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") cauta(); }}
            placeholder="Orașul tău"
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: C.text }}
          />
        </div>
        <button type="button" onClick={cauta}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 12, border: "none", background: C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 22px rgba(255,107,0,.32)", flexShrink: 0 }}>
          <Search size={17} strokeWidth={2.4} /> Caută
        </button>
      </div>
    </>
  );
}
