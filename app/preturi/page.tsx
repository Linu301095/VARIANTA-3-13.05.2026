"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import { supabase } from "../../lib/supabase";
import { planuriPentru, VERTICAL as VERT, type Vertical as Vert, type Ciclu } from "../../lib/planuri";
import {
  Check, Gift, Flame, Users, Store, Building2, HelpCircle,
} from "lucide-react";
import { IconPlanuri, SparkleAnim } from "../../components/SectionIcons";

const LOCURI_PROMO = 10;

/** Iconita fiecarui plan — vizualul sta in pagina, datele in lib/planuri.ts */
const ICON_PLAN = { basic: Store, pro: Users, business: Building2 } as const;

const C = {
  surface: "var(--pub-surface)",
  bg: "var(--pub-bg)",
  surface2: "var(--pub-surface2)",
  line: "var(--pub-line)",
  text: "var(--pub-text)",
  muted: "var(--pub-muted)",
  dim: "var(--pub-dim)",
  orange: "var(--pub-orange)",
  orangeText: "var(--pub-orange-text)",
  orangeSoft: "var(--pub-orange-soft)",
};

const eyebrow: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: C.orangeText,
  background: C.orangeSoft, border: "1px solid var(--pub-orange-border)", borderRadius: 50, padding: "7px 15px",
};
const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "14px 26px", borderRadius: 50, background: C.orange, color: "#fff",
  fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 22px rgba(255,107,0,.32)",
};
const btnSecondary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "14px 26px", borderRadius: 50, background: "var(--pub-surface)", color: C.text,
  fontSize: 15, fontWeight: 800, textDecoration: "none", border: `1.5px solid ${C.line}`,
};
const tile: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22, padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
};
const h2s: React.CSSProperties = { fontSize: "clamp(24px,3.2vw,34px)", fontWeight: 900, letterSpacing: -0.6, color: C.text };
const lead: React.CSSProperties = { fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7 };

const INCLUS_TOATE = [
  "O singură subscripție pe tot salonul — nu plătești per angajat",
  "0% comision pe programări — încasezi integral la salon",
  "Programări, clienți și animale nelimitate",
  "Pagină publică de rezervări 24/7 + listare în orașul tău",
  "Calendar cu disponibilitate live (slot 30 min, anti-dublă-rezervare)",
  "Blocaje manuale (telefonic / walk-in / pauze)",
  "Recenzii + rating · dosar per client · protecție anti-no-show",
  "Web și mobil, cu datele sincronizate în timp real",
];

const FAQ = [
  { q: "Se aplică și pentru saloane de înfrumusețare?", a: "Da. Aceleași planuri acoperă și frizeriile, coaforurile, cosmetica și manichiura, și saloanele de grooming. Diferența e doar în felul cum configurezi serviciile." },
  { q: "Ce înseamnă 0% comision?", a: "Nu luăm nimic din prețul serviciilor. Clientul plătește la salon, integral. Tu plătești doar abonamentul lunar." },
  { q: "Ce se întâmplă după trialul gratuit?", a: "Alegi planul potrivit și continui. Nu se activează nimic automat și nu cerem card la înscriere." },
  { q: "Pot schimba planul mai târziu?", a: "Da, oricând — treci pe un plan superior sau inferior în funcție de cum crește echipa." },
  { q: "Plata anuală e obligatorie?", a: "Nu. Poți plăti lunar; facturarea anuală vine doar cu un preț mai bun." },
  { q: "Agenții AI costă separat?", a: "Nu. Sunt incluși în plan, activați din prima zi, fără setări tehnice." },
];

export default function Preturi() {
  const [ciclu, setCiclu] = useState<Ciclu>("anual");
  const [vert, setVert] = useState<Vert>("infrumusetare");
  const [locuriRamase, setLocuriRamase] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { count } = await supabase.from("saloane").select("id", { count: "exact", head: true });
      if (count !== null && count !== undefined) setLocuriRamase(Math.max(0, LOCURI_PROMO - count));
    })();
  }, []);

  const promoActiva = locuriRamase === null || locuriRamase > 0;
  const PLANURI = planuriPentru(vert);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-header)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, height: 70 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo h={54} priority />
          <nav className="hdr-nav" style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/login" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: "var(--pub-surface)", border: "1.5px solid var(--pub-line2)", fontSize: 14, fontWeight: 800, color: C.text, textDecoration: "none", boxShadow: "0 2px 8px rgba(120,90,60,.08)" }}>Conectare</Link>
            <Link href="/register" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 6px 18px rgba(255,107,0,.32)" }}>Creează cont</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* HERO */}
        <section style={{ position: "relative", overflow: "hidden", padding: "76px 20px 40px" }}>
          <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(255,107,0,.20)", top: -120, left: "14%" }} />
          <div className="ch-orb b" style={{ width: 300, height: 300, background: "rgba(255,140,66,.16)", top: 10, right: "10%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ display: "flex", justifyContent: "center", marginBottom: 18, animationDelay: ".05s" }}>
              <IconPlanuri size={64} />
            </div>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 18, animationDelay: ".12s" }}>PLANURI PENTRU SALOANE</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(32px,5vw,50px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -1.5, color: C.text, animationDelay: ".2s" }}>
              O subscripție pe salon.<br /><span style={{ color: C.orange }}>Nu per angajat.</span>
            </h1>
            <p className="ch-hero-anim" style={{ margin: "18px auto 0", maxWidth: "56ch", fontSize: 17.5, lineHeight: 1.7, fontWeight: 500, color: C.muted, animationDelay: ".3s" }}>
              Aceleași planuri pentru saloane de înfrumusețare și de grooming. Programări nelimitate,
              0% comision pe rezervări și agenți AI incluși. Începi cu trial gratuit, fără card la înscriere.
            </p>

            {/* promo */}
            {promoActiva && (
              <div className="ch-hero-anim" style={{ display: "flex", justifyContent: "center", marginTop: 24, animationDelay: ".38s" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9, background: C.orangeSoft, border: "1px solid var(--pub-orange-border)", borderRadius: 50, padding: "9px 18px" }}>
                  <Flame size={16} color={C.orange} strokeWidth={2.2} />
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: C.orangeText }}>
                    {locuriRamase === null ? "Trial gratuit pentru partenerii fondatori" : `Doar ${locuriRamase} din ${LOCURI_PROMO} locuri de partener fondator rămase`}
                  </span>
                </span>
              </div>
            )}

            {/* toggle verticala — aceleasi planuri, caracteristici pe tipul salonului */}
            <div className="ch-hero-anim" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 24, animationDelay: ".4s" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.muted }}>Vezi caracteristicile pentru:</div>
              <div style={{ display: "inline-flex", gap: 4, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 50, padding: 4, boxShadow: "0 2px 16px rgba(120,90,60,.08)" }}>
                {(["infrumusetare", "grooming"] as Vert[]).map((v) => {
                  const activ = vert === v;
                  return (
                    <button key={v} type="button" onClick={() => setVert(v)}
                      style={{ border: "none", borderRadius: 50, padding: "9px 18px", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, cursor: "pointer", background: activ ? C.orange : "transparent", color: activ ? "#fff" : C.muted, whiteSpace: "nowrap" }}>
                      {VERT[v].eticheta}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* toggle ciclu */}
            <div className="ch-hero-anim" style={{ display: "inline-flex", gap: 4, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 50, padding: 4, marginTop: 18, boxShadow: "0 2px 16px rgba(120,90,60,.08)", animationDelay: ".46s" }}>
              {(["lunar", "anual"] as Ciclu[]).map((c) => {
                const activ = ciclu === c;
                return (
                  <button key={c} type="button" onClick={() => setCiclu(c)}
                    style={{ border: "none", borderRadius: 50, padding: "9px 20px", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, cursor: "pointer", background: activ ? C.orange : "transparent", color: activ ? "#fff" : C.muted, display: "inline-flex", alignItems: "center", gap: 7 }}>
                    {c === "lunar" ? "Lunar" : "Anual"}
                    {c === "anual" && <span style={{ fontSize: 10.5, fontWeight: 900, background: activ ? "rgba(255,255,255,.25)" : "rgba(255,107,0,.12)", color: activ ? "#fff" : C.orangeText, padding: "2px 7px", borderRadius: 50 }}>-17%</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* PLANURI */}
        <section style={{ padding: "24px 20px 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, alignItems: "start" }}>
              {PLANURI.map((p) => {
                const pret = ciclu === "anual" ? p.pretAnual : p.pretLunar;
                return (
                  <div key={p.id} data-reveal className="plan-card" style={{
                    position: "relative", background: C.surface, borderRadius: 28, padding: 28,
                    border: p.recomandat ? `2px solid ${C.orange}` : `1px solid ${C.line}`,
                    boxShadow: p.recomandat ? "0 20px 50px rgba(255,107,0,.18)" : "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
                  }}>
                    {p.badge && (
                      <span style={{ position: "absolute", top: -12, left: 24, background: p.recomandat ? C.orange : "var(--pub-badge)", color: "var(--pub-badge-text)", fontSize: 10.5, fontWeight: 900, letterSpacing: 0.5, textTransform: "uppercase", padding: "4px 12px", borderRadius: 50 }}>{p.badge}</span>
                    )}
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      {(() => { const I = ICON_PLAN[p.id]; return <I size={23} color={C.orange} strokeWidth={2} />; })()}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{p.nume}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.orangeText, marginTop: 2 }}>{p.tagline}</div>
                    <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginTop: 8, lineHeight: 1.5, minHeight: 40 }}>{p.descriere}</div>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 16 }}>
                      <span style={{ fontSize: 40, fontWeight: 900, color: C.text, letterSpacing: -1.5 }}>{pret}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.muted }}>lei / lună</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: C.dim, fontWeight: 700, marginTop: 2 }}>
                      {ciclu === "anual" ? `facturat anual · ${p.pretLunar} lei dacă plătești lunar` : "facturat lunar"}
                    </div>

                    <div style={{ height: 1, background: C.line, margin: "18px 0" }} />

                    {p.prefix && <div style={{ fontSize: 12, fontWeight: 800, color: C.orangeText, marginBottom: 10 }}>{p.prefix}</div>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {p.features.map((f) => (
                        <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <Check size={16} color={C.orange} strokeWidth={2.6} style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, lineHeight: 1.5 }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/register?tip=salon" style={{ ...(p.recomandat ? btnPrimary : btnSecondary), width: "100%", marginTop: 22 }}>
                      Începe trialul gratuit →
                    </Link>
                  </div>
                );
              })}
            </div>

            <div data-reveal style={{ textAlign: "center", fontSize: 13, color: C.dim, fontWeight: 700, marginTop: 22 }}>
              Fără card la înscriere · 0% comision · anulezi oricând
            </div>
          </div>
        </section>

        {/* INCLUS IN TOATE */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 34px" }}>
              <div data-reveal style={eyebrow}><Gift size={13} strokeWidth={2.4} /> Inclus în toate planurile</div>
              <h2 data-reveal style={{ ...h2s, marginTop: 12 }}>Ce primești, indiferent de plan</h2>
              <p data-reveal style={{ ...lead, marginTop: 12 }}>Fundația e aceeași pentru toți partenerii. Planurile diferă doar prin mărimea echipei și instrumentele avansate.</p>
            </div>
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
              {INCLUS_TOATE.map((t) => (
                <div key={t} data-reveal style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <Check size={18} color={C.orange} strokeWidth={2.6} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14.5, color: C.text, fontWeight: 700, lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AGENTI AI — linie subtila */}
        <section style={{ padding: "8px 20px 44px" }}>
          <div data-reveal style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <SparkleAnim size={22} />
            <span style={{ fontSize: 14.5, color: C.muted, fontWeight: 700 }}>
              Agenții AI sunt <b style={{ color: C.text, fontWeight: 800 }}>incluși în plan</b>, fără costuri separate.
            </span>
            <Link href="/instrumente-ai" style={{ fontSize: 14.5, fontWeight: 800, color: C.orangeText, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
              Vezi instrumentele AI →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 34px" }}>
              <div data-reveal style={eyebrow}><HelpCircle size={13} strokeWidth={2.4} /> Întrebări despre planuri</div>
              <h2 data-reveal style={{ ...h2s, marginTop: 12 }}>Ce vor să știe saloanele</h2>
            </div>
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {FAQ.map(({ q, a }) => (
                <div key={q} data-reveal className="ch-tile" style={tile}>
                  <div style={{ fontSize: 15.5, fontWeight: 900, color: C.text }}>{q}</div>
                  <div style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, marginTop: 7, lineHeight: 1.6 }}>{a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "64px 20px 76px" }}>
          <div data-reveal style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg, var(--pub-orange-soft) 0%, var(--pub-tint) 100%)", border: "1px solid var(--pub-orange-border)", borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
              <h2 style={{ ...h2s, fontSize: "clamp(24px,3.2vw,36px)" }}>Începe cu trial gratuit</h2>
              <p style={{ ...lead, marginTop: 12, maxWidth: "52ch", marginLeft: "auto", marginRight: "auto" }}>
                Îți configurezi salonul în câteva minute și primești programări online din prima zi. Fără card, fără comision.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                <Link href="/register?tip=salon" style={btnPrimary}>Începe trialul gratuit →</Link>
                <Link href="/cum-functioneaza#parteneri" style={btnSecondary}>Vezi cum funcționează</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
      <ScrollReveal />
    </div>
  );
}
