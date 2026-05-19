"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [eroare, setEroare] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profil } = await supabase.from("profiluri").select("rol").eq("id", user.id).single();
      if (profil?.rol === "admin") router.replace("/admin");
    })();
  }, [router]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setEroare("");
    setLoading(true);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password: parola });
    if (signInError || !signInData.user) {
      setEroare("Email sau parolă incorectă.");
      setLoading(false);
      return;
    }

    const { data: profil, error: profilError } = await supabase.from("profiluri").select("rol").eq("id", signInData.user.id).single();
    if (profilError || profil?.rol !== "admin") {
      await supabase.auth.signOut();
      setEroare("Acest cont nu are drepturi de administrator.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  const inp: React.CSSProperties = { width: "100%", padding: "14px 18px", borderRadius: 12, border: "2px solid #2A2A2A", background: "#0A0A0A", color: "#fff", fontSize: 15, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" };

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
        <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 26 }}>Conectează-te cu emailul și parola contului de admin.</p>

        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email admin"
            style={inp}
            autoComplete="email"
            autoFocus
            required
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              placeholder="Parolă admin"
              style={{ ...inp, paddingRight: 50 }}
              autoComplete="current-password"
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

          <button type="submit" disabled={loading || !email || !parola}
            style={{ padding: "14px", borderRadius: 12, border: "none", background: loading ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 900, cursor: loading ? "default" : "pointer", fontFamily: "Nunito, sans-serif", marginTop: 4 }}>
            {loading ? "Se verifică..." : "Conectare →"}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: "14px 16px", background: "rgba(255,107,0,.08)", borderRadius: 10, fontSize: 12, color: "#9CA3AF", lineHeight: 1.6, textAlign: "center" }}>
          Acces monitorizat. Toate acțiunile sunt logate.<br />
          <span style={{ color: "#6B7280", fontSize: 11 }}>Doar conturile cu rol admin pot accesa acest panou.</span>
        </div>
      </div>
    </div>
  );
}
