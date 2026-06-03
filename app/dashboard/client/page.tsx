"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo, useContext, createContext } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";
import { User, PawPrint, Calendar, CalendarDays, Bell, Settings, HelpCircle, LogOut, Sun, Moon, Star, Scissors, MapPin, Phone, AlertTriangle, CheckCircle2, XCircle, Trash2, Pencil, Upload, Download, Lock, Lightbulb, FileEdit, Image as ImageIcon, Clock, Search, Shield, Camera, type LucideIcon } from "lucide-react";
const SERVICII_DEMO = [
  { nume: "Tuns complet", pret: "80", durata: "60" },
  { nume: "Băiță + uscare", pret: "50", durata: "40" },
  { nume: "Tuns + Băiță + Unghii", pret: "120", durata: "90" },
  { nume: "Styling complet", pret: "150", durata: "120" },
];

const SALOANE = [
  { id: 1, nume: "Paws & Style", oras: "București, Sector 2", rating: 4.9, recenzii: 127, servicii: ["Tuns", "Băiță", "Unghii"], serviciiComplete: SERVICII_DEMO, pretDe: 80, distanta: "1.2 km", badge: "Top rated", culoare: "#FF6B00", bg: "#FFF3EA" },
  { id: 2, nume: "Fluffy Salon", oras: "București, Sector 1", rating: 4.8, recenzii: 89, servicii: ["Tuns", "Styling", "Spa"], serviciiComplete: SERVICII_DEMO, pretDe: 90, distanta: "2.1 km", badge: "Nou", culoare: "#8B5CF6", bg: "#F5F3FF" },
  { id: 3, nume: "Happy Pets Grooming", oras: "București, Sector 3", rating: 4.7, recenzii: 214, servicii: ["Tuns", "Băiță", "Anti-purici"], serviciiComplete: SERVICII_DEMO, pretDe: 65, distanta: "3.4 km", badge: "Popular", culoare: "#10B981", bg: "#ECFDF5" },
  { id: 4, nume: "Royal Dog Salon", oras: "București, Sector 4", rating: 4.9, recenzii: 56, servicii: ["Premium grooming", "Spa", "Masaj"], serviciiComplete: SERVICII_DEMO, pretDe: 120, distanta: "4.0 km", badge: "Premium", culoare: "#F59E0B", bg: "#FFFBEB" },
];

type ServiciuOferitC = { nume: string; preturi?: PreturiTalie; durate?: PreturiTalie };
type SalonItem = { id: string | number; nume: string; oras: string; rating: number; recenzii: number; servicii: string[]; serviciiComplete: Serviciu[]; pretDe: number; distanta: string; badge: string; culoare: string; bg: string; poza_url?: string; galerie?: string[]; echipa?: { nume: string; rol?: string; poza?: string; descriere?: string; orar?: Record<string, { activ: boolean; start: string; end: string }>; servicii_oferite?: (string | ServiciuOferitC)[] }[]; program?: Record<string, { activ: boolean; start: string; end: string }>; adresa?: string; telefon?: string; descriere?: string };

const PALETA_SALOANE = [
  { badge: "Top rated", culoare: "#FF6B00", bg: "#FFF3EA" },
  { badge: "Nou",       culoare: "#FF6B00", bg: "#FFF3EA" },
  { badge: "Popular",   culoare: "#FF6B00", bg: "#FFF3EA" },
  { badge: "Premium",   culoare: "#FF6B00", bg: "#FFF3EA" },
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
  { val: "caine", label: "Câine", icon: "🐕" },
  { val: "pisica", label: "Pisică", icon: "🐈" },
  { val: "iepure", label: "Iepure", icon: "🐇" },
  { val: "pasare", label: "Pasăre", icon: "🐦" },
  { val: "rozator", label: "Rozătoare", icon: "🐹" },
  { val: "reptila", label: "Reptilă", icon: "🦎" },
  { val: "altele", label: "Altele", icon: "🐾" },
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
function specieInfo(val?: string) { return SPECII.find(s => s.val === val) || { val: "altele", label: "—", icon: "—" }; }

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
const ZILE_ORDINE_C = ["1", "2", "3", "4", "5", "6", "0"];
const LUNA_SCURT = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ZILE_FULL_C = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const LUNA_FULL_C = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
function etichetaZiC(dataIso: string) {
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  const ieri = new Date(azi); ieri.setDate(ieri.getDate() - 1);
  const d = new Date(`${dataIso}T00:00:00`);
  const baza = `${ZILE_FULL_C[d.getDay()]}, ${d.getDate()} ${LUNA_FULL_C[d.getMonth()]}`;
  if (dataIso === isoDataC(azi)) return { prefix: "Azi", rest: baza, azi: true };
  if (dataIso === isoDataC(ieri)) return { prefix: "Ieri", rest: baza, azi: false };
  return { prefix: "", rest: baza, azi: false };
}
function timeToMinC(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minToTimeC(m: number) { const h = Math.floor(m / 60), mm = m % 60; return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; }
function isoDataC(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function gcdNumC(a: number, b: number): number { return b === 0 ? a : gcdNumC(b, a % b); }
function stepFromDurateC(durate: number[]): number {
  const valid = durate.filter(d => d > 0).map(d => Math.round(d / 5) * 5).filter(d => d > 0);
  if (valid.length === 0) return 30;
  let g = valid[0];
  for (let i = 1; i < valid.length; i++) g = gcdNumC(g, valid[i]);
  return Math.min(30, Math.max(5, g));
}
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
function sexLabel(val?: string) { return val === "mascul" ? "♂ Mascul" : val === "femela" ? "♀ Femelă" : "—"; }
function talieLabel(val?: string) { return val === "mica" ? "Mică" : val === "medie" ? "Medie" : val === "mare" ? "Mare" : "—"; }
function talieIcon(val?: string) { return val === "mica" ? "Mică" : val === "medie" ? "Medie" : val === "mare" ? "Mare" : "—"; }
function getPretDurata(serviciu: any, talie?: string): { pret: string; durata: string } {
  if (!serviciu) return { pret: "", durata: "" };
  const t = (talie === "mica" || talie === "medie" || talie === "mare") ? talie : "medie";
  const p = serviciu.preturi?.[t] || serviciu.pret || "";
  const d = serviciu.durate?.[t] || serviciu.durata || "";
  return { pret: String(p), durata: String(d) };
}
function getOverrideGroomer(groomer: any, numeServiciu: string): ServiciuOferitC | null {
  if (!groomer || !Array.isArray(groomer.servicii_oferite)) return null;
  for (const o of groomer.servicii_oferite) {
    if (typeof o === "string") { if (o === numeServiciu) return { nume: o }; }
    else if (o && o.nume === numeServiciu) return o;
  }
  return null;
}
function serviciuPentruGroomer(serviciuSalon: any, groomer: any): any {
  const ov = getOverrideGroomer(groomer, serviciuSalon.nume);
  if (!ov) return serviciuSalon;
  const baza = serviciuSalon.preturi || { mica: serviciuSalon.pret || "", medie: serviciuSalon.pret || "", mare: serviciuSalon.pret || "" };
  const bazaD = serviciuSalon.durate || { mica: serviciuSalon.durata || "", medie: serviciuSalon.durata || "", mare: serviciuSalon.durata || "" };
  const preturi = {
    mica: (ov.preturi?.mica && String(ov.preturi.mica).trim()) || baza.mica || "",
    medie: (ov.preturi?.medie && String(ov.preturi.medie).trim()) || baza.medie || "",
    mare: (ov.preturi?.mare && String(ov.preturi.mare).trim()) || baza.mare || "",
  };
  const durate = {
    mica: (ov.durate?.mica && String(ov.durate.mica).trim()) || bazaD.mica || "",
    medie: (ov.durate?.medie && String(ov.durate.medie).trim()) || bazaD.medie || "",
    mare: (ov.durate?.mare && String(ov.durate.mare).trim()) || bazaD.mare || "",
  };
  return { ...serviciuSalon, preturi, durate, pret: preturi.medie || serviciuSalon.pret || "", durata: durate.medie || serviciuSalon.durata || "" };
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
  groomer: string | null;
};
type PreturiTalie = { mica: string; medie: string; mare: string };
type Serviciu = { nume: string; pret: string; durata: string; preturi?: PreturiTalie; durate?: PreturiTalie };
type RecenzieUI = { id: string; user_id: string; rating: number; text: string; created_at: string; nume: string; avatar_url: string | null };

function timpRelativ(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const zile = Math.floor(diff / 86400000);
  if (zile <= 0) return "azi";
  if (zile === 1) return "acum 1 zi";
  if (zile < 7) return `acum ${zile} zile`;
  const sapt = Math.floor(zile / 7);
  if (sapt === 1) return "acum 1 săptămână";
  if (sapt < 5) return `acum ${sapt} săptămâni`;
  const luni = Math.floor(zile / 30);
  if (luni === 1) return "acum 1 lună";
  if (luni < 12) return `acum ${luni} luni`;
  const ani = Math.floor(zile / 365);
  return ani === 1 ? "acum 1 an" : `acum ${ani} ani`;
}

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
    "în așteptare": { bg: d ? "rgba(255,107,0,.15)"   : "#FFF3EA", color: "#FF6B00", label: "În așteptare" },
    "finalizat":    { bg: d ? "rgba(14,165,233,.15)"  : "#F0F9FF", color: "#0EA5E9", label: "Finalizat" },
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
  const [rezervare, setRezervare] = useState<{ salonId: string | number; servicii: string[]; ora: string } | null>(null);
  const [confirmat, setConfirmat] = useState(false);
  const [programari, setProgramari] = useState<Programare[]>([]);
  const [confirmareLoading, setConfirmareLoading] = useState(false);
  const [confirmareError, setConfirmareError] = useState("");
  const [notifSettings, setNotifSettings] = useState({ sms: true, newsletter: false });
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
  const [ocupariSalon, setOcupariSalon] = useState<{ ora: string; durata: number | null; data: string; groomer?: string | null }[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [profilSalonTab, setProfilSalonTab] = useState<"servicii" | "specialisti" | "recenzii" | "contact">("servicii");
  const [groomerSelectat, setGroomerSelectat] = useState<string | null>(null);
  const [rezervareActiva, setRezervareActiva] = useState(false);
  const [etapaBooking, setEtapaBooking] = useState<"specialist" | "calendar">("calendar");
  const [cautare, setCautare] = useState("");
  const [filtruOras, setFiltruOras] = useState("");
  const [orasDropdown, setOrasDropdown] = useState(false);
  const [orasInput, setOrasInput] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [esteMobil, setEsteMobil] = useState(false);
  const [observatiiBooking, setObservatiiBooking] = useState("");
  const [sortareSalon, setSortareSalon] = useState<"recomandat" | "rating" | "alfabetic">("recomandat");
  const [filtruServiciu, setFiltruServiciu] = useState("");
  const [filtruServiciuDropdown, setFiltruServiciuDropdown] = useState(false);
  const [recenziiSalon, setRecenziiSalon] = useState<RecenzieUI[]>([]);
  const [recenziiLoading, setRecenziiLoading] = useState(false);
  const [ratinguriSaloane, setRatinguriSaloane] = useState<Record<string, { medie: number; nr: number }>>({});
  const [recenzieRating, setRecenzieRating] = useState(0);
  const [recenzieText, setRecenzieText] = useState("");
  const [recenzieLoading, setRecenzieLoading] = useState(false);
  const [recenzieError, setRecenzieError] = useState("");
  const animal = animale.find(a => a.id === selectedAnimalId) || animale[0] || null;

  useEffect(() => {
    const mobil = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
    setEsteMobil(mobil);
  }, []);

  function detecteazaLocatia() {
    setGeoError("");
    if (!("geolocation" in navigator)) { setGeoError("Geolocația nu e suportată de browser"); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=ro`);
          const data = await res.json();
          const oras = data?.address?.city || data?.address?.town || data?.address?.municipality || data?.address?.county || "";
          if (oras) {
            setFiltruOras(oras.replace(/^(Municipiul|Sectorul|Orașul)\s+/i, "").trim());
            setOrasDropdown(false);
          } else {
            setGeoError("Nu am putut determina orașul");
          }
        } catch {
          setGeoError("Eroare la detectarea locației");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) setGeoError("Activează Serviciile de localizare pentru Safari (Setări → Confidențialitate → Servicii localizare → Safari)");
        else if (err.code === 3) setGeoError("Locația durează prea mult, încearcă din nou");
        else setGeoError("Nu am putut accesa locația");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

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

      // Cache saloane din localStorage pentru afișare instant
      try {
        const cached = localStorage.getItem("calyhub_saloane_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) setSaloaneList(parsed);
        }
      } catch {}

      // Toate cererile în paralel — câștig major de viteză la logare
      const [
        { data: profile },
        { data: animaleData },
        { data: dbSaloane },
      ] = await Promise.all([
        supabase.from("profiluri").select("*").eq("id", authUser.id).single(),
        supabase.from("animale").select("*").eq("user_id", authUser.id).order("created_at", { ascending: true }),
        supabase.from("saloane").select("id, nume, oras, servicii, poza_url, galerie, echipa, program, adresa, telefon, descriere").order("created_at", { ascending: false }),
      ]);

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

      if (animaleData && animaleData.length > 0) {
        setAnimale(animaleData);
        setSelectedAnimalId(animaleData[0].id);
      } else if (profile?.tip === "client") {
        router.push("/register/configurare-animal");
        return;
      }

      if (dbSaloane && dbSaloane.length > 0) {
        const mapped = dbSaloane.map(mapSalonDB);
        setSaloaneList(mapped);
        try { localStorage.setItem("calyhub_saloane_cache", JSON.stringify(mapped)); } catch {}
      }

      // Restul în paralel; autoFinalizeaza nu blochează UI
      autoFinalizeaza(authUser.id);
      loadProgramari(authUser.id);
      loadNotificari(authUser.id);
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
        .select("id, salon_id, serviciu, pret, data, ora, status, groomer, saloane(nume)")
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
          groomer: p.groomer || null,
        })));
      }
    }
    loadUser();
  }, []);

  // Agregare rating pentru toate saloanele (carduri)
  useEffect(() => {
    if (saloaneList.length === 0) return;
    (async () => {
      const { data } = await supabase.from("recenzii").select("salon_id, rating");
      if (!data) return;
      const acc: Record<string, { suma: number; nr: number }> = {};
      for (const r of data as any[]) {
        const k = String(r.salon_id);
        if (!acc[k]) acc[k] = { suma: 0, nr: 0 };
        acc[k].suma += r.rating; acc[k].nr += 1;
      }
      const out: Record<string, { medie: number; nr: number }> = {};
      for (const k in acc) out[k] = { medie: acc[k].suma / acc[k].nr, nr: acc[k].nr };
      setRatinguriSaloane(out);
    })();
  }, [saloaneList]);

  // Încarcă recenziile salonului selectat
  useEffect(() => {
    if (!salonSelectat) { setRecenziiSalon([]); return; }
    setRecenzieRating(0); setRecenzieText(""); setRecenzieError("");
    (async () => {
      setRecenziiLoading(true);
      const { data: recs } = await supabase
        .from("recenzii")
        .select("id, user_id, rating, text, created_at")
        .eq("salon_id", salonSelectat)
        .order("created_at", { ascending: false });
      if (!recs || recs.length === 0) { setRecenziiSalon([]); setRecenziiLoading(false); return; }
      const userIds = Array.from(new Set(recs.map((r: any) => r.user_id)));
      const { data: profile } = await supabase.from("profiluri").select("id, nume, avatar_url").in("id", userIds);
      const pmap = new Map((profile || []).map((p: any) => [p.id, p]));
      setRecenziiSalon(recs.map((r: any) => ({
        id: r.id, user_id: r.user_id, rating: r.rating, text: r.text, created_at: r.created_at,
        nume: pmap.get(r.user_id)?.nume || "Client CalyHub",
        avatar_url: pmap.get(r.user_id)?.avatar_url || null,
      })));
      setRecenziiLoading(false);
    })();
  }, [salonSelectat]);

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
    if (!salonSelectat || !rezervare?.servicii?.length) return;
    (async () => {
      const azi = new Date(); azi.setHours(0, 0, 0, 0);
      const peste14 = new Date(azi); peste14.setDate(azi.getDate() + 15);
      const { data: rows } = await supabase
        .from("programari")
        .select("ora, durata, data, groomer")
        .eq("salon_id", salonSelectat)
        .gte("data", isoDataC(azi))
        .lt("data", isoDataC(peste14))
        .neq("status", "anulat");
      setOcupariSalon((rows as any[]) || []);
    })();
  }, [rezervare?.servicii?.join("|"), salonSelectat, dataSelectata]);

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

  async function trimiteRecenzie(salonId: string | number, progId: string | null) {
    if (recenzieRating < 1) { setRecenzieError("Alege un număr de stele."); return; }
    if (recenzieText.trim().length < 10) { setRecenzieError("Scrie minim 10 caractere."); return; }
    setRecenzieError(""); setRecenzieLoading(true);
    const { data: inserted, error } = await supabase.from("recenzii").insert({
      salon_id: salonId, user_id: userId, programare_id: progId,
      rating: recenzieRating, text: recenzieText.trim(),
    }).select("id, user_id, rating, text, created_at").single();
    setRecenzieLoading(false);
    if (error) { setRecenzieError("Nu am putut trimite recenzia. Poate ai recenzat deja."); return; }
    const noua: RecenzieUI = {
      id: inserted.id, user_id: inserted.user_id, rating: inserted.rating, text: inserted.text,
      created_at: inserted.created_at, nume: profilForm.numeComplet || "Client CalyHub", avatar_url: avatarUrl,
    };
    setRecenziiSalon(prev => [noua, ...prev]);
    setRatinguriSaloane(prev => {
      const k = String(salonId); const cur = prev[k] || { medie: 0, nr: 0 };
      const nrNou = cur.nr + 1;
      return { ...prev, [k]: { medie: (cur.medie * cur.nr + recenzieRating) / nrNou, nr: nrNou } };
    });
    setRecenzieRating(0); setRecenzieText(""); setSavedMsg("Recenzie trimisă, mulțumim!");
    setTimeout(() => setSavedMsg(""), 2500);
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

    const groomerObj = groomerSelectat ? salon.echipa?.find(m => m.nume === groomerSelectat) : null;
    let pretNumeric = 0;
    let durataNumeric = 0;
    for (const nume of rezervare.servicii) {
      const svBaza = salon.serviciiComplete.find(s => s.nume === nume);
      const sv = groomerObj && svBaza ? serviciuPentruGroomer(svBaza, groomerObj) : svBaza;
      const { pret: pStr, durata: dStr } = getPretDurata(sv, animal?.talie);
      pretNumeric += Number(pStr) || 0;
      durataNumeric += Number(dStr) || 0;
    }
    if (durataNumeric === 0) durataNumeric = 60;
    const serviciuJoined = rezervare.servicii.join(" + ");
    const dataIso = dataSelectata;

    const obsTrim = observatiiBooking.trim();
    const { data: nou, error } = await supabase
      .from("programari")
      .insert({
        user_id: authUser.id,
        salon_id: salon.id,
        animal_id: animal?.id || null,
        serviciu: serviciuJoined,
        pret: pretNumeric,
        durata: durataNumeric,
        talie_animal: animal?.talie || null,
        data: dataIso,
        ora: rezervare.ora,
        status: "în așteptare",
        sursa: "app",
        groomer: groomerSelectat || null,
        observatii: obsTrim || null,
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
      serviciu: serviciuJoined,
      data: dataIso,
      ora: rezervare.ora,
      status: "în așteptare",
      pret: pretNumeric,
      groomer: groomerSelectat || null,
    }, ...prev]);

    // Notificare pentru proprietarul salonului
    if (salonRow?.user_id) {
      await supabase.from("notificari").insert({
        user_id: salonRow.user_id,
        tip: "programare_noua",
        mesaj: `🐾 ${user?.nume || "Un client"} a solicitat o programare pentru ${animal?.nume || "animăluțul său"} — ${serviciuJoined}`,
        programare_id: nou.id,
      });
    }

    setObservatiiBooking("");
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
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: c.orangeAccent, border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}><CheckCircle2 size={40} color="#FF6B00" strokeWidth={2} /></div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: c.text, marginBottom: 10 }}>Programare trimisă!</h1>
              <p style={{ fontSize: 14, color: c.muted, marginBottom: 24, lineHeight: 1.7 }}>Salonul va confirma în curând. Vei primi notificare când se aprobă.</p>
              <div style={{ background: c.surface, border: "2px solid #FF6B00", borderRadius: 20, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
                {[["Salon", salon.nume], ["Serviciu", rezervare.servicii.join(" + ")], ["Data", new Date(dataSelectata + "T00:00:00").toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })], ["Ora", rezervare.ora], ["Animal", animal?.nume || "Animăluțul tău"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderBottom: `1px solid ${c.border2}` }}>
                    <span style={{ color: c.muted }}>{k}</span><span style={{ fontWeight: 700, color: c.text }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => { setConfirmat(false); setSalonSelectat(null); setRezervare(null); setRezervareActiva(false); setGroomerSelectat(null); setEtapaBooking("calendar"); setProfilSalonTab("servicii"); setTab("programari"); }} style={btnSecondary}>Vezi programările mele</button>
                <button onClick={() => { setConfirmat(false); setSalonSelectat(null); setRezervare(null); setRezervareActiva(false); setGroomerSelectat(null); setEtapaBooking("calendar"); setProfilSalonTab("servicii"); }} style={btnPrimary}>← Înapoi la saloane</button>
              </div>
            </div>
          </div>
        </Shell>
      </ThemeCtx.Provider>
    );
  }

  /* ── Profil salon view ── */
  if (salonSelectat && salon) {
    const nrRecenzii = recenziiSalon.length;
    const medieRecenzii = nrRecenzii > 0 ? recenziiSalon.reduce((s, r) => s + r.rating, 0) / nrRecenzii : 0;
    const userAScris = recenziiSalon.some(r => r.user_id === userId);
    const areProgramareFinalizata = programari.some(p => String(p.salon_id) === String(salonSelectat) && p.status === "finalizat");
    const poateRecenza = areProgramareFinalizata && !userAScris;

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
    const CalendarSlots = (serviciiNume: string[]) => {
      const groomerObj = groomerSelectat ? salon.echipa?.find((m: any) => m.nume === groomerSelectat) : null;
      const serviciiObj = serviciiNume.map(n => {
        const baza = salon.serviciiComplete.find(s => s.nume === n);
        if (!baza) return null;
        return groomerObj ? serviciuPentruGroomer(baza, groomerObj) : baza;
      }).filter(Boolean) as any[];
      let durataSv = 0;
      const durateAll: number[] = [];
      for (const sv of serviciiObj) {
        const { durata: dStr } = getPretDurata(sv, animal?.talie);
        const dNum = Number(dStr) || 0;
        durataSv += dNum;
        if (dNum > 0) durateAll.push(dNum);
      }
      if (durataSv === 0) durataSv = 60;
      const stepClient = stepFromDurateC(durateAll);
      const progEf = (groomerObj?.orar && Object.keys(groomerObj.orar).length > 0 ? groomerObj.orar : null) || programSalon || PROGRAM_DEFAULT_C;
      const ocupariEf = groomerSelectat
        ? ocupariSalon.filter(o => !o.groomer || o.groomer === groomerSelectat)
        : ocupariSalon;
      const aziDate = new Date(); aziDate.setHours(0, 0, 0, 0);
      const aziIso = isoDataC(aziDate);
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

      const zileLista: { iso: string; ziScurt: string; zi: number; luna: string; libere: number; inchis: boolean }[] = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(aziDate); d.setDate(aziDate.getDate() + i);
        const iso = isoDataC(d);
        const dow = String(d.getDay());
        const programZi = progEf[dow];
        const inchis = !programZi?.activ;
        let libere = 0;
        if (!inchis) {
          const slots = genereazaSloturiClient(programZi, durataSv, stepClient);
          for (const s of slots) {
            const start = timeToMinC(s);
            const end = start + durataSv;
            if (iso === aziIso && start <= nowMin) continue;
            const ocupat = ocupariEf.some(o => o.data === iso && suprapunereC(start, end, o.ora, o.durata));
            if (!ocupat) libere++;
          }
        }
        zileLista.push({ iso, ziScurt: ZILE_SCURT[d.getDay()], zi: d.getDate(), luna: LUNA_SCURT[d.getMonth()], libere, inchis });
      }

      const dowSel = String(new Date(dataSelectata + "T00:00:00").getDay());
      const progZiSel = progEf[dowSel];
      const sloturiZiSel: { ora: string; ocupat: boolean; trecut: boolean }[] = [];
      if (progZiSel?.activ) {
        const slots = genereazaSloturiClient(progZiSel, durataSv, stepClient);
        for (const s of slots) {
          const start = timeToMinC(s);
          const end = start + durataSv;
          const trecut = dataSelectata === aziIso && start <= nowMin;
          const ocupat = ocupariEf.some(o => o.data === dataSelectata && suprapunereC(start, end, o.ora, o.durata));
          sloturiZiSel.push({ ora: s, ocupat, trecut });
        }
      }
      const sloturiLibere = sloturiZiSel.filter(s => !s.ocupat && !s.trecut);

      let totalPretSlot = 0;
      for (const sv of serviciiObj) { const { pret } = getPretDurata(sv, animal?.talie); totalPretSlot += Number(pret) || 0; }
      const etZi = etichetaZiC(dataSelectata);
      const ziLabel = etZi.prefix ? `${etZi.prefix.toLowerCase()}` : etZi.rest.split(",")[0].toLowerCase();

      return (
        <>
          <SectionTitle>Alege ziua</SectionTitle>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 18, scrollbarWidth: "thin" }}>
            {zileLista.map(z => {
              const sel = z.iso === dataSelectata;
              const indisp = z.inchis || z.libere === 0;
              const eticheta = z.inchis ? "Închis" : z.libere === 0 ? "Plin" : `${z.libere} libere`;
              const culoareEticheta = z.inchis ? c.xmuted : z.libere === 0 ? "#EF4444" : "#10B981";
              return (
                <button key={z.iso} disabled={indisp} onClick={() => { setDataSelectata(z.iso); setRezervare(r => ({ ...r!, ora: "" })); }}
                  style={{ padding: "10px 12px", borderRadius: 12, border: sel ? `2px solid ${salon.culoare}` : `1.5px solid ${c.border}`, background: sel ? (theme === "dark" ? `${salon.culoare}26` : salon.bg) : c.surface, cursor: indisp ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0, textAlign: "center", minWidth: 68, opacity: indisp ? 0.45 : 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: sel ? salon.culoare : c.muted, textTransform: "uppercase" }}>{z.ziScurt}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: sel ? salon.culoare : c.text, margin: "2px 0" }}>{z.zi}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: sel ? salon.culoare : c.xmuted }}>{z.luna}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: sel ? salon.culoare : culoareEticheta, marginTop: 4 }}>{eticheta}</div>
                </button>
              );
            })}
          </div>

          <SectionTitle>Ore disponibile {ziLabel}</SectionTitle>
          {sloturiZiSel.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 14, border: `1.5px dashed ${c.border}`, marginBottom: 24 }}>
              Salonul nu lucrează în ziua aleasă.
            </div>
          ) : sloturiLibere.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 14, border: `1.5px dashed ${c.border}`, marginBottom: 24 }}>
              Toate orele sunt ocupate în ziua aleasă. Încearcă altă zi.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {sloturiLibere.map(slot => {
                const sel = rezervare?.ora === slot.ora;
                return (
                  <button key={slot.ora} onClick={() => setRezervare(r => ({ ...r!, ora: slot.ora }))}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderRadius: 14, border: sel ? `2px solid ${salon.culoare}` : `1.5px solid ${c.border}`, background: sel ? (theme === "dark" ? `${salon.culoare}26` : salon.bg) : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: sel ? salon.culoare : c.text }}>{slot.ora}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      {totalPretSlot > 0 && <span style={{ fontSize: 14, fontWeight: 800, color: sel ? salon.culoare : c.text2 }}>{totalPretSlot} RON</span>}
                      <span style={{ fontSize: 18, fontWeight: 900, color: sel ? salon.culoare : c.xmuted, lineHeight: 1 }}>›</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      );
    };

    /* ── Booking view (when rezervareActiva) ── */
    if (rezervareActiva) {
      /* ── Ecran selecție specialist ── */
      if (etapaBooking === "specialist") {
        return (
          <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
            <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab} necitite={necitite} avatarUrl={avatarUrl} onBack={() => { setRezervareActiva(false); setRezervare(null); setGroomerSelectat(null); }} backLabel="Profil salon">
              <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "14px 18px", marginBottom: 22 }}>
                  {salon.poza_url
                    ? <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}><img src={salon.poza_url} alt={salon.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                    : <Scissors size={28} color="#FF6B00" strokeWidth={2} style={{ flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>{salon.nume}</div>
                    <div style={{ fontSize: 12, color: c.muted, display: "flex", alignItems: "center", gap: 4 }}><Scissors size={12} color={c.muted} strokeWidth={2} /> {rezervare?.servicii?.join(" + ")}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: c.text, marginBottom: 4 }}>Alege specialistul</div>
                <div style={{ fontSize: 12, color: c.muted, marginBottom: 18 }}>Vei vedea programul lui și poți rezerva un slot disponibil.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(salon.echipa || []).map((m: any, idx: number) => {
                    return (
                      <div key={idx} style={{ background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                          {m.poza
                            ? <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}><img src={m.poza} alt={m.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                            : <div style={{ width: 52, height: 52, borderRadius: 12, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scissors size={24} color={salon.culoare} strokeWidth={2} /></div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{m.nume}</div>
                            {m.specialitate && <div style={{ fontSize: 12, color: salon.culoare, fontWeight: 700, marginTop: 2 }}>{m.specialitate}</div>}
                            {m.descriere && <div style={{ fontSize: 12, color: c.muted, marginTop: 4, lineHeight: 1.5 }}>{m.descriere}</div>}
                          </div>
                        </div>
                        <button onClick={() => { setGroomerSelectat(m.nume); setEtapaBooking("calendar"); setRezervare(r => r ? { ...r, servicii: [], ora: "" } : r); }}
                          style={{ ...btnPrimary, background: salon.culoare, boxShadow: "none", padding: "10px 22px", fontSize: 13, width: "100%" }}>
                          Alege →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {Lightbox}
            </Shell>
          </ThemeCtx.Provider>
        );
      }

      return (
        <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
          <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab} necitite={necitite} avatarUrl={avatarUrl}
            onBack={() => {
              if (salon.echipa && salon.echipa.length > 0 && groomerSelectat) {
                setEtapaBooking("specialist");
                setGroomerSelectat(null);
                setRezervare(r => r ? { ...r, servicii: [], ora: "" } : r);
              } else {
                setRezervareActiva(false); setRezervare(null); setGroomerSelectat(null); setEtapaBooking("calendar");
              }
            }}
            backLabel={salon.echipa && salon.echipa.length > 0 ? "Alege specialist" : "Profil salon"}>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px" }}>

              {/* Salon mini-header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "14px 18px", marginBottom: 22 }}>
                {salon.poza_url
                  ? <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}><img src={salon.poza_url} alt={salon.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  : <div style={{ width: 48, height: 48, borderRadius: 12, background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scissors size={24} color="#FF6B00" strokeWidth={2} /></div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>{salon.nume}</div>
                  <div style={{ fontSize: 12, color: c.muted, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} color={c.muted} strokeWidth={2} /> {salon.oras}</div>
                </div>
                {groomerSelectat && (
                  <div style={{ marginLeft: "auto", background: theme === "dark" ? `${salon.culoare}26` : salon.bg, border: `1px solid ${salon.culoare}`, borderRadius: 50, padding: "4px 12px", fontSize: 12, fontWeight: 800, color: salon.culoare, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    <User size={12} color={salon.culoare} strokeWidth={2} /> {groomerSelectat}
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
                    <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 4, display: "flex", alignItems: "flex-start", gap: 4 }}>
                      <AlertTriangle size={13} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} /> {animal?.nume || "Animalul"} nu are talie setată. Mergi la „Animalele mele" și alege talia pentru a vedea prețurile corecte.
                    </div>
                  )}
                  {groomerSelectat && (() => {
                    const groomerObj = salon.echipa?.find(m => m.nume === groomerSelectat);
                    const svOferite = groomerObj?.servicii_oferite;
                    if (svOferite && svOferite.length > 0) {
                      return (
                        <div style={{ fontSize: 12, color: c.muted, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <User size={12} color={c.muted} strokeWidth={2} /> Servicii și prețuri la <strong style={{ color: c.text }}>{groomerSelectat}</strong>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {(() => {
                    const groomerObj = groomerSelectat ? salon.echipa?.find(m => m.nume === groomerSelectat) : null;
                    return salon.serviciiComplete.filter(s => {
                      if (!groomerObj) return true;
                      const svOferite = groomerObj.servicii_oferite;
                      if (!svOferite || svOferite.length === 0) return true;
                      return !!getOverrideGroomer(groomerObj, s.nume);
                    }).map(sBaza => {
                      const s = groomerObj ? serviciuPentruGroomer(sBaza, groomerObj) : sBaza;
                      const sel = (rezervare?.servicii || []).includes(s.nume);
                      const { pret, durata } = getPretDurata(s, animal?.talie);
                      if (!pret && !durata) return null;
                    return (
                      <button key={s.nume} onClick={() => setRezervare(r => {
                        const curr = r?.servicii || [];
                        const next = curr.includes(s.nume) ? curr.filter(n => n !== s.nume) : [...curr, s.nume];
                        return { salonId: salon.id, servicii: next, ora: r?.ora && next.length === curr.length ? r.ora : "" };
                      })}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 14, border: sel ? `2px solid ${salon.culoare}` : `1.5px solid ${c.border}`, background: sel ? (theme === "dark" ? `${salon.culoare}26` : salon.bg) : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${sel ? salon.culoare : c.border}`, background: sel ? salon.culoare : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color: "#fff", fontWeight: 900 }}>{sel ? "✓" : ""}</div>
                          <div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{s.nume}</div>{durata && <div style={{ fontSize: 12, color: c.xmuted, marginTop: 2 }}>⏱ {durata} min</div>}</div>
                        </div>
                        {pret && <div style={{ fontSize: 15, fontWeight: 900, color: salon.culoare, marginLeft: 12, flexShrink: 0 }}>{pret} RON</div>}
                      </button>
                    );
                  });
                })()}
                </div>
              )}

              {(() => {
                const groomerObj = groomerSelectat ? salon.echipa?.find(m => m.nume === groomerSelectat) : null;
                const selServ = (rezervare?.servicii || []).map(n => {
                  const baza = salon.serviciiComplete.find(s => s.nume === n);
                  if (!baza) return null;
                  return groomerObj ? serviciuPentruGroomer(baza, groomerObj) : baza;
                }).filter(Boolean) as any[];
                if (!selServ.length) return null;
                let totalPret = 0, totalDurata = 0;
                for (const sv of selServ) {
                  const { pret, durata } = getPretDurata(sv, animal?.talie);
                  totalPret += Number(pret) || 0;
                  totalDurata += Number(durata) || 0;
                }
                return (
                  <div style={{ background: theme === "dark" ? `${salon.culoare}26` : salon.bg, border: `2px solid ${salon.culoare}`, borderRadius: 14, padding: "12px 16px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: salon.culoare }}>
                      {selServ.length} {selServ.length === 1 ? "serviciu" : "servicii"} · ⏱ {totalDurata} min
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: salon.culoare }}>{totalPret} RON</div>
                  </div>
                );
              })()}

              {rezervare?.servicii?.length ? CalendarSlots(rezervare.servicii) : null}

              {(rezervare?.servicii?.length ?? 0) > 0 && rezervare?.ora && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>
                    Observații pentru salon <span style={{ fontWeight: 500, color: c.xmuted }}>(opțional)</span>
                  </label>
                  <textarea value={observatiiBooking} onChange={e => setObservatiiBooking(e.target.value.slice(0, 500))}
                    placeholder="Ex: blana foarte încâlcită, e prima vizită, este speriat de uscător..."
                    rows={3}
                    style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontSize: 13, fontFamily: "Nunito, sans-serif", outline: "none", resize: "vertical", minHeight: 72 }} />
                  <div style={{ fontSize: 11, color: c.xmuted, marginTop: 4, textAlign: "right" }}>{observatiiBooking.length}/500</div>
                </div>
              )}
              {confirmareError && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#EF4444", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={14} color="#EF4444" strokeWidth={2} /> {confirmareError}
                </div>
              )}
              {(rezervare?.servicii?.length ?? 0) > 0 && rezervare?.ora && (
                <button onClick={creazaProgramare} disabled={confirmareLoading}
                  style={{ ...btnPrimary, width: "100%", background: confirmareLoading ? "#FFB07A" : "#FF6B00", cursor: confirmareLoading ? "default" : "pointer" }}>
                  {confirmareLoading ? "Se salvează..." : "Confirmă programarea →"}
                </button>
              )}
            </div>
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
        <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab} necitite={necitite} avatarUrl={avatarUrl}
          onBack={() => { setSalonSelectat(null); setRezervare(null); setRezervareActiva(false); setGroomerSelectat(null); setEtapaBooking("calendar"); setProfilSalonTab("servicii"); }}
          backLabel={salon.nume}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

            {/* Cover photo */}
            <div style={{ position: "relative", height: 220, background: c.surface2, overflow: "hidden" }}>
              {salon.poza_url
                ? <img src={salon.poza_url} alt={salon.nume} onClick={() => setLightboxIdx(0)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: c.surface2 }}><Scissors size={64} color="#FF6B00" strokeWidth={1.5} /></div>}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.7) 100%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 16, left: 18, right: 18, pointerEvents: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: salon.culoare, padding: "3px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>{salon.badge}</span>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "6px 0 2px", textShadow: "0 1px 4px rgba(0,0,0,.4)" }}>{salon.nume}</h2>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} color="rgba(255,255,255,.85)" strokeWidth={2} /> {salon.oras}{salon.distanta ? ` · ${salon.distanta}` : ""}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    {nrRecenzii > 0 ? (<>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}><Star size={18} color="#F59E0B" fill="#F59E0B" strokeWidth={0} /> {medieRecenzii.toFixed(1)}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)" }}>{nrRecenzii} {nrRecenzii === 1 ? "recenzie" : "recenzii"}</div>
                    </>) : (
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", background: "rgba(255,255,255,.2)", padding: "4px 12px", borderRadius: 50 }}>Nou</div>
                    )}
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
                const labels: Record<string, string> = { servicii: "Servicii", specialisti: "Specialiști", recenzii: nrRecenzii > 0 ? `Recenzii (${nrRecenzii})` : "Recenzii", contact: "Contact" };
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
            <div style={{ padding: "20px 18px 32px" }}>

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
                        <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 14, padding: "8px 12px", background: "rgba(239,68,68,.07)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 4 }}>
                          <AlertTriangle size={13} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} /> {animal?.nume || "Animalul"} nu are talie setată — mergi la „Animalele mele" pentru prețuri corecte.
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {salon.serviciiComplete.map(s => {
                          // Interval de preț/durată: peste toți specialiștii care oferă serviciul
                          // (sau prețul de bază al salonului dacă nu există echipă). Transparent din prima.
                          const echipaS: any[] = salon.echipa || [];
                          const preturi: number[] = [];
                          const durate: number[] = [];
                          if (echipaS.length === 0) {
                            const { pret, durata } = getPretDurata(s, animal?.talie);
                            if (Number(pret) > 0) preturi.push(Number(pret));
                            if (Number(durata) > 0) durate.push(Number(durata));
                          } else {
                            for (const m of echipaS) {
                              const ofera = !m.servicii_oferite || m.servicii_oferite.length === 0 || !!getOverrideGroomer(m, s.nume);
                              if (!ofera) continue;
                              const { pret, durata } = getPretDurata(serviciuPentruGroomer(s, m), animal?.talie);
                              if (Number(pret) > 0) preturi.push(Number(pret));
                              if (Number(durata) > 0) durate.push(Number(durata));
                            }
                          }
                          if (preturi.length === 0 && durate.length === 0) return null;
                          const pMin = preturi.length ? Math.min(...preturi) : 0;
                          const pMax = preturi.length ? Math.max(...preturi) : 0;
                          const dMin = durate.length ? Math.min(...durate) : 0;
                          const dMax = durate.length ? Math.max(...durate) : 0;
                          const pretTxt = preturi.length === 0 ? "" : pMin === pMax ? `${pMin} RON` : `${pMin}–${pMax} RON`;
                          const durTxt = durate.length === 0 ? "" : dMin === dMax ? `${dMin} min` : `${dMin}–${dMax} min`;
                          const varianta = pMin !== pMax || dMin !== dMax;
                          return (
                            <div key={s.nume} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 16, border: `1.5px solid ${c.border}`, background: c.surface }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{s.nume}</div>
                                {durTxt && <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>⏱ {durTxt}</div>}
                                {varianta && <div style={{ fontSize: 11, color: c.xmuted, marginTop: 3 }}>în funcție de specialist</div>}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                                {pretTxt && <div style={{ fontSize: 16, fontWeight: 900, color: salon.culoare, whiteSpace: "nowrap" }}>{pretTxt}</div>}
                                <button onClick={() => {
                                  setRezervare({ salonId: salon.id, servicii: [s.nume], ora: "" });
                                  setGroomerSelectat(null);
                                  setEtapaBooking(salon.echipa && salon.echipa.length > 0 ? "specialist" : "calendar");
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
                            : <div style={{ width: 56, height: 56, borderRadius: 14, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scissors size={24} color={salon.culoare} strokeWidth={2} /></div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{m.nume}</div>
                            {m.rol && <div style={{ fontSize: 12, color: salon.culoare, fontWeight: 700, marginTop: 2 }}>{m.rol}</div>}
                            {m.descriere && <div style={{ fontSize: 12, color: c.muted, marginTop: 4, lineHeight: 1.5 }}>{m.descriere}</div>}
                          </div>
                          <button onClick={() => { setGroomerSelectat(m.nume); setEtapaBooking("calendar"); setRezervareActiva(true); }}
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
                            : <div style={{ width: 56, height: 56, borderRadius: 14, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scissors size={24} color={salon.culoare} strokeWidth={2} /></div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{m.nume}</div>
                            {m.rol && <div style={{ fontSize: 12, color: salon.culoare, fontWeight: 700, marginTop: 2 }}>{m.rol}</div>}
                            {m.descriere && <div style={{ fontSize: 12, color: c.muted, marginTop: 4, lineHeight: 1.5 }}>{m.descriere}</div>}
                          </div>
                          <button onClick={() => { setGroomerSelectat(m.nume); setEtapaBooking("calendar"); setRezervareActiva(true); }}
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
                  {recenziiLoading ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: c.muted, fontSize: 14, fontWeight: 600 }}>Se încarcă recenziile...</div>
                  ) : (<>
                    {/* Sumar rating */}
                    {nrRecenzii > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 20, background: c.surface, borderRadius: 18, border: `1.5px solid ${c.border}`, padding: "20px 22px", marginBottom: 20 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 48, fontWeight: 900, color: c.text, lineHeight: 1 }}>{medieRecenzii.toFixed(1)}</div>
                          <div style={{ display: "flex", gap: 2, marginTop: 4, justifyContent: "center" }}>{Array.from({ length: Math.round(medieRecenzii) }).map((_, i) => <Star key={i} size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />)}</div>
                          <div style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>din {nrRecenzii} {nrRecenzii === 1 ? "recenzie" : "recenzii"}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          {[5, 4, 3, 2, 1].map(stea => {
                            const cnt = recenziiSalon.filter(r => r.rating === stea).length;
                            const pct = nrRecenzii > 0 ? Math.round((cnt / nrRecenzii) * 100) : 0;
                            return (
                              <div key={stea} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 11, color: c.muted, fontWeight: 700, minWidth: 12 }}>{stea}</span>
                                <Star size={11} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                                <div style={{ flex: 1, height: 6, background: c.border, borderRadius: 99, overflow: "hidden" }}>
                                  <div style={{ width: `${pct}%`, height: "100%", background: "#FF6B00", borderRadius: 99 }} />
                                </div>
                                <span style={{ fontSize: 11, color: c.muted, minWidth: 22 }}>{cnt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", background: c.surface, borderRadius: 18, border: `1.5px solid ${c.border}`, padding: "32px 20px", marginBottom: 20 }}>
                        <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><Star size={40} color="#F59E0B" fill="#F59E0B" strokeWidth={0} /></div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 4 }}>Încă nu există recenzii</div>
                        <div style={{ fontSize: 13, color: c.muted }}>Fii primul care lasă o părere după o programare finalizată.</div>
                      </div>
                    )}

                    {/* Formular adăugare recenzie */}
                    {poateRecenza && (
                      <div style={{ background: c.surface, borderRadius: 18, border: `2px solid #FF6B00`, padding: "20px 22px", marginBottom: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: c.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Pencil size={14} color={c.text} strokeWidth={2} /> Lasă o recenzie</div>
                        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setRecenzieRating(s)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, transition: "opacity .1s" }}
                              aria-label={`${s} stele`}><Star size={28} color="#F59E0B" fill={s <= recenzieRating ? "#F59E0B" : "none"} strokeWidth={s <= recenzieRating ? 0 : 1.5} /></button>
                          ))}
                        </div>
                        <textarea
                          value={recenzieText}
                          onChange={e => setRecenzieText(e.target.value)}
                          placeholder="Cum a fost experiența ta? (minim 10 caractere)"
                          rows={3}
                          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontSize: 14, fontWeight: 600, fontFamily: "Nunito, sans-serif", outline: "none", resize: "vertical", marginBottom: 12 }}
                        />
                        {recenzieError && <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 10 }}>{recenzieError}</div>}
                        <button onClick={() => trimiteRecenzie(salonSelectat, programari.find(p => String(p.salon_id) === String(salonSelectat) && p.status === "finalizat")?.id || null)}
                          disabled={recenzieLoading}
                          style={{ ...btnPrimary, opacity: recenzieLoading ? .6 : 1, cursor: recenzieLoading ? "wait" : "pointer" }}>
                          {recenzieLoading ? "Se trimite..." : "Trimite recenzia"}
                        </button>
                      </div>
                    )}
                    {!userAScris && !areProgramareFinalizata && (
                      <div style={{ background: c.orangeAccent, borderRadius: 14, border: `1.5px solid ${c.orangeBorder}`, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: c.text2, fontWeight: 600 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Lightbulb size={14} color="#FF6B00" strokeWidth={2} /> Poți lăsa o recenzie după ce ai o programare finalizată la acest salon.</span>
                      </div>
                    )}
                    {userAScris && (
                      <div style={{ background: theme === "dark" ? "rgba(16,185,129,.12)" : "#ECFDF5", borderRadius: 14, border: "1.5px solid rgba(16,185,129,.3)", padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "#10B981", fontWeight: 700 }}>
                        ✓ Ai lăsat deja o recenzie pentru acest salon. Mulțumim!
                      </div>
                    )}

                    {/* Lista recenzii */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {recenziiSalon.map(r => (
                        <div key={r.id} style={{ background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, padding: "16px 18px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {r.avatar_url
                                ? <img src={r.avatar_url} alt={r.nume} style={{ width: 38, height: 38, borderRadius: 50, objectFit: "cover", flexShrink: 0 }} />
                                : <div style={{ width: 38, height: 38, borderRadius: 50, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: salon.culoare, flexShrink: 0 }}>{r.nume.charAt(0)}</div>
                              }
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{r.nume}{r.user_id === userId && <span style={{ fontSize: 11, color: "#FF6B00", fontWeight: 700 }}> · tu</span>}</div>
                                <div style={{ fontSize: 11, color: c.muted }}>{timpRelativ(r.created_at)}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 1 }}>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />)}</div>
                          </div>
                          <p style={{ fontSize: 13, color: c.text2, lineHeight: 1.65, margin: 0 }}>{r.text}</p>
                        </div>
                      ))}
                    </div>
                  </>)}
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
                          <div style={{ fontSize: 13, fontWeight: 700, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} color={c.muted} strokeWidth={2} /> {salon.adresa}, {salon.oras}</div>
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
                      <a href={`tel:${salon.telefon}`} style={{ fontSize: 16, fontWeight: 900, color: c.text, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}><Phone size={16} color={c.text} strokeWidth={2} /> {salon.telefon}</a>
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


          </div>
          {Lightbox}
        </Shell>
      </ThemeCtx.Provider>
    );
  }

  const viitoare = programari.filter(p => p.status === "confirmat" || p.status === "în așteptare");
  const trecute = programari.filter(p => p.status === "finalizat" || p.status === "anulat");

  const oraseleDisponibile = Array.from(new Set(saloaneList.map(s => s.oras.split(",")[0].trim()))).sort();

  const serviciiDisponibile = Array.from(new Set(saloaneList.flatMap(s => s.servicii))).sort();

  const filtrareActiva = cautare !== "" || filtruOras !== "" || filtruServiciu !== "" || sortareSalon !== "recomandat";
  const saloneFiltrate = saloaneList.filter(s => {
    if (cautare && !s.nume.toLowerCase().includes(cautare.toLowerCase()) && !s.oras.toLowerCase().includes(cautare.toLowerCase()) && !s.servicii.some(sv => sv.toLowerCase().includes(cautare.toLowerCase()))) return false;
    if (filtruOras && !s.oras.toLowerCase().includes(filtruOras.toLowerCase())) return false;
    if (filtruServiciu && !s.servicii.some(sv => sv.toLowerCase() === filtruServiciu.toLowerCase())) return false;
    return true;
  });

  if (sortareSalon === "rating") {
    saloneFiltrate.sort((a, b) => {
      const ra = ratinguriSaloane[String(a.id)]?.medie || 0;
      const rb = ratinguriSaloane[String(b.id)]?.medie || 0;
      if (rb !== ra) return rb - ra;
      const na = ratinguriSaloane[String(a.id)]?.nr || 0;
      const nb = ratinguriSaloane[String(b.id)]?.nr || 0;
      return nb - na;
    });
  } else if (sortareSalon === "alfabetic") {
    saloneFiltrate.sort((a, b) => a.nume.localeCompare(b.nume, "ro"));
  }

  return (
    <ThemeCtx.Provider value={{ theme, c, toggleTheme }}>
      <Shell prenume={prenume} tab={tab} onLogout={handleLogout} onNav={setTab} necitite={necitite} avatarUrl={avatarUrl}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

          {/* Toast */}
          {savedMsg && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1A1A1A", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>✓ {savedMsg}</div>}

          {/* Bun venit */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 900, color: c.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>Bună, {prenume}! {animal ? specieInfo(animal.specie).icon : <PawPrint size={24} color="#FF6B00" strokeWidth={2} />}</h1>
            {animal && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: c.surface, border: "2px solid #FF6B00", borderRadius: 50, padding: "8px 18px", fontSize: 13, flexWrap: "wrap" }}>
                {animal.poza_url
                  ? <img src={animal.poza_url} alt={animal.nume} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  : <span style={{ fontSize: 18 }}>{specieInfo(animal.specie).icon}</span>
                }
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
            {/* Search + city row — stil MERO */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "stretch" }}>
              {/* Search input */}
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: .55, display: "flex", alignItems: "center" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                <input
                  value={cautare}
                  onChange={e => { setCautare(e.target.value); setOrasDropdown(false); }}
                  placeholder="Caută serviciu, salon..."
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 36px 13px 42px", borderRadius: 50, border: `1.5px solid ${cautare ? "#FF6B00" : c.border}`, background: c.surface, color: c.text, fontSize: 14, fontWeight: 600, fontFamily: "Nunito, sans-serif", outline: "none" }}
                />
                {cautare && (
                  <button onClick={() => setCautare("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: c.muted, lineHeight: 1, padding: 4 }}>✕</button>
                )}
              </div>

              {/* City pill */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setOrasDropdown(v => !v)}
                  style={{ height: "100%", padding: "0 16px", borderRadius: 50, border: `1.5px solid ${filtruOras ? "#FF6B00" : c.border}`, background: filtruOras ? "#FFF3EA" : c.surface, color: filtruOras ? "#FF6B00" : c.muted, fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                >
                  <MapPin size={14} strokeWidth={2} />
                  <span>{filtruOras || "Oraș"}</span>
                  <span style={{ fontSize: 10, opacity: .6 }}>{orasDropdown ? "▲" : "▼"}</span>
                </button>
                {orasDropdown && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 16, boxShadow: c.shadow, zIndex: 50, minWidth: 240, maxHeight: 340, overflowY: "auto" }}>
                    {/* Câmp scriere oraș */}
                    <div style={{ padding: 10, borderBottom: `1px solid ${c.border2}`, position: "sticky", top: 0, background: c.surface, zIndex: 1 }}>
                      <input
                        autoFocus
                        value={orasInput}
                        onChange={e => setOrasInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && orasInput.trim()) { setFiltruOras(orasInput.trim()); setGeoError(""); setOrasInput(""); setOrasDropdown(false); } }}
                        placeholder="Alege orașul..."
                        style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontSize: 13, fontWeight: 600, fontFamily: "Nunito, sans-serif", outline: "none" }}
                      />
                    </div>
                    {/* Locația ta — GPS live (doar pe telefon) */}
                    {esteMobil && (
                      <button onClick={detecteazaLocatia} disabled={geoLoading} style={{ width: "100%", padding: "12px 18px", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${c.border2}`, color: "#FF6B00", fontSize: 13, fontWeight: 800, fontFamily: "Nunito, sans-serif", cursor: geoLoading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                        {geoLoading
                          ? <span style={{ fontSize: 15 }}>⏳</span>
                          : <svg width="17" height="17" viewBox="0 0 24 24" fill="#FF6B00" style={{ flexShrink: 0 }}><path d="M21.43 2.57a1 1 0 0 0-1.05-.23L3.4 8.78c-.9.34-.86 1.63.06 1.91l7.11 2.18 2.18 7.11c.28.92 1.57.96 1.91.06l6.44-16.98a1 1 0 0 0-.23-1.05z"/></svg>
                        }
                        {geoLoading ? "Se detectează..." : "Locația ta"}
                      </button>
                    )}
                    {esteMobil && geoError && (
                      <div style={{ padding: "8px 18px", fontSize: 11, fontWeight: 600, color: "#EF4444", background: theme === "dark" ? "rgba(239,68,68,.1)" : "#FEF2F2", borderBottom: `1px solid ${c.border2}` }}>{geoError}</div>
                    )}
                    {filtruOras && (
                      <button onClick={() => { setFiltruOras(""); setGeoError(""); setOrasInput(""); setOrasDropdown(false); }} style={{ width: "100%", padding: "12px 18px", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${c.border2}`, color: "#EF4444", fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif", cursor: "pointer" }}>
                        ✕ Toate orașele
                      </button>
                    )}
                    {oraseleDisponibile.filter(o => o.toLowerCase().includes(orasInput.toLowerCase().trim())).map(o => (
                      <button key={o} onClick={() => { setFiltruOras(o); setGeoError(""); setOrasInput(""); setOrasDropdown(false); }} style={{ width: "100%", padding: "12px 18px", textAlign: "left", background: filtruOras === o ? c.orangeAccent : "none", border: "none", borderBottom: `1px solid ${c.border2}`, color: filtruOras === o ? "#FF6B00" : c.text, fontSize: 13, fontWeight: filtruOras === o ? 800 : 600, fontFamily: "Nunito, sans-serif", cursor: "pointer" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><MapPin size={12} strokeWidth={2} /> {o}</span>
                      </button>
                    ))}
                    {orasInput.trim() && oraseleDisponibile.filter(o => o.toLowerCase().includes(orasInput.toLowerCase().trim())).length === 0 && (
                      <button onClick={() => { setFiltruOras(orasInput.trim()); setGeoError(""); setOrasInput(""); setOrasDropdown(false); }} style={{ width: "100%", padding: "12px 18px", textAlign: "left", background: "none", border: "none", color: c.text, fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif", cursor: "pointer" }}>
                        Caută „{orasInput.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sortare + filtru serviciu */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {/* Rând 1: sortare */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.muted }}>Sortare:</span>
                {[
                  { val: "recomandat", label: "Recomandate", icon: null as React.ReactNode },
                  { val: "rating", label: "Rating", icon: <Star size={12} color="currentColor" fill="currentColor" strokeWidth={0} /> },
                  { val: "alfabetic", label: "A–Z", icon: null as React.ReactNode },
                ].map(opt => (
                  <button key={opt.val} onClick={() => setSortareSalon(opt.val as any)}
                    style={{ padding: "7px 14px", borderRadius: 50, border: sortareSalon === opt.val ? "1.5px solid #FF6B00" : `1.5px solid ${c.border}`, background: sortareSalon === opt.val ? "#FFF3EA" : c.surface, color: sortareSalon === opt.val ? "#FF6B00" : c.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>
              {/* Rând 2: filtru serviciu */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.muted }}>Serviciu:</span>
                <div style={{ position: "relative" }}>
                  <button onClick={() => setFiltruServiciuDropdown(v => !v)}
                    style={{ padding: "7px 14px", borderRadius: 50, border: filtruServiciu ? "1.5px solid #FF6B00" : `1.5px solid ${c.border}`, background: filtruServiciu ? "#FFF3EA" : c.surface, color: filtruServiciu ? "#FF6B00" : c.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                    <Scissors size={14} strokeWidth={2} />
                    <span>{filtruServiciu || "Toate"}</span>
                    <span style={{ fontSize: 10, opacity: .6 }}>{filtruServiciuDropdown ? "▲" : "▼"}</span>
                  </button>
                {filtruServiciuDropdown && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 16, boxShadow: c.shadow, zIndex: 40, minWidth: 220, maxHeight: 320, overflowY: "auto" }}>
                    {filtruServiciu && (
                      <button onClick={() => { setFiltruServiciu(""); setFiltruServiciuDropdown(false); }}
                        style={{ width: "100%", padding: "12px 18px", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${c.border2}`, color: "#EF4444", fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif", cursor: "pointer" }}>
                        ✕ Toate serviciile
                      </button>
                    )}
                    {serviciiDisponibile.length === 0 && (
                      <div style={{ padding: "14px 18px", fontSize: 12, color: c.xmuted, textAlign: "center" }}>Niciun serviciu</div>
                    )}
                    {serviciiDisponibile.map(sv => (
                      <button key={sv} onClick={() => { setFiltruServiciu(sv); setFiltruServiciuDropdown(false); }}
                        style={{ width: "100%", padding: "12px 18px", textAlign: "left", background: filtruServiciu === sv ? c.orangeAccent : "none", border: "none", borderBottom: `1px solid ${c.border2}`, color: filtruServiciu === sv ? "#FF6B00" : c.text, fontSize: 13, fontWeight: filtruServiciu === sv ? 800 : 600, fontFamily: "Nunito, sans-serif", cursor: "pointer" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Scissors size={12} strokeWidth={2} /> {sv}</span>
                      </button>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>

            {filtrareActiva ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.muted, marginBottom: 14 }}>
                  {saloneFiltrate.length > 0 ? `${saloneFiltrate.length} salon${saloneFiltrate.length === 1 ? "" : "e"} găsite` : "Niciun salon găsit"}
                  {filtruOras && <span style={{ marginLeft: 8, color: "#FF6B00" }}>în {filtruOras}</span>}
                  {filtruServiciu && <span style={{ marginLeft: 8, color: "#FF6B00" }}>· {filtruServiciu}</span>}
                </div>
                {saloneFiltrate.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {saloneFiltrate.map(s => <CardSalon key={s.id} salon={s} ratingReal={ratinguriSaloane[String(s.id)]} onSelect={() => setSalonSelectat(s.id)} />)}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: c.text }}>Niciun salon găsit</div>
                    <div style={{ fontSize: 14, color: c.muted, marginBottom: 20 }}>Încearcă alte cuvinte cheie sau schimbă orașul</div>
                    <button onClick={() => { setCautare(""); setFiltruOras(""); }} style={{ padding: "10px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                      Arată toate
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: c.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><MapPin size={17} color="#FF6B00" strokeWidth={2} /> Recomandate</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 36 }}>
                  {saloaneList.slice(0, 2).map(s => <CardSalon key={s.id} salon={s} ratingReal={ratinguriSaloane[String(s.id)]} onSelect={() => setSalonSelectat(s.id)} />)}
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: c.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Scissors size={17} color="#FF6B00" strokeWidth={2} /> Toți partenerii CalyHub</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {saloaneList.map(s => <CardSalon key={s.id} salon={s} ratingReal={ratinguriSaloane[String(s.id)]} onSelect={() => setSalonSelectat(s.id)} />)}
                </div>
              </>
            )}
          </>)}

          {/* TAB PROGRAMARI */}
          {tab === "programari" && (
            <div>
              <PageHeader icon={Calendar} title="Programările mele" sub="Vezi programările viitoare și istoricul tău" />
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
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Calendar size={48} color="#FF6B00" strokeWidth={1.5} /></div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nicio programare încă</div>
                  <button onClick={() => setTab("saloane")} style={{ ...btnPrimary, marginTop: 8 }}>Caută salon acum</button>
                </div>
              )}
            </div>
          )}

          {/* TAB PROFIL */}
          {tab === "profil" && (
            <div style={{ maxWidth: 520 }}>
              <PageHeader icon={User} title="Profilul meu" sub="Actualizează datele tale de contact" />

              {/* AVATAR */}
              <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><ImageIcon size={14} color={c.text2} strokeWidth={2} /> Poza de profil</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ width: 96, height: 96, borderRadius: "50%", background: c.orangeAccent, border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={40} color="#FF6B00" strokeWidth={2} />}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <label style={{ cursor: "pointer" }}>
                      <div style={{ padding: "10px 18px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 13, fontWeight: 800, fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                        {uploadingAvatar ? "Se încarcă..." : avatarUrl ? <><Pencil size={13} strokeWidth={2} /> Schimbă</> : <><Upload size={13} strokeWidth={2} /> Încarcă</>}
                      </div>
                      <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingAvatar}
                        onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }} />
                    </label>
                    {avatarUrl && (
                      <button onClick={stergeAvatar}
                        style={{ padding: "10px 18px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                        <Trash2 size={13} strokeWidth={2} /> Șterge
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
              <PageHeader icon={PawPrint} title="Animalele mele" sub="Gestionează profilurile animăluților tăi" />

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
                              <div style={{ fontSize: 12, color: c.xmuted, marginTop: 3 }}>{a.greutate} kg · {a.varsta} ani · {a.alergii || "Fără alergii"} · {a.vaccinat ? <span style={{ color: "#10B981", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Shield size={11} color="#10B981" strokeWidth={2} /> Vaccinat</span> : <span style={{ color: "#EF4444", fontWeight: 700 }}>Nevaccinat</span>}</div>
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
                              }} style={{ fontSize: 12, fontWeight: 700, color: c.muted, background: c.surface2, border: `1.5px solid ${c.border}`, padding: "7px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}><Pencil size={12} strokeWidth={2} /> Editează</button>
                              <button onClick={async () => {
                                if (!confirm(`Sigur ștergi profilul lui ${a.nume}?`)) return;
                                await supabase.from("animale").delete().eq("id", a.id);
                                setAnimale(prev => prev.filter(x => x.id !== a.id));
                                if (selectedAnimalId === a.id) setSelectedAnimalId(null);
                                salveaza("Animal șters");
                              }} style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,.08)", border: "none", padding: "7px 10px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "inline-flex", alignItems: "center" }}><Trash2 size={13} strokeWidth={2} /></button>
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
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#FF6B00", marginBottom: 14 }}>Animal nou</div>
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
                <PageHeader icon={Bell} title="Notificări" sub="Activitate recentă a programărilor" />
                {notificari.filter(n => !n.citit).length > 0 && (
                  <button onClick={() => {
                    const snapshot = notificari;
                    setNotificari(n => n.map(x => ({ ...x, citit: true })));
                    supabase.from("notificari").update({ citit: true }).eq("user_id", userId).then(({ error }) => {
                      if (error) setNotificari(snapshot);
                    });
                  }} style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                    Marchează toate citite
                  </button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 24 }}>
                {notificari.length === 0 && (
                  <div style={{ padding: "28px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 16, border: `1.5px dashed ${c.border}` }}>
                    Nu ai notificări încă.
                  </div>
                )}
                {(() => {
                  const grupNotif: { data: string; items: Notificare[] }[] = [];
                  for (const n of notificari) {
                    const d = isoDataC(new Date(n.created_at));
                    let g = grupNotif.find(x => x.data === d);
                    if (!g) { g = { data: d, items: [] }; grupNotif.push(g); }
                    g.items.push(n);
                  }
                  return grupNotif.map(g => {
                    const et = etichetaZiC(g.data);
                    const necititeZi = g.items.filter(n => !n.citit).length;
                    return (
                      <div key={g.data}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                            {et.prefix && <span style={{ fontSize: 14, fontWeight: 900, color: et.azi ? "#FF6B00" : c.text }}>{et.prefix}</span>}
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: et.prefix ? c.muted : c.text }}>{et.rest}</span>
                          </div>
                          <div style={{ flex: 1, height: 1, background: c.border }} />
                          {necititeZi > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "#FF6B00", padding: "1px 8px", borderRadius: 50 }}>{necititeZi}</span>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {g.items.map(n => (
                            <div key={n.id} onClick={() => {
                              if (!n.citit) {
                                setNotificari(nots => nots.map(x => x.id === n.id ? { ...x, citit: true } : x));
                                supabase.from("notificari").update({ citit: true }).eq("id", n.id).then(({ error }) => {
                                  if (error) setNotificari(nots => nots.map(x => x.id === n.id ? { ...x, citit: false } : x));
                                });
                              }
                            }}
                              style={{ background: n.citit ? c.surface : c.orangeAccent, borderRadius: 14, padding: "14px 18px", border: n.citit ? `1.5px solid ${c.border}` : "2px solid #FF6B00", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
                              <div style={{ flexShrink: 0, marginTop: 2 }}>{n.tip === "confirmat" ? <CheckCircle2 size={20} color="#10B981" strokeWidth={2} /> : n.tip === "anulat" ? <XCircle size={20} color="#EF4444" strokeWidth={2} /> : <Bell size={20} color="#FF6B00" strokeWidth={2} />}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: n.citit ? 600 : 800, color: c.text, lineHeight: 1.5 }}>{n.mesaj.replace(/^\p{Emoji_Presentation}️?\s*/u, '')}</div>
                                <div style={{ fontSize: 12, color: c.xmuted, marginTop: 4 }}>{formatTimp(n.created_at)}</div>
                              </div>
                              {!n.citit && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 4 }} />}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 12 }}>Preferințe notificări</div>
              <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}`, display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { key: "sms", label: "SMS programări", sub: "Reminder cu 24h înainte de programare" },
                  { key: "newsletter", label: "Newsletter CalyHub", sub: "Oferte și noutăți de la saloane" },
                ].map((item, i) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: i < 1 ? `1px solid ${c.border2}` : "none" }}>
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
              <PageHeader icon={Settings} title="Setări cont" sub="Modifică parola contului tău" />
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
              <PageHeader icon={HelpCircle} title="Ajutor" sub="Răspunsuri la cele mai frecvente întrebări" />
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
              <div style={{ fontSize: 13, color: c.muted, marginBottom: 16 }}>{anulareModal.salon_nume} · {anulareModal.serviciu}<br /><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CalendarDays size={12} strokeWidth={2} /> {formatData(anulareModal.data)}</span> · <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={12} strokeWidth={2} /> {anulareModal.ora}</span></div>
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
function Shell({ children, prenume, tab, onLogout, onNav, necitite = 0, avatarUrl, onBack, backLabel }: { children: React.ReactNode; prenume: string; tab: Tab; onLogout: () => void; onNav: (t: Tab) => void; necitite?: number; avatarUrl?: string | null; onBack?: () => void; backLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Tab | "logout" | null>(null);
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

  const items: { icon: LucideIcon; label: string; sub: string; t: Tab }[] = [
    { icon: User, label: "Profilul meu", sub: "Nume, email, telefon", t: "profil" },
    { icon: PawPrint, label: "Animalele mele", sub: "Adaugă / editează profiluri", t: "animal" },
    { icon: Calendar, label: "Programările mele", sub: "Vezi toate programările", t: "programari" },
    { icon: Bell, label: "Notificări", sub: "Setări SMS / email", t: "notificari" },
    { icon: Settings, label: "Setări cont", sub: "Schimbă parola", t: "setari" },
    { icon: HelpCircle, label: "Ajutor", sub: "FAQ · Contact support", t: "ajutor" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: c.pageBg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: c.surface, borderBottom: `1px solid ${c.border}`, height: 64 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {/* On mobile with sub-tab or onBack active, hide logo and show back button instead */}
            {!(isMobile && (tab !== "saloane" || onBack)) && (
              <Image src="/logo.png" alt="CalyHub" width={110} height={38} style={{ height: 38, width: "auto", objectFit: "contain" }} priority />
            )}
            {(tab !== "saloane" || onBack) && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                {!isMobile && <div style={{ width: 1, height: 22, background: c.border }} />}
                <button onClick={() => { if (onBack) onBack(); else onNav("saloane"); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, fontSize: 13, fontWeight: 700, color: c.muted, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                  ← Înapoi
                </button>
                {!isMobile && (
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{backLabel || TAB_LABELS[tab]}</div>
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={() => onNav("notificari")} style={{ position: "relative", padding: isMobile ? "8px 10px" : "8px 14px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center" }}>
              <Bell size={18} color={c.muted} strokeWidth={2} />
              {necitite > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{necitite}</span>}
            </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, padding: isMobile ? "6px 10px 6px 6px" : "6px 14px 6px 8px", borderRadius: 50, border: open ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: open ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
              <span aria-hidden style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><PawPrint size={14} color="#FF6B00" strokeWidth={2} /></span>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, overflow: "hidden" }}>
                {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={15} color="#FF6B00" strokeWidth={2.2} />}
              </span>
              {!isMobile && <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{prenume}</span>}
              <span style={{ fontSize: 10, color: c.xmuted, display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>▼</span>
            </button>
            {open && (
              <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 262, background: c.surface, borderRadius: 18, border: `1.5px solid ${c.border}`, boxShadow: c.shadow, overflow: "hidden", zIndex: 200 }}>
                <div style={{ padding: "14px 18px", background: c.orangeAccent, borderBottom: `1px solid ${c.orangeBorder}` }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>{prenume}</div>
                  <div style={{ fontSize: 12, color: "#FF6B00", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>Cont client <PawPrint size={12} color="#FF6B00" strokeWidth={2} /></div>
                </div>
                <div style={{ padding: "6px 0" }}>
                  {items.map(item => {
                    const isActive = tab === item.t;
                    const isHovered = hovered === item.t;
                    return (
                    <button key={item.t} onClick={() => { onNav(item.t); setOpen(false); }}
                      onMouseEnter={() => setHovered(item.t)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: isActive ? c.orangeAccent : isHovered ? c.surface2 : "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", transition: "background .12s" }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: isActive ? "#FF6B00" : c.surface3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .12s" }}><item.icon size={18} color={isActive ? "#fff" : c.muted} strokeWidth={2} /></span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#FF6B00" : c.text }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: c.xmuted, marginTop: 1 }}>{item.sub}</div>
                      </div>
                    </button>
                    );
                  })}
                </div>
                <div style={{ borderTop: `1px solid ${c.border}`, padding: "12px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Aspect</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => toggleTheme("light")}
                      style={{ flex: 1, padding: "9px 8px", borderRadius: 10, border: theme === "light" ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: theme === "light" ? c.orangeAccent : c.surface2, color: theme === "light" ? "#FF6B00" : c.muted, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Sun size={15} strokeWidth={2.2} /> Luminos
                    </button>
                    <button onClick={() => toggleTheme("dark")}
                      style={{ flex: 1, padding: "9px 8px", borderRadius: 10, border: theme === "dark" ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: theme === "dark" ? c.orangeAccent : c.surface2, color: theme === "dark" ? "#FF6B00" : c.muted, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Moon size={15} strokeWidth={2.2} /> Întunecat
                    </button>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${c.border}`, padding: "6px 0" }}>
                  <button onClick={() => { setOpen(false); onLogout(); }}
                    onMouseEnter={() => setHovered("logout")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: hovered === "logout" ? "rgba(239,68,68,.08)" : "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", transition: "background .12s" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><LogOut size={17} color="#EF4444" strokeWidth={2} /></span>
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

function PageHeader({ icon: Icon, title, sub }: { icon: LucideIcon; title: string; sub: string }) {
  const { c } = useContext(ThemeCtx);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={24} color="#FF6B00" strokeWidth={2} /></div>
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

function RatingBadge({ ratingReal }: { ratingReal?: { medie: number; nr: number } }) {
  const { c } = useContext(ThemeCtx);
  if (!ratingReal || ratingReal.nr === 0) {
    return <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800, color: "#FF6B00" }}>Nou</div>;
  }
  return <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: c.text }}><Star size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={0} /> {ratingReal.medie.toFixed(1)}<span style={{ fontSize: 11, color: c.xmuted, fontWeight: 600 }}>({ratingReal.nr})</span></div>;
}

function CardSalon({ salon, onSelect, ratingReal }: { salon: SalonItem; onSelect: () => void; ratingReal?: { medie: number; nr: number } }) {
  const { c, theme } = useContext(ThemeCtx);
  return (
    <div style={{ background: c.surface, borderRadius: 20, border: "2px solid #FF6B00", overflow: "hidden", boxShadow: c.cardShadow, display: "flex", flexDirection: "column" }}>
      {/* Cover photo sau bara colorată */}
      {salon.poza_url ? (
        <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
          <img src={salon.poza_url} alt={salon.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.45) 100%)" }} />
          <span style={{ position: "absolute", bottom: 10, left: 12, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: "#fff", background: salon.culoare, padding: "4px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>{salon.badge}</span>
        </div>
      ) : (
        <div style={{ height: 4, background: salon.culoare }} />
      )}

      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {!salon.poza_url && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: salon.culoare, background: theme === "dark" ? `${salon.culoare}26` : salon.bg, padding: "4px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: 1 }}>{salon.badge}</span>
            <RatingBadge ratingReal={ratingReal} />
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontSize: 17, fontWeight: 900, color: c.text, marginBottom: 4 }}>{salon.nume}</div><div style={{ fontSize: 12, color: c.xmuted, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} color={c.xmuted} strokeWidth={2} /> {salon.oras}{salon.distanta ? ` · ${salon.distanta}` : ""}</div></div>
          {salon.poza_url && <RatingBadge ratingReal={ratingReal} />}
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
      <div style={{ width: 46, height: 46, borderRadius: 12, background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scissors size={20} color="#FF6B00" strokeWidth={2} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{p.salon_nume}</div>
        <div style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>{p.serviciu}</div>
        {p.groomer && <div style={{ fontSize: 12, color: c.muted, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}><User size={11} color={c.muted} strokeWidth={2} /> {p.groomer}</div>}
        <div style={{ fontSize: 12, color: c.xmuted, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}><CalendarDays size={11} strokeWidth={2} /> {formatData(p.data)} · <Clock size={11} strokeWidth={2} /> {p.ora}</div>
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
            : <span style={{ fontSize: 10.5, fontWeight: 700, color: c.xmuted, textAlign: "right", lineHeight: 1.3, display: "inline-flex", alignItems: "center", gap: 4 }}><Lock size={10} strokeWidth={2} /> Anulare blocată<br />(sub 12h)</span>
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
                : <PawPrint size={28} color="#FF6B00" strokeWidth={1.5} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ cursor: "pointer" }}>
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingPoza} onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  {uploadingPoza ? "Se încarcă..." : <><ImageIcon size={13} strokeWidth={2} /> {animalPoza ? "Schimbă poza" : "Adaugă poză"}</>}
                </span>
              </label>
              {animalPoza && (
                <button type="button" onClick={handlePhotoDelete} style={{ padding: "8px 16px", borderRadius: 50, border: "none", background: "rgba(239,68,68,.1)", color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Trash2 size={13} strokeWidth={2} /> Șterge poza</span>
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
          {[{ val: "mascul", label: "Mascul", icon: "♂" }, { val: "femela", label: "Femelă", icon: "♀" }].map(s => (
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
            { val: "mica", label: "Mică", desc: "sub 10 kg" },
            { val: "medie", label: "Medie", desc: "10–25 kg" },
            { val: "mare", label: "Mare", desc: "peste 25 kg" },
          ].map(t => (
            <button key={t.val} type="button" onClick={() => set("talie", t.val)}
              style={{ padding: "8px 4px", borderRadius: 10, border: form.talie === t.val ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: form.talie === t.val ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
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
            <Shield size={16} color={form.vaccinat ? "#10B981" : c.text2} strokeWidth={2} />
            <span style={{ fontSize: 13, fontWeight: 800, color: form.vaccinat ? "#10B981" : c.text2 }}>Vaccinat</span>
          </button>
          <button type="button" onClick={() => set("vaccinat", false)}
            style={{ padding: "10px 8px", borderRadius: 10, border: !form.vaccinat ? "2px solid #EF4444" : `1.5px solid ${c.border}`, background: !form.vaccinat ? "rgba(239,68,68,.08)" : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <XCircle size={16} color={!form.vaccinat ? "#EF4444" : c.text2} strokeWidth={2} />
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
