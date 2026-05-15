"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid #EF4444" };

const RASE = ["Labrador Retriever", "Golden Retriever", "Pudel", "Chihuahua", "Husky Siberian", "Bulldog Francez", "Ciobanesc German", "Shih Tzu", "Bichon Frisé", "Maltez", "Yorkshire Terrier", "Cocker Spaniel", "Altă rasă"];

export default function ConfigurareAnimal() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState({ rasa: "", greutate: "", varsta: "", alergii: "", numeAnimal: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.numeAnimal.trim()) e.numeAnimal = "Câmp obligatoriu";
    if (!form.rasa) e.rasa = "Selectează rasa";
    if (!form.greutate.trim()) e.greutate = "Câmp obligatoriu";
    else if (isNaN(Number(form.greutate)) || Number(form.greutate) <= 0) e.greutate = "Valoare invalidă";
    if (!form.varsta.trim()) e.varsta = "Câmp obligatoriu";
    else if (isNaN(Number(form.varsta)) || Number(form.varsta) <= 0) e.varsta = "Valoare invalidă";
    if (!form.alergii.trim()) e.alergii = 'Scrie "Fără alergii" dacă nu are';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    localStorage.setItem("calyhub_animal", JSON.stringify(form));
    const u = localStorage.getItem("calyhub_user");
    if (u) {
      const cur = JSON.parse(u);
      const users: any[] = JSON.parse(localStorage.getItem("calyhub_users") || "[]");
      const updated = users.map((x: any) => x.email === cur.email ? { ...x, animal: form } : x);
      localStorage.setItem("calyhub_users", JSON.stringify(updated));
      localStorage.setItem("calyhub_user", JSON.stringify({ ...cur, animal: form }));
    }
    setTimeout(() => setStep("success"), 700);
  }

  if (step === "success") {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center" }}>
            <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          </div>
        </header>
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF3EA", border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✅</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1A1A1A", marginBottom: 12 }}>Profil configurat cu succes!</h1>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 8, lineHeight: 1.7 }}>
              <strong style={{ color: "#1A1A1A" }}>{form.numeAnimal}</strong> are acum un profil complet pe CalyHub.<br />
              Ești gata să găsești salonul perfect!
            </p>
            <div style={{ background: "#fff", border: "2px solid #FF6B00", borderRadius: 20, padding: "20px 24px", margin: "24px 0", textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Profilul lui {form.numeAnimal}</div>
              {[["🐾 Rasă", form.rasa], ["⚖️ Greutate", `${form.greutate} kg`], ["🎂 Vârstă", `${form.varsta} ani`], ["💊 Alergii", form.alergii]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ color: "#6B7280" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "#1A1A1A" }}>{val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/dashboard/client")}
              style={{ padding: "14px 32px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif" }}>
              🐾 Găsește salon acum →
            </button>
          </div>
        </main>
        <Footer variant="auth" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>Pasul 2 din 2 — Profil animăluț</div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 500 }}>
          {/* Progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {["Cont creat ✓", "Profil animăluț"].map((label, i) => (
              <div key={label} style={{ flex: 1, height: 4, borderRadius: 4, background: i === 0 ? "#FF6B00" : "#FF6B00", opacity: i === 0 ? 1 : 1 }} />
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,48px)", border: "1px solid #EBEBEB", boxShadow: "0 4px 32px rgba(26,26,26,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🐾</div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>Configurează profilul animăluțului</h1>
                <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Câmpurile marcate cu * sunt obligatorii</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Numele animăluțului *</label>
                <input value={form.numeAnimal} onChange={e => set("numeAnimal", e.target.value)} type="text" placeholder="Ex: Max, Bella, Luna..." style={errors.numeAnimal ? inpErr : inp} />
                {errors.numeAnimal && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.numeAnimal}</div>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Rasa *</label>
                <select value={form.rasa} onChange={e => set("rasa", e.target.value)}
                  style={{ ...(errors.rasa ? inpErr : inp), appearance: "none", background: "white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' fill='none' stroke-width='1.5'/%3E%3C/svg%3E\") no-repeat right 14px center" }}>
                  <option value="">Selectează rasa...</option>
                  {RASE.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.rasa && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.rasa}</div>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Greutate (kg) *</label>
                  <input value={form.greutate} onChange={e => set("greutate", e.target.value)} type="number" min="0.1" step="0.1" placeholder="Ex: 8.5" style={errors.greutate ? inpErr : inp} />
                  {errors.greutate && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.greutate}</div>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Vârstă (ani) *</label>
                  <input value={form.varsta} onChange={e => set("varsta", e.target.value)} type="number" min="0" step="0.5" placeholder="Ex: 3" style={errors.varsta ? inpErr : inp} />
                  {errors.varsta && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.varsta}</div>}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Alergii / Sensibilități *</label>
                <input value={form.alergii} onChange={e => set("alergii", e.target.value)} type="text" placeholder='Ex: Alergie la latex · sau "Fără alergii"' style={errors.alergii ? inpErr : inp} />
                {errors.alergii && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.alergii}</div>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Poze animăluț <span style={{ fontWeight: 500, color: "#9CA3AF" }}>(opțional)</span></label>
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px", borderRadius: 12, border: "1.5px dashed #EBEBEB", cursor: "pointer", background: "#FAFAFA" }}>
                  <span style={{ fontSize: 24 }}>📷</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280" }}>Click pentru a adăuga poze</span>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>JPG, PNG — max 5MB</span>
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} />
                </label>
              </div>

              <button onClick={handleSubmit} disabled={loading}
                style={{ padding: "14px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif", marginTop: 4 }}>
                {loading ? "Se salvează..." : "Salvează profil →"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer variant="auth" />
    </div>
  );
}
