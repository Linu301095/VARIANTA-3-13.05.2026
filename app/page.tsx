import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import ResetTheme from "../components/ResetTheme";

export const metadata: Metadata = {
  title: "CalyHub — Programări grooming online pentru câini și pisici",
  description:
    "Găsește cel mai potrivit salon de grooming din orașul tău și programează-ți animalul online în 10 secunde. Platformă gratuită pentru stăpâni, primele 3 luni gratuite pentru saloane.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "CalyHub — Programări grooming online pentru câini și pisici",
    description:
      "Găsește salonul perfect și programează-ți animalul online în 10 secunde. Gratuit, rapid, fără telefon.",
    url: "/",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <ResetTheme />

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/">
            <Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority />
          </Link>
          <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* HERO */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 50, padding: "7px 18px", marginBottom: 20, fontSize: 13, fontWeight: 700, color: "#FF6B00" }}>
              🐾 500+ saloane · Programare în 10 secunde
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.1, marginBottom: 14 }}>
              Grooming de top pentru<br />
              <span style={{ color: "#FF6B00" }}>animăluțul tău iubit.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", color: "#6B7280", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Fie că ești iubitor de animale sau deții un salon — CalyHub e construit pentru tine.
            </p>
          </div>

          {/* CARDURI */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>

            {/* Card Stăpân */}
            <div style={{ background: "#fff", borderRadius: 28, padding: "clamp(26px,3.5vw,42px)", border: "2px solid #FF6B00", boxShadow: "0 4px 32px rgba(255,107,0,.1)", display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "#FFF3EA", border: "1.5px solid #FFDCC6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🐾</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: 2, textTransform: "uppercase" }}>Ai un animal de companie</div>
              </div>
              <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.2, marginBottom: 10 }}>Programează-ți<br />animăluțul</h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>Găsești salonul potrivit în câteva secunde, alegi ora și primești reminder automat înainte de vizită.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                {[["500+", "Saloane disponibile în platformă"], ["10s", "Timp mediu de programare"], ["4.9★", "Rating mediu saloane partenere"]].map(([val, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FAFAFA", borderRadius: 12, padding: "11px 14px" }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: "#FF6B00", minWidth: 52 }}>{val}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 14, padding: "12px 16px", marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00" }}>🐾 Profil animăluț salvat automat</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>Rasă, vârstă, alergii — salonul îl cunoaște deja</div>
              </div>
              <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "15px 24px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)", marginTop: "auto" }}>
                Caută salon acum →
              </Link>
            </div>

            {/* Card Salon */}
            <div style={{ background: "#fff", borderRadius: 28, padding: "clamp(26px,3.5vw,42px)", border: "2px solid #FF6B00", boxShadow: "0 4px 32px rgba(255,107,0,.1)", display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "#FFF3EA", border: "1.5px solid #FFDCC6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>✂️</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: 2, textTransform: "uppercase" }}>Ai un salon de grooming</div>
              </div>
              <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.2, marginBottom: 10 }}>Umple-ți<br />calendarul</h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>Primești programări online non-stop, reduci neprezentările și urmărești statisticile salonului în timp real.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                {[["-70%", "Reducere neprezentări clienți"], ["3h", "Economisite zilnic față de telefon"], ["+40%", "Creștere clienți noi lunar"]].map(([val, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FAFAFA", borderRadius: 12, padding: "11px 14px" }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: "#FF6B00", minWidth: 52 }}>{val}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 14, padding: "12px 16px", marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00" }}>🎁 Primele 3 luni complet gratuite</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>Fără card · 0% comision · Anulezi oricând</div>
              </div>
              <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "15px 24px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)", marginTop: "auto" }}>
                Înregistrează salonul gratuit →
              </Link>
            </div>
          </div>

          {/* STATS BAR — fix responsive 2x2 pe mobil */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 56, paddingTop: 36, borderTop: "1px solid #FF6B00" }}>
            {[["500+", "Saloane"], ["24/7", "Disponibil"], ["-70%", "Neprezentări"], ["10s", "Programare"]].map(([val, label], i) => (
              <div key={label} style={{
                textAlign: "center",
                padding: "16px 8px",
                borderRight: i % 2 === 0 ? "1px solid #FF6B00" : "none",
                borderBottom: i < 2 ? "1px solid #FF6B00" : "none"
              }}>
                <div style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginTop: 4, textTransform: "uppercase", letterSpacing: .8 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CUM FUNCȚIONEAZĂ — 4 PAȘI EXTINȘI + STATS REALE + MINI-MOCKUP */}
        <section style={{ background: "#fff", padding: "72px 20px", borderTop: "1px solid #EBEBEB" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: "6px 16px", borderRadius: 50, marginBottom: 16 }}>Cum funcționează</div>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15, marginBottom: 14 }}>Simplu pentru stăpâni.<br /><span style={{ color: "#FF6B00" }}>Profitabil pentru saloane.</span></h2>
              <p style={{ fontSize: 15, color: "#6B7280", maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
                CalyHub e construit special pentru grooming animale — cu features pe care nicio altă platformă din România nu le are: <strong>profil animal cu talie</strong>, <strong>prețuri per talie</strong>, <strong>istoric salvat automat</strong>.
              </p>
            </div>

            {/* Pentru stăpâni — 4 pași */}
            <div style={{ marginBottom: 64 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🐾</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2 }}>Ai un animal de companie</div>
                  <h3 style={{ fontSize: "clamp(18px,2.2vw,24px)", fontWeight: 900, color: "#1A1A1A" }}>Patru pași simpli, multe avantaje</h3>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                {[
                  { nr: "01", icon: "📝", titlu: "Cont gratuit + profil animal", desc: "Adaugi rasă, talie (Mică/Medie/Mare), vârstă, kg, alergii și poză. Salonul te cunoaște înainte să intri pe ușă." },
                  { nr: "02", icon: "🔍", titlu: "Alegi salonul potrivit", desc: "Filtrezi după oraș și serviciu. Vezi prețuri exacte per talia animalului tău, galerie foto, orar real." },
                  { nr: "03", icon: "📅", titlu: "Rezervi în 10 secunde", desc: "Sloturi 30min vizibile live — verde liber, portocaliu rezervat. Alegi, confirmi, primești notificare instant." },
                  { nr: "04", icon: "🐾", titlu: "Istoric salvat automat", desc: "Toate vizitele se salvează: serviciu, preț, salon, dată. Animăluțul tău are dosar propriu, ca la doctor." },
                ].map(s => (
                  <div key={s.nr} className="step-card" style={{ background: "#fff", borderRadius: 20, padding: "26px 24px", border: "2px solid #FF6B00", position: "relative", overflow: "hidden", boxShadow: "0 2px 12px rgba(255,107,0,.08)" }}>
                    <div className="step-num" style={{ position: "absolute", top: 14, right: 18, fontSize: 36, fontWeight: 900, color: "#FFF3EA", lineHeight: 1 }}>{s.nr}</div>
                    <div className="step-icon" style={{ fontSize: 30, marginBottom: 12 }}>{s.icon}</div>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{s.titlu}</h4>
                    <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* MINI-MOCKUP: Profil animal */}
              <div className="mockup-card" style={{ marginTop: 28, background: "linear-gradient(135deg, #FFF3EA 0%, #FAFAFA 100%)", borderRadius: 20, padding: "28px 28px", border: "1.5px solid #FFDCC6", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Exemplu profil animal</div>
                  <h4 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>Salonul vede totul dintr-o privire</h4>
                  <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>Fără să mai întrebe rasa, talia, alergiile. Tot ce trebuie să știe e deja acolo — așa pregătesc vizita perfectă.</p>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, padding: "18px 18px", border: "1.5px solid #FFDCC6", boxShadow: "0 4px 14px rgba(255,107,0,.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🐕</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#1A1A1A" }}>Rex</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>Golden Retriever · 3 ani</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={{ background: "#FFF3EA", color: "#FF6B00", padding: "4px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>🐺 Mare</span>
                    <span style={{ background: "#F3F4F6", color: "#374151", padding: "4px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>28 kg</span>
                    <span style={{ background: "#FEF2F2", color: "#DC2626", padding: "4px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>⚠️ Alergie ovăz</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", borderTop: "1px solid #F3F4F6", paddingTop: 8 }}>Ultima vizită: 12 mai · Tuns + Spălat · 150 RON</div>
                </div>
              </div>
            </div>

            {/* Pentru saloane — 4 pași */}
            <div style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✂️</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2 }}>Ai un salon de grooming</div>
                  <h3 style={{ fontSize: "clamp(18px,2.2vw,24px)", fontWeight: 900, color: "#1A1A1A" }}>Patru pași până la calendar plin</h3>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                {[
                  { nr: "01", icon: "🏪", titlu: "Înregistrezi salonul", desc: "Date, copertă, galerie până la 10 foto, echipă. Profilul apare instant în lista clienților." },
                  { nr: "02", icon: "⚙️", titlu: "Configurezi calendarul", desc: "Orar săptămânal pe zile + blocaje manuale (telefonic, walk-in, pauză). Sloturi 30min anti-dublă-rezervare." },
                  { nr: "03", icon: "💰", titlu: "Prețuri per talie — unic în RO", desc: "Preț și durată diferite pentru Mică/Medie/Mare. Reflectă exact cum lucrezi: un câine mare cere mai mult timp." },
                  { nr: "04", icon: "📊", titlu: "Statistici live + istoric client", desc: "Încasări azi, top servicii, distribuție talii, istoric per client — toate calculate automat din programări." },
                ].map(s => (
                  <div key={s.nr} className="step-card" style={{ background: "#FAFAFA", borderRadius: 20, padding: "26px 24px", border: "2px solid #FF6B00", position: "relative", overflow: "hidden" }}>
                    <div className="step-num" style={{ position: "absolute", top: 14, right: 18, fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.nr}</div>
                    <div className="step-icon" style={{ fontSize: 30, marginBottom: 12 }}>{s.icon}</div>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{s.titlu}</h4>
                    <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* MINI-MOCKUP: Prețuri per talie */}
              <div className="mockup-card" style={{ marginTop: 28, background: "#fff", borderRadius: 20, padding: "28px 28px", border: "1.5px solid #FFDCC6", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Exemplu serviciu</div>
                  <h4 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>Tuns complet — 3 prețuri reale</h4>
                  <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>Nu mai pierzi clienți pentru că prețul afișat părea prea mic. Fiecare talie are preț și durată corectă — clientul vede exact ce plătește.</p>
                </div>
                <div style={{ background: "#FAFAFA", borderRadius: 16, padding: "18px 18px", border: "1.5px solid #EBEBEB" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#1A1A1A", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>✂️</span><span>Tuns complet câine</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                      { icon: "🐕‍🦺", label: "Mică", pret: "80 RON", durata: "45 min" },
                      { icon: "🐕", label: "Medie", pret: "120 RON", durata: "60 min" },
                      { icon: "🐺", label: "Mare", pret: "180 RON", durata: "90 min" },
                    ].map(t => (
                      <div key={t.label} style={{ background: "#fff", borderRadius: 12, padding: "10px 8px", textAlign: "center", border: "1.5px solid #FFDCC6" }}>
                        <div style={{ fontSize: 20 }}>{t.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", marginTop: 2 }}>{t.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#FF6B00", marginTop: 4 }}>{t.pret}</div>
                        <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{t.durata}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* STATS REALE — fapte verificabile */}
            <div style={{ background: "#FAFAFA", borderRadius: 24, padding: "36px 28px", border: "1.5px solid #EBEBEB" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A" }}>Fapte despre CalyHub — nu promisiuni</h3>
                <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>Tot ce e listat aici e deja implementat și funcționează acum în platformă.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {[
                  { icon: "🐾", titlu: "Profil animal cu 6 câmpuri", desc: "Talie, rasă, vârstă, kg, alergii, poză — salvate o singură dată." },
                  { icon: "💰", titlu: "Prețuri per talie", desc: "Unic în România. Preț + durată diferite pentru Mică/Medie/Mare." },
                  { icon: "📅", titlu: "Sloturi 30min · live", desc: "Vizibilitate ocupare în timp real, anti-dublă-rezervare." },
                  { icon: "🔔", titlu: "Notificări real-time", desc: "Confirmări instant între client și salon, sub 1 secundă." },
                  { icon: "📊", titlu: "Statistici live salon", desc: "Încasări, populare servicii, distribuție talii — automate." },
                  { icon: "🎁", titlu: "14 zile trial fără card", desc: "Salonul testează tot, fără să ofere date bancare." },
                ].map(f => (
                  <div key={f.titlu} className="benefit-card" style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid #EBEBEB", display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "#1A1A1A", marginBottom: 3 }}>{f.titlu}</div>
                      <div style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.55 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Link href="/cum-functioneaza" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#FF6B00", textDecoration: "none" }}>
                Vezi detaliile complete →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION STĂPÂNI */}
        <section style={{ background: "#fff", padding: "72px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: "6px 16px", borderRadius: 50, marginBottom: 16 }}>Pentru iubitorii de animale</div>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15 }}>Animăluțul tău merită<br /><span style={{ color: "#FF6B00" }}>îngrijirea perfectă.</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                ["📅", "Programări 24/7", "Fără telefon. Calendar actualizat în timp real."],
                ["📱", "Reminder SMS automat", "SMS cu o zi înainte. Neprezentările scad cu 70%."],
                ["🐾", "Profil animăluț unic", "Rasă, vârstă, alergii salvate. Salonul îl cunoaște deja."],
                ["⭐", "Status Special", "Istoric complet vizite. Animăluțul tău are dosar propriu."],
              ].map(([icon, title, desc]) => (
                <div key={title as string} className="step-card" style={{ background: "#fff", borderRadius: 20, padding: 28, border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.08)" }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                🐾 Găsește salon acum →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION SALOANE */}
        <section style={{ background: "#FAFAFA", padding: "72px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", border: "1px solid #FFDCC6", color: "#FF6B00", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: "6px 16px", borderRadius: 50, marginBottom: 16 }}>Pentru saloane de grooming</div>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15 }}>Transformă-ți salonul<br /><span style={{ color: "#FF6B00" }}>într-o afacere profitabilă.</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                ["-70%", "Neprezentări", "Reminder SMS automat cu 24h înainte."],
                ["3h", "Economisite/zi", "Zero timp pierdut cu telefoanele."],
                ["+40%", "Clienți noi", "Vizibilitate garantată pe CalyHub."],
                ["24/7", "Calendar activ", "Programări automate inclusiv noaptea."],
              ].map(([stat, title, desc]) => (
                <div key={title as string} className="step-card" style={{ background: "#fff", borderRadius: 20, padding: 28, border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.08)" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#FF6B00", marginBottom: 8 }}>{stat}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                ✂️ Înregistrează salonul gratuit →
              </Link>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 12 }}>Fără card · Fără comision · Primele 3 luni gratuite</div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: "#1A1A1A", padding: "72px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Ești gata să începi?</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", marginBottom: 36 }}>Stăpâni — programare în 10 secunde.<br />Saloane — primele 3 luni gratuite.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.4)" }}>🐾 Programează acum</Link>
            <Link href="/register" style={{ padding: "14px 28px", borderRadius: 50, background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.2)", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>✂️ Înregistrează salonul</Link>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
