"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import ResetTheme from "../../components/ResetTheme";
import { SEED_USERS } from "../../lib/seedAccounts";

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid #EF4444" };

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", parola: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem("calyhub_users") || "[]");
    const emails = new Set(existing.map((u: any) => u.email.toLowerCase()));
    const missing = SEED_USERS.filter(u => !emails.has(u.email.toLowerCase()));
    if (missing.length > 0) {
      localStorage.setItem("calyhub_users", JSON.stringify([...existing, ...missing]));
    }
  }, []);

  function loginAs(email: string, parola: string) {
    set("email", email);
    set("parola", parola);
    setShowDemoPanel(false);
  }

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    setLoginError("");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Câmp obligatoriu";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalid";
    if (!form.parola) e.parola = "Câmp obligatoriu";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setLoginError("");
    setTimeout(() => {
      const users: any[] = JSON.parse(localStorage.getItem("calyhub_users") || "[]");
      const found = users.find((u: any) => u.email.toLowerCase() === form.email.trim().toLowerCase());
      if (!found || found.parola !== form.parola) {
        setLoginError("Email sau parolă incorectă");
        setLoading(false);
        return;
      }
      localStorage.setItem("calyhub_user", JSON.stringify(found));
      if (found.animal) localStorage.setItem("calyhub_animal", JSON.stringify(found.animal));
      if (found.salon) localStorage.setItem("calyhub_salon", JSON.stringify(found.salon));
      if (found.tema === "dark") {
        document.documentElement.dataset.theme = "dark";
        try { localStorage.setItem("calyhub_theme", "dark"); } catch {}
      }
      if (found.tip === "salon") router.push("/dashboard/salon");
      else router.push("/dashboard/client");
    }, 700);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <ResetTheme />
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/register" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare gratuită</Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,48px)", border: "1px solid #EBEBEB", boxShadow: "0 4px 32px rgba(26,26,26,.08)" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <Image src="/logo.png" alt="CalyHub" width={120} height={40} style={{ height: 40, width: "auto", objectFit: "contain" }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 6 }}>Bine ai revenit! 👋</h1>
            <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 28 }}>Introdu emailul și te ducem în contul tău</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 20px", borderRadius: 12, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", cursor: "pointer", width: "100%", fontFamily: "Nunito, sans-serif" }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Continuă cu Google
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 20px", borderRadius: 12, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", cursor: "pointer", width: "100%", fontFamily: "Nunito, sans-serif" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Continuă cu Facebook
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#EBEBEB" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>sau cu email</span>
              <div style={{ flex: 1, height: 1, background: "#EBEBEB" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Email</label>
                <input value={form.email} onChange={e => set("email", e.target.value)} type="email" placeholder="nume@email.com" style={errors.email ? inpErr : inp} />
                {errors.email && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.email}</div>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Parolă</label>
                <div style={{ position: "relative" }}>
                  <input value={form.parola} onChange={e => set("parola", e.target.value)} type={showPass ? "text" : "password"} placeholder="••••••••" style={{ ...(errors.parola ? inpErr : inp), paddingRight: 46 }} />
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
              {loginError && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#EF4444", textAlign: "center" }}>
                  ⚠️ {loginError}
                </div>
              )}
              <button onClick={handleSubmit} disabled={loading}
                style={{ padding: "14px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif", marginTop: 4 }}>
                {loading ? "Se verifică..." : "Intră în cont →"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Link href="/forgot-password" style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", fontWeight: 600 }}>Ai uitat parola?</Link>
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px dashed #EBEBEB" }}>
              <button type="button" onClick={() => setShowDemoPanel(s => !s)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #EBEBEB", background: showDemoPanel ? "#FFF3EA" : "#fff", color: showDemoPanel ? "#FF6B00" : "#6B7280", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {showDemoPanel ? "▲ Ascunde" : "▼ Conturi demo pentru testare (20)"}
              </button>
              {showDemoPanel && (
                <div style={{ marginTop: 10, border: "1.5px solid #EBEBEB", borderRadius: 12, padding: 10, maxHeight: 280, overflowY: "auto", background: "#FAFAFA" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, padding: "0 4px" }}>🐾 Clienți</div>
                  {SEED_USERS.filter(u => u.tip === "client").map(u => (
                    <button key={u.email} type="button" onClick={() => loginAs(u.email, u.parola)}
                      style={{ width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontFamily: "Nunito, sans-serif", fontSize: 12, color: "#374151", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fff"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ fontWeight: 700 }}>{u.email}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{u.numeComplet}</span>
                    </button>
                  ))}
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, margin: "10px 0 6px", padding: "0 4px" }}>✂️ Saloane</div>
                  {SEED_USERS.filter(u => u.tip === "salon").map(u => (
                    <button key={u.email} type="button" onClick={() => loginAs(u.email, u.parola)}
                      style={{ width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontFamily: "Nunito, sans-serif", fontSize: 12, color: "#374151", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fff"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ fontWeight: 700 }}>{u.email}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{(u as any).numeSalon}</span>
                    </button>
                  ))}
                  <div style={{ fontSize: 11, color: "#9CA3AF", padding: "8px 4px 2px", textAlign: "center", fontStyle: "italic" }}>Click pe un cont → completează formularul · parolă: <strong>test</strong></div>
                </div>
              )}
            </div>
            <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #EBEBEB" }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Nu ai cont? </span>
              <Link href="/register" style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", textDecoration: "none" }}>Înregistrează-te gratuit</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
}
