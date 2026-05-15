import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";
import ThemeToggle from "../../components/ThemeToggle";

export const metadata: Metadata = {
  title: "Termeni și condiții — CalyHub",
  description:
    "Termenii și condițiile de utilizare a platformei CalyHub pentru programări la saloane de grooming în România.",
  alternates: { canonical: "/termeni" },
  robots: { index: true, follow: true },
};

const SECTIUNI = [
  {
    titlu: "1. Obiectul contractului",
    continut: `Prezentul document reglementează condițiile de utilizare ale platformei CalyHub, accesibilă la adresa varianta-3-13-05-2026.vercel.app, operată de CalyHub SRL, cu sediul în București, România.

Prin crearea unui cont și utilizarea serviciilor platformei, utilizatorul acceptă în mod expres și neechivoc termenii și condițiile prezentului document. Dacă nu ești de acord cu acești termeni, te rugăm să nu folosești platforma.`,
  },
  {
    titlu: "2. Definiții",
    continut: `• "Platformă" — serviciul online CalyHub, incluzând website-ul, aplicația mobilă și API-urile asociate.
• "Utilizator" — orice persoană fizică sau juridică care creează un cont pe platformă.
• "Client" — utilizatorul care caută și rezervă servicii de grooming pentru animalul de companie.
• "Salon" — utilizatorul de tip persoană juridică sau PFA care oferă servicii de grooming prin intermediul platformei.
• "Programare" — rezervarea confirmată a unui serviciu de grooming între un Client și un Salon.
• "Servicii" — toate funcționalitățile oferite de CalyHub, inclusiv calendarul online, notificările SMS și statisticile.`,
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
    continut: `4.1. Salonul partener confirmă că desfășoară activitate legală de grooming pe teritoriul României, deținând toate autorizațiile și documentele necesare conform legislației în vigoare.

4.2. Salonul se obligă să onoreze toate programările confirmate prin platformă. Anulările repetate sau nejustificate pot duce la suspendarea contului.

4.3. Prețurile afișate pe platformă trebuie să fie reale și actualizate. Este interzisă afișarea de prețuri diferite față de cele practicate efectiv.

4.4. CalyHub percepe un abonament lunar conform planului ales. Primul abonament include o perioadă de trial conform planului selectat. Plata se efectuează prin mijloace electronice securizate.`,
  },
  {
    titlu: "5. Rezervări și anulări",
    continut: `5.1. O programare devine confirmată în momentul acceptării ei de către salon în sistem. Clientul primește confirmare prin email și/sau SMS.

5.2. Anularea de către client trebuie efectuată cu cel puțin 24 de ore înainte de ora programată. Anulările de ultim moment repetate pot duce la restricționarea accesului la platformă.

5.3. Salonul poate anula o programare doar în situații excepționale (forță majoră, urgențe) și are obligația de a notifica clientul în cel mai scurt timp posibil prin intermediul platformei.

5.4. CalyHub nu este parte în contractul de prestări servicii dintre client și salon și nu poate fi responsabil pentru calitatea serviciilor prestate.`,
  },
  {
    titlu: "6. Proprietate intelectuală",
    continut: `Toate elementele platformei CalyHub — inclusiv logo-ul, interfața, textele, fotografiile, codul sursă și structura bazei de date — sunt proprietatea exclusivă a CalyHub SRL și sunt protejate de legislația română și europeană privind drepturile de autor.

Este interzisă reproducerea, distribuirea, modificarea sau utilizarea comercială a oricărui element al platformei fără acordul scris prealabil al CalyHub SRL.`,
  },
  {
    titlu: "7. Limitarea răspunderii",
    continut: `7.1. CalyHub pune la dispoziție platforma ca intermediar tehnic și nu garantează calitatea serviciilor de grooming prestate de saloanele partenere.

7.2. CalyHub nu răspunde pentru prejudiciile directe sau indirecte cauzate de: indisponibilitatea temporară a platformei, erori tehnice, forță majoră sau acțiuni ale terților.

7.3. Recenziile afișate pe platformă reprezintă opinii ale utilizatorilor și nu ale CalyHub. Ne rezervăm dreptul de a modera sau elimina recenziile care încalcă politicile noastre.`,
  },
  {
    titlu: "8. Modificarea termenilor",
    continut: `CalyHub își rezervă dreptul de a modifica prezentul document oricând, cu notificarea utilizatorilor prin email și/sau prin mesaj în platformă cu cel puțin 15 zile înainte de intrarea în vigoare a modificărilor.

Continuarea utilizării platformei după data intrării în vigoare a modificărilor constituie acceptul implicit al noilor termeni.`,
  },
  {
    titlu: "9. Legea aplicabilă și litigii",
    continut: `Prezentul document este guvernat de legislația română. Orice litigiu născut din sau în legătură cu acești termeni va fi supus competenței instanțelor judecătorești din București, România.

Înainte de orice acțiune judiciară, părțile se obligă să încerce soluționarea amiabilă a disputei. Utilizatorul poate sesiza CalyHub la adresa legal@calyhub.ro.`,
  },
  {
    titlu: "10. Contact",
    continut: `CalyHub SRL
Email: legal@calyhub.ro
Suport clienți: support@calyhub.ro
Program: Luni–Vineri, 09:00–18:00

Data ultimei actualizări: 14 mai 2026`,
  },
];

export default function Termeni() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav style={{ display: "flex", gap: 8 }}>
            <ThemeToggle size={36} />
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ background: "#1A1A1A", padding: "56px 20px 48px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(255,107,0,.15)", color: "#FF8C42", padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20, border: "1px solid rgba(255,107,0,.3)" }}>Document legal</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>Termeni și Condiții</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)" }}>Ultima actualizare: 14 mai 2026 · Versiunea 1.0</p>
        </section>

        <section style={{ padding: "56px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 16, padding: "18px 22px", marginBottom: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FF6B00", marginBottom: 4 }}>ℹ️ Rezumat simplu</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                Folosești CalyHub ca să găsești sau să oferi servicii de grooming. Datele tale sunt în siguranță, prețurile sunt transparente și poți anula oricând. Citind mai departe găsești toate detaliile legale.
              </div>
            </div>

            {SECTIUNI.map((s, i) => (
              <div key={i} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: i < SECTIUNI.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF3EA", color: "#FF6B00", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                  {s.titlu.replace(/^\d+\. /, "")}
                </h2>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.85, whiteSpace: "pre-line" }}>{s.continut}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
