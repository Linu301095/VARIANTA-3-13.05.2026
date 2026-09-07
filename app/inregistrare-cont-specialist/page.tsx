"use client";
import Link from "next/link";
import Logo from "../../components/Logo";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { CheckCircle2 } from "lucide-react";
import { putereParola, sfaturiParola, PUTERE_PUBLIC as PUTERE, PAROLA_MIN } from "../../lib/parola";

/**
 * Contul de specialist NU se face prin /register.
 *
 * Un salon = un cont de proprietar; specialiștii intră printr-o poartă
 * separată, cu un cod primit de la salonul care i-a invitat (manual, până
 * există Resend pentru email — vezi CLAUDE.md, „conturi pentru specialiști").
 *
 * Pagina merge și pentru cont nou, și pentru cineva care are deja cont (de
 * exemplu lucrează la două saloane, sau i s-a revocat accesul și primește un
 * cod nou): comutatorul de sus alege între `signUp` și `signInWithPassword`,
 * dar în ambele cazuri urmează același pas — revendicarea codului.
 */

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
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 7 };
const errStyle: React.CSSProperties = { fontSize: 12, color: "var(--pub-danger)", marginTop: 5, fontWeight: 600 };

const EyeOpen = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const EyeClosed = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;

export default function InregistrareContSpecialist() {
  const router = useRouter();
  const [modCont, setModCont] = useState<"nou" | "existent">("nou");
  const [form, setForm] = useState({ nume: "", email: "", parola: "", cod: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eroareGenerala, setEroareGenerala] = useState("");
  const [focus, setFocus] = useState<string | null>(null);
  const codRef = useRef<HTMLInputElement>(null);

  // Dacă e deja conectat cu un cont de specialist, nu are rost formularul.
  useEffect(() => {
    let anulat = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (anulat || !session?.user) return;
      const { data: profile } = await supabase.from("profiluri").select("tip").eq("id", session.user.id).single();
      if (profile?.tip === "specialist") router.replace("/dashboard/specialist");
    })();
    return () => { anulat = true; };
  }, [router]);

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    setEroareGenerala("");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (modCont === "nou" && !form.nume.trim()) e.nume = "Câmp obligatoriu";
    if (!form.email.trim()) e.email = "Câmp obligatoriu";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalid";
    if (!form.parola) e.parola = "Câmp obligatoriu";
    else if (modCont === "nou" && form.parola.length < PAROLA_MIN) e.parola = `Minim ${PAROLA_MIN} caractere`;
    if (!/^\d{6}$/.test(form.cod.trim())) e.cod = "Codul are 6 cifre";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setEroareGenerala("");

    // Pasul 1 — contul de autentificare, nou sau existent.
    const emailTrim = form.email.trim();
    let userId: string | null = null;

    if (modCont === "nou") {
      const { data, error } = await supabase.auth.signUp({ email: emailTrim, password: form.parola });
      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already")) {
          setEroareGenerala("Există deja un cont cu acest email — comută pe „Am deja cont” mai jos.");
        } else setEroareGenerala(error.message);
        setLoading(false);
        return;
      }
      userId = data.user?.id || null;
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailTrim, password: form.parola });
      if (error) { setEroareGenerala("Email sau parolă incorectă."); setLoading(false); return; }
      userId = data.user?.id || null;
    }

    if (!userId) { setEroareGenerala("Nu am putut crea sesiunea. Încearcă din nou."); setLoading(false); return; }

    // Pasul 2 — revendicarea codului. O singură funcție din bază face
    // verificarea și scrierea, ca niciun cont să nu poată lega un rând din
    // echipa altui salon fără codul potrivit.
    const { data: legatura, error: eCod } = await supabase
      .rpc("redeem_cod_specialist", { p_cod: form.cod.trim() })
      .single();

    if (eCod || !legatura) {
      setErrors({ cod: "Codul nu este valid sau a expirat. Cere unul nou de la salon." });
      setLoading(false);
      return;
    }

    // Pasul 3 — profilul, doar dacă nu exista deja (cont nou sau primă legătură).
    if (modCont === "nou") {
      await supabase.from("profiluri").upsert({
        id: userId,
        tip: "specialist",
        nume: form.nume.trim(),
        tema: "light",
      });
    } else {
      // Cont existent care intră la un salon nou/din nou — profilul rămâne
      // cum era, doar ne asigurăm că tipul e cel corect.
      await supabase.from("profiluri").update({ tip: "specialist" }).eq("id", userId);
    }

    router.push("/dashboard/specialist");
  }

  const fieldStyle = (k: string, err: boolean): React.CSSProperties => ({
    ...(err ? inpErr : inp),
    ...(focus === k && !err ? { borderColor: C.orange, boxShadow: "0 0 0 4px rgba(255,107,0,.13)" } : {}),
  });

  const putere = putereParola(form.parola);
  const sfaturi = sfaturiParola(form.parola);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-surface)", borderBottom: `1px solid ${C.line}`, height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo h={44} priority />
          <Link href="/login" className="hdr-btn" style={{ padding: "9px 20px", borderRadius: 50, border: `1.5px solid var(--pub-line2)`, background: C.surface, fontSize: 14, fontWeight: 800, color: C.text, textDecoration: "none" }}>Conectare</Link>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 20px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ background: C.surface, borderRadius: 28, padding: "clamp(26px,5vw,40px)", border: `1px solid ${C.line}`, boxShadow: "0 20px 60px var(--pub-shadow-warm), 0 4px 22px var(--pub-shadow)" }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 8, letterSpacing: "-.02em" }}>
              Contul tău de specialist
            </h1>
            <p style={{ fontSize: 14, color: C.muted, textAlign: "center", marginBottom: 22, lineHeight: 1.55 }}>
              Salonul care te-a invitat ți-a dat un cod de 6 cifre. Cu el, contul tău se leagă de agenda ta —
              restul (planul, echipa, încasările salonului) rămân doar la proprietar.
            </p>

            {/* comutator cont nou / am deja cont */}
            <div style={{ display: "inline-flex", gap: 4, background: "var(--pub-surface2)", border: `1px solid ${C.line}`, borderRadius: 50, padding: 4, marginBottom: 22, width: "100%" }}>
              {([{ v: "nou" as const, l: "Cont nou" }, { v: "existent" as const, l: "Am deja cont" }]).map(o => (
                <button key={o.v} type="button" onClick={() => { setModCont(o.v); setErrors({}); setEroareGenerala(""); }}
                  style={{ flex: 1, border: "none", borderRadius: 50, padding: "9px 0", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, cursor: "pointer", background: modCont === o.v ? C.orange : "transparent", color: modCont === o.v ? "#fff" : C.muted }}>
                  {o.l}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {modCont === "nou" && (
                <div>
                  <label style={lbl}>Nume complet *</label>
                  <input value={form.nume} onChange={e => set("nume", e.target.value)} placeholder="Ex: Alin Popescu"
                    style={fieldStyle("nume", !!errors.nume)} onFocus={() => setFocus("nume")} onBlur={() => setFocus(null)} />
                  {errors.nume && <div style={errStyle}>{errors.nume}</div>}
                </div>
              )}

              <div>
                <label style={lbl}>Email *</label>
                <input value={form.email} onChange={e => set("email", e.target.value)} type="email" autoComplete="email"
                  placeholder="nume@email.com" style={fieldStyle("email", !!errors.email)}
                  onFocus={() => setFocus("email")} onBlur={() => setFocus(null)} />
                {errors.email && <div style={errStyle}>{errors.email}</div>}
              </div>

              <div>
                <label style={lbl}>Parolă *</label>
                <div style={{ position: "relative" }}>
                  <input value={form.parola} onChange={e => set("parola", e.target.value)} type={showPass ? "text" : "password"}
                    autoComplete={modCont === "nou" ? "new-password" : "current-password"}
                    placeholder={modCont === "nou" ? `Minim ${PAROLA_MIN} caractere` : "Parola ta"}
                    style={{ ...fieldStyle("parola", !!errors.parola), paddingRight: 46 }}
                    onFocus={() => setFocus("parola")} onBlur={() => setFocus(null)}
                    onKeyDown={e => e.key === "Enter" && codRef.current?.focus()} />
                  <button type="button" onClick={() => setShowPass(s => !s)} aria-label={showPass ? "Ascunde parola" : "Arată parola"}
                    style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "8px 10px", color: C.dim, display: "flex", alignItems: "center" }}>
                    {showPass ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                {errors.parola && <div style={errStyle}>{errors.parola}</div>}
                {modCont === "nou" && putere >= 0 && !errors.parola && form.parola.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[0, 1, 2, 3].map(i => <span key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= putere ? PUTERE[putere].c : "var(--pub-line2)" }} />)}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: PUTERE[putere].c }}>Parolă {PUTERE[putere].t.toLowerCase()}</div>
                    {sfaturi.length > 0 && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Ca s-o întărești: {sfaturi.join(", ")}.</div>}
                  </div>
                )}
              </div>

              <div>
                <label style={lbl}>Codul de invitație *</label>
                <input ref={codRef} value={form.cod} onChange={e => set("cod", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric" placeholder="000000" maxLength={6}
                  style={{ ...fieldStyle("cod", !!errors.cod), letterSpacing: 6, fontWeight: 800, textAlign: "center", fontSize: 20 }}
                  onFocus={() => setFocus("cod")} onBlur={() => setFocus(null)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                {errors.cod && <div style={errStyle}>{errors.cod}</div>}
              </div>

              {eroareGenerala && (
                <div style={{ background: "var(--pub-danger-bg)", border: "1px solid var(--pub-danger-line)", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--pub-danger)" }}>
                  {eroareGenerala}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{ padding: "15px 0", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : C.orange, color: "#fff", fontSize: 15.5, fontWeight: 900, cursor: loading ? "default" : "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 }}>
                {loading ? "Se verifică..." : (<><CheckCircle2 size={18} strokeWidth={2.4} /> Intră în agenda ta</>)}
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 12.5, color: C.dim, marginTop: 18, lineHeight: 1.6 }}>
            N-ai primit niciun cod? Cere-i proprietarului salonului să-ți genereze unul din contul lui,
            tabul „Echipa mea".
          </p>
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
}
