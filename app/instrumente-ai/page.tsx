import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";
import ResetTheme from "../../components/ResetTheme";
import ScrollReveal from "../../components/ScrollReveal";
import { Star, Users, ClipboardList, Sparkles, Image as ImageIcon, Check } from "lucide-react";
import { SparkleAnim } from "../../components/SectionIcons";

export const metadata: Metadata = {
  title: "Instrumente AI pentru saloane — CalyHub",
  description:
    "Patru asistenți AI incluși în CalyHub: răspunsuri automate la recenzii, reactivarea clienților inactivi, recomandări de îngrijire post-serviciu și consultant AI de business. Pentru saloane de înfrumusețare și grooming.",
  keywords: ["asistenți AI saloane", "AI grooming", "AI înfrumusețare", "consultant AI salon", "răspunsuri recenzii AI", "CalyHub AI"],
  alternates: { canonical: "/instrumente-ai" },
  openGraph: {
    title: "Instrumente AI pentru saloane — CalyHub",
    description: "Patru asistenți AI care lucrează pentru salonul tău: recenzii, clienți inactivi, recomandări post-serviciu și consultant de business.",
    url: "/instrumente-ai",
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
// Steluță / sparkle — motivul vizual al instrumentelor AI
function Sparkle({ size = 24, color = C.orange, style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={style} aria-hidden="true">
      <path d="M12 1.6l1.75 6.9 6.9 1.75-6.9 1.75L12 18.9l-1.75-6.9L3.35 10.25l6.9-1.75z" />
      <path d="M19 2.4l.7 2.55 2.55.7-2.55.7-.7 2.55-.7-2.55-2.55-.7 2.55-.7z" opacity=".75" />
      <path d="M5 15l.55 2 2 .55-2 .55L5 20.1l-.55-2-2-.55 2-.55z" opacity=".6" />
    </svg>
  );
}

type Tool = { Icon: typeof Star; color: string; soft: string; plan: string; t: string; d: string; b: string[] };

const TOOLS: Tool[] = [
  {
    Icon: Star, color: "#E08900", soft: "rgba(224,137,0,.12)", plan: "Plan Basic",
    t: "Răspunsuri la recenzii",
    d: "Fiecare recenzie merită un răspuns — dar nu ai mereu timp să îl formulezi. AI-ul citește recenzia, identifică serviciul și redactează un răspuns profesional, personalizat.",
    b: ["Ton profesional, adaptat fiecărei recenzii", "Îl editezi sau îl trimiți direct cu un click", "Reputația salonului, îngrijită automat"],
  },
  {
    Icon: Users, color: "#EF4444", soft: "rgba(239,68,68,.10)", plan: "Plan Pro",
    t: "Alertă clienți inactivi",
    d: "Un client fidel care nu a mai revenit se întoarce mult mai ușor dacă îl contactezi la momentul potrivit. AI-ul îi identifică singur și îți pregătește mesajul de reactivare.",
    b: ["Detectează clienții care nu au mai revenit", "Mesaj de reactivare pregătit automat", "Cod de reducere opțional inclus"],
  },
  {
    Icon: ClipboardList, color: "#0891B2", soft: "rgba(8,145,178,.10)", plan: "Plan Business",
    t: "Recomandări post-serviciu",
    d: "După fiecare vizită, clientul primește sfaturi de îngrijire personalizate — ce produse să folosească și cum să întrețină între vizite. Un plus de profesionalism care îl aduce înapoi.",
    b: ["Personalizate pe serviciu și pe rasă", "Trimise automat clientului după vizită", "Cresc retenția și încrederea în salon"],
  },
  {
    Icon: Sparkles, color: "#6366F1", soft: "rgba(99,102,241,.10)", plan: "Plan Business",
    t: "Consultant AI",
    d: "Analizează datele reale ale salonului și îți livrează rapoarte de business lunare: ce a mers, ce trebuie îmbunătățit, plan de creștere, analiză de prețuri și performanța echipei.",
    b: ["Rapoarte lunare din datele tale reale", "Recomandări concrete, nu sfaturi generice", "Analiză de prețuri, echipă și creștere"],
  },
];

export default function InstrumenteAI() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <ResetTheme />

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,250,.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, height: 70 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={54} style={{ height: 54, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav className="hdr-nav" style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/login" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: "#fff", border: "1.5px solid #DDD6CE", fontSize: 14, fontWeight: 800, color: C.text, textDecoration: "none", boxShadow: "0 2px 8px rgba(120,90,60,.08)" }}>Conectare</Link>
            <Link href="/register" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 6px 18px rgba(255,107,0,.32)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* HERO */}
        <section style={{ position: "relative", overflow: "hidden", padding: "76px 20px 60px" }}>
          <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(99,102,241,.14)", top: -120, left: "14%" }} />
          <div className="ch-orb b" style={{ width: 300, height: 300, background: "rgba(255,107,0,.16)", top: 10, right: "10%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ display: "flex", justifyContent: "center", marginBottom: 22, animationDelay: ".05s" }}>
              <SparkleAnim size={54} glow />
            </div>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 18, animationDelay: ".12s" }}><Sparkle size={13} /> INSTRUMENTE AI · PENTRU SALOANE</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(34px,5.4vw,54px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: -1.5, color: C.text, animationDelay: ".2s" }}>
              Inteligență care lucrează<br />pentru <span style={{ color: C.orange }}>salonul tău</span>.
            </h1>
            <p className="ch-hero-anim" style={{ margin: "20px auto 0", maxWidth: "58ch", fontSize: 18, lineHeight: 1.7, fontWeight: 500, color: C.muted, animationDelay: ".3s" }}>
              Patru asistenți AI incluși în CalyHub — pornind de la datele reale ale salonului, îți economisesc timp,
              îți țin clienții aproape și îți dau un plus de profesionalism pe care clienții îl simt după fiecare vizită.
            </p>
          </div>
        </section>

        {/* TOOLS */}
        <section style={{ padding: "20px 20px 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {TOOLS.map(({ Icon, color, soft, plan, t, d, b }) => (
                <div key={t} data-reveal className="ch-card" style={{ position: "relative", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 28, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: color }} />
                  <Sparkle size={20} color={color} style={{ position: "absolute", top: 18, right: 18, opacity: 0.9 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={24} color={color} strokeWidth={2} />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: "#0FA671", background: "rgba(15,166,113,.12)", padding: "3px 9px", borderRadius: 50 }}>{plan}</span>
                      <h2 style={{ fontSize: 21, fontWeight: 900, letterSpacing: -0.4, color: C.text, marginTop: 6 }}>{t}</h2>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: C.muted, fontWeight: 600, lineHeight: 1.65, marginBottom: 16 }}>{d}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {b.map((x) => (
                      <div key={x} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                        <Check size={17} color={color} strokeWidth={2.6} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.5 }}>{x}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* in curand */}
            <div data-reveal className="ch-card" style={{ marginTop: 16, background: C.surface2, border: `1.5px dashed #E0D6CB`, borderRadius: 24, padding: "22px 26px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(236,72,153,.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ImageIcon size={22} color="#EC4899" strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: C.text }}>Postări sociale din poze</h3>
                <p style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginTop: 3, lineHeight: 1.5 }}>Încarci poza cu rezultatul final — AI recunoaște și generează un caption atractiv plus hashtag-uri pentru Instagram și Facebook.</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase", color: "#EC4899", background: "rgba(236,72,153,.10)", padding: "5px 12px", borderRadius: 50 }}>În curând</span>
            </div>
          </div>
        </section>

        {/* CONCLUZIE */}
        <section style={{ padding: "0 20px 76px" }}>
          <div data-reveal style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FFFBF7 100%)", border: "1px solid #FFDCC6", borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
              <div style={{ display: "inline-flex", marginBottom: 20 }}><SparkleAnim size={40} glow /></div>
              <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 900, letterSpacing: -1.2, lineHeight: 1.12, color: C.text, maxWidth: "24ch", marginLeft: "auto", marginRight: "auto" }}>
                Agenți AI care lucrează pe <span style={{ color: C.orange }}>datele salonului tău</span>, nu pe generalități.
              </h2>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
      <ScrollReveal />
    </div>
  );
}
