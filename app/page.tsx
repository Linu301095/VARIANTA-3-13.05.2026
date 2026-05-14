import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif" }}>

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/">
            <Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority />
          </Link>
          <nav style={{ display: "flex", gap: 8 }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* HERO */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 50, padding: "7px 18px", marginBottom: 20, fontSize: 13, fontWeight: 700, color: "#FF6B00" }}>
              🐾 500+ saloane · Programare în 10 secunde
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.1, marginBottom: 14 }}>
              Grooming de top pentru<br />
              <span style={{ color: "#FF6B00" }}>animăluțul tău iubit.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", color: "#6B7280", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Fie că ești iubitor de animale sau deții un salon — CalyHub e construit pentru tine.
            </p>
          </div>

          {/* CARDURI — border portocaliu */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>

            {/* Card Proprietar */}
            <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(24px,3.5vw,40px)", border: "2px solid #FF6B00", boxShadow: "0 2px 20px rgba(255,107,0,.1)", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🐾</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#FF6B00", letterSpacing: 2, textTransform: "uppercase" }}>Ești proprietar de animal</div>
              <h2 style={{ fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.2, marginTop: -4 }}>Programează-ți<br />animăluțul</h2>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, flexGrow: 1 }}>Găsești salonul potrivit, alegi ora și primești reminder prin SMS.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["📅", "Programări 24/7, fără telefon"], ["📱", "Reminder SMS automat"], ["🐕", "Profil animăluț salvat"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/search" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                Caută salon acum →
              </Link>
            </div>

            {/* Card Salon */}
            <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(24px,3.5vw,40px)", border: "2px solid #FF6B00", boxShadow: "0 2px 20px rgba(255,107,0,.1)", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✂️</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#FF6B00", letterSpacing: 2, textTransform: "uppercase" }}>Ai un salon de grooming</div>
              <h2 style={{ fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.2, marginTop: -4 }}>Umple-ți<br />calendarul</h2>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, flexGrow: 1 }}>Primești programări online, reduci neprezentările și urmărești statisticile salonului.</p>
              {/* Cifre — fix responsive */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[["-70%", "Neprezentări"], ["3h", "Economisite pe zi"], ["+40%", "Clienți noi"]].map(([val, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, background: "#FAFAFA", borderRadius: 12, padding: "10px 14px" }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#FF6B00", minWidth: 56 }}>{val}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00" }}>🎁 Primele 3 luni gratuite</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>Fără card · 0% comision · Anulezi oricând</div>
              </div>
              <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                Înregistrează salonul gratuit →
              </Link>
            </div>
          </div>

          {/* STATS BAR — fix responsive 2x2 pe mobil */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 56, paddingTop: 36, borderTop: "1px solid #FF6B00" }}>
            {[["500+", "Saloane"], ["24/7", "Disponibil"], ["-70%", "Neprezentări"], ["10s", "Programare"]].map(([val, label], i) => (
              <div key={label} style={{
                textAlign: "center",
                padding: "16px 8px",
                borderRight: i % 2 === 0 ? "1px solid #FF6B00" : "none",
                borderBottom: i < 2 ? "1px solid #FF6B00" : "none"
              }}>
                <div style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginTop: 4, textTransform: "uppercase", letterSpacing: .8 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION PROPRIETARI */}
        <section style={{ background: "#fff", padding: "72px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: "6px 16px", borderRadius: 50, marginBottom: 16 }}>Pentru iubitorii de animale</div>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15 }}>Animăluțul tău merită<br /><span style={{ color: "#FF6B00" }}>îngrijirea perfectă.</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                ["📅", "Programări 24/7", "Fără telefon. Calendar actualizat în timp real."],
                ["📱", "Reminder SMS automat", "SMS cu o zi înainte. Neprezentările scad cu 70%."],
                ["🐾", "Profil animăluț unic", "Rasă, vârstă, alergii salvate. Salonul îl cunoaște deja."],
                ["⭐", "Status Special", "Istoric complet vizite. Animăluțul tău are dosar propriu."],
              ].map(([icon, title, desc]) => (
                <div key={title as string} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.08)" }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/search" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                🐾 Găsește salon acum →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION SALOANE */}
        <section style={{ background: "#FAFAFA", padding: "72px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", border: "1px solid #FFDCC6", color: "#FF6B00", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: "6px 16px", borderRadius: 50, marginBottom: 16 }}>Pentru saloane de grooming</div>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.15 }}>Transformă-ți salonul<br /><span style={{ color: "#FF6B00" }}>într-o afacere profitabilă.</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                ["-70%", "Neprezentări", "Reminder SMS automat cu 24h înainte."],
                ["3h", "Economisite/zi", "Zero timp pierdut cu telefoanele."],
                ["+40%", "Clienți noi", "Vizibilitate garantată pe CalyHub."],
                ["24/7", "Calendar activ", "Programări automate inclusiv noaptea."],
              ].map(([stat, title, desc]) => (
                <div key={title as string} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.08)" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#FF6B00", marginBottom: 8 }}>{stat}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                ✂️ Înregistrează salonul gratuit →
              </Link>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 12 }}>Fără card · Fără comision · Primele 3 luni gratuite</div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: "#1A1A1A", padding: "72px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Ești gata să începi?</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", marginBottom: 36 }}>Proprietari — programare în 10 secunde.<br />Saloane — primele 3 luni gratuite.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/search" style={{ padding: "14px 28px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.4)" }}>🐾 Programează acum</Link>
            <Link href="/register" style={{ padding: "14px 28px", borderRadius: 50, background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.2)", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>✂️ Înregistrează salonul</Link>
          </div>
        </section>
      </main>

      {/* FOOTER — logo real, fundal închis dar nu negru pur */}
      <footer style={{ background: "#1A1A1A", padding: "28px 20px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <Link href="/">
            <Image src="/logo.png" alt="CalyHub" width={120} height={42} style={{ height: 42, width: "auto", objectFit: "contain", background: "#fff", borderRadius: 10, padding: "4px 8px" }} />
          </Link>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>© 2026 CalyHub · România</div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Conectare", "/login"], ["Prețuri", "/pricing"]].map(([label, href]) => (
              <Link key={href as string} href={href as string} style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)", textDecoration: "none" }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
