"use client";
import Link from "next/link";
import Logo from "../../components/Logo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { User, Store, Scissors, PawPrint, AlertTriangle, Check } from "lucide-react";

/** Versiunea documentelor legale acceptate la inregistrare (vezi /termeni si /confidentialitate). */
const TERMENI_VERSIUNE = "1.1 (03.08.2026)";

type Domeniu = "infrumusetare" | "grooming";

const DOMENII: { val: Domeniu; Icon: typeof Scissors; titlu: string; desc: string; placeholder: string }[] = [
  { val: "infrumusetare", Icon: Scissors, titlu: "Înfrumusețare", desc: "Frizerie, coafor, manichiură, cosmetică", placeholder: "Ex: Studio Bella" },
  { val: "grooming", Icon: PawPrint, titlu: "Grooming", desc: "Îngrijire pentru câini și pisici", placeholder: "Ex: Pet Spa Băneasa" },
];

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

/** Putere parola: 0 slaba, 1 acceptabila, 2 buna, 3 puternica. */
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

/**
 * Ce lipsește ca parola să fie mai puternică, în ordinea impactului.
 * Bara singură spune „Slabă" și îl lasă pe om să ghicească de ce; asta îi spune
 * ce să facă. Arătăm cel mult două sfaturi deodată, ca să nu pară o listă de
 * cerințe imposibile.
 */
function sfaturiParola(p: string): string[] {
  const s: string[] = [];
  if (p.length < 12) s.push("fă-o de cel puțin 12 caractere");
  if (!/[A-Z]/.test(p) || !/[a-z]/.test(p)) s.push("amestecă litere mari și mici");
  if (!/\d/.test(p)) s.push("adaugă o cifră");
  if (!/[^A-Za-z0-9]/.test(p)) s.push("pune un semn, de exemplu ! sau ?");
  return s.slice(0, 2);
}

export default function RegisterPage() {
  const router = useRouter();
  const [tip, setTip] = useState<"client" | "salon">("client");
  const [domeniu, setDomeniu] = useState<Domeniu | null>(null);
  const [form, setForm] = useState({ numeSalon: "", numeComplet: "", email: "", telefon: "", parola: "", parolaConfirm: "" });
  const [acceptTermeni, setAcceptTermeni] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [focus, setFocus] = useState<string | null>(null);

  // Butoanele publice spun în adresă cu ce a venit omul (?tip=salon sau ?tip=client),
  // ca selectorul să pice de la început pe partea potrivită. Citim din
  // `window.location` ca să nu avem nevoie de o graniță Suspense doar pentru atât.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tip");
    if (t === "salon" || t === "client") alegeTip(t);
  }, []);

  // Daca exista deja o sesiune activa, nu are rost formularul — ducem userul in contul lui.
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

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    setRegisterError("");
  }

  function alegeTip(t: "client" | "salon") {
    setTip(t);
    if (t === "client") setDomeniu(null);
    setErrors({});
    setRegisterError("");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (tip === "salon") {
      if (!domeniu) e.domeniu = "Alege tipul salonului";
      if (!form.numeSalon.trim()) e.numeSalon = "Câmp obligatoriu";
    }
    if (!form.numeComplet.trim()) e.numeComplet = "Câmp obligatoriu";
    if (!form.email.trim()) e.email = "Câmp obligatoriu";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalid";
    if (!form.telefon.trim()) e.telefon = "Câmp obligatoriu";
    if (!form.parola) e.parola = "Câmp obligatoriu";
    else if (form.parola.length < 8) e.parola = "Minim 8 caractere";
    if (!form.parolaConfirm) e.parolaConfirm = "Confirmă parola";
    else if (form.parolaConfirm !== form.parola) e.parolaConfirm = "Parolele nu se potrivesc";
    if (!acceptTermeni) e.termeni = "Trebuie să accepți termenii ca să continui";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setRegisterError("");

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.parola,
      options: {
        data: {
          tip,
          nume: form.numeComplet.trim(),
          telefon: form.telefon.trim(),
          numeSalon: tip === "salon" ? form.numeSalon.trim() : null,
          // verticala aleasa acum; se scrie in tabelul `saloane` la finalul wizardului
          domeniu: tip === "salon" ? domeniu : null,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already")) {
        setErrors({ email: "Există deja un cont cu acest email" });
      } else {
        setRegisterError(error.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiluri")
        .upsert({
          id: data.user.id,
          tip,
          nume: form.numeComplet.trim(),
          telefon: form.telefon.trim(),
          tema: "light",
          termeni_acceptati_la: new Date().toISOString(),
          termeni_versiune: TERMENI_VERSIUNE,
        });

      if (profileError) console.error("Profile upsert error:", profileError);

      sessionStorage.setItem("calyhub_reg_tip", tip);
      if (tip === "salon") {
        sessionStorage.setItem("calyhub_reg_numeSalon", form.numeSalon.trim());
        if (domeniu) sessionStorage.setItem("calyhub_reg_domeniu", domeniu);
      }

      if (tip === "client") router.push("/register/configurare-animal");
      else router.push("/register/configurare-salon");
    }

    setLoading(false);
  }

  const fieldStyle = (k: string, err: boolean): React.CSSProperties => ({
    ...(err ? inpErr : inp),
    ...(focus === k && !err ? { borderColor: C.orange, boxShadow: "0 0 0 4px rgba(255,107,0,.13)" } : {}),
  });

  const putere = putereParola(form.parola);
  const sfaturi = sfaturiParola(form.parola);
  // se potrivesc? doar cand omul a scris ceva in al doilea camp
  const potrivite = form.parolaConfirm.length > 0 && form.parolaConfirm === form.parola;
  const domeniuAles = DOMENII.find(d => d.val === domeniu);

  const tipCard = (activ: boolean): React.CSSProperties => ({
    border: activ ? `2px solid ${C.orange}` : `1.5px solid ${C.line}`,
    borderRadius: 18, padding: "18px 12px", textAlign: "center", cursor: "pointer",
    background: activ ? C.orangeSoft : C.surface, transition: "all .2s", fontFamily: "Nunito, sans-serif",
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-surface)", borderBottom: `1px solid ${C.line}`, height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo h={44} priority />
          <Link href="/login" className="hdr-btn" style={{ padding: "9px 20px", borderRadius: 50, border: `1.5px solid var(--pub-line2)`, background: C.surface, fontSize: 14, fontWeight: 800, color: C.text, textDecoration: "none" }}>Conectare</Link>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 20px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(255,107,0,.16)", top: -110, left: "8%" }} />
          <div className="ch-orb b" style={{ width: 280, height: 280, background: "rgba(255,140,66,.13)", bottom: -90, right: "6%" }} />
          <div className="ch-orb c" style={{ width: 200, height: 200, background: "rgba(255,185,120,.15)", top: "38%", right: "22%" }} />
        </div>

        <div className="ch-hero-anim" style={{ width: "100%", maxWidth: 500, position: "relative", zIndex: 1 }}>
          <div style={{ background: C.surface, borderRadius: 28, padding: "clamp(26px,5vw,44px)", border: `1px solid ${C.line}`, boxShadow: "0 20px 60px var(--pub-shadow-warm), 0 4px 22px var(--pub-shadow)" }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 8, letterSpacing: "-.02em" }}>Creează-ți contul</h1>
            <p style={{ fontSize: 14.5, color: C.muted, textAlign: "center", marginBottom: 24, lineHeight: 1.55 }}>
              {tip === "salon" ? "Trial gratuit, fără card. În mai puțin de un minut." : "Gratuit, în mai puțin de un minut."}
            </p>

            {/* ── Tipul contului ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <button type="button" onClick={() => alegeTip("client")} style={tipCard(tip === "client")}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 9 }}>
                  <User size={26} color={tip === "client" ? C.orange : C.dim} strokeWidth={1.9} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>Client</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontWeight: 600 }}>Rezervi programări</div>
              </button>
              <button type="button" onClick={() => alegeTip("salon")} style={tipCard(tip === "salon")}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 9 }}>
                  <Store size={26} color={tip === "salon" ? C.orange : C.dim} strokeWidth={1.9} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>Salon</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontWeight: 600 }}>Primești programări</div>
              </button>
            </div>

            {/* ── Ce înseamnă un cont de client ── */}
            {tip === "client" && (
              <div style={{ marginBottom: 20, background: "var(--pub-surface2)", border: `1px solid ${C.line}`, borderRadius: 18, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 10 }}>Un singur cont, pentru amândouă lumile</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <Scissors size={15} color={C.orange} strokeWidth={2.2} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, lineHeight: 1.5 }}>
                      Rezervi pentru tine la frizerie, coafor, manichiură sau cosmetică.
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <PawPrint size={15} color={C.orange} strokeWidth={2.2} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, lineHeight: 1.5 }}>
                      Ai un animal? Îl adaugi când vrei și rezervi și la grooming, din același cont.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Verticala salonului (doar pentru saloane) ── */}
            {tip === "salon" && (
              <div style={{ marginBottom: 20, background: "var(--pub-surface2)", border: `1px solid ${C.line}`, borderRadius: 18, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>Ce fel de salon ai?</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, fontWeight: 600 }}>
                  Alegerea nu se mai poate schimba ulterior — configurăm serviciile în funcție de ea.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {DOMENII.map(({ val, Icon, titlu, desc }) => {
                    const activ = domeniu === val;
                    return (
                      <button key={val} type="button"
                        onClick={() => { setDomeniu(val); setErrors(e => { const n = { ...e }; delete n.domeniu; return n; }); }}
                        style={{ ...tipCard(activ), padding: "14px 10px", borderRadius: 16, background: activ ? C.orangeSoft : C.surface }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 7 }}>
                          <Icon size={22} color={activ ? C.orange : C.dim} strokeWidth={1.9} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{titlu}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.4, fontWeight: 600 }}>{desc}</div>
                      </button>
                    );
                  })}
                </div>
                {errors.domeniu && <div style={errStyle}>{errors.domeniu}</div>}
              </div>
            )}

            {/* ── Câmpuri ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {tip === "salon" && domeniu && (
                <div>
                  <label style={lbl}>Numele salonului *</label>
                  <input value={form.numeSalon} onChange={e => set("numeSalon", e.target.value)} type="text"
                    placeholder={domeniuAles?.placeholder} style={fieldStyle("numeSalon", !!errors.numeSalon)}
                    onFocus={() => setFocus("numeSalon")} onBlur={() => setFocus(null)} />
                  {errors.numeSalon && <div style={errStyle}>{errors.numeSalon}</div>}
                </div>
              )}

              <div>
                <label style={lbl}>Nume complet *</label>
                <input value={form.numeComplet} onChange={e => set("numeComplet", e.target.value)} type="text"
                  autoComplete="name" placeholder="Ion Popescu" style={fieldStyle("numeComplet", !!errors.numeComplet)}
                  onFocus={() => setFocus("numeComplet")} onBlur={() => setFocus(null)} />
                {errors.numeComplet && <div style={errStyle}>{errors.numeComplet}</div>}
              </div>

              <div>
                <label style={lbl}>Email *</label>
                <input value={form.email} onChange={e => set("email", e.target.value)} type="email"
                  autoComplete="email" placeholder="nume@email.com" style={fieldStyle("email", !!errors.email)}
                  onFocus={() => setFocus("email")} onBlur={() => setFocus(null)} />
                {errors.email && <div style={errStyle}>{errors.email}</div>}
              </div>

              <div>
                <label style={lbl}>Telefon *</label>
                <input value={form.telefon} onChange={e => set("telefon", e.target.value)} type="tel"
                  autoComplete="tel" placeholder="07XX XXX XXX" style={fieldStyle("telefon", !!errors.telefon)}
                  onFocus={() => setFocus("telefon")} onBlur={() => setFocus(null)} />
                {errors.telefon && <div style={errStyle}>{errors.telefon}</div>}
              </div>

              <div>
                <label style={lbl}>Parolă *</label>
                <div style={{ position: "relative" }}>
                  <input value={form.parola} onChange={e => set("parola", e.target.value)} type={showPass ? "text" : "password"}
                    autoComplete="new-password" placeholder="Minim 8 caractere"
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
                {putere >= 0 && !errors.parola && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4, flex: 1 }}>
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} style={{ height: 4, flex: 1, borderRadius: 4, background: i <= putere ? PUTERE[putere].c : C.line, transition: "background .25s" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: PUTERE[putere].c, flexShrink: 0 }}>{PUTERE[putere].t}</span>
                    </div>
                    {/* Bara singură spune „Slabă" și îl lasă pe om să ghicească de ce. */}
                    {sfaturi.length > 0 ? (
                      <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600, marginTop: 6, lineHeight: 1.5 }}>
                        Ca să fie mai puternică: {sfaturi.join(" și ")}.
                      </div>
                    ) : (
                      <div style={{ fontSize: 11.5, color: "var(--pub-ok)", fontWeight: 700, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                        <Check size={13} strokeWidth={3} /> Parolă bine aleasă.
                      </div>
                    )}
                  </>
                )}
                {errors.parola && <div style={errStyle}>{errors.parola}</div>}
              </div>

              {/* ── Confirmarea parolei ── */}
              <div>
                <label style={lbl}>Confirmă parola *</label>
                <div style={{ position: "relative" }}>
                  <input value={form.parolaConfirm} onChange={e => set("parolaConfirm", e.target.value)} type={showPass2 ? "text" : "password"}
                    autoComplete="new-password" placeholder="Scrie parola încă o dată"
                    style={{ ...fieldStyle("parolaConfirm", !!errors.parolaConfirm), paddingRight: 46 }}
                    onFocus={() => setFocus("parolaConfirm")} onBlur={() => setFocus(null)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                  <button type="button" onClick={() => setShowPass2(s => !s)} aria-label={showPass2 ? "Ascunde parola" : "Arată parola"}
                    style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "8px 10px", color: C.dim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {showPass2 ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {/* Confirmarea se aprinde imediat ce se potrivesc — nu-l lăsăm să afle la trimitere. */}
                {potrivite && !errors.parolaConfirm && (
                  <div style={{ fontSize: 11.5, color: "var(--pub-ok)", fontWeight: 700, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <Check size={13} strokeWidth={3} /> Parolele se potrivesc.
                  </div>
                )}
                {errors.parolaConfirm && <div style={errStyle}>{errors.parolaConfirm}</div>}
              </div>

              {/* ── Acceptare termeni ── */}
              <div>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={acceptTermeni}
                    onChange={e => { setAcceptTermeni(e.target.checked); setErrors(er => { const n = { ...er }; delete n.termeni; return n; }); }}
                    style={{ accentColor: "#FF6B00", width: 17, height: 17, marginTop: 1, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, fontWeight: 600 }}>
                    Am citit și accept{" "}
                    <Link href="/termeni" target="_blank" style={{ color: C.orange, fontWeight: 800, textDecoration: "none" }}>Termenii și condițiile</Link>
                    {" "}și{" "}
                    <Link href="/confidentialitate" target="_blank" style={{ color: C.orange, fontWeight: 800, textDecoration: "none" }}>Politica de confidențialitate</Link>.
                  </span>
                </label>
                {errors.termeni && <div style={errStyle}>{errors.termeni}</div>}
              </div>

              {registerError && (
                <div style={{ background: "var(--pub-danger-bg)", border: "1px solid var(--pub-danger-line)", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--pub-danger)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <AlertTriangle size={15} strokeWidth={2} /> {registerError}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} className="ch-cta"
                style={{ padding: "15px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif", marginTop: 3, transition: "transform .18s, box-shadow .18s, background .2s" }}>
                {/* Clientul chiar are cont gratuit pe veci; salonul are trial, apoi plan. */}
                {loading ? "Se procesează..." : tip === "salon" ? "Creează cont și pornește trialul →" : "Creează cont gratuit →"}
              </button>

              {tip === "salon" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 12.5, color: C.muted, fontWeight: 700 }}>
                  <Check size={14} color="var(--pub-ok)" strokeWidth={3} /> Fără card la înscriere · 0% comision
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13.5, color: C.muted }}>Ai deja cont? </span>
              <Link href="/login" style={{ fontSize: 13.5, fontWeight: 800, color: C.orange, textDecoration: "none" }}>Conectează-te</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
}
