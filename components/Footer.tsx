import Image from "next/image";
import Link from "next/link";

type Variant = "full" | "auth" | "payment" | "client" | "salon" | "admin";

const LOGO = (
  <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
    <Image src="/logo.png" alt="CalyHub" width={120} height={42}
      style={{ height: "38px", width: "auto", objectFit: "contain", background: "#fff", borderRadius: "10px", padding: "4px 10px" }} />
  </Link>
);

const linkStyle: React.CSSProperties = { fontSize: 13, color: "#FF8C42", textDecoration: "none", fontWeight: 800, display: "block", padding: "3px 0" };
const linkStyleSm: React.CSSProperties = { fontSize: 12, color: "#FF8C42", textDecoration: "none", fontWeight: 800 };
const titleStyle: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: "#FF8C42", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 };
const wrapper: React.CSSProperties = { background: "#1A1A1A", padding: "44px 20px 28px" };
const wrapperSm: React.CSSProperties = { background: "#1A1A1A", padding: "26px 20px" };
const bottomBar: React.CSSProperties = { maxWidth: 1200, margin: "32px auto 0", paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 };
const copyright: React.CSSProperties = { fontSize: 12, color: "rgba(255,255,255,.4)" };

function SocialIcons() {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[
        { label: "Facebook", icon: "f" },
        { label: "Instagram", icon: "ig" },
        { label: "TikTok", icon: "tk" },
      ].map(s => (
        <a key={s.label} href="#" aria-label={s.label}
          style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.08)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, textDecoration: "none", border: "1px solid rgba(255,255,255,.1)" }}>
          {s.icon}
        </a>
      ))}
    </div>
  );
}

export default function Footer({ variant = "full", onAjutor }: { variant?: Variant; onAjutor?: () => void }) {
  /* ----- FULL (landing page) — 4 coloane ----- */
  if (variant === "full") {
    return (
      <footer style={wrapper}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 28 }}>
          <div style={{ flex: "1 1 260px", minWidth: 0 }}>
            {LOGO}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.7, marginTop: 14, maxWidth: 320 }}>
              Platforma #1 din România pentru programări la salon de grooming.
            </p>
            <div style={{ marginTop: 16 }}><SocialIcons /></div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 40px", justifyContent: "flex-end" }}>
            <div>
              <div style={titleStyle}>Platformă</div>
              <Link href="/cum-functioneaza" className="footer-link" style={linkStyle}>Cum funcționează</Link>
              <Link href="/despre-noi" className="footer-link" style={linkStyle}>Despre noi</Link>
              <Link href="/contact" className="footer-link" style={linkStyle}>Contact</Link>
              <Link href="/termeni" className="footer-link" style={linkStyle}>Termeni și condiții</Link>
              <Link href="/confidentialitate" className="footer-link" style={linkStyle}>Confidențialitate</Link>
            </div>
            <div>
              <div style={titleStyle}>Planuri</div>
              <Link href="/preturi" className="footer-link" style={linkStyle}>🐾 Basic — 69 lei/lună</Link>
              <Link href="/preturi" className="footer-link" style={linkStyle}>⭐ Pro — 119 lei/lună</Link>
              <Link href="/preturi" className="footer-link" style={linkStyle}>🚀 Business — 219 lei/lună</Link>
              <Link href="/preturi" className="footer-link" style={{ ...linkStyle, color: "#fff", opacity: .7, fontWeight: 600 }}>Compară planurile →</Link>
            </div>
          </div>
        </div>

        <div style={bottomBar}>
          <div style={copyright}>© 2026 CalyHub · România · contact@calyhub.ro</div>
        </div>
      </footer>
    );
  }

  /* ----- AUTH (login / register / configurare) ----- */
  if (variant === "auth") {
    return (
      <footer style={wrapperSm}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          {LOGO}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/" className="footer-link" style={linkStyleSm}>Acasă</Link>
            <Link href="/login" className="footer-link" style={linkStyleSm}>Conectare</Link>
            <Link href="/register" className="footer-link" style={linkStyleSm}>Înregistrare</Link>
            <a href="mailto:support@calyhub.ro" className="footer-link" style={linkStyleSm}>support@calyhub.ro</a>
          </div>
          <div style={copyright}>© 2026 CalyHub</div>
        </div>
      </footer>
    );
  }

  /* ----- PAYMENT (abonament-salon) ----- */
  if (variant === "payment") {
    return (
      <footer style={wrapperSm}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          {LOGO}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span className="footer-link" style={{ ...linkStyleSm, color: "#10B981" }}>🔒 Plată securizată</span>
            <span className="footer-link" style={{ ...linkStyleSm, color: "#FF8C42" }}>🛡️ Garanție 30 zile</span>
            <a href="mailto:parteneri@calyhub.ro" className="footer-link" style={linkStyleSm}>parteneri@calyhub.ro</a>
            <Link href="/" className="footer-link" style={linkStyleSm}>Politică plăți</Link>
          </div>
          <div style={copyright}>© 2026 CalyHub</div>
        </div>
      </footer>
    );
  }

  /* ----- CLIENT (dashboard client) ----- */
  if (variant === "client") {
    return (
      <footer style={wrapperSm}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          {LOGO}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={onAjutor} style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 800, background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", padding: 0 }}>❓ Ajutor pentru clienți</button>
            <a href="mailto:support@calyhub.ro" className="footer-link" style={linkStyleSm}>✉️ support@calyhub.ro</a>
          </div>
          <div style={copyright}>© 2026 CalyHub</div>
        </div>
      </footer>
    );
  }

  /* ----- SALON (dashboard salon) ----- */
  if (variant === "salon") {
    return (
      <footer style={wrapperSm}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          {LOGO}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={onAjutor} style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 800, background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", padding: 0 }}>❓ Ajutor pentru salon</button>
            <a href="mailto:parteneri@calyhub.ro" className="footer-link" style={{ ...linkStyleSm, color: "#FF8C42" }}>✉️ parteneri@calyhub.ro</a>
          </div>
          <div style={copyright}>© 2026 CalyHub · Partener</div>
        </div>
      </footer>
    );
  }

  /* ----- ADMIN (panou administrator) ----- */
  if (variant === "admin") {
    return (
      <footer style={{ ...wrapperSm, background: "#0A0A0A", borderTop: "1px solid #1F1F1F" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {LOGO}
            <span style={{ background: "#FF6B00", color: "#fff", padding: "3px 10px", borderRadius: 50, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Admin</span>
          </div>
          <div style={{ ...copyright, color: "rgba(255,255,255,.5)" }}>
            © 2026 CalyHub · Panou intern · Sesiune securizată
          </div>
        </div>
      </footer>
    );
  }

  return null;
}
