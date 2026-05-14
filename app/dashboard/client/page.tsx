"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SALOANE = [
  { id: 1, nume: "Paws & Style", oras: "București, Sector 2", rating: 4.9, recenzii: 127, servicii: ["Tuns", "Băiță", "Unghii"], pretDe: 80, distanta: "1.2 km", badge: "Top rated", badgeIcon: "⭐", culoare: "#FF6B00", bg: "#FFF3EA" },
  { id: 2, nume: "Fluffy Salon", oras: "București, Sector 1", rating: 4.8, recenzii: 89, servicii: ["Tuns", "Styling", "Spa"], pretDe: 90, distanta: "2.1 km", badge: "Nou", badgeIcon: "🆕", culoare: "#8B5CF6", bg: "#F5F3FF" },
  { id: 3, nume: "Happy Pets Grooming", oras: "București, Sector 3", rating: 4.7, recenzii: 214, servicii: ["Tuns", "Băiță", "Anti-purici"], pretDe: 65, distanta: "3.4 km", badge: "Popular", badgeIcon: "🔥", culoare: "#10B981", bg: "#ECFDF5" },
  { id: 4, nume: "Royal Dog Salon", oras: "București, Sector 4", rating: 4.9, recenzii: 56, servicii: ["Premium grooming", "Spa", "Masaj"], pretDe: 120, distanta: "4.0 km", badge: "Premium", badgeIcon: "👑", culoare: "#F59E0B", bg: "#FFFBEB" },
];

type Programare = {
  id: number;
  salon: string;
  serviciu: string;
  data: string;
  ora: string;
  status: "confirmat" | "în așteptare" | "finalizat" | "anulat";
  pret: string;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  "confirmat":     { bg: "#ECFDF5", color: "#10B981", label: "✓ Confirmat" },
  "în așteptare":  { bg: "#FFF3EA", color: "#FF6B00", label: "⏳ În așteptare" },
  "finalizat":     { bg: "#F0F9FF", color: "#0EA5E9", label: "✅ Finalizat" },
  "anulat":        { bg: "#FEF2F2", color: "#EF4444", label: "✕ Anulat" },
};

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [animal, setAnimal] = useState<any>(null);
  const [tab, setTab] = useState<"saloane" | "programari">("saloane");
  const [salonSelectat, setSalonSelectat] = useState<number | null>(null);
  const [rezervare, setRezervare] = useState<{ salonId: number; serviciu: string; ora: string } | null>(null);
  const [confirmat, setConfirmat] = useState(false);
  const [programari, setProgramari] = useState<Programare[]>([
    { id: 1, salon: "Paws & Style", serviciu: "Tuns + Băiță + Unghii", data: "16 Mai 2026", ora: "10:00", status: "confirmat", pret: "120 RON" },
    { id: 2, salon: "Fluffy Salon", serviciu: "Styling complet", data: "20 Mai 2026", ora: "14:00", status: "în așteptare", pret: "150 RON" },
    { id: 3, salon: "Happy Pets Grooming", serviciu: "Băiță + uscare", data: "2 Mai 2026", ora: "11:00", status: "finalizat", pret: "50 RON" },
    { id: 4, salon: "Paws & Style", serviciu: "Tuns complet", data: "10 Apr 2026", ora: "09:30", status: "finalizat", pret: "80 RON" },
  ]);

  useEffect(() => {
    const u = localStorage.getItem("calyhub_user");
    const a = localStorage.getItem("calyhub_animal");
    if (u) setUser(JSON.parse(u));
    if (a) setAnimal(JSON.parse(a));
  }, []);

  const prenume = user?.numeComplet?.split(" ")[0] || "Utilizator";
  const salon = SALOANE.find(s => s.id === salonSelectat);

  // --- CONFIRMARE PROGRAMARE ---
  if (confirmat && rezervare && salon) {
    const noua: Programare = {
      id: Date.now(),
      salon: salon.nume,
      serviciu: rezervare.serviciu,
      data: new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }),
      ora: rezervare.ora,
      status: "în așteptare",
      pret: "—",
    };
    return (
      <PageShell prenume={prenume} onLogout={() => router.push("/login")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px 20px" }}>
          <div style={{ textAlign: "center", maxWidth: 460, width: "100%" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF3EA", border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✅</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", marginBottom: 10 }}>Programare trimisă!</h1>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24, lineHeight: 1.7 }}>Salonul va confirma în curând. Vei primi un SMS de confirmare.</p>
            <div style={{ background: "#fff", border: "2px solid #FF6B00", borderRadius: 20, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
              {[["🏪 Salon", salon.nume], ["✂️ Serviciu", rezervare.serviciu], ["🕐 Ora", rezervare.ora], ["🐾 Animal", animal?.numeAnimal || "Animăluțul tău"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ color: "#6B7280" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: "#1A1A1A" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setProgramari(p => [...p, noua]); setConfirmat(false); setSalonSelectat(null); setRezervare(null); setTab("programari"); }}
                style={btnSecondary}>Vezi programările mele</button>
              <button onClick={() => { setProgramari(p => [...p, noua]); setConfirmat(false); setSalonSelectat(null); setRezervare(null); }}
                style={btnPrimary}>← Înapoi la saloane</button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // --- PROFIL SALON + REZERVARE ---
  if (salonSelectat && salon) {
    return (
      <PageShell prenume={prenume} onLogout={() => router.push("/login")}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px" }}>
          <button onClick={() => { setSalonSelectat(null); setRezervare(null); }} style={btnBack}>← Înapoi</button>

          {/* Header salon */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px 24px 20px", border: `2px solid ${salon.culoare}`, marginBottom: 20, boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: salon.culoare, background: salon.bg, padding: "4px 10px", borderRadius: 50, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  {salon.badgeIcon} {salon.badge}
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1A1A1A", margin: "0 0 6px" }}>{salon.nume}</h2>
                <div style={{ fontSize: 13, color: "#6B7280" }}>📍 {salon.oras} · {salon.distanta}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A" }}>⭐ {salon.rating}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{salon.recenzii} recenzii</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              {salon.servicii.map(s => <Tag key={s} label={s} color={salon.culoare} bg={salon.bg} />)}
            </div>
          </div>

          {/* Alege serviciu */}
          <SectionTitle>Alege serviciul</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              { nume: "Tuns complet", pret: "80 RON", durata: "60 min" },
              { nume: "Băiță + uscare", pret: "50 RON", durata: "40 min" },
              { nume: "Tuns + Băiță + Unghii", pret: "120 RON", durata: "90 min" },
              { nume: "Styling complet", pret: "150 RON", durata: "120 min" },
            ].map(s => {
              const sel = rezervare?.serviciu === s.nume;
              return (
                <button key={s.nume} onClick={() => setRezervare(r => ({ ...r!, salonId: salon.id, serviciu: s.nume, ora: r?.ora || "" }))}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 14, border: sel ? `2px solid ${salon.culoare}` : "1.5px solid #EBEBEB", background: sel ? salon.bg : "#fff", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", transition: "all .15s" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{s.nume}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>⏱ {s.durata}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: salon.culoare, flexShrink: 0, marginLeft: 12 }}>{s.pret}</div>
                </button>
              );
            })}
          </div>

          {/* Alege ora */}
          {rezervare?.serviciu && (
            <>
              <SectionTitle>Alege ora</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
                {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(ora => {
                  const sel = rezervare?.ora === ora;
                  return (
                    <button key={ora} onClick={() => setRezervare(r => ({ ...r!, ora }))}
                      style={{ padding: "11px 6px", borderRadius: 10, border: sel ? `2px solid ${salon.culoare}` : "1.5px solid #EBEBEB", background: sel ? salon.bg : "#fff", fontSize: 13, fontWeight: 700, color: sel ? salon.culoare : "#374151", cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
                      {ora}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {rezervare?.serviciu && rezervare?.ora && (
            <button onClick={() => setConfirmat(true)} style={{ ...btnPrimary, width: "100%" }}>
              Confirmă programarea →
            </button>
          )}
        </div>
      </PageShell>
    );
  }

  // --- DASHBOARD PRINCIPAL ---
  const viitoare = programari.filter(p => p.status === "confirmat" || p.status === "în așteptare");
  const trecute = programari.filter(p => p.status === "finalizat" || p.status === "anulat");

  return (
    <PageShell prenume={prenume} onLogout={() => router.push("/login")} onNav={(t) => { if (t === "programari") setTab("programari"); }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

        {/* Bun venit */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 10 }}>
            Bună, {prenume}! 🐾
          </h1>
          {animal && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", border: "2px solid #FF6B00", borderRadius: 50, padding: "8px 18px", fontSize: 13 }}>
              <span style={{ fontSize: 18 }}>🐕</span>
              <span style={{ fontWeight: 800, color: "#1A1A1A" }}>{animal.numeAnimal}</span>
              <span style={{ color: "#EBEBEB" }}>|</span>
              <span style={{ color: "#6B7280", fontWeight: 600 }}>{animal.rasa}, {animal.greutate} kg</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: 4, marginBottom: 28, width: "fit-content" }}>
          {([["saloane", "🏪 Saloane"], ["programari", `📅 Programările mele${viitoare.length > 0 ? ` (${viitoare.length})` : ""}`]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: tab === t ? "#FF6B00" : "transparent", color: tab === t ? "#fff" : "#6B7280", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .2s", whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>

        {/* TAB SALOANE */}
        {tab === "saloane" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>📍 Recomandate în zona ta</h2>
              <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, background: "#F3F4F6", padding: "4px 12px", borderRadius: 50 }}>București</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 36 }}>
              {SALOANE.slice(0, 2).map(s => <CardSalon key={s.id} salon={s} onSelect={() => setSalonSelectat(s.id)} />)}
            </div>

            <h2 style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A", marginBottom: 16 }}>✂️ Toți partenerii CalyHub</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {SALOANE.map(s => <CardSalon key={s.id} salon={s} onSelect={() => setSalonSelectat(s.id)} />)}
            </div>
          </>
        )}

        {/* TAB PROGRAMARI */}
        {tab === "programari" && (
          <div>
            {viitoare.length > 0 && (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A", marginBottom: 14 }}>🗓 Programări viitoare</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {viitoare.map(p => <CardProgramare key={p.id} p={p} onAnuleaza={(id) => setProgramari(pr => pr.map(x => x.id === id ? { ...x, status: "anulat" } : x))} />)}
                </div>
              </>
            )}

            {trecute.length > 0 && (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A", marginBottom: 14 }}>📋 Istoric programări</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {trecute.map(p => <CardProgramare key={p.id} p={p} />)}
                </div>
              </>
            )}

            {programari.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nicio programare încă</div>
                <div style={{ fontSize: 14, marginBottom: 24 }}>Programează-ți animăluțul la primul salon!</div>
                <button onClick={() => setTab("saloane")} style={btnPrimary}>🐾 Caută salon acum</button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

// --- Componente reutilizabile ---

function PageShell({ children, prenume, onLogout, onNav }: { children: React.ReactNode; prenume: string; onLogout: () => void; onNav?: (t: string) => void }) {
  const [open, setOpen] = useState(false);

  const items = [
    { icon: "👤", label: "Profilul meu", sub: "Nume, email, telefon", action: () => {} },
    { icon: "🐾", label: "Animăluțul meu", sub: "Editează profil", action: () => {} },
    { icon: "📅", label: "Programările mele", sub: "Vezi toate programările", action: () => { onNav?.("programari"); } },
    { icon: "🔔", label: "Notificări", sub: "Setări SMS / email", action: () => {} },
    { icon: "🔒", label: "Setări cont", sub: "Schimbă parola", action: () => {} },
    { icon: "❓", label: "Ajutor", sub: "FAQ · Contact support", action: () => {} },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F8F8", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 64 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={110} height={38} style={{ height: 38, width: "auto", objectFit: "contain" }} priority /></Link>

          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 50, border: open ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", background: open ? "#FFF3EA" : "#fff", cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#FFF3EA", border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>👤</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{prenume}</span>
              <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 2, transition: "transform .2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </button>

            {open && (
              <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 260, background: "#fff", borderRadius: 18, border: "1.5px solid #EBEBEB", boxShadow: "0 8px 32px rgba(0,0,0,.12)", overflow: "hidden", zIndex: 200 }}>
                {/* Header dropdown */}
                <div style={{ padding: "14px 18px", background: "#FFF3EA", borderBottom: "1px solid #FFDCC6" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#1A1A1A" }}>{prenume}</div>
                  <div style={{ fontSize: 12, color: "#FF6B00", fontWeight: 600, marginTop: 2 }}>Cont client 🐾</div>
                </div>

                {/* Items */}
                <div style={{ padding: "6px 0" }}>
                  {items.map(item => (
                    <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", transition: "background .1s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{item.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Ieșire */}
                <div style={{ borderTop: "1px solid #EBEBEB", padding: "6px 0" }}>
                  <button onClick={() => { setOpen(false); onLogout(); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FEF2F2")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🚪</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>Ieșire din cont</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

function CardSalon({ salon, onSelect }: { salon: typeof SALOANE[0]; onSelect: () => void }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #EBEBEB", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,.05)", display: "flex", flexDirection: "column", transition: "box-shadow .2s" }}>
      {/* Color bar */}
      <div style={{ height: 4, background: salon.culoare }} />
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Badge + rating */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: salon.culoare, background: salon.bg, padding: "4px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>
            {salon.badgeIcon} {salon.badge}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>
            ⭐ {salon.rating}
            <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>({salon.recenzii})</span>
          </div>
        </div>

        {/* Nume + locatie */}
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A", marginBottom: 4 }}>{salon.nume}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>📍 {salon.oras} · {salon.distanta}</div>
        </div>

        {/* Servicii */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {salon.servicii.map(s => <Tag key={s} label={s} color={salon.culoare} bg={salon.bg} />)}
        </div>

        {/* Pret + buton */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 12, borderTop: "1px solid #F3F4F6" }}>
          <div>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>de la</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A" }}>{salon.pretDe} RON</div>
          </div>
          <button onClick={onSelect}
            style={{ padding: "10px 20px", borderRadius: 50, border: "none", background: salon.culoare, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: `0 4px 14px ${salon.culoare}55`, whiteSpace: "nowrap" }}>
            Programează →
          </button>
        </div>
      </div>
    </div>
  );
}

function CardProgramare({ p, onAnuleaza }: { p: Programare; onAnuleaza?: (id: number) => void }) {
  const st = STATUS_STYLE[p.status];
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1.5px solid #EBEBEB", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", boxShadow: "0 1px 8px rgba(0,0,0,.04)" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✂️</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A1A" }}>{p.salon}</div>
        <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{p.serviciu}</div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>📅 {p.data} · 🕐 {p.ora}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: st.color, background: st.bg, padding: "4px 12px", borderRadius: 50 }}>{st.label}</span>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#1A1A1A" }}>{p.pret}</div>
        {onAnuleaza && (p.status === "confirmat" || p.status === "în așteptare") && (
          <button onClick={() => onAnuleaza(p.id)}
            style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "#FEF2F2", border: "none", padding: "4px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
            Anulează
          </button>
        )}
      </div>
    </div>
  );
}

function Tag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: "4px 10px", borderRadius: 50 }}>{label}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 15, fontWeight: 800, color: "#374151", marginBottom: 12, marginTop: 0 }}>{children}</h3>;
}

const btnPrimary: React.CSSProperties = {
  padding: "12px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff",
  fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif",
  boxShadow: "0 4px 16px rgba(255,107,0,.35)",
};

const btnSecondary: React.CSSProperties = {
  padding: "12px 24px", borderRadius: 50, border: "1.5px solid #EBEBEB", background: "#fff", color: "#374151",
  fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif",
};

const btnBack: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, marginBottom: 20, background: "none",
  border: "none", fontSize: 14, fontWeight: 700, color: "#6B7280", cursor: "pointer",
  fontFamily: "Nunito, sans-serif", padding: 0,
};
