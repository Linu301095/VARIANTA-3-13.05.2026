import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import HeroSearch from "../components/HeroSearch";
import { IconIntersectie, IconDouaLumi } from "../components/SectionIcons";
import { PawPrint, Scissors, Search, Calendar, Sparkles, Tag, Star, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "CalyHub — Programări online pentru saloane de înfrumusețare și grooming",
  description:
    "Găsește și rezervă la frizerii și saloane de coafură pentru tine sau la saloane de grooming pentru animalul tău. Programări online 24/7, gratuit pentru clienți. Pentru saloane: agendă digitală, statistici și asistenți AI — cu trial gratuit la început.",
  keywords: [
    "programări online", "frizerie", "coafor", "înfrumusețare", "salon beauty",
    "saloane grooming", "grooming câini", "grooming pisici", "programare salon", "CalyHub", "rezervare salon",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "CalyHub — Programări de îngrijire, într-o singură platformă",
    description:
      "Saloane de înfrumusețare pentru oameni și saloane de grooming pentru animale. Programări online 24/7, gratuit pentru clienți; agendă digitală și AI pentru saloane.",
    url: "/",
    type: "website",
  },
};

const C = {
  surface: "var(--pub-surface)",
  bg: "var(--pub-bg)",
  surface2: "var(--pub-surface2)",
  line: "var(--pub-line)",
  text: "var(--pub-text)",
  text2: "var(--pub-text2)",
  muted: "var(--pub-muted)",
  dim: "var(--pub-dim)",
  orange: "var(--pub-orange)",
  orangeText: "var(--pub-orange-text)",
  orangeSoft: "var(--pub-orange-soft)",
  dark: "var(--pub-dark)",
};

const card: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 28,
  padding: 26, boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
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
const chk = (t: React.ReactNode) => (
  <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
    <Check size={18} color={C.orange} strokeWidth={2.4} style={{ marginTop: 1, flexShrink: 0 }} />
    <span style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5, fontWeight: 600 }}>{t}</span>
  </div>
);
const iconBox = (Icon: typeof PawPrint, size = 23) => (
  <div style={{ width: 46, height: 46, borderRadius: 13, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Icon size={size} color={C.orange} strokeWidth={2} />
  </div>
);

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif" }}>

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-header)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, height: 70 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo h={54} priority />
          <nav className="hdr-nav" style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/login" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: "var(--pub-surface)", border: "1.5px solid var(--pub-line2)", fontSize: 14, fontWeight: 800, color: C.text, textDecoration: "none", boxShadow: "0 2px 8px rgba(120,90,60,.08)" }}>Conectare</Link>
            <Link href="/register" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 6px 18px rgba(255,107,0,.32)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* HERO */}
        <section style={{ position: "relative", overflow: "hidden", padding: "80px 20px" }}>
          <div className="ch-orb" style={{ width: 360, height: 360, background: "rgba(255,107,0,.20)", top: -120, left: "11%" }} />
          <div className="ch-orb b" style={{ width: 300, height: 300, background: "rgba(255,140,66,.16)", top: 10, right: "7%" }} />
          <div className="ch-orb c" style={{ width: 230, height: 230, background: "rgba(255,185,120,.18)", top: 330, left: "46%" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 20, animationDelay: ".05s" }}><IconDouaLumi /> PROGRAMĂRI ONLINE · ÎNFRUMUSEȚARE &amp; GROOMING</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(34px,5.4vw,56px)", fontWeight: 900, lineHeight: 1.03, letterSpacing: -1.5, color: C.text, animationDelay: ".15s" }}>
              Toate programările de îngrijire,<br />într-o <span style={{ color: C.orange }}>singură platformă</span>.
            </h1>
            <p className="ch-hero-anim" style={{ margin: "22px auto 0", maxWidth: "56ch", fontSize: 19, lineHeight: 1.65, fontWeight: 500, color: C.muted, animationDelay: ".28s" }}>
              CalyHub conectează clienții cu cele mai bune saloane de <b style={{ color: C.text, fontWeight: 800 }}>înfrumusețare</b> și de <b style={{ color: C.text, fontWeight: 800 }}>grooming</b> din orașul lor. Găsești, compari și rezervi online în câteva minute — <b style={{ color: C.text, fontWeight: 800 }}>pentru tine și pentru animalul tău</b>.
            </p>

            <HeroSearch />

            <div className="ch-hero-anim" style={{ marginTop: 18, fontSize: 13.5, fontWeight: 700, animationDelay: ".64s" }}>
              <span style={{ color: C.muted }}>Ai un salon? <Link href="/register" style={{ color: C.orangeText, fontWeight: 800, textDecoration: "none" }}>Înscrie-te gratuit →</Link></span>
            </div>

            {/* trei motive scurte — înlocuiesc secțiunea „De ce CalyHub" */}
            <div className="ch-hero-anim ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginTop: 46, textAlign: "left", animationDelay: ".74s" }}>
              {[
                { Icon: Tag, t: "Prețul, înainte de rezervare", d: "Vezi cât plătești pentru fiecare serviciu — pe talia animalului sau pe serviciu. Fără surprize la final." },
                { Icon: Calendar, t: "Rezervi la orice oră", d: "Inclusiv când salonul e închis. Alegi ora și persoana, iar confirmarea vine în cont." },
                { Icon: Star, t: "Recenzii de la clienți reali", d: "Scrise doar de cine a fost efectiv la salon, după vizită. Alegi în cunoștință de cauză." },
              ].map(({ Icon, t, d }) => (
                <div key={t} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: C.orangeSoft, border: "1px solid var(--pub-orange-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={19} color={C.orange} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</div>
                    <div style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.55, marginTop: 4 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BIFURCAȚIA — clientul și salonul își aleg drumul devreme, ca să nu
            citească fiecare jumătate din pagină degeaba. */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 34px" }}>
              <div data-reveal style={eyebrow}>ALEGE DRUMUL</div>
              <h2 data-reveal style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 12 }}>Cu ce ai venit azi?</h2>
            </div>

            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div data-reveal className="ch-card" style={{ ...card, display: "flex", flexDirection: "column", padding: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 4 }}>
                  {iconBox(Search, 22)}
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: C.orangeText, letterSpacing: 1.5, textTransform: "uppercase" }}>Sunt client</div>
                    <h3 style={{ fontSize: 21, fontWeight: 900, marginTop: 2, color: C.text, letterSpacing: -0.3 }}>Caut un salon</h3>
                  </div>
                </div>
                <p style={{ fontSize: 14.5, color: C.muted, fontWeight: 600, lineHeight: 1.65, margin: "15px 0 16px" }}>
                  Frizerie și coafor pentru tine, sau grooming pentru animalul tău. Cauți în orașul tău, compari și rezervi în câteva minute.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {chk(<>Prețuri afișate, <b style={{ color: C.text, fontWeight: 800 }}>pe serviciu sau pe talia animalului</b></>)}
                  {chk(<>Alegi <b style={{ color: C.text, fontWeight: 800 }}>ora și persoana</b> care te preia</>)}
                  {chk(<>Tot <b style={{ color: C.text, fontWeight: 800 }}>istoricul vizitelor</b>, într-un singur cont</>)}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <Link href="/register" style={{ ...btnPrimary, width: "100%" }}>Caută un salon →</Link>
                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <Link href="/cum-functioneaza#clienti" style={{ fontSize: 13, fontWeight: 800, color: C.orangeText, textDecoration: "none" }}>Vezi întâi cum funcționează →</Link>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12.5, color: C.dim, fontWeight: 600, marginTop: 8 }}>Contul e gratuit pentru clienți</div>
                </div>
              </div>

              <div data-reveal className="ch-card" style={{ ...card, display: "flex", flexDirection: "column", padding: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 4 }}>
                  {iconBox(Scissors, 22)}
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: C.orangeText, letterSpacing: 1.5, textTransform: "uppercase" }}>Am un salon</div>
                    <h3 style={{ fontSize: 21, fontWeight: 900, marginTop: 2, color: C.text, letterSpacing: -0.3 }}>Vreau programări</h3>
                  </div>
                </div>
                <p style={{ fontSize: 14.5, color: C.muted, fontWeight: 600, lineHeight: 1.65, margin: "15px 0 16px" }}>
                  Agendă digitală, echipă cu orar separat, statistici reale și asistenți AI. Zero comision pe programări — plătești doar abonamentul.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {chk(<>Clienții rezervă singuri, <b style={{ color: C.text, fontWeight: 800 }}>și noaptea, și duminica</b></>)}
                  {chk(<>Vezi <b style={{ color: C.text, fontWeight: 800 }}>încasările, serviciile cerute</b> și cine aduce bani</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Patru asistenți AI</b> care lucrează între programări</>)}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <Link href="/register" style={{ ...btnPrimary, width: "100%" }}>Înscrie-ți salonul →</Link>
                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <Link href="/cum-functioneaza#parteneri" style={{ fontSize: 13, fontWeight: 800, color: C.orangeText, textDecoration: "none" }}>Vezi întâi ce primești →</Link>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12.5, color: C.dim, fontWeight: 600, marginTop: 8 }}>Trial gratuit, fără card</div>
                </div>
              </div>
            </div>

            <div data-reveal style={{ textAlign: "center", marginTop: 28, display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap", fontSize: 13.5, fontWeight: 700 }}>
              <Link href="/instrumente-ai" style={{ color: C.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
                <Sparkles size={15} color={C.orange} strokeWidth={2.2} /> Asistenții AI
              </Link>
              <Link href="/preturi" style={{ color: C.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
                <Tag size={15} color={C.orange} strokeWidth={2.2} /> Planuri și prețuri
              </Link>
            </div>
          </div>
        </section>

        {/* AVANTAJ + CTA FINAL */}
        <section style={{ padding: "64px 20px 76px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div data-reveal style={{ background: "linear-gradient(135deg, var(--pub-orange-soft) 0%, var(--pub-tint) 100%)", border: "1px solid var(--pub-orange-border)", borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconIntersectie size={60} /></div>
              <div style={eyebrow}>AVANTAJUL CALYHUB</div>
              <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 14 }}>Deținem intersecția</h2>
              <p style={{ fontSize: 17, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 16, maxWidth: "56ch", marginLeft: "auto", marginRight: "auto" }}>
                Piața e segmentată. Nimeni nu operează ambele lumi din același loc — înfrumusețare și grooming,
                pentru oameni și pentru animale. Iar acolo este poziția noastră.
              </p>

              <div style={{ height: 1, background: "var(--pub-orange-border)", maxWidth: 420, margin: "34px auto" }} />

              <h3 style={{ fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text }}>Începe astăzi</h3>
              <p style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 10, maxWidth: "54ch", marginLeft: "auto", marginRight: "auto" }}>
                Rezervă primul serviciu în câteva minute, sau înscrie-ți salonul și începe cu trial gratuit.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
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
