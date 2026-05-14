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
          gap: "16px",
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <Image
            src="/logo.png"
            alt="CalyHub"
            width={120}
            height={42}
            style={{
              height: "38px",
              width: "auto",
              objectFit: "contain",
              background: "#fff",
              borderRadius: "10px",
              padding: "4px 10px",
            }}
          />
        </Link>

        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
          © 2026 CalyHub · România
        </div>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { href: "/", label: "Acasă" },
            { href: "/login", label: "Conectare" },
            { href: "/register", label: "Înregistrare" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
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
