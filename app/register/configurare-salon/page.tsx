"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid #EF4444" };

type Serviciu = { nume: string; pret: string; durata: string };
type Groomer = { nume: string; specialitate: string };

const STEPS = ["Date firmă", "Servicii", "Echipă", "Gata!"];

export default function ConfigurareSalon() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [dateFirma, setDateFirma] = useState({ numeSalon: "", adresa: "", oras: "", telefon: "", descriere: "" });
  const [servicii, setServicii] = useState<Serviciu[]>([{ nume: "", pret: "", durata: "" }]);
  const [echipa, setEchipa] = useState<Groomer[]>([{ nume: "", specialitate: "" }]);

  function setFirma(k: string, v: string) {
    setDateFirma(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  function validateStep0() {
    const e: Record<string, string> = {};
    if (!dateFirma.numeSalon.trim()) e.numeSalon = "Câmp obligatoriu";
    if (!dateFirma.adresa.trim()) e.adresa = "Câmp obligatoriu";
    if (!dateFirma.oras.trim()) e.oras = "Câmp obligatoriu";
    return e;
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    servicii.forEach((s, i) => {
      if (!s.nume.trim()) e[`s_nume_${i}`] = "Obligatoriu";
      if (!s.pret.trim()) e[`s_pret_${i}`] = "Obligatoriu";
      if (!s.durata.trim()) e[`s_durata_${i}`] = "Obligatoriu";
    });
    return e;
  }

  function next() {
    if (step === 0) {
      const e = validateStep0();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    if (step === 2) {
      localStorage.setItem("calyhub_salon", JSON.stringify({ dateFirma, servicii, echipa }));
    }
    setErrors({});
    setStep(s => s + 1);
  }

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>Configurare salon — Pasul {step + 1} din {STEPS.length}</div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          {/* Progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              {STEPS.map((label, i) => (
                <div key={label} style={{ fontSize: 12, fontWeight: 700, color: i <= step ? "#FF6B00" : "#9CA3AF", textAlign: "center", flex: 1 }}>{label}</div>
              ))}
            </div>
            <div style={{ height: 4, background: "#EBEBEB", borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#FF6B00", borderRadius: 4, transition: "width .4s" }} />
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,44px)", border: "1px solid #EBEBEB", boxShadow: "0 4px 32px rgba(26,26,26,.08)" }}>

            {/* STEP 0 — Date firmă */}
            {step === 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🏪</div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>Datele salonului</h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Informații despre locația ta</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { key: "numeSalon", label: "Numele salonului *", placeholder: "Ex: Paws & Style", required: true },
                    { key: "adresa", label: "Adresa *", placeholder: "Str. Florilor nr. 12", required: true },
                    { key: "oras", label: "Orașul *", placeholder: "București", required: true },
                    { key: "telefon", label: "Telefon public", placeholder: "07XX XXX XXX", required: false },
                    { key: "descriere", label: "Descriere scurtă", placeholder: "Salon specializat în câini de talie mică...", required: false },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{label}</label>
                      {key === "descriere" ? (
                        <textarea value={(dateFirma as any)[key]} onChange={e => setFirma(key, e.target.value)} placeholder={placeholder} rows={3}
                          style={{ ...inp, resize: "vertical", border: errors[key] ? "1.5px solid #EF4444" : "1.5px solid #EBEBEB" }} />
                      ) : (
                        <input value={(dateFirma as any)[key]} onChange={e => setFirma(key, e.target.value)} type="text" placeholder={placeholder}
                          style={errors[key] ? inpErr : inp} />
                      )}
                      {errors[key] && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors[key]}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1 — Servicii */}
            {step === 1 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✂️</div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>Meniul de servicii</h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Ce oferi, cât costă, cât durează</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {servicii.map((s, i) => (
                    <div key={i} style={{ background: "#FAFAFA", borderRadius: 14, padding: "14px 16px", border: "1px solid #EBEBEB" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00" }}>Serviciul {i + 1}</div>
                        {servicii.length > 1 && (
                          <button onClick={() => setServicii(sv => sv.filter((_, idx) => idx !== i))}
                            style={{ fontSize: 12, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>✕ Șterge</button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Denumire *</label>
                          <input value={s.nume} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, nume: e.target.value } : x))}
                            placeholder="Ex: Tuns + Băiță câine mic" style={errors[`s_nume_${i}`] ? inpErr : inp} />
                          {errors[`s_nume_${i}`] && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>{errors[`s_nume_${i}`]}</div>}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Preț (RON) *</label>
                            <input value={s.pret} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, pret: e.target.value } : x))}
                              type="number" placeholder="80" style={errors[`s_pret_${i}`] ? inpErr : inp} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Durată (min) *</label>
                            <input value={s.durata} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, durata: e.target.value } : x))}
                              type="number" placeholder="60" style={errors[`s_durata_${i}`] ? inpErr : inp} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setServicii(sv => [...sv, { nume: "", pret: "", durata: "" }])}
                    style={{ padding: "12px", borderRadius: 12, border: "1.5px dashed #FF6B00", background: "#FFF3EA", color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    + Adaugă serviciu
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Echipă */}
            {step === 2 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👥</div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>Echipa ta</h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Adaugă groomerii din salon <span style={{ color: "#9CA3AF" }}>(opțional)</span></p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {echipa.map((g, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Nume groomer</label>
                        <input value={g.nume} onChange={e => setEchipa(ec => ec.map((x, idx) => idx === i ? { ...x, nume: e.target.value } : x))}
                          placeholder="Ex: Maria Ionescu" style={inp} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Specialitate</label>
                        <input value={g.specialitate} onChange={e => setEchipa(ec => ec.map((x, idx) => idx === i ? { ...x, specialitate: e.target.value } : x))}
                          placeholder="Ex: Rase mici" style={inp} />
                      </div>
                      {echipa.length > 1 && (
                        <button onClick={() => setEchipa(ec => ec.filter((_, idx) => idx !== i))}
                          style={{ padding: "12px", borderRadius: 10, border: "1px solid #EBEBEB", background: "#fff", cursor: "pointer", fontSize: 16, fontFamily: "Nunito, sans-serif", marginBottom: 0 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setEchipa(ec => [...ec, { nume: "", specialitate: "" }])}
                    style={{ padding: "12px", borderRadius: 12, border: "1.5px dashed #FF6B00", background: "#FFF3EA", color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", marginTop: 4 }}>
                    + Adaugă groomer
                  </button>
                </div>

                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Portofoliu foto <span style={{ fontWeight: 500, color: "#9CA3AF" }}>(opțional)</span></div>
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px", borderRadius: 12, border: "1.5px dashed #EBEBEB", cursor: "pointer", background: "#FAFAFA" }}>
                    <span style={{ fontSize: 28 }}>📸</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280" }}>Adaugă poze cu salonul și lucrări</span>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>JPG, PNG — max 10MB</span>
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3 — Succes */}
            {step === 3 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF3EA", border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>✅</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", marginBottom: 10 }}>Salonul tău e live!</h2>
                <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 8 }}>
                  <strong style={{ color: "#1A1A1A" }}>{dateFirma.numeSalon}</strong> apare acum pe CalyHub.<br />
                  Primești programări automat — chiar și când dormi.
                </p>
                <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 14, padding: "14px 18px", marginBottom: 28, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", marginBottom: 8 }}>🎁 3 luni gratuite activate</div>
                  {[`📍 ${dateFirma.adresa}, ${dateFirma.oras}`, `✂️ ${servicii.filter(s => s.nume).length} servicii configurate`, `👥 ${echipa.filter(g => g.nume).length || 1} groomer(i)`].map(item => (
                    <div key={item} style={{ fontSize: 13, color: "#374151", fontWeight: 600, marginTop: 4 }}>{item}</div>
                  ))}
                </div>
                <button onClick={() => router.push("/dashboard/salon")}
                  style={{ padding: "14px 32px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif" }}>
                  ✂️ Deschide panoul de control →
                </button>
              </div>
            )}

            {/* Buton Next */}
            {step < 3 && (
              <button onClick={next}
                style={{ marginTop: 24, width: "100%", padding: "14px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif" }}>
                {step === 2 ? "Finalizează configurarea →" : "Continuă →"}
              </button>
            )}
            {step > 0 && step < 3 && (
              <button onClick={() => { setErrors({}); setStep(s => s - 1); }}
                style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 50, border: "1.5px solid #EBEBEB", background: "#fff", color: "#6B7280", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                ← Înapoi
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
