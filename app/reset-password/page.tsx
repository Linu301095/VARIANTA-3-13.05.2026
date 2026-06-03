"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import ResetTheme from "../../components/ResetTheme";
import { supabase } from "../../lib/supabase";

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid #EF4444" };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [parola, setParola] = useState("");
  const [confirmare, setConfirmare] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase pune automat sesiunea din URL hash cand userul vine din emailul de reset
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setHasSession(true);
    });
    // Fallback: verificam sesiunea direct
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasSession(true);
      else if (hasSession === null) setHasSession(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!parola) e.parola = "Câmp obligatoriu";
    else if (parola.length < 8) e.parola = "Minim 8 caractere";
    if (!confirmare) e.confirmare = "Câmp obligatoriu";
    else if (parola && confirmare !== parola) e.confirmare = "Parolele nu coincid";
    return e;
  }

  async function handleSubmit() {
    setGlobalError("");
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parola });
    setLoading(false);

    if (error) {
      setGlobalError(error.message || "A apărut o eroare. Încearcă din nou.");
      return;
    }

    setSuccess(true);
    // Iesim din sesiunea de recovery si redirect la login dupa 2 secunde
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <ResetTheme />
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 74 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={160} height={54} style={{ height: 54, width: "auto", objectFit: "contain" }} priority /></Link>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,48px)", border: "1px solid #EBEBEB", boxShadow: "0 4px 32px rgba(26,26,26,.08)" }}>
            {success ? (
              <>
                <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>✅</div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 10 }}>Parolă schimbată!</h1>
                <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>Te redirecționăm către pagina de conectare...</p>
              </>
            ) : hasSession === false ? (
              <>
                <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>⚠️</div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 10 }}>Link invalid sau expirat</h1>
                <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
                  Acest link de resetare nu mai este valid. Cere unul nou pentru a continua.
                </p>
                <Link href="/forgot-password" style={{ display: "block", padding: "14px 24px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, textAlign: "center", textDecoration: "none", boxShadow: "0 6px 20px rgba(255,107,0,.35)" }}>
                  Cere link nou →
                </Link>
              </>
            ) : hasSession === null ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF", fontSize: 14 }}>Se verifică linkul...</div>
            ) : (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 6 }}>Setează parolă nouă 🔐</h1>
                <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 28 }}>Alege o parolă sigură pentru contul tău</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Parolă nouă</label>
                    <div style={{ position: "relative" }}>
                      <input value={parola} onChange={e => { setParola(e.target.value); setErrors(er => ({ ...er, parola: "" })); }} type={showPass ? "text" : "password"} placeholder="Minim 8 caractere"
                        style={{ ...(errors.parola ? inpErr : inp), paddingRight: 46 }}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                      <button type="button" onClick={() => setShowPass(s => !s)} aria-label={showPass ? "Ascunde parola" : "Arată parola"}
                        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "8px 10px", color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {showPass ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    {errors.parola && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.parola}</div>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Confirmă parola</label>
                    <input value={confirmare} onChange={e => { setConfirmare(e.target.value); setErrors(er => ({ ...er, confirmare: "" })); }} type={showPass ? "text" : "password"} placeholder="Repetă parola"
                      style={errors.confirmare ? inpErr : inp}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    {errors.confirmare && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.confirmare}</div>}
                  </div>
                  {globalError && (
                    <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#EF4444", textAlign: "center" }}>
                      ⚠️ {globalError}
                    </div>
                  )}
                  <button onClick={handleSubmit} disabled={loading}
                    style={{ padding: "14px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif", marginTop: 4 }}>
                    {loading ? "Se salvează..." : "Salvează parola nouă →"}
                  </button>
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
