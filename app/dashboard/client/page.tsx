"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

const SALOANE = [
  { id: 1, nume: "Paws & Style", oras: "București, Sector 2", rating: 4.9, recenzii: 127, servicii: ["Tuns", "Băiță", "Unghii"], pretDe: 80, distanta: "1.2 km", badge: "Top rated", badgeIcon: "⭐", culoare: "#FF6B00", bg: "#FFF3EA" },
  { id: 2, nume: "Fluffy Salon", oras: "București, Sector 1", rating: 4.8, recenzii: 89, servicii: ["Tuns", "Styling", "Spa"], pretDe: 90, distanta: "2.1 km", badge: "Nou", badgeIcon: "🆕", culoare: "#8B5CF6", bg: "#F5F3FF" },
  { id: 3, nume: "Happy Pets Grooming", oras: "București, Sector 3", rating: 4.7, recenzii: 214, servicii: ["Tuns", "Băiță", "Anti-purici"], pretDe: 65, distanta: "3.4 km", badge: "Popular", badgeIcon: "🔥", culoare: "#10B981", bg: "#ECFDF5" },
  { id: 4, nume: "Royal Dog Salon", oras: "București, Sector 4", rating: 4.9, recenzii: 56, servicii: ["Premium grooming", "Spa", "Masaj"], pretDe: 120, distanta: "4.0 km", badge: "Premium", badgeIcon: "👑", culoare: "#F59E0B", bg: "#FFFBEB" },
];

type Tab = "saloane" | "programari" | "profil" | "animal" | "notificari" | "setari" | "ajutor";
type Programare = {
  id: number; salon: string; serviciu: string; data: string; ora: string;
  status: "confirmat" | "în așteptare" | "finalizat" | "anulat"; pret: string;
};

/* ── Color palette ── */
const C = {
  light: {
    pageBg: "#F8F8F8", surface: "#ffffff", surface2: "#F9FAFB", surface3: "#F3F4F6",
    text: "#1A1A1A", text2: "#374151", muted: "#6B7280", xmuted: "#9CA3AF",
    border: "#EBEBEB", border2: "#F3F4F6", input: "#ffffff",
    orangeAccent: "#FFF3EA", orangeBorder: "#FFDCC6",
    shadow: "0 8px 32px rgba(0,0,0,.12)", cardShadow: "0 2px 16px rgba(0,0,0,.05)",
    toggleOff: "#E5E7EB",
  },
  dark: {
    pageBg: "#0A0A0A", surface: "#161616", surface2: "#1F1F1F", surface3: "#262626",
    text: "#F5F5F5", text2: "#E5E7EB", muted: "#9CA3AF", xmuted: "#6B7280",
    border: "#2A2A2A", border2: "#2A2A2A", input: "#111111",
    orangeAccent: "rgba(255,107,0,0.13)", orangeBorder: "rgba(255,107,0,0.25)",
    shadow: "0 8px 32px rgba(0,0,0,.5)", cardShadow: "0 2px 16px rgba(0,0,0,.3)",
    toggleOff: "#3A3A3A",
  },
};

type ColorSet = typeof C.light;
type ThemeCtxType = { theme: "light" | "dark"; c: ColorSet; toggleTheme: (t: "light" | "dark") => void };
const ThemeCtx = createContext<ThemeCtxType>({ theme: "light", c: C.light, toggleTheme: () => {} });

function statusStyle(theme: "light" | "dark") {
  const d = theme === "dark";
  return {
    "confirmat":    { bg: d ? "rgba(16,185,129,.15)"  : "#ECFDF5", color: "#10B981", label: "✓ Confirmat" },
    "în așteptare": { bg: d ? "rgba(255,107,0,.15)"   : "#FFF3EA", color: "#FF6B00", label: "⏳ În așteptare" },
    "finalizat":    { bg: d ? "rgba(14,165,233,.15)"  : "#F0F9FF", color: "#0EA5E9", label: "✅ Finalizat" },
    "anulat":       { bg: d ? "rgba(239,68,68,.15)"   : "#FEF2F2", color: "#EF4444", label: "✕ Anulat" },
  };
}

/* ── Top-level component ── */
export default function DashboardClient() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<any>(null);
  const [animal, setAnimal] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("saloane");
  const [salonSelectat, setSalonSelectat] = useState<number | null>(null);
  const [rezervare, setRezervare] = useState<{ salonId: number; serviciu: string; ora: string } | null>(null);
  const [confirmat, setConfirmat] = useState(false);
  const [programari, setProgramari] = useState<Programare[]>([
    { id: 1, salon: "Paws & Style", serviciu: "Tuns + Băiță + Unghii", data: "16 Mai 2026", ora: "10:00", status: "confirmat", pret: "120 RON" },
    { id: 2, salon: "Fluffy Salon", serviciu: "Styling complet", data: "20 Mai 2026", ora: "14:00", status: "în așteptare", pret: "150 RON" },
    { id: 3, salon: "Happy Pets Grooming", serviciu: "Băiță + uscare", data: "2 Mai 2026", ora: "11:00", status: "finalizat", pret: "50 RON" },
    { id: 4, salon: "Paws & Style", serviciu: "Tuns complet", data: "10 Apr 2026", ora: "09:30", status: "finalizat", pret: "80 RON" },
  ]);
  const [notifSettings, setNotifSettings] = useState({ sms: true, email: true, newsletter: false });
  const [profilForm, setProfilForm] = useState({ numeComplet: "", email: "", telefon: "" });
  const [animalForm, setAnimalForm] = useState({ numeAnimal: "", rasa: "", greutate: "", varsta: "", alergii: "" });
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiluri")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setUser({ ...profile, email: authUser.email });
        setProfilForm({ numeComplet: profile.nume || "", email: authUser.email || "", telefon: profile.telefon || "" });
        if (profile.tema === "dark") {
          setTheme("dark");
          document.documentElement.dataset.theme = "dark";
          try { localStorage.setItem("calyhub_theme", "dark"); } catch {}
        }
      }

      const { data: animalData } = await supabase
        .from("animale")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (animalData) {
        setAnimal(animalData);
        setAnimalForm({
          numeAnimal: animalData.nume || "",
          rasa: animalData.rasa || "",
          greutate: String(animalData.greutate || ""),
          varsta: String(animalData.varsta || ""),
          alergii: animalData.alergii || "",
        });
      }
    }
    loadUser();
  }, []);

  function toggleTheme(t: "light" | "dark") {
    setTheme(t);
    document.documentElement.dataset.theme = t === "light" ? "" : t;
    try { if (t === "dark") localStorage.setItem("calyhub_theme", "dark"); else localStorage.removeItem("calyhub_theme"); } catch {}
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) supabase.from("profiluri").update({ tema: t }).eq("id", authUser.id);
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    document.documentElement.dataset.theme = "";
    try { localStorage.removeItem("calyhub_theme"); } catch {}
    router.push("/login");
  }

  const c = C[theme];
  const prenume = user?.nume?.split(" ")[0] || "Utilizator";
  const salon = SALOANE.find(s => s.id === salonSelectat);
  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${c.border}`, fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", background: c.input, color: c.text };

  function salveaza(msg: string) { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); }

  const btnPrimary: React.CSSProperties = { padding: "12px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 16px rgba(255,107,0,.35)" };
  const btnSecondary: React.CSSProperties = { padding: "12px 24px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
  const btnBack: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, marginBottom: 20, background: "none", border: "none", fontSize: 14, fontWeight: 700, color: c.muted, cursor: "pointer", fontFamily: "Nunito, sans-serif", padding: 0 };
  const ST = statusStyle(theme);

  /* ── Confirmare view ── */
  if (confirmat && rezervare && salon) {
    const noua: Programare = { id: Date.now(), salon: salon.nume, serviciu: rezervare.serviciu, data: new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }), ora: rezervare.ora, status: "în așteptare", pret: "—" };
    return (
      <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
        <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px 20px" }}>
            <div style={{ textAlign: "center", maxWidth: 460, width: "100%" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: c.orangeAccent, border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✅</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: c.text, marginBottom: 10 }}>Programare trimisă!</h1>
              <p style={{ fontSize: 14, color: c.muted, marginBottom: 24, lineHeight: 1.7 }}>Salonul va confirma în curând. Vei primi un SMS de confirmare.</p>
              <div style={{ background: c.surface, border: "2px solid #FF6B00", borderRadius: 20, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
                {[["🏪 Salon", salon.nume], ["✂️ Serviciu", rezervare.serviciu], ["🕐 Ora", rezervare.ora], ["🐾 Animal", animal?.nume || "Animăluțul tău"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderBottom: `1px solid ${c.border2}` }}>
                    <span style={{ color: c.muted }}>{k}</span><span style={{ fontWeight: 700, color: c.text }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => { setProgramari(p => [...p, noua]); setConfirmat(false); setSalonSelectat(null); setRezervare(null); setTab("programari"); }} style={btnSecondary}>Vezi programările mele</button>
                <button onClick={() => { setProgramari(p => [...p, noua]); setConfirmat(false); setSalonSelectat(null); setRezervare(null); }} style={btnPrimary}>← Înapoi la saloane</button>
              </div>
            </div>
          </div>
        </Shell>
      </ThemeCtx.Provider>
    );
  }

  /* ── Profil salon view ── */
  if (salonSelectat && salon) {
    return (
      <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
        <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab}>
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px" }}>
            <button onClick={() => { setSalonSelectat(null); setRezervare(null); }} style={btnBack}>← Înapoi</button>
            <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `2px solid ${salon.culoare}`, marginBottom: 20, boxShadow: c.cardShadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: salon.culoare, background: salon.bg, padding: "4px 10px", borderRadius: 50, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{salon.badgeIcon} {salon.badge}</span>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: c.text, margin: "0 0 6px" }}>{salon.nume}</h2>
                  <div style={{ fontSize: 13, color: c.muted }}>📍 {salon.oras} · {salon.distanta}</div>
                </div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 24, fontWeight: 900, color: c.text }}>⭐ {salon.rating}</div><div style={{ fontSize: 12, color: c.xmuted }}>{salon.recenzii} recenzii</div></div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>{salon.servicii.map(s => <Tag key={s} label={s} color={salon.culoare} bg={salon.bg} />)}</div>
            </div>

            <SectionTitle>Alege serviciul</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[{ nume: "Tuns complet", pret: "80 RON", durata: "60 min" }, { nume: "Băiță + uscare", pret: "50 RON", durata: "40 min" }, { nume: "Tuns + Băiță + Unghii", pret: "120 RON", durata: "90 min" }, { nume: "Styling complet", pret: "150 RON", durata: "120 min" }].map(s => {
                const sel = rezervare?.serviciu === s.nume;
                return (
                  <button key={s.nume} onClick={() => setRezervare(r => ({ ...r!, salonId: salon.id, serviciu: s.nume, ora: r?.ora || "" }))}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 14, border: sel ? `2px solid ${salon.culoare}` : `1.5px solid ${c.border}`, background: sel ? salon.bg : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                    <div><div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{s.nume}</div><div style={{ fontSize: 12, color: c.xmuted, marginTop: 2 }}>⏱ {s.durata}</div></div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: salon.culoare, marginLeft: 12 }}>{s.pret}</div>
                  </button>
                );
              })}
            </div>

            {rezervare?.serviciu && (<>
              <SectionTitle>Alege ora</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 8, marginBottom: 24 }}>
                {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(ora => {
                  const sel = rezervare?.ora === ora;
                  return <button key={ora} onClick={() => setRezervare(r => ({ ...r!, ora }))} style={{ padding: "11px 6px", borderRadius: 10, border: sel ? `2px solid ${salon.culoare}` : `1.5px solid ${c.border}`, background: sel ? salon.bg : c.surface, fontSize: 13, fontWeight: 700, color: sel ? salon.culoare : c.text2, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>{ora}</button>;
                })}
              </div>
            </>)}
            {rezervare?.serviciu && rezervare?.ora && <button onClick={() => setConfirmat(true)} style={{ ...btnPrimary, width: "100%" }}>Confirmă programarea →</button>}
          </div>
        </Shell>
      </ThemeCtx.Provider>
    );
  }

  const viitoare = programari.filter(p => p.status === "confirmat" || p.status === "în așteptare");
  const trecute = programari.filter(p => p.status === "finalizat" || p.status === "anulat");

  return (
    <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
      <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

          {/* Toast */}
          {savedMsg && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1A1A1A", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>✓ {savedMsg}</div>}

          {/* Bun venit */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 900, color: c.text, marginBottom: 10 }}>Bună, {prenume}! 🐾</h1>
            {animal && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: c.surface, border: "2px solid #FF6B00", borderRadius: 50, padding: "8px 18px", fontSize: 13 }}>
                <span style={{ fontSize: 18 }}>🐕</span>
                <span style={{ fontWeight: 800, color: c.text }}>{animal.nume}</span>
                <span style={{ color: c.border }}>|</span>
                <span style={{ color: c.muted, fontWeight: 600 }}>{animal.rasa}, {animal.greutate} kg</span>
              </div>
            )}
          </div>

          {/* TAB SALOANE */}
          {tab === "saloane" && (<>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: c.text, margin: 0 }}>📍 Recomandate în zona ta</h2>
              <span style={{ fontSize: 12, color: c.xmuted, fontWeight: 600, background: c.surface3, padding: "4px 12px", borderRadius: 50 }}>București</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 36 }}>
              {SALOANE.slice(0, 2).map(s => <CardSalon key={s.id} salon={s} onSelect={() => setSalonSelectat(s.id)} />)}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: c.text, marginBottom: 16 }}>✂️ Toți partenerii CalyHub</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {SALOANE.map(s => <CardSalon key={s.id} salon={s} onSelect={() => setSalonSelectat(s.id)} />)}
            </div>
          </>)}

          {/* TAB PROGRAMARI */}
          {tab === "programari" && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: c.text, marginBottom: 20 }}>📅 Programările mele</h2>
              {viitoare.length > 0 && (<>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Viitoare</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                  {viitoare.map(p => <CardProgramare key={p.id} p={p} onAnuleaza={id => setProgramari(pr => pr.map(x => x.id === id ? { ...x, status: "anulat" } : x))} />)}
                </div>
              </>)}
              {trecute.length > 0 && (<>
                <div style={{ fontSize: 13, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Istoric</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {trecute.map(p => <CardProgramare key={p.id} p={p} />)}
                </div>
              </>)}
              {programari.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: c.xmuted }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nicio programare încă</div>
                  <button onClick={() => setTab("saloane")} style={{ ...btnPrimary, marginTop: 8 }}>🐾 Caută salon acum</button>
                </div>
              )}
            </div>
          )}

          {/* TAB PROFIL */}
          {tab === "profil" && (
            <div style={{ maxWidth: 520 }}>
              <PageHeader icon="👤" title="Profilul meu" sub="Actualizează datele tale de contact" />
              <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[{ key: "numeComplet", label: "Nume complet", placeholder: "Ion Popescu" }, { key: "email", label: "Email", placeholder: "ion@email.com" }, { key: "telefon", label: "Telefon", placeholder: "07XX XXX XXX" }].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>{f.label}</label>
                      <input value={(profilForm as any)[f.key]} onChange={e => setProfilForm(pf => ({ ...pf, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} />
                    </div>
                  ))}
                  <button onClick={async () => {
                    const { data: { user: authUser } } = await supabase.auth.getUser();
                    if (authUser) {
                      await supabase.from("profiluri").update({ nume: profilForm.numeComplet, telefon: profilForm.telefon }).eq("id", authUser.id);
                    }
                    setUser((u: any) => ({ ...u, nume: profilForm.numeComplet, telefon: profilForm.telefon }));
                    salveaza("Profil actualizat!");
                  }} style={{ ...btnPrimary, marginTop: 4 }}>Salvează modificările</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB ANIMAL */}
          {tab === "animal" && (
            <div style={{ maxWidth: 520 }}>
              <PageHeader icon="🐾" title="Animăluțul meu" sub="Actualizează profilul animăluțului" />
              <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[{ key: "numeAnimal", label: "Numele animăluțului", placeholder: "Max" }, { key: "rasa", label: "Rasa", placeholder: "Labrador Retriever" }, { key: "alergii", label: "Alergii / Sensibilități", placeholder: "Fără alergii" }].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>{f.label}</label>
                      <input value={(animalForm as any)[f.key]} onChange={e => setAnimalForm(af => ({ ...af, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} />
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12 }}>
                    {[{ key: "greutate", label: "Greutate (kg)", placeholder: "8.5" }, { key: "varsta", label: "Vârstă (ani)", placeholder: "3" }].map(f => (
                      <div key={f.key}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>{f.label}</label>
                        <input value={(animalForm as any)[f.key]} onChange={e => setAnimalForm(af => ({ ...af, [f.key]: e.target.value }))} type="number" placeholder={f.placeholder} style={inp} />
                      </div>
                    ))}
                  </div>
                  <button onClick={async () => {
                    const { data: { user: authUser } } = await supabase.auth.getUser();
                    if (authUser && animal?.id) {
                      await supabase.from("animale").update({
                        nume: animalForm.numeAnimal,
                        rasa: animalForm.rasa,
                        greutate: Number(animalForm.greutate),
                        varsta: Number(animalForm.varsta),
                        alergii: animalForm.alergii,
                      }).eq("id", animal.id);
                    }
                    setAnimal((a: any) => ({ ...a, nume: animalForm.numeAnimal, rasa: animalForm.rasa, greutate: Number(animalForm.greutate), varsta: Number(animalForm.varsta), alergii: animalForm.alergii }));
                    salveaza("Profil animăluț actualizat!");
                  }} style={{ ...btnPrimary, marginTop: 4 }}>Salvează modificările</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB NOTIFICARI */}
          {tab === "notificari" && (
            <div style={{ maxWidth: 520 }}>
              <PageHeader icon="🔔" title="Notificări" sub="Alege cum vrei să fii anunțat" />
              <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}`, display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { key: "sms", label: "SMS programări", sub: "Confirmare și reminder cu 24h înainte" },
                  { key: "email", label: "Email reminder", sub: "Rezumat programare pe email" },
                  { key: "newsletter", label: "Newsletter CalyHub", sub: "Oferte și noutăți de la saloane" },
                ].map((item, i) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: i < 2 ? `1px solid ${c.border2}` : "none" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: c.xmuted, marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <button onClick={() => setNotifSettings(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                      style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: notifSettings[item.key as keyof typeof notifSettings] ? "#FF6B00" : c.toggleOff, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                      <span style={{ position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)", transition: "left .2s", left: notifSettings[item.key as keyof typeof notifSettings] ? 22 : 2 }} />
                    </button>
                  </div>
                ))}
                <button onClick={() => salveaza("Preferințe notificări salvate!")} style={{ ...btnPrimary, marginTop: 20 }}>Salvează preferințele</button>
              </div>
            </div>
          )}

          {/* TAB SETARI */}
          {tab === "setari" && (
            <div style={{ maxWidth: 520 }}>
              <PageHeader icon="🔒" title="Setări cont" sub="Modifică parola contului tău" />
              <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[{ label: "Parola curentă", placeholder: "••••••••" }, { label: "Parola nouă", placeholder: "Minim 8 caractere" }, { label: "Confirmă parola nouă", placeholder: "••••••••" }].map(f => (
                    <div key={f.label}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>{f.label}</label>
                      <input type="password" placeholder={f.placeholder} style={inp} />
                    </div>
                  ))}
                  <button onClick={() => salveaza("Parolă schimbată cu succes!")} style={{ ...btnPrimary, marginTop: 4 }}>Schimbă parola</button>
                </div>
              </div>
              <div style={{ background: c.surface, borderRadius: 20, padding: "24px 28px", border: `1.5px solid ${c.border}`, marginTop: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 6 }}>Zona periculoasă</div>
                <div style={{ fontSize: 13, color: c.muted, marginBottom: 14 }}>Ștergerea contului este permanentă și nu poate fi anulată.</div>
                <button style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,.1)", border: "none", padding: "9px 18px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Șterge contul</button>
              </div>
            </div>
          )}

          {/* TAB AJUTOR */}
          {tab === "ajutor" && (
            <div style={{ maxWidth: 620 }}>
              <PageHeader icon="❓" title="Ajutor" sub="Răspunsuri la cele mai frecvente întrebări" />
              <FAQ items={[
                { q: "Cum anulez o programare?", r: "Mergi la Programările mele, găsești programarea activă și dai click pe Anulează. Poți anula cu cel puțin 2 ore înainte." },
                { q: "Pot schimba ora programării?", r: "Momentan poți anula și face o programare nouă. Funcția de reprogramare va fi disponibilă în curând." },
                { q: "Primesc reminder înainte de programare?", r: "Da, primești SMS cu 24 de ore înainte dacă ai notificările SMS activate din meniul Notificări." },
                { q: "Cum adaug un al doilea animăluț?", r: "Suportul pentru mai mulți animăluți va fi disponibil în versiunea următoare a aplicației." },
                { q: "Cum contactez salonul direct?", r: "Pe pagina salonului vei găsi numărul de telefon public al acestuia." },
              ]} />
              <div style={{ background: c.orangeAccent, border: `1px solid ${c.orangeBorder}`, borderRadius: 16, padding: "18px 22px", marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FF6B00", marginBottom: 4 }}>Nu ai găsit răspunsul?</div>
                <div style={{ fontSize: 13, color: c.muted }}>Contactează-ne la <strong>support@calyhub.ro</strong> sau prin chat live.</div>
              </div>
            </div>
          )}

        </div>
      </Shell>
    </ThemeCtx.Provider>
  );
}

/* ── Shell ── */
function Shell({ children, prenume, tab, onLogout, onNav }: { children: React.ReactNode; prenume: string; tab: Tab; onLogout: () => void; onNav: (t: Tab) => void }) {
  const [open, setOpen] = useState(false);
  const { theme, c, toggleTheme } = useContext(ThemeCtx);

  const TAB_LABELS: Record<Tab, string> = {
    saloane: "Saloane", programari: "Programările mele", profil: "Profilul meu",
    animal: "Animăluțul meu", notificari: "Notificări", setari: "Setări cont", ajutor: "Ajutor",
  };

  const items: { icon: string; label: string; sub: string; t: Tab }[] = [
    { icon: "👤", label: "Profilul meu", sub: "Nume, email, telefon", t: "profil" },
    { icon: "🐾", label: "Animăluțul meu", sub: "Editează profil", t: "animal" },
    { icon: "📅", label: "Programările mele", sub: "Vezi toate programările", t: "programari" },
    { icon: "🔔", label: "Notificări", sub: "Setări SMS / email", t: "notificari" },
    { icon: "🔒", label: "Setări cont", sub: "Schimbă parola", t: "setari" },
    { icon: "❓", label: "Ajutor", sub: "FAQ · Contact support", t: "ajutor" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: c.pageBg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: c.surface, borderBottom: `1px solid ${c.border}`, height: 64 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/"><Image src="/logo.png" alt="CalyHub" width={110} height={38} style={{ height: 38, width: "auto", objectFit: "contain" }} priority /></Link>
            {tab !== "saloane" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 1, height: 22, background: c.border }} />
                <button onClick={() => onNav("saloane")}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, fontSize: 13, fontWeight: 700, color: c.muted, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  ← Înapoi
                </button>
                <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>{TAB_LABELS[tab]}</div>
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 50, border: open ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: open ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>👤</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{prenume}</span>
              <span style={{ fontSize: 10, color: c.xmuted, display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>▼</span>
            </button>
            {open && (
              <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 262, background: c.surface, borderRadius: 18, border: `1.5px solid ${c.border}`, boxShadow: c.shadow, overflow: "hidden", zIndex: 200 }}>
                <div style={{ padding: "14px 18px", background: c.orangeAccent, borderBottom: `1px solid ${c.orangeBorder}` }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>{prenume}</div>
                  <div style={{ fontSize: 12, color: "#FF6B00", fontWeight: 600, marginTop: 2 }}>Cont client 🐾</div>
                </div>
                <div style={{ padding: "6px 0" }}>
                  {items.map(item => (
                    <button key={item.t} onClick={() => { onNav(item.t); setOpen(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: tab === item.t ? c.orangeAccent : "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}
                      onMouseEnter={e => { if (tab !== item.t) e.currentTarget.style.background = c.surface2; }}
                      onMouseLeave={e => { e.currentTarget.style.background = tab === item.t ? c.orangeAccent : "transparent"; }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: tab === item.t ? "#FF6B00" : c.surface3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: tab === item.t ? "#FF6B00" : c.text }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: c.xmuted, marginTop: 1 }}>{item.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ borderTop: `1px solid ${c.border}`, padding: "12px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Aspect</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => toggleTheme("light")}
                      style={{ flex: 1, padding: "9px 8px", borderRadius: 10, border: theme === "light" ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: theme === "light" ? c.orangeAccent : c.surface2, color: theme === "light" ? "#FF6B00" : c.muted, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      ☀️ Luminos
                    </button>
                    <button onClick={() => toggleTheme("dark")}
                      style={{ flex: 1, padding: "9px 8px", borderRadius: 10, border: theme === "dark" ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: theme === "dark" ? c.orangeAccent : c.surface2, color: theme === "dark" ? "#FF6B00" : c.muted, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      🌙 Întunecat
                    </button>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${c.border}`, padding: "6px 0" }}>
                  <button onClick={() => { setOpen(false); onLogout(); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚪</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>Ieșire din cont</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer variant="client" />
    </div>
  );
}

function PageHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  const { c } = useContext(ThemeCtx);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div><div style={{ fontSize: 20, fontWeight: 900, color: c.text }}>{title}</div><div style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>{sub}</div></div>
    </div>
  );
}

function FAQ({ items }: { items: { q: string; r: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const { c } = useContext(ThemeCtx);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: c.surface, borderRadius: 14, border: open === i ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{item.q}</span>
            <span style={{ fontSize: 12, color: c.xmuted, flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
          </button>
          {open === i && <div style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, padding: "0 18px 14px" }}>{item.r}</div>}
        </div>
      ))}
    </div>
  );
}

function CardSalon({ salon, onSelect }: { salon: typeof SALOANE[0]; onSelect: () => void }) {
  const { c } = useContext(ThemeCtx);
  return (
    <div style={{ background: c.surface, borderRadius: 20, border: `1.5px solid ${c.border}`, overflow: "hidden", boxShadow: c.cardShadow, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: salon.culoare }} />
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: salon.culoare, background: salon.bg, padding: "4px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>{salon.badgeIcon} {salon.badge}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: c.text }}>⭐ {salon.rating}<span style={{ fontSize: 11, color: c.xmuted, fontWeight: 600 }}>({salon.recenzii})</span></div>
        </div>
        <div><div style={{ fontSize: 17, fontWeight: 900, color: c.text, marginBottom: 4 }}>{salon.nume}</div><div style={{ fontSize: 12, color: c.xmuted, fontWeight: 600 }}>📍 {salon.oras} · {salon.distanta}</div></div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{salon.servicii.map(s => <Tag key={s} label={s} color={salon.culoare} bg={salon.bg} />)}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${c.border2}` }}>
          <div><div style={{ fontSize: 11, color: c.xmuted, fontWeight: 600 }}>de la</div><div style={{ fontSize: 18, fontWeight: 900, color: c.text }}>{salon.pretDe} RON</div></div>
          <button onClick={onSelect} style={{ padding: "10px 20px", borderRadius: 50, border: "none", background: salon.culoare, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: `0 4px 14px ${salon.culoare}55` }}>Programează →</button>
        </div>
      </div>
    </div>
  );
}

function CardProgramare({ p, onAnuleaza }: { p: Programare; onAnuleaza?: (id: number) => void }) {
  const { theme, c } = useContext(ThemeCtx);
  const st = statusStyle(theme)[p.status];
  return (
    <div style={{ background: c.surface, borderRadius: 16, padding: "16px 20px", border: `1.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", boxShadow: c.cardShadow }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✂️</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{p.salon}</div>
        <div style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>{p.serviciu}</div>
        <div style={{ fontSize: 12, color: c.xmuted, marginTop: 3 }}>📅 {p.data} · 🕐 {p.ora}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: st.color, background: st.bg, padding: "4px 12px", borderRadius: 50 }}>{st.label}</span>
        <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>{p.pret}</div>
        {onAnuleaza && (p.status === "confirmat" || p.status === "în așteptare") && (
          <button onClick={() => onAnuleaza(p.id)} style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,.1)", border: "none", padding: "4px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Anulează</button>
        )}
      </div>
    </div>
  );
}

function Tag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: "4px 10px", borderRadius: 50 }}>{label}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { c } = useContext(ThemeCtx);
  return <h3 style={{ fontSize: 15, fontWeight: 800, color: c.text2, marginBottom: 12, marginTop: 0 }}>{children}</h3>;
}
