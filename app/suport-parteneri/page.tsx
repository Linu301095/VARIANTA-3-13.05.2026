"use client";

import Link from "next/link";
import Logo from "../../components/Logo";
import { useState } from "react";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import {
  Mail, LifeBuoy, Store, SlidersHorizontal, BarChart3, Sparkles,
  ChevronDown, MessageSquare, type LucideIcon,
} from "lucide-react";

const C = {
  surface: "var(--pub-surface)",
  bg: "var(--pub-bg)",
  surface2: "var(--pub-surface2)",
  line: "var(--pub-line)",
  text: "var(--pub-text)",
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

const GHIDURI: { Icon: LucideIcon; t: string; d: string; href: string }[] = [
  { Icon: Store, t: "Cum îți înscrii salonul", d: "Alegi tipul salonului, adaugi servicii, prețuri, echipă și galerie foto.", href: "/cum-functioneaza#parteneri" },
  { Icon: SlidersHorizontal, t: "Cum configurezi agenda", d: "Orar per specialist, sloturi de 30 de minute și blocări manuale.", href: "/cum-functioneaza#parteneri" },
  { Icon: BarChart3, t: "Cum citești statisticile", d: "Încasări, top servicii, productivitate per specialist și export Excel.", href: "/cum-functioneaza#parteneri" },
  { Icon: Sparkles, t: "Cum folosești agenții AI", d: "Recenzii, clienți inactivi, recomandări post-serviciu și consultant de business.", href: "/instrumente-ai" },
];

const FAQ_PARTENERI = [
  { q: "Cum îmi recuperez accesul dacă uit parola?", r: "Apeși pe „Ai uitat parola?” în pagina de conectare. Primești un link de resetare pe emailul asociat contului." },
  { q: "Cum modific serviciile și prețurile?", r: "Din panoul salonului, la secțiunea de servicii. Modificările apar imediat pe profilul public. Programările deja confirmate păstrează prețul de la momentul rezervării." },
  { q: "Cum încasez banii de la clienți?", r: "Direct la salon, ca și până acum. CalyHub nu procesează plăți și nu percepe comision pe programări — tu plătești doar abonamentul lunar." },
  { q: "Ce fac dacă un client nu se prezintă?", r: "Marchezi programarea corespunzător în agendă. Ai istoricul fiecărui client și, dacă e cazul, îl poți bloca din panoul salonului." },
  { q: "Pot anula o programare confirmată?", r: "Da, din agendă. Clientul primește automat notificare în aplicație și poate alege alt interval." },
  { q: "Pot avea mai mulți utilizatori pentru același salon?", r: "Da, în planurile Pro și Business. Adaugi specialiștii din secțiunea Echipa mea, fiecare cu orarul lui." },
  { q: "Cum îmi schimb planul?", r: "Oricând, din secțiunea de abonament a panoului. Poți urca sau coborî planul în funcție de mărimea echipei." },
  { q: "Cum răspund la o recenzie negativă?", r: "Din secțiunea Recenzii poți răspunde public. Agentul AI îți poate pregăti un răspuns profesional, pe care îl editezi înainte de trimitere." },
];

export default function SuportParteneri() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticket, setTicket] = useState({ subiect: "", mesaj: "" });
  const [trimis, setTrimis] = useState(false);

  function trimiteTicket() {
    if (!ticket.subiect.trim() || !ticket.mesaj.trim()) return;
    const subject = encodeURIComponent(ticket.subiect.trim());
    const body = encodeURIComponent(ticket.mesaj.trim());
    window.location.href = `mailto:parteneri@calyhub.ro?subject=${subject}&body=${body}`;
    setTrimis(true);
    setTimeout(() => { setTrimis(false); setTicket({ subiect: "", mesaj: "" }); }, 3500);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "13px 16px", borderRadius: 14,
    border: `1.5px solid ${C.line}`, background: "var(--pub-surface)", fontSize: 15,
    fontFamily: "Nunito, sans-serif", outline: "none", color: C.text,
  };
  const gol = !ticket.subiect.trim() || !ticket.mesaj.trim();

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
        <section style={{ position: "relative", overflow: "hidden", padding: "76px 20px 44px" }}>
          <div className="ch-orb" style={{ width: 320, height: 320, background: "rgba(255,107,0,.18)", top: -130, left: "16%" }} />
          <div className="ch-orb b" style={{ width: 280, height: 280, background: "rgba(255,140,66,.14)", top: 0, right: "10%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <div className="ch-hero-anim" style={{ display: "flex", justifyContent: "center", marginBottom: 18, animationDelay: ".05s" }}>
              <div style={{ width: 60, height: 60, borderRadius: 17, background: C.orangeSoft, border: "1.5px solid var(--pub-orange-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LifeBuoy size={27} color={C.orange} strokeWidth={2} />
              </div>
            </div>
            <div className="ch-hero-anim" style={{ ...eyebrow, marginBottom: 18, animationDelay: ".12s" }}>Suport parteneri</div>
            <h1 className="ch-hero-anim" style={{ fontSize: "clamp(30px,4.6vw,46px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: -1.4, color: C.text, animationDelay: ".2s" }}>
              Suntem alături de salonul tău
            </h1>
            <p className="ch-hero-anim" style={{ margin: "18px auto 0", maxWidth: "54ch", fontSize: 17.5, lineHeight: 1.7, fontWeight: 500, color: C.muted, animationDelay: ".3s" }}>
              Ghiduri, răspunsuri la întrebările frecvente și o adresă directă de contact. Dacă rămâi blocat undeva,
              scrie-ne și rezolvăm împreună.
            </p>
            <div className="ch-hero-anim" style={{ display: "flex", justifyContent: "center", marginTop: 24, animationDelay: ".38s" }}>
              <a href="mailto:parteneri@calyhub.ro" style={btnPrimary}><Mail size={17} strokeWidth={2.2} /> parteneri@calyhub.ro</a>
            </div>
          </div>
        </section>

        {/* GHIDURI */}
        <section style={{ padding: "24px 20px 64px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 30px" }}>
              <div data-reveal style={eyebrow}>Ghiduri rapide</div>
              <h2 data-reveal style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text, marginTop: 12 }}>De unde începi</h2>
            </div>
            <div className="ch-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {GHIDURI.map(({ Icon, t, d, href }) => (
                <Link key={t} href={href} data-reveal className="ch-tile" style={{ ...tile, textDecoration: "none", display: "block" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Icon size={20} color={C.orange} strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: C.surface2, padding: "56px 20px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 30px" }}>
              <div data-reveal style={eyebrow}>Întrebări frecvente</div>
              <h2 data-reveal style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text, marginTop: 12 }}>Ce întreabă partenerii</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FAQ_PARTENERI.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} data-reveal style={{ background: C.surface, border: `1px solid ${open ? "var(--pub-orange-border)" : C.line}`, borderRadius: 20, overflow: "hidden", transition: "border-color .2s" }}>
                    <button type="button" onClick={() => setOpenFaq(open ? null : i)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "18px 22px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                      <span style={{ fontSize: 15.5, fontWeight: 800, color: C.text }}>{f.q}</span>
                      <ChevronDown size={19} color={C.orange} strokeWidth={2.4} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
                    </button>
                    {open && (
                      <div style={{ padding: "0 22px 20px", fontSize: 14.5, color: C.muted, fontWeight: 600, lineHeight: 1.7 }}>{f.r}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONTACT DIRECT */}
        <section style={{ padding: "56px 20px 76px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div data-reveal style={eyebrow}><MessageSquare size={13} strokeWidth={2.4} /> Scrie-ne</div>
              <h2 data-reveal style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text, marginTop: 12 }}>Nu ai găsit răspunsul?</h2>
              <p data-reveal style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 10 }}>
                Descrie pe scurt situația și îți răspundem pe email, în zilele lucrătoare.
              </p>
            </div>
            <div data-reveal className="ch-card" style={card}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 7 }}>Subiect</label>
                  <input value={ticket.subiect} onChange={(e) => setTicket({ ...ticket, subiect: e.target.value })}
                    placeholder="Ex: Nu îmi apare salonul în listă" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 7 }}>Mesaj</label>
                  <textarea value={ticket.mesaj} onChange={(e) => setTicket({ ...ticket, mesaj: e.target.value })}
                    placeholder="Descrie pe scurt ce se întâmplă…" rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <button type="button" onClick={trimiteTicket} disabled={gol}
                  style={{ ...btnPrimary, border: "none", cursor: gol ? "not-allowed" : "pointer", opacity: gol ? 0.55 : 1, fontFamily: "inherit" }}>
                  {trimis ? "Se deschide emailul…" : "Trimite mesajul"}
                </button>
                <div style={{ fontSize: 12.5, color: C.dim, fontWeight: 600, textAlign: "center" }}>
                  Se deschide clientul tău de email, către <b style={{ color: C.muted }}>parteneri@calyhub.ro</b>
                </div>
              </div>
            </div>
            <div data-reveal style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
              <Link href="/cum-functioneaza#parteneri" style={btnSecondary}>Vezi ghidul complet</Link>
              <Link href="/preturi" style={btnSecondary}>Vezi planurile</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
      <ScrollReveal />
    </div>
  );
}
