import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import {
  Building2, MapPin, Mail, Scale, Clock, Phone, Users, Store, HelpCircle, type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — CalyHub",
  description:
    "Date de contact CalyHub: adresă sediu, email pentru clienți, email pentru saloane partenere, email legal și program de lucru.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — CalyHub",
    description: "Cum ne contactezi: suport clienți, parteneriate saloane, aspecte legale.",
    url: "/contact",
    type: "website",
  },
  keywords: ["contact CalyHub", "suport CalyHub", "parteneri CalyHub", "adresa CalyHub", "email CalyHub"],
  robots: { index: true, follow: true },
};

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
const card: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 28, padding: 26,
  boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
};
const tile: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22, padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
};

const CANALE: { Icon: LucideIcon; titlu: string; desc: string; email: string }[] = [
  { Icon: Users, titlu: "Ești client", desc: "Întrebări despre cont, programări sau despre cum funcționează platforma.", email: "support@calyhub.ro" },
  { Icon: Store, titlu: "Ai un salon", desc: "Înscriere, planuri, configurare sau orice ține de parteneriat.", email: "parteneri@calyhub.ro" },
  { Icon: Scale, titlu: "Aspecte legale", desc: "Date personale, termeni, contracte sau solicitări oficiale.", email: "legal@calyhub.ro" },
];

const DATE_FIRMA: { Icon: LucideIcon; label: string; valoare: string }[] = [
  { Icon: Building2, label: "Companie", valoare: "CalyHub SRL" },
  { Icon: MapPin, label: "Adresă", valoare: "Al. Mizil 56-58, Sector 3, București" },
  { Icon: Clock, label: "Program", valoare: "Luni–Vineri, 09:00–18:00" },
];

export default function ContactPage() {
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
        <section style={{ position: "relative", overflow: "hidden", padding: "76px 20px 44px" }}>
          <div className="ch-orb" style={{ width: 320, height: 320, background: "rgba(255,107,0,.18)", top: -130, left: "16%" }} />
          <div className="ch-orb b" style={{ width: 280, height: 280, background: "rgba(255,140,66,.14)", top: 0, right: "10%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ display: "flex", justifyContent: "center", marginBottom: 18, animationDelay: ".05s" }}>
              <div style={{ width: 60, height: 60, borderRadius: 17, background: C.orangeSoft, border: "1.5px solid var(--pub-orange-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Phone size={27} color={C.orange} strokeWidth={2} />
              </div>
            </div>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 18, animationDelay: ".12s" }}>Contact</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(30px,4.6vw,46px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: -1.4, color: C.text, animationDelay: ".2s" }}>
              Hai să luăm legătura
            </h1>
            <p className="ch-hero-anim" style={{ margin: "18px auto 0", maxWidth: "54ch", fontSize: 17.5, lineHeight: 1.7, fontWeight: 500, color: C.muted, animationDelay: ".3s" }}>
              Scrie-ne pe adresa potrivită și îți răspundem în cel mai scurt timp. Preferăm emailul, ca să avem tot
              contextul într-un singur loc.
            </p>
          </div>
        </section>

        {/* CANALE */}
        <section style={{ padding: "20px 20px 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {CANALE.map(({ Icon, titlu, desc, email }) => (
                <div key={email} data-reveal className="ch-card" style={{ ...card, display: "flex", flexDirection: "column" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Icon size={23} color={C.orange} strokeWidth={2} />
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: C.text }}>{titlu}</h2>
                  <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8, marginBottom: 18, flex: 1 }}>{desc}</p>
                  <a href={`mailto:${email}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 800, color: C.orangeText, textDecoration: "none", wordBreak: "break-word" }}>
                    <Mail size={16} strokeWidth={2.2} /> {email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DATE FIRMA */}
        <section style={{ background: C.surface2, padding: "56px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 30px" }}>
              <div data-reveal style={eyebrow}>Date oficiale</div>
              <h2 data-reveal style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text, marginTop: 12 }}>Despre companie</h2>
            </div>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {DATE_FIRMA.map(({ Icon, label, valoare }) => (
                <div key={label} data-reveal className="ch-tile" style={tile}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Icon size={20} color={C.orange} strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: C.dim, textTransform: "uppercase", letterSpacing: 1.2 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginTop: 5, lineHeight: 1.45 }}>{valoare}</div>
                </div>
              ))}
            </div>
            <div data-reveal style={{ fontSize: 13.5, color: C.dim, fontWeight: 600, textAlign: "center", marginTop: 20 }}>
              Răspundem de regulă în maximum 24 de ore, în zilele lucrătoare.
            </div>
          </div>
        </section>

        {/* AJUTOR RAPID */}
        <section style={{ padding: "56px 20px 76px" }}>
          <div data-reveal style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg, var(--pub-orange-soft) 0%, var(--pub-tint) 100%)", border: "1px solid var(--pub-orange-border)", borderRadius: 28, padding: "clamp(32px,5vw,48px)", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <HelpCircle size={32} color={C.orange} strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text }}>Poate găsești răspunsul mai repede</h2>
              <p style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12, maxWidth: "52ch", marginLeft: "auto", marginRight: "auto" }}>
                Multe întrebări au deja răspuns în ghidul nostru — cum faci o rezervare, cum îți înscrii salonul sau cum funcționează planurile.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                <Link href="/cum-functioneaza" style={btnPrimary}>Vezi cum funcționează</Link>
                <Link href="/preturi" style={btnSecondary}>Vezi planurile</Link>
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
