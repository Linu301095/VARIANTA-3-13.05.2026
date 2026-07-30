import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";
import ResetTheme from "../../components/ResetTheme";
import ScrollReveal from "../../components/ScrollReveal";
import { IconClienti, IconFoarfeca } from "../../components/SectionIcons";
import {
  PawPrint, Scissors, Search, Calendar, Bell, Store, SlidersHorizontal, BarChart3,
  Sparkles, Check, Tag, Clock, Star, Users, Smartphone, Gift, ShieldCheck, CreditCard,
  HelpCircle, ClipboardList, MessageSquare, type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cum funcționează CalyHub — Ghid complet pentru clienți și saloane",
  description:
    "Ghidul complet CalyHub: cum găsești și rezervi la saloane de înfrumusețare și de grooming, cum îți înregistrezi salonul, cum funcționează agenda digitală, asistenții AI și întrebările frecvente.",
  keywords: ["cum functioneaza CalyHub", "programare online salon", "ghid rezervare", "inregistrare salon", "agenda digitala salon"],
  alternates: { canonical: "/cum-functioneaza" },
  openGraph: {
    title: "Cum funcționează CalyHub — Ghid complet",
    description: "De la căutare la rezervare pentru clienți, de la înregistrare la programări pentru saloane — înfrumusețare și grooming, într-o singură platformă.",
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
const card: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 28, padding: 26,
  boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
};
const tile: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22, padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
};
const h2: React.CSSProperties = { fontSize: "clamp(24px,3.2vw,34px)", fontWeight: 900, letterSpacing: -0.6, color: C.text };
const lead: React.CSSProperties = { fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7 };

type Step = { nr: string; Icon: LucideIcon; t: string; d: string; puncte: string[] };

const PASI_CLIENT: Step[] = [
  {
    nr: "01", Icon: Search, t: "Caută salonul potrivit",
    d: "Alegi lumea — înfrumusețare pentru tine sau grooming pentru animalul tău — și cauți în orașul tău.",
    puncte: ["Filtre pe oraș, serviciu și rating", "Prețuri afișate înainte de rezervare", "Galerie foto, echipă și program"],
  },
  {
    nr: "02", Icon: Calendar, t: "Alege ora și specialistul",
    d: "Vezi disponibilitatea în timp real și alegi slotul care ți se potrivește, cu specialistul preferat.",
    puncte: ["Sloturi libere, actualizate live", "Alegi specialistul care îți place", "Adaugi o observație pentru salon"],
  },
  {
    nr: "03", Icon: Bell, t: "Primești confirmarea",
    d: "Salonul confirmă direct în aplicație, iar tu primești notificare. După vizită, lași o recenzie.",
    puncte: ["Confirmare în aplicație, fără telefoane", "Istoric salvat automat", "Recomandări de îngrijire după vizită"],
  },
];

const PASI_SALON: Step[] = [
  {
    nr: "01", Icon: Store, t: "Îți înregistrezi salonul",
    d: "Alegi tipul salonului — înfrumusețare sau grooming — și îți construiești profilul public în câteva minute.",
    puncte: ["Date firmă, descriere și galerie foto", "Servicii cu prețuri și durate", "Echipa, cu specialiștii tăi"],
  },
  {
    nr: "02", Icon: SlidersHorizontal, t: "Configurezi agenda",
    d: "Stabilești orarul fiecărui specialist și controlezi complet disponibilitatea, inclusiv pauzele.",
    puncte: ["Orar individual per specialist", "Sloturi de 30 de minute", "Blocări manuale: telefonic, walk-in, pauze"],
  },
  {
    nr: "03", Icon: BarChart3, t: "Primești programări și crești",
    d: "Confirmi cu un click, urmărești cifrele reale ale salonului și lași asistenții AI să-ți fidelizeze clienții.",
    puncte: ["Confirmare sau refuz dintr-un click", "Statistici și export Excel", "4 asistenți AI incluși"],
  },
];

function Steps({ pasi }: { pasi: Step[] }) {
  return (
    <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
      {pasi.map((s) => (
        <div key={s.nr} data-reveal className="step-card" style={{ position: "relative", overflow: "hidden", ...card, borderRadius: 24, padding: 28 }}>
          <div className="step-num" style={{ position: "absolute", top: 16, right: 22, fontSize: 46, fontWeight: 900, color: C.orangeSoft, lineHeight: 1 }}>{s.nr}</div>
          <div className="step-icon" style={{ width: 52, height: 52, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><s.Icon size={26} color={C.orange} strokeWidth={2} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginBottom: 8 }}>{s.t}</h3>
          <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.65, marginBottom: 14 }}>{s.d}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
            {s.puncte.map((p) => (
              <div key={p} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <Check size={15} color={C.orange} strokeWidth={2.6} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, lineHeight: 1.45 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const FAQ: { q: string; a: string }[] = [
  { q: "Cât costă pentru clienți?", a: "Nimic. Contul și rezervările sunt gratuite — plătești doar serviciul, direct la salon." },
  { q: "Am nevoie de cont ca să rezerv?", a: "Poți căuta și vedea saloane fără cont. Pentru a finaliza o rezervare ai nevoie de un cont gratuit, ca salonul să te poată contacta și confirma." },
  { q: "Pot rezerva și pentru mine, și pentru animalul meu?", a: "Da. Un singur cont acoperă ambele lumi: comuți între înfrumusețare pentru tine și grooming pentru animalul tău, oricând." },
  { q: "Cum îmi anulez o programare?", a: "Din contul tău, la secțiunea Programări. Salonul e notificat automat — fără telefoane și fără discuții." },
  { q: "Cât costă pentru saloane?", a: "Primele 3 luni sunt gratuite, fără card și fără comision. Apoi alegi planul potrivit dimensiunii salonului." },
  { q: "Pot folosi platforma de pe telefon?", a: "Da. Aceleași funcții pe web și pe telefon, cu datele sincronizate în timp real." },
];

export default function CumFunctioneaza() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <ResetTheme />

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,250,.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, height: 70 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={54} style={{ height: 54, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav className="hdr-nav" style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/login" className="hdr-btn" style={{ fontSize: 14, fontWeight: 700, color: C.muted, textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 6px 18px rgba(255,107,0,.32)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* HERO */}
        <section style={{ position: "relative", overflow: "hidden", padding: "76px 20px 44px" }}>
          <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(255,107,0,.20)", top: -120, left: "14%" }} />
          <div className="ch-orb b" style={{ width: 300, height: 300, background: "rgba(255,140,66,.16)", top: 10, right: "10%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 20, animationDelay: ".05s" }}>GHIDUL CALYHUB</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: -1.5, color: C.text, animationDelay: ".15s" }}>
              Simplu pentru clienți.<br /><span style={{ color: C.orange }}>Profitabil pentru saloane.</span>
            </h1>
            <p className="ch-hero-anim" style={{ margin: "20px auto 0", maxWidth: "58ch", fontSize: 18, lineHeight: 1.7, fontWeight: 500, color: C.muted, animationDelay: ".28s" }}>
              Înfrumusețare pentru oameni și grooming pentru animale, într-o singură platformă. Aici găsești pas cu pas
              cum funcționează — de la prima căutare până la agenda plină a salonului.
            </p>
          </div>
        </section>

        {/* ============ PENTRU CLIENTI ============ */}
        <section id="clienti" style={{ padding: "44px 20px 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 34px" }}>
              <div data-reveal style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconClienti size={64} /></div>
              <div data-reveal style={eyebrow}>Pentru clienți</div>
              <h2 data-reveal style={{ ...h2, marginTop: 12 }}>Găsești și rezervi în 3 pași</h2>
              <p data-reveal style={{ ...lead, marginTop: 12 }}>Pentru tine sau pentru animalul tău — aceeași experiență simplă, de la căutare până la confirmare.</p>
            </div>
            <Steps pasi={PASI_CLIENT} />

            {/* cele doua lumi */}
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 34 }}>
              <div data-reveal className="ch-card" style={{ ...card, padding: 28 }}>
                <span style={{ ...eyebrow, fontSize: 11 }}><Scissors size={13} strokeWidth={2.2} /> Pentru tine</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>Înfrumusețare</h3>
                <p style={{ ...lead, fontSize: 13.5, fontWeight: 600, marginTop: 8, marginBottom: 14 }}>Frizerie, coafor, manichiură, cosmetică — rezervi pentru tine, cu specialistul preferat.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Rezervi doar pentru tine, fără pași în plus", "Preț fix pe serviciu, afișat din start", "Istoricul serviciilor tale, mereu la îndemână"].map((x) => (
                    <div key={x} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><Check size={17} color={C.orange} strokeWidth={2.6} style={{ marginTop: 1, flexShrink: 0 }} /><span style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.5 }}>{x}</span></div>
                  ))}
                </div>
              </div>
              <div data-reveal className="ch-card" style={{ ...card, padding: 28 }}>
                <span style={{ ...eyebrow, fontSize: 11 }}><PawPrint size={13} strokeWidth={2.2} /> Pentru animalul tău</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginTop: 14 }}>Grooming</h3>
                <p style={{ ...lead, fontSize: 13.5, fontWeight: 600, marginTop: 8, marginBottom: 14 }}>Tuns, îmbăiere, deghajare — cu profilul animalului salvat și prețul potrivit taliei lui.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Profil animal: rasă, talie, alergii, poză", "Preț exact pe talia animalului tău", "Recomandări de îngrijire după fiecare tuns"].map((x) => (
                    <div key={x} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><Check size={17} color={C.orange} strokeWidth={2.6} style={{ marginTop: 1, flexShrink: 0 }} /><span style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, lineHeight: 1.5 }}>{x}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* ce primesti ca client */}
            <div data-reveal style={{ ...eyebrow, marginTop: 44, marginBottom: 16 }}>Ce primești în contul tău</div>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { Icon: Tag, t: "Prețuri la vedere", d: "Vezi cât plătești înainte să rezervi, fără surprize la final." },
                { Icon: Clock, t: "Istoric complet", d: "Toate vizitele tale și ale animalului, într-un singur loc." },
                { Icon: Bell, t: "Notificări în aplicație", d: "Confirmare, reamintiri și mesaje de la salon, fără telefoane." },
                { Icon: Star, t: "Recenzii verificate", d: "Alegi în siguranță, pe baza experienței altor clienți." },
                { Icon: Sparkles, t: "Recomandări după vizită", d: "Sfaturi de îngrijire personalizate, trimise de salon." },
                { Icon: Smartphone, t: "Web și mobil", d: "Rezervi de pe laptop, continui de pe telefon — aceleași date." },
              ].map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-tile" style={tile}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={20} color={C.orange} strokeWidth={2} /></div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
                </div>
              ))}
            </div>

            <div data-reveal style={{ marginTop: 26, background: C.orangeSoft, border: "1px solid #FFDCC6", borderRadius: 20, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Gift size={18} color={C.orange} strokeWidth={2.4} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, color: C.text, fontWeight: 700 }}>Contul e <b>gratuit</b> pentru clienți — fără card, fără abonament. Plătești doar serviciul, direct la salon.</span>
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/register" style={btnPrimary}>Creează cont gratuit →</Link>
            </div>
          </div>
        </section>

        {/* ============ PENTRU PARTENERI ============ */}
        <section id="parteneri" style={{ background: C.surface2, padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 34px" }}>
              <div data-reveal style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconFoarfeca size={64} /></div>
              <div data-reveal style={eyebrow}>Pentru saloane · parteneri</div>
              <h2 data-reveal style={{ ...h2, marginTop: 12 }}>Ești live în 3 pași</h2>
              <p data-reveal style={{ ...lead, marginTop: 12 }}>Salon de înfrumusețare sau de grooming — îți creezi profilul, îți configurezi agenda și începi să primești programări.</p>
            </div>
            <Steps pasi={PASI_SALON} />

            {/* ce primesti ca salon */}
            <div data-reveal style={{ ...eyebrow, marginTop: 44, marginBottom: 16 }}>Ce primești în panoul salonului</div>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { Icon: Calendar, t: "Agendă digitală", d: "Programări online 24/7, calendar per specialist, anti-dublă-rezervare." },
                { Icon: BarChart3, t: "Statistici reale", d: "Încasări, top servicii, productivitate per specialist, export Excel." },
                { Icon: Users, t: "Echipa ta", d: "Specialiști cu orar individual, servicii proprii și performanță vizibilă." },
                { Icon: ClipboardList, t: "Dosar per client", d: "Istoricul fiecărui client și al fiecărui animal, la un click distanță." },
                { Icon: MessageSquare, t: "Recenzii și rating", d: "Rating agregat pe profilul public, cu răspunsuri generate de AI." },
                { Icon: ShieldCheck, t: "Control total", d: "Blocări manuale, confirmare/refuz și protecție împotriva no-show." },
              ].map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-tile" style={tile}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={20} color={C.orange} strokeWidth={2} /></div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
                </div>
              ))}
            </div>

            {/* AI teaser */}
            <div data-reveal className="ch-card" style={{ marginTop: 26, ...card, borderRadius: 24, padding: "24px 26px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Sparkles size={24} color={C.orange} strokeWidth={2} /></div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: C.text }}>Patru asistenți AI, incluși</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, marginTop: 3, lineHeight: 1.5 }}>Răspunsuri la recenzii, reactivarea clienților inactivi, recomandări post-serviciu și consultant de business.</p>
              </div>
              <Link href="/instrumente-ai" style={btnSecondary}>Vezi instrumentele AI →</Link>
            </div>

            {/* ce te costa */}
            <div data-reveal className="ch-card" style={{ marginTop: 16, ...card, borderRadius: 24, padding: "24px 26px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CreditCard size={24} color={C.orange} strokeWidth={2} /></div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: C.text }}>Primele 3 luni, gratuite</h3>
                <p style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, marginTop: 3, lineHeight: 1.5 }}>Fără card la înscriere, 0% comision pe programări, anulezi oricând. Apoi alegi planul potrivit salonului tău.</p>
              </div>
              <Link href="/preturi" style={btnSecondary}>Vezi planurile →</Link>
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/register" style={btnPrimary}>Înregistrează salonul gratuit →</Link>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="intrebari" style={{ padding: "64px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 34px" }}>
              <div data-reveal style={eyebrow}><HelpCircle size={13} strokeWidth={2.4} /> Întrebări frecvente</div>
              <h2 data-reveal style={{ ...h2, marginTop: 12 }}>Ce întreabă lumea cel mai des</h2>
            </div>
            <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {FAQ.map(({ q, a }) => (
                <div key={q} data-reveal className="ch-tile" style={tile}>
                  <div style={{ fontSize: 15.5, fontWeight: 900, color: C.text }}>{q}</div>
                  <div style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, marginTop: 7, lineHeight: 1.6 }}>{a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: "0 20px 72px" }}>
          <div data-reveal style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FFFBF7 100%)", border: "1px solid #FFDCC6", borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
              <h2 style={{ ...h2, fontSize: "clamp(24px,3.2vw,36px)" }}>Gata să începi?</h2>
              <p style={{ ...lead, marginTop: 12, maxWidth: "52ch", marginLeft: "auto", marginRight: "auto" }}>
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
