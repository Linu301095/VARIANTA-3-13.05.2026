import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";
import ResetTheme from "../../components/ResetTheme";
import ScrollReveal from "../../components/ScrollReveal";
import {
  PawPrint, Scissors, Search, Calendar, Bell, Store, SlidersHorizontal,
  BarChart3, Sparkles, Check, type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cum funcționează CalyHub — Programări în câțiva pași",
  description:
    "Vezi cum funcționează CalyHub: clienții găsesc și rezervă la saloane de grooming și de înfrumusețare în câteva minute, iar saloanele își digitalizează agenda și primesc programări online 24/7.",
  alternates: { canonical: "/cum-functioneaza" },
  openGraph: {
    title: "Cum funcționează CalyHub",
    description: "De la căutare la rezervare pentru clienți, de la înregistrare la programări pentru saloane — grooming și înfrumusețare, într-o singură platformă.",
    url: "/cum-functioneaza",
    type: "website",
  },
};

const C = {
  bg: "#FAFAFA", surface: "#fff", surface2: "#F7F4F0", line: "#EBEBEB",
  text: "#1A1A1A", muted: "#6B7280", dim: "#9CA3AF",
  orange: "#FF6B00", orangeText: "#E05A00", orangeSoft: "#FFF3EA",
};

const eyebrow: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: C.orangeText,
  background: C.orangeSoft, border: "1px solid #FFDCC6", borderRadius: 50, padding: "7px 15px",
};
const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "14px 26px", borderRadius: 50, background: C.orange, color: "#fff",
  fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 22px rgba(255,107,0,.32)",
};
const btnSecondary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "14px 26px", borderRadius: 50, background: "#fff", color: C.text,
  fontSize: 15, fontWeight: 800, textDecoration: "none", border: `1.5px solid ${C.line}`,
};

type Step = { nr: string; Icon: LucideIcon; t: string; d: string };

const PASI_CLIENT: Step[] = [
  { nr: "01", Icon: Search, t: "Caută salonul potrivit", d: "Alegi lumea — grooming pentru animalul tău sau înfrumusețare pentru tine. Filtrezi după oraș, serviciu și rating, vezi prețuri exacte și galeria salonului." },
  { nr: "02", Icon: Calendar, t: "Rezervă în câteva minute", d: "Alegi slotul liber și specialistul preferat, adaugi o observație și trimiți. Fără telefoane, fără așteptare — disponibilitate în timp real." },
  { nr: "03", Icon: Bell, t: "Primești confirmarea", d: "Salonul confirmă direct în aplicație. Ai istoricul complet, recomandări după fiecare vizită și lași o recenzie — totul într-un singur cont." },
];

const PASI_SALON: Step[] = [
  { nr: "01", Icon: Store, t: "Înregistrezi salonul", d: "Alegi tipul — grooming sau înfrumusețare. Adaugi servicii, prețuri, echipă și galerie. Profilul apare instant în lista clienților din orașul tău." },
  { nr: "02", Icon: SlidersHorizontal, t: "Configurezi agenda", d: "Orar per specialist, sloturi de 30 de minute și blocări manuale (telefonic, walk-in, pauze). Sistemul previne automat dubla-rezervare." },
  { nr: "03", Icon: BarChart3, t: "Primești programări", d: "Confirmi cu un click, urmărești statistici reale și folosești cei 4 asistenți AI care îți fidelizează clienții. Totul, pe web și pe telefon." },
];

function Steps({ pasi }: { pasi: Step[] }) {
  return (
    <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
      {pasi.map((s) => (
        <div key={s.nr} data-reveal className="step-card" style={{ position: "relative", overflow: "hidden", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)" }}>
          <div className="step-num" style={{ position: "absolute", top: 16, right: 22, fontSize: 46, fontWeight: 900, color: C.orangeSoft, lineHeight: 1 }}>{s.nr}</div>
          <div className="step-icon" style={{ width: 52, height: 52, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><s.Icon size={26} color={C.orange} strokeWidth={2} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginBottom: 8 }}>{s.t}</h3>
          <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.65 }}>{s.d}</p>
        </div>
      ))}
    </div>
  );
}

export default function CumFunctioneaza() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <ResetTheme />

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,250,.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, height: 70 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={54} style={{ height: 54, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav className="hdr-nav" style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/instrumente-ai" className="nav-hide-sm" style={{ fontSize: 14, fontWeight: 700, color: C.text, textDecoration: "none" }}>Instrumente AI</Link>
            <Link href="/preturi" className="nav-hide-sm" style={{ fontSize: 14, fontWeight: 700, color: C.text, textDecoration: "none" }}>Prețuri</Link>
            <Link href="/login" className="hdr-btn" style={{ fontSize: 14, fontWeight: 700, color: C.muted, textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 6px 18px rgba(255,107,0,.32)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* HERO */}
        <section style={{ position: "relative", overflow: "hidden", padding: "76px 20px 40px" }}>
          <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(255,107,0,.20)", top: -120, left: "14%" }} />
          <div className="ch-orb b" style={{ width: 300, height: 300, background: "rgba(255,140,66,.16)", top: 10, right: "10%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 20, animationDelay: ".05s" }}>CUM FUNCȚIONEAZĂ</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: -1.5, color: C.text, animationDelay: ".15s" }}>
              Simplu pentru clienți.<br /><span style={{ color: C.orange }}>Profitabil pentru saloane.</span>
            </h1>
            <p className="ch-hero-anim" style={{ margin: "20px auto 0", maxWidth: "58ch", fontSize: 18, lineHeight: 1.7, fontWeight: 500, color: C.muted, animationDelay: ".28s" }}>
              Grooming pentru animale și înfrumusețare pentru oameni, într-o singură platformă. Clienții găsesc și rezervă
              în câteva minute; saloanele își digitalizează agenda și primesc programări online 24/7.
            </p>
          </div>
        </section>

        {/* PENTRU CLIENTI */}
        <section style={{ padding: "44px 20px 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><PawPrint size={26} color={C.orange} strokeWidth={2} /></div>
              <div>
                <div data-reveal style={{ ...eyebrow, marginBottom: 6 }}>Pentru clienți</div>
                <h2 data-reveal style={{ fontSize: "clamp(24px,3.2vw,34px)", fontWeight: 900, letterSpacing: -0.6, color: C.text }}>Găsești și rezervi în 3 pași</h2>
              </div>
            </div>
            <Steps pasi={PASI_CLIENT} />
            <div data-reveal style={{ marginTop: 22, background: C.orangeSoft, border: "1px solid #FFDCC6", borderRadius: 20, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Check size={18} color={C.orange} strokeWidth={2.6} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, color: C.text, fontWeight: 700 }}>Un singur cont pentru toate programările — animalul tău la grooming și tu la frizerie sau coafor. Contul e <b>gratuit</b>; plătești doar serviciul, la salon.</span>
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/register" style={btnPrimary}>Creează cont gratuit →</Link>
            </div>
          </div>
        </section>

        {/* PENTRU SALOANE */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scissors size={26} color={C.orange} strokeWidth={2} /></div>
              <div>
                <div data-reveal style={{ ...eyebrow, marginBottom: 6 }}>Pentru saloane · parteneri</div>
                <h2 data-reveal style={{ fontSize: "clamp(24px,3.2vw,34px)", fontWeight: 900, letterSpacing: -0.6, color: C.text }}>Ești live în 3 pași</h2>
              </div>
            </div>
            <Steps pasi={PASI_SALON} />

            {/* AI teaser -> pagina dedicata */}
            <div data-reveal className="ch-card" style={{ marginTop: 22, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, padding: "24px 26px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Sparkles size={24} color={C.orange} strokeWidth={2} /></div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: C.text }}>Patru asistenți AI, incluși</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, marginTop: 3, lineHeight: 1.5 }}>Răspunsuri la recenzii, reactivarea clienților inactivi, recomandări post-serviciu și consultant de business.</p>
              </div>
              <Link href="/instrumente-ai" style={btnSecondary}>Vezi instrumentele AI →</Link>
            </div>

            <div style={{ textAlign: "center", marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={btnPrimary}>Înregistrează salonul gratuit →</Link>
              <Link href="/preturi" style={btnSecondary}>Vezi planurile</Link>
            </div>
            <div style={{ textAlign: "center", fontSize: 13, color: C.dim, fontWeight: 600, marginTop: 14 }}>Fără card · 0% comision · primele 3 luni gratuite</div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: "64px 20px" }}>
          <div data-reveal style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FFFBF7 100%)", border: "1px solid #FFDCC6", borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(24px,3.2vw,36px)", fontWeight: 900, letterSpacing: -0.6, color: C.text }}>Gata să începi?</h2>
              <p style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12, maxWidth: "52ch", marginLeft: "auto", marginRight: "auto" }}>
                Clienții rezervă în câteva minute, gratuit. Saloanele primesc primele 3 luni gratuite, fără card și fără comision.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                <Link href="/register" style={btnPrimary}>Caută un salon</Link>
                <Link href="/register" style={btnSecondary}>Înscrie-ți salonul →</Link>
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
