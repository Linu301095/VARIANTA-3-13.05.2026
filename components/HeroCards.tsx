"use client";

import Link from "next/link";
import { useState } from "react";

function OwnerCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: "280px",
        background: "#fff",
        borderRadius: "24px",
        padding: "clamp(28px, 4vw, 44px)",
        boxShadow: hovered
          ? "0 16px 48px rgba(26, 26, 26, 0.14)"
          : "0 2px 20px rgba(26, 26, 26, 0.07)",
        border: "1px solid #F0EDE9",
        transition: "all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        cursor: "default",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "#FFF3EA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
        }}
      >
        🐾
      </div>

      {/* Label */}
      <div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#FF6B00",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Ești stăpân de animale
        </span>
      </div>

      {/* Titlu */}
      <h2
        style={{
          fontSize: "clamp(22px, 3vw, 30px)",
          fontWeight: 900,
          color: "#1A1A1A",
          lineHeight: 1.15,
          marginTop: "-8px",
        }}
      >
        Programează-ți<br />animăluțul
      </h2>

      {/* Descriere */}
      <p
        style={{
          fontSize: "15px",
          color: "#6B7280",
          lineHeight: 1.7,
          flexGrow: 1,
        }}
      >
        Găsește salonul potrivit, alege ora și primești reminder prin SMS — fără telefoane, fără așteptare.
      </p>

      {/* Features mini */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { icon: "📅", text: "Programări 24/7, fără telefon" },
          { icon: "📱", text: "Reminder SMS automat" },
          { icon: "🐕", text: "Profil animăluț salvat" },
        ].map((f) => (
          <div
            key={f.text}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <span style={{ fontSize: "16px" }}>{f.icon}</span>
            <span
              style={{ fontSize: "13px", fontWeight: 600, color: "#4B5563" }}
            >
              {f.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/search"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "14px 24px",
          borderRadius: "50px",
          background: "#FF6B00",
          color: "#fff",
          fontFamily: "Nunito, sans-serif",
          fontSize: "15px",
          fontWeight: 800,
          textDecoration: "none",
          boxShadow: "0 6px 20px rgba(255, 107, 0, 0.35)",
          transition: "all 0.15s",
          marginTop: "4px",
        }}
      >
        Vreau o programare
        <span style={{ fontSize: "18px" }}>→</span>
      </Link>
    </div>
  );
}

function SalonCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: "280px",
        background: "#1A1A1A",
        borderRadius: "24px",
        padding: "clamp(28px, 4vw, 44px)",
        boxShadow: hovered
          ? "0 16px 48px rgba(26, 26, 26, 0.4)"
          : "0 2px 20px rgba(26, 26, 26, 0.18)",
        transition: "all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "rgba(255, 107, 0, 0.12)",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "rgba(255, 107, 0, 0.2)",
          border: "1px solid rgba(255, 107, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
          position: "relative",
        }}
      >
        ✂️
      </div>

      {/* Label */}
      <div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#FF6B00",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Ai un salon de grooming
        </span>
      </div>

      {/* Titlu */}
      <h2
        style={{
          fontSize: "clamp(22px, 3vw, 30px)",
          fontWeight: 900,
          color: "#fff",
          lineHeight: 1.15,
          marginTop: "-8px",
          position: "relative",
        }}
      >
        Umple-ți<br />calendarul
      </h2>

      {/* Descriere */}
      <p
        style={{
          fontSize: "15px",
          color: "rgba(255, 255, 255, 0.65)",
          lineHeight: 1.7,
          flexGrow: 1,
          position: "relative",
        }}
      >
        Primești programări online, reduci neprezentările cu 70% și urmărești statisticile salonului.
      </p>

      {/* Stats mini */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
        }}
      >
        {[
          { stat: "-70%", label: "Neprezentări" },
          { stat: "3h", label: "Economisite pe zi" },
          { stat: "+40%", label: "Clienți noi" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 900,
                color: "#FF6B00",
                minWidth: "44px",
              }}
            >
              {s.stat}
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Badge gratuit */}
      <div
        style={{
          background: "rgba(255, 107, 0, 0.15)",
          border: "1px solid rgba(255, 107, 0, 0.3)",
          borderRadius: "12px",
          padding: "10px 14px",
          position: "relative",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#FF6B00" }}>
          🎁 Primele 3 luni gratuite
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: "2px",
          }}
        >
          Fără card · 0% comision · Anulezi oricând
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/register/salon"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "14px 24px",
          borderRadius: "50px",
          background: "#FF6B00",
          color: "#fff",
          fontFamily: "Nunito, sans-serif",
          fontSize: "15px",
          fontWeight: 800,
          textDecoration: "none",
          boxShadow: "0 6px 20px rgba(255, 107, 0, 0.4)",
          transition: "all 0.15s",
          marginTop: "4px",
          position: "relative",
        }}
      >
        Înscrie salonul
        <span style={{ fontSize: "18px" }}>→</span>
      </Link>
    </div>
  );
}

export default function HeroCards() {
  return (
    <section
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "clamp(48px, 8vw, 80px) 20px clamp(60px, 10vw, 100px)",
      }}
    >
      {/* Headline deasupra cardurilor */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "clamp(36px, 5vw, 56px)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#FFF3EA",
            border: "1px solid #FFDCC6",
            borderRadius: "50px",
            padding: "7px 18px",
            marginBottom: "18px",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#FF6B00" }}>
            🐾 500+ saloane · Programare în 10 secunde
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 900,
            color: "#1A1A1A",
            lineHeight: 1.1,
            marginBottom: "14px",
          }}
        >
          Grooming de top pentru<br />
          <span style={{ color: "#FF6B00" }}>animăluțul tău iubit.</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            color: "#6B7280",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          Fie că ești iubitor de animale sau deții un salon —
          CalyHub e construit pentru tine.
        </p>
      </div>

      {/* Carduri */}
      <div
        style={{
          display: "flex",
          gap: "clamp(16px, 2.5vw, 24px)",
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        <OwnerCard />
        <SalonCard />
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(24px, 5vw, 56px)",
          flexWrap: "wrap",
          marginTop: "clamp(40px, 6vw, 60px)",
          paddingTop: "clamp(24px, 4vw, 36px)",
          borderTop: "1px solid #F0EDE9",
        }}
      >
        {[
          { val: "500+", label: "Saloane" },
          { val: "24/7", label: "Disponibil" },
          { val: "-70%", label: "Neprezentări" },
          { val: "10s", label: "Programare" },
        ].map((s, i, arr) => (
          <div key={s.val} style={{ display: "flex", alignItems: "center", gap: "clamp(24px, 5vw, 56px)" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "clamp(22px, 3.5vw, 32px)",
                  fontWeight: 900,
                  color: "#1A1A1A",
                  lineHeight: 1,
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#9CA3AF",
                  marginTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {s.label}
              </div>
            </div>
            {i < arr.length - 1 && (
              <div
                style={{
                  width: "1px",
                  height: "32px",
                  background: "#E5E7EB",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
