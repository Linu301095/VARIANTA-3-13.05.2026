"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

const SERVICII_DEMO = [
  { nume: "Tuns complet", pret: "80", durata: "60" },
  { nume: "Băiță + uscare", pret: "50", durata: "40" },
  { nume: "Tuns + Băiță + Unghii", pret: "120", durata: "90" },
  { nume: "Styling complet", pret: "150", durata: "120" },
];

const SALOANE = [
  { id: 1, nume: "Paws & Style", oras: "București, Sector 2", rating: 4.9, recenzii: 127, servicii: ["Tuns", "Băiță", "Unghii"], serviciiComplete: SERVICII_DEMO, pretDe: 80, distanta: "1.2 km", badge: "Top rated", badgeIcon: "⭐", culoare: "#FF6B00", bg: "#FFF3EA" },
  { id: 2, nume: "Fluffy Salon", oras: "București, Sector 1", rating: 4.8, recenzii: 89, servicii: ["Tuns", "Styling", "Spa"], serviciiComplete: SERVICII_DEMO, pretDe: 90, distanta: "2.1 km", badge: "Nou", badgeIcon: "🆕", culoare: "#8B5CF6", bg: "#F5F3FF" },
  { id: 3, nume: "Happy Pets Grooming", oras: "București, Sector 3", rating: 4.7, recenzii: 214, servicii: ["Tuns", "Băiță", "Anti-purici"], serviciiComplete: SERVICII_DEMO, pretDe: 65, distanta: "3.4 km", badge: "Popular", badgeIcon: "🔥", culoare: "#10B981", bg: "#ECFDF5" },
  { id: 4, nume: "Royal Dog Salon", oras: "București, Sector 4", rating: 4.9, recenzii: 56, servicii: ["Premium grooming", "Spa", "Masaj"], serviciiComplete: SERVICII_DEMO, pretDe: 120, distanta: "4.0 km", badge: "Premium", badgeIcon: "👑", culoare: "#F59E0B", bg: "#FFFBEB" },
];

type SalonItem = { id: string | number; nume: string; oras: string; rating: number; recenzii: number; servicii: string[]; serviciiComplete: Serviciu[]; pretDe: number; distanta: string; badge: string; badgeIcon: string; culoare: string; bg: string; poza_url?: string; galerie?: string[]; echipa?: { nume: string; rol?: string; poza?: string; descriere?: string }[]; program?: Record<string, { activ: boolean; start: string; end: string }>; adresa?: string; telefon?: string; descriere?: string };

const PALETA_SALOANE = [
  { badge: "Top rated", badgeIcon: "⭐", culoare: "#FF6B00", bg: "#FFF3EA" },
  { badge: "Nou",       badgeIcon: "🆕", culoare: "#8B5CF6", bg: "#F5F3FF" },
  { badge: "Popular",   badgeIcon: "🔥", culoare: "#10B981", bg: "#ECFDF5" },
  { badge: "Premium",   badgeIcon: "👑", culoare: "#F59E0B", bg: "#FFFBEB" },
];

function mapSalonDB(s: any, i: number): SalonItem {
  const p = PALETA_SALOANE[i % PALETA_SALOANE.length];
  const serviciiArr = Array.isArray(s.servicii) ? s.servicii : [];
  const serviciiComplete: Serviciu[] = serviciiArr
    .filter((sv: any) => sv?.nume)
    .map((sv: any) => ({
      nume: sv.nume,
      pret: String(sv.pret || ""),
      durata: String(sv.durata || ""),
      preturi: sv.preturi ? { mica: String(sv.preturi.mica || ""), medie: String(sv.preturi.medie || ""), mare: String(sv.preturi.mare || "") } : undefined,
      durate: sv.durate ? { mica: String(sv.durate.mica || ""), medie: String(sv.durate.medie || ""), mare: String(sv.durate.mare || "") } : undefined,
    }));
  const preturi = serviciiComplete.map(sv => Number(sv.pret)).filter(n => !isNaN(n) && n > 0);
  const pretDe = preturi.length > 0 ? Math.min(...preturi) : 0;
  const numeServicii = serviciiComplete.map(sv => sv.nume).slice(0, 3);
  return {
    id: s.id,
    nume: s.nume || "Salon",
    oras: s.oras || "România",
    rating: 5.0,
    recenzii: 0,
    servicii: numeServicii.length > 0 ? numeServicii : ["Tuns", "Băiță"],
    serviciiComplete,
    pretDe,
    distanta: "",
    badge: p.badge,
    badgeIcon: p.badgeIcon,
    culoare: p.culoare,
    bg: p.bg,
    poza_url: s.poza_url || null,
    galerie: Array.isArray(s.galerie) ? s.galerie : [],
    echipa: Array.isArray(s.echipa) ? s.echipa : [],
    program: s.program || null,
    adresa: s.adresa || "",
    telefon: s.telefon || "",
    descriere: s.descriere || "",
  };
}

type Tab = "saloane" | "programari" | "profil" | "animal" | "notificari" | "setari" | "ajutor";
type Notificare = { id: string; tip: string; mesaj: string; citit: boolean; created_at: string; programare_id: string | null };

const SPECII = [
  { val: "caine", label: "Câine", icon: "🐶" },
  { val: "pisica", label: "Pisică", icon: "🐱" },
  { val: "iepure", label: "Iepure", icon: "🐰" },
  { val: "pasare", label: "Pasăre", icon: "🐦" },
  { val: "rozator", label: "Rozătoare", icon: "🐹" },
  { val: "reptila", label: "Reptilă", icon: "🦎" },
  { val: "altele", label: "Altele", icon: "✨" },
];

const RASE_PE_SPECII: Record<string, string[]> = {
  caine:   ["Labrador Retriever", "Golden Retriever", "Pudel", "Chihuahua", "Husky Siberian", "Bulldog Francez", "Ciobanesc German", "Shih Tzu", "Bichon Frisé", "Maltez", "Yorkshire Terrier", "Cocker Spaniel", "Beagle", "Pomeranian", "Dachshund", "Boxer", "Dalmatian"],
  pisica:  ["Persan", "Maine Coon", "British Shorthair", "Siam", "Bengal", "Ragdoll", "Abisinian", "Scottish Fold", "Sphynx", "Norwegian Forest", "Turkish Angora", "Russian Blue"],
  iepure:  ["Angora", "Leu (Lionhead)", "Rex", "Mini Rex", "Olandeze (Dutch)", "Flemish Giant", "Lop (Floppy Ears)", "Californian"],
  pasare:  ["Peruș (Budgerigar)", "Papagal African Gri", "Agapornis (Lovebird)", "Nimfă (Cockatiel)", "Canar", "Cacadu (Cockatoo)", "Amazon", "Eclectus"],
  rozator: ["Hamster Syrian", "Hamster Pitic", "Cobai (Guinea Pig)", "Chinchilla", "Gerbil", "Șobolan de companie", "Dihor (Ferret)"],
  reptila: ["Iguana", "Șarpe Corn (Corn Snake)", "Leopard Gecko", "Bearded Dragon", "Blue Tongue Skink", "Cameleon", "Broasca Testoasă"],
  altele:  [],
};
function specieInfo(val?: string) { return SPECII.find(s => s.val === val) || { val: "altele", label: "—", icon: "🐾" }; }

type ProgramZiC = { activ: boolean; start: string; end: string };
type ProgramSaptC = Record<string, ProgramZiC>;
const PROGRAM_DEFAULT_C: ProgramSaptC = {
  "1": { activ: true, start: "09:00", end: "18:00" },
  "2": { activ: true, start: "09:00", end: "18:00" },
  "3": { activ: true, start: "09:00", end: "18:00" },
  "4": { activ: true, start: "09:00", end: "18:00" },
  "5": { activ: true, start: "09:00", end: "18:00" },
  "6": { activ: false, start: "10:00", end: "14:00" },
  "0": { activ: false, start: "10:00", end: "14:00" },
};
const ZILE_SCURT = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
const LUNA_SCURT = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function timeToMinC(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minToTimeC(m: number) { const h = Math.floor(m / 60), mm = m % 60; return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; }
function isoDataC(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function genereazaSloturiClient(prog: ProgramZiC, durata: number, step = 30): string[] {
  if (!prog.activ) return [];
  const startM = timeToMinC(prog.start), endM = timeToMinC(prog.end);
  const out: string[] = [];
  for (let m = startM; m + durata <= endM; m += step) out.push(minToTimeC(m));
  return out;
}
function suprapunereC(slotStart: number, slotEnd: number, ora: string, durata: number | null) {
  const pS = timeToMinC(ora), pE = pS + (durata || 60);
  return slotStart < pE && slotEnd > pS;
}
function sexLabel(val?: string) { return val === "mascul" ? "♂️ Mascul" : val === "femela" ? "♀️ Femelă" : "—"; }
function talieLabel(val?: string) { return val === "mica" ? "Mică" : val === "medie" ? "Medie" : val === "mare" ? "Mare" : "—"; }
function talieIcon(val?: string) { return val === "mica" ? "🐕‍🦺" : val === "medie" ? "🐕" : val === "mare" ? "🐺" : "📏"; }
function getPretDurata(serviciu: any, talie?: string): { pret: string; durata: string } {
  if (!serviciu) return { pret: "", durata: "" };
  const t = (talie === "mica" || talie === "medie" || talie === "mare") ? talie : "medie";
  const p = serviciu.preturi?.[t] || serviciu.pret || "";
  const d = serviciu.durate?.[t] || serviciu.durata || "";
  return { pret: String(p), durata: String(d) };
}
type StatusProgramare = "confirmat" | "în așteptare" | "finalizat" | "anulat";
type Programare = {
  id: string;
  salon_id: string;
  salon_nume: string;
  serviciu: string;
  data: string;
  ora: string;
  status: StatusProgramare;
  pret: number;
};
type PreturiTalie = { mica: string; medie: string; mare: string };
type Serviciu = { nume: string; pret: string; durata: string; preturi?: PreturiTalie; durate?: PreturiTalie };

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
  const [animale, setAnimale] = useState<any[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [tab, setTab] = useState<Tab>("saloane");
  const [salonSelectat, setSalonSelectat] = useState<string | number | null>(null);
  const [saloaneList, setSaloaneList] = useState<SalonItem[]>(SALOANE);
  const [rezervare, setRezervare] = useState<{ salonId: string | number; serviciu: string; ora: string } | null>(null);
  const [confirmat, setConfirmat] = useState(false);
  const [programari, setProgramari] = useState<Programare[]>([]);
  const [confirmareLoading, setConfirmareLoading] = useState(false);
  const [confirmareError, setConfirmareError] = useState("");
  const [notifSettings, setNotifSettings] = useState({ sms: true, email: true, newsletter: false });
  const [notificari, setNotificari] = useState<Notificare[]>([]);
  const [userId, setUserId] = useState("");
  const [profilForm, setProfilForm] = useState({ numeComplet: "", email: "", telefon: "" });
  const [animalForm, setAnimalForm] = useState({ numeAnimal: "", specie: "caine", sex: "", rasa: "", talie: "", greutate: "", varsta: "", alergii: "", vaccinat: false });
  const [savedMsg, setSavedMsg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [dataSelectata, setDataSelectata] = useState<string>(() => isoDataC(new Date()));
  const [anulareModal, setAnulareModal] = useState<Programare | null>(null);
  const [motivAnulare, setMotivAnulare] = useState("");
  const [anulareLoading, setAnulareLoading] = useState(false);
  const [anulareError, setAnulareError] = useState("");
  const [programSalon, setProgramSalon] = useState<ProgramSaptC | null>(null);
  const [ocupariSalon, setOcupariSalon] = useState<{ ora: string; durata: number | null; data: string }[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [profilSalonTab, setProfilSalonTab] = useState<"servicii" | "specialisti" | "recenzii" | "contact">("servicii");
  const [groomerSelectat, setGroomerSelectat] = useState<string | null>(null);
  const [rezervareActiva, setRezervareActiva] = useState(false);
  const animal = animale.find(a => a.id === selectedAnimalId) || animale[0] || null;

  useEffect(() => {
    try {
      if (localStorage.getItem("calyhub_theme") === "dark") {
        setTheme("dark");
        document.documentElement.dataset.theme = "dark";
      }
    } catch {}

    async function loadUser() {
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
        setProfilForm({ numeComplet: profile.nume || "", email: authUser.email || "", telefon: profile.telefon || "" });
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        if (profile.tema === "dark") {
          setTheme("dark");
          document.documentElement.dataset.theme = "dark";
          try { localStorage.setItem("calyhub_theme", "dark"); } catch {}
        }
      }

      const { data: animaleData } = await supabase
        .from("animale")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: true });

      if (animaleData && animaleData.length > 0) {
        setAnimale(animaleData);
        setSelectedAnimalId(animaleData[0].id);
      }

      const { data: dbSaloane } = await supabase
        .from("saloane")
        .select("id, nume, oras, servicii, poza_url, galerie, echipa, program, adresa, telefon, descriere")
        .order("created_at", { ascending: false });

      if (dbSaloane && dbSaloane.length > 0) {
        setSaloaneList(dbSaloane.map(mapSalonDB));
      }

      await autoFinalizeaza(authUser.id);
      await loadProgramari(authUser.id);
      await loadNotificari(authUser.id);
    }

    async function autoFinalizeaza(userId: string) {
      const now = new Date();
      const aziIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const minActuale = now.getHours() * 60 + now.getMinutes();
      const { data } = await supabase
        .from("programari")
        .select("id, data, ora, durata, sursa")
        .eq("user_id", userId)
        .eq("status", "confirmat");
      if (!data || data.length === 0) return;
      const expirate = data.filter((p: any) => {
        if (p.sursa === "blocaj") return false;
        if (p.data < aziIso) return true;
        if (p.data === aziIso) return timeToMinC(p.ora) + (p.durata || 60) <= minActuale;
        return false;
      }).map((p: any) => p.id);
      if (expirate.length === 0) return;
      await supabase.from("programari").update({ status: "finalizat" }).in("id", expirate);
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

    async function loadProgramari(userId: string) {
      const { data } = await supabase
        .from("programari")
        .select("id, salon_id, serviciu, pret, data, ora, status, saloane(nume)")
        .eq("user_id", userId)
        .order("data", { ascending: false })
        .order("ora", { ascending: false });

      if (data) {
        setProgramari(data.map((p: any) => ({
          id: p.id,
          salon_id: p.salon_id,
          salon_nume: p.saloane?.nume || "Salon necunoscut",
          serviciu: p.serviciu,
          data: p.data,
          ora: p.ora,
          status: p.status as StatusProgramare,
          pret: Number(p.pret) || 0,
        })));
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!salonSelectat) { setProgramSalon(null); setOcupariSalon([]); return; }
    (async () => {
      const { data: salonRow } = await supabase.from("saloane").select("program").eq("id", salonSelectat).single();
      const prog = salonRow?.program && typeof salonRow.program === "object" && Object.keys(salonRow.program).length > 0
        ? { ...PROGRAM_DEFAULT_C, ...salonRow.program } : PROGRAM_DEFAULT_C;
      setProgramSalon(prog);

      const azi = new Date(); azi.setHours(0, 0, 0, 0);
      const peste14 = new Date(azi); peste14.setDate(azi.getDate() + 15);
      const { data: rows } = await supabase
        .from("programari")
        .select("ora, durata, data")
        .eq("salon_id", salonSelectat)
        .gte("data", isoDataC(azi))
        .lt("data", isoDataC(peste14))
        .neq("status", "anulat");
      setOcupariSalon((rows as any[]) || []);
      setDataSelectata(isoDataC(azi));
    })();
  }, [salonSelectat]);

  useEffect(() => {
    if (!salonSelectat || !rezervare?.serviciu) return;
    (async () => {
      const azi = new Date(); azi.setHours(0, 0, 0, 0);
      const peste14 = new Date(azi); peste14.setDate(azi.getDate() + 15);
      const { data: rows } = await supabase
        .from("programari")
        .select("ora, durata, data")
        .eq("salon_id", salonSelectat)
        .gte("data", isoDataC(azi))
        .lt("data", isoDataC(peste14))
        .neq("status", "anulat");
      setOcupariSalon((rows as any[]) || []);
    })();
  }, [rezervare?.serviciu, salonSelectat, dataSelectata]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) return;
      channel = supabase
        .channel(`notificari-client-${u.id}`)
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

  async function confirmaAnulare() {
    if (!anulareModal) return;
    const motiv = motivAnulare.trim();
    if (motiv.length < 5) { setAnulareError("Te rugăm să scrii un motiv (minim 5 caractere)."); return; }
    setAnulareError("");
    setAnulareLoading(true);
    const prog = anulareModal;
    const { error } = await supabase.from("programari").update({ status: "anulat", motiv_anulare: motiv }).eq("id", prog.id);
    if (error) { setAnulareError("Nu am putut anula. Încearcă din nou."); setAnulareLoading(false); return; }
    setProgramari(pr => pr.map(x => x.id === prog.id ? { ...x, status: "anulat" } : x));
    const { data: salonRow } = await supabase.from("saloane").select("user_id").eq("id", prog.salon_id).single();
    if (salonRow?.user_id) {
      await supabase.from("notificari").insert({
        user_id: salonRow.user_id,
        tip: "anulat",
        mesaj: `⚠️ ${user?.nume || "Un client"} a anulat programarea — ${prog.serviciu}, ${formatData(prog.data)} ${prog.ora}. Motiv: ${motiv}`,
        programare_id: prog.id,
      });
    }
    setAnulareLoading(false);
    setAnulareModal(null);
    setMotivAnulare("");
  }

  const c = C[theme];
  const prenume = user?.nume?.split(" ")[0] || "Utilizator";
  const necitite = notificari.filter(n => !n.citit).length;
  const salon = saloaneList.find(s => s.id === salonSelectat);
  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${c.border}`, fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", background: c.input, color: c.text };

  function salveaza(msg: string) { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); }

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

  async function creazaProgramare() {
    if (!salon || !rezervare) return;
    setConfirmareError("");
    setConfirmareLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { setConfirmareError("Trebuie să fii conectat"); setConfirmareLoading(false); return; }

    const { data: salonRow } = await supabase.from("saloane").select("user_id, clienti_blocati").eq("id", salon.id).single();
    if (Array.isArray(salonRow?.clienti_blocati) && salonRow.clienti_blocati.includes(authUser.id)) {
      setConfirmareError("Acest salon nu acceptă momentan programări de la tine. Te rugăm să contactezi salonul direct.");
      setConfirmareLoading(false);
      return;
    }

    const serviciuSelectat = salon.serviciiComplete.find(s => s.nume === rezervare.serviciu);
    const { pret: pretStr, durata: durataStr } = getPretDurata(serviciuSelectat, animal?.talie);
    const pretNumeric = Number(pretStr) || 0;
    const durataNumeric = Number(durataStr) || 60;
    const dataIso = dataSelectata;

    const { data: nou, error } = await supabase
      .from("programari")
      .insert({
        user_id: authUser.id,
        salon_id: salon.id,
        animal_id: animal?.id || null,
        serviciu: rezervare.serviciu,
        pret: pretNumeric,
        durata: durataNumeric,
        talie_animal: animal?.talie || null,
        data: dataIso,
        ora: rezervare.ora,
        status: "în așteptare",
        sursa: "app",
        groomer: groomerSelectat || null,
      })
      .select("id")
      .single();

    setConfirmareLoading(false);

    if (error || !nou) {
      setConfirmareError("Nu am putut salva programarea. Încearcă din nou.");
      return;
    }

    setProgramari(prev => [{
      id: nou.id,
      salon_id: String(salon.id),
      salon_nume: salon.nume,
      serviciu: rezervare.serviciu,
      data: dataIso,
      ora: rezervare.ora,
      status: "în așteptare",
      pret: pretNumeric,
    }, ...prev]);

    // Notificare pentru proprietarul salonului
    if (salonRow?.user_id) {
      await supabase.from("notificari").insert({
        user_id: salonRow.user_id,
        tip: "programare_noua",
        mesaj: `🐾 ${user?.nume || "Un client"} a solicitat o programare pentru ${animal?.nume || "animăluțul său"} — ${rezervare.serviciu}`,
        programare_id: nou.id,
      });
    }

    setConfirmat(true);
  }

  const btnPrimary: React.CSSProperties = { padding: "12px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 16px rgba(255,107,0,.35)" };
  const btnSecondary: React.CSSProperties = { padding: "12px 24px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
  const btnBack: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, marginBottom: 20, background: "none", border: "none", fontSize: 14, fontWeight: 700, color: c.muted, cursor: "pointer", fontFamily: "Nunito, sans-serif", padding: 0 };
  const ST = statusStyle(theme);

  /* ── Confirmare view ── */
  if (confirmat && rezervare && salon) {
    return (
      <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
        <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab} necitite={necitite} avatarUrl={avatarUrl}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px 20px" }}>
            <div style={{ textAlign: "center", maxWidth: 460, width: "100%" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: c.orangeAccent, border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✅</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: c.text, marginBottom: 10 }}>Programare trimisă!</h1>
              <p style={{ fontSize: 14, color: c.muted, marginBottom: 24, lineHeight: 1.7 }}>Salonul va confirma în curând. Vei primi notificare când se aprobă.</p>
              <div style={{ background: c.surface, border: "2px solid #FF6B00", borderRadius: 20, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
                {[["🏪 Salon", salon.nume], ["✂️ Serviciu", rezervare.serviciu], ["📅 Data", new Date(dataSelectata + "T00:00:00").toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })], ["🕐 Ora", rezervare.ora], ["🐾 Animal", animal?.nume || "Animăluțul tău"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderBottom: `1px solid ${c.border2}` }}>
                    <span style={{ color: c.muted }}>{k}</span><span style={{ fontWeight: 700, color: c.text }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => { setConfirmat(false); setSalonSelectat(null); setRezervare(null); setRezervareActiva(false); setGroomerSelectat(null); setProfilSalonTab("servicii"); setTab("programari"); }} style={btnSecondary}>Vezi programările mele</button>
                <button onClick={() => { setConfirmat(false); setSalonSelectat(null); setRezervare(null); setRezervareActiva(false); setGroomerSelectat(null); setProfilSalonTab("servicii"); }} style={btnPrimary}>← Înapoi la saloane</button>
              </div>
            </div>
          </div>
        </Shell>
      </ThemeCtx.Provider>
    );
  }

  /* ── Profil salon view ── */
  if (salonSelectat && salon) {
    const MOCK_RECENZII = [
      { nume: "Andreea M.", rating: 5, text: "Super experiență! Câinele meu arată impecabil după tunsoare. Personalul e foarte atent cu animalele.", data: "acum 3 zile" },
      { nume: "Bogdan T.", rating: 5, text: "Recomand cu toată inima. Au grijă de Pufi ca și cum ar fi al lor. Programarea online e super ușoară.", data: "acum 1 săptămână" },
      { nume: "Maria P.", rating: 4, text: "Servicii de calitate, prețuri corecte. Am revenit de 3 ori și de fiecare dată am fost mulțumită.", data: "acum 2 săptămâni" },
      { nume: "Cristian V.", rating: 5, text: "Profesionalism maxim! Pisica mea e extrem de agitată, dar groomerul știa exact cum s-o liniștească.", data: "acum 3 săptămâni" },
    ];

    /* Helper: lightbox overlay (used in both profile and booking views) */
    const Lightbox = lightboxIdx !== null ? (() => {
      const toateImg: string[] = [];
      if (salon.poza_url) toateImg.push(salon.poza_url);
      if (salon.galerie) toateImg.push(...salon.galerie);
      if (toateImg.length === 0) return null;
      const idx = Math.max(0, Math.min(lightboxIdx, toateImg.length - 1));
      const prev = () => setLightboxIdx((idx - 1 + toateImg.length) % toateImg.length);
      const next = () => setLightboxIdx((idx + 1) % toateImg.length);
      return (
        <div onClick={() => setLightboxIdx(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
            style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 22, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>✕</button>
          {toateImg.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 24, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 24, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>›</button>
            </>
          )}
          <img onClick={(e) => e.stopPropagation()} src={toateImg[idx]} alt={`Galerie ${idx + 1}`}
            style={{ maxWidth: "92vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,.6)" }} />
          {toateImg.length > 1 && (
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,.15)", color: "#fff", padding: "6px 14px", borderRadius: 50, fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>
              {idx + 1} / {toateImg.length}
            </div>
          )}
        </div>
      );
    })() : null;

    /* Helper: calendar + slots section (shared logic) */
    const CalendarSlots = (serviciu: string) => {
      const serviciuObj = salon.serviciiComplete.find(s => s.nume === serviciu);
      const { durata: durataResolved } = getPretDurata(serviciuObj, animal?.talie);
      const durataSv = Number(durataResolved) || 60;
      const progEf = programSalon || PROGRAM_DEFAULT_C;
      const aziDate = new Date(); aziDate.setHours(0, 0, 0, 0);
      const aziIso = isoDataC(aziDate);
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

      const zileLista: { iso: string; ziScurt: string; zi: number; luna: string; libere: number }[] = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(aziDate); d.setDate(aziDate.getDate() + i);
        const iso = isoDataC(d);
        const dow = String(d.getDay());
        const programZi = progEf[dow];
        let libere = 0;
        if (programZi?.activ) {
          const slots = genereazaSloturiClient(programZi, durataSv);
          for (const s of slots) {
            const start = timeToMinC(s);
            const end = start + durataSv;
            if (iso === aziIso && start <= nowMin) continue;
            const ocupat = ocupariSalon.some(o => o.data === iso && suprapunereC(start, end, o.ora, o.durata));
            if (!ocupat) libere++;
          }
        }
        zileLista.push({ iso, ziScurt: ZILE_SCURT[d.getDay()], zi: d.getDate(), luna: LUNA_SCURT[d.getMonth()], libere });
      }

      const dowSel = String(new Date(dataSelectata + "T00:00:00").getDay());
      const progZiSel = progEf[dowSel];
      const sloturiZiSel: { ora: string; ocupat: boolean; trecut: boolean }[] = [];
      if (progZiSel?.activ) {
        const slots = genereazaSloturiClient(progZiSel, durataSv);
        for (const s of slots) {
          const start = timeToMinC(s);
          const end = start + durataSv;
          const trecut = dataSelectata === aziIso && start <= nowMin;
          const ocupat = ocupariSalon.some(o => o.data === dataSelectata && suprapunereC(start, end, o.ora, o.durata));
          sloturiZiSel.push({ ora: s, ocupat, trecut });
        }
      }
      const sloturiLibere = sloturiZiSel.filter(s => !s.ocupat && !s.trecut);

      return (
        <>
          <SectionTitle>Alege ziua</SectionTitle>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 18, scrollbarWidth: "thin" }}>
            {zileLista.map(z => {
              const sel = z.iso === dataSelectata;
              const indisp = z.libere === 0;
              return (
                <button key={z.iso} disabled={indisp} onClick={() => { setDataSelectata(z.iso); setRezervare(r => ({ ...r!, ora: "" })); }}
                  style={{ padding: "10px 12px", borderRadius: 12, border: sel ? `2px solid ${salon.culoare}` : `1.5px solid ${c.border}`, background: sel ? (theme === "dark" ? `${salon.culoare}26` : salon.bg) : c.surface, cursor: indisp ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0, textAlign: "center", minWidth: 68, opacity: indisp ? 0.4 : 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: sel ? salon.culoare : c.muted, textTransform: "uppercase" }}>{z.ziScurt}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: sel ? salon.culoare : c.text, margin: "2px 0" }}>{z.zi}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: sel ? salon.culoare : c.xmuted }}>{z.luna}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: indisp ? "#EF4444" : "#10B981", marginTop: 4 }}>{indisp ? "Plin" : `${z.libere} libere`}</div>
                </button>
              );
            })}
          </div>

          <SectionTitle>Alege ora</SectionTitle>
          {sloturiZiSel.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 14, border: `1.5px dashed ${c.border}`, marginBottom: 24 }}>
              Salonul nu lucrează în ziua aleasă.
            </div>
          ) : sloturiLibere.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 14, border: `1.5px dashed ${c.border}`, marginBottom: 24 }}>
              Toate sloturile sunt ocupate în ziua aleasă. Încearcă altă zi.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, color: c.muted, marginBottom: 10, display: "flex", gap: 14, flexWrap: "wrap", fontWeight: 700 }}>
                <span style={{ color: "#10B981" }}>● Liber</span>
                <span style={{ color: "#EF4444" }}>● Ocupat</span>
                <span style={{ color: c.xmuted }}>● Trecut</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 8, marginBottom: 24 }}>
                {sloturiZiSel.map(slot => {
                  const sel = rezervare?.ora === slot.ora;
                  const disabled = slot.ocupat || slot.trecut;
                  let bg = c.surface, border = c.border, color = c.text2;
                  if (sel) { border = salon.culoare; bg = theme === "dark" ? `${salon.culoare}26` : salon.bg; color = salon.culoare; }
                  else if (slot.trecut) { bg = c.surface3; color = c.xmuted; border = c.border; }
                  else if (slot.ocupat) { bg = theme === "dark" ? "rgba(239,68,68,.12)" : "#FEF2F2"; border = "#FECACA"; color = "#EF4444"; }
                  else { bg = theme === "dark" ? "rgba(16,185,129,.18)" : "#D1FAE5"; border = "#10B981"; color = "#065F46"; }
                  return (
                    <button key={slot.ora} disabled={disabled} onClick={() => !disabled && setRezervare(r => ({ ...r!, ora: slot.ora }))}
                      style={{ padding: "11px 6px", borderRadius: 10, border: `${sel ? 2 : 1.5}px solid ${border}`, background: bg, fontSize: 13, fontWeight: 700, color, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", position: "relative", textDecoration: slot.ocupat ? "line-through" : "none", opacity: slot.trecut ? 0.5 : 1 }}>
                      {slot.ora}
                      {slot.ocupat && !sel && <div style={{ fontSize: 9, fontWeight: 700, marginTop: 2, opacity: .8 }}>🔒 Ocupat</div>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      );
    };

    /* ── Booking view (when rezervareActiva) ── */
    if (rezervareActiva) {
      return (
        <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
          <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab} necitite={necitite} avatarUrl={avatarUrl}>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px" }}>
              <button onClick={() => { setRezervareActiva(false); setRezervare(null); }} style={btnBack}>← Înapoi la profil</button>

              {/* Salon mini-header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "14px 18px", marginBottom: 22 }}>
                {salon.poza_url
                  ? <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}><img src={salon.poza_url} alt={salon.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  : <span style={{ fontSize: 28, flexShrink: 0 }}>✂️</span>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>{salon.nume}</div>
                  <div style={{ fontSize: 12, color: c.muted }}>📍 {salon.oras}</div>
                </div>
                {groomerSelectat && (
                  <div style={{ marginLeft: "auto", background: theme === "dark" ? `${salon.culoare}26` : salon.bg, border: `1px solid ${salon.culoare}`, borderRadius: 50, padding: "4px 12px", fontSize: 12, fontWeight: 800, color: salon.culoare, flexShrink: 0 }}>
                    👤 {groomerSelectat}
                  </div>
                )}
              </div>

              {animale.length > 1 && (
                <>
                  <SectionTitle>Pentru cine programezi?</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 10, marginBottom: 24 }}>
                    {animale.map(a => {
                      const sel = a.id === selectedAnimalId;
                      const sp = specieInfo(a.specie);
                      return (
                        <button key={a.id} onClick={() => setSelectedAnimalId(a.id)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, border: sel ? `2px solid ${salon.culoare}` : `1.5px solid ${c.border}`, background: sel ? (theme === "dark" ? `${salon.culoare}26` : salon.bg) : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                          {a.poza_url
                            ? <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}><img src={a.poza_url} alt={a.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                            : <span style={{ fontSize: 22 }}>{sp.icon}</span>}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{a.nume}</div>
                            <div style={{ fontSize: 11, color: c.xmuted }}>{a.rasa}, {a.greutate}kg</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <SectionTitle>Alege serviciul</SectionTitle>
              {salon.serviciiComplete.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 14, border: `1.5px dashed ${c.border}`, marginBottom: 24 }}>
                  Salonul nu a configurat încă servicii.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {animal?.talie && (
                    <div style={{ fontSize: 12, color: c.muted, marginBottom: 4 }}>
                      Prețurile afișate sunt pentru talie <strong style={{ color: c.text }}>{talieIcon(animal.talie)} {talieLabel(animal.talie)}</strong> ({animal.nume})
                    </div>
                  )}
                  {!animal?.talie && (
                    <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 4 }}>
                      ⚠️ {animal?.nume || "Animalul"} nu are talie setată. Mergi la „Animalele mele" și alege talia pentru a vedea prețurile corecte.
                    </div>
                  )}
                  {salon.serviciiComplete.map(s => {
                    const sel = rezervare?.serviciu === s.nume;
                    const { pret, durata } = getPretDurata(s, animal?.talie);
                    if (!pret && !durata) return null;
                    return (
                      <button key={s.nume} onClick={() => setRezervare(r => ({ ...r!, salonId: salon.id, serviciu: s.nume, ora: r?.ora || "" }))}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 14, border: sel ? `2px solid ${salon.culoare}` : `1.5px solid ${c.border}`, background: sel ? (theme === "dark" ? `${salon.culoare}26` : salon.bg) : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{s.nume}</div>{durata && <div style={{ fontSize: 12, color: c.xmuted, marginTop: 2 }}>⏱ {durata} min</div>}</div>
                        {pret && <div style={{ fontSize: 15, fontWeight: 900, color: salon.culoare, marginLeft: 12 }}>{pret} RON</div>}
                      </button>
                    );
                  })}
                </div>
              )}

              {rezervare?.serviciu && CalendarSlots(rezervare.serviciu)}

              {confirmareError && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#EF4444", textAlign: "center", marginBottom: 12 }}>
                  ⚠️ {confirmareError}
                </div>
              )}
              {rezervare?.serviciu && rezervare?.ora && (
                <button onClick={creazaProgramare} disabled={confirmareLoading}
                  style={{ ...btnPrimary, width: "100%", background: confirmareLoading ? "#FFB07A" : "#FF6B00", cursor: confirmareLoading ? "default" : "pointer" }}>
                  {confirmareLoading ? "Se salvează..." : "Confirmă programarea →"}
                </button>
              )}
            </div>
            <Footer variant="client" onAjutor={() => { setTab("ajutor"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            {Lightbox}
          </Shell>
        </ThemeCtx.Provider>
      );
    }

    /* ── Profile view (4 tabs) ── */
    const ZILE_RO = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent((salon.adresa || "") + ", " + salon.oras)}`;

    return (
      <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
        <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab} necitite={necitite} avatarUrl={avatarUrl}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

            {/* Cover photo */}
            <div style={{ position: "relative", height: 220, background: c.surface2, overflow: "hidden" }}>
              {salon.poza_url
                ? <img src={salon.poza_url} alt={salon.nume} onClick={() => setLightboxIdx(0)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>✂️</div>}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.7) 100%)", pointerEvents: "none" }} />
              <button onClick={() => { setSalonSelectat(null); setRezervare(null); setRezervareActiva(false); setGroomerSelectat(null); setProfilSalonTab("servicii"); }}
                style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,.45)", border: "none", borderRadius: 50, padding: "6px 14px", fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer", fontFamily: "Nunito, sans-serif", backdropFilter: "blur(4px)" }}>
                ← Înapoi
              </button>
              <div style={{ position: "absolute", bottom: 16, left: 18, right: 18, pointerEvents: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: salon.culoare, padding: "3px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>{salon.badgeIcon} {salon.badge}</span>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "6px 0 2px", textShadow: "0 1px 4px rgba(0,0,0,.4)" }}>{salon.nume}</h2>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)" }}>📍 {salon.oras}{salon.distanta ? ` · ${salon.distanta}` : ""}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>⭐ {salon.rating}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)" }}>{salon.recenzii} recenzii</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail gallery strip */}
            {salon.galerie && salon.galerie.length > 0 && (
              <div style={{ display: "flex", gap: 8, padding: "12px 18px", overflowX: "auto", scrollbarWidth: "none", background: c.surface, borderBottom: `1px solid ${c.border}` }}>
                {salon.galerie.map((url, i) => (
                  <div key={i} onClick={() => setLightboxIdx(salon.poza_url ? i + 1 : i)} style={{ width: 68, height: 68, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: `1.5px solid ${c.border}`, cursor: "zoom-in" }}>
                    <img src={url} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${c.border}`, background: c.surface, position: "sticky", top: 0, zIndex: 10 }}>
              {(["servicii", "specialisti", "recenzii", "contact"] as const).map(t => {
                const labels: Record<string, string> = { servicii: "Servicii", specialisti: "Specialiști", recenzii: "Recenzii", contact: "Contact" };
                const active = profilSalonTab === t;
                return (
                  <button key={t} onClick={() => setProfilSalonTab(t)}
                    style={{ flex: 1, padding: "14px 4px", border: "none", borderBottom: active ? `3px solid ${salon.culoare}` : "3px solid transparent", background: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", fontSize: 13, fontWeight: active ? 900 : 700, color: active ? salon.culoare : c.muted, transition: "all .15s" }}>
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div style={{ padding: "20px 18px 100px" }}>

              {/* ── SERVICII ── */}
              {profilSalonTab === "servicii" && (
                <>
                  {salon.serviciiComplete.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: c.muted, fontSize: 14 }}>
                      Salonul nu a configurat încă servicii.
                    </div>
                  ) : (
                    <>
                      {animal?.talie && (
                        <div style={{ fontSize: 12, color: c.muted, marginBottom: 14, padding: "8px 12px", background: c.surface2, borderRadius: 10 }}>
                          Prețuri pentru talie <strong style={{ color: c.text }}>{talieIcon(animal.talie)} {talieLabel(animal.talie)}</strong> ({animal.nume})
                        </div>
                      )}
                      {!animal?.talie && animale.length > 0 && (
                        <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 14, padding: "8px 12px", background: "rgba(239,68,68,.07)", borderRadius: 10 }}>
                          ⚠️ {animal?.nume || "Animalul"} nu are talie setată — mergi la „Animalele mele" pentru prețuri corecte.
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {salon.serviciiComplete.map(s => {
                          const { pret, durata } = getPretDurata(s, animal?.talie);
                          if (!pret && !durata) return null;
                          return (
                            <div key={s.nume} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 16, border: `1.5px solid ${c.border}`, background: c.surface }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{s.nume}</div>
                                {durata && <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>⏱ {durata} min</div>}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                                {pret && <div style={{ fontSize: 16, fontWeight: 900, color: salon.culoare }}>{pret} RON</div>}
                                <button onClick={() => {
                                  setRezervare({ salonId: salon.id, serviciu: s.nume, ora: "" });
                                  setRezervareActiva(true);
                                }}
                                  style={{ background: salon.culoare, color: "#fff", border: "none", borderRadius: 50, padding: "8px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap" }}>
                                  Programează
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── SPECIALIȘTI ── */}
              {profilSalonTab === "specialisti" && (
                <>
                  {(!salon.echipa || salon.echipa.length === 0) ? (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: c.muted, fontSize: 14 }}>
                      Salonul nu a adăugat încă membri ai echipei.
                    </div>
                  ) : salon.echipa.length === 1 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {salon.echipa.map((m: { nume: string; rol?: string; poza?: string; descriere?: string }, idx: number) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14, background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "14px 16px" }}>
                          {m.poza
                            ? <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}><img src={m.poza} alt={m.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                            : <div style={{ width: 56, height: 56, borderRadius: 14, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>✂️</div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{m.nume}</div>
                            {m.rol && <div style={{ fontSize: 12, color: salon.culoare, fontWeight: 700, marginTop: 2 }}>{m.rol}</div>}
                            {m.descriere && <div style={{ fontSize: 12, color: c.muted, marginTop: 4, lineHeight: 1.5 }}>{m.descriere}</div>}
                          </div>
                          <button onClick={() => { setGroomerSelectat(m.nume); setRezervareActiva(true); }}
                            style={{ background: salon.culoare, color: "#fff", border: "none", borderRadius: 50, padding: "8px 16px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                            Alege
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ fontSize: 13, color: c.muted, marginBottom: 4 }}>Alege specialistul preferat și programează-te direct cu el.</div>
                      {salon.echipa.map((m: { nume: string; rol?: string; poza?: string; descriere?: string }, idx: number) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14, background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "14px 16px" }}>
                          {m.poza
                            ? <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}><img src={m.poza} alt={m.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                            : <div style={{ width: 56, height: 56, borderRadius: 14, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>✂️</div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{m.nume}</div>
                            {m.rol && <div style={{ fontSize: 12, color: salon.culoare, fontWeight: 700, marginTop: 2 }}>{m.rol}</div>}
                            {m.descriere && <div style={{ fontSize: 12, color: c.muted, marginTop: 4, lineHeight: 1.5 }}>{m.descriere}</div>}
                          </div>
                          <button onClick={() => { setGroomerSelectat(m.nume); setRezervareActiva(true); }}
                            style={{ background: salon.culoare, color: "#fff", border: "none", borderRadius: 50, padding: "8px 16px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                            Alege
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── RECENZII ── */}
              {profilSalonTab === "recenzii" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, background: c.surface, borderRadius: 18, border: `1.5px solid ${c.border}`, padding: "20px 22px", marginBottom: 20 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 48, fontWeight: 900, color: c.text, lineHeight: 1 }}>4.8</div>
                      <div style={{ fontSize: 20, marginTop: 4 }}>⭐⭐⭐⭐⭐</div>
                      <div style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>din {MOCK_RECENZII.length} recenzii</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5, 4, 3, 2, 1].map(stea => {
                        const cnt = MOCK_RECENZII.filter(r => r.rating === stea).length;
                        const pct = Math.round((cnt / MOCK_RECENZII.length) * 100);
                        return (
                          <div key={stea} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                            <span style={{ fontSize: 11, color: c.muted, fontWeight: 700, minWidth: 12 }}>{stea}</span>
                            <span style={{ fontSize: 11 }}>⭐</span>
                            <div style={{ flex: 1, height: 6, background: c.border, borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "#FF6B00", borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 11, color: c.muted, minWidth: 22 }}>{cnt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {MOCK_RECENZII.map((r, i) => (
                      <div key={i} style={{ background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "16px 18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 50, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: salon.culoare, flexShrink: 0 }}>
                              {r.nume.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{r.nume}</div>
                              <div style={{ fontSize: 11, color: c.muted }}>{r.data}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 14 }}>{"⭐".repeat(r.rating)}</div>
                        </div>
                        <p style={{ fontSize: 13, color: c.text2, lineHeight: 1.65, margin: 0 }}>{r.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── CONTACT ── */}
              {profilSalonTab === "contact" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {salon.adresa && (
                    <div style={{ background: c.surface, borderRadius: 20, border: `1.5px solid ${c.border}`, overflow: "hidden" }}>
                      {/* Embedded map */}
                      <div style={{ position: "relative", height: 200 }}>
                        <iframe
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(salon.adresa + ", " + salon.oras)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Locație salon"
                        />
                        {/* Tap overlay to open maps */}
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                          style={{ position: "absolute", inset: 0, zIndex: 1 }} aria-label="Deschide în Maps" />
                      </div>
                      {/* Address bar below map */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: c.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Adresă</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {salon.adresa}, {salon.oras}</div>
                        </div>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                          style={{ flexShrink: 0, fontSize: 12, fontWeight: 800, color: "#fff", background: salon.culoare, textDecoration: "none", borderRadius: 50, padding: "8px 14px", whiteSpace: "nowrap" }}>
                          Deschide →
                        </a>
                      </div>
                    </div>
                  )}
                  {salon.telefon && (
                    <div style={{ background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "16px 18px" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: c.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Telefon</div>
                      <a href={`tel:${salon.telefon}`} style={{ fontSize: 16, fontWeight: 900, color: c.text, textDecoration: "none" }}>📞 {salon.telefon}</a>
                    </div>
                  )}
                  <div style={{ background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "16px 18px" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: c.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Program</div>
                    {salon.program ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {ZILE_RO.map((zi, idx) => {
                          const entry = salon.program?.[String(idx)];
                          const eAzi = idx === new Date().getDay();
                          return (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: idx < 6 ? `1px solid ${c.border}` : "none" }}>
                              <span style={{ fontSize: 13, fontWeight: eAzi ? 900 : 700, color: eAzi ? salon.culoare : c.text }}>{zi}{eAzi ? " (azi)" : ""}</span>
                              {entry?.activ
                                ? <span style={{ fontSize: 13, fontWeight: 700, color: eAzi ? salon.culoare : c.text2 }}>{entry.start} – {entry.end}</span>
                                : <span style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>Închis</span>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: c.muted }}>Programul nu este disponibil momentan.</div>
                    )}
                  </div>
                  {!salon.adresa && !salon.telefon && (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: c.muted, fontSize: 14 }}>
                      Informațiile de contact nu sunt completate încă.
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Sticky bottom CTA */}
            <div style={{ position: "sticky", bottom: 0, background: theme === "dark" ? "rgba(18,18,18,.96)" : "rgba(255,255,255,.96)", backdropFilter: "blur(8px)", borderTop: `1px solid ${c.border}`, padding: "14px 18px", zIndex: 20 }}>
              <button onClick={() => { setRezervare(null); setRezervareActiva(true); }}
                style={{ ...btnPrimary, width: "100%", background: "#FF6B00", fontSize: 15 }}>
                Programează-te acum →
              </button>
            </div>

          </div>
          <Footer variant="client" onAjutor={() => { setTab("ajutor"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          {Lightbox}
        </Shell>
      </ThemeCtx.Provider>
    );
  }

  const viitoare = programari.filter(p => p.status === "confirmat" || p.status === "în așteptare");
  const trecute = programari.filter(p => p.status === "finalizat" || p.status === "anulat");

  return (
    <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
      <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab} necitite={necitite} avatarUrl={avatarUrl}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

          {/* Toast */}
          {savedMsg && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1A1A1A", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>✓ {savedMsg}</div>}

          {/* Bun venit */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 900, color: c.text, marginBottom: 10 }}>Bună, {prenume}! 🐾</h1>
            {animal && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: c.surface, border: "2px solid #FF6B00", borderRadius: 50, padding: "8px 18px", fontSize: 13, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18 }}>{specieInfo(animal.specie).icon}</span>
                <span style={{ fontWeight: 800, color: c.text }}>{animal.nume}</span>
                <span style={{ color: c.border }}>|</span>
                <span style={{ color: c.muted, fontWeight: 600 }}>{animal.rasa}, {animal.greutate} kg</span>
                {animale.length > 1 && (
                  <button onClick={() => setTab("animal")} style={{ marginLeft: 4, fontSize: 11, fontWeight: 800, color: "#FF6B00", background: c.orangeAccent, border: "none", padding: "4px 10px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    +{animale.length - 1} {animale.length === 2 ? "altul" : "alți"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB SALOANE */}
          {tab === "saloane" && (<>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: c.text, margin: 0 }}>📍 Recomandate în zona ta</h2>
              <span style={{ fontSize: 12, color: c.text, fontWeight: 800, background: c.surface, padding: "4px 14px", borderRadius: 50, border: `1.5px solid ${c.border}`, fontFamily: "Nunito, sans-serif" }}>📍 București</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 36 }}>
              {saloaneList.slice(0, 2).map(s => <CardSalon key={s.id} salon={s} onSelect={() => setSalonSelectat(s.id)} />)}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: c.text, marginBottom: 16 }}>✂️ Toți partenerii CalyHub</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {saloaneList.map(s => <CardSalon key={s.id} salon={s} onSelect={() => setSalonSelectat(s.id)} />)}
            </div>
          </>)}

          {/* TAB PROGRAMARI */}
          {tab === "programari" && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: c.text, marginBottom: 20 }}>📅 Programările mele</h2>
              {viitoare.length > 0 && (<>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Viitoare</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                  {viitoare.map(p => <CardProgramare key={p.id} p={p}
                    onAnuleazaConfirmat={prog => { setAnulareModal(prog); setMotivAnulare(""); setAnulareError(""); }}
                    onRetrageCerere={async id => {
                      await supabase.from("programari").update({ status: "anulat" }).eq("id", id);
                      setProgramari(pr => pr.map(x => x.id === id ? { ...x, status: "anulat" } : x));
                    }} />)}
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

          {/* TAB ANIMALE */}
          {tab === "animal" && (
            <div style={{ maxWidth: 640 }}>
              <PageHeader icon="🐾" title="Animalele mele" sub="Gestionează profilurile animăluților tăi" />

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {animale.length === 0 && !showAddAnimal && (
                  <div style={{ padding: "28px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 16, border: `1.5px dashed ${c.border}` }}>
                    Nu ai niciun animal înregistrat. Adaugă unul ca să poți rezerva.
                  </div>
                )}

                {animale.map(a => {
                  const isEditing = editingAnimalId === a.id;
                  const sp = specieInfo(a.specie);
                  return (
                    <div key={a.id} style={{ background: c.surface, borderRadius: 16, padding: "18px 20px", border: a.id === selectedAnimalId && animale.length > 1 ? "2px solid #FF6B00" : `1.5px solid ${c.border}` }}>
                      {!isEditing ? (
                        <>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                            {a.poza_url
                              ? <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", flexShrink: 0, border: `1.5px solid ${c.border}` }}><img src={a.poza_url} alt={a.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                              : <div style={{ width: 56, height: 56, borderRadius: 14, background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{sp.icon}</div>}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 17, fontWeight: 900, color: c.text }}>{a.nume}</div>
                              <div style={{ fontSize: 13, color: c.muted, marginTop: 4 }}>{sp.label} · {sexLabel(a.sex)} · {a.rasa}</div>
                              <div style={{ fontSize: 12, color: c.xmuted, marginTop: 3 }}>⚖️ {a.greutate} kg · 🎂 {a.varsta} ani · 💊 {a.alergii || "Fără alergii"} · {a.vaccinat ? <span style={{ color: "#10B981", fontWeight: 700 }}>💉 Vaccinat</span> : <span style={{ color: "#EF4444", fontWeight: 700 }}>Nevaccinat</span>}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                              {animale.length > 1 && a.id !== selectedAnimalId && (
                                <button onClick={() => setSelectedAnimalId(a.id)} style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", background: c.orangeAccent, border: "1.5px solid #FF6B00", padding: "7px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Selectează</button>
                              )}
                              {animale.length > 1 && a.id === selectedAnimalId && (
                                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "#FF6B00", padding: "7px 12px", borderRadius: 50, alignSelf: "center" }}>✓ Activ</span>
                              )}
                              <button onClick={() => {
                                setEditingAnimalId(a.id);
                                setAnimalForm({ numeAnimal: a.nume || "", specie: a.specie || "caine", sex: a.sex || "", rasa: a.rasa || "", talie: a.talie || "", greutate: String(a.greutate || ""), varsta: String(a.varsta || ""), alergii: a.alergii || "", vaccinat: a.vaccinat || false });
                              }} style={{ fontSize: 12, fontWeight: 700, color: c.muted, background: c.surface2, border: `1.5px solid ${c.border}`, padding: "7px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>✏️ Editează</button>
                              <button onClick={async () => {
                                if (!confirm(`Sigur ștergi profilul lui ${a.nume}?`)) return;
                                await supabase.from("animale").delete().eq("id", a.id);
                                setAnimale(prev => prev.filter(x => x.id !== a.id));
                                if (selectedAnimalId === a.id) setSelectedAnimalId(null);
                                salveaza("Animal șters");
                              }} style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,.08)", border: "none", padding: "7px 10px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>🗑️</button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <AnimalEditForm form={animalForm} setForm={setAnimalForm} c={c} inp={inp}
                          animalId={a.id} userId={userId} animalPoza={a.poza_url}
                          onPhotoChange={(url) => setAnimale(prev => prev.map(x => x.id === a.id ? { ...x, poza_url: url } : x))}
                          onCancel={() => setEditingAnimalId(null)} onSave={async () => {
                          await supabase.from("animale").update({
                            nume: animalForm.numeAnimal, specie: animalForm.specie, sex: animalForm.sex,
                            rasa: animalForm.rasa, talie: animalForm.talie || null, greutate: Number(animalForm.greutate),
                            varsta: Number(animalForm.varsta), alergii: animalForm.alergii, vaccinat: animalForm.vaccinat,
                          }).eq("id", a.id);
                          setAnimale(prev => prev.map(x => x.id === a.id ? { ...x, nume: animalForm.numeAnimal, specie: animalForm.specie, sex: animalForm.sex, rasa: animalForm.rasa, talie: animalForm.talie, greutate: Number(animalForm.greutate), varsta: Number(animalForm.varsta), alergii: animalForm.alergii, vaccinat: animalForm.vaccinat } : x));
                          setEditingAnimalId(null);
                          salveaza("Profil actualizat!");
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {showAddAnimal ? (
                <div style={{ background: c.surface, borderRadius: 16, padding: "20px", border: "2px dashed #FF6B00" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#FF6B00", marginBottom: 14 }}>➕ Animal nou</div>
                  <AnimalEditForm form={animalForm} setForm={setAnimalForm} c={c} inp={inp} onCancel={() => { setShowAddAnimal(false); setAnimalForm({ numeAnimal: "", specie: "caine", sex: "", rasa: "", talie: "", greutate: "", varsta: "", alergii: "", vaccinat: false }); }} onSave={async () => {
                    if (!animalForm.numeAnimal.trim() || !animalForm.sex) { salveaza("Completează numele și sexul"); return; }
                    const { data: nou } = await supabase.from("animale").insert({
                      user_id: userId, nume: animalForm.numeAnimal.trim(), specie: animalForm.specie, sex: animalForm.sex,
                      rasa: animalForm.rasa.trim(), talie: animalForm.talie || null, greutate: Number(animalForm.greutate) || 0,
                      varsta: Number(animalForm.varsta) || 0, alergii: animalForm.alergii.trim(), vaccinat: animalForm.vaccinat,
                    }).select("*").single();
                    if (nou) {
                      setAnimale(prev => [...prev, nou]);
                      if (!selectedAnimalId) setSelectedAnimalId(nou.id);
                    }
                    setShowAddAnimal(false);
                    setAnimalForm({ numeAnimal: "", specie: "caine", sex: "", rasa: "", talie: "", greutate: "", varsta: "", alergii: "", vaccinat: false });
                    salveaza("Animal adăugat!");
                  }} />
                </div>
              ) : (
                <button onClick={() => { setShowAddAnimal(true); setEditingAnimalId(null); setAnimalForm({ numeAnimal: "", specie: "caine", sex: "", rasa: "", talie: "", greutate: "", varsta: "", alergii: "", vaccinat: false }); }}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1.5px dashed #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  + Adaugă animal nou
                </button>
              )}
            </div>
          )}

          {/* TAB NOTIFICARI */}
          {tab === "notificari" && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <PageHeader icon="🔔" title="Notificări" sub="Activitate recentă a programărilor" />
                {notificari.filter(n => !n.citit).length > 0 && (
                  <button onClick={async () => {
                    await supabase.from("notificari").update({ citit: true }).eq("user_id", userId);
                    setNotificari(n => n.map(x => ({ ...x, citit: true })));
                  }} style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                    Marchează toate citite
                  </button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {notificari.length === 0 && (
                  <div style={{ padding: "28px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 16, border: `1.5px dashed ${c.border}` }}>
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
                    <div style={{ fontSize: 20, flexShrink: 0 }}>{n.tip === "confirmat" ? "✅" : n.tip === "anulat" ? "❌" : "🔔"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: n.citit ? 600 : 800, color: c.text, lineHeight: 1.5 }}>{n.mesaj}</div>
                      <div style={{ fontSize: 12, color: c.xmuted, marginTop: 4 }}>{formatTimp(n.created_at)}</div>
                    </div>
                    {!n.citit && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 4 }} />}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 12 }}>Preferințe notificări</div>
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
                { q: "Cum anulez o programare?", r: "Mergi la Programările mele, găsești programarea confirmată și dai click pe Anulează. Poți anula cu cel puțin 12 ore înainte și trebuie să scrii un scurt motiv pentru salon." },
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

        {anulareModal && (
          <div onClick={() => !anulareLoading && setAnulareModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: c.surface, borderRadius: 20, padding: "26px 24px", maxWidth: 440, width: "100%", boxShadow: "0 12px 48px rgba(0,0,0,.3)" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: c.text, marginBottom: 6 }}>Anulezi programarea?</div>
              <div style={{ fontSize: 13, color: c.muted, marginBottom: 16 }}>{anulareModal.salon_nume} · {anulareModal.serviciu}<br />📅 {formatData(anulareModal.data)} · 🕐 {anulareModal.ora}</div>
              <label style={{ fontSize: 13, fontWeight: 700, color: c.text2, display: "block", marginBottom: 6 }}>Scrie un motiv pentru salon <span style={{ color: "#EF4444" }}>*</span></label>
              <textarea value={motivAnulare} onChange={e => { setMotivAnulare(e.target.value); if (anulareError) setAnulareError(""); }}
                placeholder="Ex: a apărut o urgență, nu mai pot ajunge la ora stabilită…" rows={3}
                style={{ ...inp, resize: "vertical", minHeight: 70 }} />
              {anulareError && <div style={{ fontSize: 12.5, color: "#EF4444", fontWeight: 700, marginTop: 8 }}>{anulareError}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                <button onClick={() => setAnulareModal(null)} disabled={anulareLoading} style={{ padding: "11px 20px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Renunță</button>
                <button onClick={confirmaAnulare} disabled={anulareLoading} style={{ padding: "11px 22px", borderRadius: 50, border: "none", background: "#EF4444", color: "#fff", fontSize: 14, fontWeight: 800, cursor: anulareLoading ? "wait" : "pointer", fontFamily: "Nunito, sans-serif", opacity: anulareLoading ? .7 : 1 }}>{anulareLoading ? "Se anulează…" : "Confirmă anularea"}</button>
              </div>
            </div>
          </div>
        )}
      </Shell>
    </ThemeCtx.Provider>
  );
}

/* ── Shell ── */
function Shell({ children, prenume, tab, onLogout, onNav, necitite = 0, avatarUrl }: { children: React.ReactNode; prenume: string; tab: Tab; onLogout: () => void; onNav: (t: Tab) => void; necitite?: number; avatarUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, c, toggleTheme } = useContext(ThemeCtx);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const TAB_LABELS: Record<Tab, string> = {
    saloane: "Saloane", programari: "Programările mele", profil: "Profilul meu",
    animal: "Animalele mele", notificari: "Notificări", setari: "Setări cont", ajutor: "Ajutor",
  };

  const items: { icon: string; label: string; sub: string; t: Tab }[] = [
    { icon: "👤", label: "Profilul meu", sub: "Nume, email, telefon", t: "profil" },
    { icon: "🐾", label: "Animalele mele", sub: "Adaugă / editează profiluri", t: "animal" },
    { icon: "📅", label: "Programările mele", sub: "Vezi toate programările", t: "programari" },
    { icon: "🔔", label: "Notificări", sub: "Setări SMS / email", t: "notificari" },
    { icon: "🔒", label: "Setări cont", sub: "Schimbă parola", t: "setari" },
    { icon: "❓", label: "Ajutor", sub: "FAQ · Contact support", t: "ajutor" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: c.pageBg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: c.surface, borderBottom: `1px solid ${c.border}`, height: 64 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {/* On mobile with sub-tab open, hide logo and show back button instead */}
            {!(isMobile && tab !== "saloane") && (
              <Image src="/logo.png" alt="CalyHub" width={110} height={38} style={{ height: 38, width: "auto", objectFit: "contain" }} priority />
            )}
            {tab !== "saloane" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                {!isMobile && <div style={{ width: 1, height: 22, background: c.border }} />}
                <button onClick={() => onNav("saloane")}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, fontSize: 13, fontWeight: 700, color: c.muted, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                  ← Înapoi
                </button>
                {!isMobile && (
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{TAB_LABELS[tab]}</div>
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={() => onNav("notificari")} style={{ position: "relative", padding: isMobile ? "8px 10px" : "8px 14px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, fontSize: 16, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              🔔
              {necitite > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{necitite}</span>}
            </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, padding: isMobile ? "6px 10px 6px 6px" : "6px 14px 6px 8px", borderRadius: 50, border: open ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: open ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
              <span aria-hidden style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🐾</span>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, overflow: "hidden" }}>
                {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
              </span>
              {!isMobile && <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{prenume}</span>}
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
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer variant="client" onAjutor={() => { onNav("ajutor"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
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

function CardSalon({ salon, onSelect }: { salon: SalonItem; onSelect: () => void }) {
  const { c, theme } = useContext(ThemeCtx);
  return (
    <div style={{ background: c.surface, borderRadius: 20, border: "2px solid #FF6B00", overflow: "hidden", boxShadow: c.cardShadow, display: "flex", flexDirection: "column" }}>
      {/* Cover photo sau bara colorată */}
      {salon.poza_url ? (
        <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
          <img src={salon.poza_url} alt={salon.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.45) 100%)" }} />
          <span style={{ position: "absolute", bottom: 10, left: 12, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: "#fff", background: salon.culoare, padding: "4px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>{salon.badgeIcon} {salon.badge}</span>
        </div>
      ) : (
        <div style={{ height: 4, background: salon.culoare }} />
      )}

      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {!salon.poza_url && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: salon.culoare, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, padding: "4px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>{salon.badgeIcon} {salon.badge}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: c.text }}>⭐ {salon.rating}<span style={{ fontSize: 11, color: c.xmuted, fontWeight: 600 }}>({salon.recenzii})</span></div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontSize: 17, fontWeight: 900, color: c.text, marginBottom: 4 }}>{salon.nume}</div><div style={{ fontSize: 12, color: c.xmuted, fontWeight: 600 }}>📍 {salon.oras}{salon.distanta ? ` · ${salon.distanta}` : ""}</div></div>
          {salon.poza_url && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: c.text }}>⭐ {salon.rating}<span style={{ fontSize: 11, color: c.xmuted, fontWeight: 600 }}>({salon.recenzii})</span></div>}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{salon.servicii.map(s => <Tag key={s} label={s} color={salon.culoare} bg={salon.bg} />)}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${c.border2}` }}>
          <div><div style={{ fontSize: 11, color: c.xmuted, fontWeight: 600 }}>de la</div><div style={{ fontSize: 18, fontWeight: 900, color: c.text }}>{salon.pretDe > 0 ? `${salon.pretDe} RON` : "—"}</div></div>
          <button onClick={onSelect} style={{ padding: "10px 20px", borderRadius: 50, border: "none", background: salon.culoare, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: `0 4px 14px ${salon.culoare}55` }}>Programează →</button>
        </div>
      </div>
    </div>
  );
}

function formatData(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

function CardProgramare({ p, onAnuleazaConfirmat, onRetrageCerere }: { p: Programare; onAnuleazaConfirmat?: (p: Programare) => void; onRetrageCerere?: (id: string) => void }) {
  const { theme, c } = useContext(ThemeCtx);
  const st = statusStyle(theme)[p.status];
  const oreRamase = (new Date(`${p.data}T${p.ora}:00`).getTime() - Date.now()) / 3600000;
  const poateAnula = oreRamase >= 12;
  const anulBtn: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,.1)", border: "none", padding: "4px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
  return (
    <div style={{ background: c.surface, borderRadius: 16, padding: "16px 20px", border: `1.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", boxShadow: c.cardShadow }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✂️</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{p.salon_nume}</div>
        <div style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>{p.serviciu}</div>
        <div style={{ fontSize: 12, color: c.xmuted, marginTop: 3 }}>📅 {formatData(p.data)} · 🕐 {p.ora}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: st.color, background: st.bg, padding: "4px 12px", borderRadius: 50 }}>{st.label}</span>
        {p.pret > 0 && <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>{p.pret} RON</div>}
        {onRetrageCerere && p.status === "în așteptare" && (
          <button onClick={() => onRetrageCerere(p.id)} style={anulBtn}>Anulează</button>
        )}
        {onAnuleazaConfirmat && p.status === "confirmat" && (
          poateAnula
            ? <button onClick={() => onAnuleazaConfirmat(p)} style={anulBtn}>Anulează</button>
            : <span style={{ fontSize: 10.5, fontWeight: 700, color: c.xmuted, textAlign: "right", lineHeight: 1.3 }}>🔒 Anulare blocată<br />(sub 12h)</span>
        )}
      </div>
    </div>
  );
}

function Tag({ label, color, bg }: { label: string; color: string; bg: string }) {
  const { theme } = useContext(ThemeCtx);
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: theme === "dark" ? `${color}26` : bg, padding: "4px 10px", borderRadius: 50 }}>{label}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { c } = useContext(ThemeCtx);
  return <h3 style={{ fontSize: 15, fontWeight: 800, color: c.text2, marginBottom: 12, marginTop: 0 }}>{children}</h3>;
}

function AnimalEditForm({ form, setForm, c, inp, onSave, onCancel, animalId, userId, animalPoza, onPhotoChange }: { form: any; setForm: (f: any) => void; c: any; inp: React.CSSProperties; onSave: () => void; onCancel: () => void; animalId?: string; userId?: string; animalPoza?: string | null; onPhotoChange?: (url: string | null) => void }) {
  const [rasaLibera, setRasaLibera] = useState(false);
  const [uploadingPoza, setUploadingPoza] = useState(false);
  const set = (k: string, v: string | boolean) => setForm((f: any) => ({ ...f, [k]: v }));

  async function handlePhotoUpload(file: File) {
    if (!animalId || !userId) return;
    setUploadingPoza(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/${animalId}.${ext}`;
    const { error } = await supabase.storage.from("animale").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("animale").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("animale").update({ poza_url: url }).eq("id", animalId);
      onPhotoChange?.(url);
    }
    setUploadingPoza(false);
  }

  async function handlePhotoDelete() {
    if (!animalId) return;
    await supabase.from("animale").update({ poza_url: null }).eq("id", animalId);
    onPhotoChange?.(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {animalId && (
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 8 }}>Poză animal (opțional)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, overflow: "hidden", background: c.surface2, border: `1.5px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {animalPoza
                ? <img src={animalPoza} alt="Poza animal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 28 }}>🐾</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ cursor: "pointer" }}>
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingPoza} onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
                <span style={{ display: "inline-block", padding: "8px 16px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  {uploadingPoza ? "Se încarcă..." : animalPoza ? "📷 Schimbă poza" : "📷 Adaugă poză"}
                </span>
              </label>
              {animalPoza && (
                <button type="button" onClick={handlePhotoDelete} style={{ padding: "8px 16px", borderRadius: 50, border: "none", background: "rgba(239,68,68,.1)", color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                  🗑️ Șterge poza
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Nume</label>
        <input value={form.numeAnimal} onChange={e => set("numeAnimal", e.target.value)} placeholder="Max" style={inp} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Specie</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 100px), 1fr))", gap: 6 }}>
          {SPECII.map(s => (
            <button key={s.val} type="button" onClick={() => { setForm((f: any) => ({ ...f, specie: s.val, rasa: "" })); setRasaLibera(false); }}
              style={{ padding: "8px 6px", borderRadius: 10, border: form.specie === s.val ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: form.specie === s.val ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: form.specie === s.val ? "#FF6B00" : c.text2 }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Sex</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ val: "mascul", label: "Mascul", icon: "♂️" }, { val: "femela", label: "Femelă", icon: "♀️" }].map(s => (
            <button key={s.val} type="button" onClick={() => set("sex", s.val)}
              style={{ padding: "10px", borderRadius: 10, border: form.sex === s.val ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: form.sex === s.val ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 800, color: form.sex === s.val ? "#FF6B00" : c.text2 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Rasa</label>
        {form.specie === "altele" || rasaLibera ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input value={form.rasa} onChange={e => set("rasa", e.target.value)} placeholder="Scrie rasa animăluțului" style={{ ...inp, flex: 1 } as React.CSSProperties} />
            {form.specie !== "altele" && (
              <button type="button" onClick={() => { setRasaLibera(false); set("rasa", ""); }}
                style={{ padding: "0 12px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.surface, fontSize: 12, fontWeight: 700, color: c.text2, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Nunito, sans-serif" }}>
                ← Listă
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <select value={form.rasa} onChange={e => set("rasa", e.target.value)}
              style={{ ...inp, flex: 1, appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundColor: c.input, paddingRight: 36 } as React.CSSProperties}>
              <option value="">— Alege rasa —</option>
              {(RASE_PE_SPECII[form.specie] || []).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="button" onClick={() => { setRasaLibera(true); set("rasa", ""); }}
              style={{ padding: "0 12px", borderRadius: 10, border: "1.5px solid #FF6B00", background: c.orangeAccent, fontSize: 12, fontWeight: 700, color: "#FF6B00", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Nunito, sans-serif" }}>
              Altă rasă
            </button>
          </div>
        )}
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Talie</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { val: "mica", label: "Mică", desc: "sub 10 kg", icon: "🐕‍🦺" },
            { val: "medie", label: "Medie", desc: "10–25 kg", icon: "🐕" },
            { val: "mare", label: "Mare", desc: "peste 25 kg", icon: "🐺" },
          ].map(t => (
            <button key={t.val} type="button" onClick={() => set("talie", t.val)}
              style={{ padding: "8px 4px", borderRadius: 10, border: form.talie === t.val ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: form.talie === t.val ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: form.talie === t.val ? "#FF6B00" : c.text2 }}>{t.label}</span>
              <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Greutate (kg)</label>
          <input value={form.greutate} onChange={e => set("greutate", e.target.value)} type="number" placeholder="8.5" style={inp} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Vârstă (ani)</label>
          <input value={form.varsta} onChange={e => set("varsta", e.target.value)} type="number" placeholder="3" style={inp} />
        </div>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Alergii / Sensibilități</label>
        <input value={form.alergii} onChange={e => set("alergii", e.target.value)} placeholder='Fără alergii' style={inp} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 8 }}>Stare vaccinare</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button" onClick={() => set("vaccinat", true)}
            style={{ padding: "10px 8px", borderRadius: 10, border: form.vaccinat ? "2px solid #10B981" : `1.5px solid ${c.border}`, background: form.vaccinat ? "rgba(16,185,129,.1)" : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>💉</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: form.vaccinat ? "#10B981" : c.text2 }}>Vaccinat</span>
          </button>
          <button type="button" onClick={() => set("vaccinat", false)}
            style={{ padding: "10px 8px", borderRadius: 10, border: !form.vaccinat ? "2px solid #EF4444" : `1.5px solid ${c.border}`, background: !form.vaccinat ? "rgba(239,68,68,.08)" : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>❌</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: !form.vaccinat ? "#EF4444" : c.text2 }}>Nevaccinat</span>
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Anulează</button>
        <button onClick={onSave} style={{ flex: 2, padding: "12px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 16px rgba(255,107,0,.35)" }}>Salvează</button>
      </div>
    </div>
  );
}
