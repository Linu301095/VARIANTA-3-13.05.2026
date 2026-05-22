import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Politica de confidențialitate — CalyHub",
  description:
    "Cum colectăm, folosim și protejăm datele tale personale conform GDPR. Politica de confidențialitate a platformei CalyHub.",
  alternates: { canonical: "/confidentialitate" },
  robots: { index: true, follow: true },
};

const SECTIUNI = [
  {
    titlu: "Cine suntem",
    icon: "🏢",
    continut: `CalyHub SRL este operatorul platformei CalyHub și, în sensul Regulamentului (UE) 2016/679 (GDPR), are calitatea de operator de date cu caracter personal.

Contact DPO (Responsabil cu Protecția Datelor): privacy@calyhub.ro`,
  },
  {
    titlu: "Ce date colectăm",
    icon: "📋",
    continut: `Date furnizate de tine la înregistrare:
• Nume și prenume
• Adresă de email
• Număr de telefon (opțional, necesar pentru SMS-uri de reminder)
• Parola (stocată criptat cu bcrypt — nu o vedem niciodată)

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
    icon: "🎯",
    continut: `Baza legală pentru prelucrare (Art. 6 GDPR):

✓ Executarea contractului — pentru a-ți furniza serviciile de programare online, calendar, notificări.
✓ Obligații legale — pentru facturare, raportări fiscale.
✓ Interes legitim — pentru îmbunătățirea platformei, prevenirea fraudei și securitatea sistemului.
✓ Consimțământ — pentru newslettere și comunicări de marketing (poți retrage oricând din cont).`,
  },
  {
    titlu: "Cât timp păstrăm datele",
    icon: "⏱️",
    continut: `• Datele contului: pe durata existenței contului + 30 zile după ștergere (pentru backup)
• Istoricul programărilor: 3 ani de la data programării (obligație legală contabilitate)
• Datele de facturare: 5 ani (conform Codului Fiscal român)
• Cookie-uri de analiză: maximum 13 luni
• Loguri de securitate: 90 zile

Poți solicita ștergerea datelor tale oricând, cu excepția celor pe care suntem obligați legal să le păstrăm.`,
  },
  {
    titlu: "Cu cine partajăm datele",
    icon: "🤝",
    continut: `Nu vindem niciodată datele tale. Le partajăm doar cu:

• Salonul ales — când faci o programare, salonul vede numele tău, numărul de telefon și profilul animăluțului (strict necesar pentru prestarea serviciului).
• Furnizori de servicii tehnice — hosting (Vercel), baze de date (Supabase), trimitere SMS (Twilio). Toți sunt certificați GDPR.
• Autorități publice — exclusiv la cerere legală expresă.

Niciun transfer de date în afara UE fără garanții adecvate (clauze contractuale standard).`,
  },
  {
    titlu: "Drepturile tale",
    icon: "⚖️",
    continut: `Conform GDPR, ai dreptul la:

🔍 Acces — să știi ce date deținem despre tine.
✏️ Rectificare — să corectezi datele inexacte direct din cont (Setări → Profil).
🗑️ Ștergere ("dreptul de a fi uitat") — să soliciți ștergerea contului și a datelor asociate.
📦 Portabilitate — să primești datele tale într-un format structurat (JSON/CSV).
🚫 Opoziție — să te opui prelucrării în scop de marketing direct.
⏸️ Restricție — să limitezi prelucrarea în anumite situații.

Exercitare drepturi: privacy@calyhub.ro (răspuns în max. 30 zile)
Sesizare autoritate: ANSPDCP — www.dataprotection.ro`,
  },
  {
    titlu: "Cookie-uri",
    icon: "🍪",
    continut: `Folosim 3 categorii de cookie-uri:

🟢 Esențiale (nu necesită consimțământ)
Necesare funcționării platformei: autentificare, coș sesiune, securitate CSRF.
Durată: sesiune sau max. 30 zile.

🟡 Analiză (cu consimțământ)
Google Analytics 4 cu IP anonim, Hotjar pentru heatmaps. Ne ajută să înțelegem cum folosești platforma.
Durată: max. 13 luni.

🔴 Marketing (cu consimțământ)
Cookie-uri pentru retargeting publicitar (Facebook Pixel, Google Ads). Activate doar dacă accepți.

Poți gestiona preferințele de cookie-uri oricând din butonul "Cookie-uri" din footer.`,
  },
  {
    titlu: "Securitatea datelor",
    icon: "🔒",
    continut: `Luăm securitatea datelor tale în serios:

• Conexiune HTTPS/TLS 1.3 pe toate paginile
• Parole criptate cu bcrypt (salt rounds: 12)
• Acces la date restricționat prin roluri (RBAC)
• Backup criptat zilnic
• Monitorizare continuă pentru detectarea intruziunilor
• Audit de securitate semestrial

În caz de breșă de securitate cu risc pentru drepturile tale, vei fi notificat în maximum 72 de ore, conform GDPR.`,
  },
  {
    titlu: "Modificări ale politicii",
    icon: "📝",
    continut: `Această politică poate fi actualizată periodic. Versiunea curentă este întotdeauna disponibilă pe această pagină, cu data ultimei modificări vizibilă.

Pentru modificări semnificative, vei primi notificare prin email cu cel puțin 15 zile înainte.

Data ultimei actualizări: 14 mai 2026 · Versiunea 1.0`,
  },
];

export default function Confidentialitate() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav style={{ display: "flex", gap: 8 }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ background: "#fff", padding: "56px 20px 48px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>GDPR · Transparență</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 12 }}>Politica de Confidențialitate</h1>
          <p style={{ fontSize: 15, color: "#6B7280" }}>Ultima actualizare: 14 mai 2026 · Versiunea 1.0</p>
        </section>

        <section style={{ padding: "56px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>

            <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 16, padding: "18px 22px", marginBottom: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginBottom: 4 }}>✅ Angajamentul nostru față de tine</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                Nu vindem datele tale. Nu le partajăm fără motiv. Le protejăm cu seriozitate. Această politică îți explică exact ce facem cu informațiile tale — în limbaj clar, nu juridic.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {SECTIUNI.map((s, i) => (
                <div key={i} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: i < SECTIUNI.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    {s.titlu}
                  </h2>
                  <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.9, whiteSpace: "pre-line" }}>{s.continut}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 16, padding: "20px 24px", marginTop: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#FF6B00", marginBottom: 8 }}>Ai întrebări despre datele tale?</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                Contactează-ne la <strong>privacy@calyhub.ro</strong> și îți răspundem în maximum 5 zile lucrătoare. Poți de asemenea să depui o plângere la <strong>ANSPDCP</strong> (Autoritatea Națională de Supraveghere) la adresa <strong>www.dataprotection.ro</strong>.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
