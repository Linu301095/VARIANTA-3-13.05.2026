import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import HeroSearch from "../components/HeroSearch";
import { IconRezervare, IconCrestere, IconHub, IconIntersectie, IconPlanuri, SparkleAnim, IconDouaLumi } from "../components/SectionIcons";
import {
  PawPrint, Scissors, User, ChevronDown, Calendar, BarChart3, Users, Sparkles,
  Clock, Tag, Gift, Smartphone, Star, PlayCircle, Check, Bell,
} from "lucide-react";

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
    // fără asta, pagina pierde imaginea de share definită în layout
    images: ["/og-image.png"],
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
const tile: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22,
  padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
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

/**
 * Banda care deschide o zonă a paginii.
 *
 * Home vorbește și cu clientul, și cu proprietarul de salon. Fără un semn clar,
 * fiecare citește jumătate degeaba și nu știe unde se termină partea lui.
 * Banda spune răspicat a cui e bucata care urmează, iar cine nu se regăsește
 * poate sări direct la cealaltă.
 */
const banda = (o: { id: string; eticheta: string; titlu: string; sub: string; Icon: typeof PawPrint; sariLa: string; sariText: string }) => (
  <div id={o.id} style={{ scrollMarginTop: 86, marginBottom: 34 }}>
    <div data-reveal className="ch-banda" style={{
      display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      background: C.orangeSoft, border: "1px solid var(--pub-orange-border)",
      borderLeft: `5px solid ${C.orange}`, borderRadius: 18, padding: "16px 20px",
    }}>
      <div className="ch-banda-ic" style={{ width: 44, height: 44, borderRadius: 13, background: "var(--pub-surface)", border: "1px solid var(--pub-orange-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <o.Icon size={22} color={C.orange} strokeWidth={2} />
      </div>
      <div className="ch-banda-txt" style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.orangeText, letterSpacing: 1.6, textTransform: "uppercase" }}>{o.eticheta}</div>
        <div style={{ fontSize: 17, fontWeight: 900, color: C.text, marginTop: 2, letterSpacing: -0.3 }}>{o.titlu}</div>
        <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginTop: 3, lineHeight: 1.5 }}>{o.sub}</div>
      </div>
      <Link href={o.sariLa} className="ch-banda-btn" style={{
        fontSize: 13, fontWeight: 800, color: C.orangeText, textDecoration: "none",
        background: "var(--pub-surface)", border: "1.5px solid var(--pub-orange-border)",
        borderRadius: 50, padding: "10px 18px", whiteSpace: "nowrap",
      }}>{o.sariText}</Link>
    </div>
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
            <Link href="/register" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 6px 18px rgba(255,107,0,.32)" }}>Creează cont</Link>
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
              CalyHub conectează clienții cu cele mai bune saloane de <b style={{ color: C.text, fontWeight: 800 }}>înfrumusețare</b> și de <b style={{ color: C.text, fontWeight: 800 }}>grooming</b> din orașul lor. Găsești, compari și rezervi online în câteva minute — <b style={{ color: C.text, fontWeight: 800 }}>pentru tine dar și pentru animalul tău</b>.
            </p>

            <HeroSearch />

            <div className="ch-hero-anim" style={{ marginTop: 18, fontSize: 13.5, fontWeight: 700, animationDelay: ".64s" }}>
              <span style={{ color: C.muted }}>Ai un salon? <Link href="/register?tip=salon" style={{ color: C.orangeText, fontWeight: 800, textDecoration: "none" }}>Începe trialul gratuit →</Link></span>
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
                <div style={{ marginTop: "auto", background: C.orangeSoft, border: "1px solid var(--pub-orange-border)", borderRadius: 14, padding: "11px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.orangeText, display: "flex", alignItems: "center", gap: 6 }}><Check size={15} strokeWidth={2.6} /> Gratuit pentru clienți</div>
                  <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600, marginTop: 2 }}>Fără cost, fără card — plătești doar serviciul, la salon</div>
                </div>
                <Link href="/register?tip=client" style={btnPrimary}>Creează cont gratuit →</Link>
              </div>
              <div className="ch-card" style={{ ...card, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  {iconBox(Scissors)}
                  <div><div style={{ fontSize: 10.5, fontWeight: 800, color: C.orangeText, letterSpacing: 1.5, textTransform: "uppercase" }}>Ai un salon</div><h2 style={{ fontSize: 19, fontWeight: 900, marginTop: 2, color: C.text }}>Primește și confirmă</h2></div>
                </div>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginBottom: 16, minHeight: 63 }}>Înfrumusețare sau grooming — programări online, agendă digitală și instrumente care îți fidelizează clienții.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Programări online 24/7</b>, fără un telefon dat</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Calendar per specialist</b> și statistici reale</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>4 asistenți AI</b> care îți fidelizează clienții</>)}
                  {chk(<>Recenzii, istoric client și <b style={{ color: C.text, fontWeight: 800 }}>export Excel</b></>)}
                </div>
                <div style={{ marginTop: "auto", background: C.orangeSoft, border: "1px solid var(--pub-orange-border)", borderRadius: 14, padding: "11px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.orangeText, display: "flex", alignItems: "center", gap: 6 }}><Gift size={14} strokeWidth={2} /> Trial gratuit</div>
                  <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600, marginTop: 2 }}>Fără card · 0% comision · anulezi oricând</div>
                </div>
                <Link href="/register?tip=salon" style={btnPrimary}>Începe trialul gratuit →</Link>
              </div>
            </div>

            {/* Alegerea drumului — restul paginii e împărțită în două zone, iar
                săgeata în jos arată că duce mai jos în pagină, nu în altă parte. */}
            <div className="ch-hero-anim ch-fork" style={{ marginTop: 34, maxWidth: 720, marginLeft: "auto", marginRight: "auto", animationDelay: ".84s" }}>
              {/* Aceleași iconițe ca în zonele către care duc, ca legătura să fie evidentă. */}
              {[
                { href: "#pentru-clienti", Icon: IconRezervare, titlu: "Pentru clienți", sub: "Cauți și rezervi" },
                { href: "#pentru-saloane", Icon: IconCrestere, titlu: "Pentru saloane partenere", sub: "Primești programări" },
              ].map((o, i) => (
                <React.Fragment key={o.href}>
                  {i === 1 && <span aria-hidden className="ch-fork-sep" />}
                  <Link href={o.href} className="ch-fork-half">
                    <o.Icon size={42} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15, fontWeight: 900, color: C.text, letterSpacing: -0.2 }}>{o.titlu}</span>
                      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: C.muted, marginTop: 1 }}>{o.sub}</span>
                    </span>
                    <ChevronDown className="ch-fork-sageata" size={17} color={C.orange} strokeWidth={2.4} style={{ flexShrink: 0 }} />
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* DE CE CALYHUB */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
              <div data-reveal style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconHub size={60} /></div>
              <div data-reveal style={eyebrow}>DE CE CALYHUB</div>
              <h2 data-reveal style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 12 }}>Totul, într-un loc care lucrează pentru tine</h2>
              <p data-reveal style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12 }}>Înfrumusețare pentru tine și grooming pentru animalul tău, sub același cont. Prețuri la vedere, istoric salvat și recomandări după fiecare vizită — o experiență digitală completă.</p>
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

        {/* ══════ ZONA CLIENȚILOR ══════ */}
        <section style={{ padding: "56px 20px 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            {banda({
              id: "pentru-clienti",
              eticheta: "Zona 1 din 2 · pentru clienți",
              titlu: "De aici încolo vorbim cu tine, clientul",
              sub: "Cum cauți, cum rezervi și ce rămâne salvat în cont, după fiecare vizită.",
              Icon: User,
              sariLa: "#pentru-saloane",
              sariText: "Sari la partea saloanelor ↓",
            })}
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 34px" }}>
              <div data-reveal style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconRezervare size={60} /></div>
              <div data-reveal style={eyebrow}>PENTRU CLIENȚI</div>
              <h2 data-reveal style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 12 }}>Găsești, rezervi, revii — fără bătăi de cap</h2>
              <p data-reveal style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12 }}>
                Contul e unul singur, al tău. Animalul e opțional — îl adaugi când vrei, sau niciodată.
                Ce vezi în aplicație depinde de asta:
              </p>
            </div>

            {/* Cele două feluri de cont de client — regula din dashboard, spusă pe față. */}
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div data-reveal className="ch-card" style={{ ...card, padding: 28 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 800, color: C.orangeText, background: C.orangeSoft, padding: "6px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 0.5 }}><User size={14} strokeWidth={2.2} /> Cont fără animal</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>Saloane de înfrumusețare</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8, marginBottom: 16 }}>Frizerie, coafor, manichiură și cosmetică. Nu ai nevoie de un animal ca să rezervi.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Frizerii, coafor, manichiură, cosmetică</b> din orașul tău</>)}
                  {chk(<>Rezervi cu <b style={{ color: C.text, fontWeight: 800 }}>specialistul preferat</b> și ora aleasă</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Preț pe serviciu</b>, afișat înainte de rezervare</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Tot istoricul serviciilor</b>, într-un singur cont</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Reminder pe WhatsApp sau SMS</b>, cu 24 de ore înainte</>)}
                </div>
              </div>

              <div data-reveal className="ch-card" style={{ ...card, padding: 28 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 800, color: C.orangeText, background: C.orangeSoft, padding: "6px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 0.5 }}><PawPrint size={14} strokeWidth={2} /> Cont cu animal</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>Înfrumusețare și grooming</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8, marginBottom: 16 }}>Adaugi un animal în cont și primești ambele lumi, cu un comutator între ele.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {chk(<>Comutator <b style={{ color: C.text, fontWeight: 800 }}>„Pentru tine" / „Pentru animalul tău"</b></>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Saloane de grooming</b>, cu preț exact pe talia animalului</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Profil animal</b> cu rasă, talie și istoricul vizitelor</>)}
                  {chk(<>Vezi <b style={{ color: C.text, fontWeight: 800 }}>cu ce animale lucrează</b> fiecare salon</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Recomandări de îngrijire</b> după fiecare tuns</>)}
                </div>
              </div>
            </div>

            <div data-reveal style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: C.muted, fontWeight: 600 }}>
              Nu trebuie să alegi acum. Începi fără animal și îl adaugi oricând din contul tău.
            </div>
            <div data-reveal style={{ textAlign: "center", marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register?tip=client" style={btnPrimary}>Creează cont gratuit →</Link>
              <Link href="/cum-functioneaza#clienti" style={btnSecondary}><PlayCircle size={17} color={C.orange} strokeWidth={2} /> Vezi cum funcționează →</Link>
            </div>
            {/* Capătul zonei clienților — cine a citit destul poate opri aici. */}
            <div data-reveal style={{ textAlign: "center", marginTop: 26, fontSize: 13.5, color: C.dim, fontWeight: 700 }}>
              Aici se termină partea clienților. <Link href="#pentru-saloane" style={{ color: C.orangeText, fontWeight: 800, textDecoration: "none" }}>Ai un salon? Sari la partea ta ↓</Link>
            </div>
          </div>
        </section>

        {/* ══════ ZONA SALOANELOR ══════ */}
        <section style={{ background: C.surface2, padding: "56px 20px 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            {banda({
              id: "pentru-saloane",
              eticheta: "Zona 2 din 2 · pentru saloane",
              titlu: "De aici încolo vorbim cu tine, partenerul",
              sub: "Agendă, statistici, asistenți AI și prețuri — pentru salon de înfrumusețare sau de grooming.",
              Icon: Scissors,
              sariLa: "#pentru-clienti",
              sariText: "Urcă la partea clienților ↑",
            })}
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 38px" }}>
              <div data-reveal style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconCrestere size={60} /></div>
              <div data-reveal style={eyebrow}>PENTRU SALOANE · PARTENERI</div>
              <h2 data-reveal style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 12 }}>Transformă-ți salonul într-o afacere digitală</h2>
              <p data-reveal style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12 }}>
                Alegi verticala la înregistrare, iar aplicația se potrivește singură — denumirile echipei,
                felul în care pui prețul și rapoartele vorbesc limba salonului tău.
              </p>
            </div>

            {/* Cele două verticale — un salon alege una, iar restul aplicației se adaptează. */}
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 34 }}>
              <div data-reveal className="ch-card" style={{ ...card, padding: 28 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 800, color: C.orangeText, background: C.orangeSoft, padding: "6px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 0.5 }}><Scissors size={14} strokeWidth={2} /> Salon de înfrumusețare</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>Frizerie, coafor, unghii, cosmetică</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8, marginBottom: 16 }}>Aplicația vorbește despre specialiști și servicii, fără nimic legat de animale.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Preț și durată pe serviciu</b>, simplu de întreținut</>)}
                  {chk(<>Echipă de <b style={{ color: C.text, fontWeight: 800 }}>specialiști</b>, fiecare cu orarul lui</>)}
                  {chk(<>Clientul <b style={{ color: C.text, fontWeight: 800 }}>își alege specialistul</b> la rezervare</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Agenți AI</b> incluși, indiferent de plan</>)}
                  {chk(<>Rapoarte pe servicii, ore de vârf și clienți fideli</>)}
                </div>
              </div>

              <div data-reveal className="ch-card" style={{ ...card, padding: 28 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 800, color: C.orangeText, background: C.orangeSoft, padding: "6px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 0.5 }}><PawPrint size={14} strokeWidth={2} /> Salon de grooming</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>Tuns, îmbăiere, îngrijire animale</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8, marginBottom: 16 }}>Aplicația știe de talii, specii și fișe de îngrijire — lucruri care la înfrumusețare nu apar.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Preț și durată pe talie</b> — mică, medie, mare</>)}
                  {chk(<>Echipă de <b style={{ color: C.text, fontWeight: 800 }}>groomeri</b>, fiecare cu orarul lui</>)}
                  {chk(<>Alegi <b style={{ color: C.text, fontWeight: 800 }}>cu ce specii lucrezi</b>, iar clientul vede asta</>)}
                  {chk(<><b style={{ color: C.text, fontWeight: 800 }}>Agenți AI</b> incluși, indiferent de plan</>)}
                  {chk(<>Istoric per animal, cu rasă, talie și alergii</>)}
                </div>
              </div>
            </div>

            <div data-reveal style={{ textAlign: "center", fontSize: 13.5, fontWeight: 800, color: C.text2, marginBottom: 20 }}>
              Restul e la fel, indiferent ce alegi:
            </div>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { Icon: Calendar, t: "Agendă mereu plină", d: "Programări online 24/7, fără un telefon dat." },
                { Icon: BarChart3, t: "Statistici reale", d: "Încasări, top servicii, productivitate, export Excel." },
                { Icon: Users, t: "Calendar per specialist", d: "Orar individual, sloturi de 30 min, anti-dublă-rezervare." },
                { Icon: Star, t: "Clienți fideli", d: "Recenzii, istoric per client și reactivare automată." },
                { Icon: Smartphone, t: "Web și mobil", d: "Aceleași date, sincronizate în timp real, oriunde ești." },
                { Icon: Bell, t: "Remindere automate", d: "Trimise pe WhatsApp și SMS, fără efort din partea ta. Cea mai simplă metodă de a reduce neprezentările." },
              ].map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-tile" style={tile}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={20} color={C.orange} strokeWidth={2} /></div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
                </div>
              ))}
            </div>
            <div data-reveal style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/cum-functioneaza#parteneri" style={btnSecondary}><PlayCircle size={17} color={C.orange} strokeWidth={2} /> Vezi cum funcționează pentru saloane →</Link>
            </div>
            {/* Instrumente AI — teaser compact */}
            <div data-reveal style={{ textAlign: "center", maxWidth: 660, margin: "48px auto 0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><SparkleAnim size={44} glow /></div>
              <div style={eyebrow}><Sparkles size={13} strokeWidth={2.4} /> INSTRUMENTE AI</div>
              <h3 style={{ fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 900, letterSpacing: -0.5, color: C.text, marginTop: 12 }}>Patru asistenți AI care îți cresc afacerea</h3>
              <p style={{ fontSize: 15.5, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12 }}>
                Inteligență integrată direct în salonul tău: răspunde la recenzii, îți aduce înapoi clienții care nu au mai
                revenit, trimite recomandări de îngrijire după fiecare vizită și îți livrează rapoarte de business din
                datele tale reale. Fără setări, fără costuri suplimentare.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
                <Link href="/instrumente-ai" style={btnPrimary}><Sparkles size={16} strokeWidth={2.4} /> Descoperă instrumentele AI →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* PLANURI */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
              <div data-reveal style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconPlanuri size={60} /></div>
              <div data-reveal style={eyebrow}>PLANURI · TOT PARTEA SALOANELOR</div>
              <h2 data-reveal style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 900, letterSpacing: -0.8, color: C.text, marginTop: 12 }}>Acces complet la platformă, de la primul plan</h2>
              <p data-reveal style={{ fontSize: 16.5, color: C.muted, fontWeight: 500, lineHeight: 1.75, marginTop: 14 }}>
                Fiecare plan include agenda digitală, programările online și agenții AI. Diferența e mărimea echipei
                și instrumentele avansate — nu accesul la esențial.
              </p>
              <div data-reveal style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
                {["Programări nelimitate", "0% comision", "Anulezi oricând", "Asistenți AI incluși"].map((t) => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--pub-surface)", border: `1px solid ${C.line}`, borderRadius: 50, padding: "9px 16px", fontSize: 13, fontWeight: 800, color: C.text }}>
                    <Check size={15} color={C.orange} strokeWidth={2.8} /> {t}
                  </span>
                ))}
              </div>
              <div data-reveal style={{ marginTop: 30 }}>
                <Link href="/preturi" style={btnPrimary}>Vezi planurile →</Link>
              </div>
              {/* Capătul zonei saloanelor — ce urmează e din nou pentru amândoi. */}
              <div data-reveal style={{ marginTop: 26, fontSize: 13.5, color: C.dim, fontWeight: 700 }}>
                Aici se termină partea saloanelor. Ce urmează e din nou pentru amândoi.
              </div>
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
                <Link href="/register?tip=client" style={btnPrimary}>Creează cont gratuit</Link>
                <Link href="/register?tip=salon" style={btnSecondary}>Înscrie-ți salonul →</Link>
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
