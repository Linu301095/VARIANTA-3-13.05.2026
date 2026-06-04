"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";
import {
  Store, Scissors, Users, CheckCircle, Plus, Trash2, Clock,
  Building2, FileText, MapPin, Phone, AlignLeft, Globe, Receipt,
} from "lucide-react";

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", background: "#fff" };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid #EF4444" };
const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 };

type Serviciu = { nume: string; pret: string; durata: string };
type Groomer = { nume: string; specialitate: string };
type ZiProgram = { deschis: boolean; start: string; end: string };

const STEPS = ["Date firmă", "Servicii", "Echipă & Program", "Gata!"];

const SPECII = [
  { val: "caine",   label: "Câine",     icon: "🐕" },
  { val: "pisica",  label: "Pisică",    icon: "🐈" },
  { val: "iepure",  label: "Iepure",    icon: "🐇" },
  { val: "pasare",  label: "Pasăre",    icon: "🐦" },
  { val: "rozator", label: "Rozătoare", icon: "🐹" },
  { val: "reptila", label: "Reptilă",   icon: "🦎" },
  { val: "altele",  label: "Altele",    icon: "🐾" },
];

const ZILE = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
const ZILE_KEYS = ["luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica"];

const PROGRAM_DEFAULT: Record<string, ZiProgram> = {
  luni:      { deschis: true,  start: "09:00", end: "18:00" },
  marti:     { deschis: true,  start: "09:00", end: "18:00" },
  miercuri:  { deschis: true,  start: "09:00", end: "18:00" },
  joi:       { deschis: true,  start: "09:00", end: "18:00" },
  vineri:    { deschis: true,  start: "09:00", end: "18:00" },
  sambata:   { deschis: true,  start: "10:00", end: "14:00" },
  duminica:  { deschis: false, start: "10:00", end: "14:00" },
};

const ENTITATI = ["SRL", "SRL-D", "PFA", "Persoană fizică", "Altele"];

export default function ConfigurareSalon() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [dateFirma, setDateFirma] = useState({
    numeSalon: "", adresa: "", oras: "", telefon: "", descriere: "",
    tipEntitate: "SRL", denumireLegala: "", cui: "", sediuFiscal: "",
  });
  const [speciiSelectate, setSpeciiSelectate] = useState<string[]>(["caine"]);
  const [servicii, setServicii] = useState<Serviciu[]>([{ nume: "", pret: "", durata: "" }]);
  const [echipa, setEchipa] = useState<Groomer[]>([{ nume: "", specialitate: "" }]);
  const [program, setProgram] = useState<Record<string, ZiProgram>>(PROGRAM_DEFAULT);

  function setFirma(k: string, v: string) {
    setDateFirma(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  function toggleSpecie(val: string) {
    setSpeciiSelectate(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  }

  function setZi(key: string, field: keyof ZiProgram, value: string | boolean) {
    setProgram(p => ({ ...p, [key]: { ...p[key], [field]: value } }));
  }

  function validateStep0() {
    const e: Record<string, string> = {};
    if (!dateFirma.numeSalon.trim()) e.numeSalon = "Câmp obligatoriu";
    if (!dateFirma.adresa.trim()) e.adresa = "Câmp obligatoriu";
    if (!dateFirma.oras.trim()) e.oras = "Câmp obligatoriu";
    if (!dateFirma.cui.trim()) e.cui = "CUI obligatoriu";
    if (speciiSelectate.length === 0) e.specii = "Selectează cel puțin o specie";
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

  async function next() {
    if (step === 0) {
      const e = validateStep0();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    if (step === 2) {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { error: salonError } = await supabase
        .from("saloane")
        .upsert({
          user_id: user.id,
          nume: dateFirma.numeSalon.trim(),
          adresa: dateFirma.adresa.trim(),
          oras: dateFirma.oras.trim(),
          telefon: dateFirma.telefon.trim(),
          descriere: dateFirma.descriere.trim(),
          servicii: servicii.filter(s => s.nume.trim()),
          echipa: echipa.filter(g => g.nume.trim()),
          plan: "starter",
          specii: speciiSelectate,
          tip_entitate: dateFirma.tipEntitate,
          denumire_legala: dateFirma.denumireLegala.trim(),
          cui: dateFirma.cui.trim(),
          sediu_fiscal: dateFirma.sediuFiscal.trim(),
          program,
        }, { onConflict: "user_id" });

      if (salonError) console.error("Salon upsert error:", salonError);
      setSaving(false);
    }
    setErrors({});
    setStep(s => s + 1);
  }

  const progress = (step / (STEPS.length - 1)) * 100;

  const programRezumat = ZILE_KEYS
    .filter(k => program[k].deschis)
    .map(k => `${ZILE[ZILE_KEYS.indexOf(k)].slice(0, 3)} ${program[k].start}–${program[k].end}`)
    .join(" · ");

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>Configurare salon — Pasul {step + 1} din {STEPS.length}</div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 580 }}>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              {STEPS.map((l, i) => (
                <div key={l} style={{ fontSize: 12, fontWeight: 700, color: i <= step ? "#FF6B00" : "#9CA3AF", textAlign: "center", flex: 1 }}>{l}</div>
              ))}
            </div>
            <div style={{ height: 4, background: "#EBEBEB", borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#FF6B00", borderRadius: 4, transition: "width .4s" }} />
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,44px)", border: "1px solid #EBEBEB", boxShadow: "0 4px 32px rgba(26,26,26,.08)" }}>

            {/* ── STEP 0 — Date firmă ── */}
            {step === 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Store size={24} color="#FF6B00" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>Datele salonului</h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Informații publice + date de facturare</p>
                  </div>
                </div>

                {/* Secțiunea A — Date publice */}
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <Globe size={12} strokeWidth={2.5} /> Date publice
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                  <div>
                    <label style={label}>Numele salonului *</label>
                    <input value={dateFirma.numeSalon} onChange={e => setFirma("numeSalon", e.target.value)} type="text" placeholder="Ex: Paws & Style" style={errors.numeSalon ? inpErr : inp} />
                    {errors.numeSalon && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.numeSalon}</div>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={label}><MapPin size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Adresa *</label>
                      <input value={dateFirma.adresa} onChange={e => setFirma("adresa", e.target.value)} type="text" placeholder="Str. Florilor nr. 12" style={errors.adresa ? inpErr : inp} />
                      {errors.adresa && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.adresa}</div>}
                    </div>
                    <div>
                      <label style={label}>Orașul *</label>
                      <input value={dateFirma.oras} onChange={e => setFirma("oras", e.target.value)} type="text" placeholder="București" style={errors.oras ? inpErr : inp} />
                      {errors.oras && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.oras}</div>}
                    </div>
                  </div>
                  <div>
                    <label style={label}><Phone size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Telefon public</label>
                    <input value={dateFirma.telefon} onChange={e => setFirma("telefon", e.target.value)} type="tel" placeholder="07XX XXX XXX" style={inp} />
                  </div>
                  <div>
                    <label style={label}><AlignLeft size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Descriere scurtă</label>
                    <textarea value={dateFirma.descriere} onChange={e => setFirma("descriere", e.target.value)} placeholder="Salon specializat în câini de talie mică..." rows={3}
                      style={{ ...inp, resize: "vertical" }} />
                  </div>

                  {/* Specii acceptate */}
                  <div>
                    <label style={label}>Specii acceptate *</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                      {SPECII.map(s => {
                        const sel = speciiSelectate.includes(s.val);
                        return (
                          <button key={s.val} type="button" onClick={() => toggleSpecie(s.val)}
                            style={{ padding: "10px 4px", borderRadius: 12, border: sel ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", background: sel ? "#FFF3EA" : "#FAFAFA", cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all .18s" }}>
                            <span style={{ fontSize: 22 }}>{s.icon}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, color: sel ? "#FF6B00" : "#9CA3AF" }}>{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.specii && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 6 }}>{errors.specii}</div>}
                  </div>
                </div>

                {/* Separator */}
                <div style={{ height: 1, background: "#EBEBEB", marginBottom: 24 }} />

                {/* Secțiunea B — Date facturare */}
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <Receipt size={12} strokeWidth={2.5} /> Date pentru facturare
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={label}><Building2 size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Tip entitate</label>
                      <select value={dateFirma.tipEntitate} onChange={e => setFirma("tipEntitate", e.target.value)}
                        style={{ ...inp, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}>
                        {ENTITATI.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={label}><FileText size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />CUI *</label>
                      <input value={dateFirma.cui} onChange={e => setFirma("cui", e.target.value)} type="text" placeholder="RO12345678" style={errors.cui ? inpErr : inp} />
                      {errors.cui && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.cui}</div>}
                    </div>
                  </div>
                  <div>
                    <label style={label}>Denumire legală</label>
                    <input value={dateFirma.denumireLegala} onChange={e => setFirma("denumireLegala", e.target.value)} type="text" placeholder="Ex: Paws Style SRL" style={inp} />
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Dacă diferă de numele comercial al salonului</div>
                  </div>
                  <div>
                    <label style={label}><MapPin size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Sediu fiscal</label>
                    <input value={dateFirma.sediuFiscal} onChange={e => setFirma("sediuFiscal", e.target.value)} type="text" placeholder="Dacă diferă de adresa salonului" style={inp} />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1 — Servicii ── */}
            {step === 1 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Scissors size={24} color="#FF6B00" strokeWidth={1.8} />
                  </div>
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
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9CA3AF", display: "flex", alignItems: "center" }}>
                            <Trash2 size={15} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                          <label style={{ ...label, fontSize: 12 }}>Denumire *</label>
                          <input value={s.nume} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, nume: e.target.value } : x))}
                            placeholder="Ex: Tuns + Băiță câine mic" style={errors[`s_nume_${i}`] ? inpErr : inp} />
                          {errors[`s_nume_${i}`] && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>{errors[`s_nume_${i}`]}</div>}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <label style={{ ...label, fontSize: 12 }}>Preț (RON) *</label>
                            <input value={s.pret} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, pret: e.target.value } : x))}
                              type="number" placeholder="80" style={errors[`s_pret_${i}`] ? inpErr : inp} />
                          </div>
                          <div>
                            <label style={{ ...label, fontSize: 12 }}>Durată (min) *</label>
                            <input value={s.durata} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, durata: e.target.value } : x))}
                              type="number" placeholder="60" style={errors[`s_durata_${i}`] ? inpErr : inp} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setServicii(sv => [...sv, { nume: "", pret: "", durata: "" }])}
                    style={{ padding: "12px", borderRadius: 12, border: "1.5px dashed #FF6B00", background: "#FFF3EA", color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Plus size={16} strokeWidth={2.5} /> Adaugă serviciu
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2 — Echipă & Program ── */}
            {step === 2 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Users size={24} color="#FF6B00" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>Echipă & Program</h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Groomerii tăi și orarul salonului</p>
                  </div>
                </div>

                {/* Echipa */}
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <Users size={12} strokeWidth={2.5} /> Echipa <span style={{ color: "#9CA3AF", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(opțional)</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {echipa.map((g, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                      <div style={{ flex: "1 1 140px" }}>
                        <label style={{ ...label, fontSize: 12 }}>Nume groomer</label>
                        <input value={g.nume} onChange={e => setEchipa(ec => ec.map((x, idx) => idx === i ? { ...x, nume: e.target.value } : x))}
                          placeholder="Ex: Maria Ionescu" style={inp} />
                      </div>
                      <div style={{ flex: "1 1 140px" }}>
                        <label style={{ ...label, fontSize: 12 }}>Specialitate</label>
                        <input value={g.specialitate} onChange={e => setEchipa(ec => ec.map((x, idx) => idx === i ? { ...x, specialitate: e.target.value } : x))}
                          placeholder="Ex: Rase mici" style={inp} />
                      </div>
                      {echipa.length > 1 && (
                        <button onClick={() => setEchipa(ec => ec.filter((_, idx) => idx !== i))}
                          style={{ padding: "11px", borderRadius: 10, border: "1px solid #EBEBEB", background: "#fff", cursor: "pointer", color: "#9CA3AF", display: "flex", alignItems: "center", flexShrink: 0 }}>
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setEchipa(ec => [...ec, { nume: "", specialitate: "" }])}
                    style={{ padding: "12px", borderRadius: 12, border: "1.5px dashed #FF6B00", background: "#FFF3EA", color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Plus size={16} strokeWidth={2.5} /> Adaugă groomer
                  </button>
                </div>

                {/* Separator */}
                <div style={{ height: 1, background: "#EBEBEB", marginBottom: 24 }} />

                {/* Program de lucru */}
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={12} strokeWidth={2.5} /> Program de lucru
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ZILE_KEYS.map((key, idx) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: program[key].deschis ? "#FFF3EA" : "#FAFAFA", border: `1px solid ${program[key].deschis ? "#FFDCC6" : "#EBEBEB"}`, transition: "all .18s" }}>
                      <div style={{ width: 72, fontSize: 13, fontWeight: 800, color: program[key].deschis ? "#1A1A1A" : "#9CA3AF", flexShrink: 0 }}>{ZILE[idx]}</div>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                        <input type="checkbox" checked={program[key].deschis} onChange={e => setZi(key, "deschis", e.target.checked)}
                          style={{ accentColor: "#FF6B00", width: 16, height: 16, cursor: "pointer" }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: program[key].deschis ? "#FF6B00" : "#9CA3AF" }}>{program[key].deschis ? "Deschis" : "Închis"}</span>
                      </label>
                      {program[key].deschis && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                          <input type="time" value={program[key].start} onChange={e => setZi(key, "start", e.target.value)}
                            style={{ ...inp, width: "auto", padding: "6px 10px", fontSize: 13, fontWeight: 700 }} />
                          <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, flexShrink: 0 }}>–</span>
                          <input type="time" value={program[key].end} onChange={e => setZi(key, "end", e.target.value)}
                            style={{ ...inp, width: "auto", padding: "6px 10px", fontSize: 13, fontWeight: 700 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3 — Gata! ── */}
            {step === 3 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF3EA", border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <CheckCircle size={40} color="#FF6B00" strokeWidth={1.8} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", marginBottom: 10 }}>Salonul tău e live!</h2>
                <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>
                  <strong style={{ color: "#1A1A1A" }}>{dateFirma.numeSalon}</strong> apare acum pe CalyHub.<br />
                  Primești programări automat — chiar și când dormi.
                </p>

                <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 16, padding: "18px 20px", marginBottom: 28, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle size={14} strokeWidth={2.5} /> 3 luni gratuite activate
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", fontWeight: 600 }}>
                      <MapPin size={14} color="#FF6B00" strokeWidth={2} />
                      {dateFirma.adresa}, {dateFirma.oras}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", fontWeight: 600 }}>
                      <Scissors size={14} color="#FF6B00" strokeWidth={2} />
                      {servicii.filter(s => s.nume).length} servicii configurate
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", fontWeight: 600 }}>
                      <Users size={14} color="#FF6B00" strokeWidth={2} />
                      {echipa.filter(g => g.nume).length || 1} groomer(i)
                    </div>
                    {dateFirma.cui && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", fontWeight: 600 }}>
                        <FileText size={14} color="#FF6B00" strokeWidth={2} />
                        {dateFirma.tipEntitate} · CUI: {dateFirma.cui}
                      </div>
                    )}
                    {programRezumat && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151", fontWeight: 600 }}>
                        <Clock size={14} color="#FF6B00" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{programRezumat}</span>
                      </div>
                    )}
                    {speciiSelectate.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151", fontWeight: 600, flexWrap: "wrap" }}>
                        {speciiSelectate.map(v => {
                          const s = SPECII.find(x => x.val === v);
                          return s ? <span key={v}>{s.icon} {s.label}</span> : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={() => router.push("/register/abonament-salon")}
                  style={{ padding: "14px 32px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif" }}>
                  Continuă spre alegerea planului →
                </button>
              </div>
            )}

            {step < 3 && (
              <button onClick={next} disabled={saving}
                style={{ marginTop: 24, width: "100%", padding: "14px 24px", borderRadius: 50, border: "none", background: saving ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: saving ? "default" : "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif", transition: "background .2s" }}>
                {saving ? "Se salvează..." : step === 2 ? "Finalizează configurarea →" : "Continuă →"}
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
      <Footer variant="auth" />
    </div>
  );
}
