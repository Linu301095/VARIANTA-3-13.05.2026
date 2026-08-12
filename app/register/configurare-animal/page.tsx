"use client";
import Logo from "../../../components/Logo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";
import { verificaPoza } from "../../../lib/poze";
import { Scissors, PawPrint, Check, ArrowRight, Camera, AlertTriangle } from "lucide-react";

const C = {
  surface: "var(--pub-surface)",
  surface2: "var(--pub-surface2)",
  bg: "var(--pub-bg)",
  line: "var(--pub-line)",
  text: "var(--pub-text)",
  text2: "var(--pub-text2)",
  muted: "var(--pub-muted)",
  dim: "var(--pub-dim)",
  orange: "var(--pub-orange)",
  orangeSoft: "var(--pub-orange-soft)",
};

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", background: "var(--pub-surface)", color: C.text };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid var(--pub-danger)" };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 6 };
const optional = <span style={{ fontWeight: 500, color: C.dim }}>(opțional)</span>;
const errStyle: React.CSSProperties = { fontSize: 12, color: "var(--pub-danger)", marginTop: 4, fontWeight: 600 };

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
  // "intrebare" = ecranul de alegere; animalul e optional, nu obligatoriu
  const [mod, setMod] = useState<"intrebare" | "form" | "success">("intrebare");
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
    const problemaPoza = verificaPoza(f);
    if (problemaPoza) { setUploadError(problemaPoza); return; }
    setUploadError("");
    setPozaAnimal(f);
    setPozaPreview(URL.createObjectURL(f));
  }
  function onSelectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const problemaAvatar = verificaPoza(f);
    if (problemaAvatar) { setUploadError(problemaAvatar); return; }
    setUploadError("");
    setAvatarUser(f);
    setAvatarPreview(URL.createObjectURL(f));
  }

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  /** Urcam avatarul persoanei — se intampla si daca omul sare peste animal. */
  async function uploadAvatar(userId: string) {
    if (!avatarUser) return;
    const ext = avatarUser.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, avatarUser, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiluri").update({ avatar_url: data.publicUrl }).eq("id", userId);
    }
  }

  /** "Nu acum" — salvam doar avatarul si intram in cont, fara animal. */
  async function saripeste() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    await uploadAvatar(user.id);
    router.push("/dashboard/client");
  }

  function validate() {
    const e: Record<string, string> = {};
    // Cerem doar ce e strict necesar ca salonul sa poata calcula pretul si sa stie cu ce lucreaza.
    if (!form.numeAnimal.trim()) e.numeAnimal = "Câmp obligatoriu";
    if (!form.specie) e.specie = "Alege specia";
    if (!form.talie) e.talie = "Alege talia — de ea depinde prețul la salon";
    if (form.greutate.trim() && (isNaN(Number(form.greutate)) || Number(form.greutate) <= 0)) e.greutate = "Valoare invalidă";
    if (form.varsta.trim() && (isNaN(Number(form.varsta)) || Number(form.varsta) < 0)) e.varsta = "Valoare invalidă";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    await uploadAvatar(user.id);

    const { data: animalNou, error } = await supabase
      .from("animale")
      .insert({
        user_id: user.id,
        nume: form.numeAnimal.trim(),
        specie: form.specie,
        sex: form.sex || null,
        rasa: form.rasa.trim() || null,
        talie: form.talie,
        greutate: form.greutate.trim() ? Number(form.greutate) : null,
        varsta: form.varsta.trim() ? Number(form.varsta) : null,
        alergii: form.alergii.trim() || "Fără alergii",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Animal insert error:", error);
      setUploadError("Nu am putut salva profilul animalului. Încearcă din nou.");
      setLoading(false);
      return;
    }

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
    setMod("success");
  }

  const Header = () => (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-surface)", borderBottom: `1px solid ${C.line}`, height: 66 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo h={44} priority />
        {mod === "form" && <div className="nav-hide-sm" style={{ fontSize: 13, color: C.dim, fontWeight: 600 }}>Profil animal — opțional</div>}
      </div>
    </header>
  );

  /* ─────────────── ECRANUL DE ALEGERE ─────────────── */
  if (mod === "intrebare") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 20px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(255,107,0,.16)", top: -110, left: "8%" }} />
            <div className="ch-orb b" style={{ width: 280, height: 280, background: "rgba(255,140,66,.13)", bottom: -90, right: "6%" }} />
          </div>

          <div className="ch-hero-anim" style={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 1 }}>
            <div style={{ background: C.surface, borderRadius: 28, padding: "clamp(26px,5vw,44px)", border: `1px solid ${C.line}`, boxShadow: "0 20px 60px var(--pub-shadow-warm), 0 4px 22px var(--pub-shadow)" }}>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: C.orangeSoft, border: `1px solid var(--pub-orange-border)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={28} color={C.orange} strokeWidth={2.4} />
                </div>
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, textAlign: "center", marginBottom: 10, letterSpacing: "-.02em" }}>Contul tău e gata</h1>
              <p style={{ fontSize: 15, color: C.muted, textAlign: "center", marginBottom: 26, lineHeight: 1.65 }}>
                Poți rezerva de pe acum la saloane de înfrumusețare — frizerie, coafor, manichiură, cosmetică.
                Dacă ai și un animal, adaugă-l și ți se deschide și partea de grooming.
              </p>

              {/* Poza de profil — se salveaza pe ambele drumuri */}
              <div style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 16, marginBottom: 22 }}>
                <div style={{ ...lbl, marginBottom: 10 }}>Poza ta de profil {optional}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <label style={{ cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: avatarPreview ? "transparent" : C.orangeSoft, border: `2px dashed ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {avatarPreview
                        ? <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <Camera size={22} color={C.orange} strokeWidth={1.9} />}
                    </div>
                    <input type="file" accept="image/*" onChange={onSelectAvatar} style={{ display: "none" }} />
                  </label>
                  <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, fontWeight: 600 }}>
                    {avatarUser
                      ? <><b style={{ color: "var(--pub-ok)" }}>Selectată:</b> {avatarUser.name}</>
                      : "O poți adăuga sau schimba oricând din contul tău."}
                  </div>
                </div>
              </div>

              <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button type="button" onClick={() => setMod("form")}
                  style={{ border: `2px solid ${C.orange}`, background: C.orangeSoft, borderRadius: 20, padding: "20px 16px", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                  <PawPrint size={24} color={C.orange} strokeWidth={1.9} />
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginTop: 10 }}>Am un animal</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 5, lineHeight: 1.5, fontWeight: 600 }}>
                    Îi fac profilul acum și pot rezerva la grooming.
                  </div>
                </button>

                <button type="button" onClick={saripeste} disabled={loading}
                  style={{ border: `1.5px solid ${C.line}`, background: C.surface, borderRadius: 20, padding: "20px 16px", cursor: loading ? "default" : "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                  <Scissors size={24} color={C.dim} strokeWidth={1.9} />
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginTop: 10 }}>{loading ? "Se pregătește..." : "Nu acum"}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 5, lineHeight: 1.5, fontWeight: 600 }}>
                    Intru în cont și rezerv pentru mine.
                  </div>
                </button>
              </div>

              <p style={{ fontSize: 12.5, color: C.dim, textAlign: "center", marginTop: 18, fontWeight: 600, lineHeight: 1.6 }}>
                Poți adăuga un animal oricând, din contul tău. Nimic nu se pierde.
              </p>
            </div>
          </div>
        </main>
        <Footer variant="auth" />
      </div>
    );
  }

  /* ─────────────── CONFIRMARE ─────────────── */
  if (mod === "success") {
    const specie = SPECII.find(s => s.val === form.specie);
    const talieLabel = form.talie === "mica" ? "Mică" : form.talie === "medie" ? "Medie" : form.talie === "mare" ? "Mare" : "—";
    const randuri: [string, string][] = [
      ["Specie", `${specie?.icon || "🐾"} ${specie?.label || "—"}`],
      ["Talie", talieLabel],
    ];
    if (form.sex) randuri.push(["Sex", form.sex === "mascul" ? "Mascul" : "Femelă"]);
    if (form.rasa.trim()) randuri.push(["Rasă", form.rasa]);
    if (form.greutate.trim()) randuri.push(["Greutate", `${form.greutate} kg`]);
    if (form.varsta.trim()) randuri.push(["Vârstă", `${form.varsta} ani`]);
    if (form.alergii.trim()) randuri.push(["Alergii", form.alergii]);

    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 20px" }}>
          <div className="ch-hero-anim" style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.orangeSoft, border: `3px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
              <Check size={38} color={C.orange} strokeWidth={2.4} />
            </div>
            <h1 style={{ fontSize: 25, fontWeight: 900, color: C.text, marginBottom: 12 }}>Gata, ai ambele lumi</h1>
            <p style={{ fontSize: 15, color: C.muted, marginBottom: 8, lineHeight: 1.7 }}>
              <strong style={{ color: C.text }}>{form.numeAnimal}</strong> are acum profil pe CalyHub.
              Din contul tău comuți între <strong style={{ color: C.text }}>programările tale</strong> și cele{" "}
              <strong style={{ color: C.text }}>pentru animalul tău</strong>.
            </p>

            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22, padding: "20px 24px", margin: "24px 0", textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--pub-orange-text)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.2 }}>
                Profilul lui {form.numeAnimal}
              </div>
              {randuri.map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 14, padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
                  <span style={{ color: C.muted, fontWeight: 600 }}>{k}</span>
                  <span style={{ fontWeight: 700, color: C.text, textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>

            <button onClick={() => router.push("/dashboard/client")} className="ch-cta"
              style={{ padding: "14px 32px", borderRadius: 50, border: "none", background: C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}>
              Intră în cont <ArrowRight size={17} strokeWidth={2.5} />
            </button>
          </div>
        </main>
        <Footer variant="auth" />
      </div>
    );
  }

  /* ─────────────── FORMULARUL ─────────────── */
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px" }}>
        <div className="ch-hero-anim" style={{ width: "100%", maxWidth: 520 }}>
          <div style={{ background: C.surface, borderRadius: 26, padding: "clamp(24px,5vw,42px)", border: `1px solid ${C.line}`, boxShadow: "0 14px 46px var(--pub-shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PawPrint size={25} color={C.orange} strokeWidth={1.9} />
              </div>
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 900, color: C.text, margin: 0 }}>Profilul animalului</h1>
                <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>Doar numele, specia și talia sunt necesare</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lbl}>Numele animalului *</label>
                <input value={form.numeAnimal} onChange={e => set("numeAnimal", e.target.value)} type="text" placeholder="Ex: Max, Bella, Luna..." style={errors.numeAnimal ? inpErr : inp} />
                {errors.numeAnimal && <div style={errStyle}>{errors.numeAnimal}</div>}
              </div>

              <div>
                <label style={lbl}>Specie *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 100px), 1fr))", gap: 8 }}>
                  {SPECII.map(s => (
                    <button key={s.val} type="button" onClick={() => { setForm(f => ({ ...f, specie: s.val, rasa: "" })); setRasaLibera(false); setErrors(e => { const n = { ...e }; delete n.specie; return n; }); }}
                      style={{ padding: "10px 8px", borderRadius: 12, border: form.specie === s.val ? `2px solid ${C.orange}` : `1.5px solid ${C.line}`, background: form.specie === s.val ? C.orangeSoft : C.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: form.specie === s.val ? C.orange : C.text2 }}>{s.label}</span>
                    </button>
                  ))}
                </div>
                {errors.specie && <div style={errStyle}>{errors.specie}</div>}
              </div>

              <div>
                <label style={lbl}>Talie *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {[
                    { val: "mica", label: "Mică", desc: "sub 10 kg" },
                    { val: "medie", label: "Medie", desc: "10–25 kg" },
                    { val: "mare", label: "Mare", desc: "peste 25 kg" },
                  ].map(t => (
                    <button key={t.val} type="button" onClick={() => set("talie", t.val)}
                      style={{ padding: "12px 6px", borderRadius: 12, border: form.talie === t.val ? `2px solid ${C.orange}` : `1.5px solid ${C.line}`, background: form.talie === t.val ? C.orangeSoft : C.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: form.talie === t.val ? C.orange : C.text2 }}>{t.label}</span>
                      <span style={{ fontSize: 10.5, color: C.dim, fontWeight: 600 }}>{t.desc}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: C.dim, marginTop: 6, fontWeight: 600 }}>Saloanele de grooming stabilesc prețul în funcție de talie.</div>
                {errors.talie && <div style={errStyle}>{errors.talie}</div>}
              </div>

              <div>
                <label style={lbl}>Rasa {optional}</label>
                {form.specie === "altele" || rasaLibera ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={form.rasa} onChange={e => set("rasa", e.target.value)} type="text" placeholder="Scrie rasa" style={{ ...inp, flex: 1 }} />
                    {form.specie !== "altele" && (
                      <button type="button" onClick={() => { setRasaLibera(false); set("rasa", ""); }}
                        style={{ padding: "0 14px", borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.surface, fontSize: 13, fontWeight: 700, color: C.text2, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Nunito, sans-serif" }}>
                        ← Listă
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value={form.rasa} onChange={e => set("rasa", e.target.value)}
                      style={{ ...inp, flex: 1, appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 } as React.CSSProperties}>
                      <option value="">— Alege rasa —</option>
                      {(RASE_PE_SPECII[form.specie] || []).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="button" onClick={() => { setRasaLibera(true); set("rasa", ""); }}
                      style={{ padding: "0 14px", borderRadius: 12, border: `1.5px solid ${C.orange}`, background: C.orangeSoft, fontSize: 13, fontWeight: 700, color: "var(--pub-orange-text)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Nunito, sans-serif" }}>
                      Altă rasă
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label style={lbl}>Sex {optional}</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[{ val: "mascul", label: "Mascul" }, { val: "femela", label: "Femelă" }].map(s => (
                    <button key={s.val} type="button" onClick={() => set("sex", form.sex === s.val ? "" : s.val)}
                      style={{ padding: "12px", borderRadius: 12, border: form.sex === s.val ? `2px solid ${C.orange}` : `1.5px solid ${C.line}`, background: form.sex === s.val ? C.orangeSoft : C.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", fontSize: 14, fontWeight: 800, color: form.sex === s.val ? C.orange : C.text2 }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 12 }}>
                <div>
                  <label style={lbl}>Greutate (kg) {optional}</label>
                  <input value={form.greutate} onChange={e => set("greutate", e.target.value)} type="number" min="0.1" step="0.1" placeholder="Ex: 8.5" style={errors.greutate ? inpErr : inp} />
                  {errors.greutate && <div style={errStyle}>{errors.greutate}</div>}
                </div>
                <div>
                  <label style={lbl}>Vârstă (ani) {optional}</label>
                  <input value={form.varsta} onChange={e => set("varsta", e.target.value)} type="number" min="0" step="0.5" placeholder="Ex: 3" style={errors.varsta ? inpErr : inp} />
                  {errors.varsta && <div style={errStyle}>{errors.varsta}</div>}
                </div>
              </div>

              <div>
                <label style={lbl}>Alergii / sensibilități {optional}</label>
                <input value={form.alergii} onChange={e => set("alergii", e.target.value)} type="text" placeholder="Ex: alergie la latex" style={inp} />
                <div style={{ fontSize: 11.5, color: C.dim, marginTop: 5, fontWeight: 600 }}>Dacă lași gol, salonul vede „Fără alergii".</div>
              </div>

              <div>
                <label style={lbl}>Poza animalului {optional}</label>
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px", borderRadius: 14, border: pozaPreview ? `1.5px solid ${C.orange}` : `1.5px dashed ${C.line}`, cursor: "pointer", background: pozaPreview ? C.surface : C.surface2, overflow: "hidden" }}>
                  {pozaPreview ? (
                    <>
                      <img src={pozaPreview} alt="Preview" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 12 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--pub-orange-text)" }}>Click pentru a schimba</span>
                    </>
                  ) : (
                    <>
                      <Camera size={24} color={C.dim} strokeWidth={1.8} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Click pentru a adăuga o poză</span>
                      <span style={{ fontSize: 12, color: C.dim }}>JPG, PNG — max 5MB</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={onSelectPoza} style={{ display: "none" }} />
                </label>
              </div>

              {uploadError && (
                <div style={{ background: "var(--pub-danger-bg)", border: "1px solid var(--pub-danger-line)", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--pub-danger)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <AlertTriangle size={15} strokeWidth={2} /> {uploadError}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} className="ch-cta"
                style={{ padding: "14px 24px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif", marginTop: 4 }}>
                {loading ? "Se salvează..." : "Salvează profilul →"}
              </button>

              <button type="button" onClick={saripeste} disabled={loading}
                style={{ padding: "10px", borderRadius: 50, border: "none", background: "transparent", color: C.muted, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                Adaug animalul mai târziu →
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer variant="auth" />
    </div>
  );
}
