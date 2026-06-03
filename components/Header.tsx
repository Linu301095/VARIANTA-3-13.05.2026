import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#fff",
        borderBottom: "1px solid #F0EDE9",
        height: "76px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="CalyHub"
            width={160}
            height={54}
            style={{
              height: "54px",
              width: "auto",
              objectFit: "contain",
            }}
            priority
          />
        </Link>

        {/* Nav dreapta */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Link
            href="/login"
            style={{
              padding: "9px 16px",
              borderRadius: "50px",
              border: "1.5px solid #E0D8D2",
              background: "#fff",
              fontFamily: "Nunito, sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              color: "#1A1A1A",
              textDecoration: "none",
              transition: "border-color 0.2s",
            }}
          >
            Conectare
          </Link>
          <Link
            href="/register"
            style={{
              padding: "9px 18px",
              borderRadius: "50px",
              border: "none",
              background: "#FF6B00",
              fontFamily: "Nunito, sans-serif",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(255, 107, 0, 0.35)",
            }}
          >
            Înregistrare
          </Link>
        </nav>
      </div>
    </header>
  );
}
