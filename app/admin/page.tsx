"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import { TICHETE_DEMO, type TichetDemo } from "../../lib/adminMockData";
import LogoSemn from "../../components/LogoSemn";
import { supabase } from "../../lib/supabase";
import { stareTrial, ZILE_TRIAL, ZILE_PANA_LA_STERGERE, ZILE_AVERTISMENT } from "../../lib/trial";
import { planuriPentru, VERTICAL, type PlanId, type Vertical } from "../../lib/planuri";
import {
  BarChart3, Users, Scissors, CalendarDays, CreditCard, Star, Ticket, TrendingUp, Settings,
  Lock, RefreshCw, Search, AlertTriangle, ChevronDown, ChevronUp, ArrowLeft, ArrowRight,
  Check, X, Siren, Send, Info, type LucideIcon,
} from "lucide-react";

/* ══════════════ Tipuri ══════════════ */

type FiltruVert = "toate" | Vertical;
type StareSalon = "trial" | "expirat" | "abonat";

type AdminSalon = {
  id: string;
  nume: string;
  oras: string;
  telefon: string;
  domeniu: Vertical;
  plan: PlanId;
  stare: StareSalon;
  zileRamase: number;        // doar în trial
  zileDeLaExpirare: number;  // doar după expirare
  trialExpiraLa: string | null;
  nrEchipa: number;
  nrServicii: number;
  specii: string[];
  nrProgramariLuna: number;
  nrProgramariTotal: number;
  rating: number;
  nrRecenzii: number;
  dataInregistrare: string;
};

type AdminClient = {
  id: string;
  nume: string;
  telefon: string;
  nrAnimale: number;
  nrProgramari: number;
  dataInregistrare: string;
};

type AdminProgramare = {
  id: string;
  client: string;
  salonId: string;
  salon: string;
  oras: string;
  domeniu: Vertical | null;
  serviciu: string;
  pret: number;
  data: string;
  status: "confirmata" | "finalizata" | "anulata" | "in_asteptare";
};

type AdminRecenzie = {
  id: string;
  client: string;
  salon: string;
  domeniu: Vertical | null;
  rating: number;
  text: string;
  data: string;
  raspuns: string | null;
};

type AdminData = {
  clienti: AdminClient[];
  saloane: AdminSalon[];
  programari: AdminProgramare[];
  recenzii: AdminRecenzie[];
  tichete: TichetDemo[];
};

type Tab = "overview" | "stapani" | "saloane" | "programari" | "abonamente" | "reviews" | "tichete" | "marketing" | "setari";

const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", Icon: BarChart3 },
  { id: "stapani", label: "Clienți", Icon: Users },
  { id: "saloane", label: "Saloane", Icon: Scissors },
  { id: "programari", label: "Programări", Icon: CalendarDays },
  { id: "abonamente", label: "Abonamente", Icon: CreditCard },
  { id: "reviews", label: "Recenzii", Icon: Star },
  { id: "tichete", label: "Tichete suport", Icon: Ticket },
  { id: "marketing", label: "Marketing/SEO", Icon: TrendingUp },
  { id: "setari", label: "Configurație", Icon: Settings },
];

/** Orașele cu pagini SEO — oglindesc `app/sitemap.ts` și `next.config.js`. */
const ORASE_SEO = ["bucuresti", "cluj", "timisoara", "iasi", "brasov"];

const VERT_COLOR: Record<Vertical, string> = { infrumusetare: "#EC4899", grooming: "#3B82F6" };
const VERT_SCURT: Record<Vertical, string> = { infrumusetare: "Înfrumusețare", grooming: "Grooming" };

/* ══════════════ Pagina ══════════════ */

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [vert, setVert] = useState<FiltruVert>("toate");
  const [data, setData] = useState<AdminData | null>(null);
  const [reincarca, setReincarca] = useState(false);

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

      setData(await fetchAdminData());
      setAuthChecked(true);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }
  async function regenerateData() {
    setReincarca(true);
    setData(await fetchAdminData());
    setReincarca(false);
  }

  // Filtrarea pe verticală se aplică o singură dată, aici, și coboară în toate taburile.
  const filtrat: AdminData | null = useMemo(() => {
    if (!data) return null;
    if (vert === "toate") return data;
    const saloane = data.saloane.filter(s => s.domeniu === vert);
    const numeSaloane = new Set(saloane.map(s => s.nume));
    return {
      ...data,
      saloane,
      programari: data.programari.filter(p => p.domeniu === vert),
      recenzii: data.recenzii.filter(r => r.domeniu === vert),
      tichete: data.tichete.filter(t => numeSaloane.size === 0 || numeSaloane.has(t.salon)),
    };
  }, [data, vert]);

  if (!authChecked || !data || !filtrat) {
    return <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6B00", fontFamily: "Nunito" }}>Se verifică sesiunea...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#fff", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#111", borderBottom: "1px solid #1F1F1F", padding: "12px 20px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/admin" aria-label="CalyHub — panou de administrare"><LogoSemn size={40} tema="dark" priority /></Link>
            <span style={{ background: "#FF6B00", color: "#fff", padding: "4px 12px", borderRadius: 50, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, display: "inline-flex", alignItems: "center", gap: 5 }}><Lock size={11} strokeWidth={2.6} /> Admin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Comutator verticală — se aplică pe tot panoul */}
            <div style={{ display: "inline-flex", gap: 3, background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 10, padding: 3 }}>
              {([
                { v: "toate" as FiltruVert, label: "Toate", color: "#FF6B00" },
                { v: "infrumusetare" as FiltruVert, label: "Înfrumusețare", color: VERT_COLOR.infrumusetare },
                { v: "grooming" as FiltruVert, label: "Grooming", color: VERT_COLOR.grooming },
              ]).map(o => {
                const activ = vert === o.v;
                const n = o.v === "toate" ? data.saloane.length : data.saloane.filter(s => s.domeniu === o.v).length;
                return (
                  <button key={o.v} onClick={() => setVert(o.v)}
                    style={{ background: activ ? o.color : "transparent", color: activ ? "#fff" : "#9CA3AF", border: "none", padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap" }}>
                    {o.label} <span style={{ opacity: .75, fontWeight: 700 }}>({n})</span>
                  </button>
                );
              })}
            </div>
            <button onClick={regenerateData} disabled={reincarca} style={{ ...btnGhost, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={13} strokeWidth={2.4} style={reincarca ? { animation: "ch-spin 1s linear infinite" } : undefined} />
              {reincarca ? "Se încarcă..." : "Reîncarcă date"}
            </button>
            <button onClick={logout} style={btnLogout}>Deconectare</button>
          </div>
        </div>
      </header>

      <div style={{ background: "#0F0F0F", borderBottom: "1px solid #1F1F1F", overflowX: "auto" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", gap: 4, padding: "8px 12px", minWidth: "max-content" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: tab === t.id ? "#FF6B00" : "transparent", color: tab === t.id ? "#fff" : "#9CA3AF", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 7 }}>
              <t.Icon size={15} strokeWidth={2.2} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ flex: 1, padding: "28px 20px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        {vert !== "toate" && (
          <div style={{ background: `${VERT_COLOR[vert]}18`, border: `1px solid ${VERT_COLOR[vert]}55`, borderRadius: 12, padding: "10px 16px", marginBottom: 18, fontSize: 13, fontWeight: 700, color: VERT_COLOR[vert], display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span>Filtrat pe verticala <strong>{VERTICAL[vert].eticheta}</strong> — clienții nu se filtrează (un cont de client nu aparține unei verticale).</span>
            <button onClick={() => setVert("toate")} style={{ ...btnGhost, borderColor: `${VERT_COLOR[vert]}55`, color: VERT_COLOR[vert] }}>Renunță la filtru</button>
          </div>
        )}

        {tab === "overview" && <OverviewTab data={filtrat} tot={data} vert={vert} />}
        {tab === "stapani" && <ClientiTab data={data} />}
        {tab === "saloane" && <SaloaneTab data={filtrat} />}
        {tab === "programari" && <ProgramariTab data={filtrat} />}
        {tab === "abonamente" && <AbonamenteTab data={filtrat} />}
        {tab === "reviews" && <RecenziiTab data={filtrat} />}
        {tab === "tichete" && <TicheteTab data={filtrat} />}
        {tab === "marketing" && <MarketingTab data={data} />}
        {tab === "setari" && <ConfiguratieTab />}
      </main>

      <Footer variant="admin" />
    </div>
  );
}

/* ══════════════ Citirea datelor reale ══════════════ */

async function fetchAdminData(): Promise<AdminData> {
  const [
    { data: profiluriRaw },
    { data: animaleRaw },
    { data: saloaneRaw },
    { data: programariRaw },
    { data: recenziiRaw },
  ] = await Promise.all([
    supabase.from("profiluri").select("id, nume, telefon, tip, created_at"),
    supabase.from("animale").select("user_id"),
    supabase.from("saloane").select("id, user_id, nume, oras, telefon, created_at, domeniu, plan, trial_expira_la, abonament_activ, echipa, servicii, specii"),
    supabase.from("programari").select("id, user_id, salon_id, data, ora, status, pret, serviciu"),
    supabase.from("recenzii").select("id, salon_id, user_id, rating, text, created_at, raspuns_salon"),
  ]);

  const profMap = new Map<string, any>();
  (profiluriRaw || []).forEach((p: any) => profMap.set(p.id, p));

  const animaleCount = new Map<string, number>();
  (animaleRaw || []).forEach((a: any) => animaleCount.set(a.user_id, (animaleCount.get(a.user_id) || 0) + 1));

  const programariPerUser = new Map<string, number>();
  const programariPerSalon = new Map<string, number>();
  const programariLunaPerSalon = new Map<string, number>();
  const acum = new Date();
  (programariRaw || []).forEach((p: any) => {
    programariPerUser.set(p.user_id, (programariPerUser.get(p.user_id) || 0) + 1);
    const k = String(p.salon_id);
    programariPerSalon.set(k, (programariPerSalon.get(k) || 0) + 1);
    const d = p.data ? new Date(p.data) : null;
    if (d && d.getMonth() === acum.getMonth() && d.getFullYear() === acum.getFullYear()) {
      programariLunaPerSalon.set(k, (programariLunaPerSalon.get(k) || 0) + 1);
    }
  });

  // Rating agregat per salon, din recenziile reale
  const ratingAcc = new Map<string, { suma: number; nr: number }>();
  (recenziiRaw || []).forEach((r: any) => {
    const k = String(r.salon_id);
    const cur = ratingAcc.get(k) || { suma: 0, nr: 0 };
    ratingAcc.set(k, { suma: cur.suma + (Number(r.rating) || 0), nr: cur.nr + 1 });
  });

  const clienti: AdminClient[] = (profiluriRaw || [])
    .filter((p: any) => p.tip === "client")
    .map((p: any) => ({
      id: p.id,
      nume: p.nume || "Client",
      telefon: p.telefon || "—",
      nrAnimale: animaleCount.get(p.id) || 0,
      nrProgramari: programariPerUser.get(p.id) || 0,
      dataInregistrare: p.created_at || new Date().toISOString(),
    }));

  const saloane: AdminSalon[] = (saloaneRaw || []).map((s: any) => {
    const owner = profMap.get(s.user_id);
    const k = String(s.id);
    const agg = ratingAcc.get(k);
    const st = stareTrial(s.trial_expira_la, s.abonament_activ);
    return {
      id: k,
      nume: s.nume || "Salon",
      oras: s.oras || "—",
      telefon: s.telefon || owner?.telefon || "—",
      domeniu: (s.domeniu === "infrumusetare" ? "infrumusetare" : "grooming") as Vertical,
      plan: (["basic", "pro", "business"].includes(s.plan) ? s.plan : "basic") as PlanId,
      stare: st.stare,
      zileRamase: st.stare === "trial" ? st.zileRamase : 0,
      zileDeLaExpirare: st.stare === "expirat" ? st.zileDeLaExpirare : 0,
      trialExpiraLa: s.trial_expira_la || null,
      nrEchipa: Array.isArray(s.echipa) ? s.echipa.length : 0,
      nrServicii: Array.isArray(s.servicii) ? s.servicii.length : 0,
      specii: Array.isArray(s.specii) ? s.specii : [],
      nrProgramariLuna: programariLunaPerSalon.get(k) || 0,
      nrProgramariTotal: programariPerSalon.get(k) || 0,
      rating: agg ? Math.round((agg.suma / agg.nr) * 10) / 10 : 0,
      nrRecenzii: agg?.nr || 0,
      dataInregistrare: s.created_at || new Date().toISOString(),
    };
  });

  const salonMap = new Map<string, AdminSalon>();
  saloane.forEach(s => salonMap.set(s.id, s));

  const statusMap: Record<string, AdminProgramare["status"]> = {
    "confirmat": "confirmata",
    "în așteptare": "in_asteptare",
    "in asteptare": "in_asteptare",
    "finalizat": "finalizata",
    "anulat": "anulata",
  };

  const programari: AdminProgramare[] = (programariRaw || []).map((p: any) => {
    const owner = profMap.get(p.user_id);
    const salon = salonMap.get(String(p.salon_id));
    return {
      id: p.id,
      client: owner?.nume || "Client",
      salonId: String(p.salon_id),
      salon: salon?.nume || "Salon",
      oras: salon?.oras || "—",
      domeniu: salon?.domeniu ?? null,
      serviciu: p.serviciu || "—",
      pret: Number(p.pret) || 0,
      data: p.data ? new Date(`${p.data}T${p.ora || "00:00"}:00`).toISOString() : new Date().toISOString(),
      status: statusMap[p.status] || "in_asteptare",
    };
  });

  const recenzii: AdminRecenzie[] = (recenziiRaw || []).map((r: any) => {
    const salon = salonMap.get(String(r.salon_id));
    return {
      id: r.id,
      client: profMap.get(r.user_id)?.nume || "Client",
      salon: salon?.nume || "Salon",
      domeniu: salon?.domeniu ?? null,
      rating: Number(r.rating) || 0,
      text: r.text || "",
      data: r.created_at || new Date().toISOString(),
      raspuns: r.raspuns_salon || null,
    };
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return { clienti, saloane, programari, recenzii, tichete: TICHETE_DEMO };
}

/* ══════════════ Stiluri ══════════════ */

const btnGhost: React.CSSProperties = { background: "transparent", color: "#9CA3AF", border: "1px solid #2A2A2A", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
const btnLogout: React.CSSProperties = { background: "#FF6B00", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
const card: React.CSSProperties = { background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 22 };
const sectionTitle: React.CSSProperties = { fontSize: 20, fontWeight: 900, marginBottom: 18, color: "#fff" };
const subTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 };
const inputDark: React.CSSProperties = { background: "#0A0A0A", border: "1.5px solid #2A2A2A", color: "#fff", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontFamily: "Nunito, sans-serif", outline: "none" };
const tableCell: React.CSSProperties = { padding: "14px 16px", fontSize: 13, color: "#E5E7EB", borderBottom: "1px solid #1F1F1F" };
const tableHeadCell: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, background: "#0F0F0F", borderBottom: "1px solid #1F1F1F", textAlign: "left" };
const badge = (bg: string, color: string): React.CSSProperties => ({ background: bg, color, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800, display: "inline-block" });

/** Titlul unui tab, cu iconiță SVG în loc de emoji. */
function TitluTab({ Icon, children }: { Icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 style={{ ...sectionTitle, display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={21} strokeWidth={2.2} color="#FF6B00" />
      {children}
    </h2>
  );
}

/** Câmp de căutare cu lupă SVG în interior. */
function CautaInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
      <Search size={15} strokeWidth={2.2} color="#6B7280" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      <input style={{ ...inputDark, width: "100%", paddingLeft: 36, boxSizing: "border-box" }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function BadgeVerticala({ v }: { v: Vertical | null }) {
  if (!v) return <span style={{ color: "#6B7280" }}>—</span>;
  const col = VERT_COLOR[v];
  return <span style={{ ...badge("transparent", col), border: `1px solid ${col}66` }}>{VERT_SCURT[v]}</span>;
}

function BadgeStare({ s }: { s: AdminSalon }) {
  if (s.stare === "abonat") return <span style={badge("rgba(16,185,129,.15)", "#10B981")}>Abonat</span>;
  if (s.stare === "expirat") return <span style={badge("rgba(239,68,68,.15)", "#F87171")}>Expirat de {s.zileDeLaExpirare} z</span>;
  const aproape = s.zileRamase <= ZILE_AVERTISMENT;
  return <span style={badge(aproape ? "rgba(251,146,60,.18)" : "rgba(59,130,246,.15)", aproape ? "#FB923C" : "#60A5FA")}>Trial · {s.zileRamase} z</span>;
}

/** Bară de proporție simplă, folosită în mai multe carduri. */
function Bara({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: "#E5E7EB", fontWeight: 700 }}>{label}</span>
        <span style={{ color: "#9CA3AF" }}>{count} ({pct}%)</span>
      </div>
      <div style={{ width: "100%", height: 8, background: "#1F1F1F", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

function GolCard({ text }: { text: string }) {
  return <div style={{ textAlign: "center", color: "#6B7280", fontSize: 13, padding: "34px 0" }}>{text}</div>;
}

/* ══════════════ OVERVIEW ══════════════ */

function OverviewTab({ data, tot, vert }: { data: AdminData; tot: AdminData; vert: FiltruVert }) {
  const azi = new Date().toDateString();
  const acum = new Date();
  const programariAzi = data.programari.filter(p => new Date(p.data).toDateString() === azi).length;
  const programariLuna = data.programari.filter(p => { const d = new Date(p.data); return d.getMonth() === acum.getMonth() && d.getFullYear() === acum.getFullYear(); }).length;

  const pretLunar: Record<PlanId, number> = { basic: 69, pro: 119, business: 219 };
  const abonati = data.saloane.filter(s => s.stare === "abonat");
  const inTrial = data.saloane.filter(s => s.stare === "trial");
  const expirate = data.saloane.filter(s => s.stare === "expirat");
  const mrrReal = abonati.reduce((sum, s) => sum + pretLunar[s.plan], 0);
  const mrrPotential = inTrial.reduce((sum, s) => sum + pretLunar[s.plan], 0);

  const cuAnimal = tot.clienti.filter(c => c.nrAnimale > 0).length;
  const nrRecenzii = data.recenzii.length;
  const ratingMediu = nrRecenzii ? (data.recenzii.reduce((s, r) => s + r.rating, 0) / nrRecenzii).toFixed(2) : "—";

  const KPI = [
    { label: "Saloane partenere", val: data.saloane.length, sub: vert === "toate" ? `${tot.saloane.filter(s => s.domeniu === "infrumusetare").length} înfrumusețare · ${tot.saloane.filter(s => s.domeniu === "grooming").length} grooming` : VERTICAL[vert as Vertical].eticheta, color: "#3B82F6" },
    { label: "Clienți înregistrați", val: tot.clienti.length, sub: `${cuAnimal} cu animal · ${tot.clienti.length - cuAnimal} fără`, color: "#10B981" },
    { label: "Programări azi", val: programariAzi, sub: `${programariLuna} luna aceasta`, color: "#FF6B00" },
    { label: "MRR real (încasat)", val: `${mrrReal} RON`, sub: abonati.length ? `${abonati.length} saloane abonate` : "Stripe neconectat — nimeni nu plătește încă", color: mrrReal > 0 ? "#A855F7" : "#6B7280" },
    { label: "MRR potențial", val: `${mrrPotential} RON`, sub: `dacă cele ${inTrial.length} trialuri convertesc`, color: "#FBBF24" },
    { label: "Trialuri expirate", val: expirate.length, sub: expirate.length ? "de contactat" : "niciunul", color: expirate.length ? "#EF4444" : "#6B7280" },
    { label: "Rating mediu", val: ratingMediu === "—" ? "—" : <Nota val={ratingMediu} size={22} />, sub: `${nrRecenzii} recenzii reale`, color: "#FBBF24" },
    { label: "Total programări", val: data.programari.length, sub: "din toată istoria", color: "#06B6D4" },
  ];

  // Înscrieri pe lună — calculate din created_at, nu inventate.
  const luniLabel = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];
  const ultimele6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(acum.getFullYear(), acum.getMonth() - (5 - i), 1);
    const cheie = `${d.getFullYear()}-${d.getMonth()}`;
    return { cheie, label: luniLabel[d.getMonth()], saloane: 0, clienti: 0 };
  });
  const idx = new Map(ultimele6.map((x, i) => [x.cheie, i]));
  data.saloane.forEach(s => { const d = new Date(s.dataInregistrare); const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`); if (i !== undefined) ultimele6[i].saloane++; });
  tot.clienti.forEach(c => { const d = new Date(c.dataInregistrare); const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`); if (i !== undefined) ultimele6[i].clienti++; });
  const maxInscrieri = Math.max(...ultimele6.map(x => Math.max(x.saloane, x.clienti)), 1);

  return (
    <div>
      <TitluTab Icon={BarChart3}>Vedere de ansamblu</TitluTab>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        {KPI.map((k, i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.color, marginBottom: 4, lineHeight: 1.1 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20 }}>
        {/* Verticale */}
        <div style={card}>
          <div style={subTitle}>Împărțire pe verticale</div>
          {tot.saloane.length === 0 ? <GolCard text="Niciun salon înregistrat încă." /> : (
            <>
              {(["infrumusetare", "grooming"] as Vertical[]).map(v => (
                <Bara key={v} label={VERTICAL[v].eticheta} count={tot.saloane.filter(s => s.domeniu === v).length} total={tot.saloane.length} color={VERT_COLOR[v]} />
              ))}
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 4, lineHeight: 1.5 }}>
                Verticala se alege la înregistrare și se scrie în <code style={{ color: "#9CA3AF" }}>saloane.domeniu</code>. Un salon nu poate avea ambele.
              </div>
            </>
          )}
        </div>

        {/* Stare trial */}
        <div style={card}>
          <div style={subTitle}>Starea saloanelor</div>
          {data.saloane.length === 0 ? <GolCard text="Niciun salon pe filtrul curent." /> : (
            <>
              <Bara label="În trial" count={inTrial.length} total={data.saloane.length} color="#60A5FA" />
              <Bara label="Trial expirat" count={expirate.length} total={data.saloane.length} color="#F87171" />
              <Bara label="Abonate (plătesc)" count={abonati.length} total={data.saloane.length} color="#10B981" />
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 4, lineHeight: 1.5 }}>
                Trial {ZILE_TRIAL} zile · ștergerea datelor la {ZILE_TRIAL + ZILE_PANA_LA_STERGERE} zile. „Abonat" apare doar când <code style={{ color: "#9CA3AF" }}>abonament_activ</code> devine true (Stripe).
              </div>
            </>
          )}
        </div>

        {/* Planuri */}
        <div style={card}>
          <div style={subTitle}>Distribuție planuri</div>
          {data.saloane.length === 0 ? <GolCard text="Niciun salon pe filtrul curent." /> : (
            (["basic", "pro", "business"] as PlanId[]).map(plan => (
              <Bara key={plan} label={plan[0].toUpperCase() + plan.slice(1)} count={data.saloane.filter(s => s.plan === plan).length} total={data.saloane.length}
                color={plan === "business" ? "#A855F7" : plan === "pro" ? "#FF6B00" : "#6B7280"} />
            ))
          )}
        </div>

        {/* Înscrieri */}
        <div style={{ ...card, gridColumn: "1 / -1" }}>
          <div style={subTitle}>Înscrieri — ultimele 6 luni (date reale)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 200, padding: "16px 0" }}>
            {ultimele6.map((f, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>{f.saloane}s / {f.clienti}c</div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", width: "100%", height: 140 }}>
                  <div title="Saloane" style={{ flex: 1, height: `${(f.saloane / maxInscrieri) * 140}px`, background: "linear-gradient(180deg, #FF6B00 0%, #E05A00 100%)", borderRadius: "6px 6px 0 0", minHeight: 3 }} />
                  <div title="Clienți" style={{ flex: 1, height: `${(f.clienti / maxInscrieri) * 140}px`, background: "linear-gradient(180deg, #10B981 0%, #059669 100%)", borderRadius: "6px 6px 0 0", minHeight: 3 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>{f.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9CA3AF" }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#FF6B00", borderRadius: 2, marginRight: 6 }} />Saloane</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#10B981", borderRadius: 2, marginRight: 6 }} />Clienți</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ CLIENȚI ══════════════ */

function ClientiTab({ data }: { data: AdminData }) {
  const [search, setSearch] = useState("");
  const [filtruCont, setFiltruCont] = useState<"" | "cu-animal" | "fara-animal">("");

  const filtered = useMemo(() => data.clienti.filter(c =>
    c.nume.toLowerCase().includes(search.toLowerCase()) &&
    (filtruCont === "" || (filtruCont === "cu-animal" ? c.nrAnimale > 0 : c.nrAnimale === 0))
  ), [data.clienti, search, filtruCont]);

  const cuAnimal = data.clienti.filter(c => c.nrAnimale > 0).length;

  return (
    <div>
      <TitluTab Icon={Users}>Clienți ({data.clienti.length})</TitluTab>
      <div style={{ ...card, marginBottom: 16, padding: "14px 18px", fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.6 }}>
        Un cont de client nu aparține unei verticale. <strong style={{ color: "#E5E7EB" }}>{cuAnimal}</strong> clienți au cel puțin un animal — ei pot rezerva și la grooming, și la înfrumusețare.
        Ceilalți <strong style={{ color: "#E5E7EB" }}>{data.clienti.length - cuAnimal}</strong> văd doar lumea de înfrumusețare, până își adaugă un animal.
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <CautaInput value={search} onChange={setSearch} placeholder="Caută după nume..." />
        <select style={inputDark} value={filtruCont} onChange={e => setFiltruCont(e.target.value as any)}>
          <option value="">Toate conturile</option>
          <option value="cu-animal">Cu animal (grooming + înfrumusețare)</option>
          <option value="fara-animal">Fără animal (doar înfrumusețare)</option>
        </select>
      </div>
      <div style={{ ...card, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead><tr>
            <th style={tableHeadCell}>Nume</th><th style={tableHeadCell}>Telefon</th><th style={tableHeadCell}>Tip cont</th><th style={tableHeadCell}>Animale</th><th style={tableHeadCell}>Programări</th><th style={tableHeadCell}>Înregistrat</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ ...tableCell, fontWeight: 700 }}>{c.nume}</td>
                <td style={{ ...tableCell, color: "#9CA3AF" }}>{c.telefon}</td>
                <td style={tableCell}>
                  {c.nrAnimale > 0
                    ? <span style={badge("rgba(59,130,246,.15)", "#60A5FA")}>Cu animal</span>
                    : <span style={badge("rgba(236,72,153,.15)", "#F472B6")}>Doar înfrumusețare</span>}
                </td>
                <td style={tableCell}>{c.nrAnimale}</td>
                <td style={tableCell}>{c.nrProgramari}</td>
                <td style={{ ...tableCell, color: "#9CA3AF", fontSize: 12 }}>{new Date(c.dataInregistrare).toLocaleDateString("ro-RO")}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ ...tableCell, textAlign: "center", color: "#6B7280", padding: 40 }}>Niciun rezultat</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════ SALOANE ══════════════ */

function SaloaneTab({ data }: { data: AdminData }) {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStare, setFilterStare] = useState("");
  const [filterOras, setFilterOras] = useState("");
  const [deschis, setDeschis] = useState<string | null>(null);

  const filtered = useMemo(() => data.saloane.filter(s =>
    s.nume.toLowerCase().includes(search.toLowerCase()) &&
    (filterPlan === "" || s.plan === filterPlan) &&
    (filterStare === "" || s.stare === filterStare) &&
    (filterOras === "" || s.oras === filterOras)
  ), [data.saloane, search, filterPlan, filterStare, filterOras]);

  return (
    <div>
      <TitluTab Icon={Scissors}>Saloane partenere ({data.saloane.length})</TitluTab>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <CautaInput value={search} onChange={setSearch} placeholder="Caută salon..." />
        <select style={inputDark} value={filterOras} onChange={e => setFilterOras(e.target.value)}>
          <option value="">Toate orașele</option>
          {[...new Set(data.saloane.map(s => s.oras))].sort().map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select style={inputDark} value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
          <option value="">Toate planurile</option><option value="basic">Basic</option><option value="pro">Pro</option><option value="business">Business</option>
        </select>
        <select style={inputDark} value={filterStare} onChange={e => setFilterStare(e.target.value)}>
          <option value="">Toate stările</option><option value="trial">În trial</option><option value="expirat">Trial expirat</option><option value="abonat">Abonat</option>
        </select>
      </div>
      <div style={{ ...card, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead><tr>
            <th style={tableHeadCell}>Salon</th><th style={tableHeadCell}>Verticală</th><th style={tableHeadCell}>Oraș</th><th style={tableHeadCell}>Plan</th><th style={tableHeadCell}>Stare</th><th style={tableHeadCell}>Echipă</th><th style={tableHeadCell}>Progr./lună</th><th style={tableHeadCell}>Rating</th><th style={tableHeadCell}></th>
          </tr></thead>
          <tbody>
            {filtered.map(s => {
              const planColor = s.plan === "business" ? "#A855F7" : s.plan === "pro" ? "#FF6B00" : "#6B7280";
              const expandat = deschis === s.id;
              return (
                <Fragment key={s.id}>
                  <tr>
                    <td style={{ ...tableCell, fontWeight: 700 }}>{s.nume}<div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{s.telefon}</div></td>
                    <td style={tableCell}><BadgeVerticala v={s.domeniu} /></td>
                    <td style={tableCell}>{s.oras}</td>
                    <td style={tableCell}><span style={{ ...badge("transparent", planColor), border: `1px solid ${planColor}`, textTransform: "capitalize" }}>{s.plan}</span></td>
                    <td style={tableCell}><BadgeStare s={s} /></td>
                    <td style={tableCell}>{s.nrEchipa || "—"}</td>
                    <td style={tableCell}>{s.nrProgramariLuna}</td>
                    <td style={{ ...tableCell, color: s.nrRecenzii ? "#FBBF24" : "#6B7280", fontWeight: 700 }}>{s.nrRecenzii ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Nota val={s.rating} size={13} /> ({s.nrRecenzii})</span> : "—"}</td>
                    <td style={tableCell}>
                      <button onClick={() => setDeschis(expandat ? null : s.id)} style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#9CA3AF", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito" }}>{expandat ? "Închide" : "Detalii"}</button>
                    </td>
                  </tr>
                  {expandat && (
                    <tr>
                      <td colSpan={9} style={{ ...tableCell, background: "#0A0A0A" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, fontSize: 12.5 }}>
                          {[
                            ["Verticală", VERTICAL[s.domeniu].eticheta],
                            ["Rol echipă", `${s.nrEchipa} ${VERTICAL[s.domeniu].rolPl}`],
                            ["Servicii definite", String(s.nrServicii)],
                            ["Programări total", String(s.nrProgramariTotal)],
                            ["Înregistrat", new Date(s.dataInregistrare).toLocaleDateString("ro-RO")],
                            ["Trial expiră", s.trialExpiraLa ? new Date(s.trialExpiraLa).toLocaleDateString("ro-RO") : "— (salon vechi, fără trial)"],
                            ...(s.domeniu === "grooming" ? [["Specii acceptate", s.specii.length ? s.specii.join(", ") : "niciuna bifată"] as [string, string]] : []),
                          ].map(([k, v]) => (
                            <div key={k}>
                              <div style={{ color: "#6B7280", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: .6, marginBottom: 3 }}>{k}</div>
                              <div style={{ color: "#E5E7EB", fontWeight: 700 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={9} style={{ ...tableCell, textAlign: "center", color: "#6B7280", padding: 40 }}>Niciun rezultat</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ ...card, marginTop: 16, padding: "14px 18px", fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.6 }}>
        Tabelul e doar de citire. Suspendarea și reactivarea unui salon vor fi posibile când există Stripe — până atunci nu avem în bază o coloană de stare pe care să scriem.
      </div>
    </div>
  );
}

/* ══════════════ PROGRAMĂRI ══════════════ */

const STATUS_COLOR: Record<AdminProgramare["status"], string> = { confirmata: "#3B82F6", finalizata: "#10B981", anulata: "#F87171", in_asteptare: "#FBBF24" };
const STATUS_LABEL: Record<AdminProgramare["status"], string> = { confirmata: "Confirmată", finalizata: "Finalizată", anulata: "Anulată", in_asteptare: "În așteptare" };

type RandSalon = {
  id: string; nume: string; oras: string; domeniu: Vertical | null;
  total: number; finalizate: number; confirmate: number; inAsteptare: number; anulate: number;
  lunaAsta: number; volum: number; ultima: string | null;
};

function ProgramariTab({ data }: { data: AdminData }) {
  const [detalii, setDetalii] = useState(false);
  const [filterOras, setFilterOras] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortare, setSortare] = useState<"finalizate" | "total" | "volum" | "nume">("finalizate");

  const acum = new Date();

  // ── Rezumat pe salon ──
  const perSalon: RandSalon[] = useMemo(() => {
    const harta = new Map<string, RandSalon>();
    // Pornim de la saloane, ca să apară și cele cu 0 programări.
    data.saloane.forEach(s => harta.set(s.id, {
      id: s.id, nume: s.nume, oras: s.oras, domeniu: s.domeniu,
      total: 0, finalizate: 0, confirmate: 0, inAsteptare: 0, anulate: 0, lunaAsta: 0, volum: 0, ultima: null,
    }));

    data.programari.forEach(p => {
      let r = harta.get(p.salonId);
      if (!r) {
        // Programare al cărei salon a fost șters — o păstrăm, ca să nu dispară din totaluri.
        r = { id: p.salonId, nume: `${p.salon} (șters)`, oras: p.oras, domeniu: p.domeniu, total: 0, finalizate: 0, confirmate: 0, inAsteptare: 0, anulate: 0, lunaAsta: 0, volum: 0, ultima: null };
        harta.set(p.salonId, r);
      }
      r.total++;
      if (p.status === "finalizata") { r.finalizate++; r.volum += p.pret; }
      else if (p.status === "confirmata") r.confirmate++;
      else if (p.status === "in_asteptare") r.inAsteptare++;
      else if (p.status === "anulata") r.anulate++;

      const d = new Date(p.data);
      if (d.getMonth() === acum.getMonth() && d.getFullYear() === acum.getFullYear()) r.lunaAsta++;
      if (!r.ultima || p.data > r.ultima) r.ultima = p.data;
    });

    return [...harta.values()];
  }, [data.saloane, data.programari]);

  const randuri = useMemo(() => {
    const f = perSalon.filter(r => filterOras === "" || r.oras === filterOras);
    return f.sort((a, b) =>
      sortare === "nume" ? a.nume.localeCompare(b.nume, "ro")
        : sortare === "volum" ? b.volum - a.volum
        : sortare === "total" ? b.total - a.total
        : b.finalizate - a.finalizate
    );
  }, [perSalon, filterOras, sortare]);

  // ── Totaluri ──
  const T = {
    total: data.programari.length,
    finalizate: data.programari.filter(p => p.status === "finalizata").length,
    confirmate: data.programari.filter(p => p.status === "confirmata").length,
    inAsteptare: data.programari.filter(p => p.status === "in_asteptare").length,
    anulate: data.programari.filter(p => p.status === "anulata").length,
  };
  const volumTotal = data.programari.filter(p => p.status === "finalizata").reduce((s, p) => s + p.pret, 0);
  const saloaneActive = perSalon.filter(r => r.total > 0).length;
  const rataFinalizare = T.total ? Math.round((T.finalizate / T.total) * 100) : 0;

  // ── Lista detaliată (opțională) ──
  const detaliate = useMemo(() => data.programari
    .filter(p => (filterStatus === "" || p.status === filterStatus) && (filterOras === "" || p.oras === filterOras))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()), [data.programari, filterStatus, filterOras]);

  const KPI = [
    { label: "Programări finalizate", val: T.finalizate, sub: `${rataFinalizare}% din toate`, color: "#10B981" },
    { label: "Total programări", val: T.total, sub: `în ${saloaneActive} saloane`, color: "#06B6D4" },
    { label: "În așteptare", val: T.inAsteptare, sub: `${T.confirmate} confirmate`, color: "#FBBF24" },
    { label: "Anulate", val: T.anulate, sub: T.total ? `${Math.round((T.anulate / T.total) * 100)}% din toate` : "—", color: T.anulate ? "#F87171" : "#6B7280" },
  ];

  return (
    <div>
      <TitluTab Icon={CalendarDays}>Programări — rezumat pe salon</TitluTab>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 22 }}>
        {KPI.map(k => (
          <div key={k.label} style={card}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.color, marginBottom: 4, lineHeight: 1.1 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select style={inputDark} value={filterOras} onChange={e => setFilterOras(e.target.value)}>
          <option value="">Toate orașele</option>
          {[...new Set(perSalon.map(r => r.oras))].filter(o => o && o !== "—").sort().map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select style={inputDark} value={sortare} onChange={e => setSortare(e.target.value as any)}>
          <option value="finalizate">Sortare: cele mai multe finalizate</option>
          <option value="total">Sortare: cele mai multe programări</option>
          <option value="volum">Sortare: volum încasat</option>
          <option value="nume">Sortare: alfabetic</option>
        </select>
        <div style={{ ...inputDark, border: "1.5px solid #1F1F1F", color: "#10B981", fontWeight: 800 }}>
          Volum finalizat: {volumTotal.toLocaleString("ro-RO")} RON
        </div>
      </div>

      {/* ── Tabelul de rezumat ── */}
      <div style={{ ...card, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead><tr>
            <th style={tableHeadCell}>Salon</th>
            <th style={tableHeadCell}>Verticală</th>
            <th style={tableHeadCell}>Oraș</th>
            <th style={tableHeadCell}>Finalizate</th>
            <th style={tableHeadCell}>Confirmate</th>
            <th style={tableHeadCell}>În așteptare</th>
            <th style={tableHeadCell}>Anulate</th>
            <th style={tableHeadCell}>Total</th>
            <th style={tableHeadCell}>Luna asta</th>
            <th style={tableHeadCell}>Volum</th>
            <th style={tableHeadCell}>Ultima</th>
          </tr></thead>
          <tbody>
            {randuri.map(r => (
              <tr key={r.id} style={{ opacity: r.total === 0 ? .55 : 1 }}>
                <td style={{ ...tableCell, fontWeight: 700 }}>{r.nume}</td>
                <td style={tableCell}><BadgeVerticala v={r.domeniu} /></td>
                <td style={tableCell}>{r.oras}</td>
                <td style={{ ...tableCell, fontWeight: 900, color: r.finalizate ? "#10B981" : "#6B7280" }}>{r.finalizate}</td>
                <td style={{ ...tableCell, color: r.confirmate ? "#60A5FA" : "#6B7280" }}>{r.confirmate}</td>
                <td style={{ ...tableCell, color: r.inAsteptare ? "#FBBF24" : "#6B7280" }}>{r.inAsteptare}</td>
                <td style={{ ...tableCell, color: r.anulate ? "#F87171" : "#6B7280" }}>{r.anulate}</td>
                <td style={{ ...tableCell, fontWeight: 800 }}>{r.total}</td>
                <td style={tableCell}>{r.lunaAsta}</td>
                <td style={{ ...tableCell, fontWeight: 700, color: r.volum ? "#10B981" : "#6B7280" }}>{r.volum ? `${r.volum.toLocaleString("ro-RO")} RON` : "—"}</td>
                <td style={{ ...tableCell, color: "#9CA3AF", fontSize: 12 }}>{r.ultima ? new Date(r.ultima).toLocaleDateString("ro-RO") : "—"}</td>
              </tr>
            ))}
            {randuri.length === 0 && <tr><td colSpan={11} style={{ ...tableCell, textAlign: "center", color: "#6B7280", padding: 40 }}>Niciun salon pe filtrul curent</td></tr>}
          </tbody>
          {randuri.length > 0 && (
            <tfoot>
              <tr style={{ background: "#0F0F0F" }}>
                <td style={{ ...tableCell, fontWeight: 900, borderBottom: "none" }}>TOTAL ({randuri.length} saloane)</td>
                <td style={{ ...tableCell, borderBottom: "none" }} colSpan={2} />
                <td style={{ ...tableCell, fontWeight: 900, color: "#10B981", borderBottom: "none" }}>{randuri.reduce((s, r) => s + r.finalizate, 0)}</td>
                <td style={{ ...tableCell, fontWeight: 800, color: "#60A5FA", borderBottom: "none" }}>{randuri.reduce((s, r) => s + r.confirmate, 0)}</td>
                <td style={{ ...tableCell, fontWeight: 800, color: "#FBBF24", borderBottom: "none" }}>{randuri.reduce((s, r) => s + r.inAsteptare, 0)}</td>
                <td style={{ ...tableCell, fontWeight: 800, color: "#F87171", borderBottom: "none" }}>{randuri.reduce((s, r) => s + r.anulate, 0)}</td>
                <td style={{ ...tableCell, fontWeight: 900, borderBottom: "none" }}>{randuri.reduce((s, r) => s + r.total, 0)}</td>
                <td style={{ ...tableCell, fontWeight: 800, borderBottom: "none" }}>{randuri.reduce((s, r) => s + r.lunaAsta, 0)}</td>
                <td style={{ ...tableCell, fontWeight: 900, color: "#10B981", borderBottom: "none" }}>{randuri.reduce((s, r) => s + r.volum, 0).toLocaleString("ro-RO")} RON</td>
                <td style={{ ...tableCell, borderBottom: "none" }} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div style={{ ...card, marginTop: 16, padding: "14px 18px", fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.6 }}>
        Saloanele fără nicio programare apar estompate, ca să vezi imediat cine s-a înscris și nu folosește platforma.
        „Volum" e banii încasați de salon de la clienții lui, nu venitul CalyHub — noi luăm 0% comision, venitul nostru e doar abonamentul.
      </div>

      {/* ── Lista detaliată, la cerere ── */}
      <button onClick={() => setDetalii(d => !d)} style={{ ...btnGhost, marginTop: 16, padding: "10px 18px", fontSize: 13 }}>
        {detalii ? <ChevronUp size={14} strokeWidth={2.4} /> : <ChevronDown size={14} strokeWidth={2.4} />}
        {detalii ? "Ascunde lista detaliată" : `Vezi lista detaliată (${data.programari.length} programări)`}
      </button>

      {detalii && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <select style={inputDark} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Toate statusurile</option>
              {(Object.keys(STATUS_LABEL) as AdminProgramare["status"][]).map(k => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
            </select>
          </div>
          <div style={{ ...card, padding: 0, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead><tr>
                <th style={tableHeadCell}>Data</th><th style={tableHeadCell}>Client</th><th style={tableHeadCell}>Salon</th><th style={tableHeadCell}>Verticală</th><th style={tableHeadCell}>Oraș</th><th style={tableHeadCell}>Serviciu</th><th style={tableHeadCell}>Preț</th><th style={tableHeadCell}>Status</th>
              </tr></thead>
              <tbody>
                {detaliate.slice(0, 100).map(p => (
                  <tr key={p.id}>
                    <td style={{ ...tableCell, color: "#9CA3AF", fontSize: 12 }}>{new Date(p.data).toLocaleString("ro-RO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ ...tableCell, fontWeight: 700 }}>{p.client}</td>
                    <td style={tableCell}>{p.salon}</td>
                    <td style={tableCell}><BadgeVerticala v={p.domeniu} /></td>
                    <td style={tableCell}>{p.oras}</td>
                    <td style={{ ...tableCell, color: "#9CA3AF" }}>{p.serviciu}</td>
                    <td style={{ ...tableCell, fontWeight: 700, color: "#10B981" }}>{p.pret} RON</td>
                    <td style={tableCell}><span style={badge(`${STATUS_COLOR[p.status]}22`, STATUS_COLOR[p.status])}>{STATUS_LABEL[p.status]}</span></td>
                  </tr>
                ))}
                {detaliate.length === 0 && <tr><td colSpan={8} style={{ ...tableCell, textAlign: "center", color: "#6B7280", padding: 40 }}>Nicio programare</td></tr>}
              </tbody>
            </table>
            {detaliate.length > 100 && <div style={{ padding: "14px 16px", fontSize: 12, color: "#6B7280", textAlign: "center" }}>Afișate 100 din {detaliate.length} programări</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════ ABONAMENTE ══════════════ */

function AbonamenteTab({ data }: { data: AdminData }) {
  const pretLunar: Record<PlanId, number> = { basic: 69, pro: 119, business: 219 };

  const stats = (["basic", "pro", "business"] as PlanId[]).map(p => {
    const abonati = data.saloane.filter(s => s.plan === p && s.stare === "abonat");
    const trial = data.saloane.filter(s => s.plan === p && s.stare === "trial");
    return { plan: p, abonati: abonati.length, trial: trial.length, mrr: abonati.length * pretLunar[p], potential: trial.length * pretLunar[p] };
  });
  const totalMRR = stats.reduce((s, x) => s + x.mrr, 0);
  const totalPotential = stats.reduce((s, x) => s + x.potential, 0);

  const inTrial = data.saloane.filter(s => s.stare === "trial");
  const expirate = data.saloane.filter(s => s.stare === "expirat");
  const abonate = data.saloane.filter(s => s.stare === "abonat");
  const terminate = inTrial.length + expirate.length + abonate.length;
  const conversie = (expirate.length + abonate.length) > 0
    ? Math.round((abonate.length / (expirate.length + abonate.length)) * 100) : null;

  return (
    <div>
      <TitluTab Icon={CreditCard}>Abonamente & venituri</TitluTab>

      <div style={{ ...card, marginBottom: 20, background: "rgba(239,68,68,.08)", borderColor: "rgba(239,68,68,.3)" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#F87171", marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}><AlertTriangle size={15} strokeWidth={2.4} /> Nu se încasează nimic încă</div>
        <p style={{ fontSize: 13, color: "#E5E7EB", lineHeight: 1.6, margin: 0 }}>
          Stripe nu e conectat. Un salon devine „abonat" doar când <code style={{ color: "#9CA3AF" }}>saloane.abonament_activ</code> devine true,
          ceea ce va face webhook-ul Stripe la prima plată reușită. Până atunci MRR-ul real e 0 — cifrele de mai jos separă
          explicit <strong>încasat</strong> de <strong>potențial</strong>, ca să nu ne mințim singuri.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={{ ...card, background: totalMRR > 0 ? "linear-gradient(135deg, #FF6B00 0%, #E05A00 100%)" : "#111", border: totalMRR > 0 ? "none" : "1px solid #1F1F1F" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: totalMRR > 0 ? "rgba(255,255,255,.85)" : "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>MRR real — încasat</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: totalMRR > 0 ? "#fff" : "#6B7280", marginBottom: 4 }}>{totalMRR.toLocaleString("ro-RO")} RON</div>
          <div style={{ fontSize: 12, color: totalMRR > 0 ? "rgba(255,255,255,.85)" : "#6B7280" }}>ARR: {(totalMRR * 12).toLocaleString("ro-RO")} RON / an</div>
        </div>
        <div style={card}><div style={subTitle}>MRR potențial (trialuri)</div><div style={{ fontSize: 28, fontWeight: 900, color: "#FBBF24" }}>{totalPotential.toLocaleString("ro-RO")} RON</div><div style={{ fontSize: 12, color: "#6B7280" }}>dacă toate cele {inTrial.length} convertesc</div></div>
        <div style={card}><div style={subTitle}>În trial acum</div><div style={{ fontSize: 28, fontWeight: 900, color: "#60A5FA" }}>{inTrial.length}</div><div style={{ fontSize: 12, color: "#6B7280" }}>{inTrial.filter(s => s.zileRamase <= ZILE_AVERTISMENT).length} expiră în ≤{ZILE_AVERTISMENT} zile</div></div>
        <div style={card}><div style={subTitle}>Rată de conversie</div><div style={{ fontSize: 28, fontWeight: 900, color: conversie === null ? "#6B7280" : "#10B981" }}>{conversie === null ? "—" : `${conversie}%`}</div><div style={{ fontSize: 12, color: "#6B7280" }}>{conversie === null ? "niciun trial încheiat încă" : `${abonate.length} din ${expirate.length + abonate.length} trialuri încheiate`}</div></div>
      </div>

      <div style={{ ...card, marginBottom: 20 }}>
        <div style={subTitle}>Pâlnia trialului</div>
        {terminate === 0 ? <GolCard text="Niciun salon înregistrat pe filtrul curent." /> : (
          <>
            <Bara label="În trial" count={inTrial.length} total={terminate} color="#60A5FA" />
            <Bara label="Trial expirat, nu a ales plan" count={expirate.length} total={terminate} color="#F87171" />
            <Bara label="A ales plan și plătește" count={abonate.length} total={terminate} color="#10B981" />
          </>
        )}
      </div>

      <div style={{ ...card, marginBottom: 20 }}>
        <div style={subTitle}>Defalcare pe plan</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead><tr><th style={tableHeadCell}>Plan</th><th style={tableHeadCell}>Preț/lună</th><th style={tableHeadCell}>Abonate</th><th style={tableHeadCell}>MRR real</th><th style={tableHeadCell}>În trial</th><th style={tableHeadCell}>MRR potențial</th></tr></thead>
            <tbody>
              {stats.map(s => {
                const planColor = s.plan === "business" ? "#A855F7" : s.plan === "pro" ? "#FF6B00" : "#6B7280";
                return (
                  <tr key={s.plan}>
                    <td style={{ ...tableCell, textTransform: "capitalize", fontWeight: 700, color: planColor }}>{s.plan}</td>
                    <td style={tableCell}>{pretLunar[s.plan]} RON</td>
                    <td style={tableCell}>{s.abonati}</td>
                    <td style={{ ...tableCell, fontWeight: 800, color: s.mrr ? "#10B981" : "#6B7280" }}>{s.mrr} RON</td>
                    <td style={tableCell}>{s.trial}</td>
                    <td style={{ ...tableCell, color: "#FBBF24", fontWeight: 700 }}>{s.potential} RON</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 12, lineHeight: 1.5 }}>
          Prețurile sunt cele lunare din <code style={{ color: "#9CA3AF" }}>lib/planuri.ts</code>. Aceleași pentru ambele verticale — diferă doar formularea caracteristicilor.
        </div>
      </div>

      {/* ── Ce salon are ce plan ── */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "22px 22px 0" }}><div style={subTitle}>Saloanele pe fiecare plan</div></div>
        {data.saloane.length === 0 ? <div style={{ padding: "0 22px 22px" }}><GolCard text="Niciun salon pe filtrul curent." /></div> : (
          <div style={{ padding: "0 0 8px" }}>
            {(["business", "pro", "basic"] as PlanId[]).map(plan => {
              const lista = data.saloane.filter(s => s.plan === plan)
                .sort((a, b) => (a.stare === b.stare ? a.nume.localeCompare(b.nume, "ro") : a.stare === "abonat" ? -1 : b.stare === "abonat" ? 1 : a.stare === "trial" ? -1 : 1));
              const planColor = plan === "business" ? "#A855F7" : plan === "pro" ? "#FF6B00" : "#6B7280";
              const deschisImplicit = lista.length > 0;
              return (
                <details key={plan} open={deschisImplicit} style={{ borderTop: "1px solid #1F1F1F" }}>
                  <summary style={{ cursor: "pointer", padding: "14px 22px", display: "flex", alignItems: "center", gap: 10, listStyle: "none", flexWrap: "wrap" }}>
                    <span style={{ ...badge("transparent", planColor), border: `1px solid ${planColor}`, textTransform: "capitalize", fontSize: 12.5 }}>{plan}</span>
                    <span style={{ fontSize: 13, color: "#E5E7EB", fontWeight: 800 }}>{lista.length} {lista.length === 1 ? "salon" : "saloane"}</span>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>· {pretLunar[plan]} RON/lună</span>
                  </summary>
                  {lista.length === 0 ? (
                    <div style={{ padding: "0 22px 16px", fontSize: 12.5, color: "#6B7280" }}>Niciun salon pe acest plan.</div>
                  ) : (
                    <div style={{ overflowX: "auto", padding: "0 0 10px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                        <thead><tr>
                          <th style={tableHeadCell}>Salon</th><th style={tableHeadCell}>Verticală</th><th style={tableHeadCell}>Oraș</th><th style={tableHeadCell}>Stare</th><th style={tableHeadCell}>Echipă</th><th style={tableHeadCell}>Progr./lună</th><th style={tableHeadCell}>Înregistrat</th>
                        </tr></thead>
                        <tbody>
                          {lista.map(s => (
                            <tr key={s.id}>
                              <td style={{ ...tableCell, fontWeight: 700 }}>{s.nume}<div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{s.telefon}</div></td>
                              <td style={tableCell}><BadgeVerticala v={s.domeniu} /></td>
                              <td style={tableCell}>{s.oras}</td>
                              <td style={tableCell}><BadgeStare s={s} /></td>
                              <td style={tableCell}>{s.nrEchipa || "—"}</td>
                              <td style={tableCell}>{s.nrProgramariLuna}</td>
                              <td style={{ ...tableCell, color: "#9CA3AF", fontSize: 12 }}>{new Date(s.dataInregistrare).toLocaleDateString("ro-RO")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </details>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ ...card, marginTop: 16, padding: "14px 18px", fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.6 }}>
        Planul e cel salvat în <code style={{ color: "#E5E7EB" }}>saloane.plan</code> — ce a ales salonul la pasul de abonament sau din dashboard.
        Cât timp Stripe nu e conectat, un plan ales nu înseamnă plată: uită-te la coloana „Stare".
      </div>
    </div>
  );
}

/* ══════════════ RECENZII ══════════════ */

function Stele({ n, size = 15 }: { n: number; size?: number }) {
  const plin = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }} aria-label={`${n} din 5 stele`}>
      {[0, 1, 2, 3, 4].map(i => (
        <Star key={i} size={size} strokeWidth={2}
          color={i < plin ? "#FBBF24" : "#3F3F46"}
          fill={i < plin ? "#FBBF24" : "none"} />
      ))}
    </span>
  );
}

/** Nota medie: cifra + o stea SVG. */
function Nota({ val, color = "#FBBF24", size = 15 }: { val: number | string; color?: string; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color, fontWeight: 800 }}>
      {val}<Star size={size} strokeWidth={2} color={color} fill={color} />
    </span>
  );
}

/** Card de recenzie, folosit în lista unui salon. */
function CardRecenzie({ r }: { r: AdminRecenzie }) {
  return (
    <div style={{ background: "#0A0A0A", border: `1px solid ${r.rating <= 2 ? "rgba(239,68,68,.4)" : "#1F1F1F"}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>{r.client}</div>
          <div style={{ fontSize: 11.5, color: "#6B7280" }}>{new Date(r.data).toLocaleDateString("ro-RO")}</div>
        </div>
        <Stele n={r.rating} size={14} />
      </div>
      <p style={{ fontSize: 13.5, color: "#E5E7EB", lineHeight: 1.6, margin: 0 }}>{r.text || <em style={{ color: "#6B7280" }}>fără text</em>}</p>
      {r.raspuns ? (
        <div style={{ marginTop: 10, padding: 11, background: "#111", borderRadius: 8, border: "1px solid #1F1F1F" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: .6, marginBottom: 4 }}>Răspunsul salonului</div>
          <p style={{ fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.6, margin: 0 }}>{r.raspuns}</p>
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "#6B7280", fontStyle: "italic" }}>Salonul nu a răspuns încă.</div>
      )}
    </div>
  );
}

function RecenziiTab({ data }: { data: AdminData }) {
  const [sursa, setSursa] = useState<"saloane" | "aplicatie">("saloane");
  const [salonSel, setSalonSel] = useState<string | null>(null);
  const [cauta, setCauta] = useState("");
  const [sortare, setSortare] = useState<"recente" | "multe" | "slabe">("recente");

  // Grupare pe salon
  const grupuri = useMemo(() => {
    const h = new Map<string, { salon: string; domeniu: Vertical | null; recenzii: AdminRecenzie[] }>();
    data.recenzii.forEach(r => {
      const k = r.salon;
      if (!h.has(k)) h.set(k, { salon: k, domeniu: r.domeniu, recenzii: [] });
      h.get(k)!.recenzii.push(r);
    });
    return [...h.values()].map(g => {
      const nr = g.recenzii.length;
      const medie = nr ? g.recenzii.reduce((s, r) => s + r.rating, 0) / nr : 0;
      const ultima = g.recenzii.reduce((max, r) => (r.data > max ? r.data : max), g.recenzii[0].data);
      return {
        ...g,
        nr,
        medie: Math.round(medie * 10) / 10,
        negative: g.recenzii.filter(r => r.rating <= 2).length,
        faraRaspuns: g.recenzii.filter(r => !r.raspuns).length,
        ultima,
      };
    });
  }, [data.recenzii]);

  const listaSaloane = useMemo(() => {
    const f = grupuri.filter(g => g.salon.toLowerCase().includes(cauta.toLowerCase()));
    return f.sort((a, b) =>
      sortare === "multe" ? b.nr - a.nr
        : sortare === "slabe" ? a.medie - b.medie
        : b.ultima.localeCompare(a.ultima)
    );
  }, [grupuri, cauta, sortare]);

  const selectat = grupuri.find(g => g.salon === salonSel) || null;
  const totalNegative = data.recenzii.filter(r => r.rating <= 2).length;
  const totalFaraRaspuns = data.recenzii.filter(r => !r.raspuns).length;
  const medieGenerala = data.recenzii.length
    ? (data.recenzii.reduce((s, r) => s + r.rating, 0) / data.recenzii.length).toFixed(2) : "—";

  return (
    <div>
      <TitluTab Icon={Star}>Recenzii</TitluTab>

      {/* Comutator sursă */}
      <div style={{ display: "inline-flex", gap: 3, background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 10, padding: 3, marginBottom: 20 }}>
        {([
          { k: "saloane" as const, label: `Recenzii primite de saloane (${data.recenzii.length})` },
          { k: "aplicatie" as const, label: "Recenzii despre CalyHub" },
        ]).map(o => (
          <button key={o.k} onClick={() => setSursa(o.k)}
            style={{ background: sursa === o.k ? "#FF6B00" : "transparent", color: sursa === o.k ? "#fff" : "#9CA3AF", border: "none", padding: "9px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>{o.label}</button>
        ))}
      </div>

      {sursa === "aplicatie" ? (
        <div style={{ ...card, background: "rgba(251,191,36,.08)", borderColor: "rgba(251,191,36,.3)" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#FBBF24", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><Info size={17} strokeWidth={2.4} /> Nu există încă</div>
          <p style={{ fontSize: 13.5, color: "#E5E7EB", lineHeight: 1.7, marginTop: 0 }}>
            Recenziile de azi sunt <strong>despre saloane</strong> — clientul notează vizita, iar salonul poate răspunde.
            Nu există niciun loc în care cineva să evalueze <strong>platforma CalyHub</strong>, nici pentru clienți, nici pentru saloane.
          </p>
          <div style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.8 }}>
            Ca să apară aici date reale, e nevoie de trei lucruri:
            <ol style={{ margin: "10px 0 0", paddingLeft: 20 }}>
              <li>un tabel nou (<code style={{ color: "#E5E7EB" }}>recenzii_aplicatie</code>) cu rating, text, rolul autorului (client / salon) și data;</li>
              <li>un formular în dashboard — la client și la salon — care să întrebe, după câteva utilizări, cât de mulțumit e de CalyHub;</li>
              <li>ecranul acesta, care le adună și arată media, evoluția și ce spun cele slabe.</li>
            </ol>
          </div>
          <p style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.7, marginBottom: 0, marginTop: 14 }}>
            Notat în <code style={{ color: "#9CA3AF" }}>CLAUDE.md</code>. Are sens după lansare, când există utilizatori care chiar au folosit aplicația —
            înainte de asta ar răspunde doar conturile de test.
          </p>
        </div>
      ) : selectat ? (
        /* ── Recenziile unui salon ── */
        <div>
          <button onClick={() => setSalonSel(null)} style={{ ...btnGhost, marginBottom: 16, padding: "9px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} strokeWidth={2.4} /> Înapoi la toate saloanele</button>
          <div style={{ ...card, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 900, color: "#fff", marginBottom: 6 }}>{selectat.salon}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <BadgeVerticala v={selectat.domeniu} />
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>{selectat.nr} {selectat.nr === 1 ? "recenzie" : "recenzii"}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}><Nota val={selectat.medie} size={24} /></div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 5 }}>{selectat.negative} sub 3 stele · {selectat.faraRaspuns} fără răspuns</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {[...selectat.recenzii].sort((a, b) => b.data.localeCompare(a.data)).map(r => <CardRecenzie key={r.id} r={r} />)}
          </div>
        </div>
      ) : (
        /* ── Lista de saloane ── */
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Saloane cu recenzii", val: grupuri.length, sub: `din ${data.saloane.length} înregistrate`, color: "#3B82F6" },
              { label: "Total recenzii", val: data.recenzii.length, sub: medieGenerala === "—" ? "nicio notă încă" : `media ${medieGenerala} din 5`, color: "#FBBF24" },
              { label: "Sub 3 stele", val: totalNegative, sub: totalNegative ? "de urmărit" : "niciuna", color: totalNegative ? "#F87171" : "#6B7280" },
              { label: "Fără răspuns", val: totalFaraRaspuns, sub: "salonul nu a reacționat", color: totalFaraRaspuns ? "#FBBF24" : "#6B7280" },
            ].map(k => (
              <div key={k.label} style={card}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: k.color, marginBottom: 4, lineHeight: 1.1 }}>{k.val}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <CautaInput value={cauta} onChange={setCauta} placeholder="Caută salon..." />
            <select style={inputDark} value={sortare} onChange={e => setSortare(e.target.value as any)}>
              <option value="recente">Sortare: cea mai recentă recenzie</option>
              <option value="multe">Sortare: cele mai multe recenzii</option>
              <option value="slabe">Sortare: cea mai mică medie</option>
            </select>
          </div>

          {listaSaloane.length === 0 ? (
            <div style={card}><GolCard text={data.recenzii.length === 0 ? "Nicio recenzie încă. Apar aici imediat ce un client evaluează o vizită." : "Niciun salon nu corespunde căutării."} /></div>
          ) : (
            <div style={{ ...card, padding: 0, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead><tr>
                  <th style={tableHeadCell}>Salon</th><th style={tableHeadCell}>Verticală</th><th style={tableHeadCell}>Recenzii</th><th style={tableHeadCell}>Medie</th><th style={tableHeadCell}>Sub 3 stele</th><th style={tableHeadCell}>Fără răspuns</th><th style={tableHeadCell}>Ultima</th><th style={tableHeadCell}></th>
                </tr></thead>
                <tbody>
                  {listaSaloane.map(g => (
                    <tr key={g.salon} style={{ cursor: "pointer" }} onClick={() => setSalonSel(g.salon)}>
                      <td style={{ ...tableCell, fontWeight: 700 }}>{g.salon}</td>
                      <td style={tableCell}><BadgeVerticala v={g.domeniu} /></td>
                      <td style={{ ...tableCell, fontWeight: 800 }}>{g.nr}</td>
                      <td style={tableCell}><Nota val={g.medie} size={13} color={g.medie >= 4 ? "#10B981" : g.medie >= 3 ? "#FBBF24" : "#F87171"} /></td>
                      <td style={{ ...tableCell, color: g.negative ? "#F87171" : "#6B7280", fontWeight: g.negative ? 800 : 400 }}>{g.negative || "—"}</td>
                      <td style={{ ...tableCell, color: g.faraRaspuns ? "#FBBF24" : "#6B7280" }}>{g.faraRaspuns || "—"}</td>
                      <td style={{ ...tableCell, color: "#9CA3AF", fontSize: 12 }}>{new Date(g.ultima).toLocaleDateString("ro-RO")}</td>
                      <td style={tableCell}>
                        <span style={{ border: "1px solid #2A2A2A", color: "#9CA3AF", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>Vezi recenziile <ArrowRight size={12} strokeWidth={2.4} /></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ ...card, marginTop: 16, padding: "14px 18px", fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.6 }}>
            Datele sunt reale, din tabelul <code style={{ color: "#E5E7EB" }}>recenzii</code>. Apar doar saloanele care au primit cel puțin o recenzie.
            Moderarea (raportare de către salon, ștergere de către admin) nu există încă — nu avem coloană de raportare în bază.
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════ TICHETE ══════════════ */

function TicheteTab({ data }: { data: AdminData }) {
  const [tichete, setTichete] = useState<TichetDemo[]>(data.tichete);
  const [filterStatus, setFilterStatus] = useState<"toate" | "nou" | "raspuns" | "rezolvat">("toate");

  const filtered = filterStatus === "toate" ? tichete : tichete.filter(t => t.status === filterStatus);
  const ordine = { urgenta: 0, normala: 1, scazuta: 2 } as const;
  const sorted = [...filtered].sort((a, b) => ordine[a.urgenta] - ordine[b.urgenta]);

  function setStatus(id: string, status: TichetDemo["status"]) {
    setTichete(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  }

  return (
    <div>
      <TitluTab Icon={Ticket}>Tichete suport ({tichete.length})</TitluTab>

      <div style={{ ...card, marginBottom: 16, background: "rgba(251,191,36,.08)", borderColor: "rgba(251,191,36,.3)" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#FBBF24", marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}><Info size={15} strokeWidth={2.4} /> Date demo</div>
        <p style={{ fontSize: 13, color: "#E5E7EB", lineHeight: 1.6, margin: 0 }}>
          Nu există încă tabel de tichete în Supabase și nici formular de suport în dashboardul salonului.
          Tichetele de mai jos sunt exemple, ca să se vadă cum va arăta ecranul. Modificările de status nu se salvează nicăieri.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["toate", "nou", "raspuns", "rezolvat"] as const).map(s => {
          const labels: Record<string, string> = { toate: "Toate", nou: "Nou", raspuns: "Răspuns trimis", rezolvat: "Rezolvat" };
          const count = s === "toate" ? tichete.length : tichete.filter(t => t.status === s).length;
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
                  <span style={badge(`${urgColor}22`, urgColor)}>{t.urgenta === "urgenta" ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Siren size={11} strokeWidth={2.6} /> Urgent</span> : t.urgenta === "normala" ? "Normal" : "Scăzut"}</span>
                  <span style={badge(`${statColor}22`, statColor)}>{statLabel}</span>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: "#E5E7EB", lineHeight: 1.6, margin: "12px 0", padding: 12, background: "#0A0A0A", borderRadius: 8, border: "1px solid #1F1F1F" }}>{t.mesaj}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 5 }}><CalendarDays size={12} strokeWidth={2.2} /> {new Date(t.data).toLocaleDateString("ro-RO")}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {t.status !== "raspuns" && <button onClick={() => setStatus(t.id, "raspuns")} style={{ background: "transparent", border: "1px solid #FBBF24", color: "#FBBF24", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito", display: "inline-flex", alignItems: "center", gap: 5 }}><Send size={12} strokeWidth={2.4} /> Marchează răspuns</button>}
                  {t.status !== "rezolvat" && <button onClick={() => setStatus(t.id, "rezolvat")} style={{ background: "transparent", border: "1px solid #10B981", color: "#10B981", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito", display: "inline-flex", alignItems: "center", gap: 5 }}><Check size={12} strokeWidth={2.8} /> Rezolvat</button>}
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <div style={card}><GolCard text="Niciun tichet pe filtrul curent." /></div>}
      </div>
    </div>
  );
}

/* ══════════════ MARKETING / SEO ══════════════ */

function MarketingTab({ data }: { data: AdminData }) {
  const paginiOras = (["infrumusetare", "grooming"] as Vertical[]).flatMap(d =>
    ORASE_SEO.map(o => {
      const numeOras = o === "bucuresti" ? "București" : o === "cluj" ? "Cluj-Napoca" : o === "timisoara" ? "Timișoara" : o === "iasi" ? "Iași" : "Brașov";
      const saloane = data.saloane.filter(s => s.domeniu === d && s.oras.toLowerCase().startsWith(o.slice(0, 4))).length;
      return { ruta: `/saloane-${d}-${o}`, domeniu: d, oras: numeOras, saloane };
    })
  );
  const acoperite = paginiOras.filter(p => p.saloane > 0).length;

  // Orașe în care avem saloane, dar nu avem pagină SEO
  const orasePagina = new Set(ORASE_SEO);
  const oraseFaraPagina = [...new Set(data.saloane.map(s => s.oras).filter(o => o && o !== "—"))]
    .filter(o => ![...orasePagina].some(p => o.toLowerCase().startsWith(p.slice(0, 4))));

  return (
    <div>
      <TitluTab Icon={TrendingUp}>Marketing & SEO</TitluTab>

      <div style={{ ...card, marginBottom: 20, background: "rgba(251,191,36,.08)", borderColor: "rgba(251,191,36,.3)" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#FBBF24", marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}><Info size={15} strokeWidth={2.4} /> Fără date de trafic</div>
        <p style={{ fontSize: 13, color: "#E5E7EB", lineHeight: 1.6, margin: 0 }}>
          Google Search Console și Analytics nu sunt conectate — și politica de confidențialitate declară explicit că nu rulăm analytics.
          Aici arătăm doar ce știm sigur: ce pagini generăm și cât conținut real au. Cifrele de trafic vor apărea când conectăm Search Console
          (și numai după ce actualizăm politica de cookie-uri).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={card}><div style={subTitle}>Pagini de oraș</div><div style={{ fontSize: 28, fontWeight: 900, color: "#A855F7" }}>{paginiOras.length}</div><div style={{ fontSize: 12, color: "#6B7280" }}>2 verticale × {ORASE_SEO.length} orașe</div></div>
        <div style={card}><div style={subTitle}>Pagini cu saloane reale</div><div style={{ fontSize: 28, fontWeight: 900, color: acoperite ? "#10B981" : "#EF4444" }}>{acoperite}</div><div style={{ fontSize: 12, color: "#6B7280" }}>din {paginiOras.length} — restul e doar text</div></div>
        <div style={card}><div style={subTitle}>Pagini de salon</div><div style={{ fontSize: 28, fontWeight: 900, color: "#EF4444" }}>0</div><div style={{ fontSize: 12, color: "#6B7280" }}>ruta /salon/[slug] nu există încă</div></div>
        <div style={card}><div style={subTitle}>Orașe fără pagină</div><div style={{ fontSize: 28, fontWeight: 900, color: oraseFaraPagina.length ? "#FBBF24" : "#10B981" }}>{oraseFaraPagina.length}</div><div style={{ fontSize: 12, color: "#6B7280" }}>{oraseFaraPagina.length ? oraseFaraPagina.join(", ") : "toate acoperite"}</div></div>
      </div>

      <div style={card}>
        <div style={subTitle}>Paginile de oraș și conținutul lor real</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead><tr><th style={tableHeadCell}>Rută</th><th style={tableHeadCell}>Verticală</th><th style={tableHeadCell}>Oraș</th><th style={tableHeadCell}>Saloane reale</th></tr></thead>
            <tbody>
              {paginiOras.map(p => (
                <tr key={p.ruta}>
                  <td style={{ ...tableCell, fontFamily: "monospace", fontSize: 12, color: "#E5E7EB" }}>{p.ruta}</td>
                  <td style={tableCell}><BadgeVerticala v={p.domeniu} /></td>
                  <td style={tableCell}>{p.oras}</td>
                  <td style={{ ...tableCell, fontWeight: 800, color: p.saloane ? "#10B981" : "#6B7280" }}>{p.saloane || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 12, lineHeight: 1.6 }}>
          Coloana „Saloane reale" e informativă: paginile de oraș sunt statice și <strong style={{ color: "#9CA3AF" }}>nu afișează încă</strong> saloanele din bază.
          Legarea lor de bază și pagina publică de salon sunt notate în <code style={{ color: "#9CA3AF" }}>CLAUDE.md</code> ca etapă de dinainte de lansare.
        </div>
      </div>
    </div>
  );
}

/* ══════════════ CONFIGURAȚIE ══════════════ */

function ConfiguratieTab() {
  const [vertPlanuri, setVertPlanuri] = useState<Vertical>("infrumusetare");
  const planuri = planuriPentru(vertPlanuri);

  const neconectat = [
    { nume: "Stripe — plăți și abonamente", efect: "Nimeni nu poate plăti. Toate saloanele rămân în trial, apoi expiră.", fisier: "saloane.abonament_activ rămâne false" },
    { nume: "Resend — emailuri", efect: "Un salon care nu intră în cont nu află că i-a expirat trialul. Din acest motiv ștergerea datelor NU e activată.", fisier: "notificare doar în aplicație" },
    { nume: "Pagina publică de salon", efect: "Saloanele nu au prezență indexabilă în Google.", fisier: "ruta /salon/[slug] nu există" },
    { nume: "Google Search Console", efect: "Nu avem date de trafic sau de poziționare.", fisier: "tabul Marketing e gol de cifre" },
    { nume: "OAuth Google / Facebook / telefon", efect: "Butoanele de pe /login sunt decorative.", fisier: "ruta /auth/callback nu există" },
  ];

  return (
    <div>
      <TitluTab Icon={Settings}>Configurația sistemului</TitluTab>
      <div style={{ ...card, marginBottom: 20, padding: "14px 18px", fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.6 }}>
        Ecran de citire. Valorile de mai jos vin din codul aplicației, dintr-un singur loc fiecare — se modifică acolo, nu de aici,
        ca să nu ajungem cu prețuri diferite pe pagina publică și în dashboard.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 20 }}>
        {/* Planuri */}
        <div style={{ ...card, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ ...subTitle, marginBottom: 0 }}>Planuri și prețuri — <code style={{ color: "#FF6B00", textTransform: "none", letterSpacing: 0 }}>lib/planuri.ts</code></div>
            <div style={{ display: "inline-flex", gap: 3, background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 8, padding: 3 }}>
              {(["infrumusetare", "grooming"] as Vertical[]).map(v => (
                <button key={v} onClick={() => setVertPlanuri(v)}
                  style={{ background: vertPlanuri === v ? VERT_COLOR[v] : "transparent", color: vertPlanuri === v ? "#fff" : "#9CA3AF", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito" }}>{VERT_SCURT[v]}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {planuri.map(p => (
              <div key={p.id} style={{ background: "#0A0A0A", border: "1px solid #1F1F1F", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{p.nume} {p.badge && <span style={{ ...badge("rgba(255,107,0,.15)", "#FF6B00"), marginLeft: 6, fontSize: 10 }}>{p.badge}</span>}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>{p.tagline}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#FF6B00" }}>{p.pretLunar}</span>
                  <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700 }}>lei/lună · {p.pretAnual} anual</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 10, lineHeight: 1.6 }}>{p.features.length} caracteristici · {p.features.filter(f => f.startsWith("✨")).length} agenți AI</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 12, lineHeight: 1.6 }}>
            Aceleași prețuri pentru ambele verticale — diferă doar cum sunt formulate caracteristicile
            (rol: {VERTICAL[vertPlanuri].rolPl}, preț: {VERTICAL[vertPlanuri].pret.toLowerCase()}).
          </div>
        </div>

        {/* Trial */}
        <div style={card}>
          <div style={subTitle}>Trial — <code style={{ color: "#FF6B00", textTransform: "none", letterSpacing: 0 }}>lib/trial.ts</code></div>
          {[
            ["Durata trialului", `${ZILE_TRIAL} zile`],
            ["Avertisment în dashboard", `ultimele ${ZILE_AVERTISMENT} zile`],
            ["Suspendare", `ziua ${ZILE_TRIAL + 1} (deocamdată doar anunțată)`],
            ["Ștergerea datelor", `ziua ${ZILE_TRIAL + ZILE_PANA_LA_STERGERE} (neactivată — lipsesc emailurile)`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #1F1F1F", fontSize: 13 }}>
              <span style={{ color: "#9CA3AF", fontWeight: 600 }}>{k}</span>
              <span style={{ color: "#E5E7EB", fontWeight: 800, textAlign: "right" }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 12, lineHeight: 1.6 }}>
            Durata NU se comunică public — peste tot scriem doar „trial gratuit".
          </div>
        </div>

        {/* Verticale */}
        <div style={card}>
          <div style={subTitle}>Verticale — <code style={{ color: "#FF6B00", textTransform: "none", letterSpacing: 0 }}>saloane.domeniu</code></div>
          {(["infrumusetare", "grooming"] as Vertical[]).map(v => (
            <div key={v} style={{ padding: "10px 0", borderBottom: "1px solid #1F1F1F" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: VERT_COLOR[v], marginBottom: 4 }}>{VERTICAL[v].eticheta}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.6 }}>
                rol: {VERTICAL[v].rol} · {VERTICAL[v].pret.toLowerCase()} · agent AI: {VERTICAL[v].fisa}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 12, lineHeight: 1.6 }}>
            Un salon = o verticală, aleasă la înregistrare și ireversibilă. Cine are ambele afaceri își face două conturi.
          </div>
        </div>

        {/* Orașe SEO */}
        <div style={card}>
          <div style={subTitle}>Orașe cu pagini SEO</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {ORASE_SEO.map(o => <span key={o} style={{ background: "#1F1F1F", color: "#FF6B00", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{o}</span>)}
          </div>
          <div style={{ fontSize: 11.5, color: "#6B7280", lineHeight: 1.6 }}>
            Un oraș nou se adaugă în trei locuri: <code style={{ color: "#9CA3AF" }}>app/saloane/[domeniu]/[oras]/page.tsx</code> (obiectul ORASE),
            <code style={{ color: "#9CA3AF" }}> app/sitemap.ts</code> și <code style={{ color: "#9CA3AF" }}>next.config.js</code> (rewrites).
            Generarea automată din bază e notată în CLAUDE.md.
          </div>
        </div>
      </div>

      {/* Ce nu e conectat */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={subTitle}>Ce nu e conectat încă</div>
        <div style={{ display: "grid", gap: 10 }}>
          {neconectat.map(x => (
            <div key={x.nume} style={{ background: "#0A0A0A", border: "1px solid #1F1F1F", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#F87171", marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}><X size={14} strokeWidth={2.8} /> {x.nume}</div>
              <div style={{ fontSize: 12.5, color: "#E5E7EB", lineHeight: 1.6 }}>{x.efect}</div>
              <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 4, fontFamily: "monospace" }}>{x.fisier}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
