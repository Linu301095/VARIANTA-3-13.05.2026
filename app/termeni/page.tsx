import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import { FileText, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Termeni și condiții — CalyHub",
  description:
    "Termenii și condițiile de utilizare a platformei CalyHub pentru programări la saloane de înfrumusețare și de grooming din România.",
  alternates: { canonical: "/termeni" },
  robots: { index: true, follow: true },
};

const SECTIUNI = [
  {
    titlu: "1. Obiectul contractului",
    continut: `Prezentul document reglementează condițiile de utilizare ale platformei CalyHub, accesibilă la adresa calyhub.ro, operată de CalyHub SRL, cu sediul în București, România.

Prin crearea unui cont și utilizarea serviciilor platformei, utilizatorul acceptă în mod expres și neechivoc termenii și condițiile prezentului document. Dacă nu ești de acord cu acești termeni, te rugăm să nu folosești platforma.`,
  },
  {
    titlu: "2. Definiții",
    continut: `• "Platformă" — serviciul online CalyHub, incluzând website-ul, aplicația mobilă și API-urile asociate.
• "Utilizator" — orice persoană fizică sau juridică care creează un cont pe platformă.
• "Client" — utilizatorul care caută și rezervă servicii de îngrijire, pentru sine sau pentru animalul său de companie.
• "Salon" — utilizatorul de tip persoană juridică sau PFA care oferă servicii de înfrumusețare (frizerie, coafor, cosmetică, manichiură) sau de grooming pentru animale, prin intermediul platformei.
• "Programare" — rezervarea confirmată a unui serviciu între un Client și un Salon.
• "Servicii" — toate funcționalitățile oferite de CalyHub, inclusiv calendarul online, notificările, statisticile și instrumentele AI puse la dispoziția saloanelor.`,
  },
  {
    titlu: "3. Crearea și gestionarea contului",
    continut: `3.1. Crearea contului este gratuită și necesită un email valid și o parolă. Utilizatorul este responsabil pentru păstrarea confidențialității datelor de autentificare.

3.2. Este interzisă crearea de conturi false, multiple sau în scopul colectării de date. CalyHub își rezervă dreptul de a suspenda sau șterge orice cont care încalcă aceste condiții fără notificare prealabilă.

3.3. Utilizatorul garantează că toate informațiile furnizate la înregistrare sunt corecte, complete și actualizate. Contul poate fi utilizat exclusiv de titularul acestuia.

3.4. CalyHub nu va fi responsabil pentru prejudiciile cauzate ca urmare a accesului neautorizat la cont datorat neglijenței utilizatorului.`,
  },
  {
    titlu: "4. Condiții pentru saloane partenere",
    continut: `4.1. Salonul partener confirmă că desfășoară activitate legală pe teritoriul României — de înfrumusețare pentru persoane sau de îngrijire pentru animale de companie — deținând toate autorizațiile și documentele necesare conform legislației în vigoare.

4.2. Salonul se obligă să onoreze toate programările confirmate prin platformă. Anulările repetate sau nejustificate pot duce la suspendarea contului.

4.3. Prețurile afișate pe platformă trebuie să fie reale și actualizate. Este interzisă afișarea de prețuri diferite față de cele practicate efectiv.

4.4. CalyHub percepe un abonament lunar conform planului ales și nu percepe comision pe programările efectuate. Plata serviciilor prestate se face direct între Client și Salon, CalyHub neintervenind în această tranzacție.`,
  },
  {
    titlu: "5. Perioada de probă, suspendarea și ștergerea datelor",
    continut: `5.1. La finalizarea configurării, fiecare salon partener beneficiază de o perioadă de probă gratuită, fără card bancar și fără obligații. Durata exactă a perioadei de probă este comunicată în contul salonului.

5.2. La încheierea perioadei de probă, salonul poate alege un plan de abonament pentru a continua. Dacă nu alege un plan, contul intră în stare suspendată.

5.3. Pe durata suspendării, salonul păstrează accesul la contul său și la toate datele proprii — agendă, clienți, istoric, statistici — și le poate exporta oricând. Profilul public nu mai apare însă în căutare, iar salonul nu mai poate primi programări noi.

5.4. Programările deja confirmate înainte de suspendare rămân valabile și se desfășoară normal. Salonul are în continuare obligația de a le onora, conform art. 4.2.

5.5. Dacă salonul nu alege un plan în termen de 30 de zile de la suspendare, datele salonului (profil public, servicii, echipă, fotografii) se șterg definitiv. Contul de utilizator rămâne activ și poate fi refolosit oricând pentru a configura un salon nou.

5.6. Înainte de ștergere, CalyHub notifică salonul prin intermediul platformei și pe adresa de email asociată contului. Salonul poate solicita oricând, înainte de termen, exportul datelor proprii.

5.7. Din istoricul programărilor clienților se păstrează denumirea salonului, pentru ca aceștia să își poată consulta propriul istoric de servicii.`,
  },
  {
    titlu: "6. Rezervări și anulări",
    continut: `6.1. O programare devine confirmată în momentul acceptării ei de către salon în sistem. Clientul primește confirmarea direct în aplicație, printr-o notificare. Cu aproximativ 24 de ore înainte de programare, clientul primește un reminder pe WhatsApp sau prin SMS, la numărul de telefon din profil.

6.2. Anularea de către client trebuie efectuată cu cel puțin 24 de ore înainte de ora programată. Anulările de ultim moment repetate pot duce la restricționarea accesului la platformă.

6.3. Salonul poate anula o programare doar în situații excepționale (forță majoră, urgențe) și are obligația de a notifica clientul în cel mai scurt timp posibil prin intermediul platformei.

6.4. CalyHub nu este parte în contractul de prestări servicii dintre client și salon și nu poate fi responsabil pentru calitatea serviciilor prestate.`,
  },
  {
    titlu: "7. Proprietate intelectuală",
    continut: `Toate elementele platformei CalyHub — inclusiv logo-ul, interfața, textele, fotografiile, codul sursă și structura bazei de date — sunt proprietatea exclusivă a CalyHub SRL și sunt protejate de legislația română și europeană privind drepturile de autor.

Este interzisă reproducerea, distribuirea, modificarea sau utilizarea comercială a oricărui element al platformei fără acordul scris prealabil al CalyHub SRL.`,
  },
  {
    titlu: "8. Limitarea răspunderii",
    continut: `7.1. CalyHub pune la dispoziție platforma ca intermediar tehnic și nu garantează calitatea serviciilor prestate de saloanele partenere.

7.2. CalyHub nu răspunde pentru prejudiciile directe sau indirecte cauzate de: indisponibilitatea temporară a platformei, erori tehnice, forță majoră sau acțiuni ale terților.

7.3. Recenziile afișate pe platformă reprezintă opinii ale utilizatorilor și nu ale CalyHub. Ne rezervăm dreptul de a modera sau elimina recenziile care încalcă politicile noastre.`,
  },
  {
    titlu: "9. Modificarea termenilor",
    continut: `CalyHub își rezervă dreptul de a modifica prezentul document oricând, cu notificarea utilizatorilor prin email și/sau prin mesaj în platformă cu cel puțin 15 zile înainte de intrarea în vigoare a modificărilor.

Continuarea utilizării platformei după data intrării în vigoare a modificărilor constituie acceptul implicit al noilor termeni.`,
  },
  {
    titlu: "10. Legea aplicabilă și litigii",
    continut: `Prezentul document este guvernat de legislația română. Orice litigiu născut din sau în legătură cu acești termeni va fi supus competenței instanțelor judecătorești din București, România.

Înainte de orice acțiune judiciară, părțile se obligă să încerce soluționarea amiabilă a disputei. Utilizatorul poate sesiza CalyHub la adresa legal@calyhub.ro.`,
  },
];

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

export default function Termeni() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif" }}>

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
        <section style={{ position: "relative", overflow: "hidden", padding: "72px 20px 40px" }}>
          <div className="ch-orb" style={{ width: 300, height: 300, background: "rgba(255,107,0,.16)", top: -130, left: "18%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ display: "flex", justifyContent: "center", marginBottom: 18, animationDelay: ".05s" }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: C.orangeSoft, border: "1.5px solid var(--pub-orange-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={26} color={C.orange} strokeWidth={2} />
              </div>
            </div>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 18, animationDelay: ".12s" }}>Document legal</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(28px,4.4vw,44px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: -1.3, color: C.text, animationDelay: ".2s" }}>
              Termeni și condiții
            </h1>
            <p className="ch-hero-anim" style={{ fontSize: 14.5, color: C.dim, fontWeight: 700, marginTop: 14, animationDelay: ".28s" }}>
              Ultima actualizare: 3 august 2026 · Versiunea 1.1
            </p>
          </div>
        </section>

        {/* CONTINUT */}
        <section style={{ padding: "20px 20px 76px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div data-reveal style={{ background: "linear-gradient(135deg, var(--pub-orange-soft) 0%, var(--pub-tint) 100%)", border: "1px solid var(--pub-orange-border)", borderRadius: 24, padding: "22px 26px", marginBottom: 32 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.orangeText, marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
                <Info size={16} strokeWidth={2.4} /> Rezumat pe scurt
              </div>
              <div style={{ fontSize: 14.5, color: C.text2, lineHeight: 1.75, fontWeight: 500 }}>
                Folosești CalyHub ca să găsești sau să oferi servicii de îngrijire — pentru tine sau pentru animalul tău.
                Datele tale sunt în siguranță, prețurile sunt transparente și poți anula oricând. Mai jos găsești toate detaliile legale.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {SECTIUNI.map((s, i) => (
                <div key={i} data-reveal className="ch-card" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, padding: "26px 28px", boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: C.orangeSoft, color: C.orangeText, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                    {s.titlu.replace(/^\d+\. /, "")}
                  </h2>
                  <div style={{ fontSize: 14.5, color: C.muted, fontWeight: 500, lineHeight: 1.85, whiteSpace: "pre-line" }}>{s.continut}</div>
                </div>
              ))}
            </div>

            <div data-reveal style={{ marginTop: 26, textAlign: "center", fontSize: 14, color: C.muted, fontWeight: 600 }}>
              Ai întrebări despre acest document? Scrie-ne la{" "}
              <a href="mailto:legal@calyhub.ro" style={{ color: C.orangeText, fontWeight: 800, textDecoration: "none" }}>legal@calyhub.ro</a>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
      <ScrollReveal />
    </div>
  );
}
