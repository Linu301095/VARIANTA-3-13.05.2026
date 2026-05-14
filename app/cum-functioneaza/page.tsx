import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Cum funcționează CalyHub — Programări grooming în 3 pași",
  description:
    "Află cum să rezervi o programare la salonul de grooming în 10 secunde. 3 pași simpli pentru stăpâni și 3 pași pentru saloane. Fără telefon, fără bătăi de cap.",
  alternates: { canonical: "/cum-functioneaza" },
  openGraph: {
    title: "Cum funcționează CalyHub — Programări grooming în 3 pași",
    description: "Programări grooming online în 10 secunde. Vezi cum funcționează platforma.",
    url: "/cum-functioneaza",
  },
};

const STEPS_CLIENT = [
  { nr: "01", icon: "📝", titlu: "Creează cont gratuit", desc: "Înregistrează-te în 2 minute cu emailul sau contul Google. Adaugi profilul animăluțului: rasă, vârstă, alergii — salonul îl cunoaște deja." },
  { nr: "02", icon: "🔍", titlu: "Alege salonul potrivit", desc: "Filtrează după locație, servicii și rating. Citești recenzii reale de la alți stăpâni și vezi prețurile înainte să rezervi." },
  { nr: "03", icon: "📅", titlu: "Rezervă în 10 secunde", desc: "Alegi ziua, ora și serviciul. Confirmi — gata. Primești reminder SMS automat cu 24h înainte de vizită." },
];

const STEPS_SALON = [
  { nr: "01", icon: "🏪", titlu: "Înregistrează salonul", desc: "Completezi datele firmei, serviciile oferite și echipa în câteva minute. Profilul salonului apare instant pe CalyHub." },
  { nr: "02", icon: "⚙️", titlu: "Configurează calendarul", desc: "Setezi programul de lucru, durata serviciilor și capacitatea zilnică. Totul se gestionează din panoul de control." },
  { nr: "03", icon: "💰", titlu: "Primești programări automat", desc: "Clienții rezervă direct online, 24/7. Tu accepți, confirmi și primești plata — fără telefoane, fără pierderi de timp." },
];

const BENEFICII_CLIENT = [
  { icon: "⏰", titlu: "Programări 24/7", desc: "Fără să suni, fără să aștepți. Rezervi oricând, de pe orice dispozitiv." },
  { icon: "📱", titlu: "Reminder automat", desc: "SMS cu 24h înainte. Nu mai uiți nicio programare." },
  { icon: "🐾", titlu: "Profil animăluț salvat", desc: "Salonul știe deja rasa, vârsta și alergiile. Fiecare vizită e personalizată." },
  { icon: "⭐", titlu: "Recenzii verificate", desc: "Alegi în cunoștință de cauză. Rating-urile sunt lăsate doar de clienți reali." },
];

const BENEFICII_SALON = [
  { icon: "📉", titlu: "-70% neprezentări", desc: "Reminder SMS automat reduce drastic clienții care nu se prezintă." },
  { icon: "🕐", titlu: "3h economisite/zi", desc: "Zero timp pierdut cu programările prin telefon. Calendarul se umple singur." },
  { icon: "📊", titlu: "Statistici în timp real", desc: "Urmărești încasările, serviciile populare și clienții noi din panoul de control." },
  { icon: "🌙", titlu: "Programări și noaptea", desc: "Calendarul tău e activ non-stop. Primești rezervări inclusiv când dormi." },
];

export default function CumFunctioneaza() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav style={{ display: "flex", gap: 8 }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* HERO */}
        <section style={{ background: "#fff", padding: "72px 20px 60px", textAlign: "center" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Cum funcționează CalyHub</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15, marginBottom: 18 }}>
              Simplu pentru stăpâni.<br />
              <span style={{ color: "#FF6B00" }}>Profitabil pentru saloane.</span>
            </h1>
            <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
              CalyHub conectează stăpânii de animale cu cele mai bune saloane de grooming din România — în câteva click-uri.
            </p>
          </div>
        </section>

        {/* PENTRU STĂPÂNI */}
        <section style={{ padding: "72px 20px", background: "#FAFAFA" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🐾</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2 }}>Ai un animal de companie</div>
                <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#1A1A1A" }}>Cum rezervi în 3 pași</h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
              {STEPS_CLIENT.map(s => (
                <div key={s.nr} style={{ background: "#fff", borderRadius: 22, padding: "28px 26px", border: "2px solid #FF6B00", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 18, right: 22, fontSize: 42, fontWeight: 900, color: "#FFF3EA", lineHeight: 1 }}>{s.nr}</div>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1A1A1A", marginBottom: 10 }}>{s.titlu}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 36 }}>
              {BENEFICII_CLIENT.map(b => (
                <div key={b.titlu} style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", border: "1.5px solid #EBEBEB", display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A1A", marginBottom: 4 }}>{b.titlu}</div>
                    <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", padding: "14px 32px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                🐾 Creează cont gratuit →
              </Link>
            </div>
          </div>
        </section>

        {/* SEPARATOR */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #FF6B00, transparent)" }} />

        {/* PENTRU SALOANE */}
        <section style={{ padding: "72px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>✂️</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2 }}>Ai un salon de grooming</div>
                <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#1A1A1A" }}>Cum îți umpli calendarul</h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
              {STEPS_SALON.map(s => (
                <div key={s.nr} style={{ background: "#FAFAFA", borderRadius: 22, padding: "28px 26px", border: "2px solid #FF6B00", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 18, right: 22, fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.nr}</div>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1A1A1A", marginBottom: 10 }}>{s.titlu}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 36 }}>
              {BENEFICII_SALON.map(b => (
                <div key={b.titlu} style={{ background: "#FAFAFA", borderRadius: 18, padding: "22px 20px", border: "1.5px solid #EBEBEB", display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A1A", marginBottom: 4 }}>{b.titlu}</div>
                    <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", padding: "14px 32px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                ✂️ Înregistrează salonul gratuit →
              </Link>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 10 }}>Fără card · Fără comision · Primele 3 luni gratuite</div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: "#1A1A1A", padding: "64px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>Gata să începi?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.6)", marginBottom: 32, lineHeight: 1.7 }}>
            Alătură-te celor 500+ saloane și mii de stăpâni care folosesc CalyHub.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.4)" }}>Creează cont</Link>
            <Link href="/login" style={{ padding: "14px 28px", borderRadius: 50, border: "1.5px solid rgba(255,255,255,.25)", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Conectare</Link>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
