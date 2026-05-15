"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import ResetTheme from "../../components/ResetTheme";
import { supabase } from "../../lib/supabase";

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid #EF4444" };

export default function RegisterPage() {
  const router = useRouter();
  const [tip, setTip] = useState<"client" | "salon">("client");
  const [form, setForm] = useState({ numeSalon: "", numeComplet: "", email: "", telefon: "", parola: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [registerError, setRegisterError] = useState("");

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    setRegisterError("");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (tip === "salon" && !form.numeSalon.trim()) e.numeSalon = "Câmp obligatoriu";
    if (!form.numeComplet.trim()) e.numeComplet = "Câmp obligatoriu";
    if (!form.email.trim()) e.email = "Câmp obligatoriu";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalid";
    if (!form.telefon.trim()) e.telefon = "Câmp obligatoriu";
    if (!form.parola) e.parola = "Câmp obligatoriu";
    else if (form.parola.length < 8) e.parola = "Minim 8 caractere";
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
          numeComplet: form.numeComplet.trim(),
          telefon: form.telefon.trim(),
          numeSalon: tip === "salon" ? form.numeSalon.trim() : null,
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
        .from("calyhub_user")
        .upsert({
          id: data.user.id,
          tip,
          numeComplet: form.numeComplet.trim(),
          telefon: form.telefon.trim(),
          tema: "light",
        });

      if (profileError) console.error("Profile upsert error:", profileError);

      sessionStorage.setItem("calyhub_reg_tip", tip);
      if (tip === "salon") sessionStorage.setItem("calyhub_reg_numeSalon", form.numeSalon.trim());

      if (tip === "client") router.push("/register/configurare-animal");
      else router.push("/register/configurare-salon");
    }

    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <ResetTheme />
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,48px)", border: "1px solid #EBEBEB", boxShadow: "0 4px 32px rgba(26,26,26,.08)" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <Image src="/logo.png" alt="CalyHub" width={120} height={40} style={{ height: 40, width: "auto", objectFit: "contain" }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 6 }}>Creează cont gratuit 🐾</h1>
            <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>Alege tipul de cont potrivit</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              <button onClick={() => { setTip("client"); setErrors({}); }}
                style={{ border: tip === "client" ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", borderRadius: 16, padding: "16px 12px", textAlign: "center", cursor: "pointer", background: tip === "client" ? "#FFF3EA" : "#fff", transition: "all .2s", fontFamily: "Nunito, sans-serif" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🐾</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>Client salon</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Programezi animăluțul</div>
              </button>
              <button onClick={() => { setTip("salon"); setErrors({}); }}
                style={{ border: tip === "salon" ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", borderRadius: 16, padding: "16px 12px", textAlign: "center", cursor: "pointer", background: tip === "salon" ? "#FFF3EA" : "#fff", transition: "all .2s", fontFamily: "Nunito, sans-serif" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✂️</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>Salon grooming</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Primești programări</div>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tip === "salon" && (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Numele salonului *</label>
                  <input value={form.numeSalon} onChange={e => set("numeSalon", e.target.value)} type="text" placeholder="Ex: Salon Pets București" style={errors.numeSalon ? inpErr : inp} />
                  {errors.numeSalon && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.numeSalon}</div>}
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Nume complet *</label>
                <input value={form.numeComplet} onChange={e => set("numeComplet", e.target.value)} type="text" placeholder="Ion Popescu" style={errors.numeComplet ? inpErr : inp} />
                {errors.numeComplet && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.numeComplet}</div>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Email *</label>
                <input value={form.email} onChange={e => set("email", e.target.value)} type="email" placeholder="nume@email.com" style={errors.email ? inpErr : inp} />
                {errors.email && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.email}</div>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Telefon *</label>
                <input value={form.telefon} onChange={e => set("telefon", e.target.value)} type="tel" placeholder="07XX XXX XXX" style={errors.telefon ? inpErr : inp} />
                {errors.telefon && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.telefon}</div>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Parolă *</label>
                <div style={{ position: "relative" }}>
                  <input value={form.parola} onChange={e => set("parola", e.target.value)} type={showPass ? "text" : "password"} placeholder="Minim 8 caractere" style={{ ...(errors.parola ? inpErr : inp), paddingRight: 46 }} />
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

              {tip === "salon" && (
                <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00" }}>🎁 3 luni gratuite pentru parteneri fondatori</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>0% comision · Suport dedicat</div>
                </div>
              )}

              {registerError && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#EF4444", textAlign: "center" }}>
                  ⚠️ {registerError}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{ padding: "14px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif", transition: "background .2s" }}>
                {loading ? "Se procesează..." : "Creează cont gratuit →"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #EBEBEB" }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Ai deja cont? </span>
              <Link href="/login" style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", textDecoration: "none" }}>Conectează-te</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
}
