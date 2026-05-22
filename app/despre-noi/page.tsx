import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Despre noi — Povestea CalyHub",
  description:
    "Cum s-a născut CalyHub: o platformă creată din pasiune pentru animale, care simplifică programările la grooming pentru stăpâni și saloane din România.",
  alternates: { canonical: "/despre-noi" },
  openGraph: {
    title: "Despre noi — Povestea CalyHub",
    description: "Platformă creată din pasiune pentru animale și pentru saloane de grooming.",
    url: "/despre-noi",
  },
};

const VALORI = [
  { icon: "❤️", titlu: "Pasiune pentru animale", desc: "Fiecare decizie de produs o luăm cu animăluțul în minte. Bunăstarea lor nu e o opțiune — e centrul a tot ce construim." },
  { icon: "🌟", titlu: "Standarde înalte", desc: "Vrem ca fiecare salon de pe CalyHub să ofere servicii la cele mai bune standarde. Filtrăm, verificăm, ridicăm ștacheta." },
  { icon: "🤝", titlu: "Parteneriat real", desc: "Saloanele nu sunt simpli furnizori — sunt parteneri în misiunea noastră. Le oferim uneltele ca să crească împreună cu noi." },
  { icon: "🔒", titlu: "Transparență totală", desc: "Prețuri clare, fără comisioane ascunse. Ce vezi este ce primești — pentru toți cei implicați." },
];

const CIFRE = [
  { val: "2026", label: "Anul fondării" },
  { val: "🇷🇴", label: "Construit în România" },
  { val: "100%", label: "Pentru iubitorii de animale" },
  { val: "∞", label: "Pasiune pentru ce facem" },
];

export default function DespreNoi() {
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

        {/* HERO */}
        <section style={{ background: "#fff", padding: "80px 20px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>Povestea noastră</div>
            <h1 style={{ fontSize: "clamp(30px,4.5vw,52px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15, marginBottom: 20 }}>
              O idee cu rădăcini adânci,<br />
              <span style={{ color: "#FF6B00" }}>născută din iubire pentru animale.</span>
            </h1>
            <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
              CalyHub nu este o aplicație construită peste noapte. Este rezultatul unor ani buni de gândire, observație și un singur scop clar: să ridicăm standardele îngrijirii animalelor în România.
            </p>
          </div>
        </section>

        {/* POVESTEA */}
        <section style={{ padding: "72px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>De unde am pornit</div>
            <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 28, lineHeight: 1.25 }}>O idee care a stat la copt ani buni</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <p style={{ fontSize: 17, color: "#1A1A1A", lineHeight: 1.85, fontWeight: 600 }}>
                Sunt un iubitor de animale. Acesta a fost dintotdeauna punctul meu de pornire — și tot acolo se va întoarce mereu CalyHub.
              </p>

              <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.85 }}>
                De ani buni mă gândesc la o aplicație care să schimbe în bine domeniul de grooming din România. Nu o aplicație care să rezolve o problemă mică sau să adauge încă un canal de comunicare — ci o platformă care să aducă o <strong style={{ color: "#FF6B00" }}>soluție reală</strong>, o soluție pe care orice stăpân de animale și orice salon profesionist și-ar dori-o.
              </p>

              <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.85 }}>
                Am observat ani la rând cât de fragmentată e industria. Saloane bune ascunse pe ulițe lăturalnice, fără vizibilitate. Stăpâni care își fac programări prin telefon, uneori sună la 5-6 locuri până găsesc disponibilitate. Animăluți care primesc servicii inconstante pentru că salonul nu are istoricul lor. Pierderi de timp, frustrări, oportunități ratate — și mai ales, animale care nu primesc întotdeauna ce merită.
              </p>

              <div style={{ background: "#FFF3EA", borderLeft: "4px solid #FF6B00", padding: "22px 26px", borderRadius: "0 16px 16px 0", margin: "10px 0" }}>
                <p style={{ fontSize: 17, color: "#1A1A1A", lineHeight: 1.8, fontWeight: 700, fontStyle: "italic" }}>
                  „Animăluții noștri merită cele mai bune servicii. Nu mai puțin, nu altceva — cele mai bune."
                </p>
              </div>

              <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.85 }}>
                Așa s-a născut CalyHub: din convingerea că tehnologia poate fi pusă în slujba binelui — în slujba acestor ființe care ne dau atâta iubire necondiționată. O platformă care să conecteze stăpânii cu cele mai bune saloane, care să ajute saloanele profesioniste să crească și să fie vizibile, și care să ridice ștacheta întregii industrii.
              </p>

              <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.85 }}>
                CalyHub a fost fondat oficial în <strong style={{ color: "#1A1A1A" }}>2026</strong>, dar ideea există de mult mai mult timp. Iar drumul abia începe.
              </p>

              <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.85 }}>
                Dacă ești stăpân de animale sau dacă deții un salon și vrei să faci parte din această misiune — bine ai venit. Construim împreună standardul îngrijirii animalelor de mâine.
              </p>

              <div style={{ fontSize: 15, color: "#FF6B00", fontWeight: 800, marginTop: 12, fontStyle: "italic" }}>
                — Fondatorul CalyHub
              </div>
            </div>
          </div>
        </section>

        {/* CIFRE / STATEMENT */}
        <section style={{ background: "#FF6B00", padding: "56px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2 }}>
            {CIFRE.map((c, i) => (
              <div key={c.label} style={{ textAlign: "center", padding: "20px 16px", borderRight: i < CIFRE.length - 1 ? "1px solid rgba(255,255,255,.25)" : "none" }}>
                <div style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{c.val}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontWeight: 700, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MISIUNE */}
        <section style={{ padding: "72px 20px", background: "#FAFAFA" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 18 }}>Misiunea noastră</div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.25, marginBottom: 20 }}>
              Ca fiecare animal din România să primească <span style={{ color: "#FF6B00" }}>cele mai bune servicii</span> — fără compromis.
            </h2>
            <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.8 }}>
              Construim instrumentele care fac asta posibil: pentru stăpânii care vor ce e mai bun pentru animalul lor și pentru saloanele care vor să livreze servicii la cele mai înalte standarde.
            </p>
          </div>
        </section>

        {/* VALORI */}
        <section style={{ padding: "72px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Ce ne ghidează</div>
              <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 900, color: "#1A1A1A" }}>Valorile CalyHub</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {VALORI.map(v => (
                <div key={v.titlu} style={{ background: "#FAFAFA", borderRadius: 22, padding: "28px 24px", border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.07)" }}>
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{v.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 10 }}>{v.titlu}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "#1A1A1A", padding: "64px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>Fă parte din poveste</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.6)", marginBottom: 32, lineHeight: 1.7 }}>
            Fie că ești stăpân sau deții un salon — locul tău e pe CalyHub.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.4)" }}>Înregistrare gratuită</Link>
            <Link href="/cum-functioneaza" style={{ padding: "14px 28px", borderRadius: 50, border: "1.5px solid rgba(255,255,255,.25)", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Cum funcționează →</Link>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
