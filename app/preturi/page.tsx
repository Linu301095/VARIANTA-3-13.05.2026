"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";

type Ciclu = "lunar" | "anual";

const LOCURI_PROMO = 10;

const PLANURI = [
  {
    id: "basic",
    nume: "Basic",
    tagline: "Salonul solo",
    descriere: "Pentru groomer singur sau cu un asistent",
    pretLunar: 69,
    pretAnual: 57,
    badge: null as string | null,
    features: [
      "Până la 2 useri (groomer + asistent)",
      "Galerie 5 poze",
      "Statistici esențiale — Azi / Lună, rating, recenzii",
      "Raport Excel (perioada curentă)",
      "Remindere WhatsApp nelimitate + 30 SMS / lună",
      "Suport pe email",
    ],
  },
  {
    id: "pro",
    nume: "Pro",
    tagline: "Salon cu echipă",
    descriere: "Pentru saloane în creștere, 3-6 persoane",
    pretLunar: 119,
    pretAnual: 99,
    badge: "Cel mai popular",
    recomandat: true,
    prefix: "Tot ce e în Basic, plus:",
    features: [
      "3-6 useri, fiecare cu orar individual",
      "Clientul alege specialistul + blocaj per groomer",
      "Galerie 10 poze",
      "Statistici complete — filtre Azi / Ieri / Săptămână / Lună / An / Interval",
      "Evoluție lunară, productivitate per groomer, distribuție talie",
      "Raport Excel complet (secțiuni selectabile)",
      "Remindere WhatsApp nelimitate + 100 SMS / lună",
      "Badge „Profil verificat”",
    ],
  },
  {
    id: "business",
    nume: "Business",
    tagline: "Salon mare / lanț",
    descriere: "Pentru saloane mari sau cu mai mulți groomeri",
    pretLunar: 219,
    pretAnual: 182,
    badge: "All-in",
    prefix: "Tot ce e în Pro, plus:",
    features: [
      "Useri nelimitați + login individual per groomer (în curând)",
      "Listare promovată în oraș — badge „Recomandat”",
      "Remindere WhatsApp + SMS nelimitate",
      "Suport prioritar 24/7 + manager dedicat",
      "Multi-locație (în curând)",
    ],
  },
];

const INCLUS_TOATE = [
  "O singură subscripție pe tot salonul — nu plătești per angajat",
  "Programări, clienți și animale nelimitate",
  "Pagină publică de rezervări 24/7 + listare în orașul tău",
  "Calendar + disponibilitate live (slot 30 min, anti-dublă-rezervare)",
  "Blocaje manuale (telefonic / walk-in / pauze)",
  "Prețuri & durate per talie — unic în România",
  "Remindere WhatsApp automate (confirmare + reminder)",
  "Recenzii + rating · dosar per client · protecție anti-no-show",
  "Aplicație mobilă · migrare gratuită · backup zilnic",
];

const COMPARATIE: { rand: string; basic: string; pro: string; business: string }[] = [
  { rand: "Useri", basic: "2", pro: "3-6", business: "∞" },
  { rand: "Programări nelimitate", basic: "da", pro: "da", business: "da" },
  { rand: "Prețuri per talie", basic: "da", pro: "da", business: "da" },
  { rand: "Remindere WhatsApp", basic: "da", pro: "da", business: "da" },
  { rand: "SMS bonus / lună", basic: "30", pro: "100", business: "∞" },
  { rand: "Galerie poze", basic: "5", pro: "10", business: "10" },
  { rand: "Booking pe specialist", basic: "nu", pro: "da", business: "da" },
  { rand: "Orar individual per groomer", basic: "nu", pro: "da", business: "da" },
  { rand: "Statistici cu filtre perioadă", basic: "nu", pro: "da", business: "da" },
  { rand: "Productivitate per groomer", basic: "nu", pro: "da", business: "da" },
  { rand: "Raport Excel", basic: "Bază", pro: "Complet", business: "Complet" },
  { rand: "Login separat per groomer", basic: "nu", pro: "nu", business: "în curând" },
  { rand: "Promovare în oraș", basic: "nu", pro: "nu", business: "da" },
  { rand: "Multi-locație", basic: "nu", pro: "nu", business: "în curând" },
  { rand: "Suport", basic: "Email", pro: "Email", business: "24/7 dedicat" },
];

function CelulaComparatie({ v }: { v: string }) {
  if (v === "da") return <span style={{ color: "#16A34A", fontWeight: 900, fontSize: 16 }}>✓</span>;
  if (v === "nu") return <span style={{ color: "#D1D5DB", fontWeight: 900, fontSize: 16 }}>—</span>;
  const inCurand = v === "în curând";
  return <span style={{ fontSize: 12.5, fontWeight: 800, color: inCurand ? "#9CA3AF" : "#1A1A1A", fontStyle: inCurand ? "italic" : "normal" }}>{v}</span>;
}

export default function Preturi() {
  const [ciclu, setCiclu] = useState<Ciclu>("anual");
  const [locuriRamase, setLocuriRamase] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { count } = await supabase.from("saloane").select("id", { count: "exact", head: true });
      if (count !== null && count !== undefined) {
        setLocuriRamase(Math.max(0, LOCURI_PROMO - count));
      }
    })();
  }, []);

  const promoActiva = locuriRamase === null || locuriRamase > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav style={{ display: "flex", gap: 8 }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* HERO */}
        <section style={{ background: "#fff", padding: "64px 20px 32px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Prețuri simple, fără surprize</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15, marginBottom: 18 }}>
              Totul pentru salon,<br /><span style={{ color: "#FF6B00" }}>dintr-un singur abonament. ✂️</span>
            </h1>
            <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
              O singură subscripție pe tot salonul — nu plătești per angajat. Programări nelimitate, remindere WhatsApp și statistici reale, incluse.
            </p>
          </div>
        </section>

        {/* BANNER PRIMII 10 */}
        {promoActiva && (
          <section style={{ padding: "0 20px 8px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", background: "linear-gradient(135deg, #FF6B00 0%, #FF8C42 100%)", borderRadius: 20, padding: "20px 26px", color: "#fff", textAlign: "center", boxShadow: "0 8px 28px rgba(255,107,0,.25)" }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>🎁 Primele 3 luni GRATUITE</div>
              <div style={{ fontSize: 14, opacity: .95 }}>
                Doar pentru primele {LOCURI_PROMO} saloane înscrise pe CalyHub.
                {locuriRamase !== null && (
                  <strong> 🔥 Au mai rămas {locuriRamase} {locuriRamase === 1 ? "loc" : "locuri"} din {LOCURI_PROMO}.</strong>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TOGGLE */}
        <section style={{ padding: "28px 20px 8px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "#F3F4F6", borderRadius: 50, padding: 4, gap: 2 }}>
            {([["lunar", "Lunar"], ["anual", "Anual"]] as [Ciclu, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setCiclu(val)}
                style={{ padding: "10px 26px", borderRadius: 50, border: "none", background: ciclu === val ? "#FF6B00" : "transparent", color: ciclu === val ? "#fff" : "#6B7280", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#16A34A", marginTop: 10 }}>La plata anuală: 2 luni gratis (−17%)</div>
        </section>

        {/* INCLUS ÎN TOATE */}
        <section style={{ padding: "20px 20px 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", background: "#FFFBF7", border: "2px solid #FFDCC6", borderRadius: 22, padding: "26px 30px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Inclus în toate planurile</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px 24px" }}>
              {INCLUS_TOATE.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: "#4B5563", lineHeight: 1.5 }}>
                  <span style={{ color: "#FF6B00", fontWeight: 900, flexShrink: 0 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARDURI PLANURI */}
        <section style={{ padding: "32px 20px 16px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20, alignItems: "stretch" }}>
            {PLANURI.map(p => {
              const pret = ciclu === "lunar" ? p.pretLunar : p.pretAnual;
              return (
                <div key={p.id} className="plan-card" style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: "30px 28px",
                  border: p.recomandat ? "2.5px solid #FF6B00" : "2px solid #FFDCC6",
                  position: "relative",
                  boxShadow: p.recomandat ? "0 12px 36px rgba(255,107,0,.18)" : "0 2px 14px rgba(0,0,0,.05)",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  {p.badge && (
                    <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: p.recomandat ? "#16A34A" : "#FF6B00", color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", padding: "5px 16px", borderRadius: 50, whiteSpace: "nowrap" }}>{p.badge}</div>
                  )}
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#1A1A1A" }}>{p.nume}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#FF8C42", marginBottom: 6 }}>{p.tagline}</div>
                  <div style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.5, marginBottom: 18, minHeight: 38 }}>{p.descriere}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, color: "#1A1A1A", lineHeight: 1 }}>{pret}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#6B7280" }}>lei/lună</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#9CA3AF", marginBottom: 20, minHeight: 18 }}>
                    {ciclu === "anual" ? `Facturat anual (${pret * 12} lei/an)` : `Sau ${p.pretAnual} lei/lună la plata anuală`}
                  </div>
                  {p.prefix && <div style={{ fontSize: 12.5, fontWeight: 800, color: "#6B7280", marginBottom: 12 }}>{p.prefix}</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 11, flex: 1, marginBottom: 24 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: "#374151", lineHeight: 1.5 }}>
                        <span style={{ color: "#FF6B00", fontWeight: 900, flexShrink: 0 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/register" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 50, background: p.recomandat ? "#FF6B00" : "#fff", color: p.recomandat ? "#fff" : "#FF6B00", fontSize: 14.5, fontWeight: 800, textDecoration: "none", border: p.recomandat ? "none" : "2px solid #FF6B00", marginTop: "auto", boxShadow: p.recomandat ? "0 6px 20px rgba(255,107,0,.35)" : "none" }}>
                    {promoActiva ? "Începe gratuit 3 luni" : "Alege " + p.nume}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* TABEL COMPARATIV */}
        <section style={{ padding: "40px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 28 }}>Compară planurile</h2>
            <div style={{ overflowX: "auto", borderRadius: 18, border: "1.5px solid #EFEFEF" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                <thead>
                  <tr style={{ background: "#FFF3EA" }}>
                    <th style={{ textAlign: "left", padding: "14px 18px", fontSize: 13, fontWeight: 900, color: "#1A1A1A" }}>Funcție</th>
                    <th style={{ padding: "14px 12px", fontSize: 13, fontWeight: 900, color: "#1A1A1A" }}>Basic</th>
                    <th style={{ padding: "14px 12px", fontSize: 13, fontWeight: 900, color: "#FF6B00" }}>Pro</th>
                    <th style={{ padding: "14px 12px", fontSize: 13, fontWeight: 900, color: "#1A1A1A" }}>Business</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIE.map((r, i) => (
                    <tr key={r.rand} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderTop: "1px solid #F0F0F0" }}>
                      <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 700, color: "#374151" }}>{r.rand}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}><CelulaComparatie v={r.basic} /></td>
                      <td style={{ padding: "12px", textAlign: "center", background: "rgba(255,107,0,.04)" }}><CelulaComparatie v={r.pro} /></td>
                      <td style={{ padding: "12px", textAlign: "center" }}><CelulaComparatie v={r.business} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: "20px 20px 64px", textAlign: "center" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", background: "linear-gradient(135deg, #FF6B00 0%, #FF8C42 100%)", borderRadius: 26, padding: "52px 30px", boxShadow: "0 16px 44px rgba(255,107,0,.28)" }}>
            <h2 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>Gata să-ți crești salonul?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.92)", marginBottom: 32, lineHeight: 1.7 }}>
              {promoActiva ? "Prinde-te în primele 10 saloane cu 3 luni gratuite." : "Începe azi. Fără card, anulezi oricând."}
            </p>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", padding: "15px 34px", borderRadius: 50, background: "#fff", color: "#FF6B00", fontSize: 16, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 28px rgba(0,0,0,.18)" }}>
              ✂️ Înregistrează salonul gratuit →
            </Link>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 14 }}>Fără card · Fără comision · Anulezi oricând</div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
