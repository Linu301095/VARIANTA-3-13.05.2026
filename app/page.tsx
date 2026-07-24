import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import ResetTheme from "../components/ResetTheme";
import ScrollReveal from "../components/ScrollReveal";
import HeroSearch from "../components/HeroSearch";
import {
  PawPrint, Scissors, Calendar, BarChart3, Users, Sparkles,
  Clock, Tag, Gift, Smartphone, Star, MessageSquare, ClipboardList, PlayCircle, Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CalyHub — Programări online pentru saloane de grooming și înfrumusețare",
  description:
    "Găsește și rezervă la saloane de grooming pentru animalul tău sau la frizerii și saloane de coafură pentru tine. Programări online 24/7, gratuit pentru clienți. Pentru saloane: agendă digitală, statistici și asistenți AI — primele 3 luni gratuite.",
  keywords: [
    "programări online", "saloane grooming", "frizerie", "coafor", "înfrumusețare",
    "grooming câini", "grooming pisici", "programare salon", "CalyHub", "rezervare salon",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "CalyHub — Programări de îngrijire, într-o singură platformă",
    description:
      "Saloane de grooming pentru animale și saloane de înfrumusețare pentru oameni. Programări online 24/7, gratuit pentru clienți; agendă digitală și AI pentru saloane.",
    url: "/",
    type: "website",
  },
};

const C = {
  bg: "#FAFAFA", surface: "#fff", surface2: "#F7F4F0", line: "#EBEBEB",
  text: "#1A1A1A", text2: "#374151", muted: "#6B7280", dim: "#9CA3AF",
  orange: "#FF6B00", orangeText: "#E05A00", orangeSoft: "#FFF3EA", dark: "#1A1512",
};

const card: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 28,
  padding: 26, boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
};
const tile: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22,
  padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
};
const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: C.orangeText,
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
      <ResetTheme />

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,250,.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, height: 70 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={54} style={{ height: 54, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav className="hdr-nav" style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/cum-functioneaza" className="nav-hide-sm" style={{ fontSize: 14, fontWeight: 700, color: C.text, textDecoration: "none" }}>Cum funcționează</Link>
            <Link href="/preturi" className="nav-hide-sm" style={{ fontSize: 14, fontWeight: 700, color: C.text, textDecoration: "none" }}>Prețuri</Link>
            <Link href="/login" className="hdr-btn" style={{ fontSize: 14, fontWeight: 700, color: C.muted, textDecoration: "none" }}>Conectare</Link>
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
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 20, animationDelay: ".05s" }}>PROGRAMĂRI ONLINE · GROOMING &amp; ÎNFRUMUSEȚARE</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(34px,5.4vw,56px)", fontWeight: 900, lineHeight: 1.03, letterSpacing: -1.5, color: C.text, animationDelay: ".15s" }}>
              Toate programările de îngrijire,<br />într-o <span style={{ color: C.orange }}>singură platformă</span>.
            </h1>
            <p className="ch-hero-anim" style={{ margin: "22px auto 0", maxWidth: "60ch", fontSize: 18, lineHeight: 1.7, fontWeight: 500, color: C.muted, animationDelay: ".28s" }}>
              CalyHub conectează clienții cu saloanele de grooming și de înfrumusețare din orașul lor —
              îngrijire pentru animale și pentru oameni. Programări online 24/7, gestiune completă a agendei
              și instrumente AI pentru saloane.
            </p>

            <HeroSearch />

            <div className="ch-hero-anim" style={{ marginTop: 18, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", alignItems: "center", fontSize: 13.5, fontWeight: 700, animationDelay: ".64s" }}>
              <Link href="/cum-functioneaza" style={{ color: C.text, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}><PlayCircle size={17} color={C.orange} strokeWidth={2} /> Vezi cum funcționează</Link>
              <span style={{ width: 1, height: 16, background: C.line }} />
              <span style={{ color: C.muted }}>Ai un salon? <Link href="/register" style={{ color: C.orangeText, fontWeight: 800, textDecoration: "none" }}>Înscrie-te gratuit →</Link></span>
            </div>

            {/* doua carduri de public */}
            <div className="ch-hero-anim ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 44, textAlign: "left", animationDelay: ".74s" }}>
              <div className="ch-card" style={{ ...card, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  {iconBox(PawPrint)}
                  <div><div style={{ fontSize: 10.5, fontWeight: 800, color: C.orangeText, letterSpacing: 1.5, textTransform: "uppercase" }}>Ești client</div><h2 style={{ fontSize: 19, fontWeight: 900, marginTop: 2, color: C.text }}>Găsește și rezervă</h2></div>
                </div>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginBottom: 16, minHeight: 63 }}>Salon de grooming pentru animalul tău sau frizerie și coafor pentru tine — cauți, compari și rezervi online în câteva minute.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Prețuri transparente</b> și disponibilitate live</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Rezervare 24/7</b> cu confirmare instantă</>)}
                  {chk(<>Alegi <b style={{ color: C.text, fontWeight: 800 }}>specialistul</b> și ora preferată</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Istoric și recomandări</b> după fiecare vizită</>)}
                </div>
                <div style={{ marginTop: "auto", background: C.orangeSoft, border: "1px solid #FFDCC6", borderRadius: 14, padding: "11px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.orangeText, display: "flex", alignItems: "center", gap: 6 }}><Check size={15} strokeWidth={2.6} /> Gratuit pentru clienți</div>
                  <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600, marginTop: 2 }}>Fără cost, fără card — plătești doar serviciul, la salon</div>
                </div>
                <Link href="/register" style={btnPrimary}>Caută un salon →</Link>
              </div>
              <div className="ch-card" style={{ ...card, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  {iconBox(Scissors)}
                  <div><div style={{ fontSize: 10.5, fontWeight: 800, color: C.orangeText, letterSpacing: 1.5, textTransform: "uppercase" }}>Ai un salon</div><h2 style={{ fontSize: 19, fontWeight: 900, marginTop: 2, color: C.text }}>Umple-ți agenda</h2></div>
                </div>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginBottom: 16, minHeight: 63 }}>Grooming sau înfrumusețare — programări online, agendă digitală și instrumente care îți fidelizează clienții.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Programări online 24/7</b>, fără un telefon dat</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Calendar per specialist</b> și statistici reale</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>4 asistenți AI</b> care îți fidelizează clienții</>)}
                  {chk(<>Recenzii, istoric client și <b style={{ color: C.text, fontWeight: 800 }}>export Excel</b></>)}
                </div>
                <div style={{ marginTop: "auto", background: C.orangeSoft, border: "1px solid #FFDCC6", borderRadius: 14, padding: "11px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.orangeText, display: "flex", alignItems: "center", gap: 6 }}><Gift size={14} strokeWidth={2} /> Primele 3 luni gratuite</div>
                  <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600, marginTop: 2 }}>Fără card · 0% comision · anulezi oricând</div>
                </div>
                <Link href="/register" style={btnPrimary}>Înscrie-te gratuit →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* DE CE CALYHUB */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
              <div data-reveal style={eyebrow}>DE CE CALYHUB</div>
              <h2 data-reveal style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 12 }}>Totul, într-un loc care lucrează pentru tine</h2>
              <p data-reveal style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12 }}>Grooming pentru animale și înfrumusețare pentru oameni, sub același cont. Prețuri la vedere, istoric salvat și recomandări după fiecare vizită — o experiență digitală completă.</p>
            </div>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[
                { Icon: Sparkles, t: "Ambele lumi, într-un singur cont", d: "Grooming pentru animalul tău și frizerie sau coafor pentru tine — cauți și rezervi din același loc." },
                { Icon: Tag, t: "Prețuri transparente", d: "Vezi prețul exact înainte să rezervi — pe talia animalului sau pe serviciu. Fără surprize la final." },
                { Icon: Calendar, t: "Programări 24/7", d: "Rezervi oricând, cu confirmare instantă și disponibilitate live. Fără telefoane, fără așteptare." },
                { Icon: Clock, t: "Istoric complet", d: "Toate vizitele tale și ale animalului, salvate într-un singur cont — vezi mereu ce urmează și ce a fost." },
                { Icon: Star, t: "Recenzii reale", d: "Alegi salonul potrivit în siguranță, pe baza experienței altor clienți verificați." },
                { Icon: Smartphone, t: "Web și mobil", d: "Aceleași date, sincronizate în timp real — programează de pe laptop, continuă de pe telefon." },
              ].map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-card" style={{ ...card, padding: 26 }}>
                  {iconBox(Icon)}
                  <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>{t}</h3>
                  <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PENTRU CLIENTI */}
        <section style={{ padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
              <div data-reveal style={eyebrow}>PENTRU CLIENȚI</div>
              <h2 data-reveal style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 12 }}>Găsești, rezervi, revii — fără bătăi de cap</h2>
              <p data-reveal style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12 }}>Alege lumea în care intri și rezervă în câteva minute. Aceeași experiență simplă, fie că e vorba de animalul tău sau de tine.</p>
            </div>
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div data-reveal className="ch-card" style={{ ...card, padding: 28 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 800, color: C.orangeText, background: C.orangeSoft, padding: "6px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 0.5 }}><PawPrint size={14} strokeWidth={2} /> Pentru animalul tău</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>Grooming, cu tot salvat</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8, marginBottom: 16 }}>Găsești cel mai bun salon de grooming din oraș, cu preț exact pe talia animalului.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {chk(<>Filtrezi după <b style={{ color: C.text, fontWeight: 800 }}>oraș, serviciu și rating</b></>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Preț exact</b> pe talia animalului tău</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Profil animal</b> cu rasă, talie și istoricul vizitelor</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Recomandări de îngrijire</b> după fiecare tuns</>)}
                </div>
              </div>
              <div data-reveal className="ch-card" style={{ ...card, padding: 28 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 800, color: C.orangeText, background: C.orangeSoft, padding: "6px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 0.5 }}><Scissors size={14} strokeWidth={2} /> Pentru tine</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>Frizerie &amp; coafor, la câteva atingeri</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8, marginBottom: 16 }}>Descoperi frizerii și saloane de coafură și rezervi cu specialistul preferat.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Frizerii și saloane de coafură</b> din orașul tău</>)}
                  {chk(<>Rezervi cu <b style={{ color: C.text, fontWeight: 800 }}>specialistul preferat</b> și ora aleasă</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Tot istoricul serviciilor</b>, într-un singur cont</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Sfaturi de îngrijire</b> după fiecare vizită</>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PENTRU SALOANE / PARTENERI */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 38px" }}>
              <div data-reveal style={eyebrow}>PENTRU SALOANE · PARTENERI</div>
              <h2 data-reveal style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 12 }}>Transformă-ți salonul într-o afacere digitală</h2>
              <p data-reveal style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12 }}>Mai multe programări onorate, mai puțin timp pierdut la telefon. Agendă digitală, statistici reale și 4 asistenți AI care îți aduc clienții înapoi — primele 3 luni gratuite, fără comision.</p>
            </div>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { Icon: Calendar, t: "Agendă mereu plină", d: "Programări online 24/7, fără un telefon dat." },
                { Icon: BarChart3, t: "Statistici reale", d: "Încasări, top servicii, productivitate, export Excel." },
                { Icon: Users, t: "Calendar per specialist", d: "Orar individual, sloturi de 30 min, anti-dublă-rezervare." },
                { Icon: Star, t: "Clienți fideli", d: "Recenzii, istoric per client și reactivare automată." },
                { Icon: Smartphone, t: "Web și mobil", d: "Aceleași date, sincronizate în timp real, oriunde ești." },
                { Icon: Gift, t: "3 luni gratuite", d: "Fără comision, cu suport dedicat pentru parteneri." },
              ].map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-tile" style={tile}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={20} color={C.orange} strokeWidth={2} /></div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
                </div>
              ))}
            </div>
            {/* Instrumente AI — incluse pentru saloane */}
            <div data-reveal style={{ textAlign: "center", maxWidth: 700, margin: "50px auto 26px" }}>
              <div style={eyebrow}>INSTRUMENTE AI · INCLUSE</div>
              <h3 style={{ fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 900, letterSpacing: -0.5, color: C.text, marginTop: 10 }}>Patru asistenți AI care îți cresc afacerea</h3>
            </div>
            <div className="ch-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {[
                { Icon: MessageSquare, t: "Răspunsuri la recenzii", d: "Răspunsuri profesionale, generate automat — reputația salonului, îngrijită." },
                { Icon: Users, t: "Clienți inactivi", d: "Recâștigi clienții care nu au mai revenit, cu mesaje pregătite automat." },
                { Icon: ClipboardList, t: "Recomandări post-serviciu", d: "Sfaturi de îngrijire personalizate, trimise clientului după fiecare vizită." },
                { Icon: Sparkles, t: "Consultant AI", d: "Rapoarte de business lunare, cu recomandări concrete din datele tale reale." },
              ].map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-card" style={card}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={21} color={C.orange} strokeWidth={2} /></div>
                  <h4 style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</h4>
                  <p style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 6, lineHeight: 1.55 }}>{d}</p>
                </div>
              ))}
            </div>
            <div data-reveal style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 34 }}>
              <Link href="/cum-functioneaza#asistenti-ai" style={btnSecondary}>Vezi instrumentele AI →</Link>
              <Link href="/register" style={btnPrimary}>Înscrie-ți salonul gratuit →</Link>
            </div>
          </div>
        </section>

        {/* AVANTAJ */}
        <section style={{ padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div data-reveal style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FFFBF7 100%)", border: "1px solid #FFDCC6", borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
              <div style={eyebrow}>AVANTAJUL CALYHUB</div>
              <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 14 }}>Deținem intersecția</h2>
              <p style={{ fontSize: 17, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 16, maxWidth: "56ch", marginLeft: "auto", marginRight: "auto" }}>
                Piața e segmentată. Nimeni nu operează ambele lumi din același loc — grooming și înfrumusețare,
                pentru animale și pentru oameni. Iar acolo este poziția noastră.
              </p>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: "20px 20px 72px" }}>
          <div data-reveal style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text }}>Începe astăzi</h2>
            <p style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12 }}>Rezervă primul serviciu în câteva minute, sau înscrie-ți salonul și primești primele 3 luni gratuite.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/register" style={btnPrimary}>Caută un salon</Link>
              <Link href="/register" style={btnSecondary}>Înscrie-ți salonul →</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
      <ScrollReveal />
    </div>
  );
}
