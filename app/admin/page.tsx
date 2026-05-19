"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import { generateMockData, type MockData, type MockClient, type MockSalon, type MockProgramare } from "../../lib/adminMockData";
import { supabase } from "../../lib/supabase";

type Tab = "overview" | "stapani" | "saloane" | "programari" | "abonamente" | "reviews" | "tichete" | "marketing" | "setari";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "stapani", label: "Stăpâni", icon: "👤" },
  { id: "saloane", label: "Saloane", icon: "✂️" },
  { id: "programari", label: "Programări", icon: "📅" },
  { id: "abonamente", label: "Abonamente", icon: "💳" },
  { id: "reviews", label: "Review-uri", icon: "⭐" },
  { id: "tichete", label: "Tichete suport", icon: "🎫" },
  { id: "marketing", label: "Marketing/SEO", icon: "📈" },
  { id: "setari", label: "Setări sistem", icon: "⚙️" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<MockData | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }

      const { data: profil } = await supabase.from("profiluri").select("rol").eq("id", user.id).single();
      if (profil?.rol !== "admin") {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const merged = await fetchAdminData();
      setData(merged);
      setAuthChecked(true);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }
  async function regenerateData() {
    if (!confirm("Reîncarcă datele din Supabase?")) return;
    const merged = await fetchAdminData();
    setData(merged);
  }

  if (!authChecked || !data) {
    return <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6B00", fontFamily: "Nunito" }}>Se verifică sesiunea...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#fff", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#111", borderBottom: "1px solid #1F1F1F", padding: "12px 20px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/admin"><div style={{ background: "#fff", padding: "6px 12px", borderRadius: 10 }}><Image src="/logo.png" alt="CalyHub" width={110} height={36} style={{ height: 36, width: "auto", objectFit: "contain" }} priority /></div></Link>
            <span style={{ background: "#FF6B00", color: "#fff", padding: "4px 12px", borderRadius: 50, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>🔒 Admin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={regenerateData} style={btnGhost}>🔄 Reîncarcă date</button>
            <button onClick={logout} style={btnLogout}>Deconectare</button>
          </div>
        </div>
      </header>

      <div style={{ background: "#0F0F0F", borderBottom: "1px solid #1F1F1F", overflowX: "auto" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", gap: 4, padding: "8px 12px", minWidth: "max-content" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: tab === t.id ? "#FF6B00" : "transparent", color: tab === t.id ? "#fff" : "#9CA3AF", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ flex: 1, padding: "28px 20px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        {tab === "overview" && <OverviewTab data={data} />}
        {tab === "stapani" && <StapaniTab data={data} setData={setData} />}
        {tab === "saloane" && <SaloaneTab data={data} setData={setData} />}
        {tab === "programari" && <ProgramariTab data={data} />}
        {tab === "abonamente" && <AbonamenteTab data={data} />}
        {tab === "reviews" && <ReviewsTab data={data} setData={setData} />}
        {tab === "tichete" && <TicheteTab data={data} setData={setData} />}
        {tab === "marketing" && <MarketingTab />}
        {tab === "setari" && <SetariTab />}
      </main>

      <Footer variant="admin" />
    </div>
  );
}

async function fetchAdminData(): Promise<MockData> {
  const base = generateMockData();

  const { data: profiluriRaw } = await supabase.from("profiluri").select("id, nume, telefon, tip, created_at");
  const { data: animaleRaw } = await supabase.from("animale").select("user_id");
  const { data: saloaneRaw } = await supabase.from("saloane").select("id, user_id, nume, oras, telefon, created_at");
  const { data: programariRaw } = await supabase.from("programari").select("id, user_id, salon_id, data, ora, status, pret, serviciu");
  const { data: usersRaw } = await supabase.from("profiluri").select("id");

  const emailMap = new Map<string, string>();
  const profMap = new Map<string, any>();
  (profiluriRaw || []).forEach((p: any) => profMap.set(p.id, p));

  const animaleCount = new Map<string, number>();
  (animaleRaw || []).forEach((a: any) => animaleCount.set(a.user_id, (animaleCount.get(a.user_id) || 0) + 1));

  const programariCountByUser = new Map<string, number>();
  (programariRaw || []).forEach((p: any) => programariCountByUser.set(p.user_id, (programariCountByUser.get(p.user_id) || 0) + 1));

  const programariCountBySalon = new Map<string, number>();
  (programariRaw || []).forEach((p: any) => programariCountBySalon.set(p.salon_id, (programariCountBySalon.get(p.salon_id) || 0) + 1));

  const clientiReali: MockClient[] = (profiluriRaw || [])
    .filter((p: any) => p.tip === "client")
    .map((p: any) => ({
      id: p.id,
      nume: p.nume || "Client",
      email: emailMap.get(p.id) || "—",
      telefon: p.telefon || "—",
      oras: "—",
      dataInregistrare: p.created_at || new Date().toISOString(),
      nrAnimale: animaleCount.get(p.id) || 0,
      nrProgramari: programariCountByUser.get(p.id) || 0,
      status: "activ" as const,
    }));

  const saloaneReale: MockSalon[] = (saloaneRaw || []).map((s: any) => {
    const owner = profMap.get(s.user_id);
    return {
      id: s.id,
      nume: s.nume || "Salon",
      oras: s.oras || "—",
      email: emailMap.get(s.user_id) || "—",
      telefon: s.telefon || owner?.telefon || "—",
      plan: "starter" as const,
      nrAngajati: 1,
      nrProgramariLuna: programariCountBySalon.get(s.id) || 0,
      rating: 0,
      dataInregistrare: s.created_at || new Date().toISOString(),
      status: "activ" as const,
    };
  });

  const salonMap = new Map<string, any>();
  saloaneReale.forEach(s => salonMap.set(String(s.id), s));

  const programariReale: MockProgramare[] = (programariRaw || []).map((p: any) => {
    const owner = profMap.get(p.user_id);
    const salon = salonMap.get(String(p.salon_id));
    const statusMap: Record<string, MockProgramare["status"]> = {
      "confirmat": "confirmata",
      "în așteptare": "in_asteptare",
      "in asteptare": "in_asteptare",
      "finalizat": "finalizata",
      "anulat": "anulata",
    };
    return {
      id: p.id,
      client: owner?.nume || "Client",
      salon: salon?.nume || "Salon",
      oras: salon?.oras || "—",
      serviciu: p.serviciu || "—",
      pret: Number(p.pret) || 0,
      data: p.data ? new Date(`${p.data}T${p.ora || "00:00"}:00`).toISOString() : new Date().toISOString(),
      status: statusMap[p.status] || "in_asteptare",
    };
  });

  return {
    ...base,
    clienti: clientiReali,
    saloane: saloaneReale,
    programari: programariReale,
  };
}

const btnGhost: React.CSSProperties = { background: "transparent", color: "#9CA3AF", border: "1px solid #2A2A2A", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
const btnLogout: React.CSSProperties = { background: "#FF6B00", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
const card: React.CSSProperties = { background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 22 };
const sectionTitle: React.CSSProperties = { fontSize: 20, fontWeight: 900, marginBottom: 18, color: "#fff" };
const subTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 };
const inputDark: React.CSSProperties = { background: "#0A0A0A", border: "1.5px solid #2A2A2A", color: "#fff", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontFamily: "Nunito, sans-serif", outline: "none" };
const tableCell: React.CSSProperties = { padding: "14px 16px", fontSize: 13, color: "#E5E7EB", borderBottom: "1px solid #1F1F1F" };
const tableHeadCell: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, background: "#0F0F0F", borderBottom: "1px solid #1F1F1F", textAlign: "left" };
const badge = (bg: string, color: string): React.CSSProperties => ({ background: bg, color, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800, display: "inline-block" });

/* ------------------- OVERVIEW ------------------- */
function OverviewTab({ data }: { data: MockData }) {
  const programariAzi = data.programari.filter(p => new Date(p.data).toDateString() === new Date().toDateString()).length;
  const programariLuna = data.programari.filter(p => { const d = new Date(p.data); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length;
  const venituriPlan: Record<string, number> = { starter: 0, pro: 99, business: 199 };
  const mrr = data.saloane.filter(s => s.status === "activ").reduce((sum, s) => sum + venituriPlan[s.plan], 0);
  const tichetelNoi = data.tichete.filter(t => t.status === "nou").length;
  const reviewsRaportate = data.reviews.filter(r => r.raportat).length;
  const ratingMediu = data.saloane.length ? (data.saloane.reduce((s, x) => s + x.rating, 0) / data.saloane.length).toFixed(2) : "0";

  const KPI = [
    { label: "Stăpâni înregistrați", val: data.clienti.length, sub: `${data.clienti.filter(c => c.status === "activ").length} activi`, color: "#10B981" },
    { label: "Saloane partenere", val: data.saloane.length, sub: `${data.saloane.filter(s => s.status === "activ").length} active`, color: "#3B82F6" },
    { label: "Programări azi", val: programariAzi, sub: `${programariLuna} luna aceasta`, color: "#FF6B00" },
    { label: "MRR (venit lunar)", val: `${mrr} RON`, sub: `${data.saloane.filter(s => s.plan !== "starter").length} saloane plătitoare`, color: "#A855F7" },
    { label: "Rating mediu", val: `${ratingMediu} ★`, sub: `${data.reviews.length} review-uri`, color: "#FBBF24" },
    { label: "Tichete noi", val: tichetelNoi, sub: `${data.tichete.filter(t => t.urgenta === "urgenta").length} urgente`, color: "#F87171" },
    { label: "Review-uri raportate", val: reviewsRaportate, sub: "necesită moderare", color: "#EF4444" },
    { label: "Total programări", val: data.programari.length, sub: "din toată istoria", color: "#06B6D4" },
  ];

  const maxMRR = Math.max(...data.istoricFinanciar.map(f => f.mrr), 1);

  return (
    <div>
      <h2 style={sectionTitle}>📊 Vedere de ansamblu</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        {KPI.map((k, i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.color, marginBottom: 4, lineHeight: 1.1 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 20 }}>
        <div style={card}>
          <div style={subTitle}>Evoluție MRR — ultimele 6 luni</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 200, padding: "16px 0" }}>
            {data.istoricFinanciar.map((f, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>{f.mrr} RON</div>
                <div style={{ width: "100%", height: `${(f.mrr / maxMRR) * 140}px`, background: "linear-gradient(180deg, #FF6B00 0%, #E05A00 100%)", borderRadius: "8px 8px 0 0", minHeight: 4 }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>{f.luna}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <div style={subTitle}>Distribuție planuri</div>
          {(["starter", "pro", "business"] as const).map((plan) => {
            const count = data.saloane.filter(s => s.plan === plan).length;
            const pct = data.saloane.length ? Math.round((count / data.saloane.length) * 100) : 0;
            const color = plan === "business" ? "#A855F7" : plan === "pro" ? "#FF6B00" : "#6B7280";
            return (
              <div key={plan} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: "#E5E7EB", fontWeight: 700, textTransform: "capitalize" }}>{plan}</span>
                  <span style={{ color: "#9CA3AF" }}>{count} saloane ({pct}%)</span>
                </div>
                <div style={{ width: "100%", height: 8, background: "#1F1F1F", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------- STAPANI ------------------- */
function StapaniTab({ data, setData }: { data: MockData; setData: (d: MockData) => void }) {
  const [search, setSearch] = useState("");
  const [filterOras, setFilterOras] = useState("");
  const filtered = useMemo(() => data.clienti.filter(c =>
    (c.nume.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    (filterOras === "" || c.oras === filterOras)
  ), [data.clienti, search, filterOras]);

  function toggleStatus(id: string) {
    const updated: MockData = { ...data, clienti: data.clienti.map(c => c.id === id ? { ...c, status: (c.status === "activ" ? "blocat" : "activ") as "activ" | "blocat" } : c) };
    setData(updated); localStorage.setItem("calyhub_admin_mockdata", JSON.stringify(updated));
  }

  return (
    <div>
      <h2 style={sectionTitle}>👤 Stăpâni ({data.clienti.length})</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input style={{ ...inputDark, flex: 1, minWidth: 200 }} placeholder="🔍 Caută după nume sau email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={inputDark} value={filterOras} onChange={e => setFilterOras(e.target.value)}>
          <option value="">Toate orașele</option>
          {[...new Set(data.clienti.map(c => c.oras))].sort().map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div style={{ ...card, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead><tr>
            <th style={tableHeadCell}>Nume</th><th style={tableHeadCell}>Email</th><th style={tableHeadCell}>Telefon</th><th style={tableHeadCell}>Oraș</th><th style={tableHeadCell}>Animale</th><th style={tableHeadCell}>Programări</th><th style={tableHeadCell}>Status</th><th style={tableHeadCell}>Acțiuni</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ ...tableCell, fontWeight: 700 }}>{c.nume}</td>
                <td style={{ ...tableCell, color: "#9CA3AF" }}>{c.email}</td>
                <td style={{ ...tableCell, color: "#9CA3AF" }}>{c.telefon}</td>
                <td style={tableCell}>{c.oras}</td>
                <td style={tableCell}>{c.nrAnimale}</td>
                <td style={tableCell}>{c.nrProgramari}</td>
                <td style={tableCell}>{c.status === "activ" ? <span style={badge("rgba(16,185,129,.15)", "#10B981")}>Activ</span> : <span style={badge("rgba(239,68,68,.15)", "#F87171")}>Blocat</span>}</td>
                <td style={tableCell}><button onClick={() => toggleStatus(c.id)} style={{ background: "transparent", border: "1px solid #2A2A2A", color: c.status === "activ" ? "#F87171" : "#10B981", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito" }}>{c.status === "activ" ? "Blochează" : "Activează"}</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ ...tableCell, textAlign: "center", color: "#6B7280", padding: 40 }}>Niciun rezultat</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------- SALOANE ------------------- */
function SaloaneTab({ data, setData }: { data: MockData; setData: (d: MockData) => void }) {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const filtered = useMemo(() => data.saloane.filter(s =>
    s.nume.toLowerCase().includes(search.toLowerCase()) &&
    (filterPlan === "" || s.plan === filterPlan) &&
    (filterStatus === "" || s.status === filterStatus)
  ), [data.saloane, search, filterPlan, filterStatus]);

  function setStatus(id: string, status: "activ" | "suspendat") {
    const updated = { ...data, saloane: data.saloane.map(s => s.id === id ? { ...s, status } : s) };
    setData(updated); localStorage.setItem("calyhub_admin_mockdata", JSON.stringify(updated));
  }

  return (
    <div>
      <h2 style={sectionTitle}>✂️ Saloane partenere ({data.saloane.length})</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input style={{ ...inputDark, flex: 1, minWidth: 200 }} placeholder="🔍 Caută salon..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={inputDark} value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
          <option value="">Toate planurile</option><option value="starter">Starter</option><option value="pro">Pro</option><option value="business">Business</option>
        </select>
        <select style={inputDark} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Toate statusurile</option><option value="activ">Activ</option><option value="suspendat">Suspendat</option><option value="in_asteptare">În așteptare</option>
        </select>
      </div>
      <div style={{ ...card, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead><tr>
            <th style={tableHeadCell}>Salon</th><th style={tableHeadCell}>Oraș</th><th style={tableHeadCell}>Plan</th><th style={tableHeadCell}>Angajați</th><th style={tableHeadCell}>Progr./lună</th><th style={tableHeadCell}>Rating</th><th style={tableHeadCell}>Status</th><th style={tableHeadCell}>Acțiuni</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => {
              const planColor = s.plan === "business" ? "#A855F7" : s.plan === "pro" ? "#FF6B00" : "#6B7280";
              const statusBadge = s.status === "activ" ? badge("rgba(16,185,129,.15)", "#10B981") : s.status === "suspendat" ? badge("rgba(239,68,68,.15)", "#F87171") : badge("rgba(251,191,36,.15)", "#FBBF24");
              return (
                <tr key={s.id}>
                  <td style={{ ...tableCell, fontWeight: 700 }}>{s.nume}<div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{s.email}</div></td>
                  <td style={tableCell}>{s.oras}</td>
                  <td style={tableCell}><span style={{ ...badge("transparent", planColor), border: `1px solid ${planColor}`, textTransform: "capitalize" }}>{s.plan}</span></td>
                  <td style={tableCell}>{s.nrAngajati}</td>
                  <td style={tableCell}>{s.nrProgramariLuna}</td>
                  <td style={{ ...tableCell, color: "#FBBF24", fontWeight: 700 }}>{s.rating} ★</td>
                  <td style={tableCell}><span style={statusBadge}>{s.status === "in_asteptare" ? "În așteptare" : s.status}</span></td>
                  <td style={tableCell}>
                    {s.status === "activ" ? <button onClick={() => setStatus(s.id, "suspendat")} style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#F87171", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito" }}>Suspendă</button>
                      : <button onClick={() => setStatus(s.id, "activ")} style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#10B981", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito" }}>Activează</button>}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ ...tableCell, textAlign: "center", color: "#6B7280", padding: 40 }}>Niciun rezultat</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------- PROGRAMARI ------------------- */
function ProgramariTab({ data }: { data: MockData }) {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOras, setFilterOras] = useState("");
  const filtered = useMemo(() => data.programari.filter(p =>
    (filterStatus === "" || p.status === filterStatus) &&
    (filterOras === "" || p.oras === filterOras)
  ).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()), [data.programari, filterStatus, filterOras]);

  const statusColor: Record<string, string> = { confirmata: "#3B82F6", finalizata: "#10B981", anulata: "#F87171", in_asteptare: "#FBBF24" };
  const statusLabel: Record<string, string> = { confirmata: "Confirmată", finalizata: "Finalizată", anulata: "Anulată", in_asteptare: "În așteptare" };

  return (
    <div>
      <h2 style={sectionTitle}>📅 Programări ({data.programari.length})</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select style={inputDark} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Toate statusurile</option>
          {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select style={inputDark} value={filterOras} onChange={e => setFilterOras(e.target.value)}>
          <option value="">Toate orașele</option>
          {[...new Set(data.programari.map(p => p.oras))].sort().map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div style={{ ...card, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead><tr>
            <th style={tableHeadCell}>Data</th><th style={tableHeadCell}>Client</th><th style={tableHeadCell}>Salon</th><th style={tableHeadCell}>Oraș</th><th style={tableHeadCell}>Serviciu</th><th style={tableHeadCell}>Preț</th><th style={tableHeadCell}>Status</th>
          </tr></thead>
          <tbody>
            {filtered.slice(0, 100).map(p => (
              <tr key={p.id}>
                <td style={{ ...tableCell, color: "#9CA3AF", fontSize: 12 }}>{new Date(p.data).toLocaleString("ro-RO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td style={{ ...tableCell, fontWeight: 700 }}>{p.client}</td>
                <td style={tableCell}>{p.salon}</td>
                <td style={tableCell}>{p.oras}</td>
                <td style={{ ...tableCell, color: "#9CA3AF" }}>{p.serviciu}</td>
                <td style={{ ...tableCell, fontWeight: 700, color: "#10B981" }}>{p.pret} RON</td>
                <td style={tableCell}><span style={badge(`${statusColor[p.status]}22`, statusColor[p.status])}>{statusLabel[p.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && <div style={{ padding: "14px 16px", fontSize: 12, color: "#6B7280", textAlign: "center" }}>Afișate 100 din {filtered.length} programări</div>}
      </div>
    </div>
  );
}

/* ------------------- ABONAMENTE ------------------- */
function AbonamenteTab({ data }: { data: MockData }) {
  const venituriPlan: Record<string, number> = { starter: 0, pro: 99, business: 199 };
  const stats = (["starter", "pro", "business"] as const).map(p => {
    const saloane = data.saloane.filter(s => s.plan === p && s.status === "activ");
    return { plan: p, count: saloane.length, mrr: saloane.length * venituriPlan[p] };
  });
  const totalMRR = stats.reduce((s, x) => s + x.mrr, 0);
  const totalARR = totalMRR * 12;
  const churn = data.istoricFinanciar.length ? data.istoricFinanciar[data.istoricFinanciar.length - 1].churn : 0;
  const newSignups = data.istoricFinanciar.length ? data.istoricFinanciar[data.istoricFinanciar.length - 1].newSignups : 0;

  return (
    <div>
      <h2 style={sectionTitle}>💳 Abonamente & Venituri</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={{ ...card, background: "linear-gradient(135deg, #FF6B00 0%, #E05A00 100%)", border: "none" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.85)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>MRR — venit lunar recurent</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{totalMRR.toLocaleString("ro-RO")} RON</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.85)" }}>ARR estimat: {totalARR.toLocaleString("ro-RO")} RON / an</div>
        </div>
        <div style={card}><div style={subTitle}>Înregistrări noi luna asta</div><div style={{ fontSize: 28, fontWeight: 900, color: "#10B981" }}>+{newSignups}</div></div>
        <div style={card}><div style={subTitle}>Churn (anulări)</div><div style={{ fontSize: 28, fontWeight: 900, color: "#F87171" }}>-{churn}</div></div>
        <div style={card}><div style={subTitle}>Plătitori activi</div><div style={{ fontSize: 28, fontWeight: 900, color: "#A855F7" }}>{stats.filter(s => s.plan !== "starter").reduce((sum, s) => sum + s.count, 0)}</div></div>
      </div>

      <div style={card}>
        <div style={subTitle}>Defalcare pe plan</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={tableHeadCell}>Plan</th><th style={tableHeadCell}>Saloane active</th><th style={tableHeadCell}>Preț/lună</th><th style={tableHeadCell}>MRR</th><th style={tableHeadCell}>% din total</th></tr></thead>
          <tbody>
            {stats.map(s => {
              const planColor = s.plan === "business" ? "#A855F7" : s.plan === "pro" ? "#FF6B00" : "#6B7280";
              const pct = totalMRR > 0 ? Math.round((s.mrr / totalMRR) * 100) : 0;
              return (
                <tr key={s.plan}>
                  <td style={{ ...tableCell, textTransform: "capitalize", fontWeight: 700, color: planColor }}>{s.plan}</td>
                  <td style={tableCell}>{s.count}</td>
                  <td style={tableCell}>{venituriPlan[s.plan]} RON</td>
                  <td style={{ ...tableCell, fontWeight: 800, color: "#10B981" }}>{s.mrr} RON</td>
                  <td style={tableCell}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------- REVIEWS ------------------- */
function ReviewsTab({ data, setData }: { data: MockData; setData: (d: MockData) => void }) {
  const [filter, setFilter] = useState<"toate" | "raportate">("toate");
  const filtered = filter === "raportate" ? data.reviews.filter(r => r.raportat) : data.reviews;

  function sterge(id: string) {
    if (!confirm("Ștergi acest review?")) return;
    const updated = { ...data, reviews: data.reviews.filter(r => r.id !== id) };
    setData(updated); localStorage.setItem("calyhub_admin_mockdata", JSON.stringify(updated));
  }
  function aproba(id: string) {
    const updated = { ...data, reviews: data.reviews.map(r => r.id === id ? { ...r, raportat: false } : r) };
    setData(updated); localStorage.setItem("calyhub_admin_mockdata", JSON.stringify(updated));
  }

  return (
    <div>
      <h2 style={sectionTitle}>⭐ Moderare review-uri</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setFilter("toate")} style={{ ...btnGhost, background: filter === "toate" ? "#FF6B00" : "transparent", color: filter === "toate" ? "#fff" : "#9CA3AF", borderColor: filter === "toate" ? "#FF6B00" : "#2A2A2A" }}>Toate ({data.reviews.length})</button>
        <button onClick={() => setFilter("raportate")} style={{ ...btnGhost, background: filter === "raportate" ? "#EF4444" : "transparent", color: filter === "raportate" ? "#fff" : "#9CA3AF", borderColor: filter === "raportate" ? "#EF4444" : "#2A2A2A" }}>Raportate ({data.reviews.filter(r => r.raportat).length})</button>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(r => (
          <div key={r.id} style={{ ...card, borderColor: r.raportat ? "rgba(239,68,68,.4)" : "#1F1F1F" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#fff", marginBottom: 4 }}>{r.client} <span style={{ color: "#9CA3AF", fontWeight: 500, fontSize: 13 }}>→ {r.salon}</span></div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{new Date(r.data).toLocaleDateString("ro-RO")}</div>
              </div>
              <div style={{ color: "#FBBF24", fontWeight: 800 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            </div>
            <p style={{ fontSize: 14, color: "#E5E7EB", lineHeight: 1.6, marginBottom: 12 }}>{r.text}</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {r.raportat && <span style={badge("rgba(239,68,68,.2)", "#F87171")}>⚠️ Raportat</span>}
              {r.raportat && <button onClick={() => aproba(r.id)} style={{ background: "transparent", border: "1px solid #10B981", color: "#10B981", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito" }}>✓ Aprobă</button>}
              <button onClick={() => sterge(r.id)} style={{ background: "transparent", border: "1px solid #F87171", color: "#F87171", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito" }}>🗑️ Șterge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------- TICHETE ------------------- */
function TicheteTab({ data, setData }: { data: MockData; setData: (d: MockData) => void }) {
  const [filterStatus, setFilterStatus] = useState<"toate" | "nou" | "raspuns" | "rezolvat">("toate");
  const filtered = filterStatus === "toate" ? data.tichete : data.tichete.filter(t => t.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => {
    const order = { urgenta: 0, normala: 1, scazuta: 2 };
    return order[a.urgenta] - order[b.urgenta];
  });

  function setStatus(id: string, status: "nou" | "raspuns" | "rezolvat") {
    const updated = { ...data, tichete: data.tichete.map(t => t.id === id ? { ...t, status } : t) };
    setData(updated); localStorage.setItem("calyhub_admin_mockdata", JSON.stringify(updated));
  }

  return (
    <div>
      <h2 style={sectionTitle}>🎫 Tichete suport ({data.tichete.length})</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["toate", "nou", "raspuns", "rezolvat"] as const).map(s => {
          const labels: Record<string, string> = { toate: "Toate", nou: "Nou", raspuns: "Răspuns trimis", rezolvat: "Rezolvat" };
          const count = s === "toate" ? data.tichete.length : data.tichete.filter(t => t.status === s).length;
          return <button key={s} onClick={() => setFilterStatus(s)} style={{ ...btnGhost, background: filterStatus === s ? "#FF6B00" : "transparent", color: filterStatus === s ? "#fff" : "#9CA3AF", borderColor: filterStatus === s ? "#FF6B00" : "#2A2A2A" }}>{labels[s]} ({count})</button>;
        })}
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {sorted.map(t => {
          const urgColor = t.urgenta === "urgenta" ? "#F87171" : t.urgenta === "normala" ? "#FBBF24" : "#9CA3AF";
          const statColor = t.status === "nou" ? "#3B82F6" : t.status === "raspuns" ? "#FBBF24" : "#10B981";
          const statLabel = t.status === "nou" ? "Nou" : t.status === "raspuns" ? "Răspuns trimis" : "Rezolvat";
          return (
            <div key={t.id} style={{ ...card, borderLeft: `4px solid ${urgColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 15, marginBottom: 4 }}>{t.subiect}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>De la <strong style={{ color: "#E5E7EB" }}>{t.salon}</strong> · {t.email}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={badge(`${urgColor}22`, urgColor)}>{t.urgenta === "urgenta" ? "🚨 Urgent" : t.urgenta === "normala" ? "Normal" : "Scăzut"}</span>
                  <span style={badge(`${statColor}22`, statColor)}>{statLabel}</span>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: "#E5E7EB", lineHeight: 1.6, margin: "12px 0", padding: 12, background: "#0A0A0A", borderRadius: 8, border: "1px solid #1F1F1F" }}>{t.mesaj}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: "#6B7280" }}>📅 {new Date(t.data).toLocaleDateString("ro-RO")}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {t.status !== "raspuns" && <button onClick={() => setStatus(t.id, "raspuns")} style={{ background: "transparent", border: "1px solid #FBBF24", color: "#FBBF24", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito" }}>📨 Marchează răspuns</button>}
                  {t.status !== "rezolvat" && <button onClick={() => setStatus(t.id, "rezolvat")} style={{ background: "transparent", border: "1px solid #10B981", color: "#10B981", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito" }}>✓ Rezolvat</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------- MARKETING ------------------- */
function MarketingTab() {
  const trafic = [
    { pagina: "/", vizite: 4523, conv: 2.8 },
    { pagina: "/cum-functioneaza", vizite: 1230, conv: 5.4 },
    { pagina: "/saloane-grooming-bucuresti", vizite: 987, conv: 7.1 },
    { pagina: "/saloane-grooming-cluj", vizite: 543, conv: 6.3 },
    { pagina: "/register", vizite: 412, conv: 38.2 },
    { pagina: "/despre-noi", vizite: 298, conv: 1.2 },
  ];
  const cautari = ["grooming caine bucuresti", "salon tuns caine cluj", "frizerie pisica timisoara", "tuns caine pret", "salon grooming langa mine"];

  return (
    <div>
      <h2 style={sectionTitle}>📈 Marketing & SEO</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={card}><div style={subTitle}>Trafic lunar</div><div style={{ fontSize: 28, fontWeight: 900, color: "#FF6B00" }}>8.4K</div><div style={{ fontSize: 12, color: "#10B981" }}>+12% vs luna trecută</div></div>
        <div style={card}><div style={subTitle}>Rata conversie</div><div style={{ fontSize: 28, fontWeight: 900, color: "#10B981" }}>3.2%</div><div style={{ fontSize: 12, color: "#9CA3AF" }}>vizitatori → cont creat</div></div>
        <div style={card}><div style={subTitle}>Sitemap status</div><div style={{ fontSize: 18, fontWeight: 800, color: "#10B981" }}>✓ Activ</div><div style={{ fontSize: 12, color: "#9CA3AF" }}>22 pagini indexabile</div></div>
        <div style={card}><div style={subTitle}>Pagini locale</div><div style={{ fontSize: 28, fontWeight: 900, color: "#A855F7" }}>5</div><div style={{ fontSize: 12, color: "#9CA3AF" }}>Buc, Cluj, Tim, Iași, Brașov</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 20 }}>
        <div style={card}>
          <div style={subTitle}>Top pagini după trafic</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {trafic.map(t => (
              <div key={t.pagina} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#0A0A0A", borderRadius: 8, border: "1px solid #1F1F1F" }}>
                <div style={{ fontSize: 12, color: "#E5E7EB", fontFamily: "monospace" }}>{t.pagina}</div>
                <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
                  <span style={{ color: "#9CA3AF" }}>{t.vizite.toLocaleString()} vizite</span>
                  <span style={{ color: "#10B981", fontWeight: 700 }}>{t.conv}% conv.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <div style={subTitle}>Top căutări organice</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {cautari.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#0A0A0A", borderRadius: 8, border: "1px solid #1F1F1F" }}>
                <span style={{ color: "#FF6B00", fontWeight: 800, fontSize: 12, minWidth: 22 }}>#{i + 1}</span>
                <span style={{ fontSize: 13, color: "#E5E7EB" }}>{c}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: "#6B7280", fontStyle: "italic" }}>Date demo. După conectare Google Search Console vor fi reale.</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------- SETARI ------------------- */
function SetariTab() {
  const [orase, setOrase] = useState(["bucuresti", "cluj", "timisoara", "iasi", "brasov"]);
  const [orasNou, setOrasNou] = useState("");
  const [maintenance, setMaintenance] = useState(false);

  function adaugaOras() {
    const slug = orasNou.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!slug || orase.includes(slug)) return;
    setOrase([...orase, slug]);
    setOrasNou("");
    alert(`Oraș adăugat în UI. Pentru pagină reală SEO trebuie adăugat și în lib/adminMockData.ts + app/saloane-grooming/[oras]/page.tsx + app/sitemap.ts.`);
  }

  return (
    <div>
      <h2 style={sectionTitle}>⚙️ Setări sistem</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 20 }}>
        <div style={card}>
          <div style={subTitle}>Orașe cu pagini SEO locale</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {orase.map(o => <span key={o} style={{ background: "#1F1F1F", color: "#FF6B00", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{o}</span>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputDark, flex: 1 }} placeholder="ex: constanta" value={orasNou} onChange={e => setOrasNou(e.target.value)} />
            <button onClick={adaugaOras} style={{ background: "#FF6B00", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito" }}>Adaugă</button>
          </div>
        </div>

        <div style={card}>
          <div style={subTitle}>Prețuri planuri (RON/lună)</div>
          {[{ p: "Starter", v: 0 }, { p: "Pro", v: 99 }, { p: "Business", v: 199 }].map(x => (
            <div key={x.p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1F1F1F" }}>
              <span style={{ color: "#E5E7EB", fontWeight: 700 }}>{x.p}</span>
              <input defaultValue={x.v} style={{ ...inputDark, width: 100, textAlign: "right" }} />
            </div>
          ))}
          <button style={{ marginTop: 14, background: "#FF6B00", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito", width: "100%" }}>Salvează prețuri</button>
        </div>

        <div style={card}>
          <div style={subTitle}>Mod mentenanță</div>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 14, lineHeight: 1.6 }}>Când e activat, vizitatorii văd o pagină "Revenim curând".</p>
          <button onClick={() => setMaintenance(!maintenance)} style={{ background: maintenance ? "#EF4444" : "#10B981", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito" }}>
            {maintenance ? "🔴 Mentenanță activă" : "🟢 Site online"}
          </button>
        </div>

        <div style={card}>
          <div style={subTitle}>Banner anunț site</div>
          <input style={{ ...inputDark, width: "100%", marginBottom: 10 }} placeholder="Text afișat sus pe toate paginile" />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: "#10B981", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito" }}>Activează</button>
            <button style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#9CA3AF", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito" }}>Dezactivează</button>
          </div>
        </div>
      </div>

      <div style={{ ...card, marginTop: 20, background: "rgba(255,107,0,.08)", borderColor: "rgba(255,107,0,.3)" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", marginBottom: 6 }}>ℹ️ Notă demo</div>
        <p style={{ fontSize: 13, color: "#E5E7EB", lineHeight: 1.6 }}>Setările din această pagină modifică doar starea locală pentru demo. Pentru efecte reale (mod mentenanță global, banner pe site, schimbare prețuri în baza de date), e nevoie de un backend persistent.</p>
      </div>
    </div>
  );
}
