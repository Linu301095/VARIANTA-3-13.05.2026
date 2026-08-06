import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import {
  Heart, Star, Users, Lock, Sparkles, Scissors, PawPrint, Clock, Tag,
  ShieldCheck, Smartphone, Check, type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Despre noi — Povestea CalyHub",
  description:
    "CalyHub aduce programările de îngrijire într-un singur loc: saloane de înfrumusețare pentru oameni și saloane de grooming pentru animale. Povestea, misiunea și valorile noastre.",
  keywords: ["despre CalyHub", "platforma programari", "saloane infrumusetare", "saloane grooming", "misiune CalyHub"],
  alternates: { canonical: "/despre-noi" },
  openGraph: {
    title: "Despre noi — Povestea CalyHub",
    description: "Un singur loc pentru toate programările de îngrijire — pentru tine și pentru animalul tău.",
    url: "/despre-noi",
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
const h2s: React.CSSProperties = { fontSize: "clamp(24px,3.2vw,34px)", fontWeight: 900, letterSpacing: -0.6, color: C.text };
const lead: React.CSSProperties = { fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7 };
const para: React.CSSProperties = { fontSize: 16, color: C.text2, lineHeight: 1.85 };

const VALORI: { Icon: LucideIcon; t: string; d: string }[] = [
  { Icon: Tag, t: "Transparență totală", d: "Prețuri afișate înainte de rezervare, fără comisioane ascunse și fără costuri surpriză — nici pentru clienți, nici pentru saloane." },
  { Icon: Heart, t: "Grijă, nu doar programări", d: "O programare e doar începutul. Istoric salvat, recomandări după fiecare vizită și relații care se construiesc în timp." },
  { Icon: Users, t: "Parteneriat real cu saloanele", d: "Saloanele nu sunt simpli furnizori — sunt partenerii noștri. Le dăm uneltele digitale ca să crească, nu doar un loc de listare." },
  { Icon: Star, t: "Standarde înalte", d: "Recenzii verificate, profiluri complete și saloane care lucrează digital. Ridicăm ștacheta pentru toată industria." },
  { Icon: Sparkles, t: "Tehnologie care ajută", d: "AI-ul nostru nu e un moft de marketing: economisește timp real saloanelor și aduce valoare concretă clienților." },
  { Icon: Lock, t: "Datele tale, protejate", d: "Datele clienților și ale saloanelor sunt tratate cu maximă seriozitate, conform legislației în vigoare." },
];

const CIFRE = [
  { val: "2", label: "Domenii · înfrumusețare & grooming" },
  { val: "24/7", label: "Programări online" },
  { val: "4", label: "Asistenți AI pentru saloane" },
  { val: "0%", label: "Comision pe programări" },
];

export default function DespreNoi() {
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
        <section style={{ position: "relative", overflow: "hidden", padding: "76px 20px 50px" }}>
          <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(255,107,0,.20)", top: -120, left: "14%" }} />
          <div className="ch-orb b" style={{ width: 300, height: 300, background: "rgba(255,140,66,.16)", top: 10, right: "10%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 20, animationDelay: ".05s" }}>Despre noi</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: -1.5, color: C.text, animationDelay: ".15s" }}>
              Construim locul unde<br /><span style={{ color: C.orange }}>îngrijirea începe</span>.
            </h1>
            <p className="ch-hero-anim" style={{ margin: "20px auto 0", maxWidth: "58ch", fontSize: 18, lineHeight: 1.7, fontWeight: 500, color: C.muted, animationDelay: ".28s" }}>
              CalyHub aduce într-o singură platformă tot ce ține de îngrijire — saloane de înfrumusețare pentru tine
              și saloane de grooming pentru animalul tău. Simplu pentru clienți, profitabil pentru saloane.
            </p>
          </div>
        </section>

        {/* CIFRE */}
        <section style={{ padding: "0 20px 56px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div className="ch-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {CIFRE.map((c) => (
                <div key={c.label} data-reveal className="ch-tile" style={{ ...tile, textAlign: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: C.orange, letterSpacing: -1 }}>{c.val}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 700, marginTop: 6, lineHeight: 1.45 }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POVESTEA */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div data-reveal style={eyebrow}>De unde am pornit</div>
            <h2 data-reveal style={{ ...h2s, marginTop: 14, marginBottom: 26 }}>O idee care a stat la copt ani buni</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p data-reveal style={{ fontSize: 17.5, color: C.text, lineHeight: 1.8, fontWeight: 700 }}>
                Totul a pornit de la o observație simplă: îngrijirea — a ta sau a animalului tău — nu ar trebui să înceapă
                niciodată cu un telefon dat în gol.
              </p>

              <p data-reveal style={para}>
                De ani buni ne gândim la o platformă care să schimbe în bine felul în care se fac programările în România.
                Nu încă un canal de comunicare, nu încă o listă de firme — ci o <strong style={{ color: C.orangeText }}>soluție reală</strong>,
                pe care și clientul, și salonul profesionist și-ar dori-o.
              </p>

              <p data-reveal style={para}>
                Am observat aceeași problemă peste tot, indiferent de domeniu. Saloane bune, ascunse pe străzi lăturalnice,
                fără vizibilitate. Clienți care sună la cinci locuri până găsesc o oră liberă. Prețuri pe care le afli abia
                la final. Agende de hârtie, programări pierdute și ore întregi consumate la telefon în loc de lucru efectiv.
              </p>

              <div data-reveal style={{ background: C.orangeSoft, borderLeft: `4px solid ${C.orange}`, padding: "22px 26px", borderRadius: "0 20px 20px 0", margin: "6px 0" }}>
                <p style={{ fontSize: 17, color: C.text, lineHeight: 1.8, fontWeight: 700, fontStyle: "italic" }}>
                  Îngrijirea bună nu ar trebui să fie complicată. Nici pentru tine, nici pentru animalul tău.
                </p>
              </div>

              <p data-reveal style={para}>
                Am început cu grooming-ul, pentru că acolo lipsa de organizare era cea mai evidentă și pentru că iubim animalele.
                Dar aceeași problemă o are și frizerul de la colț, și salonul de coafură din centru. Așa că am construit
                platforma pentru <strong style={{ color: C.orangeText }}>amândouă lumile</strong>: îngrijire pentru oameni și
                pentru animale, într-un singur loc, sub același cont.
              </p>

              <p data-reveal style={para}>
                Asta e CalyHub astăzi: o platformă care conectează clienții cu saloanele potrivite, ajută profesioniștii să
                crească cu instrumente digitale reale și ridică ștacheta întregii industrii. Drumul abia începe — și e loc
                pentru toți cei care vor să facă parte din el.
              </p>
            </div>
          </div>
        </section>

        {/* MISIUNE — cele doua lumi */}
        <section style={{ padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
              <div>
                <div data-reveal style={eyebrow}>Misiunea noastră</div>
                <h2 data-reveal style={{ ...h2s, marginTop: 14 }}>Un singur loc pentru toată îngrijirea</h2>
                <p data-reveal style={{ ...lead, marginTop: 14 }}>
                  Când vrei o tunsoare sau vrei să duci animalul la grooming, totul ar trebui să fie simplu: cauți,
                  vezi prețul, alegi ora și rezervi. Fără apeluri în timpul programului, fără mesaje fără răspuns,
                  fără surprize la plată.
                </p>
                <p data-reveal style={{ ...lead, marginTop: 12 }}>
                  De partea cealaltă, saloanele primesc o agendă digitală care lucrează pentru ele — și instrumente AI
                  care le țin clienții aproape, fără efort suplimentar.
                </p>
              </div>
              <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div data-reveal className="ch-card" style={{ ...card, padding: 24 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Scissors size={23} color={C.orange} strokeWidth={2} /></div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: C.text }}>Pentru tine</h3>
                  <p style={{ fontSize: 13, color: C.muted, fontWeight: 600, lineHeight: 1.55, marginTop: 6 }}>Frizerie, coafor, manichiură, cosmetică — rezervi online, cu specialistul preferat.</p>
                </div>
                <div data-reveal className="ch-card" style={{ ...card, padding: 24 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><PawPrint size={23} color={C.orange} strokeWidth={2} /></div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: C.text }}>Pentru animalul tău</h3>
                  <p style={{ fontSize: 13, color: C.muted, fontWeight: 600, lineHeight: 1.55, marginTop: 6 }}>Grooming cu profil salvat, preț pe talie și recomandări după fiecare vizită.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALORI */}
        <section style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 38px" }}>
              <div data-reveal style={eyebrow}>Valorile noastre</div>
              <h2 data-reveal style={{ ...h2s, marginTop: 12 }}>În ce credem</h2>
              <p data-reveal style={{ ...lead, marginTop: 12 }}>Principiile după care luăm fiecare decizie de produs — de la felul în care afișăm un preț, până la modul în care lucrăm cu saloanele partenere.</p>
            </div>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {VALORI.map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-card" style={{ ...card, padding: 26 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Icon size={23} color={C.orange} strokeWidth={2} /></div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: C.text }}>{t}</h3>
                  <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.6, marginTop: 8 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CE NE FACE DIFERITI */}
        <section style={{ padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 38px" }}>
              <div data-reveal style={eyebrow}>Ce ne face diferiți</div>
              <h2 data-reveal style={{ ...h2s, marginTop: 12 }}>Deținem intersecția</h2>
              <p data-reveal style={{ ...lead, marginTop: 12 }}>
                Piața e segmentată: unii fac programări pentru oameni, alții pentru animale. Nimeni nu le face pe amândouă
                din același loc. Noi, da — și asta schimbă complet experiența unei familii.
              </p>
            </div>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { Icon: Sparkles, t: "Ambele lumi, un singur cont", d: "Programarea ta la coafor și a animalului la grooming, din același loc." },
                { Icon: Clock, t: "Istoric care nu se pierde", d: "Fiecare vizită rămâne salvată — pentru tine și pentru salon." },
                { Icon: ShieldCheck, t: "Construit în România", d: "Gândit pentru piața locală, cu prețuri și obiceiuri de aici." },
                { Icon: Smartphone, t: "Web și mobil", d: "Aceleași funcții, sincronizate în timp real, pe orice dispozitiv." },
                { Icon: Users, t: "Saloane, nu doar listări", d: "Panou complet de management, nu un simplu profil de prezentare." },
                { Icon: Check, t: "Gratuit pentru clienți", d: "Fără abonament și fără card — plătești doar serviciul, la salon." },
              ].map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-tile" style={tile}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={20} color={C.orange} strokeWidth={2} /></div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "0 20px 76px" }}>
          <div data-reveal style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg, var(--pub-orange-soft) 0%, var(--pub-tint) 100%)", border: "1px solid var(--pub-orange-border)", borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
              <h2 style={{ ...h2s, fontSize: "clamp(24px,3.2vw,36px)" }}>Hai să construim împreună</h2>
              <p style={{ ...lead, marginTop: 12, maxWidth: "54ch", marginLeft: "auto", marginRight: "auto" }}>
                Ești client și vrei să rezervi mai simplu, sau ai un salon și vrei o agendă care lucrează pentru tine?
                În ambele cazuri, începi în câteva minute.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                <Link href="/register" style={btnPrimary}>Creează cont gratuit</Link>
                <Link href="/cum-functioneaza" style={btnSecondary}>Vezi cum funcționează →</Link>
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
