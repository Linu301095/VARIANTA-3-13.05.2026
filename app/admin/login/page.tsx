"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = "CalyHub2026Admin!";
const SESSION_HOURS = 24;

export default function AdminLogin() {
  const router = useRouter();
  const [parola, setParola] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [eroare, setEroare] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sess = localStorage.getItem("calyhub_admin_session");
    if (sess) {
      try {
        const { expiresAt } = JSON.parse(sess);
        if (expiresAt > Date.now()) router.replace("/admin");
      } catch {}
    }
  }, [router]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    setEroare("");
    setLoading(true);
    setTimeout(() => {
      if (parola === ADMIN_PASSWORD) {
        const expiresAt = Date.now() + SESSION_HOURS * 3600 * 1000;
        localStorage.setItem("calyhub_admin_session", JSON.stringify({ loggedAt: Date.now(), expiresAt }));
        router.push("/admin");
      } else {
        setEroare("Parolă incorectă. Încearcă din nou.");
        setLoading(false);
      }
    }, 400);
  }

  const inp: React.CSSProperties = { width: "100%", padding: "14px 18px", borderRadius: 12, border: "2px solid #2A2A2A", background: "#0A0A0A", color: "#fff", fontSize: 15, fontFamily: "Nunito, sans-serif", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#111", border: "1px solid #2A2A2A", borderRadius: 24, padding: "40px 32px", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <div style={{ background: "#fff", padding: "10px 14px", borderRadius: 12, marginBottom: 14 }}>
            <Image src="/logo.png" alt="CalyHub" width={120} height={40} style={{ height: 40, width: "auto", objectFit: "contain" }} priority />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FF6B00", color: "#fff", padding: "4px 12px", borderRadius: 50, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
            🔒 Zonă restricționată
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6, textAlign: "center" }}>Panou Administrator</h1>
        <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 26 }}>Introdu parola pentru a accesa panoul de control complet.</p>

        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              placeholder="Parolă admin"
              style={{ ...inp, paddingRight: 50 }}
              autoFocus
              required
            />
            <button type="button" onClick={() => setShowPass((s) => !s)}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", fontSize: 18, padding: 8, color: "#9CA3AF" }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>

          {eroare && (
            <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#FCA5A5", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
              ⚠️ {eroare}
            </div>
          )}

          <button type="submit" disabled={loading || !parola}
            style={{ padding: "14px", borderRadius: 12, border: "none", background: loading ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 900, cursor: loading ? "default" : "pointer", fontFamily: "Nunito, sans-serif", marginTop: 4 }}>
            {loading ? "Se verifică..." : "Conectare →"}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: "14px 16px", background: "rgba(255,107,0,.08)", borderRadius: 10, fontSize: 12, color: "#9CA3AF", lineHeight: 1.6, textAlign: "center" }}>
          Acces monitorizat. Toate acțiunile sunt logate.<br />
          <span style={{ color: "#6B7280", fontSize: 11 }}>Sesiune valabilă 24 ore.</span>
        </div>
      </div>
    </div>
  );
}
