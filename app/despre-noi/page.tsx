import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

const VALORI = [
  { icon: "❤️", titlu: "Pasiune pentru animale", desc: "Fiecare decizie de produs o luăm întrebând: este bine pentru animăluț? Bunăstarea lor e prioritatea noastră zero." },
  { icon: "🤝", titlu: "Parteneriat real", desc: "Saloanele nu sunt clienți — sunt parteneri. Le oferim uneltele ca să crească, nu doar să supraviețuiască." },
  { icon: "🔒", titlu: "Transparență totală", desc: "Prețuri clare, fără comisioane ascunse. Ce vezi este ce plătești — atât pentru proprietari cât și pentru saloane." },
  { icon: "🚀", titlu: "Inovație continuă", desc: "Ascultăm comunitatea și lansăm funcții noi constant. CalyHub din 2027 va fi mai bun decât cel de azi." },
];

const ECHIPA = [
  { nume: "Andrei Munteanu", rol: "Co-fondator & CEO", emoji: "👨‍💼", desc: "Iubitor de câini cu 2 labradors acasă. A fondat CalyHub după ce nu a găsit un salon de grooming de calitate pentru Rex." },
  { nume: "Elena Popescu", rol: "Co-fondatoare & CTO", emoji: "👩‍💻", desc: "Inginer software cu 10 ani experiență. Construiește tehnologia care face programarea în 10 secunde posibilă." },
  { nume: "Mihai Dumitrescu", rol: "Head of Partnerships", emoji: "👨‍🤝‍👨", desc: "A lucrat în grooming 8 ani. Acum ajută saloanele să crească cu CalyHub. Știe industria din interior." },
];

const CIFRE = [
  { val: "2024", label: "Anul fondării" },
  { val: "500+", label: "Saloane partenere" },
  { val: "15.000+", label: "Programări lunare" },
  { val: "4.9★", label: "Rating mediu saloane" },
];

export default function DespreNoi() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav style={{ display: "flex", gap: 8 }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* HERO */}
        <section style={{ background: "#1A1A1A", padding: "80px 20px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "rgba(255,107,0,.15)", color: "#FF8C42", padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24, border: "1px solid rgba(255,107,0,.3)" }}>Povestea noastră</div>
            <h1 style={{ fontSize: "clamp(30px,4.5vw,52px)", fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 20 }}>
              Construim viitorul<br />
              <span style={{ color: "#FF6B00" }}>îngrijirii animalelor</span><br />
              în România.
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,.65)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
              CalyHub s-a născut dintr-o frustrare simplă: de ce e atât de greu să găsești un salon de grooming de calitate și să faci o programare fără telefoane interminabile?
            </p>
          </div>
        </section>

        {/* POVESTEA */}
        <section style={{ padding: "72px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>De unde am pornit</div>
            <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 24, lineHeight: 1.2 }}>Totul a început cu un labrador pe nume Rex</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                "Era vara lui 2023. Andrei, co-fondatorul CalyHub, căuta un salon de grooming pentru Rex, labradorul lui de 4 ani. A petrecut 2 ore sunând saloane, ascultând mesaje de tipul \"Nu mai avem locuri\", \"Sunați săptămâna viitoare\" sau pur și simplu — nimeni nu răspundea.",
                "Frustrat, și-a dat seama că problema nu era lipsa saloanelor bune — erau destule în București. Problema era că nu exista o punte digitală între proprietarii de animale și aceste saloane. Totul funcționa prin telefon, agendă fizică și recomandări din gură în gură.",
                "Împreună cu Elena, o ingineră software care avusese același tip de experiență cu pisica ei, și cu Mihai, un groomer cu 8 ani în industrie, au fondat CalyHub în primăvara lui 2024.",
                "Astăzi, platforma conectează mii de proprietari cu peste 500 de saloane partenere din toată România. Misiunea rămâne aceeași: să facem îngrijirea animalelor accesibilă, transparentă și fără stres — pentru toți.",
              ].map((para, i) => (
                <p key={i} style={{ fontSize: 16, color: "#374151", lineHeight: 1.85 }}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        {/* CIFRE */}
        <section style={{ background: "#FF6B00", padding: "56px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2 }}>
            {CIFRE.map((c, i) => (
              <div key={c.label} style={{ textAlign: "center", padding: "20px 16px", borderRight: i < CIFRE.length - 1 ? "1px solid rgba(255,255,255,.25)" : "none" }}>
                <div style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{c.val}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: 1 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* VALORI */}
        <section style={{ padding: "72px 20px", background: "#FAFAFA" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Ce ne ghidează</div>
              <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 900, color: "#1A1A1A" }}>Valorile CalyHub</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {VALORI.map(v => (
                <div key={v.titlu} style={{ background: "#fff", borderRadius: 22, padding: "28px 24px", border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.07)" }}>
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{v.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 10 }}>{v.titlu}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ECHIPA */}
        <section style={{ padding: "72px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Oamenii din spate</div>
              <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 900, color: "#1A1A1A" }}>Echipa fondatoare</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {ECHIPA.map(p => (
                <div key={p.nume} style={{ background: "#FAFAFA", borderRadius: 22, padding: "32px 26px", border: "1.5px solid #EBEBEB", textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FFF3EA", border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 16px" }}>{p.emoji}</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A", marginBottom: 4 }}>{p.nume}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>{p.rol}</div>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "#1A1A1A", padding: "64px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>Fă parte din poveste</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.6)", marginBottom: 32, lineHeight: 1.7 }}>
            Fie că ești proprietar sau deții un salon — locul tău e pe CalyHub.
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
