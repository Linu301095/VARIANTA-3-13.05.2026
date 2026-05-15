"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import ThemeToggle from "../../../components/ThemeToggle";

const PROGRAMARI_INIT = [
  { id: 1, client: "Ana Popescu", animal: "Max (Labrador, 28kg)", serviciu: "Tuns complet", ora: "09:00", status: "confirmat" },
  { id: 2, client: "Ion Gheorghe", animal: "Bella (Pudel, 6kg)", serviciu: "Tuns + Băiță", ora: "10:30", status: "nou" },
  { id: 3, client: "Maria Ionescu", animal: "Charlie (Husky, 22kg)", serviciu: "Băiță + uscare", ora: "12:00", status: "confirmat" },
  { id: 4, client: "Andrei Dumitrescu", animal: "Luna (Bichon, 4kg)", serviciu: "Styling complet", ora: "14:00", status: "nou" },
  { id: 5, client: "Elena Popa", animal: "Rocky (Ciobanesc, 35kg)", serviciu: "Tuns complet", ora: "15:30", status: "confirmat" },
];

const NOTIFICARI_INIT = [
  { id: 1, tip: "nou", mesaj: "Ion Gheorghe a solicitat o programare pentru Bella", timp: "acum 5 min", citit: false },
  { id: 2, tip: "nou", mesaj: "Andrei Dumitrescu a solicitat o programare pentru Luna", timp: "acum 18 min", citit: false },
  { id: 3, tip: "info", mesaj: "Ana Popescu a lasat o recenzie 5/5 - Serviciu excelent!", timp: "1h ago", citit: true },
  { id: 4, tip: "info", mesaj: "Reminder: 5 programari confirmate pentru maine", timp: "ieri", citit: true },
];

type Tab = "agenda" | "statistici" | "notificari" | "profil-salon" | "servicii" | "echipa" | "abonament" | "setari" | "ajutor";
type Serviciu = { id: number; nume: string; pret: string; durata: string };
type Groomer = { id: number; nume: string; specialitate: string };

const AZI = new Date();
const ZILE = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sam", "Dum"];
const LUNA = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #EBEBEB", fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", background: "#fff" };

export default function DashboardSalon() {
  const router = useRouter();
  const [salonData, setSalonData] = useState<any>(null);
  const [abonament, setAbonament] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("agenda");
  const [programari, setProgramari] = useState(PROGRAMARI_INIT);
  const [notificari, setNotificari] = useState(NOTIFICARI_INIT);
  const [savedMsg, setSavedMsg] = useState("");

  const [profilSalon, setProfilSalon] = useState({ numeSalon: "", adresa: "", oras: "", telefon: "", descriere: "" });
  const [servicii, setServicii] = useState<Serviciu[]>([
    { id: 1, nume: "Tuns complet", pret: "80", durata: "60" },
    { id: 2, nume: "Baita + uscare", pret: "50", durata: "40" },
    { id: 3, nume: "Tuns + Baita + Unghii", pret: "120", durata: "90" },
  ]);
  const [echipa, setEchipa] = useState<Groomer[]>([
    { id: 1, nume: "Maria Ionescu", specialitate: "Rase mici" },
    { id: 2, nume: "Andrei Pop", specialitate: "Rase mari" },
  ]);

  useEffect(() => {
    const u = localStorage.getItem("calyhub_user");
    const s = localStorage.getItem("calyhub_salon");
    const a = localStorage.getItem("calyhub_abonament");
    if (u) { const p = JSON.parse(u); setUser(p); }
    if (s) { const sd = JSON.parse(s); setSalonData(sd); setProfilSalon({ numeSalon: sd.dateFirma?.numeSalon || "", adresa: sd.dateFirma?.adresa || "", oras: sd.dateFirma?.oras || "", telefon: sd.dateFirma?.telefon || "", descriere: sd.dateFirma?.descriere || "" }); }
    if (a) setAbonament(JSON.parse(a));
  }, []);

  const numeSalon = salonData?.dateFirma?.numeSalon || user?.numeSalon || "Salonul tau";
  const numeComplet = user?.numeComplet?.split(" ")[0] || "Manager";

  const TAB_LABELS: Record<Tab, string> = {
    agenda: "Agenda", statistici: "Statistici", notificari: "Notificări",
    "profil-salon": "Profilul salonului", servicii: "Serviciile mele",
    echipa: "Echipa mea", abonament: "Abonamentul meu", setari: "Setări cont", ajutor: "Ajutor",
  };
  const necitite = notificari.filter(n => !n.citit).length;

  function accepta(id: number) {
    setProgramari(p => p.map(pr => pr.id === id ? { ...pr, status: "confirmat" } : pr));
    setNotificari(n => n.map(not => not.id === id ? { ...not, citit: true } : not));
  }

  function salveaza(msg: string) { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {savedMsg && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1A1A1A", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>✓ {savedMsg}</div>}

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/"><Image src="/logo.png" alt="CalyHub" width={110} height={38} style={{ height: 38, width: "auto", objectFit: "contain" }} priority /></Link>
            <div style={{ width: 1, height: 24, background: "#EBEBEB" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#1A1A1A" }}>{numeSalon}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>Panou de control</div>
            </div>
            {tab !== "agenda" && (
              <>
                <div style={{ width: 1, height: 22, background: "#EBEBEB" }} />
                <button onClick={() => setTab("agenda")}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 50, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 13, fontWeight: 700, color: "#6B7280", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  ← Înapoi
                </button>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>{TAB_LABELS[tab]}</div>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle size={34} />
            <button onClick={() => setTab("notificari")} style={{ position: "relative", padding: "8px 14px", borderRadius: 50, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              🔔
              {necitite > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{necitite}</span>}
            </button>
            <UserMenu numeComplet={numeComplet} numeSalon={numeSalon} tab={tab} onLogout={() => router.push("/login")} onNav={setTab} />
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "28px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Stats cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
            {[
              { icon: "💰", label: "Incasari azi", valoare: "840 RON", sub: "+12% fata de ieri", color: "#10B981" },
              { icon: "📅", label: "Programari azi", valoare: `${programari.length}`, sub: `${programari.filter(p => p.status === "nou").length} noi · ${programari.filter(p => p.status === "confirmat").length} confirmate`, color: "#FF6B00" },
              { icon: "👥", label: "Clienti luna asta", valoare: "43", sub: "+8 fata de luna trecuta", color: "#8B5CF6" },
              { icon: "⭐", label: "Rating mediu", valoare: "4.9", sub: "127 recenzii total", color: "#F59E0B" },
            ].map(card => (
              <div key={card.label} style={{ background: "#fff", borderRadius: 18, padding: "18px 20px", border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.07)" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#1A1A1A", lineHeight: 1 }}>{card.valoare}</div>
                <div style={{ fontSize: 12, color: card.color, fontWeight: 700, marginTop: 6 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: 4, marginBottom: 24, width: "fit-content", flexWrap: "wrap" }}>
            {([["agenda", "📅 Agenda"], ["statistici", "📊 Statistici"], ["notificari", `🔔 Notificari${necitite > 0 ? ` (${necitite})` : ""}`]] as const).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: tab === t ? "#FF6B00" : "transparent", color: tab === t ? "#fff" : "#6B7280", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .2s" }}>
                {label}
              </button>
            ))}
          </div>

          {/* AGENDA */}
          {tab === "agenda" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A" }}>{ZILE[(AZI.getDay() + 6) % 7]}, {AZI.getDate()} {LUNA[AZI.getMonth()]} {AZI.getFullYear()}</h2>
                <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>{programari.length} programari</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {programari.map(p => (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: p.status === "nou" ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: p.status === "nou" ? "#FFF3EA" : "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: p.status === "nou" ? "#FF6B00" : "#6B7280", flexShrink: 0, textAlign: "center" }}>{p.ora}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A1A" }}>{p.client}</div>
                      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>🐾 {p.animal}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", marginTop: 2 }}>✂️ {p.serviciu}</div>
                    </div>
                    {p.status === "nou" ? (
                      <button onClick={() => accepta(p.id)} style={{ padding: "9px 18px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 12px rgba(255,107,0,.3)", flexShrink: 0 }}>Accepta</button>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981", background: "#ECFDF5", padding: "6px 14px", borderRadius: 50, flexShrink: 0 }}>✓ Confirmat</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATISTICI */}
          {tab === "statistici" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A", marginBottom: 20 }}>Statistici lunare</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                <div style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", border: "2px solid #FF6B00" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Incasari lunare (RON)</div>
                  {[["Ian", 3200], ["Feb", 2800], ["Mar", 4100], ["Apr", 3900], ["Mai", 4800]].map(([luna, val]) => (
                    <div key={luna as string} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: "#6B7280" }}>{luna}</div>
                      <div style={{ flex: 1, height: 8, background: "#F3F4F6", borderRadius: 4 }}><div style={{ height: "100%", width: `${(val as number) / 50}%`, background: "#FF6B00", borderRadius: 4 }} /></div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A", width: 50, textAlign: "right" }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", border: "2px solid #FF6B00" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Servicii populare</div>
                  {[["Tuns complet", 42, "#FF6B00"], ["Tuns + Baita", 31, "#8B5CF6"], ["Baita + uscare", 18, "#10B981"], ["Styling", 9, "#F59E0B"]].map(([s, pct, col]) => (
                    <div key={s as string} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{s}</span><span style={{ fontSize: 13, fontWeight: 800, color: col as string }}>{pct}%</span></div>
                      <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3 }}><div style={{ height: "100%", width: `${pct}%`, background: col as string, borderRadius: 3 }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICARI */}
          {tab === "notificari" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A" }}>Notificari</h2>
                {necitite > 0 && <button onClick={() => setNotificari(n => n.map(x => ({ ...x, citit: true })))} style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Marcheaza toate citite</button>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {notificari.map(n => (
                  <div key={n.id} onClick={() => setNotificari(nots => nots.map(x => x.id === n.id ? { ...x, citit: true } : x))}
                    style={{ background: n.citit ? "#fff" : "#FFF3EA", borderRadius: 14, padding: "14px 18px", border: n.citit ? "1.5px solid #EBEBEB" : "2px solid #FF6B00", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 20, flexShrink: 0 }}>{n.tip === "nou" ? "🔔" : "ℹ️"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: n.citit ? 600 : 800, color: "#1A1A1A", lineHeight: 1.5 }}>{n.mesaj}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{n.timp}</div>
                    </div>
                    {!n.citit && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 4 }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFIL SALON */}
          {tab === "profil-salon" && (
            <div style={{ maxWidth: 540 }}>
              <PageHeader icon="🏪" title="Profilul salonului" sub="Actualizeaza datele publice ale salonului" />
              <div style={{ background: "#fff", borderRadius: 20, padding: "28px", border: "1.5px solid #EBEBEB" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[{ key: "numeSalon", label: "Numele salonului", placeholder: "Paws & Style" }, { key: "adresa", label: "Adresa", placeholder: "Str. Florilor nr. 12" }, { key: "oras", label: "Orasul", placeholder: "Bucuresti" }, { key: "telefon", label: "Telefon public", placeholder: "07XX XXX XXX" }].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{f.label}</label>
                      <input value={(profilSalon as any)[f.key]} onChange={e => setProfilSalon(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Descriere scurta</label>
                    <textarea value={profilSalon.descriere} onChange={e => setProfilSalon(p => ({ ...p, descriere: e.target.value }))} rows={3} placeholder="Salon specializat in..." style={{ ...inp, resize: "vertical" }} />
                  </div>
                  <button onClick={() => { localStorage.setItem("calyhub_salon", JSON.stringify({ ...salonData, dateFirma: { ...salonData?.dateFirma, ...profilSalon } })); salveaza("Profil salon actualizat!"); }} style={btnPrimary}>Salveaza modificarile</button>
                </div>
              </div>
            </div>
          )}

          {/* SERVICII */}
          {tab === "servicii" && (
            <div style={{ maxWidth: 580 }}>
              <PageHeader icon="✂️" title="Serviciile mele" sub="Gestioneaza serviciile oferite de salon" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {servicii.map((s, i) => (
                  <div key={s.id} style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1.5px solid #EBEBEB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00" }}>Serviciul {i + 1}</div>
                      <button onClick={() => setServicii(sv => sv.filter(x => x.id !== s.id))} style={{ fontSize: 12, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>✕ Sterge</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <input value={s.nume} onChange={e => setServicii(sv => sv.map(x => x.id === s.id ? { ...x, nume: e.target.value } : x))} placeholder="Denumire serviciu" style={inp} />
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
                        <input value={s.pret} onChange={e => setServicii(sv => sv.map(x => x.id === s.id ? { ...x, pret: e.target.value } : x))} type="number" placeholder="Pret (RON)" style={inp} />
                        <input value={s.durata} onChange={e => setServicii(sv => sv.map(x => x.id === s.id ? { ...x, durata: e.target.value } : x))} type="number" placeholder="Durata (min)" style={inp} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setServicii(sv => [...sv, { id: Date.now(), nume: "", pret: "", durata: "" }])} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px dashed #FF6B00", background: "#FFF3EA", color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", marginBottom: 16 }}>+ Adauga serviciu</button>
              <button onClick={() => salveaza("Servicii actualizate!")} style={btnPrimary}>Salveaza serviciile</button>
            </div>
          )}

          {/* ECHIPA */}
          {tab === "echipa" && (
            <div style={{ maxWidth: 560 }}>
              <PageHeader icon="👥" title="Echipa mea" sub="Gestioneaza groomerii din salon" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {echipa.map(g => (
                  <div key={g.id} style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1.5px solid #EBEBEB", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👤</div>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 10, minWidth: 0 }}>
                      <input value={g.nume} onChange={e => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, nume: e.target.value } : x))} placeholder="Nume groomer" style={inp} />
                      <input value={g.specialitate} onChange={e => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, specialitate: e.target.value } : x))} placeholder="Specialitate" style={inp} />
                    </div>
                    <button onClick={() => setEchipa(ec => ec.filter(x => x.id !== g.id))} style={{ fontSize: 13, color: "#EF4444", background: "#FEF2F2", border: "none", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setEchipa(ec => [...ec, { id: Date.now(), nume: "", specialitate: "" }])} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px dashed #FF6B00", background: "#FFF3EA", color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", marginBottom: 16 }}>+ Adauga groomer</button>
              <button onClick={() => salveaza("Echipa actualizata!")} style={btnPrimary}>Salveaza echipa</button>
            </div>
          )}

          {/* ABONAMENT */}
          {tab === "abonament" && (
            <div style={{ maxWidth: 720 }}>
              <PageHeader icon="💳" title="Abonamentul meu" sub="Detalii despre planul tau si facturare" />
              {abonament ? (
                <>
                  <div style={{ background: "linear-gradient(135deg, #FF6B00 0%, #FF8C42 100%)", borderRadius: 20, padding: "26px 28px", color: "#fff", marginBottom: 18, boxShadow: "0 8px 28px rgba(255,107,0,.25)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, opacity: .85, marginBottom: 6 }}>Plan curent</div>
                        <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{abonament.planNume}</div>
                        <div style={{ fontSize: 14, opacity: .9, marginTop: 8 }}>
                          {abonament.pret === 0 ? "Trial gratuit" : `${abonament.pret} RON / luna`}
                        </div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,.18)", padding: "8px 14px", borderRadius: 50, fontSize: 12, fontWeight: 800 }}>
                        ✓ Activ
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.2)", marginTop: 18, paddingTop: 14, fontSize: 13, opacity: .9 }}>
                      Urmatoarea facturare: <strong>{new Date(abonament.dataExpirare).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</strong>
                    </div>
                  </div>

                  <div style={{ background: "#fff", borderRadius: 18, padding: "22px 26px", border: "1.5px solid #EBEBEB", marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A1A", marginBottom: 14 }}>Detalii facturare</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        ["Plan", abonament.planNume],
                        ["Pret lunar", abonament.pret === 0 ? "Gratuit" : `${abonament.pret} RON`],
                        ["Activat la", new Date(abonament.dataStart).toLocaleDateString("ro-RO")],
                        ["Reinnoire automata", abonament.autoRenew ? "Da" : "Nu"],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                          <span style={{ color: "#6B7280" }}>{k}</span>
                          <span style={{ fontWeight: 700, color: "#1A1A1A" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                    <button onClick={() => router.push("/register/abonament-salon")} style={btnPrimary}>Schimba planul</button>
                    <button onClick={() => salveaza("Cererea de anulare a fost trimisa")} style={{ padding: "12px 24px", borderRadius: 50, border: "1.5px solid #EBEBEB", background: "#fff", color: "#6B7280", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Anuleaza abonament</button>
                  </div>

                  <div style={{ background: "#fff", borderRadius: 18, padding: "22px 26px", border: "1.5px solid #EBEBEB" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A1A", marginBottom: 14 }}>Istoric facturi</div>
                    <div style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "20px 0" }}>Nicio factura emisa inca. Prima va aparea aici dupa primul ciclu de facturare.</div>
                  </div>
                </>
              ) : (
                <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1.5px solid #EBEBEB", textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>Niciun abonament activ</div>
                  <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>Alege un plan pentru a debloca toate functionalitatile salonului.</div>
                  <button onClick={() => router.push("/register/abonament-salon")} style={btnPrimary}>Alege un plan</button>
                </div>
              )}
            </div>
          )}

          {/* SETARI */}
          {tab === "setari" && (
            <div style={{ maxWidth: 520 }}>
              <PageHeader icon="🔒" title="Setari cont" sub="Modifica parola contului tau de salon" />
              <div style={{ background: "#fff", borderRadius: 20, padding: "28px", border: "1.5px solid #EBEBEB", marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {["Parola curenta", "Parola noua", "Confirma parola noua"].map(label => (
                    <div key={label}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{label}</label>
                      <input type="password" placeholder="••••••••" style={inp} />
                    </div>
                  ))}
                  <button onClick={() => salveaza("Parola schimbata!")} style={{ ...btnPrimary, marginTop: 4 }}>Schimba parola</button>
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", border: "1.5px solid #EBEBEB" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A1A", marginBottom: 6 }}>Zona periculoasa</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>Stergerea salonului este permanenta si nu poate fi anulata.</div>
                <button style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", background: "#FEF2F2", border: "none", padding: "9px 18px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Sterge salonul</button>
              </div>
            </div>
          )}

          {/* AJUTOR */}
          {tab === "ajutor" && (
            <div style={{ maxWidth: 620 }}>
              <PageHeader icon="❓" title="Ajutor" sub="Suport dedicat pentru partenerii CalyHub" />
              <FAQ items={[
                { q: "Cum adaug un serviciu nou?", r: "Din meniu click pe Serviciile mele, apoi + Adauga serviciu. Completeaza denumirea, pretul si durata, apoi salveaza." },
                { q: "Cum accept o programare noua?", r: "In tab-ul Agenda vei vedea programarile noi marcate cu portocaliu. Click pe Accepta pentru a le confirma." },
                { q: "Clientul nu s-a prezentat. Ce fac?", r: "Poti marca programarea ca neprezentata din Agenda. Clientul va primi o notificare automata." },
                { q: "Cand primesc banii din programari?", r: "Platile se proceseaza in 2-3 zile lucratoare dupa finalizarea serviciului." },
                { q: "Cum imi schimb programul de lucru?", r: "Functia de gestionare a programului va fi disponibila in urmatoarea versiune." },
              ]} />
              <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 16, padding: "18px 22px", marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FF6B00", marginBottom: 4 }}>Suport dedicat parteneri</div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>Contacteaza-ne la <strong>parteneri@calyhub.ro</strong> sau prin chat prioritar.</div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer variant="salon" />
    </div>
  );
}

function UserMenu({ numeComplet, numeSalon, tab, onLogout, onNav }: { numeComplet: string; numeSalon: string; tab: Tab; onLogout: () => void; onNav: (t: Tab) => void }) {
  const [open, setOpen] = useState(false);

  const items: { icon: string; label: string; sub: string; t: Tab }[] = [
    { icon: "🏪", label: "Profilul salonului", sub: "Editeaza datele firmei", t: "profil-salon" },
    { icon: "✂️", label: "Serviciile mele", sub: "Adauga / modifica servicii", t: "servicii" },
    { icon: "👥", label: "Echipa mea", sub: "Gestioneaza groomerii", t: "echipa" },
    { icon: "📊", label: "Statistici", sub: "Vezi rapoarte detaliate", t: "statistici" },
    { icon: "💳", label: "Abonamentul meu", sub: "Plan, facturare, istoric", t: "abonament" },
    { icon: "🔔", label: "Notificari", sub: "Setari alerte programari", t: "notificari" },
    { icon: "🔒", label: "Setari cont", sub: "Schimba parola", t: "setari" },
    { icon: "❓", label: "Ajutor", sub: "Support dedicat", t: "ajutor" },
  ];

  return (
    <div style={{ position: "relative" }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 50, border: open ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", background: open ? "#FFF3EA" : "#fff", cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
        <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>✂️</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{numeComplet}</span>
        <span style={{ fontSize: 10, color: "#9CA3AF", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>▼</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 270, background: "#fff", borderRadius: 18, border: "1.5px solid #EBEBEB", boxShadow: "0 8px 32px rgba(0,0,0,.12)", overflow: "hidden", zIndex: 200 }}>
          <div style={{ padding: "14px 18px", background: "#FFF3EA", borderBottom: "1px solid #FFDCC6" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#1A1A1A" }}>{numeSalon}</div>
            <div style={{ fontSize: 12, color: "#FF6B00", fontWeight: 600, marginTop: 2 }}>Cont salon ✂️ · {numeComplet}</div>
          </div>
          <div style={{ padding: "6px 0" }}>
            {items.map(item => (
              <button key={item.t} onClick={() => { onNav(item.t); setOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: tab === item.t ? "#FFF3EA" : "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}
                onMouseEnter={e => { if (tab !== item.t) e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={e => { e.currentTarget.style.background = tab === item.t ? "#FFF3EA" : "none"; }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: tab === item.t ? "#FF6B00" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tab === item.t ? "#FF6B00" : "#1A1A1A" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #EBEBEB", padding: "6px 0" }}>
            <button onClick={() => { setOpen(false); onLogout(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FEF2F2")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🚪</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>Iesire din cont</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div><div style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A" }}>{title}</div><div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{sub}</div></div>
    </div>
  );
}

function FAQ({ items }: { items: { q: string; r: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, border: open === i ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{item.q}</span>
            <span style={{ fontSize: 12, color: "#9CA3AF", flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
          </button>
          {open === i && <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, padding: "0 18px 14px" }}>{item.r}</div>}
        </div>
      ))}
    </div>
  );
}

const btnPrimary: React.CSSProperties = { padding: "12px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 16px rgba(255,107,0,.35)" };
