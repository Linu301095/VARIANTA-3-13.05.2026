"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [tip, setTip] = useState<"client" | "salon">("client");

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,48px)", border: "1px solid #EBEBEB", boxShadow: "0 4px 32px rgba(26,26,26,.08)" }}>
            
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <Image src="/logo.png" alt="CalyHub" width={120} height={40} style={{ height: 40, width: "auto", objectFit: "contain" }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 6 }}>Creează cont gratuit 🐾</h1>
            <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>Alege tipul de cont potrivit</p>

            {/* Toggle tip cont */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              <button
                onClick={() => setTip("client")}
                style={{ border: tip === "client" ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", borderRadius: 16, padding: "16px 12px", textAlign: "center", cursor: "pointer", background: tip === "client" ? "#FFF3EA" : "#fff", transition: "all .2s" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🐾</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>Client salon</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Programezi animăluțul</div>
              </button>
              <button
                onClick={() => setTip("salon")}
                style={{ border: tip === "salon" ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", borderRadius: 16, padding: "16px 12px", textAlign: "center", cursor: "pointer", background: tip === "salon" ? "#FFF3EA" : "#fff", transition: "all .2s" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✂️</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>Salon grooming</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Primești programări</div>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Camp salon — doar dacă e selectat salon */}
              {tip === "salon" && (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Numele salonului *</label>
                  <input type="text" placeholder="Ex: Salon Pets București" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Nume complet *</label>
                <input type="text" placeholder="Ion Popescu" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Email *</label>
                <input type="email" placeholder="nume@email.com" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Telefon *</label>
                <input type="tel" placeholder="07XX XXX XXX" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Parolă *</label>
                <input type="password" placeholder="Minim 8 caractere" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>

              {tip === "salon" && (
                <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00" }}>🎁 3 luni gratuite pentru parteneri fondatori</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>0% comision · Suport dedicat</div>
                </div>
              )}

              <button style={{ padding: "14px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif" }}>
                Creează cont gratuit →
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #EBEBEB" }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Ai deja cont? </span>
              <Link href="/login" style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", textDecoration: "none" }}>Conectează-te</Link>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ background: "#111", padding: "20px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <Image src="/logo.png" alt="CalyHub" width={80} height={28} style={{ height: 26, width: "auto", filter: "brightness(0) invert(1)", opacity: .6 }} />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.28)" }}>© 2026 CalyHub · România</div>
        </div>
      </footer>
    </div>
  );
}
