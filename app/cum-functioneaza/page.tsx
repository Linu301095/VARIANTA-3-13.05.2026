import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Cum funcționează CalyHub — Programări grooming în 4 pași",
  description:
    "Rezervă la salonul de grooming în 10 secunde. Profil animal cu talie, prețuri transparente per talie, istoric salvat automat. 4 pași simpli pentru stăpâni și saloane.",
  alternates: { canonical: "/cum-functioneaza" },
  openGraph: {
    title: "Cum funcționează CalyHub — Programări grooming în 4 pași",
    description: "Programări grooming online în 10 secunde. Profil animal, prețuri per talie, istoric automat. Vezi cum funcționează.",
    url: "/cum-functioneaza",
  },
};

const STEPS_CLIENT = [
  { nr: "01", icon: "📝", titlu: "Cont gratuit + profil animal complet", desc: "Te înregistrezi în 2 minute. Adaugi rasă, talie (Mică/Medie/Mare), vârstă, kg, alergii și poză. Salonul te cunoaște deja înainte să intri pe ușă." },
  { nr: "02", icon: "🔍", titlu: "Alegi salonul potrivit", desc: "Filtrezi după oraș, serviciu și preț. Vezi prețuri exacte per talia animalului tău, galerie foto reală a salonului și orar live." },
  { nr: "03", icon: "📅", titlu: "Rezervi în 10 secunde", desc: "Sloturi 30min vizibile live — verde liber, portocaliu rezervat, roșu blocat. Alegi, confirmi, primești notificare instant în aplicație." },
  { nr: "04", icon: "🐾", titlu: "Istoric salvat automat", desc: "Toate vizitele se salvează: serviciu, preț, salon, dată. Animăluțul tău are dosar propriu, ca la doctor. Plus poză și recenzii ulterioare." },
];

const STEPS_SALON = [
  { nr: "01", icon: "🏪", titlu: "Înregistrezi salonul", desc: "Datele firmei, copertă, galerie până la 10 foto, echipa, descriere. Profilul salonului apare instant în lista clienților din oraș." },
  { nr: "02", icon: "⚙️", titlu: "Configurezi calendarul", desc: "Orar săptămânal pe zile (deschis/închis), blocaje manuale pentru programări telefonice, walk-in sau pauze. Sloturi 30min anti-dublă-rezervare." },
  { nr: "03", icon: "💰", titlu: "Prețuri per talie — unic în România", desc: "Preț și durată diferite pentru Mică/Medie/Mare. Reflectă exact cum lucrezi: un câine mare cere mai mult timp și șampon. Clientul vede prețul corect pentru talia lui." },
  { nr: "04", icon: "📊", titlu: "Statistici live + istoric per client", desc: "Încasări azi/lună, top servicii, distribuție clienți pe talii, istoric vizite per client. Toate calculate automat din programări — fără Excel." },
];

const BENEFICII_CLIENT = [
  { icon: "🐾", titlu: "Profil animal cu talie", desc: "Singura platformă din RO care salvează talia (Mică/Medie/Mare). Prețul pe care îl vezi e exact cel pentru câinele tău, nu un estimat generic." },
  { icon: "📅", titlu: "Disponibilitate live, slot 30min", desc: "Verde = liber, portocaliu = rezervat, roșu = blocat. Fără să suni ca să întrebi dacă mai e loc." },
  { icon: "🔔", titlu: "Confirmare instant, nu pe WhatsApp", desc: "Salonul acceptă sau refuză în câteva minute. Primești notificare direct în aplicație, nu trebuie să aștepți răspuns pe mesaj." },
  { icon: "📜", titlu: "Dosar complet al animăluțului", desc: "Rasă, vârstă, alergii, poze, toate vizitele cu serviciu, preț și salon — accesibile oricând, de pe orice dispozitiv." },
  { icon: "💸", titlu: "Prețuri transparente înainte de rezervare", desc: "Nu mai afli prețul abia la salon. CalyHub îl afișează per talie și per serviciu înainte să confirmi — fără surprize." },
  { icon: "🎯", titlu: "Un cont pentru toți animăluții", desc: "Ai 2 câini și o pisică? Un singur cont, profile separate, istoric individual. Tot în același loc." },
];

const BENEFICII_SALON = [
  { icon: "💰", titlu: "3 prețuri per serviciu, zero negocieri", desc: "Tuns câine mare: 180 RON / 90 min. Câine mic: 80 RON / 45 min. Clientul vede exact prețul lui — nu mai există discuții la casă." },
  { icon: "🚫", titlu: "Zero dublă-rezervare, garantat", desc: "Blochezi manual sloturi pentru programări telefonice, walk-in sau pauze. Calendarul online se umple doar în ce mai e liber." },
  { icon: "📊", titlu: "Statistici live — fără Excel", desc: "Încasări azi și pe lună, top servicii, câți câini mari vs mici, ore de vârf — calculate automat din fiecare programare." },
  { icon: "👤", titlu: "Dosar per client, mereu la îndemână", desc: "Istoricul complet al fiecărui client: câte vizite, ce servicii, ce animale, ce alergii. Nu mai cauți prin caiet sau WhatsApp." },
  { icon: "📱", titlu: "Calendar mobil, oricând, oriunde", desc: "Accepți, refuzi, blochezi sloturi direct de pe telefon — inclusiv duminică noaptea când clientul face rezervarea." },
  { icon: "🎁", titlu: "14 zile trial complet gratuit", desc: "Testezi toate funcționalitățile, cu programări reale. Fără card, fără angajament. Anulezi cu un click dacă nu e pentru tine." },
];

export default function CumFunctioneaza() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
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
            <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
              CalyHub e construit special pentru grooming animale — cu features pe care nicio altă platformă din România nu le are: profil animal cu talie, prețuri per talie, istoric salvat automat.
            </p>
          </div>
        </section>

        {/* PENTRU STĂPÂNI */}
        <section style={{ padding: "72px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🐾</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2 }}>Ai un animal de companie</div>
                <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#1A1A1A" }}>Rezervi în 4 pași simpli</h2>
              </div>
            </div>

            {/* 4 Pași client */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 48 }}>
              {STEPS_CLIENT.map(s => (
                <div key={s.nr} className="step-card" style={{ background: "#FFF3EA", borderRadius: 22, padding: "28px 26px", border: "2px solid #FF6B00", position: "relative", overflow: "hidden", boxShadow: "0 2px 10px rgba(255,107,0,.07)" }}>
                  <div className="step-num" style={{ position: "absolute", top: 18, right: 22, fontSize: 42, fontWeight: 900, color: "#FFDCC6", lineHeight: 1 }}>{s.nr}</div>
                  <div className="step-icon" style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1A1A1A", marginBottom: 10 }}>{s.titlu}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* MOCKUP CLIENT REAL — profil animal + istoric vizite */}
            <div className="mockup-card" style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FFE0CC 100%)", borderRadius: 24, padding: "32px", border: "1.5px solid #FFDCC6", marginBottom: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Exemplu real — Contul Mariei</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", marginBottom: 10 }}>Salonul știe tot înainte să ajungi</h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.65, marginBottom: 16 }}>
                  Maria a adăugat profilul lui Rex o singură dată. De atunci, la fiecare programare, salonul primește automat rasa, talia, alergiile și istoricul vizitelor anterioare.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "#fff", border: "1.5px solid #FFDCC6", color: "#FF6B00", padding: "5px 12px", borderRadius: 50, fontSize: 12, fontWeight: 800 }}>✅ Fără formulare repetate</span>
                  <span style={{ background: "#fff", border: "1.5px solid #FFDCC6", color: "#FF6B00", padding: "5px 12px", borderRadius: 50, fontSize: 12, fontWeight: 800 }}>✅ Alergie vizibilă automat</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Card profil animal */}
                <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", border: "1.5px solid #FFDCC6", boxShadow: "0 4px 16px rgba(255,107,0,.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🐕</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#1A1A1A" }}>Rex</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>Golden Retriever · 3 ani · 28 kg</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: "#FFF3EA", color: "#FF6B00", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>🐺 Mare</span>
                    <span style={{ background: "#FEF2F2", color: "#DC2626", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>⚠️ Alergie ovăz</span>
                    <span style={{ background: "#F0FDF4", color: "#16A34A", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>✓ Vaccinat</span>
                  </div>
                </div>
                {/* Istoric vizite */}
                <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", border: "1.5px solid #EBEBEB" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#9CA3AF", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Ultimele vizite</div>
                  {[
                    { data: "12 Mai 2026", salon: "Salon PetStyle Cluj", serviciu: "Tuns + Spălat", pret: "180 RON" },
                    { data: "14 Mar 2026", salon: "Salon PetStyle Cluj", serviciu: "Spălat + Uscat", pret: "120 RON" },
                    { data: "08 Ian 2026", salon: "Pawsome Grooming", serviciu: "Tuns complet", pret: "175 RON" },
                  ].map((v, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{v.serviciu}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{v.data} · {v.salon}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#FF6B00" }}>{v.pret}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Beneficii client — 6 carduri */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 36 }}>
              {BENEFICII_CLIENT.map(b => (
                <div key={b.titlu} className="benefit-card" style={{ background: "#FFF3EA", borderRadius: 18, padding: "22px 20px", border: "1.5px solid #FFDCC6", display: "flex", gap: 14 }}>
                  <span className="benefit-icon" style={{ fontSize: 26, flexShrink: 0 }}>{b.icon}</span>
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
                <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#1A1A1A" }}>Calendar plin în 4 pași</h2>
              </div>
            </div>

            {/* 4 Pași salon */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 48 }}>
              {STEPS_SALON.map(s => (
                <div key={s.nr} className="step-card" style={{ background: "#FFF3EA", borderRadius: 22, padding: "28px 26px", border: "2px solid #FF6B00", position: "relative", overflow: "hidden" }}>
                  <div className="step-num" style={{ position: "absolute", top: 18, right: 22, fontSize: 42, fontWeight: 900, color: "#FFDCC6", lineHeight: 1 }}>{s.nr}</div>
                  <div className="step-icon" style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1A1A1A", marginBottom: 10 }}>{s.titlu}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* MOCKUP SALON REAL — agenda zilei cu programări + stats */}
            <div className="mockup-card" style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FFE0CC 100%)", borderRadius: 24, padding: "32px", border: "1.5px solid #FFDCC6", marginBottom: 48, boxShadow: "0 4px 20px rgba(255,107,0,.08)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Exemplu real — Salon PetStyle Cluj</div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", marginBottom: 10 }}>Agenda ta de vineri — dintr-o privire</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.65, marginBottom: 16 }}>
                    Andrei vede instant cine vine, ce animal, ce talie, ce serviciu și cât plătește — fără să caute prin WhatsApp sau caiet.
                  </p>
                  {/* Mini stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { val: "640 RON", label: "Azi" },
                      { val: "8", label: "Programări" },
                      { val: "3M · 3M · 2Ma", label: "Mici·Medii·Mari" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#FFF3EA", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#FF6B00" }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2, fontWeight: 700 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Lista programări */}
                <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", border: "1.5px solid #FFDCC6" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#9CA3AF", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Vineri 23 Mai — programări</div>
                  {[
                    { ora: "09:00", client: "Maria P.", animal: "Rex", rasa: "Golden", talie: "Mare", serviciu: "Tuns + Spălat", pret: "180 RON", status: "confirmat" },
                    { ora: "10:30", client: "Ion D.", animal: "Bella", rasa: "Bichon", talie: "Mică", serviciu: "Spălat + Uscat", pret: "80 RON", status: "confirmat" },
                    { ora: "12:00", client: "Ana M.", animal: "Milo", rasa: "Labrador", talie: "Mare", serviciu: "Tuns complet", pret: "180 RON", status: "așteptare" },
                    { ora: "14:00", client: "Radu C.", animal: "Coco", rasa: "Pudel", talie: "Medie", serviciu: "Tuns + Unghii", pret: "130 RON", status: "confirmat" },
                  ].map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 3 ? "1px solid #F3F4F6" : "none" }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#FF6B00", minWidth: 44 }}>{p.ora}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.client} · <span style={{ fontWeight: 600 }}>{p.animal}</span> ({p.rasa})
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                          <span style={{ background: "#FFF3EA", color: "#FF6B00", padding: "1px 7px", borderRadius: 50, fontSize: 10, fontWeight: 800 }}>{p.talie}</span>
                          <span style={{ fontSize: 11, color: "#6B7280" }}>{p.serviciu}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: "#1A1A1A" }}>{p.pret}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: p.status === "confirmat" ? "#16A34A" : "#D97706", marginTop: 1 }}>
                          {p.status === "confirmat" ? "✓ Confirmat" : "⏳ Așteptare"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Beneficii salon — 6 carduri */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 36 }}>
              {BENEFICII_SALON.map(b => (
                <div key={b.titlu} className="benefit-card" style={{ background: "#FFF3EA", borderRadius: 18, padding: "22px 20px", border: "1.5px solid #FFDCC6", display: "flex", gap: 14 }}>
                  <span className="benefit-icon" style={{ fontSize: 26, flexShrink: 0 }}>{b.icon}</span>
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
            Stăpâni — programare în 10 secunde, profil animal gata.<br />
            Saloane — primele 14 zile gratuit, fără card.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.4)" }}>🐾 Creează cont</Link>
            <Link href="/register" style={{ padding: "14px 28px", borderRadius: 50, background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.2)", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>✂️ Înregistrează salonul</Link>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
