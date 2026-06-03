"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid #EF4444" };

const RASE_PE_SPECII: Record<string, string[]> = {
  caine:   ["Labrador Retriever", "Golden Retriever", "Pudel", "Chihuahua", "Husky Siberian", "Bulldog Francez", "Ciobanesc German", "Shih Tzu", "Bichon Frisé", "Maltez", "Yorkshire Terrier", "Cocker Spaniel", "Beagle", "Pomeranian", "Dachshund", "Boxer", "Dalmatian"],
  pisica:  ["Persan", "Maine Coon", "British Shorthair", "Siam", "Bengal", "Ragdoll", "Abisinian", "Scottish Fold", "Sphynx", "Norwegian Forest", "Turkish Angora", "Russian Blue"],
  iepure:  ["Angora", "Leu (Lionhead)", "Rex", "Mini Rex", "Olandeze (Dutch)", "Flemish Giant", "Lop (Floppy Ears)", "Californian"],
  pasare:  ["Peruș (Budgerigar)", "Papagal African Gri", "Agapornis (Lovebird)", "Nimfă (Cockatiel)", "Canar", "Cacadu (Cockatoo)", "Amazon", "Eclectus"],
  rozator: ["Hamster Syrian", "Hamster Pitic", "Cobai (Guinea Pig)", "Chinchilla", "Gerbil", "Șobolan de companie", "Dihor (Ferret)"],
  reptila: ["Iguana", "Șarpe Corn (Corn Snake)", "Leopard Gecko", "Bearded Dragon", "Blue Tongue Skink", "Cameleon", "Broasca Testoasă"],
  altele:  [],
};

const SPECII = [
  { val: "caine", label: "Câine", icon: "🐶" },
  { val: "pisica", label: "Pisică", icon: "🐱" },
  { val: "iepure", label: "Iepure", icon: "🐰" },
  { val: "pasare", label: "Pasăre", icon: "🐦" },
  { val: "rozator", label: "Rozătoare", icon: "🐹" },
  { val: "reptila", label: "Reptilă", icon: "🦎" },
  { val: "altele", label: "Altele", icon: "✨" },
];

export default function ConfigurareAnimal() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState({ specie: "caine", sex: "", rasa: "", talie: "", greutate: "", varsta: "", alergii: "", numeAnimal: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [rasaLibera, setRasaLibera] = useState(false);
  const [pozaAnimal, setPozaAnimal] = useState<File | null>(null);
  const [pozaPreview, setPozaPreview] = useState<string | null>(null);
  const [avatarUser, setAvatarUser] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  function onSelectPoza(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setUploadError("Poza animăluțului depășește 5MB"); return; }
    setUploadError("");
    setPozaAnimal(f);
    setPozaPreview(URL.createObjectURL(f));
  }
  function onSelectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setUploadError("Avatarul depășește 5MB"); return; }
    setUploadError("");
    setAvatarUser(f);
    setAvatarPreview(URL.createObjectURL(f));
  }

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.numeAnimal.trim()) e.numeAnimal = "Câmp obligatoriu";
    if (!form.specie) e.specie = "Alege specia";
    if (!form.sex) e.sex = "Alege sexul";
    if (!form.rasa.trim()) e.rasa = "Câmp obligatoriu";
    if (!form.talie) e.talie = "Alege talia";
    if (!form.greutate.trim()) e.greutate = "Câmp obligatoriu";
    else if (isNaN(Number(form.greutate)) || Number(form.greutate) <= 0) e.greutate = "Valoare invalidă";
    if (!form.varsta.trim()) e.varsta = "Câmp obligatoriu";
    else if (isNaN(Number(form.varsta)) || Number(form.varsta) <= 0) e.varsta = "Valoare invalidă";
    if (!form.alergii.trim()) e.alergii = 'Scrie "Fără alergii" dacă nu are';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Upload avatar utilizator (opțional) — nu blocăm salvarea dacă eșuează
    if (avatarUser) {
      const ext = avatarUser.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarUser, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        await supabase.from("profiluri").update({ avatar_url: urlData.publicUrl }).eq("id", user.id);
      }
    }

    const { data: animalNou, error } = await supabase
      .from("animale")
      .insert({
        user_id: user.id,
        nume: form.numeAnimal.trim(),
        specie: form.specie,
        sex: form.sex,
        rasa: form.rasa.trim(),
        talie: form.talie,
        greutate: Number(form.greutate),
        varsta: Number(form.varsta),
        alergii: form.alergii.trim(),
      })
      .select("id")
      .single();

    if (error) console.error("Animal insert error:", error);

    // Upload poză animal (opțional) — după ce avem id-ul
    if (animalNou && pozaAnimal) {
      const ext = pozaAnimal.name.split(".").pop() || "jpg";
      const path = `${user.id}/${animalNou.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from("animale").upload(path, pozaAnimal, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("animale").getPublicUrl(path);
        await supabase.from("animale").update({ poza_url: urlData.publicUrl }).eq("id", animalNou.id);
      }
    }

    setLoading(false);
    setStep("success");
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
              {[
                [`${SPECII.find(s => s.val === form.specie)?.icon || "🐾"} Specie`, SPECII.find(s => s.val === form.specie)?.label || "—"],
                ["⚥ Sex", form.sex === "mascul" ? "♂️ Mascul" : form.sex === "femela" ? "♀️ Femelă" : "—"],
                ["🐾 Rasă", form.rasa],
                ["📏 Talie", form.talie === "mica" ? "Mică" : form.talie === "medie" ? "Medie" : form.talie === "mare" ? "Mare" : "—"],
                ["⚖️ Greutate", `${form.greutate} kg`],
                ["🎂 Vârstă", `${form.varsta} ani`],
                ["💊 Alergii", form.alergii],
              ].map(([label, val]) => (
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
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {["Cont creat ✓", "Profil animăluț"].map((label, i) => (
              <div key={label} style={{ flex: 1, height: 4, borderRadius: 4, background: "#FF6B00" }} />
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
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Poza ta de profil <span style={{ fontWeight: 500, color: "#9CA3AF" }}>(opțional)</span></label>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <label style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: avatarPreview ? "transparent" : "#FFF3EA", border: "2px dashed #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, overflow: "hidden" }}>
                      {avatarPreview ? <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                    <input type="file" accept="image/*" onChange={onSelectAvatar} style={{ display: "none" }} />
                  </label>
                  <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
                    {avatarUser ? <><strong style={{ color: "#FF6B00" }}>✓ Selectat:</strong> {avatarUser.name}</> : "Adaugă o poză cu tine — opțional, o poți schimba oricând din profil."}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Numele animăluțului *</label>
                <input value={form.numeAnimal} onChange={e => set("numeAnimal", e.target.value)} type="text" placeholder="Ex: Max, Bella, Luna..." style={errors.numeAnimal ? inpErr : inp} />
                {errors.numeAnimal && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.numeAnimal}</div>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Specie *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))", gap: 8 }}>
                  {SPECII.map(s => (
                    <button key={s.val} type="button" onClick={() => { setForm(f => ({ ...f, specie: s.val, rasa: "" })); setRasaLibera(false); setErrors(e => { const n = { ...e }; delete n.specie; delete n.rasa; return n; }); }}
                      style={{ padding: "10px 8px", borderRadius: 12, border: form.specie === s.val ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", background: form.specie === s.val ? "#FFF3EA" : "#fff", cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: form.specie === s.val ? "#FF6B00" : "#374151" }}>{s.label}</span>
                    </button>
                  ))}
                </div>
                {errors.specie && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.specie}</div>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Sex *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[{ val: "mascul", label: "Mascul", icon: "♂️" }, { val: "femela", label: "Femelă", icon: "♀️" }].map(s => (
                    <button key={s.val} type="button" onClick={() => set("sex", s.val)}
                      style={{ padding: "12px", borderRadius: 12, border: form.sex === s.val ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", background: form.sex === s.val ? "#FFF3EA" : "#fff", cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 800, color: form.sex === s.val ? "#FF6B00" : "#374151" }}>
                      <span style={{ fontSize: 18 }}>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
                {errors.sex && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.sex}</div>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Rasa *</label>
                {form.specie === "altele" || rasaLibera ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={form.rasa} onChange={e => set("rasa", e.target.value)} type="text"
                      placeholder="Scrie rasa animăluțului" style={{ ...(errors.rasa ? inpErr : inp), flex: 1 }} />
                    {form.specie !== "altele" && (
                      <button type="button" onClick={() => { setRasaLibera(false); set("rasa", ""); }}
                        style={{ padding: "0 14px", borderRadius: 12, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Nunito, sans-serif" }}>
                        ← Listă
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value={form.rasa} onChange={e => set("rasa", e.target.value)}
                      style={{ ...(errors.rasa ? inpErr : inp), flex: 1, appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 } as React.CSSProperties}>
                      <option value="">— Alege rasa —</option>
                      {(RASE_PE_SPECII[form.specie] || []).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="button" onClick={() => { setRasaLibera(true); set("rasa", ""); }}
                      style={{ padding: "0 14px", borderRadius: 12, border: "1.5px solid #FF6B00", background: "#FFF3EA", fontSize: 13, fontWeight: 700, color: "#FF6B00", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Nunito, sans-serif" }}>
                      Altă rasă
                    </button>
                  </div>
                )}
                {errors.rasa && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.rasa}</div>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Talie *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {[
                    { val: "mica", label: "Mică", desc: "sub 10 kg", icon: "🐕‍🦺" },
                    { val: "medie", label: "Medie", desc: "10–25 kg", icon: "🐕" },
                    { val: "mare", label: "Mare", desc: "peste 25 kg", icon: "🐺" },
                  ].map(t => (
                    <button key={t.val} type="button" onClick={() => set("talie", t.val)}
                      style={{ padding: "10px 6px", borderRadius: 12, border: form.talie === t.val ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", background: form.talie === t.val ? "#FFF3EA" : "#fff", cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: form.talie === t.val ? "#FF6B00" : "#374151" }}>{t.label}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>{t.desc}</span>
                    </button>
                  ))}
                </div>
                {errors.talie && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.talie}</div>}
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
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Poza animăluțului <span style={{ fontWeight: 500, color: "#9CA3AF" }}>(opțional)</span></label>
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px", borderRadius: 12, border: pozaPreview ? "1.5px solid #FF6B00" : "1.5px dashed #EBEBEB", cursor: "pointer", background: pozaPreview ? "#fff" : "#FAFAFA", overflow: "hidden" }}>
                  {pozaPreview ? (
                    <>
                      <img src={pozaPreview} alt="Preview" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 12 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>✓ Click pentru a schimba</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 24 }}>📷</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280" }}>Click pentru a adăuga o poză</span>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>JPG, PNG — max 5MB</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={onSelectPoza} style={{ display: "none" }} />
                </label>
              </div>

              {uploadError && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#EF4444", textAlign: "center" }}>
                  ⚠️ {uploadError}
                </div>
              )}

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
