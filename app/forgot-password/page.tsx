"use client";
import Link from "next/link";
import Logo from "../../components/Logo";
import { useState, useEffect, useRef } from "react";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { Mail, KeyRound, ArrowLeft } from "lucide-react";

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

/** Cât așteptăm până poate cere alt link (evită trimiterile în rafală). */
const SECUNDE_REINCERCARE = 45;

export default function ForgotPasswordPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focus, setFocus] = useState(false);
  const [asteptare, setAsteptare] = useState(0);

  useEffect(() => { emailRef.current?.focus(); }, []);

  // Numărătoare inversă pentru butonul „Trimite din nou"
  useEffect(() => {
    if (asteptare <= 0) return;
    const t = setTimeout(() => setAsteptare(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [asteptare]);

  async function handleSubmit() {
    setError("");
    if (!email.trim()) { setError("Câmp obligatoriu"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Email invalid"); return; }

    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setLoading(false);

    // Din motive de securitate arătăm același mesaj indiferent de răspuns,
    // ca să nu confirmăm dacă adresa există sau nu în baza de date.
    if (err) console.error("Reset password error:", err);
    setSent(true);
    setAsteptare(SECUNDE_REINCERCARE);
  }

  const fieldStyle: React.CSSProperties = {
    ...inp,
    ...(error ? { border: "1.5px solid var(--pub-danger)" } : {}),
    ...(focus && !error ? { borderColor: C.orange, boxShadow: "0 0 0 4px rgba(255,107,0,.13)" } : {}),
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-surface)", borderBottom: `1px solid ${C.line}`, height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo h={44} priority />
          <Link href="/login" className="hdr-btn" style={{ padding: "9px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Intră în cont</Link>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="ch-orb" style={{ width: 320, height: 320, background: "rgba(255,107,0,.15)", top: -100, left: "10%" }} />
          <div className="ch-orb b" style={{ width: 260, height: 260, background: "rgba(255,140,66,.12)", bottom: -80, right: "8%" }} />
        </div>

        <div className="ch-hero-anim" style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
          <div style={{ background: C.surface, borderRadius: 28, padding: "clamp(28px,5vw,46px)", border: `1px solid ${C.line}`, boxShadow: "0 20px 60px var(--pub-shadow-warm), 0 4px 22px var(--pub-shadow)" }}>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: C.orangeSoft, border: "1px solid var(--pub-orange-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {sent ? <Mail size={26} color={C.orange} strokeWidth={2} /> : <KeyRound size={26} color={C.orange} strokeWidth={2} />}
              </div>
            </div>

            {sent ? (
              <>
                <h1 style={{ fontSize: 25, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 10, letterSpacing: "-.02em" }}>Verifică-ți emailul</h1>
                <p style={{ fontSize: 14.5, color: C.muted, textAlign: "center", marginBottom: 8, lineHeight: 1.6 }}>
                  Dacă există un cont pentru <strong style={{ color: C.text }}>{email}</strong>,
                  ți-am trimis un link de resetare. Linkul e valabil o singură dată.
                </p>
                <p style={{ fontSize: 13, color: C.dim, textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
                  Nu îl găsești? Caută și în Spam sau Promoții.
                </p>

                <button onClick={handleSubmit} disabled={asteptare > 0 || loading}
                  style={{ width: "100%", padding: "13px 22px", borderRadius: 50, border: `1.5px solid var(--pub-orange-border)`, background: asteptare > 0 ? "var(--pub-surface2)" : C.orangeSoft, color: asteptare > 0 ? C.dim : "var(--pub-orange-text)", fontSize: 14, fontWeight: 800, cursor: asteptare > 0 ? "default" : "pointer", fontFamily: "Nunito, sans-serif", marginBottom: 10 }}>
                  {asteptare > 0 ? `Poți cere alt link în ${asteptare}s` : "Trimite linkul din nou"}
                </button>

                <Link href="/login" className="ch-cta"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 50, background: C.orange, color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 24px rgba(255,107,0,.32)" }}>
                  <ArrowLeft size={17} strokeWidth={2.5} /> Înapoi la conectare
                </Link>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 25, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 8, letterSpacing: "-.02em" }}>Ai uitat parola?</h1>
                <p style={{ fontSize: 14.5, color: C.muted, textAlign: "center", marginBottom: 26, lineHeight: 1.55 }}>
                  Scrie adresa de email a contului și îți trimitem un link de resetare.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 7 }}>Email</label>
                    <input ref={emailRef} value={email} onChange={e => { setEmail(e.target.value); setError(""); }} type="email"
                      autoComplete="email" placeholder="nume@email.com" style={fieldStyle}
                      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    {error && <div style={{ fontSize: 12, color: "var(--pub-danger)", marginTop: 5, fontWeight: 600 }}>{error}</div>}
                  </div>

                  <button onClick={handleSubmit} disabled={loading} className="ch-cta"
                    style={{ padding: "15px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif", marginTop: 3 }}>
                    {loading ? "Se trimite..." : "Trimite link de resetare →"}
                  </button>
                </div>

                <div style={{ textAlign: "center", marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.line}` }}>
                  <Link href="/login" style={{ fontSize: 13.5, fontWeight: 800, color: C.orange, textDecoration: "none" }}>← Înapoi la conectare</Link>
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
