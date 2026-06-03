import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import ResetTheme from "../components/ResetTheme";
import { PawPrint, Scissors, Search, Calendar, BarChart3, Smartphone, Star, Shield, Wallet, User, Gift, Download, AlertTriangle } from "lucide-react";

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff", fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <ResetTheme />

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/">
            <Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority />
          </Link>
          <nav className="hdr-nav" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" className="hdr-btn" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" className="hdr-btn" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 0 0 4px rgba(255,107,0,.15), 0 8px 28px rgba(255,107,0,.55), 0 0 48px rgba(255,107,0,.25)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* HERO */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 50, padding: "7px 18px", marginBottom: 20, fontSize: 13, fontWeight: 700, color: "#FF6B00" }}>
              <PawPrint size={14} strokeWidth={2} style={{ flexShrink: 0 }} /> Platforma care conectează stăpânii cu saloanele de grooming
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.1, marginBottom: 14 }}>
              Programează rapid animalul tău la<br />
              <span style={{ color: "#FF6B00" }}>cel mai potrivit salon de grooming.</span>
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
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "#FFF3EA", border: "1.5px solid #FFDCC6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><PawPrint size={26} color="#FF6B00" strokeWidth={1.8} /></div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: 2, textTransform: "uppercase" }}>Ai un animal de companie</div>
              </div>
              <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.2, marginBottom: 10 }}>Programează-ți<br />animalul</h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>Găsești salonul potrivit în câteva secunde, alegi ora și primești reminder automat înainte de vizită.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                {[
                  { Icon: Search, label: "Cauți după oraș, serviciu și preț" },
                  { Icon: Calendar, label: "Disponibilitate în timp real" },
                  { Icon: PawPrint, label: "Profil cu istoric salvat automat" },
                ].map(({ Icon, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FAFAFA", borderRadius: 12, padding: "11px 14px" }}>
                    <div style={{ width: 28, display: "flex", justifyContent: "center", flexShrink: 0 }}><Icon size={20} color="#FF6B00" strokeWidth={2} /></div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 14, padding: "12px 16px", marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#FF6B00" }}><PawPrint size={14} strokeWidth={2} /> Profil animal salvat automat</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>Rasă, vârstă, alergii — salonul îl cunoaște deja</div>
              </div>
              <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "15px 24px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 0 0 4px rgba(255,107,0,.15), 0 8px 28px rgba(255,107,0,.55), 0 0 48px rgba(255,107,0,.25)", marginTop: "auto" }}>
                Caută salon acum →
              </Link>
            </div>

            {/* Card Salon */}
            <div style={{ background: "#fff", borderRadius: 28, padding: "clamp(26px,3.5vw,42px)", border: "2px solid #FF6B00", boxShadow: "0 4px 32px rgba(255,107,0,.1)", display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "#FFF3EA", border: "1.5px solid #FFDCC6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scissors size={26} color="#FF6B00" strokeWidth={1.8} /></div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: 2, textTransform: "uppercase" }}>Ai un salon de grooming</div>
              </div>
              <h2 style={{ fontSize: "clamp(22px,2.6vw,30px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.2, marginBottom: 10 }}>Umple-ți<br />calendarul</h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>Primești programări online oricând, îți gestionezi calendarul dintr-un singur loc și urmărești statisticile salonului în timp real.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                {[
                  { Icon: Calendar, label: "Programări online non-stop" },
                  { Icon: BarChart3, label: "Statistici reale și rapoarte" },
                  { Icon: Scissors, label: "Sloturi și servicii per specialist" },
                ].map(({ Icon, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FAFAFA", borderRadius: 12, padding: "11px 14px" }}>
                    <div style={{ width: 28, display: "flex", justifyContent: "center", flexShrink: 0 }}><Icon size={20} color="#FF6B00" strokeWidth={2} /></div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 14, padding: "12px 16px", marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#FF6B00" }}><Gift size={14} strokeWidth={2} /> Primele 3 luni complet gratuite</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>Fără card · 0% comision · Anulezi oricând</div>
              </div>
              <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "15px 24px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 0 0 4px rgba(255,107,0,.15), 0 8px 28px rgba(255,107,0,.55), 0 0 48px rgba(255,107,0,.25)", marginTop: "auto" }}>
                Înregistrează salonul gratuit →
              </Link>
            </div>
          </div>

          {/* STATS BAR — fix responsive 2x2 pe mobil */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 56, paddingTop: 36, borderTop: "1px solid #FF6B00" }}>
            {[["24/7", "Disponibil"], ["0%", "Comision"], ["4 pași", "De la zero la confirmat"], ["Live", "Calendar actualizat instant"]].map(([val, label], i) => (
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

        {/* CUM FUNCȚIONEAZĂ — BUTON CĂTRE PAGINA DEDICATĂ */}
        <section style={{ background: "#fff", padding: "40px 20px 8px", textAlign: "center" }}>
          <Link href="/cum-functioneaza" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 36px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 16, fontWeight: 800, textDecoration: "none", boxShadow: "0 0 0 4px rgba(255,107,0,.15), 0 8px 28px rgba(255,107,0,.55), 0 0 48px rgba(255,107,0,.25)" }}>
            Vezi cum funcționează
            <span style={{ fontSize: 20 }}>→</span>
          </Link>
        </section>

        {/* SECTION STĂPÂNI */}
        <section style={{ background: "#fff", padding: "72px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: "6px 16px", borderRadius: 50, marginBottom: 16 }}>Pentru iubitorii de animale</div>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15 }}>Animalul tău merită<br /><span style={{ color: "#FF6B00" }}>îngrijirea perfectă.</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                { Icon: Calendar, title: "Programări 24/7", desc: "Fără telefon. Calendar actualizat în timp real." },
                { Icon: Smartphone, title: "Reminder SMS automat", desc: "Primești un SMS cu o zi înainte. Fără programări uitate." },
                { Icon: PawPrint, title: "Profil animal unic", desc: "Rasă, vârstă, alergii salvate. Salonul îl cunoaște deja." },
                { Icon: Star, title: "Status Special", desc: "Istoric complet vizite. Animalul tău are dosar propriu." },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="step-card" style={{ background: "#fff", borderRadius: 20, padding: 28, border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.08)" }}>
                  <div style={{ marginBottom: 14 }}><Icon size={32} color="#FF6B00" strokeWidth={1.8} /></div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* MOCKUP — profil animal din baza de date */}
            <div style={{ background: "#fff", borderRadius: 24, border: "2px solid #FF6B00", padding: "28px 32px", marginBottom: 40, boxShadow: "0 4px 20px rgba(255,107,0,.08)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Profilul lui Rex — salvat o singură dată</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", lineHeight: 1.2, marginBottom: 10 }}>Salonul știe tot înainte să ajungi</h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 16 }}>Rasa, talia, alergiile și istoricul vizitelor — trimise automat la fiecare programare. Tu nu mai explici nimic de la zero.</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "#fff", border: "1.5px solid #FFDCC6", color: "#FF6B00", padding: "5px 12px", borderRadius: 50, fontSize: 12, fontWeight: 800 }}>✅ Fără formulare repetate</span>
                  <span style={{ background: "#fff", border: "1.5px solid #FFDCC6", color: "#FF6B00", padding: "5px 12px", borderRadius: 50, fontSize: 12, fontWeight: 800 }}>✅ Alergii vizibile automat</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Card profil animal */}
                <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", border: "1.5px solid #FFDCC6", boxShadow: "0 4px 16px rgba(255,107,0,.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center" }}><PawPrint size={24} color="#FF6B00" strokeWidth={1.8} /></div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#1A1A1A" }}>Rex</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>Golden Retriever · 3 ani · 28 kg</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: "#FFF3EA", color: "#FF6B00", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>Mare</span>
                    <span style={{ background: "#FEF2F2", color: "#DC2626", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><AlertTriangle size={10} strokeWidth={2} /> Alergie ovăz</span>
                    <span style={{ background: "#F0FDF4", color: "#16A34A", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>✓ Vaccinat</span>
                  </div>
                </div>
                {/* Ultimele vizite */}
                <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", border: "1.5px solid #FFDCC6" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Ultimele vizite</div>
                  {[
                    { data: "12 Mai 2026", serviciu: "Tuns + Spălat", pret: "180 RON" },
                    { data: "14 Mar 2026", serviciu: "Spălat + Uscat", pret: "120 RON" },
                    { data: "08 Ian 2026", serviciu: "Tuns complet", pret: "175 RON" },
                  ].map((v, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{v.serviciu}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{v.data}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#FF6B00" }}>{v.pret}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 0 0 4px rgba(255,107,0,.15), 0 8px 28px rgba(255,107,0,.55), 0 0 48px rgba(255,107,0,.25)" }}>
                <PawPrint size={16} strokeWidth={2} /> Găsește salon acum →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION SALOANE */}
        <section style={{ background: "#fff", padding: "72px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", border: "1px solid #FFDCC6", color: "#FF6B00", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: "6px 16px", borderRadius: 50, marginBottom: 16 }}>Pentru saloane de grooming</div>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15 }}>Transformă-ți salonul<br /><span style={{ color: "#FF6B00" }}>într-o afacere profitabilă.</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                { Icon: Shield, title: "Protecție anulări", desc: "Vezi cine anulează des și blochezi clienții care îți strică agenda." },
                { Icon: Wallet, title: "Prețuri per talie", desc: "Tarif corect pentru fiecare câine — Mică, Medie, Mare. Fără negocieri." },
                { Icon: User, title: "Dosar per client", desc: "Vizite, servicii, animale și alergii — totul despre fiecare client, la îndemână." },
                { Icon: Smartphone, title: "Calendar de pe telefon", desc: "Accepți, refuzi sau ajustezi programări de oriunde, oricând." },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="step-card" style={{ background: "#fff", borderRadius: 20, padding: 28, border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.08)" }}>
                  <div style={{ marginBottom: 8 }}><Icon size={32} color="#FF6B00" strokeWidth={1.8} /></div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
            {/* Teaser statistici & rapoarte */}
            <div style={{ background: "#FFFBF7", borderRadius: 22, border: "2px solid #FF6B00", padding: "28px 26px", marginBottom: 40, boxShadow: "0 2px 12px rgba(255,107,0,.08)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 26, alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}><BarChart3 size={14} strokeWidth={2} /> Statistici & rapoarte</div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: "#1A1A1A", lineHeight: 1.2, marginBottom: 10 }}>Vezi exact cât produci — pe orice perioadă</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.65, marginBottom: 16 }}>
                    Încasări, top servicii și productivitatea fiecărui groomer, filtrate pe Azi / Săptămână / Lună / An. Plus raport Excel descărcabil cu un click — gata pentru contabil.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {["Azi", "Săptămână", "Lună", "An", "Interval"].map(p => (
                      <span key={p} style={{ padding: "6px 14px", borderRadius: 50, fontSize: 12.5, fontWeight: 800, border: p === "Lună" ? "2px solid #FF6B00" : "1.5px solid #FFDCC6", background: p === "Lună" ? "#FF6B00" : "#fff", color: p === "Lună" ? "#fff" : "#6B7280" }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1.5px solid #FFDCC6" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Încasări — luna asta</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#16A34A", background: "rgba(22,163,74,.12)", padding: "3px 10px", borderRadius: 50 }}>▲ 18%</span>
                  </div>
                  {[
                    { luna: "Mar", val: 84 }, { luna: "Apr", val: 78 }, { luna: "Mai", val: 100 },
                  ].map(m => (
                    <div key={m.luna} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                      <div style={{ width: 30, fontSize: 12, fontWeight: 700, color: "#9CA3AF", flexShrink: 0 }}>{m.luna}</div>
                      <div style={{ flex: 1, height: 8, background: "#FFEAD9", borderRadius: 4 }}><div style={{ height: "100%", width: `${m.val}%`, background: "#FF6B00", borderRadius: 4 }} /></div>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 50, background: "#1A1A1A", color: "#fff", fontSize: 12.5, fontWeight: 800 }}><Download size={13} strokeWidth={2} /> Raport Excel</span>
                    <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>venituri · servicii · groomeri · talie</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 0 0 4px rgba(255,107,0,.15), 0 8px 28px rgba(255,107,0,.55), 0 0 48px rgba(255,107,0,.25)" }}>
                <Scissors size={16} strokeWidth={2} /> Înregistrează salonul gratuit →
              </Link>
              <Link href="/preturi" className="planuri-btn" style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", borderRadius: 50, border: "2px solid #FF6B00", background: "#fff", fontSize: 15, fontWeight: 800, color: "#FF6B00", textDecoration: "none" }}>Planuri</Link>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: "#1A1A1A", padding: "72px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Ești gata să începi?</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", marginBottom: 36 }}>Stăpâni — programare în 10 secunde.<br />Saloane — primele 3 luni gratuite.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 0 0 4px rgba(255,107,0,.15), 0 8px 28px rgba(255,107,0,.55), 0 0 48px rgba(255,107,0,.25)" }}><PawPrint size={16} strokeWidth={2} /> Programează acum</Link>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.2)", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none" }}><Scissors size={16} strokeWidth={2} /> Înregistrează salonul gratuit</Link>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
