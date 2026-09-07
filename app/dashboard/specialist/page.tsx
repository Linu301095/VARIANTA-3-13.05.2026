"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import LogoSemn from "../../../components/LogoSemn";
import SchimbaParola from "../../../components/SchimbaParola";
import {
  CalendarDays, Clock, Scissors, LogOut, Sun, Moon, Wallet, Settings,
  XCircle, AlertTriangle, ChevronLeft, ChevronRight, Lock, PawPrint,
} from "lucide-react";

/**
 * Dashboardul specialistului — Faza 2 din „conturi pentru specialiști" (CLAUDE.md).
 *
 * Nu e o versiune mică a dashboardului de salon: e agenda unui singur om.
 * RLS (sql/conturi_specialisti.sql) restricționează deja tot ce citește și
 * scrie aici la programările cu `membru_uid` egal cu al lui — codul de mai
 * jos nu mai are nevoie să reinventeze acea graniță, doar s-o respecte.
 *
 * Ce vede, ce nu — regulile stabilite cu utilizatorul:
 *   agenda proprie ✅ · accept/refuz/mut/anulez programările mele ✅ ·
 *   îmi blochez ore ✅ · prețurile — doar citire 👁 · propriile încasări ✅ ·
 *   echipa, planul, profilul salonului, agenții AI — deloc.
 *
 * Nu e calendarul cu coloane al salonului (ăla ar cere să extragem
 * `AgendaCalendar` din fișierul de salon, risc pentru un fișier deja uriaș) —
 * e o listă cronologică pe zi, cu navigare zi cu zi. Funcțional identic,
 * vizual mai simplu.
 */

type StatusProg = "în așteptare" | "confirmat" | "finalizat" | "anulat" | "neprezentat";
type ProgramareS = {
  id: string; user_id: string | null; client: string; animal: string | null;
  serviciu: string; ora: string; data: string; durata: number; pret: number;
  status: StatusProg; esteApp: boolean; sursa: string | null;
  motivAnulare: string | null; anulatDe: string | null;
};
type ProgramZi = { activ: boolean; start: string; end: string };
type ProgramSaptamanal = Record<string, ProgramZi>;
type Serviciu = { nume: string; pret: string; durata: string; preturi?: { mica: string; medie: string; mare: string }; durate?: { mica: string; medie: string; mare: string } };

const PROGRAM_DEFAULT: ProgramSaptamanal = {
  "1": { activ: true, start: "09:00", end: "18:00" }, "2": { activ: true, start: "09:00", end: "18:00" },
  "3": { activ: true, start: "09:00", end: "18:00" }, "4": { activ: true, start: "09:00", end: "18:00" },
  "5": { activ: true, start: "09:00", end: "18:00" }, "6": { activ: false, start: "10:00", end: "14:00" },
  "0": { activ: false, start: "10:00", end: "14:00" },
};
const ZILE_FULL = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const LUNA_FULL = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const STEP_SLOT = 30;
const ANULARI_MOTIV_MIN = 5;

function isoData(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minToTime(m: number) { const h = Math.floor(m / 60), mm = m % 60; return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; }
function genereazaSloturiZi(prog: ProgramZi, step = STEP_SLOT): string[] {
  if (!prog.activ) return [];
  const startM = timeToMin(prog.start), endM = timeToMin(prog.end);
  const out: string[] = [];
  for (let m = startM; m + step <= endM; m += step) out.push(minToTime(m));
  return out;
}
function suprapunere(slot: string, durataSlot: number, p: { ora: string; durata: number }) {
  const slotS = timeToMin(slot), slotE = slotS + durataSlot;
  const pS = timeToMin(p.ora), pE = pS + (p.durata || 60);
  return slotS < pE && slotE > pS;
}
function etichetaZi(dataIso: string) {
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  const maine = new Date(azi); maine.setDate(maine.getDate() + 1);
  const ieri = new Date(azi); ieri.setDate(ieri.getDate() - 1);
  const d = new Date(`${dataIso}T00:00:00`);
  const baza = `${ZILE_FULL[d.getDay()]}, ${d.getDate()} ${LUNA_FULL[d.getMonth()]}`;
  if (dataIso === isoData(azi)) return { prefix: "Azi", rest: baza, azi: true };
  if (dataIso === isoData(maine)) return { prefix: "Mâine", rest: baza, azi: false };
  if (dataIso === isoData(ieri)) return { prefix: "Ieri", rest: baza, azi: false };
  return { prefix: "", rest: baza, azi: false };
}

const C = {
  light: {
    pageBg: "#FAFAFA", surface: "#ffffff", surface2: "#F9FAFB",
    text: "#1A1A1A", text2: "#374151", muted: "#6B7280", xmuted: "#9CA3AF",
    border: "#FFD9BF", border2: "#FFE9D8", input: "#ffffff",
    orangeAccent: "#FFF3EA", orangeBorder: "#FFDCC6",
  },
  dark: {
    pageBg: "#0A0A0A", surface: "#161616", surface2: "#1F1F1F",
    text: "#F5F5F5", text2: "#E5E7EB", muted: "#9CA3AF", xmuted: "#6B7280",
    border: "#4A3320", border2: "#3A2A1C", input: "#111111",
    orangeAccent: "rgba(255,107,0,0.13)", orangeBorder: "rgba(255,107,0,0.25)",
  },
};
type ColorSet = typeof C.light;

export default function DashboardSpecialist() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const c: ColorSet = C[theme];
  const [gata, setGata] = useState(false);
  const [eroare, setEroare] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [tab, setTab] = useState<"agenda" | "incasari" | "cont">("agenda");

  const [userId, setUserId] = useState<string | null>(null);
  const [numeSpecialist, setNumeSpecialist] = useState("");
  const [salonId, setSalonId] = useState<string | null>(null);
  const [membruUid, setMembruUid] = useState<string | null>(null);
  const [salonNume, setSalonNume] = useState("");
  const [areAnimale, setAreAnimale] = useState(false);
  const [program, setProgram] = useState<ProgramSaptamanal>(PROGRAM_DEFAULT);
  const [servicii, setServicii] = useState<Serviciu[]>([]);
  const [programari, setProgramari] = useState<ProgramareS[]>([]);
  const [agendaZi, setAgendaZi] = useState(() => isoData(new Date()));

  const [gestionat, setGestionat] = useState<ProgramareS | null>(null);
  const [mod, setMod] = useState<"meniu" | "mutare" | "anulare">("meniu");
  const [motiv, setMotiv] = useState("");
  const [mutData, setMutData] = useState("");
  const [mutOra, setMutOra] = useState("");
  const [lucru, setLucru] = useState(false);
  const [refuzId, setRefuzId] = useState<string | null>(null);
  const [motivRefuz, setMotivRefuz] = useState("");

  const [modalBlocare, setModalBlocare] = useState<{ slot: string; durata: number } | null>(null);

  function salveaza(msg: string) { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); }

  useEffect(() => {
    try { if (localStorage.getItem("calyhub_theme") === "dark") { setTheme("dark"); document.documentElement.dataset.theme = "dark"; } } catch {}

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data: profil } = await supabase.from("profiluri").select("tip, nume, tema").eq("id", user.id).single();
      if (profil?.tip !== "specialist") {
        router.replace(profil?.tip === "salon" ? "/dashboard/salon" : "/dashboard/client");
        return;
      }
      setNumeSpecialist(profil.nume || "");
      if (profil.tema === "dark") { setTheme("dark"); document.documentElement.dataset.theme = "dark"; try { localStorage.setItem("calyhub_theme", "dark"); } catch {} }

      const { data: legatura, error: eLeg } = await supabase
        .from("salon_membri_cont").select("salon_id, membru_uid").eq("user_id", user.id).maybeSingle();
      if (eLeg || !legatura) {
        setEroare("Nu am găsit nicio agendă legată de contul tău. Cere-i proprietarului salonului un cod nou.");
        setGata(true);
        return;
      }
      setSalonId(legatura.salon_id);
      setMembruUid(legatura.membru_uid);

      const { data: salon, error: eSalon } = await supabase
        .from("saloane").select("nume, domeniu, servicii, echipa, program").eq("id", legatura.salon_id).single();
      if (eSalon || !salon) {
        setEroare(`Nu am putut încărca datele salonului: ${eSalon?.message || "eroare necunoscută"}.`);
        setGata(true);
        return;
      }
      setSalonNume(salon.nume || "Salon");
      setAreAnimale(salon.domeniu !== "infrumusetare");
      setServicii(Array.isArray(salon.servicii) ? salon.servicii : []);
      if (salon.program && Object.keys(salon.program).length > 0) setProgram({ ...PROGRAM_DEFAULT, ...salon.program });

      await incarcaProgramari(legatura.salon_id, legatura.membru_uid);
      setGata(true);
    })();
  }, [router]);

  async function incarcaProgramari(sId: string, mUid: string) {
    const { data, error } = await supabase
      .from("programari")
      .select("id, ora, data, serviciu, pret, durata, status, user_id, animal_id, sursa, motiv_anulare, anulat_de")
      .eq("salon_id", sId).eq("membru_uid", mUid)
      .order("data", { ascending: true }).order("ora", { ascending: true });

    if (error) { setEroare(`Nu am putut încărca programările: ${error.message}`); return; }
    const rows = data || [];

    // Trecerea automată la „finalizat" — până acum se întâmpla doar când
    // proprietarul intra în cont. Aici o facem și pentru rândurile proprii,
    // ca să nu depindă de dacă salonul se loghează sau nu.
    const now = new Date(); const aziIso = isoData(now); const minAcum = now.getHours() * 60 + now.getMinutes();
    const expirate = rows.filter((p: any) => p.status === "confirmat" && p.sursa !== "blocaj" &&
      (p.data < aziIso || (p.data === aziIso && timeToMin(p.ora) + (p.durata || 60) <= minAcum))
    ).map((p: any) => p.id);
    if (expirate.length > 0) {
      await supabase.from("programari").update({ status: "finalizat" }).in("id", expirate);
      rows.forEach((p: any) => { if (expirate.includes(p.id)) p.status = "finalizat"; });
    }

    const userIds = [...new Set(rows.map((p: any) => p.user_id).filter(Boolean))];
    const animalIds = [...new Set(rows.map((p: any) => p.animal_id).filter(Boolean))];
    const [{ data: profiluri }, { data: animale }] = await Promise.all([
      userIds.length ? supabase.from("profiluri").select("id, nume").in("id", userIds) : Promise.resolve({ data: [] as any[] }),
      animalIds.length ? supabase.from("animale").select("id, nume, specie").in("id", animalIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const profMap = Object.fromEntries((profiluri || []).map((p: any) => [p.id, p]));
    const animMap = Object.fromEntries((animale || []).map((a: any) => [a.id, a]));

    setProgramari(rows.map((p: any) => {
      const esteApp = !p.sursa || p.sursa === "app";
      return {
        id: p.id, user_id: p.user_id,
        client: esteApp ? (profMap[p.user_id]?.nume || "Client") : (p.sursa === "blocaj" ? "Indisponibil" : "Client telefonic"),
        animal: esteApp && p.animal_id ? (animMap[p.animal_id]?.nume || null) : null,
        serviciu: p.serviciu, ora: p.ora, data: p.data, durata: Number(p.durata) || 60, pret: Number(p.pret) || 0,
        status: p.status, esteApp, sursa: p.sursa || "app",
        motivAnulare: p.motiv_anulare || null, anulatDe: p.anulat_de || null,
      };
    }));
  }

  function toggleTheme() {
    const nou = theme === "dark" ? "light" : "dark";
    setTheme(nou);
    document.documentElement.dataset.theme = nou;
    try { if (nou === "dark") localStorage.setItem("calyhub_theme", "dark"); else localStorage.removeItem("calyhub_theme"); } catch {}
    supabase.auth.getUser().then(({ data }) => { if (data.user) supabase.from("profiluri").update({ tema: nou }).eq("id", data.user.id).then(() => {}); });
  }

  async function logout() {
    try { localStorage.removeItem("calyhub_theme"); } catch {}
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function notificaClient(userId: string | null, esteApp: boolean, mesaj: string, programareId: string, tip: string) {
    if (!userId || !esteApp) return;
    await supabase.from("notificari").insert({ user_id: userId, tip, mesaj, programare_id: programareId });
  }

  async function accepta(p: ProgramareS) {
    const { error } = await supabase.from("programari").update({ status: "confirmat" }).eq("id", p.id);
    if (error) { salveaza("Nu am putut accepta. Încearcă din nou."); return; }
    setProgramari(ps => ps.map(x => x.id === p.id ? { ...x, status: "confirmat" } : x));
    notificaClient(p.user_id, p.esteApp, `✅ ${salonNume} a confirmat programarea ta — ${p.serviciu}`, p.id, "confirmat");
  }

  async function respinge(p: ProgramareS, m: string) {
    const mm = m.trim();
    const { error } = await supabase.from("programari").update({ status: "anulat", anulat_de: "salon_refuz", motiv_anulare: mm || null }).eq("id", p.id);
    if (error) { salveaza("Nu am putut refuza. Încearcă din nou."); return; }
    setProgramari(ps => ps.map(x => x.id === p.id ? { ...x, status: "anulat", anulatDe: "salon_refuz", motivAnulare: mm || null } : x));
    notificaClient(p.user_id, p.esteApp, `❌ ${salonNume} nu a putut prelua cererea ta — ${p.serviciu}${mm ? `. Motiv: ${mm}` : ""}`, p.id, "anulat");
    salveaza("Cerere refuzată.");
  }

  async function marcheazaPrezenta(p: ProgramareS, aVenit: boolean) {
    const nou: StatusProg = aVenit ? "finalizat" : "neprezentat";
    const { error } = await supabase.from("programari").update({ status: nou }).eq("id", p.id);
    if (error) { salveaza("Nu am putut salva."); return; }
    setProgramari(ps => ps.map(x => x.id === p.id ? { ...x, status: nou } : x));
    salveaza(aVenit ? "Marcat ca vizită încheiată." : "Marcat ca neprezentare.");
  }

  function dataLunga(dataIso: string) {
    const e = etichetaZi(dataIso);
    return e.prefix ? `${e.prefix.toLowerCase()}, ${e.rest.toLowerCase()}` : e.rest.toLowerCase();
  }

  async function anuleazaProgramare(p: ProgramareS, m: string) {
    setLucru(true);
    const { error } = await supabase.from("programari").update({ status: "anulat", anulat_de: "salon", motiv_anulare: m.trim() }).eq("id", p.id);
    setLucru(false);
    if (error) { salveaza("Nu am putut anula."); return false; }
    setProgramari(ps => ps.map(x => x.id === p.id ? { ...x, status: "anulat", anulatDe: "salon", motivAnulare: m.trim() } : x));
    notificaClient(p.user_id, p.esteApp, `❌ ${salonNume} a anulat programarea ta de ${dataLunga(p.data)}, ora ${p.ora} — ${p.serviciu}. Motiv: ${m.trim()}`, p.id, "anulat");
    salveaza("Programare anulată — clientul a fost anunțat.");
    return true;
  }

  async function mutaProgramare(p: ProgramareS, dataNoua: string, oraNoua: string) {
    setLucru(true);
    const { error } = await supabase.from("programari").update({ data: dataNoua, ora: oraNoua, mutat_la: new Date().toISOString() }).eq("id", p.id);
    setLucru(false);
    if (error) { salveaza("Nu am putut muta programarea."); return false; }
    setProgramari(ps => ps.map(x => x.id === p.id ? { ...x, data: dataNoua, ora: oraNoua } : x));
    notificaClient(p.user_id, p.esteApp, `📅 ${salonNume} a mutat programarea ta „${p.serviciu}" din ${dataLunga(p.data)}, ora ${p.ora}, în ${dataLunga(dataNoua)}, ora ${oraNoua}. Dacă nu îți convine, o poți anula din contul tău.`, p.id, "mutat");
    salveaza("Programare mutată — clientul a fost anunțat.");
    return true;
  }

  async function blocheazaOra(dataIso: string, ora: string, durata: number) {
    if (!salonId || !membruUid) return;
    // `user_id` se completează la fel ca la orele blocate de proprietar —
    // în lipsa unui client real, rândul poartă identitatea celui care a blocat.
    const { data: nou, error } = await supabase.from("programari").insert({
      salon_id: salonId, user_id: userId, membru_uid: membruUid, serviciu: "Indisponibil", pret: 0,
      data: dataIso, ora, durata, status: "confirmat", sursa: "blocaj",
    }).select("id, ora, data, durata, status, sursa").single();
    if (error || !nou) { salveaza("Nu am putut bloca ora."); return; }
    setProgramari(ps => [...ps, { id: nou.id, user_id: null, client: "Indisponibil", animal: null, serviciu: "Indisponibil", ora, data: dataIso, durata, pret: 0, status: "confirmat", esteApp: false, sursa: "blocaj", motivAnulare: null, anulatDe: null }]);
    setModalBlocare(null);
    salveaza("Oră blocată.");
  }

  async function deblocheazaOra(id: string) {
    const { error } = await supabase.from("programari").delete().eq("id", id);
    if (error) { salveaza("Nu am putut debloca ora."); return; }
    setProgramari(ps => ps.filter(x => x.id !== id));
    salveaza("Oră deblocată.");
  }

  const apptsZi = programari.filter(p => p.data === agendaZi).sort((a, b) => a.ora < b.ora ? -1 : 1);
  const pending = programari.filter(p => p.status === "în așteptare").sort((a, b) => (a.data === b.data ? (a.ora < b.ora ? -1 : 1) : (a.data < b.data ? -1 : 1)));
  const aziIso = isoData(new Date());
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const deVerificat = apptsZi.filter(p =>
    (p.status === "finalizat" || p.status === "neprezentat") && p.esteApp &&
    (agendaZi < aziIso || (agendaZi === aziIso && timeToMin(p.ora) + p.durata <= nowMin))
  ).sort((a, b) => a.ora < b.ora ? -1 : 1);
  const anulate = apptsZi.filter(p => p.status === "anulat").sort((a, b) => a.ora < b.ora ? -1 : 1);
  const confirmate = apptsZi.filter(p => p.status === "confirmat" && p.sursa !== "blocaj" && !deVerificat.includes(p)).sort((a, b) => a.ora < b.ora ? -1 : 1);
  const blocate = apptsZi.filter(p => p.sursa === "blocaj").sort((a, b) => a.ora < b.ora ? -1 : 1);

  const zilaProgram = program[String(new Date(`${agendaZi}T00:00:00`).getDay())] || PROGRAM_DEFAULT["1"];
  const sloturiZi = zilaProgram.activ ? genereazaSloturiZi(zilaProgram).filter(slot => !apptsZi.some(p => p.status !== "anulat" && suprapunere(slot, 30, p))) : [];

  const incasari = useMemo(() => {
    const luna = agendaZi.slice(0, 7);
    const finLuna = programari.filter(p => p.status === "finalizat" && p.sursa !== "blocaj" && p.data.startsWith(luna));
    const finAzi = programari.filter(p => p.status === "finalizat" && p.sursa !== "blocaj" && p.data === aziIso);
    return {
      luna: finLuna.reduce((s, p) => s + p.pret, 0), nrLuna: finLuna.length,
      azi: finAzi.reduce((s, p) => s + p.pret, 0), nrAzi: finAzi.length,
      faraPret: finLuna.filter(p => p.pret <= 0).length,
    };
  }, [programari, agendaZi, aziIso]);

  if (!gata) return <div style={{ minHeight: "100vh", background: c.pageBg, display: "flex", alignItems: "center", justifyContent: "center", color: c.muted, fontFamily: "Nunito, sans-serif" }}>Se încarcă...</div>;

  const btnBaza: React.CSSProperties = { padding: "11px 16px", borderRadius: 12, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", border: `1.5px solid ${c.border}`, background: c.surface2, color: c.text, textAlign: "left", display: "flex", alignItems: "center", gap: 10, width: "100%" };
  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${c.border}`, background: c.surface2, color: c.text, fontSize: 14, fontFamily: "Nunito, sans-serif", boxSizing: "border-box" };
  const btnPrimary: React.CSSProperties = { padding: "13px 0", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", background: c.pageBg, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: c.surface, borderBottom: `1.5px solid ${c.border}`, padding: "12px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <LogoSemn size={34} tema={theme} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 900, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{numeSpecialist || "Contul meu"}</div>
              <div style={{ fontSize: 11, color: c.muted, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{salonNume}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={toggleTheme} aria-label="Schimbă tema" style={{ background: "none", border: `1.5px solid ${c.border}`, borderRadius: 10, padding: 8, cursor: "pointer", color: c.text2 }}>
              {theme === "dark" ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
            </button>
            <button onClick={logout} aria-label="Deconectare" style={{ background: "none", border: `1.5px solid ${c.border}`, borderRadius: 10, padding: 8, cursor: "pointer", color: "#EF4444" }}>
              <LogOut size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
        <div style={{ maxWidth: 720, margin: "10px auto 0", display: "flex", gap: 6 }}>
          {([{ v: "agenda" as const, l: "Agendă", Icon: CalendarDays }, { v: "incasari" as const, l: "Încasările mele", Icon: Wallet }, { v: "cont" as const, l: "Cont", Icon: Settings }]).map(t => (
            <button key={t.v} onClick={() => setTab(t.v)}
              style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: tab === t.v ? "#FF6B00" : "transparent", color: tab === t.v ? "#fff" : c.muted, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <t.Icon size={14} strokeWidth={2} /> {t.l}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px" }}>
        {savedMsg && (
          <div style={{ marginBottom: 16, background: "#10B981", color: "#fff", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700 }}>{savedMsg}</div>
        )}

        {eroare && (
          <div style={{ marginBottom: 18, background: "#FEF2F2", border: "1.5px solid rgba(239,68,68,.35)", borderRadius: 16, padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={18} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.5 }}>{eroare}</div>
          </div>
        )}

        {tab === "agenda" && salonId && (
          <>
            {pending.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: c.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", display: "inline-block" }} /> Cereri noi ({pending.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pending.map(p => (
                    <div key={p.id} style={{ background: c.surface, borderRadius: 16, border: "1.5px solid rgba(255,107,0,.3)", padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 14.5, fontWeight: 900, color: c.text }}>{p.client}</div>
                          <div style={{ fontSize: 12, color: c.muted, fontWeight: 600, marginTop: 2 }}>{dataLunga(p.data)} · {p.ora}</div>
                          <div style={{ fontSize: 12.5, color: c.text2, fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                            <Scissors size={12} color={c.muted} strokeWidth={2} /> {p.serviciu}{p.pret > 0 ? ` · ${p.pret} RON` : ""}
                          </div>
                        </div>
                      </div>
                      {refuzId === p.id ? (
                        <div>
                          <input value={motivRefuz} onChange={e => setMotivRefuz(e.target.value)} placeholder="Motiv (opțional)" style={{ ...inp, marginBottom: 8 }} />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => { setRefuzId(null); setMotivRefuz(""); }} style={{ ...btnBaza, width: "auto", flex: 1, justifyContent: "center" }}>Renunț</button>
                            <button onClick={() => { respinge(p, motivRefuz); setRefuzId(null); setMotivRefuz(""); }} style={{ ...btnBaza, width: "auto", flex: 2, justifyContent: "center", border: "none", background: "#EF4444", color: "#fff" }}>Refuză</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setRefuzId(p.id)} style={{ ...btnBaza, width: "auto", flex: 1, justifyContent: "center", color: "#EF4444", borderColor: "rgba(239,68,68,.35)" }}>Refuză</button>
                          <button onClick={() => accepta(p)} style={{ ...btnBaza, width: "auto", flex: 2, justifyContent: "center", border: "none", background: "#FF6B00", color: "#fff" }}>Acceptă</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <button onClick={() => setAgendaZi(z => isoData(new Date(new Date(z).getTime() - 86400000)))} style={{ background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 10, padding: 8, cursor: "pointer", color: c.text }}><ChevronLeft size={16} /></button>
              {(() => { const e = etichetaZi(agendaZi); return (
                <div style={{ textAlign: "center" }}>
                  {e.prefix && <span style={{ fontSize: 14, fontWeight: 900, color: "#FF6B00", marginRight: 6 }}>{e.prefix}</span>}
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: c.text }}>{e.rest}</span>
                </div>
              ); })()}
              <button onClick={() => setAgendaZi(z => isoData(new Date(new Date(z).getTime() + 86400000)))} style={{ background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 10, padding: 8, cursor: "pointer", color: c.text }}><ChevronRight size={16} /></button>
            </div>

            {sloturiZi.length > 0 && (
              <button onClick={() => setModalBlocare({ slot: sloturiZi[0], durata: 60 })}
                style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: `1.5px dashed ${c.border}`, background: c.surface, color: c.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <Lock size={13} strokeWidth={2} /> Blochează o oră
              </button>
            )}

            {confirmate.length === 0 && blocate.length === 0 && deVerificat.length === 0 && anulate.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px 0", color: c.muted, fontSize: 13 }}>Nimic programat în ziua asta.</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {confirmate.map(p => (
                <div key={p.id} onClick={() => { setGestionat(p); setMod("meniu"); setMotiv(""); setMutData(p.data); setMutOra(p.ora); }}
                  style={{ background: c.surface, borderRadius: 14, border: "1.5px solid rgba(16,185,129,.4)", padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(16,185,129,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#10B981", flexShrink: 0 }}>{p.ora}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{p.client}</div>
                    <div style={{ fontSize: 12, color: c.muted, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      {areAnimale && p.animal && <PawPrint size={11} strokeWidth={2} />} {p.serviciu}{p.pret > 0 ? ` · ${p.pret} RON` : ""}
                    </div>
                  </div>
                </div>
              ))}
              {blocate.map(p => (
                <div key={p.id} style={{ background: c.surface2, borderRadius: 14, border: `1.5px dashed ${c.border}`, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: c.surface, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: c.muted, flexShrink: 0 }}>{p.ora}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: c.muted }}>Indisponibil ({p.durata} min)</div>
                  <button onClick={() => deblocheazaOra(p.id)} style={{ fontSize: 11.5, fontWeight: 800, color: "#EF4444", background: "transparent", border: "1.5px solid rgba(239,68,68,.35)", padding: "6px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Deblochează</button>
                </div>
              ))}
            </div>

            {deVerificat.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: c.text, marginBottom: 10 }}>Vizite încheiate</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {deVerificat.map(p => {
                    const neprezentat = p.status === "neprezentat";
                    return (
                      <div key={p.id} style={{ background: neprezentat ? (theme === "dark" ? "rgba(217,119,6,.08)" : "#FFFBEB") : c.surface, borderRadius: 14, padding: "12px 16px", border: `1.5px solid ${neprezentat ? "rgba(217,119,6,.4)" : c.border}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: neprezentat ? "rgba(217,119,6,.12)" : c.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: neprezentat ? "#D97706" : c.muted, flexShrink: 0 }}>{p.ora}</div>
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{p.client}</div>
                          <div style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>{p.serviciu}{p.pret > 0 ? ` · ${p.pret} RON` : ""}</div>
                          {neprezentat && <div style={{ fontSize: 11.5, fontWeight: 800, color: "#D97706", marginTop: 3 }}>Nu s-a prezentat</div>}
                        </div>
                        {neprezentat ? (
                          <button onClick={() => marcheazaPrezenta(p, true)} style={{ fontSize: 11.5, fontWeight: 800, color: c.text2, background: "transparent", border: `1.5px solid ${c.border}`, padding: "6px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Totuși a venit</button>
                        ) : (
                          <button onClick={() => marcheazaPrezenta(p, false)} style={{ fontSize: 11.5, fontWeight: 800, color: "#D97706", background: "transparent", border: "1.5px solid rgba(217,119,6,.5)", padding: "6px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Nu s-a prezentat</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {anulate.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: c.text, marginBottom: 10 }}>Anulări</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {anulate.map(p => {
                    const et = p.anulatDe === "salon_refuz" ? { t: "Ai refuzat cererea", cul: "#6B7280" } : p.anulatDe === "salon" ? { t: "Ai anulat programarea", cul: "#D97706" } : { t: "Clientul a anulat", cul: "#EF4444" };
                    return (
                      <div key={p.id} style={{ background: theme === "dark" ? "rgba(239,68,68,.06)" : "#FEF2F2", borderRadius: 14, padding: "12px 16px", border: "1.5px solid rgba(239,68,68,.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: c.muted, textDecoration: "line-through" }}>{p.client}</div>
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: et.cul, background: `${et.cul}1F`, padding: "2px 9px", borderRadius: 50, flexShrink: 0 }}>{et.t}</span>
                        </div>
                        <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>{p.serviciu}</div>
                        {p.motivAnulare && <div style={{ fontSize: 12, color: c.muted, marginTop: 5, borderLeft: `3px solid ${et.cul}80`, paddingLeft: 8 }}>Motiv: {p.motivAnulare}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "incasari" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: c.surface, borderRadius: 16, padding: "18px", border: `1.5px solid ${c.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", marginBottom: 6 }}>Azi</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: c.text }}>{incasari.azi} RON</div>
                <div style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>{incasari.nrAzi} {incasari.nrAzi === 1 ? "vizită" : "vizite"}</div>
              </div>
              <div style={{ background: c.surface, borderRadius: 16, padding: "18px", border: `1.5px solid ${c.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", marginBottom: 6 }}>Luna aceasta</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: c.text }}>{incasari.luna} RON</div>
                <div style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>{incasari.nrLuna} {incasari.nrLuna === 1 ? "vizită" : "vizite"}</div>
              </div>
            </div>
            {incasari.faraPret > 0 && (
              <div style={{ fontSize: 12.5, color: "#D97706", fontWeight: 700 }}>{incasari.faraPret} vizite fără preț completat — suma de mai sus e incompletă.</div>
            )}
            <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.6 }}>
              Doar vizitele tale, deja încheiate. Nu include programările confirmate care încă n-au avut loc.
            </div>

            {servicii.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: c.text, marginBottom: 10 }}>Prețurile salonului</div>
                <div style={{ background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, overflow: "hidden" }}>
                  {servicii.map((s, i) => (
                    <div key={i} style={{ padding: "11px 16px", borderBottom: i < servicii.length - 1 ? `1px solid ${c.border2}` : "none", display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{s.nume}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: c.muted }}>
                        {s.preturi ? `${s.preturi.mica || "—"} / ${s.preturi.medie || "—"} / ${s.preturi.mare || "—"} RON` : `${s.pret || "—"} RON`}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: c.muted, marginTop: 8 }}>Doar de citit — prețurile se schimbă din contul proprietarului.</div>
              </div>
            )}
          </div>
        )}

        {tab === "cont" && (
          <SchimbaParola c={c as any} inp={inp} btnPrimary={btnPrimary} theme={theme} onGata={salveaza} />
        )}
      </main>

      {/* ── Blocarea unei ore ── */}
      {modalBlocare && (
        <div onClick={() => setModalBlocare(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: c.surface, borderRadius: 20, border: `1.5px solid ${c.border}`, padding: "22px 24px", width: "100%", maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: c.text, marginBottom: 14 }}>Blochează o oră</div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: c.text2, marginBottom: 6 }}>Ora</label>
            <select value={modalBlocare.slot} onChange={e => setModalBlocare(m => m && { ...m, slot: e.target.value })} style={{ ...inp, marginBottom: 12 }}>
              {sloturiZi.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: c.text2, marginBottom: 6 }}>Durata (minute)</label>
            <select value={modalBlocare.durata} onChange={e => setModalBlocare(m => m && { ...m, durata: Number(e.target.value) })} style={{ ...inp, marginBottom: 16 }}>
              {[30, 60, 90, 120, 180, 240].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => setModalBlocare(null)} style={{ ...btnBaza, flex: 1, justifyContent: "center" }}>Renunț</button>
              <button onClick={() => blocheazaOra(agendaZi, modalBlocare.slot, modalBlocare.durata)} style={{ ...btnBaza, flex: 2, justifyContent: "center", border: "none", background: "#FF6B00", color: "#fff" }}>Blochează</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gestionarea unei programări confirmate ── */}
      {gestionat && (() => {
        const p = gestionat;
        const et = etichetaZi(p.data);
        const zilaMutare = mutData ? (program[String(new Date(`${mutData}T00:00:00`).getDay())] || PROGRAM_DEFAULT["1"]) : null;
        const sloturiMutare = zilaMutare?.activ ? genereazaSloturiZi(zilaMutare) : [];
        return (
          <div onClick={() => setGestionat(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: c.surface, borderRadius: 20, border: `1.5px solid ${c.border}`, padding: "22px 24px", width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: c.text }}>{p.client}</div>
              <div style={{ fontSize: 13, color: c.muted, fontWeight: 600, marginTop: 3, marginBottom: 16 }}>
                {et.prefix ? `${et.prefix}, ` : ""}{et.rest} · {p.ora} · {p.serviciu}{p.pret > 0 ? ` · ${p.pret} RON` : ""}
              </div>

              {mod === "meniu" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <button onClick={() => setMod("mutare")} style={btnBaza}><Clock size={16} color="#FF6B00" strokeWidth={2.2} /> Mută programarea</button>
                  <button onClick={() => setMod("anulare")} style={{ ...btnBaza, border: "1.5px solid rgba(239,68,68,.4)", color: "#EF4444" }}><XCircle size={16} color="#EF4444" strokeWidth={2.2} /> Anulează programarea</button>
                  <button onClick={() => setGestionat(null)} style={{ ...btnBaza, justifyContent: "center", background: "transparent", border: "none", color: c.muted }}>Închide</button>
                </div>
              )}

              {mod === "mutare" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: c.text2, marginBottom: 6 }}>Ziua</label>
                    <input type="date" value={mutData} min={isoData(new Date())} style={inp} onChange={e => { setMutData(e.target.value); setMutOra(""); }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: c.text2, marginBottom: 6 }}>Ora</label>
                    <select value={mutOra} style={inp} onChange={e => setMutOra(e.target.value)}>
                      <option value="">Alege ora</option>
                      {sloturiMutare.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: 12, color: c.muted }}>Clientul e anunțat și poate anula fără motiv dacă nu îi convine.</div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => setMod("meniu")} style={{ ...btnBaza, flex: 1, justifyContent: "center" }}>Înapoi</button>
                    <button disabled={lucru || !mutOra} onClick={async () => { if (await mutaProgramare(p, mutData, mutOra)) setGestionat(null); }}
                      style={{ ...btnBaza, flex: 2, justifyContent: "center", border: "none", background: "#FF6B00", color: "#fff", opacity: lucru || !mutOra ? .6 : 1 }}>
                      {lucru ? "Se mută..." : "Mută"}
                    </button>
                  </div>
                </div>
              )}

              {mod === "anulare" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <textarea value={motiv} onChange={e => setMotiv(e.target.value)} rows={3} placeholder="De ce anulezi? (obligatoriu)" style={{ ...inp, resize: "vertical" }} />
                  <div style={{ fontSize: 12, color: c.muted }}>Motivul ajunge la client. Îl cerem întotdeauna — omul își face alt plan, merită să știe de ce.</div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => setMod("meniu")} style={{ ...btnBaza, flex: 1, justifyContent: "center" }}>Înapoi</button>
                    <button disabled={lucru} onClick={async () => {
                      if (motiv.trim().length < ANULARI_MOTIV_MIN) { salveaza(`Scrie un motiv de cel puțin ${ANULARI_MOTIV_MIN} caractere.`); return; }
                      if (await anuleazaProgramare(p, motiv)) setGestionat(null);
                    }} style={{ ...btnBaza, flex: 2, justifyContent: "center", border: "none", background: "#EF4444", color: "#fff", opacity: lucru ? .6 : 1 }}>
                      {lucru ? "Se anulează..." : "Anulează"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
