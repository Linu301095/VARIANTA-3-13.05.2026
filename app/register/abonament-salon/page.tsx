"use client";
import Logo from "../../../components/Logo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";
import { planuriPentru, pretPlan, VERTICAL, type PlanId, type Vertical, type Ciclu } from "../../../lib/planuri";
import { Check, Store, Users, Building2, ArrowRight } from "lucide-react";

const C = {
  surface: "var(--pub-surface)",
  surface2: "var(--pub-surface2)",
  bg: "var(--pub-bg)",
  line: "var(--pub-line)",
  text: "var(--pub-text)",
  muted: "var(--pub-muted)",
  dim: "var(--pub-dim)",
  orange: "var(--pub-orange)",
  orangeText: "var(--pub-orange-text)",
  orangeSoft: "var(--pub-orange-soft)",
};

const ICON_PLAN = { basic: Store, pro: Users, business: Building2 } as const;

export default function AbonamentSalon() {
  const router = useRouter();
  const [ales, setAles] = useState<PlanId>("pro");
  const [ciclu, setCiclu] = useState<Ciclu>("anual");
  const [vert, setVert] = useState<Vertical>("grooming");
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare] = useState("");

  // Verticala salonului decide cum sunt formulate caracteristicile.
  useEffect(() => {
    let anulat = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || anulat) return;
      const { data: salon } = await supabase
        .from("saloane").select("domeniu, plan").eq("user_id", user.id).single();
      if (anulat || !salon) return;
      if (salon.domeniu === "infrumusetare") setVert("infrumusetare");
      if (salon.plan === "basic" || salon.plan === "pro" || salon.plan === "business") setAles(salon.plan);
    })();
    return () => { anulat = true; };
  }, []);

  const PLANURI = planuriPentru(vert);
  const planAles = PLANURI.find(p => p.id === ales)!;

  async function alegePlan() {
    setLoading(true);
    setEroare("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Trialul a pornit deja la finalul wizardului. Aici doar retinem planul ales.
    const { error } = await supabase.from("saloane").update({ plan: ales }).eq("user_id", user.id);
    if (error) {
      setEroare("Nu am putut salva planul. Încearcă din nou.");
      setLoading(false);
      return;
    }
    router.push("/dashboard/salon");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-surface)", borderBottom: `1px solid ${C.line}`, height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Logo h={44} priority />
          <div className="nav-hide-sm" style={{ fontSize: 13, color: C.dim, fontWeight: 600, whiteSpace: "nowrap" }}>Ultimul pas — planul tău</div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "44px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* ── Antet ── */}
          <div className="ch-hero-anim" style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.orangeSoft, border: "1px solid var(--pub-orange-border)", color: C.orangeText, fontSize: 12, fontWeight: 800, padding: "7px 15px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>
                <Check size={13} strokeWidth={3} /> Trial gratuit activ
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(26px,4vw,34px)", fontWeight: 900, color: C.text, marginBottom: 12, lineHeight: 1.2, letterSpacing: "-.02em" }}>
              Cu ce plan continui după trial?
            </h1>
            <p style={{ fontSize: 15.5, color: C.muted, maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
              Salonul tău funcționează deja complet. Alege planul cu care rămâi mai departe —
              nu îți cerem card acum și poți schimba oricând din contul tău.
            </p>

            {/* comutator lunar / anual */}
            <div style={{ display: "inline-flex", gap: 4, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 50, padding: 4, marginTop: 24, boxShadow: "0 2px 16px rgba(120,90,60,.08)" }}>
              {(["lunar", "anual"] as Ciclu[]).map(cc => {
                const activ = ciclu === cc;
                return (
                  <button key={cc} type="button" onClick={() => setCiclu(cc)}
                    style={{ border: "none", borderRadius: 50, padding: "9px 20px", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, cursor: "pointer", background: activ ? C.orange : "transparent", color: activ ? "#fff" : C.muted, display: "inline-flex", alignItems: "center", gap: 7 }}>
                    {cc === "lunar" ? "Lunar" : "Anual"}
                    {cc === "anual" && (
                      <span style={{ fontSize: 10.5, fontWeight: 900, background: activ ? "rgba(255,255,255,.25)" : "rgba(255,107,0,.12)", color: activ ? "#fff" : C.orangeText, padding: "2px 7px", borderRadius: 50 }}>-17%</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Planuri ── */}
          <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, alignItems: "start", marginBottom: 26 }}>
            {PLANURI.map(p => {
              const activ = ales === p.id;
              const Icon = ICON_PLAN[p.id];
              const pret = pretPlan(p, ciclu);
              return (
                <button key={p.id} type="button" onClick={() => setAles(p.id)}
                  style={{
                    position: "relative", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                    background: C.surface, borderRadius: 24, padding: 24,
                    border: activ ? `2px solid ${C.orange}` : `1.5px solid ${C.line}`,
                    boxShadow: activ ? "0 20px 50px rgba(255,107,0,.18)" : "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
                    transition: "border-color .18s, box-shadow .18s",
                  }}>
                  {p.badge && (
                    <span style={{ position: "absolute", top: -12, left: 22, background: p.recomandat ? C.orange : "var(--pub-badge)", color: "var(--pub-badge-text)", fontSize: 10.5, fontWeight: 900, letterSpacing: .5, textTransform: "uppercase", padding: "4px 12px", borderRadius: 50 }}>{p.badge}</span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={22} color={C.orange} strokeWidth={2} />
                    </div>
                    <span aria-hidden style={{ width: 22, height: 22, borderRadius: "50%", border: activ ? `7px solid ${C.orange}` : `2px solid ${C.line}`, background: C.surface, flexShrink: 0, transition: "border .18s" }} />
                  </div>

                  <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{p.nume}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.orangeText, marginTop: 2 }}>{p.tagline}</div>
                  <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginTop: 8, lineHeight: 1.5, minHeight: 40 }}>{p.descriere}</div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14 }}>
                    <span style={{ fontSize: 38, fontWeight: 900, color: C.text, letterSpacing: -1.5 }}>{pret}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.muted }}>lei / lună</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.dim, fontWeight: 600, marginTop: 3 }}>
                    {ciclu === "anual" ? `facturat anual · ${p.pretLunar} lei dacă plătești lunar` : "facturat lunar"}
                  </div>

                  <div style={{ height: 1, background: C.line, margin: "16px 0 14px" }} />

                  {p.prefix && <div style={{ fontSize: 12.5, fontWeight: 800, color: C.orangeText, marginBottom: 10 }}>{p.prefix}</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                        <Check size={15} color={C.orange} strokeWidth={2.6} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, lineHeight: 1.45 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Ce urmează ── */}
          <div style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 18, padding: "16px 20px", marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <Check size={17} color="var(--pub-ok)" strokeWidth={2.6} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, lineHeight: 1.6, flex: 1, minWidth: 240 }}>
              Nu se activează nicio plată acum și nu îți cerem cardul. La finalul trialului îți spunem
              din timp, iar tu decizi dacă rămâi. Poți schimba planul oricând din contul tău.
            </div>
          </div>

          {eroare && (
            <div style={{ background: "var(--pub-danger-bg)", border: "1px solid var(--pub-danger-line)", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--pub-danger)", textAlign: "center", marginBottom: 16 }}>
              {eroare}
            </div>
          )}

          {/* ── Acțiuni ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button onClick={alegePlan} disabled={loading} className="ch-cta"
              style={{ padding: "16px 40px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : C.orange, color: "#fff", fontSize: 16, fontWeight: 900, cursor: loading ? "default" : "pointer", boxShadow: "0 10px 28px rgba(255,107,0,.34)", fontFamily: "Nunito, sans-serif", display: "inline-flex", alignItems: "center", gap: 9 }}>
              {loading ? "Se salvează..." : `Continuă cu ${planAles.nume}`}
              {!loading && <ArrowRight size={18} strokeWidth={2.6} />}
            </button>

            <button type="button" onClick={() => router.push("/dashboard/salon")} disabled={loading}
              style={{ padding: "10px 18px", borderRadius: 50, border: "none", background: "transparent", color: C.muted, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              Aleg mai târziu — intru în cont →
            </button>

            <div style={{ fontSize: 12, color: C.dim, textAlign: "center", maxWidth: 460, lineHeight: 1.6 }}>
              {VERTICAL[vert].eticheta} · 0% comision pe programări · anulezi oricând
            </div>
          </div>
        </div>
      </main>

      <Footer variant="payment" />
    </div>
  );
}
