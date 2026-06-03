"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "../../components/Footer";
import ResetTheme from "../../components/ResetTheme";
import { supabase } from "../../lib/supabase";

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid #EF4444" };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!email.trim()) { setError("Câmp obligatoriu"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Email invalid"); return; }

    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setLoading(false);

    // Pentru securitate, afisam mesajul de succes indiferent de raspuns
    // (ca sa nu confirmam daca un email exista in DB)
    if (err) console.error("Reset password error:", err);
    setSent(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <ResetTheme />
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 74 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={160} height={54} style={{ height: 54, width: "auto", objectFit: "contain" }} priority /></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Intră în cont</Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,48px)", border: "1px solid #EBEBEB", boxShadow: "0 4px 32px rgba(26,26,26,.08)" }}>
            {sent ? (
              <>
                <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>📧</div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 10 }}>Verifică emailul</h1>
                <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
                  Dacă există un cont asociat adresei <strong style={{ color: "#1A1A1A" }}>{email}</strong>, ți-am trimis un link pentru resetarea parolei.
                </p>
                <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 24 }}>
                  Nu ai primit emailul? Verifică folderul Spam sau încearcă din nou peste câteva minute.
                </p>
                <Link href="/login" style={{ display: "block", padding: "14px 24px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textAlign: "center", textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                  ← Înapoi la conectare
                </Link>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 6 }}>Ai uitat parola? 🔑</h1>
                <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 28 }}>Introdu emailul și îți trimitem un link de resetare</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Email</label>
                    <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }} type="email" placeholder="nume@email.com"
                      style={error ? inpErr : inp}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    {error && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{error}</div>}
                  </div>
                  <button onClick={handleSubmit} disabled={loading}
                    style={{ padding: "14px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif", marginTop: 4 }}>
                    {loading ? "Se trimite..." : "Trimite link de resetare →"}
                  </button>
                </div>

                <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #EBEBEB" }}>
                  <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textDecoration: "none" }}>← Înapoi la conectare</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
}
