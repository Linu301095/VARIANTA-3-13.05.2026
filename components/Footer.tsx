import Image from "next/image";
import Link from "next/link";

type Variant = "full" | "auth" | "payment" | "client" | "salon";

const LOGO = (
  <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
    <Image src="/logo.png" alt="CalyHub" width={120} height={42}
      style={{ height: "38px", width: "auto", objectFit: "contain", background: "#fff", borderRadius: "10px", padding: "4px 10px" }} />
  </Link>
);

const linkStyle: React.CSSProperties = { fontSize: 13, color: "rgba(255,255,255,.65)", textDecoration: "none", fontWeight: 600, display: "block", padding: "3px 0" };
const linkStyleSm: React.CSSProperties = { fontSize: 12, color: "rgba(255,255,255,.55)", textDecoration: "none", fontWeight: 600 };
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

export default function Footer({ variant = "full" }: { variant?: Variant }) {
  /* ----- FULL (landing page) — 4 coloane ----- */
  if (variant === "full") {
    return (
      <footer style={wrapper}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
          <div>
            {LOGO}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.7, marginTop: 14, maxWidth: 240 }}>
              Platforma #1 din România pentru programări la salon de grooming.
            </p>
            <div style={{ marginTop: 16 }}><SocialIcons /></div>
          </div>

          <div>
            <div style={titleStyle}>🐾 Clienți</div>
            <Link href="/cum-functioneaza" style={linkStyle}>Cum funcționează</Link>
            <Link href="/login" style={linkStyle}>Caută saloane</Link>
            <Link href="/login" style={linkStyle}>Programările mele</Link>
            <Link href="/register" style={linkStyle}>Înregistrare gratuită</Link>
          </div>

          <div>
            <div style={titleStyle}>✂️ Saloane</div>
            <Link href="/register" style={linkStyle}>Înregistrează salon</Link>
            <Link href="/register/abonament-salon" style={linkStyle}>Prețuri & abonamente</Link>
            <Link href="/cum-functioneaza" style={linkStyle}>Cum funcționează</Link>
            <Link href="/suport-parteneri" style={linkStyle}>Suport parteneri</Link>
          </div>

          <div>
            <div style={titleStyle}>📋 Companie</div>
            <Link href="/despre-noi" style={linkStyle}>Despre noi</Link>
            <a href="mailto:contact@calyhub.ro" style={linkStyle}>Contact</a>
            <Link href="/termeni" style={linkStyle}>Termeni & Condiții</Link>
            <Link href="/confidentialitate" style={linkStyle}>Confidențialitate</Link>
          </div>
        </div>

        <div style={bottomBar}>
          <div style={copyright}>© 2026 CalyHub · România · contact@calyhub.ro</div>
          <div style={{ display: "flex", gap: 18 }}>
            <Link href="/confidentialitate" style={linkStyleSm}>Cookies & GDPR</Link>
            <Link href="/termeni" style={linkStyleSm}>Termeni</Link>
            <Link href="/confidentialitate" style={linkStyleSm}>Confidențialitate</Link>
          </div>
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
            <Link href="/" style={linkStyleSm}>Acasă</Link>
            <Link href="/login" style={linkStyleSm}>Conectare</Link>
            <Link href="/register" style={linkStyleSm}>Înregistrare</Link>
            <a href="mailto:support@calyhub.ro" style={linkStyleSm}>support@calyhub.ro</a>
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
            <span style={{ ...linkStyleSm, color: "#10B981" }}>🔒 Plată securizată</span>
            <span style={{ ...linkStyleSm, color: "#FF8C42" }}>🛡️ Garanție 30 zile</span>
            <a href="mailto:parteneri@calyhub.ro" style={linkStyleSm}>parteneri@calyhub.ro</a>
            <Link href="/" style={linkStyleSm}>Politică plăți</Link>
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
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/dashboard/client" style={linkStyleSm}>Programările mele</Link>
            <Link href="/dashboard/client" style={linkStyleSm}>Profil</Link>
            <Link href="/dashboard/client" style={linkStyleSm}>Notificări</Link>
            <Link href="/dashboard/client" style={linkStyleSm}>Ajutor</Link>
            <a href="mailto:support@calyhub.ro" style={linkStyleSm}>support@calyhub.ro</a>
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
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/dashboard/salon" style={linkStyleSm}>Agenda</Link>
            <Link href="/dashboard/salon" style={linkStyleSm}>Servicii</Link>
            <Link href="/dashboard/salon" style={linkStyleSm}>Echipa</Link>
            <Link href="/dashboard/salon" style={linkStyleSm}>Abonament</Link>
            <a href="mailto:parteneri@calyhub.ro" style={{ ...linkStyleSm, color: "#FF8C42" }}>⚡ Suport prioritar</a>
          </div>
          <div style={copyright}>© 2026 CalyHub · Partener</div>
        </div>
      </footer>
    );
  }

  return null;
}
