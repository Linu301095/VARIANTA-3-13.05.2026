"use client";
import Link from "next/link";
import Logo from "../../components/Logo";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { AlertTriangle } from "lucide-react";

const C = {
  surface: "var(--pub-surface)",
  bg: "var(--pub-bg)",
  line: "var(--pub-line)",
  text: "var(--pub-text)",
  text2: "var(--pub-text2)",
  muted: "var(--pub-muted)",
  dim: "var(--pub-dim)",
  orange: "var(--pub-orange)",
  orangeSoft: "var(--pub-orange-soft)",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: 14, border: `1.5px solid ${C.line}`,
  fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box",
  background: "var(--pub-surface)", color: C.text, transition: "border-color .18s, box-shadow .18s",
};
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid var(--pub-danger)" };

const social: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  padding: "12px 20px", borderRadius: 14, border: `1.5px solid ${C.line}`, background: "var(--pub-surface)",
  fontSize: 14, fontWeight: 700, color: C.text, cursor: "pointer", width: "100%",
  fontFamily: "Nunito, sans-serif", transition: "border-color .18s, transform .18s, box-shadow .18s",
};

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ email: "", parola: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [focus, setFocus] = useState<string | null>(null);

  // Daca exista deja o sesiune activa, ducem userul direct in dashboard-ul lui.
  useEffect(() => {
    let anulat = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (anulat || !session?.user) return;
      const { data: profile } = await supabase
        .from("profiluri").select("tip").eq("id", session.user.id).single();
      router.replace(profile?.tip === "salon" ? "/dashboard/salon" : "/dashboard/client");
    })();
    return () => { anulat = true; };
  }, [router]);

  useEffect(() => { emailRef.current?.focus(); }, []);

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

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.parola,
    });

    if (error) {
      setLoginError("Email sau parolă incorectă");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiluri")
      .select("tip, tema, sters_la")
      .eq("id", data.user.id)
      .single();

    // Contul închis nu mai intră: parola încă e validă în Supabase Auth, deci
    // fără verificarea asta „ștergerea" n-ar însemna nimic.
    if (profile?.sters_la) {
      await supabase.auth.signOut();
      setLoginError("Acest cont a fost șters. Dacă vrei să revii, creează un cont nou.");
      setLoading(false);
      return;
    }

    try {
      if (profile?.tema === "dark") {
        localStorage.setItem("calyhub_theme", "dark");
        document.documentElement.dataset.theme = "dark";
      } else {
        localStorage.removeItem("calyhub_theme");
        document.documentElement.dataset.theme = "";
      }
    } catch {}

    if (profile?.tip === "salon") router.push("/dashboard/salon");
    else router.push("/dashboard/client");
  }

  const fieldStyle = (k: string, err: boolean): React.CSSProperties => ({
    ...(err ? inpErr : inp),
    ...(focus === k && !err
      ? { borderColor: C.orange, boxShadow: "0 0 0 4px rgba(255,107,0,.13)" }
      : {}),
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-surface)", borderBottom: `1px solid ${C.line}`, height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo h={44} priority />
          <Link href="/register" className="hdr-btn" style={{ padding: "9px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Creează cont</Link>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px", position: "relative", overflow: "hidden" }}>
        {/* fundal animat, acelasi limbaj vizual ca pe home */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(255,107,0,.16)", top: -110, left: "8%" }} />
          <div className="ch-orb b" style={{ width: 280, height: 280, background: "rgba(255,140,66,.13)", bottom: -90, right: "6%" }} />
          <div className="ch-orb c" style={{ width: 200, height: 200, background: "rgba(255,185,120,.15)", top: "38%", right: "24%" }} />
        </div>

        <div className="ch-hero-anim" style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
          <div style={{ background: C.surface, borderRadius: 28, padding: "clamp(28px,5vw,46px)", border: `1px solid ${C.line}`, boxShadow: "0 20px 60px rgba(255,107,0,.10), 0 4px 22px rgba(26,26,26,.06)" }}>
            {/* Fără subtitlu: pe o pagină de conectare, titlul și cele două câmpuri spun tot. */}
            <h1 style={{ fontSize: 27, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 26, letterSpacing: "-.02em" }}>Bine ai revenit</h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 7 }}>Email</label>
                <input ref={emailRef} value={form.email} onChange={e => set("email", e.target.value)} type="email"
                  autoComplete="email" placeholder="nume@email.com"
                  style={fieldStyle("email", !!errors.email)}
                  onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                {errors.email && <div style={{ fontSize: 12, color: "var(--pub-danger)", marginTop: 5, fontWeight: 600 }}>{errors.email}</div>}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 7, gap: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: C.text2 }}>Parolă</label>
                  <Link href="/forgot-password" style={{ fontSize: 12.5, fontWeight: 700, color: C.orange, textDecoration: "none" }}>Ai uitat parola?</Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input value={form.parola} onChange={e => set("parola", e.target.value)} type={showPass ? "text" : "password"}
                    autoComplete="current-password" placeholder="••••••••"
                    style={{ ...fieldStyle("parola", !!errors.parola), paddingRight: 46 }}
                    onFocus={() => setFocus("parola")} onBlur={() => setFocus(null)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                  <button type="button" onClick={() => setShowPass(s => !s)} aria-label={showPass ? "Ascunde parola" : "Arată parola"}
                    style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "8px 10px", color: C.dim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {showPass ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {errors.parola && <div style={{ fontSize: 12, color: "var(--pub-danger)", marginTop: 5, fontWeight: 600 }}>{errors.parola}</div>}
              </div>

              {loginError && (
                <div style={{ background: "var(--pub-danger-bg)", border: "1px solid var(--pub-danger-line)", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--pub-danger)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <AlertTriangle size={15} strokeWidth={2} /> {loginError}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} className="ch-cta"
                style={{ padding: "15px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif", marginTop: 3, transition: "transform .18s, box-shadow .18s, background .2s" }}>
                {loading ? "Se verifică..." : "Intră în cont →"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "26px 0 18px" }}>
              <div style={{ flex: 1, height: 1, background: C.line }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.dim }}>sau continuă cu</span>
              <div style={{ flex: 1, height: 1, background: C.line }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="ch-social" style={social}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Continuă cu Google
              </button>
              <button className="ch-social" style={social}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Continuă cu Facebook
              </button>
              <button className="ch-social" style={social}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                Continuă cu telefonul
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 24, paddingTop: 18, borderTop: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13.5, color: C.muted }}>Nu ai cont? </span>
              <Link href="/register" style={{ fontSize: 13.5, fontWeight: 800, color: C.orange, textDecoration: "none" }}>Creează unul acum</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
}
