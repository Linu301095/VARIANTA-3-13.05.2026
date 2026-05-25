"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

type StatusProg = "în așteptare" | "confirmat" | "finalizat" | "anulat";
type ProgramareSalon = {
  id: string;
  user_id: string;
  client: string;
  animal: string;
  talie?: string | null;
  serviciu: string;
  ora: string;
  data: string;
  pret: number;
  status: StatusProg;
  esteApp: boolean;
};

type Notificare = { id: string; tip: string; mesaj: string; citit: boolean; created_at: string; programare_id: string | null };

type VizitaIstoric = { id: string; serviciu: string; pret: number; data: string; ora: string; status: StatusProg };
type AnimalIstoric = {
  id: string; nume: string; specie: string; sex: string; rasa: string;
  greutate: number | null; talie: string | null; varsta: number | null;
  alergii: string; poza_url: string | null; stapanNume: string; stapanTelefon: string | null; stapanUserId: string | null;
  vizite: VizitaIstoric[]; totalCheltuit: number; ultimaVizita: string | null;
};

type Tab = "agenda" | "statistici" | "program" | "notificari" | "profil-salon" | "servicii" | "echipa" | "animale" | "abonament" | "setari" | "ajutor";
type PreturiTalie = { mica: string; medie: string; mare: string };
type Serviciu = { id: number; nume: string; pret: string; durata: string; preturi?: PreturiTalie; durate?: PreturiTalie };
type Groomer = { id: number; nume: string; specialitate: string };
type ProgramZi = { activ: boolean; start: string; end: string };
type ProgramSaptamanal = Record<string, ProgramZi>;
type SlotProgramare = { id: string; ora: string; durata: number; status: string; sursa: string; serviciu: string; nume_client_extern: string | null };

const AZI = new Date();
const ZILE = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sam", "Dum"];
const LUNA = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PROGRAM_DEFAULT: ProgramSaptamanal = {
  "1": { activ: true, start: "09:00", end: "18:00" },
  "2": { activ: true, start: "09:00", end: "18:00" },
  "3": { activ: true, start: "09:00", end: "18:00" },
  "4": { activ: true, start: "09:00", end: "18:00" },
  "5": { activ: true, start: "09:00", end: "18:00" },
  "6": { activ: false, start: "10:00", end: "14:00" },
  "0": { activ: false, start: "10:00", end: "14:00" },
};
const ZILE_LABEL: Record<string, string> = { "1": "Luni", "2": "Marți", "3": "Miercuri", "4": "Joi", "5": "Vineri", "6": "Sâmbătă", "0": "Duminică" };
const ZILE_ORDINE = ["1", "2", "3", "4", "5", "6", "0"];
const STEP_SLOT = 30;

function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minToTime(m: number) { const h = Math.floor(m / 60), mm = m % 60; return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; }
function genereazaSloturiZi(prog: ProgramZi, step = STEP_SLOT): string[] {
  if (!prog.activ) return [];
  const startM = timeToMin(prog.start), endM = timeToMin(prog.end);
  const out: string[] = [];
  for (let m = startM; m + step <= endM; m += step) out.push(minToTime(m));
  return out;
}
function suprapunere(slot: string, durataSlot: number, p: { ora: string; durata: number | null }) {
  const slotS = timeToMin(slot), slotE = slotS + durataSlot;
  const pS = timeToMin(p.ora), pE = pS + (p.durata || 60);
  return slotS < pE && slotE > pS;
}
function isoData(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function specieIcon(specie?: string) {
  return specie === "pisica" ? "🐱" : specie === "iepure" ? "🐰" : specie === "pasare" ? "🐦" : specie === "rozator" ? "🐹" : specie === "reptila" ? "🦎" : specie === "altele" ? "✨" : "🐶";
}
function talieLabel(t?: string | null) {
  return t === "mica" ? "🐕‍🦺 Mică" : t === "medie" ? "🐕 Medie" : t === "mare" ? "🐺 Mare" : null;
}
const ORE_OPTIUNI: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 30) out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  return out;
})();

/* ── Color palette ── */
const C = {
  light: {
    pageBg: "#FAFAFA", surface: "#ffffff", surface2: "#F9FAFB", surface3: "#F3F4F6",
    text: "#1A1A1A", text2: "#374151", muted: "#6B7280", xmuted: "#9CA3AF",
    border: "#EBEBEB", border2: "#F3F4F6", input: "#ffffff",
    orangeAccent: "#FFF3EA", orangeBorder: "#FFDCC6",
    shadow: "0 8px 32px rgba(0,0,0,.12)", cardShadow: "0 2px 12px rgba(0,0,0,.05)",
  },
  dark: {
    pageBg: "#0A0A0A", surface: "#161616", surface2: "#1F1F1F", surface3: "#262626",
    text: "#F5F5F5", text2: "#E5E7EB", muted: "#9CA3AF", xmuted: "#6B7280",
    border: "#2A2A2A", border2: "#2A2A2A", input: "#111111",
    orangeAccent: "rgba(255,107,0,0.13)", orangeBorder: "rgba(255,107,0,0.25)",
    shadow: "0 8px 32px rgba(0,0,0,.5)", cardShadow: "0 2px 12px rgba(0,0,0,.4)",
  },
};

type ColorSet = typeof C.light;
type ThemeCtxType = { theme: "light" | "dark"; c: ColorSet; toggleTheme: (t: "light" | "dark") => void };
const ThemeCtx = createContext<ThemeCtxType>({ theme: "light", c: C.light, toggleTheme: () => {} });

const btnPrimary: React.CSSProperties = { padding: "12px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 16px rgba(255,107,0,.35)" };

export default function DashboardSalon() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [salonData, setSalonData] = useState<any>(null);
  const [abonament, setAbonament] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("statistici");
  const [isMobile, setIsMobile] = useState(false);
  const [programari, setProgramari] = useState<ProgramareSalon[]>([]);
  const [notificari, setNotificari] = useState<Notificare[]>([]);
  const [userId, setUserId] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [profilSalon, setProfilSalon] = useState({ numeSalon: "", adresa: "", oras: "", telefon: "", descriere: "" });
  const [pozaUrl, setPozaUrl] = useState<string | null>(null);
  const [galerie, setGalerie] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGalerie, setUploadingGalerie] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [servicii, setServicii] = useState<Serviciu[]>([
    { id: 1, nume: "Tuns complet", pret: "80", durata: "60" },
    { id: 2, nume: "Baita + uscare", pret: "50", durata: "40" },
    { id: 3, nume: "Tuns + Baita + Unghii", pret: "120", durata: "90" },
  ]);
  const [echipa, setEchipa] = useState<Groomer[]>([
    { id: 1, nume: "Maria Ionescu", specialitate: "Rase mici" },
    { id: 2, nume: "Andrei Pop", specialitate: "Rase mari" },
  ]);
  const [program, setProgram] = useState<ProgramSaptamanal>(PROGRAM_DEFAULT);
  const [zilaSelectata, setZilaSelectata] = useState<string>(() => isoData(new Date()));
  const [filtruTalie, setFiltruTalie] = useState<"toate" | "mica" | "medie" | "mare">("toate");
  const [animaleIstoric, setAnimaleIstoric] = useState<AnimalIstoric[]>([]);
  const [cautareAnimal, setCautareAnimal] = useState("");
  const [animalDeschis, setAnimalDeschis] = useState<string | null>(null);
  const [clientiBlocati, setClientiBlocati] = useState<string[]>([]);
  const [abateriMap, setAbateriMap] = useState<Record<string, number>>({});
  const [sloturiZi, setSloturiZi] = useState<SlotProgramare[]>([]);
  const [modalBlocare, setModalBlocare] = useState<{ slot: string; durata: number } | null>(null);
  const [tipBlocare, setTipBlocare] = useState<"telefonic" | "walkin" | "blocaj">("telefonic");
  const [numeBlocare, setNumeBlocare] = useState("");
  const [durataBlocare, setDurataBlocare] = useState(60);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem("calyhub_theme") === "dark") {
        setTheme("dark");
        document.documentElement.dataset.theme = "dark";
      }
    } catch {}

    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }
      setUserId(authUser.id);

      const { data: profile } = await supabase
        .from("profiluri")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setUser({ ...profile, email: authUser.email });
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        if (profile.tema === "dark") {
          setTheme("dark");
          document.documentElement.dataset.theme = "dark";
          try { localStorage.setItem("calyhub_theme", "dark"); } catch {}
        }
      }

      const { data: salonRow } = await supabase
        .from("saloane")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      if (salonRow) {
        setSalonData(salonRow);
        setProfilSalon({
          numeSalon: salonRow.nume || "",
          adresa: salonRow.adresa || "",
          oras: salonRow.oras || "",
          telefon: salonRow.telefon || "",
          descriere: salonRow.descriere || "",
        });
        if (salonRow.poza_url) setPozaUrl(salonRow.poza_url);
        if (salonRow.galerie && Array.isArray(salonRow.galerie)) setGalerie(salonRow.galerie);
        if (salonRow.program && typeof salonRow.program === "object" && Object.keys(salonRow.program).length > 0) {
          setProgram({ ...PROGRAM_DEFAULT, ...salonRow.program });
        }
        if (salonRow.servicii) setServicii(salonRow.servicii.map((s: any, i: number) => ({ ...s, id: i + 1 })));
        if (salonRow.echipa) setEchipa(salonRow.echipa.map((g: any, i: number) => ({ ...g, id: i + 1 })));
        setAbonament({ plan: salonRow.plan || "starter" });
        if (Array.isArray(salonRow.clienti_blocati)) setClientiBlocati(salonRow.clienti_blocati);

        await autoFinalizeaza(salonRow.id);
        await loadProgramari(salonRow.id);
        await loadAbateri(salonRow.id);
        await loadAnimaleIstoric(salonRow.id);
        await loadNotificari(authUser.id);
      }
    }

    async function loadAbateri(salonId: string) {
      const { data } = await supabase
        .from("programari")
        .select("user_id")
        .eq("salon_id", salonId)
        .eq("status", "anulat")
        .not("motiv_anulare", "is", null);
      const map: Record<string, number> = {};
      (data || []).forEach((p: any) => { if (p.user_id) map[p.user_id] = (map[p.user_id] || 0) + 1; });
      setAbateriMap(map);
    }

    async function autoFinalizeaza(salonId: string) {
      const now = new Date();
      const aziIso = isoData(now);
      const minActuale = now.getHours() * 60 + now.getMinutes();
      const { data } = await supabase
        .from("programari")
        .select("id, data, ora, durata, sursa")
        .eq("salon_id", salonId)
        .eq("status", "confirmat");
      if (!data || data.length === 0) return;
      const expirate = data.filter((p: any) => {
        if (p.sursa === "blocaj") return false;
        if (p.data < aziIso) return true;
        if (p.data === aziIso) return timeToMin(p.ora) + (p.durata || 60) <= minActuale;
        return false;
      }).map((p: any) => p.id);
      if (expirate.length === 0) return;
      await supabase.from("programari").update({ status: "finalizat" }).in("id", expirate);
    }

    async function loadAnimaleIstoric(salonId: string) {
      const { data } = await supabase
        .from("programari")
        .select("id, serviciu, pret, data, ora, status, animal_id, user_id, sursa")
        .eq("salon_id", salonId)
        .in("status", ["finalizat", "confirmat"])
        .not("animal_id", "is", null)
        .order("data", { ascending: false });

      if (!data || data.length === 0) { setAnimaleIstoric([]); return; }

      const aziIso = isoData(new Date());
      const istoric = data.filter((p: any) => {
        const esteApp = !p.sursa || p.sursa === "app";
        if (!esteApp) return false;
        if (p.status === "finalizat") return true;
        if (p.status === "confirmat" && p.data < aziIso) return true;
        return false;
      });
      if (istoric.length === 0) { setAnimaleIstoric([]); return; }

      const animalIds = [...new Set(istoric.map((p: any) => p.animal_id))];
      const userIds = [...new Set(istoric.map((p: any) => p.user_id).filter(Boolean))];

      const [{ data: animals }, { data: profiles }] = await Promise.all([
        supabase.from("animale").select("id, nume, specie, sex, rasa, greutate, talie, varsta, alergii, poza_url, user_id").in("id", animalIds),
        userIds.length > 0 ? supabase.from("profiluri").select("id, nume, telefon").in("id", userIds) : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      const animalMap = Object.fromEntries((animals || []).map((a: any) => [a.id, a]));

      const grupat: Record<string, AnimalIstoric> = {};
      for (const p of istoric) {
        const a = animalMap[p.animal_id];
        if (!a) continue;
        if (!grupat[p.animal_id]) {
          const prof = profileMap[a.user_id] || profileMap[p.user_id];
          grupat[p.animal_id] = {
            id: a.id, nume: a.nume, specie: a.specie, sex: a.sex, rasa: a.rasa,
            greutate: a.greutate ?? null, talie: a.talie ?? null, varsta: a.varsta ?? null,
            alergii: a.alergii || "", poza_url: a.poza_url || null,
            stapanNume: prof?.nume || "—", stapanTelefon: prof?.telefon || null, stapanUserId: a.user_id || p.user_id || null,
            vizite: [], totalCheltuit: 0, ultimaVizita: null,
          };
        }
        grupat[p.animal_id].vizite.push({ id: p.id, serviciu: p.serviciu, pret: Number(p.pret) || 0, data: p.data, ora: p.ora, status: p.status as StatusProg });
        grupat[p.animal_id].totalCheltuit += Number(p.pret) || 0;
      }

      const lista = Object.values(grupat).map(a => {
        a.vizite.sort((x, y) => (x.data < y.data ? 1 : x.data > y.data ? -1 : (x.ora < y.ora ? 1 : -1)));
        a.ultimaVizita = a.vizite[0]?.data || null;
        return a;
      });
      lista.sort((a, b) => ((a.ultimaVizita || "") < (b.ultimaVizita || "") ? 1 : -1));
      setAnimaleIstoric(lista);
    }

    async function loadNotificari(uid: string) {
      const { data } = await supabase
        .from("notificari")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setNotificari(data);
    }

    async function loadProgramari(salonId: string) {
      const { data } = await supabase
        .from("programari")
        .select("id, ora, data, serviciu, pret, status, user_id, animal_id, sursa, nume_client_extern, durata, talie_animal")
        .eq("salon_id", salonId)
        .neq("status", "anulat")
        .order("data", { ascending: true })
        .order("ora", { ascending: true });

      if (!data || data.length === 0) { setProgramari([]); return; }

      const userIds = [...new Set(data.map((p: any) => p.user_id).filter(Boolean))];
      const animalIds = [...new Set(data.map((p: any) => p.animal_id).filter(Boolean))];

      const [{ data: profiles }, { data: animals }] = await Promise.all([
        userIds.length > 0 ? supabase.from("profiluri").select("id, nume").in("id", userIds) : Promise.resolve({ data: [] }),
        animalIds.length > 0 ? supabase.from("animale").select("id, nume, specie, sex, rasa, greutate, talie").in("id", animalIds) : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      const animalMap = Object.fromEntries((animals || []).map((a: any) => [a.id, a]));

      setProgramari(data.map((p: any) => {
        const profil = profileMap[p.user_id];
        const animal = animalMap[p.animal_id];
        const specieIcon = animal?.specie === "pisica" ? "🐱" : animal?.specie === "iepure" ? "🐰" : animal?.specie === "pasare" ? "🐦" : animal?.specie === "rozator" ? "🐹" : animal?.specie === "reptila" ? "🦎" : animal?.specie === "altele" ? "✨" : "🐶";
        const sexIcon = animal?.sex === "femela" ? "♀️" : animal?.sex === "mascul" ? "♂️" : "";
        const talieEf = p.talie_animal || animal?.talie;
        const talieTxt = talieEf === "mica" ? "🐕‍🦺 Mică" : talieEf === "medie" ? "🐕 Medie" : talieEf === "mare" ? "🐺 Mare" : null;
        const detalii = [animal?.rasa, animal?.greutate ? `${animal.greutate}kg` : null, talieTxt, sexIcon].filter(Boolean).join(", ");
        const esteApp = !p.sursa || p.sursa === "app";
        const clientNume = esteApp ? (profil?.nume || "—") : (p.nume_client_extern || (p.sursa === "telefonic" ? "📞 Client telefonic" : p.sursa === "walkin" ? "🚶 Walk-in" : "⏸ Indisponibil"));
        const animalText = esteApp
          ? (animal?.nume ? `${specieIcon} ${animal.nume}${detalii ? ` (${detalii})` : ""}` : "—")
          : (p.sursa === "blocaj" ? "—" : "Adăugat manual");
        return {
          id: p.id,
          user_id: p.user_id,
          client: clientNume,
          animal: animalText,
          talie: talieEf || null,
          serviciu: p.serviciu,
          ora: p.ora,
          data: p.data,
          pret: Number(p.pret) || 0,
          status: p.status as StatusProg,
          esteApp,
        };
      }));
    }
    loadData();
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) return;
      channel = supabase
        .channel(`notificari-salon-${u.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notificari", filter: `user_id=eq.${u.id}` },
          (payload) => setNotificari(prev => [payload.new as Notificare, ...prev])
        )
        .subscribe();
    });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  function formatTimp(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "acum";
    if (min < 60) return `acum ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `acum ${h}h`;
    const d = Math.floor(h / 24);
    if (d === 1) return "ieri";
    return `acum ${d} zile`;
  }

  async function toggleTheme(t: "light" | "dark") {
    setTheme(t);
    document.documentElement.dataset.theme = t === "light" ? "" : t;
    try { if (t === "dark") localStorage.setItem("calyhub_theme", "dark"); else localStorage.removeItem("calyhub_theme"); } catch {}
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { error } = await supabase.from("profiluri").update({ tema: t }).eq("id", authUser.id);
      if (error) console.error("Theme save error:", error);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    document.documentElement.dataset.theme = "";
    router.push("/login");
  }

  const c = C[theme];
  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${c.border}`, fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", background: c.input, color: c.text };

  const numeSalon = salonData?.nume || "Salonul tau";
  const numeComplet = user?.nume?.split(" ")[0] || "Manager";
  const SUB_TABS: Tab[] = ["profil-salon", "servicii", "echipa", "animale", "abonament", "setari", "ajutor"];
  const isSubTab = SUB_TABS.includes(tab);
  const TAB_LABELS: Record<Tab, string> = {
    agenda: "Agenda", statistici: "Statistici", program: "Program", notificari: "Notificări",
    "profil-salon": "Profilul salonului", servicii: "Serviciile mele",
    echipa: "Echipa mea", animale: "Istoric animale", abonament: "Abonamentul meu", setari: "Setări cont", ajutor: "Ajutor",
  };
  const necitite = notificari.filter(n => !n.citit).length;

  async function accepta(id: string) {
    const { error } = await supabase.from("programari").update({ status: "confirmat" }).eq("id", id);
    if (error) { console.error("Accept error:", error); return; }
    const prog = programari.find(p => p.id === id);
    setProgramari(p => p.map(pr => pr.id === id ? { ...pr, status: "confirmat" } : pr));
    if (prog?.user_id) {
      await supabase.from("notificari").insert({
        user_id: prog.user_id,
        tip: "confirmat",
        mesaj: `✅ ${numeSalon} a confirmat programarea ta — ${prog.serviciu}`,
        programare_id: id,
      });
    }
  }

  async function respinge(id: string) {
    const { error } = await supabase.from("programari").update({ status: "anulat" }).eq("id", id);
    if (error) { console.error("Reject error:", error); return; }
    const prog = programari.find(p => p.id === id);
    setProgramari(p => p.filter(pr => pr.id !== id));
    if (prog?.user_id) {
      await supabase.from("notificari").insert({
        user_id: prog.user_id,
        tip: "anulat",
        mesaj: `❌ ${numeSalon} a respins programarea ta — ${prog.serviciu}`,
        programare_id: id,
      });
    }
  }
  function salveaza(msg: string) { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); }

  async function toggleBlocClient(clientUserId: string) {
    if (!salonData?.id || !clientUserId) return;
    const blocat = clientiBlocati.includes(clientUserId);
    const noua = blocat ? clientiBlocati.filter(id => id !== clientUserId) : [...clientiBlocati, clientUserId];
    const { error } = await supabase.from("saloane").update({ clienti_blocati: noua }).eq("id", salonData.id);
    if (error) { salveaza("Eroare la salvare"); console.error(error); return; }
    setClientiBlocati(noua);
    salveaza(blocat ? "Client deblocat" : "Client blocat — nu mai poate rezerva");
  }

  async function salveazaProgram() {
    if (!salonData?.id) return;
    const { error } = await supabase.from("saloane").update({ program }).eq("id", salonData.id);
    if (error) { salveaza("Eroare la salvare orar"); console.error(error); return; }
    salveaza("Orar salvat!");
  }

  async function loadSloturiZi(salonId: string, zi: string) {
    const { data } = await supabase
      .from("programari")
      .select("id, ora, durata, status, sursa, serviciu, nume_client_extern")
      .eq("salon_id", salonId)
      .eq("data", zi)
      .neq("status", "anulat");
    setSloturiZi((data as SlotProgramare[]) || []);
  }

  useEffect(() => {
    if (salonData?.id && tab === "program") loadSloturiZi(salonData.id, zilaSelectata);
  }, [salonData?.id, zilaSelectata, tab]);

  async function blocheazaSlot() {
    if (!salonData?.id || !userId || !modalBlocare) return;
    const sursa = tipBlocare;
    const serviciu = tipBlocare === "blocaj" ? "Pauză / Indisponibil" : tipBlocare === "walkin" ? "Walk-in" : "Programare telefonică";
    const { data: nou, error } = await supabase.from("programari").insert({
      user_id: userId,
      salon_id: salonData.id,
      serviciu,
      pret: 0,
      data: zilaSelectata,
      ora: modalBlocare.slot,
      durata: durataBlocare,
      status: "confirmat",
      sursa,
      nume_client_extern: numeBlocare.trim() || null,
    }).select("id, ora, durata, status, sursa, serviciu, nume_client_extern").single();
    if (error || !nou) { salveaza("Eroare la blocare"); console.error(error); return; }
    setSloturiZi(s => [...s, nou as SlotProgramare]);
    setModalBlocare(null);
    setNumeBlocare("");
    salveaza("Slot blocat");
  }

  async function deblocheazaSlot(id: string) {
    const { error } = await supabase.from("programari").delete().eq("id", id);
    if (error) { salveaza("Eroare la deblocare"); return; }
    setSloturiZi(s => s.filter(x => x.id !== id));
    salveaza("Slot deblocat");
  }

  async function uploadAvatar(file: File) {
    if (!userId) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { salveaza("Eroare la upload!"); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiluri").update({ avatar_url: url }).eq("id", userId);
    setAvatarUrl(url);
    setUploadingAvatar(false);
    salveaza("Avatar actualizat!");
  }

  async function stergeAvatar() {
    if (!userId) return;
    await supabase.from("profiluri").update({ avatar_url: null }).eq("id", userId);
    setAvatarUrl(null);
    salveaza("Avatar șters!");
  }

  async function uploadCover(file: File) {
    if (!salonData?.id) return;
    setUploadingCover(true);
    const ext = file.name.split(".").pop();
    const path = `${salonData.user_id}/cover.${ext}`;
    const { error: upErr } = await supabase.storage.from("saloane").upload(path, file, { upsert: true });
    if (upErr) { salveaza("Eroare la upload!"); setUploadingCover(false); return; }
    const { data: urlData } = supabase.storage.from("saloane").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("saloane").update({ poza_url: url }).eq("id", salonData.id);
    setPozaUrl(url);
    setSalonData((s: any) => ({ ...s, poza_url: url }));
    setUploadingCover(false);
    salveaza("Poza de prezentare actualizată!");
  }

  async function uploadGalerie(files: FileList) {
    if (!salonData?.id) return;
    setUploadingGalerie(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `${salonData.user_id}/gallery/${Date.now()}_${i}.${ext}`;
      const { error: upErr } = await supabase.storage.from("saloane").upload(path, file, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("saloane").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }
    }
    const updated = [...galerie, ...newUrls];
    await supabase.from("saloane").update({ galerie: updated }).eq("id", salonData.id);
    setGalerie(updated);
    setUploadingGalerie(false);
    salveaza(`${newUrls.length} poze adăugate în galerie!`);
  }

  async function stergeGalerie(url: string) {
    const updated = galerie.filter(u => u !== url);
    await supabase.from("saloane").update({ galerie: updated }).eq("id", salonData.id);
    setGalerie(updated);
    salveaza("Poza ștearsă din galerie!");
  }

  return (
    <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
      <div style={{ minHeight: "100vh", background: c.pageBg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
        {savedMsg && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1A1A1A", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>✓ {savedMsg}</div>}

        {/* Header */}
        <header style={{ position: "sticky", top: 0, zIndex: 100, background: c.surface, borderBottom: `1px solid ${c.border}`, height: 66 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            {/* Left: logo + name OR back button when in sub-tab */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexShrink: 0 }}>
              {!(isMobile && isSubTab) && (
                <Image src="/logo.png" alt="CalyHub" width={110} height={38} style={{ height: 38, width: "auto", objectFit: "contain", flexShrink: 0 }} priority />
              )}
              {!isMobile && !isSubTab && (
                <>
                  <div style={{ width: 1, height: 24, background: c.border, flexShrink: 0 }} />
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: c.text, whiteSpace: "nowrap" }}>{numeSalon}</div>
                    <div style={{ fontSize: 11, color: c.xmuted }}>Panou de control</div>
                  </div>
                </>
              )}
              {isSubTab && (
                <>
                  <button onClick={() => setTab("statistici")}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, fontSize: 13, fontWeight: 700, color: c.muted, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                    ← Înapoi
                  </button>
                  {!isMobile && <div style={{ fontSize: 13, fontWeight: 800, color: c.text, whiteSpace: "nowrap" }}>{TAB_LABELS[tab]}</div>}
                </>
              )}
            </div>

            {/* Center: main tab buttons (only when not in sub-tab) */}
            {!isSubTab && (
              <div style={{ display: "flex", alignItems: "center", gap: 2, flex: "0 1 auto", overflow: "hidden" }}>
                {([["statistici", "📊", "Statistici"], ["agenda", "📅", "Agenda"], ["program", "🕐", "Program"], ["notificari", "🔔", `Notificări${necitite > 0 ? ` (${necitite})` : ""}`]] as const).map(([t, icon, label]) => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: isMobile ? "7px 10px" : "7px 16px", borderRadius: 50, border: "none", background: tab === t ? "#FF6B00" : "transparent", color: tab === t ? "#fff" : c.muted, fontSize: isMobile ? 18 : 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s", position: "relative" }}>
                    {isMobile ? icon : label}
                    {isMobile && t === "notificari" && necitite > 0 && (
                      <span style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Right: user menu */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <UserMenu numeComplet={numeComplet} numeSalon={numeSalon} tab={tab} onLogout={handleLogout} onNav={setTab} isMobile={isMobile} avatarUrl={avatarUrl} />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* AGENDA */}
            {tab === "agenda" && (() => {
              const programariFiltrate = filtruTalie === "toate" ? programari : programari.filter(p => p.talie === filtruTalie);
              return (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: c.text }}>{ZILE[(AZI.getDay() + 6) % 7]}, {AZI.getDate()} {LUNA[AZI.getMonth()]} {AZI.getFullYear()}</h2>
                  <div style={{ fontSize: 13, color: c.xmuted, fontWeight: 600 }}>{programariFiltrate.length} programari{filtruTalie !== "toate" ? ` (din ${programari.length})` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {[
                    { val: "toate", label: "Toate", icon: "📋" },
                    { val: "mica", label: "Mică", icon: "🐕‍🦺" },
                    { val: "medie", label: "Medie", icon: "🐕" },
                    { val: "mare", label: "Mare", icon: "🐺" },
                  ].map(t => (
                    <button key={t.val} onClick={() => setFiltruTalie(t.val as any)}
                      style={{ padding: "7px 14px", borderRadius: 50, border: filtruTalie === t.val ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: filtruTalie === t.val ? c.orangeAccent : c.surface, color: filtruTalie === t.val ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {programariFiltrate.length === 0 && (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 16, border: `1.5px dashed ${c.border}` }}>
                      {filtruTalie === "toate" ? "Nu ai programări încă. Clienții te vor găsi în aplicație și pot rezerva." : `Nicio programare cu talie ${filtruTalie === "mica" ? "Mică" : filtruTalie === "medie" ? "Medie" : "Mare"}.`}
                    </div>
                  )}
                  {programariFiltrate.map(p => {
                    const nou = p.status === "în așteptare";
                    const blocat = p.esteApp && !!p.user_id && clientiBlocati.includes(p.user_id);
                    const abateri = p.esteApp && p.user_id ? (abateriMap[p.user_id] || 0) : 0;
                    return (
                      <div key={p.id} style={{ background: c.surface, borderRadius: 16, padding: "16px 20px", border: blocat ? "2px solid #EF4444" : nou ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: nou ? c.orangeAccent : c.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: nou ? "#FF6B00" : c.muted, flexShrink: 0, textAlign: "center" }}>{p.ora}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: c.text, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                            {p.client}
                            {blocat && <span style={{ fontSize: 11, fontWeight: 800, color: "#EF4444", background: "rgba(239,68,68,.12)", padding: "2px 9px", borderRadius: 50 }}>🔴 Blocat</span>}
                            {abateri > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706", background: "rgba(217,119,6,.12)", padding: "2px 9px", borderRadius: 50 }}>⚠️ {abateri} {abateri === 1 ? "anulare" : "anulări"}</span>}
                          </div>
                          <div style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>{p.animal}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", marginTop: 2 }}>✂️ {p.serviciu}{p.pret > 0 ? ` · ${p.pret} RON` : ""}</div>
                          <div style={{ fontSize: 11, color: c.xmuted, marginTop: 2 }}>📅 {new Date(p.data).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}</div>
                          {p.esteApp && p.user_id && (
                            <button onClick={() => toggleBlocClient(p.user_id)} style={{ marginTop: 8, padding: "5px 12px", borderRadius: 50, border: `1.5px solid ${blocat ? "#10B981" : "#EF4444"}`, background: "transparent", color: blocat ? "#10B981" : "#EF4444", fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                              {blocat ? "✓ Deblochează clientul" : "🚫 Blochează clientul"}
                            </button>
                          )}
                        </div>
                        {nou ? (
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button onClick={() => respinge(p.id)} style={{ padding: "9px 14px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Refuză</button>
                            <button onClick={() => accepta(p.id)} style={{ padding: "9px 18px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 12px rgba(255,107,0,.3)" }}>Acceptă</button>
                          </div>
                        ) : p.status === "confirmat" ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,.15)", padding: "6px 14px", borderRadius: 50, flexShrink: 0 }}>✓ Confirmat</span>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 700, color: c.muted, background: c.surface2, padding: "6px 14px", borderRadius: 50, flexShrink: 0 }}>{p.status}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })()}

            {/* ISTORIC ANIMALE */}
            {tab === "animale" && (() => {
              const q = cautareAnimal.trim().toLowerCase();
              const lista = q
                ? animaleIstoric.filter(a => a.nume.toLowerCase().includes(q) || a.stapanNume.toLowerCase().includes(q) || (a.rasa || "").toLowerCase().includes(q))
                : animaleIstoric;
              return (
                <div>
                  <PageHeader icon="🐾" title="Istoric animale" sub="Fișa completă a fiecărui animal care a fost la salonul tău" />
                  <div style={{ marginBottom: 16 }}>
                    <input value={cautareAnimal} onChange={e => setCautareAnimal(e.target.value)} placeholder="Caută după nume animal, stăpân sau rasă…" style={inp} />
                  </div>
                  {animaleIstoric.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 16, border: `1.5px dashed ${c.border}` }}>
                      🐾 Niciun animal în istoric încă.<br />Vizitele apar aici după ce programările din aplicație au fost confirmate și au trecut.
                    </div>
                  ) : lista.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: c.muted, fontSize: 14 }}>Niciun rezultat pentru &bdquo;{cautareAnimal}&rdquo;.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {lista.map(a => {
                        const deschis = animalDeschis === a.id;
                        return (
                          <div key={a.id} style={{ background: c.surface, borderRadius: 16, border: deschis ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, overflow: "hidden" }}>
                            <button onClick={() => setAnimalDeschis(deschis ? null : a.id)}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                              <div style={{ width: 50, height: 50, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, overflow: "hidden" }}>
                                {a.poza_url ? <img src={a.poza_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : specieIcon(a.specie)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{specieIcon(a.specie)} {a.nume}</div>
                                <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{[a.rasa, talieLabel(a.talie), a.greutate ? `${a.greutate}kg` : null].filter(Boolean).join(" · ")}</div>
                                <div style={{ fontSize: 11, color: c.xmuted, marginTop: 2 }}>👤 {a.stapanNume}</div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 900, color: "#FF6B00" }}>{a.vizite.length} {a.vizite.length === 1 ? "vizită" : "vizite"}</div>
                                <div style={{ fontSize: 11, color: c.xmuted, marginTop: 2 }}>{a.totalCheltuit} RON total</div>
                              </div>
                              <span style={{ fontSize: 11, color: c.xmuted, transform: deschis ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>▼</span>
                            </button>
                            {deschis && (
                              <div style={{ borderTop: `1px solid ${c.border}`, padding: "14px 18px", background: c.surface2 }}>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                                  {talieLabel(a.talie) && <span style={{ background: c.orangeAccent, color: "#FF6B00", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>{talieLabel(a.talie)}</span>}
                                  {a.sex && <span style={{ background: c.surface3, color: c.text2, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>{a.sex === "femela" ? "♀️ Femelă" : "♂️ Mascul"}</span>}
                                  {a.varsta ? <span style={{ background: c.surface3, color: c.text2, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>{a.varsta} ani</span> : null}
                                  {a.stapanTelefon && <span style={{ background: c.surface3, color: c.text2, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>📞 {a.stapanTelefon}</span>}
                                  {a.alergii && <span style={{ background: "rgba(239,68,68,.12)", color: "#DC2626", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>⚠️ {a.alergii}</span>}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Istoric vizite</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  {a.vizite.map(v => (
                                    <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: c.surface, borderRadius: 10, border: `1px solid ${c.border}` }}>
                                      <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>✂️ {v.serviciu}</div>
                                        <div style={{ fontSize: 11, color: c.xmuted, marginTop: 2 }}>{new Date(v.data).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })} · {v.ora}</div>
                                      </div>
                                      <div style={{ fontSize: 14, fontWeight: 900, color: "#FF6B00" }}>{v.pret} RON</div>
                                    </div>
                                  ))}
                                </div>
                                {a.stapanUserId && (() => {
                                  const blocat = clientiBlocati.includes(a.stapanUserId);
                                  const abateri = abateriMap[a.stapanUserId] || 0;
                                  return (
                                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
                                      <div style={{ fontSize: 12, color: c.muted, fontWeight: 700 }}>
                                        {blocat ? <span style={{ color: "#EF4444" }}>🔴 Client blocat — nu poate rezerva</span> : abateri > 0 ? <span style={{ color: "#D97706" }}>⚠️ {abateri} {abateri === 1 ? "anulare" : "anulări"} cu motiv</span> : <span>✓ Fără anulări</span>}
                                      </div>
                                      <button onClick={() => toggleBlocClient(a.stapanUserId!)} style={{ padding: "7px 16px", borderRadius: 50, border: `1.5px solid ${blocat ? "#10B981" : "#EF4444"}`, background: "transparent", color: blocat ? "#10B981" : "#EF4444", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                        {blocat ? "✓ Deblochează clientul" : "🚫 Blochează clientul"}
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* STATISTICI */}
            {tab === "statistici" && (() => {
              const aziIso = isoData(new Date());
              const now = new Date();
              const lunaCurenta = now.getMonth(), anulCurent = now.getFullYear();
              const isFinalizata = (p: ProgramareSalon) => p.status === "confirmat" || p.status === "finalizat";
              const confirmate = programari.filter(isFinalizata);
              const azi = programari.filter(p => p.data === aziIso);
              const aziConfirmate = azi.filter(isFinalizata);
              const incasariAzi = aziConfirmate.reduce((s, p) => s + (p.pret || 0), 0);
              const lunaProgr = programari.filter(p => {
                const d = new Date(p.data); return d.getMonth() === lunaCurenta && d.getFullYear() === anulCurent;
              });
              const clientiLuna = new Set(lunaProgr.map(p => p.user_id).filter(Boolean)).size;
              const incasariLuna = lunaProgr.filter(isFinalizata).reduce((s, p) => s + (p.pret || 0), 0);
              const servCount: Record<string, number> = {};
              confirmate.forEach(p => { if (p.serviciu) servCount[p.serviciu] = (servCount[p.serviciu] || 0) + 1; });
              const totalServ = Object.values(servCount).reduce((a, b) => a + b, 0);
              const serviciiPop = Object.entries(servCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nume, cnt], i) => ({
                nume, pct: totalServ > 0 ? Math.round((cnt / totalServ) * 100) : 0, cnt,
                col: ["#FF6B00", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"][i],
              }));
              const talieCount = { mica: 0, medie: 0, mare: 0, necunoscuta: 0 };
              confirmate.forEach(p => {
                if (p.talie === "mica") talieCount.mica++;
                else if (p.talie === "medie") talieCount.medie++;
                else if (p.talie === "mare") talieCount.mare++;
                else talieCount.necunoscuta++;
              });
              const totalTalie = talieCount.mica + talieCount.medie + talieCount.mare + talieCount.necunoscuta;
              const LUNI_SCURT = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];
              const ultimeleLuni: { luna: string; val: number }[] = [];
              for (let i = 5; i >= 0; i--) {
                const dt = new Date(anulCurent, lunaCurenta - i, 1);
                const m = dt.getMonth(), y = dt.getFullYear();
                const val = programari.filter(p => {
                  const d = new Date(p.data);
                  return d.getMonth() === m && d.getFullYear() === y && isFinalizata(p);
                }).reduce((s, p) => s + (p.pret || 0), 0);
                ultimeleLuni.push({ luna: LUNI_SCURT[m], val });
              }
              const maxLunar = Math.max(...ultimeleLuni.map(x => x.val), 1);
              return (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
                  {[
                    { icon: "💰", label: "Incasari azi", valoare: `${incasariAzi} RON`, sub: `${aziConfirmate.length} programări confirmate azi`, color: "#10B981" },
                    { icon: "📅", label: "Programari azi", valoare: `${azi.length}`, sub: `${azi.filter(p => p.status === "în așteptare").length} noi · ${aziConfirmate.length} confirmate`, color: "#FF6B00" },
                    { icon: "👥", label: "Clienti luna asta", valoare: `${clientiLuna}`, sub: `${incasariLuna} RON încasați`, color: "#8B5CF6" },
                    { icon: "⭐", label: "Rating mediu", valoare: "—", sub: "În curând (recenzii)", color: "#F59E0B" },
                  ].map(card => (
                    <div key={card.label} style={{ background: c.surface, borderRadius: 18, padding: "18px 20px", border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.07)" }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{card.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{card.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: c.text, lineHeight: 1 }}>{card.valoare}</div>
                      <div style={{ fontSize: 12, color: card.color, fontWeight: 700, marginTop: 6 }}>{card.sub}</div>
                    </div>
                  ))}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: c.text, marginBottom: 20 }}>Statistici lunare</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  <div style={{ background: c.surface, borderRadius: 18, padding: "22px 24px", border: "2px solid #FF6B00" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Incasari ultimele 6 luni (RON)</div>
                    {ultimeleLuni.map(({ luna, val }) => (
                      <div key={luna} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: c.muted }}>{luna}</div>
                        <div style={{ flex: 1, height: 8, background: c.surface3, borderRadius: 4 }}><div style={{ height: "100%", width: `${(val / maxLunar) * 100}%`, background: "#FF6B00", borderRadius: 4 }} /></div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: c.text, width: 60, textAlign: "right" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: c.surface, borderRadius: 18, padding: "22px 24px", border: "2px solid #FF6B00" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Servicii populare</div>
                    {serviciiPop.length === 0 ? (
                      <div style={{ fontSize: 13, color: c.muted, fontStyle: "italic" }}>Niciun serviciu efectuat încă.</div>
                    ) : serviciiPop.map(s => (
                      <div key={s.nume} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700, color: c.text2 }}>{s.nume}</span><span style={{ fontSize: 13, fontWeight: 800, color: s.col }}>{s.pct}%</span></div>
                        <div style={{ height: 6, background: c.surface3, borderRadius: 3 }}><div style={{ height: "100%", width: `${s.pct}%`, background: s.col, borderRadius: 3 }} /></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: c.surface, borderRadius: 18, padding: "22px 24px", border: "2px solid #FF6B00" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Distribuție pe talie</div>
                    {totalTalie === 0 ? (
                      <div style={{ fontSize: 13, color: c.muted, fontStyle: "italic" }}>Nicio programare efectuată încă.</div>
                    ) : (
                      <>
                        {[
                          { key: "mica", label: "🐕‍🦺 Mică", cnt: talieCount.mica, col: "#10B981" },
                          { key: "medie", label: "🐕 Medie", cnt: talieCount.medie, col: "#FF6B00" },
                          { key: "mare", label: "🐺 Mare", cnt: talieCount.mare, col: "#8B5CF6" },
                          ...(talieCount.necunoscuta > 0 ? [{ key: "necunoscuta", label: "📏 Necunoscută", cnt: talieCount.necunoscuta, col: "#9CA3AF" }] : []),
                        ].map(t => {
                          const pct = Math.round((t.cnt / totalTalie) * 100);
                          return (
                            <div key={t.key} style={{ marginBottom: 14 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: c.text2 }}>{t.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color: t.col }}>{t.cnt} ({pct}%)</span>
                              </div>
                              <div style={{ height: 6, background: c.surface3, borderRadius: 3 }}><div style={{ height: "100%", width: `${pct}%`, background: t.col, borderRadius: 3 }} /></div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
              );
            })()}

            {/* NOTIFICARI */}
            {tab === "notificari" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: c.text }}>Notificări</h2>
                  {necitite > 0 && (
                    <button onClick={async () => {
                      await supabase.from("notificari").update({ citit: true }).eq("user_id", userId);
                      setNotificari(n => n.map(x => ({ ...x, citit: true })));
                    }} style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                      Marchează toate citite
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notificari.length === 0 && (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 16, border: `1.5px dashed ${c.border}` }}>
                      Nu ai notificări încă.
                    </div>
                  )}
                  {notificari.map(n => (
                    <div key={n.id} onClick={async () => {
                      if (!n.citit) {
                        await supabase.from("notificari").update({ citit: true }).eq("id", n.id);
                        setNotificari(nots => nots.map(x => x.id === n.id ? { ...x, citit: true } : x));
                      }
                    }}
                      style={{ background: n.citit ? c.surface : c.orangeAccent, borderRadius: 14, padding: "14px 18px", border: n.citit ? `1.5px solid ${c.border}` : "2px solid #FF6B00", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 20, flexShrink: 0 }}>{n.tip === "programare_noua" ? "🔔" : n.tip === "confirmat" ? "✅" : n.tip === "anulat" ? "❌" : "ℹ️"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: n.citit ? 600 : 800, color: c.text, lineHeight: 1.5 }}>{n.mesaj}</div>
                        <div style={{ fontSize: 12, color: c.xmuted, marginTop: 4 }}>{formatTimp(n.created_at)}</div>
                      </div>
                      {!n.citit && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROGRAM */}
            {tab === "program" && (() => {
              const zileLista: { iso: string; eticheta: string; numeZi: string }[] = [];
              const azi0 = new Date(); azi0.setHours(0, 0, 0, 0);
              for (let i = 0; i < 14; i++) {
                const d = new Date(azi0); d.setDate(azi0.getDate() + i);
                const dowIdx = d.getDay();
                const dowKey = String(dowIdx);
                const numeZiScurt = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"][dowIdx];
                zileLista.push({ iso: isoData(d), eticheta: `${numeZiScurt} ${d.getDate()} ${LUNA[d.getMonth()]}`, numeZi: ZILE_LABEL[dowKey] });
              }
              const dowSel = new Date(zilaSelectata + "T00:00:00").getDay();
              const programZiSel = program[String(dowSel)];
              const sloturiPosibile = programZiSel ? genereazaSloturiZi(programZiSel) : [];
              const aziIso = isoData(new Date());
              const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

              return (
                <div style={{ maxWidth: 900 }}>
                  <PageHeader icon="🕐" title="Program & disponibilitate" sub="Setează orarul săptămânal și gestionează sloturile" />

                  {/* ORAR SĂPTĂMÂNAL */}
                  <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: c.text, marginBottom: 16 }}>📅 Orar săptămânal</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {ZILE_ORDINE.map(k => {
                        const z = program[k];
                        return (
                          <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${c.border2}`, flexWrap: "wrap" }}>
                            <button onClick={() => setProgram(p => ({ ...p, [k]: { ...p[k], activ: !p[k].activ } }))}
                              style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: z.activ ? "#FF6B00" : c.surface3, cursor: "pointer", position: "relative", flexShrink: 0 }}>
                              <span style={{ position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)", transition: "left .2s", left: z.activ ? 22 : 2 }} />
                            </button>
                            <div style={{ width: 90, fontSize: 14, fontWeight: 700, color: c.text }}>{ZILE_LABEL[k]}</div>
                            {z.activ ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <select value={z.start} onChange={e => setProgram(p => ({ ...p, [k]: { ...p[k], start: e.target.value } }))}
                                  style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontFamily: "Nunito, sans-serif", fontSize: 13, cursor: "pointer" }}>
                                  {ORE_OPTIUNI.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <span style={{ color: c.muted, fontWeight: 700 }}>→</span>
                                <select value={z.end} onChange={e => setProgram(p => ({ ...p, [k]: { ...p[k], end: e.target.value } }))}
                                  style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontFamily: "Nunito, sans-serif", fontSize: 13, cursor: "pointer" }}>
                                  {ORE_OPTIUNI.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                              </div>
                            ) : (
                              <span style={{ fontSize: 13, color: c.xmuted, fontWeight: 600 }}>Închis</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={salveazaProgram} style={{ ...btnPrimary, marginTop: 18 }}>Salvează orarul</button>
                  </div>

                  {/* GESTIONARE SLOTURI */}
                  <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: c.text, marginBottom: 12 }}>🗓️ Gestionează sloturi (următoarele 14 zile)</div>
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
                      {zileLista.map(z => {
                        const sel = z.iso === zilaSelectata;
                        return (
                          <button key={z.iso} onClick={() => setZilaSelectata(z.iso)}
                            style={{ padding: "10px 14px", borderRadius: 12, border: sel ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: sel ? c.orangeAccent : c.surface, color: sel ? "#FF6B00" : c.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {z.eticheta}
                          </button>
                        );
                      })}
                    </div>

                    {!programZiSel || !programZiSel.activ ? (
                      <div style={{ padding: "28px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface2, borderRadius: 14, border: `1.5px dashed ${c.border}` }}>
                        Salon închis în această zi. Modifică orarul săptămânal pentru a deschide.
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: c.muted, marginBottom: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
                          <span>🟢 Liber</span><span>🟠 Rezervat (CalyHub)</span><span>🔴 Blocat manual</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                          {sloturiPosibile.map(slot => {
                            const ocupare = sloturiZi.find(p => suprapunere(slot, STEP_SLOT, p));
                            const eTrecut = zilaSelectata === aziIso && timeToMin(slot) <= nowMin;
                            let bg = c.surface2, border = c.border, color = c.text, label = slot;
                            if (eTrecut && !ocupare) {
                              bg = c.surface3; color = c.xmuted; label = `${slot} ·`;
                            } else if (ocupare) {
                              if (ocupare.sursa === "app") { bg = theme === "dark" ? "rgba(255,107,0,.18)" : "#FFF3EA"; border = "#FF6B00"; color = "#FF6B00"; }
                              else { bg = theme === "dark" ? "rgba(239,68,68,.18)" : "#FEF2F2"; border = "#EF4444"; color = "#EF4444"; }
                            } else {
                              bg = theme === "dark" ? "rgba(16,185,129,.12)" : "#ECFDF5"; border = "#10B981"; color = "#10B981";
                            }
                            const ocupaPrimulSlot = ocupare && ocupare.ora === slot;
                            return (
                              <button key={slot} disabled={eTrecut && !ocupare} onClick={() => {
                                if (ocupare && ocupaPrimulSlot && ocupare.sursa !== "app") {
                                  if (confirm(`Deblochezi slotul ${ocupare.ora}?`)) deblocheazaSlot(ocupare.id);
                                } else if (!ocupare && !eTrecut) {
                                  setModalBlocare({ slot, durata: 60 });
                                  setDurataBlocare(60);
                                  setTipBlocare("telefonic");
                                  setNumeBlocare("");
                                }
                              }}
                                style={{ padding: "10px 6px", borderRadius: 10, border: `1.5px solid ${border}`, background: bg, color, fontSize: 12, fontWeight: 800, cursor: (eTrecut && !ocupare) ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", textAlign: "center", opacity: eTrecut && !ocupare ? 0.5 : 1 }}>
                                <div>{label}</div>
                                {ocupare && ocupaPrimulSlot && (
                                  <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, opacity: .85 }}>
                                    {ocupare.sursa === "app" ? "App" : ocupare.sursa === "telefonic" ? `📞 ${ocupare.nume_client_extern || "Telefonic"}` : ocupare.sursa === "walkin" ? `🚶 ${ocupare.nume_client_extern || "Walk-in"}` : "⏸ Pauză"}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* MODAL BLOCARE */}
                  {modalBlocare && (
                    <div onClick={() => setModalBlocare(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                      <div onClick={e => e.stopPropagation()} style={{ background: c.surface, borderRadius: 20, padding: "26px", maxWidth: 420, width: "100%", boxShadow: c.shadow }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: c.text, marginBottom: 6 }}>Blochează slot {modalBlocare.slot}</div>
                        <div style={{ fontSize: 13, color: c.muted, marginBottom: 18 }}>Slotul nu va mai apărea disponibil pentru clienții din aplicație.</div>

                        <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 8 }}>Tip blocare</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
                          {[{ v: "telefonic", l: "📞 Telefonic" }, { v: "walkin", l: "🚶 Walk-in" }, { v: "blocaj", l: "⏸ Pauză" }].map(o => (
                            <button key={o.v} onClick={() => setTipBlocare(o.v as any)}
                              style={{ padding: "10px 6px", borderRadius: 10, border: tipBlocare === o.v ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: tipBlocare === o.v ? c.orangeAccent : c.surface, color: tipBlocare === o.v ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                              {o.l}
                            </button>
                          ))}
                        </div>

                        {tipBlocare !== "blocaj" && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 6 }}>Nume client (opțional)</div>
                            <input value={numeBlocare} onChange={e => setNumeBlocare(e.target.value)} placeholder="Ex: Maria, Bibi" style={inp} />
                          </div>
                        )}

                        <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 8 }}>Durată</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 22 }}>
                          {[30, 60, 90, 120].map(d => (
                            <button key={d} onClick={() => setDurataBlocare(d)}
                              style={{ padding: "10px", borderRadius: 10, border: durataBlocare === d ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: durataBlocare === d ? c.orangeAccent : c.surface, color: durataBlocare === d ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                              {d} min
                            </button>
                          ))}
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setModalBlocare(null)} style={{ flex: 1, padding: "12px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Anulează</button>
                          <button onClick={blocheazaSlot} style={{ flex: 2, ...btnPrimary }}>Blochează</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* PROFIL SALON */}
            {tab === "profil-salon" && (
              <div style={{ maxWidth: 560 }}>
                <PageHeader icon="🏪" title="Profilul salonului" sub="Actualizează datele publice ale salonului" />

                {/* POZA DE PREZENTARE */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 14 }}>📷 Poza de prezentare</div>
                  <div style={{ position: "relative", width: "100%", height: 200, borderRadius: 14, overflow: "hidden", background: c.surface2, border: `1.5px dashed ${c.border}`, marginBottom: 14 }}>
                    {pozaUrl ? (
                      <img src={pozaUrl} alt="Cover salon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{ fontSize: 40 }}>📷</span>
                        <span style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>Nicio poză încărcată</span>
                      </div>
                    )}
                  </div>
                  <label style={{ display: "inline-block", cursor: "pointer" }}>
                    <div style={{ padding: "10px 20px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "inline-block" }}>
                      {uploadingCover ? "Se încarcă..." : pozaUrl ? "✏️ Schimbă poza" : "📤 Încarcă poza"}
                    </div>
                    <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingCover}
                      onChange={e => { if (e.target.files?.[0]) uploadCover(e.target.files[0]); }} />
                  </label>
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 8 }}>JPG, PNG, WEBP — max 5MB. Această poză apare pe cardul salonului tău.</div>
                </div>

                {/* GALERIE */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.text2 }}>🖼️ Galerie salon ({galerie.length}/10)</div>
                    {galerie.length < 10 && (
                      <label style={{ cursor: "pointer" }}>
                        <div style={{ padding: "8px 16px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                          {uploadingGalerie ? "Se încarcă..." : "+ Adaugă poze"}
                        </div>
                        <input type="file" accept="image/*" multiple style={{ display: "none" }} disabled={uploadingGalerie}
                          onChange={e => { if (e.target.files?.length) uploadGalerie(e.target.files); }} />
                      </label>
                    )}
                  </div>
                  {galerie.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: c.muted, fontSize: 13 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                      Nicio poză în galerie. Adaugă poze din salonul tău!
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                      {galerie.map((url, i) => (
                        <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: c.surface2 }}>
                          <img src={url} alt={`Galerie ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button onClick={() => stergeGalerie(url)}
                            style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", background: "rgba(239,68,68,.9)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif" }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 10 }}>Clienții văd galeria când intră pe profilul salonului tău. Max 10 poze.</div>
                </div>

                {/* DATE SALON */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 16 }}>📋 Date salon</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[{ key: "numeSalon", label: "Numele salonului", placeholder: "Paws & Style" }, { key: "adresa", label: "Adresa", placeholder: "Str. Florilor nr. 12" }, { key: "oras", label: "Orașul", placeholder: "București" }, { key: "telefon", label: "Telefon public", placeholder: "07XX XXX XXX" }].map(f => (
                      <div key={f.key}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>{f.label}</label>
                        <input value={(profilSalon as any)[f.key]} onChange={e => setProfilSalon(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Descriere scurtă</label>
                      <textarea value={profilSalon.descriere} onChange={e => setProfilSalon(p => ({ ...p, descriere: e.target.value }))} rows={3} placeholder="Salon specializat în..." style={{ ...inp, resize: "vertical" } as React.CSSProperties} />
                    </div>
                    <button onClick={async () => {
                      const { data: { user: authUser } } = await supabase.auth.getUser();
                      if (authUser) {
                        await supabase.from("saloane").update({
                          nume: profilSalon.numeSalon,
                          adresa: profilSalon.adresa,
                          oras: profilSalon.oras,
                          telefon: profilSalon.telefon,
                          descriere: profilSalon.descriere,
                        }).eq("user_id", authUser.id);
                        setSalonData((s: any) => ({ ...s, nume: profilSalon.numeSalon, adresa: profilSalon.adresa, oras: profilSalon.oras, telefon: profilSalon.telefon, descriere: profilSalon.descriere }));
                      }
                      salveaza("Profil salon actualizat!");
                    }} style={btnPrimary}>Salvează modificările</button>
                  </div>
                </div>
              </div>
            )}

            {/* SERVICII */}
            {tab === "servicii" && (
              <div style={{ maxWidth: 580 }}>
                <PageHeader icon="✂️" title="Serviciile mele" sub="Gestioneaza serviciile oferite de salon" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {servicii.map((s, i) => {
                    const preturi = s.preturi || { mica: s.pret || "", medie: s.pret || "", mare: s.pret || "" };
                    const durate = s.durate || { mica: s.durata || "", medie: s.durata || "", mare: s.durata || "" };
                    const TALII = [
                      { key: "mica" as const, label: "Mică", icon: "🐕‍🦺" },
                      { key: "medie" as const, label: "Medie", icon: "🐕" },
                      { key: "mare" as const, label: "Mare", icon: "🐺" },
                    ];
                    return (
                    <div key={s.id} style={{ background: c.surface, borderRadius: 16, padding: "16px 20px", border: `1.5px solid ${c.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00" }}>Serviciul {i + 1}</div>
                        <button onClick={() => setServicii(sv => sv.filter(x => x.id !== s.id))} style={{ fontSize: 12, color: c.xmuted, background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>✕ Sterge</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input value={s.nume} onChange={e => setServicii(sv => sv.map(x => x.id === s.id ? { ...x, nume: e.target.value } : x))} placeholder="Denumire serviciu" style={inp} />
                        <div style={{ fontSize: 12, color: c.muted, fontWeight: 700, marginTop: 4 }}>Preț și durată pe talie (lasă gol dacă nu oferi pentru o talie):</div>
                        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr", gap: 8, alignItems: "center" }}>
                          <div></div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textAlign: "center" }}>Preț (RON)</div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textAlign: "center" }}>Durată (min)</div>
                          {TALII.map(t => (
                            <React.Fragment key={t.key}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: c.text2 }}>
                                <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
                              </div>
                              <input value={preturi[t.key]} onChange={e => {
                                const val = e.target.value;
                                setServicii(sv => sv.map(x => {
                                  if (x.id !== s.id) return x;
                                  const p = { ...(x.preturi || { mica: x.pret || "", medie: x.pret || "", mare: x.pret || "" }), [t.key]: val };
                                  return { ...x, preturi: p, pret: p.medie || p.mica || p.mare || "" };
                                }));
                              }} type="number" placeholder="—" style={{ ...inp, padding: "8px 10px", fontSize: 13 }} />
                              <input value={durate[t.key]} onChange={e => {
                                const val = e.target.value;
                                setServicii(sv => sv.map(x => {
                                  if (x.id !== s.id) return x;
                                  const d = { ...(x.durate || { mica: x.durata || "", medie: x.durata || "", mare: x.durata || "" }), [t.key]: val };
                                  return { ...x, durate: d, durata: d.medie || d.mica || d.mare || "" };
                                }));
                              }} type="number" placeholder="—" style={{ ...inp, padding: "8px 10px", fontSize: 13 }} />
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
                <button onClick={() => setServicii(sv => [...sv, { id: Date.now(), nume: "", pret: "", durata: "", preturi: { mica: "", medie: "", mare: "" }, durate: { mica: "", medie: "", mare: "" } }])} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed #FF6B00`, background: c.orangeAccent, color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", marginBottom: 16 }}>+ Adauga serviciu</button>
                <button onClick={async () => {
                  const { data: { user: authUser } } = await supabase.auth.getUser();
                  if (authUser) {
                    await supabase.from("saloane").update({ servicii }).eq("user_id", authUser.id);
                  }
                  salveaza("Servicii actualizate!");
                }} style={btnPrimary}>Salveaza serviciile</button>
              </div>
            )}

            {/* ECHIPA */}
            {tab === "echipa" && (
              <div style={{ maxWidth: 560 }}>
                <PageHeader icon="👥" title="Echipa mea" sub="Gestioneaza groomerii din salon" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {echipa.map(g => (
                    <div key={g.id} style={{ background: c.surface, borderRadius: 16, padding: "16px 20px", border: `1.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👤</div>
                      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 10, minWidth: 0 }}>
                        <input value={g.nume} onChange={e => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, nume: e.target.value } : x))} placeholder="Nume groomer" style={inp} />
                        <input value={g.specialitate} onChange={e => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, specialitate: e.target.value } : x))} placeholder="Specialitate" style={inp} />
                      </div>
                      <button onClick={() => setEchipa(ec => ec.filter(x => x.id !== g.id))} style={{ fontSize: 13, color: "#EF4444", background: "rgba(239,68,68,.1)", border: "none", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setEchipa(ec => [...ec, { id: Date.now(), nume: "", specialitate: "" }])} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed #FF6B00`, background: c.orangeAccent, color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", marginBottom: 16 }}>+ Adauga groomer</button>
                <button onClick={async () => {
                  const { data: { user: authUser } } = await supabase.auth.getUser();
                  if (authUser) {
                    await supabase.from("saloane").update({ echipa }).eq("user_id", authUser.id);
                  }
                  salveaza("Echipa actualizata!");
                }} style={btnPrimary}>Salveaza echipa</button>
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
                        <div style={{ background: "rgba(255,255,255,.18)", padding: "8px 14px", borderRadius: 50, fontSize: 12, fontWeight: 800 }}>✓ Activ</div>
                      </div>
                      <div style={{ borderTop: "1px solid rgba(255,255,255,.2)", marginTop: 18, paddingTop: 14, fontSize: 13, opacity: .9 }}>
                        Urmatoarea facturare: <strong>{new Date(abonament.dataExpirare).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</strong>
                      </div>
                    </div>

                    <div style={{ background: c.surface, borderRadius: 18, padding: "22px 26px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 14 }}>Detalii facturare</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          ["Plan", abonament.planNume],
                          ["Pret lunar", abonament.pret === 0 ? "Gratuit" : `${abonament.pret} RON`],
                          ["Activat la", new Date(abonament.dataStart).toLocaleDateString("ro-RO")],
                          ["Reinnoire automata", abonament.autoRenew ? "Da" : "Nu"],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${c.border2}` }}>
                            <span style={{ color: c.muted }}>{k}</span>
                            <span style={{ fontWeight: 700, color: c.text }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                      <button onClick={() => router.push("/register/abonament-salon")} style={btnPrimary}>Schimba planul</button>
                      <button onClick={() => salveaza("Cererea de anulare a fost trimisa")} style={{ padding: "12px 24px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.muted, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Anuleaza abonament</button>
                    </div>

                    <div style={{ background: c.surface, borderRadius: 18, padding: "22px 26px", border: `1.5px solid ${c.border}` }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 14 }}>Istoric facturi</div>
                      <div style={{ fontSize: 13, color: c.xmuted, textAlign: "center", padding: "20px 0" }}>Nicio factura emisa inca. Prima va aparea aici dupa primul ciclu de facturare.</div>
                    </div>
                  </>
                ) : (
                  <div style={{ background: c.surface, borderRadius: 20, padding: "32px", border: `1.5px solid ${c.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: c.text, marginBottom: 8 }}>Niciun abonament activ</div>
                    <div style={{ fontSize: 14, color: c.muted, marginBottom: 20 }}>Alege un plan pentru a debloca toate functionalitatile salonului.</div>
                    <button onClick={() => router.push("/register/abonament-salon")} style={btnPrimary}>Alege un plan</button>
                  </div>
                )}
              </div>
            )}

            {/* SETARI */}
            {tab === "setari" && (
              <div style={{ maxWidth: 520 }}>
                <PageHeader icon="🔒" title="Setari cont" sub="Modifica datele contului tau de salon" />

                {/* AVATAR */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 14 }}>📷 Poza de profil</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ width: 96, height: 96, borderRadius: "50%", background: c.orangeAccent, border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0, overflow: "hidden" }}>
                      {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <label style={{ cursor: "pointer" }}>
                        <div style={{ padding: "10px 18px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 13, fontWeight: 800, fontFamily: "Nunito, sans-serif" }}>
                          {uploadingAvatar ? "Se încarcă..." : avatarUrl ? "✏️ Schimbă" : "📤 Încarcă"}
                        </div>
                        <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingAvatar}
                          onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }} />
                      </label>
                      {avatarUrl && (
                        <button onClick={stergeAvatar}
                          style={{ padding: "10px 18px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                          🗑️ Șterge
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 12 }}>JPG, PNG, WEBP — max 5MB</div>
                </div>

                <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {["Parola curenta", "Parola noua", "Confirma parola noua"].map(label => (
                      <div key={label}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>{label}</label>
                        <input type="password" placeholder="••••••••" style={inp} />
                      </div>
                    ))}
                    <button onClick={() => salveaza("Parola schimbata!")} style={{ ...btnPrimary, marginTop: 4 }}>Schimba parola</button>
                  </div>
                </div>
                <div style={{ background: c.surface, borderRadius: 20, padding: "24px 28px", border: `1.5px solid ${c.border}` }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 6 }}>Zona periculoasa</div>
                  <div style={{ fontSize: 13, color: c.muted, marginBottom: 14 }}>Stergerea salonului este permanenta si nu poate fi anulata.</div>
                  <button style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,.1)", border: "none", padding: "9px 18px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Sterge salonul</button>
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
                <div style={{ background: c.orangeAccent, border: `1px solid ${c.orangeBorder}`, borderRadius: 16, padding: "18px 22px", marginTop: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#FF6B00", marginBottom: 4 }}>Suport dedicat parteneri</div>
                  <div style={{ fontSize: 13, color: c.muted }}>Contacteaza-ne la <strong>parteneri@calyhub.ro</strong> sau prin chat prioritar.</div>
                </div>
              </div>
            )}

          </div>
        </main>

        <Footer variant="salon" />
      </div>
    </ThemeCtx.Provider>
  );
}

function UserMenu({ numeComplet, numeSalon, tab, onLogout, onNav, isMobile, avatarUrl }: { numeComplet: string; numeSalon: string; tab: Tab; onLogout: () => void; onNav: (t: Tab) => void; isMobile?: boolean; avatarUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const { theme, c, toggleTheme } = useContext(ThemeCtx);

  const items: { icon: string; label: string; sub: string; t: Tab }[] = [
    { icon: "🏪", label: "Profilul salonului", sub: "Editeaza datele firmei", t: "profil-salon" },
    { icon: "✂️", label: "Serviciile mele", sub: "Adauga / modifica servicii", t: "servicii" },
    { icon: "👥", label: "Echipa mea", sub: "Gestioneaza groomerii", t: "echipa" },
    { icon: "🐾", label: "Istoric animale", sub: "Fișa fiecărui animal programat", t: "animale" },
    { icon: "📊", label: "Statistici", sub: "Vezi rapoarte detaliate", t: "statistici" },
    { icon: "💳", label: "Abonamentul meu", sub: "Plan, facturare, istoric", t: "abonament" },
    { icon: "🔒", label: "Setari cont", sub: "Schimba parola", t: "setari" },
    { icon: "❓", label: "Ajutor", sub: "Support dedicat", t: "ajutor" },
  ];

  return (
    <div style={{ position: "relative" }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, padding: isMobile ? "6px 10px 6px 6px" : "6px 14px 6px 8px", borderRadius: 50, border: open ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: open ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
        <span aria-hidden style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>✂️</span>
        <span style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, overflow: "hidden" }}>
          {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
        </span>
        {!isMobile && <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{numeComplet}</span>}
        <span style={{ fontSize: 10, color: c.xmuted, display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>▼</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 270, background: c.surface, borderRadius: 18, border: `1.5px solid ${c.border}`, boxShadow: c.shadow, overflow: "hidden", zIndex: 200 }}>
          <div style={{ padding: "14px 18px", background: c.orangeAccent, borderBottom: `1px solid ${c.orangeBorder}` }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>{numeSalon}</div>
            <div style={{ fontSize: 12, color: "#FF6B00", fontWeight: 600, marginTop: 2 }}>Cont salon ✂️ · {numeComplet}</div>
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
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🚪</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>Iesire din cont</div>
            </button>
          </div>
        </div>
      )}
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
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{item.q}</span>
            <span style={{ fontSize: 12, color: c.xmuted, flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
          </button>
          {open === i && <div style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, padding: "0 18px 14px" }}>{item.r}</div>}
        </div>
      ))}
    </div>
  );
}
