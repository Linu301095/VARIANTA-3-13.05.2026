"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "../../components/Footer";

const CANALE = [
  { icon: "📧", titlu: "Email prioritar", info: "parteneri@calyhub.ro", desc: "Răspuns în maximum 4 ore în zilele lucrătoare", culoare: "#FF6B00" },
  { icon: "💬", titlu: "Chat în panou", info: "Disponibil 24/7", desc: "Direct din panoul de control al salonului — buton chat în dreapta jos", culoare: "#10B981" },
  { icon: "📞", titlu: "Telefon dedicat", info: "0800 123 456", desc: "Luni–Vineri 09:00–18:00 · Apel gratuit din rețele naționale", culoare: "#8B5CF6" },
  { icon: "📱", titlu: "WhatsApp Business", info: "+40 700 000 000", desc: "Pentru urgențe — răspuns în max. 30 minute în program", culoare: "#22C55E" },
];

const RESURSE = [
  { icon: "🚀", titlu: "Ghid de onboarding", desc: "Pași pentru a-ți configura salonul corect: profil, servicii, echipă, program de lucru, fotografii." },
  { icon: "📚", titlu: "Bază de cunoștințe", desc: "Articole detaliate despre fiecare funcționalitate. Cum gestionezi anulările, cum răspunzi la recenzii, cum activezi notificările SMS." },
  { icon: "🎥", titlu: "Tutoriale video", desc: "Demonstrații pas-cu-pas pentru cele mai folosite funcții. Sub 5 minute fiecare, perfect pentru pauza de cafea." },
  { icon: "👥", titlu: "Comunitate parteneri", desc: "Grup privat Facebook unde poți schimba sfaturi cu alți groomeri și saloane partenere CalyHub." },
];

const FAQ_PARTENERI = [
  { q: "Cum îmi recuperez accesul dacă uit parola?", r: "Click pe \"Ai uitat parola?\" în pagina de conectare. Vei primi un link de resetare pe emailul asociat contului în maximum 2 minute." },
  { q: "Cum modific prețurile serviciilor?", r: "Intri în panoul de control → Serviciile mele → click pe serviciul dorit. Modificările sunt vizibile clienților în maximum 5 minute. Programările deja confirmate păstrează prețul vechi." },
  { q: "Ce fac dacă un client nu se prezintă?", r: "Marchezi programarea ca \"neprezentată\" din Agenda. Sistemul aplică automat politica de neprezentare configurată. Clientul cu 3 neprezentări într-un an primește restricție de programare." },
  { q: "Pot să anulez o programare confirmată?", r: "Da, dar doar din motive justificate. Anulările repetate fără motiv pot duce la suspendarea contului. Clientul este notificat automat și poate face altă programare." },
  { q: "Când primesc banii din programări?", r: "În 2-3 zile lucrătoare după finalizarea serviciului. Transferurile se fac către IBAN-ul configurat în Setări → Date facturare." },
  { q: "Pot să-mi schimb planul de abonament?", r: "Da, oricând. Mergi la Abonamentul meu → Schimbă planul. Diferența de preț se calculează proporțional pentru luna în curs." },
  { q: "Cum răspund la o recenzie negativă?", r: "În panoul Recenzii poți răspunde public la orice review. Recomandăm răspuns profesionist, scuze dacă e cazul, soluție concretă. Niciodată nu replicăm cu agresivitate." },
  { q: "Pot avea mai mulți utilizatori pentru același salon?", r: "Da, în planul Pro și Business. Mergi la Echipa mea și invită membri cu roluri diferite: groomer, manager, contabil." },
];

export default function SuportParteneri() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticket, setTicket] = useState({ subiect: "", mesaj: "", urgenta: "normala" });
  const [trimis, setTrimis] = useState(false);

  function trimiteTicket() {
    if (!ticket.subiect.trim() || !ticket.mesaj.trim()) return;
    setTrimis(true);
    setTimeout(() => { setTrimis(false); setTicket({ subiect: "", mesaj: "", urgenta: "normala" }); }, 3500);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        <section style={{ background: "linear-gradient(135deg, #FF6B00 0%, #FF8C42 100%)", padding: "72px 20px", color: "#fff", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,.15)", padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 22, border: "1px solid rgba(255,255,255,.25)" }}>⚡ Suport prioritar pentru parteneri</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>
              Ești partener CalyHub.<br />Te ajutăm să crești.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, opacity: .95, maxWidth: 560, margin: "0 auto" }}>
              Echipa noastră de suport e dedicată exclusiv saloanelor partenere. Răspuns rapid, soluții reale, fără bot-uri.
            </p>
          </div>
        </section>

        <section style={{ padding: "64px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Canale de contact</div>
              <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#1A1A1A" }}>Alege cum vrei să ne contactezi</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              {CANALE.map(c => (
                <div key={c.titlu} style={{ background: "#fff", borderRadius: 20, padding: "26px 22px", border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.07)" }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{c.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{c.titlu}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: c.culoare, marginBottom: 10, wordBreak: "break-all" }}>{c.info}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "20px", background: "#FAFAFA" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", background: "#1A1A1A", borderRadius: 24, padding: "36px 32px", color: "#fff" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 28 }}>
              {[
                ["⚡", "4h", "Timp mediu de răspuns"],
                ["🎯", "98%", "Probleme rezolvate la primul contact"],
                ["🛡️", "24/7", "Chat în panoul de control"],
                ["💯", "500+", "Saloane partenere active"],
              ].map(([icon, val, label]) => (
                <div key={label as string} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#FF8C42" }}>{val}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "64px 20px", background: "#FAFAFA" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Resurse utile</div>
              <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#1A1A1A" }}>Învață singur, oricând</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              {RESURSE.map(r => (
                <div key={r.titlu} style={{ background: "#fff", borderRadius: 18, padding: "24px 22px", border: "1.5px solid #EBEBEB" }}>
                  <div style={{ fontSize: 30, marginBottom: 12 }}>{r.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>{r.titlu}</h3>
                  <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.65 }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "64px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Întrebări frecvente</div>
              <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#1A1A1A" }}>Răspunsuri rapide pentru saloane</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FAQ_PARTENERI.map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, border: openFaq === i ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", overflow: "hidden" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{item.q}</span>
                    <span style={{ fontSize: 12, color: "#9CA3AF", flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
                  </button>
                  {openFaq === i && <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.75, padding: "0 20px 16px" }}>{item.r}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "64px 20px", background: "#FAFAFA" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Deschide ticket</div>
              <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>Nu ai găsit răspunsul?</h2>
              <p style={{ fontSize: 14, color: "#6B7280" }}>Trimite-ne detaliile și primești răspuns prin email în max. 4 ore</p>
            </div>

            {trimis ? (
              <div style={{ background: "#ECFDF5", border: "2px solid #10B981", borderRadius: 20, padding: "32px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#065F46", marginBottom: 8 }}>Ticket trimis cu succes!</div>
                <div style={{ fontSize: 14, color: "#047857" }}>Vei primi răspuns la emailul contului în maximum 4 ore.</div>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 20, padding: "28px 26px", border: "1.5px solid #EBEBEB" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Subiect *</label>
                    <input value={ticket.subiect} onChange={e => setTicket(t => ({ ...t, subiect: e.target.value }))}
                      placeholder="Ex: Nu pot adăuga un serviciu nou"
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Nivel urgență</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {[["scazuta", "Scăzută", "#10B981"], ["normala", "Normală", "#FF6B00"], ["urgenta", "Urgentă", "#EF4444"]].map(([val, label, col]) => (
                        <button key={val} onClick={() => setTicket(t => ({ ...t, urgenta: val }))}
                          style={{ padding: "10px", borderRadius: 10, border: ticket.urgenta === val ? `2px solid ${col}` : "1.5px solid #EBEBEB", background: ticket.urgenta === val ? `${col}15` : "#fff", color: ticket.urgenta === val ? col : "#6B7280", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Descrie problema *</label>
                    <textarea value={ticket.mesaj} onChange={e => setTicket(t => ({ ...t, mesaj: e.target.value }))}
                      rows={5}
                      placeholder="Cu cât mai multe detalii, cu atât te ajutăm mai repede..."
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
                  </div>
                  <button onClick={trimiteTicket}
                    style={{ padding: "14px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif", marginTop: 6 }}>
                    Trimite ticket →
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
