import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import { Building2, ClipboardList, Target, Clock, Users, Scale, Cookie, Lock, FileText, CheckCircle2, ShieldCheck, type LucideIcon } from "lucide-react";

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

export const metadata: Metadata = {
  title: "Politica de confidențialitate — CalyHub",
  description:
    "Cum colectăm, folosim și protejăm datele tale personale conform GDPR. Politica de confidențialitate a platformei CalyHub.",
  alternates: { canonical: "/confidentialitate" },
  robots: { index: true, follow: true },
};

const SECTIUNI: { titlu: string; Icon: LucideIcon; continut: string }[] = [
  {
    titlu: "Cine suntem",
    Icon: Building2,
    continut: `CalyHub SRL este operatorul platformei CalyHub și, în sensul Regulamentului (UE) 2016/679 (GDPR), are calitatea de operator de date cu caracter personal.

Contact DPO (Responsabil cu Protecția Datelor): privacy@calyhub.ro`,
  },
  {
    titlu: "Ce date colectăm",
    Icon: ClipboardList,
    continut: `Date furnizate de tine la înregistrare:
• Nume și prenume
• Adresă de email
• Număr de telefon (folosit de salon pentru a te contacta în legătură cu programarea)
• Parola (gestionată securizat prin Supabase Auth — nu o vedem și nu o stocăm în clar)

Date despre animalul de companie (doar pentru conturi Client):
• Numele, rasa, vârsta, greutatea și alergiile animăluțului
• Fotografii (dacă le încarci)

Date despre salon (doar pentru conturi Salon):
• Denumire firmă, CUI, adresă, telefon public
• Descriere servicii și prețuri
• Fotografii portofoliu

Date colectate automat:
• Adresa IP (anonimizată după 30 zile)
• Tipul de browser și dispozitiv
• Paginile vizitate și durata sesiunii (prin cookie-uri de analiză)`,
  },
  {
    titlu: "De ce colectăm aceste date",
    Icon: Target,
    continut: `Baza legală pentru prelucrare (Art. 6 GDPR):

✓ Executarea contractului — pentru a-ți furniza serviciile de programare online, calendar, notificări.
✓ Obligații legale — pentru facturare, raportări fiscale.
✓ Interes legitim — pentru îmbunătățirea platformei, prevenirea fraudei și securitatea sistemului.
✓ Consimțământ — pentru newslettere și comunicări de marketing (poți retrage oricând din cont).`,
  },
  {
    titlu: "Cât timp păstrăm datele",
    Icon: Clock,
    continut: `• Datele contului: pe durata existenței contului + 30 zile după ștergere (pentru backup)
• Istoricul programărilor: 3 ani de la data programării (obligație legală contabilitate)
• Datele de facturare: 5 ani (conform Codului Fiscal român)
• Cookie-uri de analiză: maximum 13 luni
• Loguri de securitate: 90 zile

Poți solicita ștergerea datelor tale oricând, cu excepția celor pe care suntem obligați legal să le păstrăm.`,
  },
  {
    titlu: "Cu cine partajăm datele",
    Icon: Users,
    continut: `Nu vindem niciodată datele tale. Le partajăm doar cu:

• Salonul ales — când faci o programare, salonul vede numele tău, numărul de telefon și profilul animăluțului (strict necesar pentru prestarea serviciului).
• Furnizori de servicii tehnice — găzduire (Vercel) și bază de date (Supabase), ambii cu politici de conformitate GDPR. Dacă vom activa notificări prin SMS, vom actualiza această listă înainte.
• Autorități publice — exclusiv la cerere legală expresă.

Niciun transfer de date în afara UE fără garanții adecvate (clauze contractuale standard).`,
  },
  {
    titlu: "Drepturile tale",
    Icon: Scale,
    continut: `Conform GDPR, ai dreptul la:

→ Acces — să știi ce date deținem despre tine.
→ Rectificare — să corectezi datele inexacte direct din cont (Setări → Profil).
→ Ștergere ("dreptul de a fi uitat") — să soliciți ștergerea contului și a datelor asociate.
→ Portabilitate — să primești datele tale într-un format structurat (JSON/CSV).
→ Opoziție — să te opui prelucrării în scop de marketing direct.
→ Restricție — să limitezi prelucrarea în anumite situații.

Exercitare drepturi: privacy@calyhub.ro (răspuns în max. 30 zile)
Sesizare autoritate: ANSPDCP — www.dataprotection.ro`,
  },
  {
    titlu: "Cookie-uri",
    Icon: Cookie,
    continut: `[ Esențiale ] (nu necesită consimțământ)
În acest moment folosim exclusiv cookie-uri strict necesare funcționării platformei: menținerea sesiunii de autentificare și securitatea contului.
Durată: sesiune sau maximum 30 de zile.

[ Analiză și marketing ]
Momentan NU folosim cookie-uri de analiză (de exemplu Google Analytics) și nici cookie-uri de publicitate sau retargeting.

Dacă vom introduce astfel de instrumente, vom actualiza această politică și îți vom cere consimțământul explicit înainte de activarea lor.`,
  },
  {
    titlu: "Securitatea datelor",
    Icon: Lock,
    continut: `Luăm securitatea datelor tale în serios:

• Conexiune criptată HTTPS/TLS pe toate paginile
• Parole gestionate securizat prin Supabase Auth, conform standardelor din industrie
• Acces la date restricționat pe roluri, cu politici de securitate la nivel de bază de date
• Infrastructură găzduită la furnizori cu certificări de securitate recunoscute (Supabase, Vercel)

În caz de breșă de securitate cu risc pentru drepturile tale, vei fi notificat în maximum 72 de ore, conform GDPR.`,
  },
  {
    titlu: "Modificări ale politicii",
    Icon: FileText,
    continut: `Această politică poate fi actualizată periodic. Versiunea curentă este întotdeauna disponibilă pe această pagină, cu data ultimei modificări vizibilă.

Pentru modificări semnificative, vei primi notificare prin email cu cel puțin 15 zile înainte.

Data ultimei actualizări: 14 mai 2026 · Versiunea 1.0`,
  },
];

export default function Confidentialitate() {
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
        <section style={{ position: "relative", overflow: "hidden", padding: "72px 20px 40px" }}>
          <div className="ch-orb" style={{ width: 300, height: 300, background: "rgba(255,107,0,.16)", top: -130, left: "18%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ display: "flex", justifyContent: "center", marginBottom: 18, animationDelay: ".05s" }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: C.orangeSoft, border: "1.5px solid var(--pub-orange-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={26} color={C.orange} strokeWidth={2} />
              </div>
            </div>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 18, animationDelay: ".12s" }}>GDPR · Transparență</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(28px,4.4vw,44px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: -1.3, color: C.text, animationDelay: ".2s" }}>
              Politica de confidențialitate
            </h1>
            <p className="ch-hero-anim" style={{ fontSize: 14.5, color: C.dim, fontWeight: 700, marginTop: 14, animationDelay: ".28s" }}>
              Ultima actualizare: 14 mai 2026 · Versiunea 1.0
            </p>
          </div>
        </section>

        {/* CONTINUT */}
        <section style={{ padding: "20px 20px 76px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div data-reveal style={{ background: "var(--pub-ok-bg)", border: "1px solid var(--pub-ok-line)", borderRadius: 24, padding: "22px 26px", marginBottom: 32 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--pub-ok)", marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
                <CheckCircle2 size={16} strokeWidth={2.4} /> Angajamentul nostru față de tine
              </div>
              <div style={{ fontSize: 14.5, color: C.text2, lineHeight: 1.75, fontWeight: 500 }}>
                Nu vindem datele tale. Nu le partajăm fără motiv. Le protejăm cu seriozitate. Această politică îți explică
                exact ce facem cu informațiile tale — în limbaj clar, nu juridic.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {SECTIUNI.map((s, i) => (
                <div key={i} data-reveal className="ch-card" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, padding: "26px 28px", boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 11, background: C.orangeSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <s.Icon size={19} color={C.orange} strokeWidth={2} />
                    </span>
                    {s.titlu}
                  </h2>
                  <div style={{ fontSize: 14.5, color: C.muted, fontWeight: 500, lineHeight: 1.85, whiteSpace: "pre-line" }}>{s.continut}</div>
                </div>
              ))}
            </div>

            <div data-reveal style={{ background: "linear-gradient(135deg, var(--pub-orange-soft) 0%, var(--pub-tint) 100%)", border: "1px solid var(--pub-orange-border)", borderRadius: 24, padding: "24px 28px", marginTop: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.text, marginBottom: 8 }}>Ai întrebări despre datele tale?</div>
              <div style={{ fontSize: 14.5, color: C.muted, fontWeight: 500, lineHeight: 1.75 }}>
                Scrie-ne la <a href="mailto:privacy@calyhub.ro" style={{ color: C.orangeText, fontWeight: 800, textDecoration: "none" }}>privacy@calyhub.ro</a> și îți răspundem în maximum 5 zile lucrătoare.
                Poți depune și o plângere la <b style={{ color: C.text }}>ANSPDCP</b> — Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal, la <b style={{ color: C.text }}>dataprotection.ro</b>.
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
