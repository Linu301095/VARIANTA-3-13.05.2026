"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PROGRAMARI = [
  { id: 1, client: "Ana Popescu", animal: "Max (Labrador, 28kg)", serviciu: "Tuns complet", ora: "09:00", status: "confirmat" },
  { id: 2, client: "Ion Gheorghe", animal: "Bella (Pudel, 6kg)", serviciu: "Tuns + Băiță", ora: "10:30", status: "nou" },
  { id: 3, client: "Maria Ionescu", animal: "Charlie (Husky, 22kg)", serviciu: "Băiță + uscare", ora: "12:00", status: "confirmat" },
  { id: 4, client: "Andrei Dumitrescu", animal: "Luna (Bichon, 4kg)", serviciu: "Styling complet", ora: "14:00", status: "nou" },
  { id: 5, client: "Elena Popa", animal: "Rocky (Ciobanesc, 35kg)", serviciu: "Tuns complet", ora: "15:30", status: "confirmat" },
];

const NOTIFICARI = [
  { id: 1, tip: "nou", mesaj: "Ion Gheorghe a solicitat o programare pentru Bella", timp: "acum 5 min", citit: false },
  { id: 2, tip: "nou", mesaj: "Andrei Dumitrescu a solicitat o programare pentru Luna", timp: "acum 18 min", citit: false },
  { id: 3, tip: "info", mesaj: "Ana Popescu a lăsat o recenzie ⭐ 5/5 — Serviciu excelent!", timp: "1h ago", citit: true },
  { id: 4, tip: "info", mesaj: "Reminder: 5 programări confirmate pentru mâine", timp: "ieri", citit: true },
];

const AZI = new Date();
const ZILE = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const LUNA = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardSalon() {
  const router = useRouter();
  const [salon, setSalon] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"agenda" | "statistici" | "notificari">("agenda");
  const [programari, setProgramari] = useState(PROGRAMARI);
  const [notificari, setNotificari] = useState(NOTIFICARI);

  useEffect(() => {
    const u = localStorage.getItem("calyhub_user");
    const s = localStorage.getItem("calyhub_salon");
    if (u) setUser(JSON.parse(u));
    if (s) setSalon(JSON.parse(s));
  }, []);

  const numeSalon = salon?.dateFirma?.numeSalon || user?.numeSalon || "Salonul tău";
  const numeComplet = user?.numeComplet?.split(" ")[0] || "Manager";
  const necitite = notificari.filter(n => !n.citit).length;

  function accepta(id: number) {
    setProgramari(p => p.map(pr => pr.id === id ? { ...pr, status: "confirmat" } : pr));
    setNotificari(n => n.map(not => not.id === id ? { ...not, citit: true } : not));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
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
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setTab("notificari")} style={{ position: "relative", padding: "8px 14px", borderRadius: 50, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              🔔
              {necitite > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{necitite}</span>}
            </button>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>👤 {numeComplet}</div>
            <button onClick={() => router.push("/login")} style={{ padding: "8px 16px", borderRadius: 50, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 13, fontWeight: 700, color: "#6B7280", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Ieșire</button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "28px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Stats cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
            {[
              { icon: "💰", label: "Încasări azi", valoare: "840 RON", sub: "+12% față de ieri", color: "#10B981" },
              { icon: "📅", label: "Programări azi", valoare: `${programari.length}`, sub: `${programari.filter(p => p.status === "nou").length} noi · ${programari.filter(p => p.status === "confirmat").length} confirmate`, color: "#FF6B00" },
              { icon: "👥", label: "Clienți luna asta", valoare: "43", sub: "+8 față de luna trecută", color: "#8B5CF6" },
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
          <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: 4, marginBottom: 20, width: "fit-content" }}>
            {([["agenda", "📅 Agenda"], ["statistici", "📊 Statistici"], ["notificari", `🔔 Notificări${necitite > 0 ? ` (${necitite})` : ""}`]] as const).map(([t, label]) => (
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
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A" }}>
                  {ZILE[(AZI.getDay() + 6) % 7]}, {AZI.getDate()} {LUNA[AZI.getMonth()]} {AZI.getFullYear()}
                </h2>
                <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>{programari.length} programări</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {programari.map(p => (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: p.status === "nou" ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: p.status === "nou" ? "#FFF3EA" : "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: p.status === "nou" ? "#FF6B00" : "#6B7280", flexShrink: 0, textAlign: "center", lineHeight: 1.2 }}>
                      {p.ora}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A1A" }}>{p.client}</div>
                      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>🐾 {p.animal}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", marginTop: 2 }}>✂️ {p.serviciu}</div>
                    </div>
                    {p.status === "nou" ? (
                      <button onClick={() => accepta(p.id)}
                        style={{ padding: "9px 18px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 12px rgba(255,107,0,.3)", flexShrink: 0 }}>
                        Acceptă
                      </button>
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
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Încasări lunare (RON)</div>
                  {[["Ian", 3200], ["Feb", 2800], ["Mar", 4100], ["Apr", 3900], ["Mai", 4800]].map(([luna, val]) => (
                    <div key={luna as string} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: "#6B7280" }}>{luna}</div>
                      <div style={{ flex: 1, height: 8, background: "#F3F4F6", borderRadius: 4 }}>
                        <div style={{ height: "100%", width: `${(val as number) / 50}%`, background: "#FF6B00", borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A", width: 50, textAlign: "right" }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", border: "2px solid #FF6B00" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Servicii populare</div>
                  {[["Tuns complet", 42, "#FF6B00"], ["Tuns + Băiță", 31, "#8B5CF6"], ["Băiță + uscare", 18, "#10B981"], ["Styling", 9, "#F59E0B"]].map(([s, pct, col]) => (
                    <div key={s as string} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{s}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: col as string }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: col as string, borderRadius: 3 }} />
                      </div>
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
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A" }}>Notificări</h2>
                {necitite > 0 && (
                  <button onClick={() => setNotificari(n => n.map(x => ({ ...x, citit: true })))}
                    style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    Marchează toate citite
                  </button>
                )}
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

        </div>
      </main>
    </div>
  );
}
