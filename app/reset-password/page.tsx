"use client";
import Link from "next/link";
import Logo from "../../components/Logo";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { Lock, CheckCircle2, AlertTriangle } from "lucide-react";

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

/** Aceeași măsură a puterii parolei ca la înregistrare. */
function putereParola(p: string) {
  if (!p) return -1;
  let scor = 0;
  if (p.length >= 8) scor++;
  if (p.length >= 12) scor++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) scor++;
  if (/\d/.test(p)) scor++;
  if (/[^A-Za-z0-9]/.test(p)) scor++;
  return Math.min(3, Math.max(0, scor - 1));
}
const PUTERE = [
  { t: "Slabă", c: "var(--pub-danger)" },
  { t: "Acceptabilă", c: "#E08900" },
  { t: "Bună", c: "var(--pub-ok)" },
  { t: "Puternică", c: "var(--pub-ok)" },
];

const OchiSvg = ({ deschis }: { deschis: boolean }) => deschis ? (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
) : (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const parolaRef = useRef<HTMLInputElement>(null);
  const [parola, setParola] = useState("");
  const [confirmare, setConfirmare] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);

  // Linkul din email aduce tokenul în adresă, iar Supabase îl transformă în sesiune.
  // Îi dăm timp să o facă înainte să declarăm linkul invalid.
  useEffect(() => {
    let anulat = false;
    let decis = false;
    const marcheaza = (v: boolean) => {
      if (anulat || decis) return;
      decis = true;
      setHasSession(v);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) marcheaza(true);
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) { marcheaza(true); return; }
      const adresa = typeof window !== "undefined" ? window.location.hash + window.location.search : "";
      const areToken = /access_token|type=recovery|[?&]code=/.test(adresa);
      if (!areToken) { marcheaza(false); return; }
      setTimeout(() => marcheaza(false), 4000);
    })();

    return () => { anulat = true; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { if (hasSession) parolaRef.current?.focus(); }, [hasSession]);

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
      setGlobalError(
        error.message?.includes("should be different")
          ? "Parola nouă trebuie să fie diferită de cea veche."
          : "Nu am putut schimba parola. Cere un link nou și încearcă din nou."
      );
      return;
    }

    setSuccess(true);
    // Ieșim din sesiunea de recuperare — noua parolă se folosește la conectare.
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login"), 2500);
  }

  const fieldStyle = (k: string, err: boolean): React.CSSProperties => ({
    ...inp,
    ...(err ? { border: "1.5px solid var(--pub-danger)" } : {}),
    ...(focus === k && !err ? { borderColor: C.orange, boxShadow: "0 0 0 4px rgba(255,107,0,.13)" } : {}),
  });

  const putere = putereParola(parola);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-surface)", borderBottom: `1px solid ${C.line}`, height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center" }}>
          <Logo h={44} priority />
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="ch-orb" style={{ width: 320, height: 320, background: "rgba(255,107,0,.15)", top: -100, left: "10%" }} />
          <div className="ch-orb b" style={{ width: 260, height: 260, background: "rgba(255,140,66,.12)", bottom: -80, right: "8%" }} />
        </div>

        <div className="ch-hero-anim" style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
          <div style={{ background: C.surface, borderRadius: 28, padding: "clamp(28px,5vw,46px)", border: `1px solid ${C.line}`, boxShadow: "0 20px 60px var(--pub-shadow-warm), 0 4px 22px var(--pub-shadow)" }}>

            {success ? (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.orangeSoft, border: `3px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={30} color={C.orange} strokeWidth={2.2} />
                  </div>
                </div>
                <h1 style={{ fontSize: 25, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 10 }}>Parola a fost schimbată</h1>
                <p style={{ fontSize: 14.5, color: C.muted, textAlign: "center", lineHeight: 1.6, marginBottom: 22 }}>
                  Te ducem la pagina de conectare, ca să intri cu parola nouă.
                </p>
                <Link href="/login" style={{ display: "block", padding: "14px 24px", borderRadius: 50, background: C.orange, color: "#fff", fontSize: 15, fontWeight: 800, textAlign: "center", textDecoration: "none", boxShadow: "0 8px 24px rgba(255,107,0,.32)" }}>
                  Mergi acum la conectare →
                </Link>
              </>
            ) : hasSession === false ? (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: "var(--pub-danger-bg)", border: "1px solid var(--pub-danger-line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={26} color="var(--pub-danger)" strokeWidth={2} />
                  </div>
                </div>
                <h1 style={{ fontSize: 23, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 10 }}>Link invalid sau expirat</h1>
                <p style={{ fontSize: 14.5, color: C.muted, textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
                  Linkurile de resetare pot fi folosite o singură dată și expiră după un timp.
                  Cere unul nou și îl primești imediat pe email.
                </p>
                <Link href="/forgot-password" className="ch-cta" style={{ display: "block", padding: "14px 24px", borderRadius: 50, background: C.orange, color: "#fff", fontSize: 15, fontWeight: 800, textAlign: "center", textDecoration: "none", boxShadow: "0 8px 24px rgba(255,107,0,.32)" }}>
                  Cere un link nou →
                </Link>
                <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
                  <Link href="/login" style={{ fontSize: 13.5, fontWeight: 800, color: C.orange, textDecoration: "none" }}>← Înapoi la conectare</Link>
                </div>
              </>
            ) : hasSession === null ? (
              <div style={{ textAlign: "center", padding: "44px 0", color: C.muted, fontSize: 14, fontWeight: 600 }}>Se verifică linkul...</div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: C.orangeSoft, border: "1px solid var(--pub-orange-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Lock size={26} color={C.orange} strokeWidth={2} />
                  </div>
                </div>
                <h1 style={{ fontSize: 25, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 8, letterSpacing: "-.02em" }}>Setează o parolă nouă</h1>
                <p style={{ fontSize: 14.5, color: C.muted, textAlign: "center", marginBottom: 26, lineHeight: 1.55 }}>
                  Alege o parolă pe care nu ai mai folosit-o în altă parte.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 7 }}>Parolă nouă</label>
                    <div style={{ position: "relative" }}>
                      <input ref={parolaRef} value={parola} onChange={e => { setParola(e.target.value); setErrors(er => ({ ...er, parola: "" })); }}
                        type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="Minim 8 caractere"
                        style={{ ...fieldStyle("parola", !!errors.parola), paddingRight: 46 }}
                        onFocus={() => setFocus("parola")} onBlur={() => setFocus(null)}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                      <button type="button" onClick={() => setShowPass(s => !s)} aria-label={showPass ? "Ascunde parola" : "Arată parola"}
                        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "8px 10px", color: C.dim, display: "flex", alignItems: "center" }}>
                        <OchiSvg deschis={showPass} />
                      </button>
                    </div>
                    {putere >= 0 && !errors.parola && (
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 4, flex: 1 }}>
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{ height: 4, flex: 1, borderRadius: 4, background: i <= putere ? PUTERE[putere].c : C.line, transition: "background .25s" }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: PUTERE[putere].c, flexShrink: 0 }}>{PUTERE[putere].t}</span>
                      </div>
                    )}
                    {errors.parola && <div style={{ fontSize: 12, color: "var(--pub-danger)", marginTop: 5, fontWeight: 600 }}>{errors.parola}</div>}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 7 }}>Confirmă parola</label>
                    <input value={confirmare} onChange={e => { setConfirmare(e.target.value); setErrors(er => ({ ...er, confirmare: "" })); }}
                      type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="Scrie parola încă o dată"
                      style={fieldStyle("confirmare", !!errors.confirmare)}
                      onFocus={() => setFocus("confirmare")} onBlur={() => setFocus(null)}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    {errors.confirmare && <div style={{ fontSize: 12, color: "var(--pub-danger)", marginTop: 5, fontWeight: 600 }}>{errors.confirmare}</div>}
                  </div>

                  {globalError && (
                    <div style={{ background: "var(--pub-danger-bg)", border: "1px solid var(--pub-danger-line)", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--pub-danger)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                      <AlertTriangle size={15} strokeWidth={2} /> {globalError}
                    </div>
                  )}

                  <button onClick={handleSubmit} disabled={loading} className="ch-cta"
                    style={{ padding: "15px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif", marginTop: 3 }}>
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
