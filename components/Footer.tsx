import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#1A1A1A",
        padding: "28px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Image
          src="/logo.png"
          alt="CalyHub"
          width={100}
          height={36}
          style={{
            height: "32px",
            width: "auto",
            filter: "brightness(0) invert(1)",
            opacity: 0.8,
          }}
        />

        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          © 2026 CalyHub · România
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { href: "/login", label: "Conectare" },
            { href: "/register/salon", label: "Saloane" },
            { href: "/pricing", label: "Prețuri" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
