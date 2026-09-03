"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo, useContext, createContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import LogoSemn from "../../../components/LogoSemn";
import { supabase } from "../../../lib/supabase";
import { stareTrial, zileText, ZILE_AVERTISMENT, ZILE_TRIAL } from "../../../lib/trial";
import { numePlan, planuriPentru, pretPlan, limitePlan, REDUCERE_ANUALA, type PlanId, type Ciclu } from "../../../lib/planuri";
import { SPECIALIZARI, MAX_SPECIALIZARI } from "../../../lib/specializari";
import { verificaPoza, TEXT_REGULI_POZA } from "../../../lib/poze";
import SchimbaParola from "../../../components/SchimbaParola";
import Cropper from "react-easy-crop";
import { Store, Scissors, Users, PawPrint, CreditCard, Settings, HelpCircle, LogOut, Sun, Moon, User, Clock, BarChart3, CalendarDays, Bell, Star, MapPin, Phone, AlertTriangle, CheckCircle2, XCircle, Trash2, Pencil, Upload, Download, Lock, Lightbulb, FileEdit, Image as ImageIcon, Wallet, ZoomIn, ZoomOut, Sparkles, Send, Tag, ClipboardList, MessageSquare, RefreshCw, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

type StatusProg = "în așteptare" | "confirmat" | "finalizat" | "anulat" | "neprezentat";
type ProgramareSalon = {
  id: string;
  user_id: string;
  client: string;
  clientAvatar?: string | null;
  animal: string;
  animalNume?: string | null;
  rasa?: string | null;
  specie?: string | null;
  talie?: string | null;
  serviciu: string;
  ora: string;
  data: string;
  durata?: number | null;
  pret: number;
  groomer?: string | null;
  /** Identitatea specialistului. Numele de mai sus e doar eticheta afișată. */
  membruUid?: string | null;
  status: StatusProg;
  esteApp: boolean;
  /** „app" | „telefonic" | „walkin" | „blocaj" — pauzele nu intră în statistici. */
  sursa?: string | null;
  motivAnulare?: string | null;
  /** „client" | „salon" (a anulat una confirmată) | „salon_refuz" (a refuzat o cerere). */
  anulatDe?: string | null;
  /** Completat = salonul a mutat ora acestei programări. */
  mutatLa?: string | null;
  observatii?: string | null;
};

type Notificare = { id: string; tip: string; mesaj: string; citit: boolean; created_at: string; programare_id: string | null };
type ConsultantRaport = { continut: string; created_at: string };
type ConsultantQA = { q: string; a: string; created_at: string };

type VizitaIstoric = { id: string; serviciu: string; pret: number; data: string; ora: string; status: StatusProg };
type AnimalIstoric = {
  id: string; nume: string; specie: string; sex: string; rasa: string;
  greutate: number | null; talie: string | null; varsta: number | null;
  alergii: string; vaccinat: boolean; poza_url: string | null; stapanNume: string; stapanTelefon: string | null; stapanUserId: string | null;
  vizite: VizitaIstoric[]; totalCheltuit: number; ultimaVizita: string | null;
};

type DomeniuSalon = "infrumusetare" | "grooming";
/** Tot ce difera in dashboard intre cele doua verticale. */
const DOM_SALON: Record<DomeniuSalon, {
  rol: string; rolPlural: string; rolPluralCap: string;
  echipaSub: string; areAnimale: boolean;
  istoricTitlu: string; istoricSub: string; istoricMeniuSub: string;
  istoricCauta: string; istoricGol: string;
  fisaTitlu: string; fisaTitluScurt: string; fisaDesc: string; fisaPitch: string;
}> = {
  infrumusetare: {
    rol: "specialist", rolPlural: "specialiști", rolPluralCap: "Specialiști",
    echipaSub: "Gestionează specialiștii și orarul fiecăruia",
    areAnimale: false,
    istoricTitlu: "Istoric clienți",
    istoricSub: "Toate vizitele și încasările, client cu client",
    istoricMeniuSub: "Vizite și încasări per client",
    istoricCauta: "Caută după numele clientului…",
    istoricGol: "Niciun client în istoric încă.",
    fisaTitlu: "Recomandări după vizită",
    fisaTitluScurt: "Recomandări post-serviciu",
    fisaDesc: "Sfaturi de întreținere, pe serviciul efectuat",
    fisaPitch: "Oferă-le clienților sfaturi de întreținere potrivite serviciului făcut — cum păstrează culoarea, tunsoarea sau manichiura până la următoarea vizită.",
  },
  grooming: {
    rol: "groomer", rolPlural: "groomeri", rolPluralCap: "Groomeri",
    echipaSub: "Gestionează groomerii și orarul fiecăruia",
    areAnimale: true,
    istoricTitlu: "Istoric animale",
    istoricSub: "Fișa completă a fiecărui animal care a fost la salonul tău",
    istoricMeniuSub: "Fișa fiecărui animal programat",
    istoricCauta: "Caută după nume animal, stăpân sau rasă…",
    istoricGol: "Niciun animal în istoric încă.",
    fisaTitlu: "Fișă îngrijire post-grooming",
    fisaTitluScurt: "Fișă post-grooming",
    fisaDesc: "Sfaturi de îngrijire personalizate pe rasă",
    fisaPitch: "Oferă-le clienților sfaturi de îngrijire pe măsura rasei animalului — un plus de profesionalism care îi aduce înapoi.",
  },
};

type Tab = "agenda" | "statistici" | "program" | "notificari" | "functii-ai" | "profil-salon" | "servicii" | "echipa" | "animale" | "abonament" | "setari" | "ajutor";
type PreturiTalie = { mica: string; medie: string; mare: string };
/**
 * `sid` / `uid` — identitatea stabilă a unui serviciu, respectiv a unui membru.
 *
 * Până acum, tot ce lega lucrurile între ele era **numele scris**: serviciile
 * bifate la un specialist se potriveau după denumirea serviciului, iar
 * programarea reținea specialistul ca șir de caractere. Redenumeai un serviciu
 * și se rupea, în tăcere: specialistul dispărea de la serviciul acela în
 * dashboardul clientului, iar prețul lui personalizat se pierdea. Nimeni nu
 * afla de ce.
 *
 * Câmpul `id` de dedesubt e pozițional (indexul din listă), deci nu poate ține
 * loc de identitate: se schimbă la ștergerea altui rând.
 */
type Serviciu = { id: number; sid?: string; nume: string; pret: string; durata: string; preturi?: PreturiTalie; durate?: PreturiTalie };
type ServiciuOferit = { sid?: string; nume: string; preturi?: PreturiTalie; durate?: PreturiTalie };
/**
 * `activ: false` = user peste limita planului.
 *
 * Nu e ștergere: datele, istoricul și programările lui confirmate rămân
 * intacte, doar nu mai poate fi ales la rezervări noi. Dacă salonul urcă la
 * loc, revine exact cum era. Lipsa câmpului înseamnă activ — conturile de
 * dinaintea limitelor nu se dezactivează singure.
 */
type Groomer = { id: number; uid?: string; nume: string; specialitate: string; orar?: ProgramSaptamanal; servicii_oferite?: (string | ServiciuOferit)[]; activ?: boolean };
type ProgramZi = { activ: boolean; start: string; end: string };
type ProgramSaptamanal = Record<string, ProgramZi>;
type SlotProgramare = { id: string; ora: string; durata: number; status: string; sursa: string; serviciu: string; nume_client_extern: string | null; groomer: string | null };

const AZI = new Date();
const ZILE = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sam", "Dum"];
const ZILE_FULL = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const LUNA = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LUNA_FULL = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

/**
 * De la câte anulări târzii încoace îi propunem salonului să decidă dacă mai
 * primește clientul. „Târzie" = anulată cu mai puțin de 24 de ore înainte,
 * singurul caz în care clientul e obligat să scrie un motiv — de asta se
 * numără exact rândurile care au `motiv_anulare` completat.
 */
const ANULARI_PANA_LA_AVERTISMENT = 3;

/**
 * Ce se numără la încasări.
 *
 * Doar programările chiar încheiate. Înainte se numărau și cele `confirmat`,
 * adică vizite care nu se întâmplaseră încă — iar o programare la care
 * clientul nu venea devenea automat `finalizat` și intra tot acolo. Salonul
 * își vedea cifrele umflate și n-avea cum să le corecteze.
 */
const eIncasare = (status: string) => status === "finalizat";

/**
 * Pauzele nu sunt vizite.
 *
 * Când salonul blochează o oră pentru pauză, se salvează tot ca rând în
 * `programari` — altfel calendarul n-ar ști că e ocupat. Dar nu e nici client,
 * nici bani: n-are ce căuta în statistici sau în raportul Excel.
 */
const ePauza = (sursa?: string | null) => sursa === "blocaj";

/** Ce urmează: confirmat, dar încă neefectuat. Se arată separat de încasări. */
const eDeIncasat = (status: string) => status === "confirmat";

/**
 * Cerere refuzată de salon.
 *
 * În bază arată la fel ca o anulare — status `anulat` — dar înseamnă altceva:
 * n-a fost niciodată o programare, doar o cerere la care salonul a spus nu.
 * De asta nu intră la „anulate" în statistici: un salon plin care refuză 20 de
 * cereri nu are 20 de anulări, are 20 de ore ocupate.
 */
/** Starea programării, scurtă și colorată — pentru listele din statistici. */
const STARE_SCURT: Record<StatusProg, { text: string; culoare: string }> = {
  "în așteptare": { text: "în așteptare", culoare: "#F59E0B" },
  "confirmat": { text: "confirmată", culoare: "#3B82F6" },
  "finalizat": { text: "încheiată", culoare: "#10B981" },
  "anulat": { text: "anulată", culoare: "#EF4444" },
  "neprezentat": { text: "neprezentare", culoare: "#D97706" },
};

/**
 * Aceeași informație ca `etichetaAnulare`, dar la persoana a treia — pentru
 * listele din statistici, unde textul stă lângă alte stări, nu într-un card
 * care i se adresează salonului.
 */
function etichetaAnulareScurt(p: { anulatDe?: string | null; mutatLa?: string | null }) {
  if (p.anulatDe === "salon_refuz") return { text: "refuzată de tine", culoare: "#6B7280" };
  if (p.anulatDe === "salon") return { text: "anulată de tine", culoare: "#D97706" };
  if (p.mutatLa) return { text: "anulată după mutare", culoare: "#D97706" };
  return { text: "anulată de client", culoare: "#EF4444" };
}

const eRefuz = (p: { status: string; anulatDe?: string | null }) =>
  p.status === "anulat" && p.anulatDe === "salon_refuz";

/**
 * Cine a anulat, scris pe înțelesul salonului.
 *
 * Cazul cu `mutatLa` e cel care conta cel mai mult: dacă salonul a mutat ora și
 * clientului nu i-a convenit, anularea lui apărea drept „Clientul a anulat",
 * cu buton de blocare alături. Adică omul era pus în culpă pentru o schimbare
 * pe care a făcut-o salonul.
 */
function etichetaAnulare(p: { anulatDe?: string | null; mutatLa?: string | null }) {
  if (p.anulatDe === "salon_refuz") return { text: "Ai refuzat cererea", culoare: "#6B7280", vinaClientului: false };
  if (p.anulatDe === "salon") return { text: "Ai anulat programarea", culoare: "#D97706", vinaClientului: false };
  if (p.mutatLa) return { text: "Clientul a anulat după ce ai mutat ora", culoare: "#D97706", vinaClientului: false };
  return { text: "Clientul a anulat", culoare: "#EF4444", vinaClientului: true };
}

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

function gcdNum(a: number, b: number): number { return b === 0 ? a : gcdNum(b, a % b); }
function stepFromDurate(durate: number[]): number {
  const valid = durate.filter(d => d > 0).map(d => Math.round(d / 5) * 5).filter(d => d > 0);
  if (valid.length === 0) return STEP_SLOT;
  let g = valid[0];
  for (let i = 1; i < valid.length; i++) g = gcdNum(g, valid[i]);
  return Math.min(30, Math.max(5, g));
}

/** Identitate stabilă pentru servicii și membri. Scurtă, dar suficient de rară. */
function idStabil() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Serviciul bifat la un specialist, găsit **întâi după `sid`** și abia apoi
 * după nume. Ordinea contează: numele e doar eticheta, `sid` e identitatea.
 * Rândurile scrise înainte de `sid` n-au decât numele — de asta rămâne și
 * potrivirea veche, ca plasă.
 */
function gasesteOferit(lista: (string | ServiciuOferit)[] | undefined, sv: { sid?: string; nume: string }): number {
  if (!Array.isArray(lista)) return -1;
  if (sv.sid) {
    const i = lista.findIndex(o => typeof o !== "string" && o?.sid === sv.sid);
    if (i >= 0) return i;
  }
  return lista.findIndex(o => typeof o === "string" ? o === sv.nume : o?.nume === sv.nume);
}

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
function etichetaZi(dataIso: string) {
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  const maine = new Date(azi); maine.setDate(maine.getDate() + 1);
  const ieri = new Date(azi); ieri.setDate(ieri.getDate() - 1);
  const d = new Date(`${dataIso}T00:00:00`);
  const zi = ZILE_FULL[d.getDay()];
  const baza = `${zi}, ${d.getDate()} ${LUNA_FULL[d.getMonth()]}`;
  if (dataIso === isoData(azi)) return { prefix: "Azi", rest: baza, azi: true };
  if (dataIso === isoData(maine)) return { prefix: "Mâine", rest: baza, azi: false };
  if (dataIso === isoData(ieri)) return { prefix: "Ieri", rest: baza, azi: false };
  return { prefix: "", rest: baza, azi: false };
}
function specieIcon(specie?: string) {
  return specie === "pisica" ? "🐈" : specie === "iepure" ? "🐇" : specie === "pasare" ? "🐦" : specie === "rozator" ? "🐹" : specie === "reptila" ? "🦎" : specie === "altele" ? "🐾" : "🐕";
}
/** Speciile cu care poate lucra un salon de grooming (aceeași listă ca în wizard). */
const SPECII = [
  { val: "caine",   label: "Câine",     icon: "🐕" },
  { val: "pisica",  label: "Pisică",    icon: "🐈" },
  { val: "iepure",  label: "Iepure",    icon: "🐇" },
  { val: "pasare",  label: "Pasăre",    icon: "🐦" },
  { val: "rozator", label: "Rozătoare", icon: "🐹" },
  { val: "reptila", label: "Reptilă",   icon: "🦎" },
  { val: "altele",  label: "Altele",    icon: "🐾" },
];
type PerioadaStat = "azi" | "ieri" | "saptamana" | "luna" | "an" | "custom";
function intervalPerioada(per: PerioadaStat, cStart: string, cEnd: string): { start: string; end: string; label: string } {
  const now = new Date();
  const azi = isoData(now);
  if (per === "azi") return { start: azi, end: azi, label: "Azi" };
  if (per === "ieri") { const i = new Date(now); i.setDate(i.getDate() - 1); const iso = isoData(i); return { start: iso, end: iso, label: "Ieri" }; }
  if (per === "saptamana") { const s = new Date(now); s.setDate(s.getDate() - 6); return { start: isoData(s), end: azi, label: "Ultimele 7 zile" }; }
  if (per === "luna") { const s = new Date(now); s.setDate(s.getDate() - 29); return { start: isoData(s), end: azi, label: "Ultimele 30 zile" }; }
  if (per === "an") { const s = new Date(now); s.setFullYear(s.getFullYear() - 1); s.setDate(s.getDate() + 1); return { start: isoData(s), end: azi, label: "Ultimul an" }; }
  const a = cStart <= cEnd ? cStart : cEnd, b = cStart <= cEnd ? cEnd : cStart;
  return { start: a, end: b, label: `${a} → ${b}` };
}
function talieLabel(t?: string | null) {
  return t === "mica" ? "Mică" : t === "medie" ? "Medie" : t === "mare" ? "Mare" : null;
}
function areAlergii(s?: string | null) {
  if (!s) return false;
  const norm = s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const negative = ["", "fara", "fara alergii", "nu", "nu are", "niciuna", "niciun", "nimic", "n/a", "na", "-", "--", "no", "none", "0"];
  return !negative.includes(norm);
}
const ORE_OPTIUNI: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 30) out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  return out;
})();

/* ── Color palette ──
   Marginile sunt portocaliu deschis, nu gri — la fel ca în dashboardul
   clientului. Portocaliul plin rămâne rezervat pentru „asta e selectat".
   Ca să revenim: light → "#EBEBEB" / "#F3F4F6", dark → "#2A2A2A" / "#2A2A2A". */
const C = {
  light: {
    pageBg: "#FAFAFA", surface: "#ffffff", surface2: "#F9FAFB", surface3: "#F3F4F6",
    text: "#1A1A1A", text2: "#374151", muted: "#6B7280", xmuted: "#9CA3AF",
    border: "#FFD9BF", border2: "#FFE9D8", input: "#ffffff",
    orangeAccent: "#FFF3EA", orangeBorder: "#FFDCC6",
    shadow: "0 8px 32px rgba(0,0,0,.12)", cardShadow: "0 2px 12px rgba(0,0,0,.05)",
  },
  dark: {
    pageBg: "#0A0A0A", surface: "#161616", surface2: "#1F1F1F", surface3: "#262626",
    text: "#F5F5F5", text2: "#E5E7EB", muted: "#9CA3AF", xmuted: "#6B7280",
    border: "#4A3320", border2: "#3A2A1C", input: "#111111",
    orangeAccent: "rgba(255,107,0,0.13)", orangeBorder: "rgba(255,107,0,0.25)",
    shadow: "0 8px 32px rgba(0,0,0,.5)", cardShadow: "0 2px 12px rgba(0,0,0,.4)",
  },
};

type ColorSet = typeof C.light;
type ThemeCtxType = { theme: "light" | "dark"; c: ColorSet; toggleTheme: (t: "light" | "dark") => void };
const ThemeCtx = createContext<ThemeCtxType>({ theme: "light", c: C.light, toggleTheme: () => {} });

function randeazaInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={m.index} style={{ fontWeight: 900 }}>{m[1]}</strong>);
    else if (m[2]) parts.push(<em key={m.index}>{m[2]}</em>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

function RaportFormatat({ text, c, isMobile }: { text: string; c: ColorSet; isMobile: boolean }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t) {
      nodes.push(<div key={i} style={{ height: 6 }} />);
    } else if (t.startsWith("### ")) {
      nodes.push(
        <div key={i} style={{ fontSize: isMobile ? 12 : 12.5, fontWeight: 900, color: c.text2, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 14, marginBottom: 3 }}>
          {randeazaInline(t.slice(4))}
        </div>
      );
    } else if (t.startsWith("## ")) {
      nodes.push(
        <div key={i} style={{ fontSize: isMobile ? 13 : 14, fontWeight: 900, color: "#6366F1", marginTop: nodes.length > 0 ? 16 : 0, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 3, height: 14, background: "#6366F1", borderRadius: 2, flexShrink: 0, display: "inline-block" }} />
          {randeazaInline(t.slice(3))}
        </div>
      );
    } else if (t.startsWith("# ")) {
      nodes.push(
        <div key={i} style={{ fontSize: isMobile ? 14 : 15, fontWeight: 900, color: c.text, marginTop: nodes.length > 0 ? 16 : 0, marginBottom: 6 }}>
          {randeazaInline(t.slice(2))}
        </div>
      );
    } else if (/^[-*]\s/.test(t)) {
      nodes.push(
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4, paddingLeft: 2 }}>
          <span style={{ color: "#6366F1", fontWeight: 900, fontSize: 16, lineHeight: "1.45", flexShrink: 0, marginTop: -1 }}>•</span>
          <span style={{ fontSize: isMobile ? 12.5 : 13, color: c.text, lineHeight: 1.6 }}>{randeazaInline(t.slice(2))}</span>
        </div>
      );
    } else {
      const numM = t.match(/^(\d+)\.\s(.+)/);
      if (numM) {
        nodes.push(
          <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4, paddingLeft: 2 }}>
            <span style={{ color: "#6366F1", fontWeight: 900, fontSize: 12, lineHeight: "1.6", flexShrink: 0, minWidth: 18 }}>{numM[1]}.</span>
            <span style={{ fontSize: isMobile ? 12.5 : 13, color: c.text, lineHeight: 1.6 }}>{randeazaInline(numM[2])}</span>
          </div>
        );
      } else {
        nodes.push(
          <div key={i} style={{ fontSize: isMobile ? 12.5 : 13, color: c.text, lineHeight: 1.65, marginBottom: 1 }}>
            {randeazaInline(t)}
          </div>
        );
      }
    }
  });
  return <>{nodes}</>;
}

const btnPrimary: React.CSSProperties = { padding: "12px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 16px rgba(255,107,0,.35)" };

/* ───────────────────────── Agenda — calendar pe zi ───────────────────────── */
function AgendaCalendar({
  programari, echipa, program, agendaZi, setAgendaZi, filtruTalie, setFiltruTalie, areAnimale,
  accepta, respinge, clientiBlocati, abateriMap, neprezentariMap, marcheazaPrezenta, toggleBlocClient, highlightProgramare, onHighlightConsumat, c, theme,
  servicii, anuleazaDeSalon, mutaProgramare, corecteazaProgramare,
}: {
  programari: ProgramareSalon[];
  echipa: Groomer[];
  program: ProgramSaptamanal;
  agendaZi: string;
  setAgendaZi: (s: string) => void;
  filtruTalie: "toate" | "mica" | "medie" | "mare";
  setFiltruTalie: (v: "toate" | "mica" | "medie" | "mare") => void;
  areAnimale: boolean;
  accepta: (id: string) => void;
  respinge: (id: string, motiv?: string) => void;
  clientiBlocati: string[];
  abateriMap: Record<string, number>;
  neprezentariMap: Record<string, number>;
  marcheazaPrezenta: (id: string, aVenit: boolean) => void;
  toggleBlocClient: (userId: string) => void;
  highlightProgramare?: string | null;
  onHighlightConsumat?: () => void;
  c: ColorSet;
  theme: "light" | "dark";
  servicii: Serviciu[];
  anuleazaDeSalon: (id: string, motiv: string) => Promise<boolean>;
  mutaProgramare: (id: string, data: string, ora: string, groomer: string | null) => Promise<boolean>;
  corecteazaProgramare: (id: string, patch: { serviciu: string; pret: number; durata: number }) => Promise<boolean>;
}) {
  const PX_PER_MIN = 1.4;
  const HEADER_H = 56;
  const GUTTER_W = 50;
  const [colSel, setColSel] = useState<string>("");
  /** Cererea pentru care s-a deschis panoul de refuz, plus motivul scris. */
  const [refuzId, setRefuzId] = useState<string | null>(null);
  const [motivRefuz, setMotivRefuz] = useState("");

  /*
   * Gestionarea unei programări confirmate.
   *
   * Până acum, dreptunghiul verde din calendar era inert: salonul nu putea
   * anula, muta sau corecta nimic. Dacă specialistul se îmbolnăvea, ora rămânea
   * ocupată la nesfârșit, clientul o vedea în cont, iar la final era numărată
   * ca vizită încheiată — deci intra la încasări.
   *
   * ⚠️ Toate hook-urile de mai jos stau ÎNAINTE de orice `return`. Un hook pus
   * după un return timpuriu strică ordinea și React cade cu eroarea #300.
   */
  const [gestionat, setGestionat] = useState<string | null>(null);
  const [mod, setMod] = useState<"meniu" | "anulare" | "mutare" | "corectie">("meniu");
  const [motivAnul, setMotivAnul] = useState("");
  const [mutData, setMutData] = useState("");
  const [mutOra, setMutOra] = useState("");
  const [mutGroomer, setMutGroomer] = useState("");
  const [corServiciu, setCorServiciu] = useState("");
  const [corPret, setCorPret] = useState("");
  const [corDurata, setCorDurata] = useState("");
  const [lucru, setLucru] = useState(false);
  const [eroareMod, setEroareMod] = useState("");

  const gest = gestionat ? programari.find(p => p.id === gestionat) || null : null;

  function deschideGestiune(p: ProgramareSalon) {
    setGestionat(p.id);
    setMod("meniu");
    setMotivAnul(""); setEroareMod(""); setLucru(false);
    setMutData(p.data); setMutOra(p.ora); setMutGroomer(p.groomer || "");
    setCorServiciu(p.serviciu); setCorPret(String(p.pret || "")); setCorDurata(String(p.durata || 60));
  }
  function inchideGestiune() { setGestionat(null); setLucru(false); }

  // Orele disponibile în ziua aleasă pentru mutare, după programul salonului.
  const zilaMutare = mutData ? program[String(new Date(`${mutData}T00:00:00`).getDay())] : null;
  const sloturiMutare = zilaMutare?.activ ? genereazaSloturiZi(zilaMutare) : [];

  // Suprapunerea nu blochează salvarea — unele saloane suprapun intenționat.
  // O arătăm ca avertisment, ca alegerea să fie conștientă.
  const conflictMutare = (() => {
    if (!gest || !mutData || !mutOra) return null;
    const durata = gest.durata || 60;
    return programari.find(p =>
      p.id !== gest.id &&
      p.data === mutData &&
      (p.status === "confirmat" || p.status === "în așteptare") &&
      (!mutGroomer || !p.groomer || p.groomer === mutGroomer) &&
      suprapunere(mutOra, durata, { ora: p.ora, durata: p.durata ?? 60 })
    ) || null;
  })();

  const aziIso = isoData(new Date());
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Săptămâna care conține agendaZi (Luni → Duminică)
  const selDate = new Date(agendaZi + "T00:00:00");
  const dowSelMon = (selDate.getDay() + 6) % 7; // 0 = Luni
  const monday = new Date(selDate); monday.setDate(selDate.getDate() - dowSelMon);
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });

  const countByDay: Record<string, number> = {};
  for (const p of programari) if (p.status !== "anulat") countByDay[p.data] = (countByDay[p.data] || 0) + 1;

  // Programările zilei selectate (filtrate pe talie)
  const apptsZi = programari
    .filter(p => p.data === agendaZi)
    .filter(p => filtruTalie === "toate" ? true : p.talie === filtruTalie);

  // Coloane: una per specialist din echipă; programările fără groomer ajung într-o coloană separată
  type Col = { key: string; nume: string; specialitate?: string; uid?: string; appts: ProgramareSalon[] };
  /*
   * Coloanele: userii activi, plus cei inactivi care au totuși programări în
   * ziua asta. Un user scos peste limita planului nu mai primește rezervări
   * noi, dar programările lui deja confirmate se desfășoară normal — ar fi
   * greșit să dispară din calendar cu o zi înainte.
   */
  const cuProgramari = new Set<string>();
  for (const p of apptsZi) { if (p.membruUid) cuProgramari.add(p.membruUid); if (p.groomer) cuProgramari.add(p.groomer); }
  const cols: Col[] = echipa
    .filter(g => g.activ !== false || cuProgramari.has(g.nume) || (g.uid ? cuProgramari.has(g.uid) : false))
    .map(g => ({ key: g.nume, nume: g.nume, specialitate: g.specialitate, uid: g.uid, appts: [] }));
  const fallbackAppts: ProgramareSalon[] = [];
  // Cererile refuzate nu apar în grilă: ora n-a fost niciodată ocupată de ele.
  // Rămân în lista de anulări de sub calendar, marcate „Ai refuzat cererea".
  for (const p of apptsZi) {
    if (eRefuz(p)) continue;
    // Întâi după identitate, apoi după nume — programările de dinaintea
    // `membru_uid` au doar numele scris pe ele.
    const col = (p.membruUid ? cols.find(x => x.uid === p.membruUid) : null)
      || (p.groomer ? cols.find(x => x.key === p.groomer) : null);
    if (col) col.appts.push(p); else fallbackAppts.push(p);
  }
  if (fallbackAppts.length > 0 || cols.length === 0) {
    cols.push({ key: "__none__", nume: echipa.length === 0 ? "Salon" : "Fără specialist", appts: fallbackAppts });
  }
  // La click pe notificarea „programare nouă": selectează coloana programării evidențiate
  useEffect(() => {
    if (!highlightProgramare) return;
    const prog = apptsZi.find(p => p.id === highlightProgramare);
    if (prog) {
      const colKey = prog.groomer && cols.some(x => x.key === prog.groomer) ? prog.groomer : "__none__";
      setColSel(colKey);
    }
    const t = setTimeout(() => onHighlightConsumat?.(), 4000);
    return () => clearTimeout(t);
  }, [highlightProgramare]);

  // Specialistul afișat (un singur calendar pe ecran — fără scroll orizontal)
  const activeCol = cols.find(x => x.key === colSel) || cols[0];
  const activeLanes = activeCol ? withLanes(activeCol.appts) : { info: [], laneCount: 1 };

  // Fereastra de timp a zilei (din programul salonului, extinsă să cuprindă toate programările)
  const progZi = program[String(selDate.getDay())];
  let startMin = progZi?.activ ? timeToMin(progZi.start) : 9 * 60;
  let endMin = progZi?.activ ? timeToMin(progZi.end) : 18 * 60;
  for (const p of apptsZi) {
    if (eRefuz(p)) continue;
    startMin = Math.min(startMin, timeToMin(p.ora));
    endMin = Math.max(endMin, timeToMin(p.ora) + (p.durata || 60));
  }
  startMin = Math.floor(startMin / 60) * 60;
  endMin = Math.ceil(endMin / 60) * 60;
  if (endMin <= startMin) endMin = startMin + 60;
  // +18px spațiu jos ca ultima oră și capătul tabelului să nu fie tăiate de overflow:hidden
  const bodyH = (endMin - startMin) * PX_PER_MIN + 18;
  const hours: number[] = [];
  for (let m = startMin; m <= endMin; m += 60) hours.push(m);

  // Distribuire pe „benzi" pentru programări care se suprapun în aceeași coloană
  function withLanes(appts: ProgramareSalon[]) {
    const sorted = [...appts].sort((a, b) => timeToMin(a.ora) - timeToMin(b.ora));
    const laneEnds: number[] = [];
    const info = sorted.map(p => {
      const s = timeToMin(p.ora), e = s + (p.durata || 60);
      let lane = laneEnds.findIndex(end => end <= s);
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(e); } else laneEnds[lane] = e;
      return { p, s, e, lane };
    });
    return { info, laneCount: Math.max(1, laneEnds.length) };
  }

  const et = etichetaZi(agendaZi);
  const total = apptsZi.length;
  /*
   * Cererile în așteptare — TOATE, nu doar cele din ziua deschisă în calendar.
   *
   * Erau filtrate pe `agendaZi`, deci o rezervare pentru marțea viitoare nu se
   * vedea nicăieri cât timp salonul stătea pe ziua de azi: primea notificarea
   * și nu găsea nimic de apăsat. O cerere nouă n-are voie să stea ascunsă în
   * spatele unei date — se pierde o programare.
   */
  const pending = programari
    .filter(p => p.status === "în așteptare")
    .sort((a, b) => (a.data === b.data ? (a.ora < b.ora ? -1 : 1) : (a.data < b.data ? -1 : 1)));
  const anulate = apptsZi.filter(p => p.status === "anulat").sort((a, b) => a.ora < b.ora ? -1 : 1);

  /**
   * Vizitele zilei a căror oră a trecut. Aplicația le-a marcat deja
   * „finalizat" automat — aici salonul le poate corecta pe cele la care
   * clientul n-a venit. Se arată doar pentru zile care nu sunt în viitor,
   * și doar la programările venite din aplicație (cele adăugate manual la
   * telefon nu au client care să lipsească).
   */
  const deVerificat = apptsZi
    .filter(p => (p.status === "finalizat" || p.status === "neprezentat") && p.esteApp)
    .filter(p => agendaZi < aziIso || (agendaZi === aziIso && (Number(p.ora.slice(0, 2)) * 60 + Number(p.ora.slice(3, 5))) <= nowMin))
    .sort((a, b) => a.ora < b.ora ? -1 : 1);

  const navBtn: React.CSSProperties = { width: 34, height: 34, flexShrink: 0, borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text, fontSize: 18, fontWeight: 900, cursor: "pointer", fontFamily: "Nunito, sans-serif", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: c.text, display: "flex", alignItems: "center", gap: 8 }}><CalendarDays size={20} color="#FF6B00" strokeWidth={2} /> Agenda</h2>
        <div style={{ fontSize: 13, color: c.xmuted, fontWeight: 600 }}>{total} {total === 1 ? "programare" : "programări"}</div>
      </div>

      {/* Selector săptămână */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <button onClick={() => { const d = new Date(monday); d.setDate(monday.getDate() - 7); setAgendaZi(isoData(d)); }} style={navBtn} aria-label="Săptămâna anterioară">‹</button>
        <div style={{ display: "flex", gap: 5, flex: 1 }}>
          {weekDays.map(d => {
            const iso = isoData(d);
            const sel = iso === agendaZi;
            const esteAzi = iso === aziIso;
            const cnt = countByDay[iso] || 0;
            return (
              <button key={iso} onClick={() => setAgendaZi(iso)}
                style={{ flex: 1, padding: "7px 2px", borderRadius: 12, border: sel ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: sel ? "#FF6B00" : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "center", position: "relative", minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: sel ? "rgba(255,255,255,.85)" : c.muted }}>{ZILE[(d.getDay() + 6) % 7]}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: sel ? "#fff" : esteAzi ? "#FF6B00" : c.text, marginTop: 1 }}>{d.getDate()}</div>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: cnt > 0 ? (sel ? "#fff" : "#FF6B00") : "transparent", margin: "2px auto 0" }} />
              </button>
            );
          })}
        </div>
        <button onClick={() => { const d = new Date(monday); d.setDate(monday.getDate() + 7); setAgendaZi(isoData(d)); }} style={navBtn} aria-label="Săptămâna următoare">›</button>
      </div>

      {/* Filtru talie — are sens doar la saloanele care lucreaza cu animale */}
      {areAnimale && (
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {[{ val: "toate", label: "Toate" }, { val: "mica", label: "Mică" }, { val: "medie", label: "Medie" }, { val: "mare", label: "Mare" }].map(t => (
          <button key={t.val} onClick={() => setFiltruTalie(t.val as any)}
            style={{ padding: "6px 13px", borderRadius: 50, border: filtruTalie === t.val ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: filtruTalie === t.val ? c.orangeAccent : c.surface, color: filtruTalie === t.val ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>
      )}

      {/* CERERI NOI — deasupra calendarului, prima chestie vizibilă */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", display: "inline-block", boxShadow: "0 0 0 3px rgba(255,107,0,.2)" }} />
            <span style={{ fontSize: 13, fontWeight: 900, color: c.text, letterSpacing: 0.3 }}>Cereri noi</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#FF6B00", background: c.orangeAccent, padding: "1px 9px", borderRadius: 50 }}>{pending.length}</span>
          </div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: -4 }}>
            Toate cererile care așteaptă răspuns, indiferent de ziua deschisă în calendar.
          </div>
          {pending.map(p => {
            const blocat = p.esteApp && !!p.user_id && clientiBlocati.includes(p.user_id);
            const abateri = p.esteApp && p.user_id ? (abateriMap[p.user_id] || 0) : 0;
            return (
              <div key={p.id} style={{ background: c.surface, borderRadius: 16, overflow: "hidden", border: `1.5px solid ${theme === "dark" ? "rgba(255,107,0,.35)" : "rgba(255,107,0,.25)"}`, boxShadow: theme === "dark" ? "0 2px 12px rgba(0,0,0,.25)" : "0 2px 12px rgba(255,107,0,.08)" }}>
                {/* Accent bar top */}
                <div style={{ height: 3, background: "linear-gradient(90deg, #FF6B00 0%, #FF9F4A 100%)" }} />
                <div style={{ padding: "14px 16px 16px" }}>
                  {/* Row 1 — client name + time pill */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 900, color: c.text, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        {p.client}
                        {blocat && <span style={{ fontSize: 10.5, fontWeight: 800, color: "#EF4444", background: "rgba(239,68,68,.12)", padding: "2px 8px", borderRadius: 50, display: "inline-flex", alignItems: "center", gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} /> Blocat</span>}
                        {abateri > 0 && (() => {
                          const greu = abateri >= ANULARI_PANA_LA_AVERTISMENT;
                          const cul = greu ? "#EF4444" : "#D97706";
                          return (
                            <span title={greu ? "Poți bloca acest client din lista de anulări" : undefined}
                              style={{ fontSize: 10.5, fontWeight: 800, color: cul, background: greu ? "rgba(239,68,68,.12)" : "rgba(217,119,6,.12)", padding: "2px 8px", borderRadius: 50, display: "inline-flex", alignItems: "center", gap: 3 }}>
                              <AlertTriangle size={10} color={cul} strokeWidth={2} /> {abateri} {abateri === 1 ? "anulare târzie" : "anulări târzii"}
                            </span>
                          );
                        })()}
                      </div>
                      {p.groomer && (
                        <div style={{ fontSize: 12, color: c.muted, fontWeight: 600, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                          <User size={11} color={c.muted} strokeWidth={2} /> {p.groomer}
                        </div>
                      )}
                    </div>
                    {/* Ziua e scrisă pe card fiindcă lista nu mai e legată de
                        ziua deschisă în calendar. Clic pe ea duce agenda acolo. */}
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <div style={{ background: "#FF6B00", color: "#fff", fontSize: 13, fontWeight: 900, padding: "5px 13px", borderRadius: 50, letterSpacing: 0.3, boxShadow: "0 3px 8px rgba(255,107,0,.35)" }}>{p.ora}</div>
                      {(() => {
                        const e = etichetaZi(p.data);
                        return (
                          <button onClick={() => setAgendaZi(p.data)}
                            title="Vezi ziua în calendar"
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "Nunito, sans-serif", fontSize: 11.5, fontWeight: 800, color: e.azi ? "#FF6B00" : c.muted, whiteSpace: "nowrap" }}>
                            {e.prefix || e.rest}
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: c.border2, marginBottom: 10 }} />

                  {/* Row 2 — animal + service */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {areAnimale && p.animal && p.animal !== "—" && (
                      <div style={{ fontSize: 12.5, color: c.text2, display: "flex", alignItems: "center", gap: 6 }}>
                        <PawPrint size={13} color={c.muted} strokeWidth={2} />
                        <span style={{ fontWeight: 700, color: c.text }}>{p.animal}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Scissors size={13} color="#FF6B00" strokeWidth={2} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: c.text }}>{p.serviciu}</span>
                      {p.pret > 0 && <span style={{ fontSize: 12, fontWeight: 800, color: "#FF6B00", background: c.orangeAccent, padding: "1px 9px", borderRadius: 50, marginLeft: 2 }}>{p.pret} RON</span>}
                      {p.durata && <span style={{ fontSize: 11.5, color: c.muted, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} color={c.muted} strokeWidth={2} /> {p.durata} min</span>}
                    </div>
                  </div>

                  {/* Observations */}
                  {p.observatii && (
                    <div style={{ fontSize: 12, color: c.text2, background: theme === "dark" ? "rgba(255,193,7,.10)" : "#FFFBEB", border: `1px solid ${theme === "dark" ? "rgba(255,193,7,.3)" : "#FDE68A"}`, borderRadius: 10, padding: "8px 12px", lineHeight: 1.55, marginBottom: 12 }}>
                      <span style={{ fontWeight: 800, color: "#B45309", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 2 }}><FileEdit size={11} color="#B45309" strokeWidth={2} /> Observații</span>
                      <div style={{ marginTop: 2 }}>{p.observatii}</div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {refuzId === p.id ? (
                    /* Panoul de refuz. Motivul e opțional — de aceea butonul de
                       trimitere merge și cu câmpul gol, iar scurtăturile sunt
                       acolo ca să coste un clic, nu o compunere. */
                    <div style={{ borderTop: `1px solid ${c.border2}`, paddingTop: 12 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: c.text2, marginBottom: 8 }}>
                        De ce refuzi? <span style={{ fontWeight: 600, color: c.muted }}>(opțional)</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>
                        {[
                          "Nu mai am loc la ora asta",
                          "Specialistul nu e disponibil",
                          ...(areAnimale ? ["Nu lucrez cu specia asta"] : []),
                        ].map(m => (
                          <button key={m} onClick={() => setMotivRefuz(m)}
                            style={{ padding: "6px 12px", borderRadius: 50, border: `1.5px solid ${motivRefuz === m ? "#FF6B00" : c.border}`, background: motivRefuz === m ? c.orangeAccent : "transparent", color: motivRefuz === m ? "#FF6B00" : c.text2, fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                            {m}
                          </button>
                        ))}
                      </div>
                      <input value={motivRefuz} onChange={e => setMotivRefuz(e.target.value)}
                        placeholder="Sau scrie tu"
                        style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.surface2, color: c.text, fontSize: 13, fontFamily: "Nunito, sans-serif", boxSizing: "border-box", marginBottom: 10 }} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setRefuzId(null); setMotivRefuz(""); }}
                          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${c.border}`, background: "transparent", color: c.text2, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                          Renunț
                        </button>
                        <button onClick={() => { respinge(p.id, motivRefuz); setRefuzId(null); setMotivRefuz(""); }}
                          style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                          {motivRefuz.trim() ? "Refuză și trimite motivul" : "Refuză fără motiv"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setRefuzId(p.id); setMotivRefuz(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${theme === "dark" ? "rgba(239,68,68,.4)" : "rgba(239,68,68,.3)"}`, background: theme === "dark" ? "rgba(239,68,68,.08)" : "rgba(239,68,68,.05)", color: "#EF4444", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <XCircle size={15} color="#EF4444" strokeWidth={2} /> Refuză
                      </button>
                      <button onClick={() => accepta(p.id)} style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #FF6B00 0%, #FF9F4A 100%)", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>
                        <CheckCircle2 size={15} color="#fff" strokeWidth={2} /> Acceptă programarea
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Eticheta zilei */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        {et.prefix && <span style={{ fontSize: 15, fontWeight: 900, color: et.azi ? "#FF6B00" : c.text }}>{et.prefix}</span>}
        <span style={{ fontSize: 14, fontWeight: 700, color: et.prefix ? c.muted : c.text }}>{et.rest}</span>
      </div>

      {total === 0 && progZi && !progZi.activ && (
        <div style={{ padding: "14px 18px", textAlign: "center", color: c.muted, fontSize: 13.5, fontWeight: 600, background: c.surface, borderRadius: 12, border: `1.5px dashed ${c.border}`, marginBottom: 14 }}>
          Salonul este închis în această zi.
        </div>
      )}

      {/* Selector specialist — un singur calendar pe ecran, fără scroll orizontal */}
      {cols.length > 1 && (
        <div style={{ display: "flex", gap: 7, marginBottom: 12, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
          {cols.map(col => {
            const sel = activeCol?.key === col.key;
            return (
              <button key={col.key} onClick={() => setColSel(col.key)}
                style={{ flexShrink: 0, padding: "9px 16px", borderRadius: 50, border: sel ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: sel ? "#FF6B00" : c.surface, color: sel ? "#fff" : c.text2, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{col.key === "__none__" ? <Users size={14} color="currentColor" strokeWidth={2} /> : <Scissors size={14} color="currentColor" strokeWidth={2} />} {col.nume}</span>
                {col.appts.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 900, color: sel ? "#fff" : "#FF6B00", background: sel ? "rgba(255,255,255,.25)" : c.orangeAccent, borderRadius: 50, padding: "1px 7px", minWidth: 18, textAlign: "center" }}>{col.appts.length}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar — gutter ore + coloana specialistului selectat (umple ecranul, zero scroll orizontal) */}
      {activeCol && (
        <div style={{ border: `1.5px solid ${c.border}`, borderRadius: 16, background: c.surface, display: "flex", overflow: "hidden" }}>
          {/* Gutter ore */}
          <div style={{ flexShrink: 0, width: GUTTER_W, borderRight: `1px solid ${c.border}`, background: c.surface }}>
            <div style={{ height: HEADER_H, borderBottom: `1px solid ${c.border}` }} />
            <div style={{ position: "relative", height: bodyH }}>
              {hours.map(m => (
                <div key={m} style={{ position: "absolute", top: (m - startMin) * PX_PER_MIN, left: 0, right: 0, transform: "translateY(-50%)", textAlign: "center", fontSize: 11, fontWeight: 700, color: c.xmuted }}>{minToTime(m)}</div>
              ))}
            </div>
          </div>

          {/* Coloana specialistului selectat */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: HEADER_H, borderBottom: `1px solid ${c.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 10px", gap: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", display: "flex", alignItems: "center", gap: 5 }}>{activeCol.key !== "__none__" && <Scissors size={14} color={c.text} strokeWidth={2} />}{activeCol.nume}</div>
              {activeCol.specialitate && <div style={{ fontSize: 11, fontWeight: 600, color: c.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{activeCol.specialitate}</div>}
            </div>
            <div style={{ position: "relative", height: bodyH }}>
              {hours.map(m => (
                <div key={m} style={{ position: "absolute", top: (m - startMin) * PX_PER_MIN, left: 0, right: 0, height: 1, background: c.border2 }} />
              ))}
              {agendaZi === aziIso && nowMin >= startMin && nowMin <= endMin && (
                <div style={{ position: "absolute", top: (nowMin - startMin) * PX_PER_MIN, left: 0, right: 0, height: 2, background: "#FF6B00", zIndex: 4 }}>
                  <div style={{ position: "absolute", left: -3, top: -3, width: 8, height: 8, borderRadius: "50%", background: "#FF6B00" }} />
                </div>
              )}
              {activeLanes.info.length === 0 && (
                <div style={{ position: "absolute", top: 16, left: 0, right: 0, textAlign: "center", fontSize: 12.5, color: c.xmuted, fontWeight: 600 }}>Nicio programare</div>
              )}
              {activeLanes.info.map(({ p, s, e, lane }) => {
                const nou = p.status === "în așteptare";
                const anulat = p.status === "anulat";
                const trecut = (agendaZi < aziIso) || (agendaZi === aziIso && e <= nowMin);
                const top = (s - startMin) * PX_PER_MIN;
                const h = Math.max(24, (e - s) * PX_PER_MIN);
                const w = `calc(${100 / activeLanes.laneCount}% - 6px)`;
                const left = `calc(${(lane * 100) / activeLanes.laneCount}% + 3px)`;
                let bg = c.surface2, border = c.border, accent = c.muted, bar = c.muted;
                if (anulat) { bg = theme === "dark" ? "rgba(239,68,68,.14)" : "#FEE2E2"; border = "rgba(239,68,68,.5)"; accent = "#EF4444"; bar = "#EF4444"; }
                else if (nou) { bg = theme === "dark" ? "rgba(255,107,0,.18)" : "#FFE8D6"; border = "#FF6B00"; accent = "#C2410C"; bar = "#FF6B00"; }
                else if (p.status === "confirmat") { bg = theme === "dark" ? "rgba(16,185,129,.20)" : "#C7F2DE"; border = "#10B981"; accent = "#047857"; bar = "#10B981"; }
                const compact = h < 44;
                const evidentiat = highlightProgramare === p.id;
                // Programările confirmate se pot gestiona. Pauzele și orele
                // blocate se scot din tabul Program, nu de aici.
                const gestionabil = p.status === "confirmat" && p.sursa !== "blocaj";
                return (
                  <div key={p.id}
                    title={gestionabil ? `${p.ora}–${minToTime(e)} · ${p.client} · ${p.serviciu} — apasă pentru a muta sau anula` : `${p.ora}–${minToTime(e)} · ${p.client} · ${p.serviciu}`}
                    onClick={gestionabil ? () => deschideGestiune(p) : undefined}
                    role={gestionabil ? "button" : undefined}
                    tabIndex={gestionabil ? 0 : undefined}
                    onKeyDown={gestionabil ? (ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); deschideGestiune(p); } }) : undefined}
                    style={{ position: "absolute", top, left, width: w, height: h, borderRadius: 10, background: bg, border: `${nou || evidentiat ? 2 : 1.5}px solid ${evidentiat ? "#FF6B00" : border}`, borderLeft: `5px solid ${bar}`, padding: compact ? "0 8px 0 10px" : "5px 10px 5px 11px", overflow: "hidden", opacity: trecut && !nou ? 0.55 : 1, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, lineHeight: 1.15, boxShadow: evidentiat ? "0 0 0 4px rgba(255,107,0,.35)" : "none", transition: "box-shadow .2s", cursor: gestionabil ? "pointer" : "default" }}>
                    <div style={{ fontSize: compact ? 11 : 11.5, fontWeight: 800, color: accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ flexShrink: 0 }}>{p.ora}–{minToTime(e)}</span>
                      {p.observatii ? <FileEdit size={10} color={accent} strokeWidth={2} style={{ flexShrink: 0 }} /> : null}
                      {compact && <span style={{ fontWeight: 800, color: anulat ? c.muted : c.text, textDecoration: anulat ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>· {p.client}</span>}
                    </div>
                    {!compact && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: anulat ? c.muted : c.text, textDecoration: anulat ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1, minWidth: 0 }}>{p.client}</span>
                        <span style={{ fontSize: 11, color: c.muted, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0 }}><Scissors size={10} color={c.muted} strokeWidth={2} />{p.serviciu}{p.pret > 0 ? ` · ${p.pret} RON` : ""}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Vizitele încheiate — aici se marchează neprezentările */}
      {deVerificat.length > 0 && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>Vizite încheiate ({deVerificat.length})</div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: -4 }}>
            Le trecem automat ca încheiate când ora a trecut. Dacă cineva n-a venit, spune-ne — iese din încasări.
          </div>
          {deVerificat.map(p => {
            const neprezentat = p.status === "neprezentat";
            const nrNeprez = p.user_id ? (neprezentariMap[p.user_id] || 0) : 0;
            const blocat = !!p.user_id && clientiBlocati.includes(p.user_id);
            return (
              <div key={p.id} style={{ background: neprezentat ? (theme === "dark" ? "rgba(217,119,6,.08)" : "#FFFBEB") : c.surface, borderRadius: 14, padding: "12px 16px", border: `1.5px solid ${neprezentat ? "rgba(217,119,6,.4)" : c.border}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ width: 46, height: 46, borderRadius: 11, background: neprezentat ? "rgba(217,119,6,.12)" : c.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: neprezentat ? "#D97706" : c.muted, flexShrink: 0 }}>{p.ora}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: c.text }}>{p.client}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                    <Scissors size={12} color={c.muted} strokeWidth={2} /> {p.serviciu}{p.pret > 0 ? ` · ${p.pret} RON` : ""}
                  </div>
                  {neprezentat && (
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#D97706", marginTop: 5 }}>
                      Nu s-a prezentat — nu intră la încasări
                      {nrNeprez > 1 ? ` · ${nrNeprez} neprezentări în total` : ""}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  {neprezentat ? (
                    <>
                      <button onClick={() => marcheazaPrezenta(p.id, true)}
                        style={{ padding: "7px 13px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: "transparent", color: c.text2, fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                        Totuși a venit
                      </button>
                      {/* De la prima neprezentare salonul poate decide. Nu așteptăm un prag. */}
                      {p.user_id && (
                        <button onClick={() => toggleBlocClient(p.user_id)}
                          style={{ padding: "7px 13px", borderRadius: 50, border: `1.5px solid ${blocat ? "#10B981" : "#EF4444"}`, background: "transparent", color: blocat ? "#10B981" : "#EF4444", fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                          {blocat ? "✓ Deblochează" : "Blochează"}
                        </button>
                      )}
                    </>
                  ) : (
                    <button onClick={() => marcheazaPrezenta(p.id, false)}
                      style={{ padding: "7px 13px", borderRadius: 50, border: "1.5px solid rgba(217,119,6,.5)", background: "transparent", color: "#D97706", fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                      Nu s-a prezentat
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Anulări — sub calendar.
          Titlul spunea „Anulări de la client" și lista conținea de-a valma
          anulările clientului, refuzurile salonului și (de la punctul 13)
          anulările făcute de salon. Trei lucruri diferite sub o etichetă care
          le punea pe toate în cârca clientului. Acum fiecare card spune cine. */}
      {anulate.length > 0 && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>
            Anulări — {et.prefix ? `${et.prefix.toLowerCase()}, ` : ""}{et.rest.toLowerCase()} ({anulate.length})
          </div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: -4 }}>
            Doar din ziua deschisă în calendar. Schimbă ziua ca să vezi altele.
          </div>
          {anulate.map(p => {
            const blocat = p.esteApp && !!p.user_id && clientiBlocati.includes(p.user_id);
            const et = etichetaAnulare(p);
            const deLaClient = et.vinaClientului;
            return (
              <div key={p.id} style={{ background: deLaClient ? (theme === "dark" ? "rgba(239,68,68,.07)" : "#FEF2F2") : c.surface, borderRadius: 14, padding: "12px 16px", border: `1.5px solid ${deLaClient ? "rgba(239,68,68,.35)" : c.border}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ width: 46, height: 46, borderRadius: 11, background: deLaClient ? "rgba(239,68,68,.12)" : c.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: deLaClient ? "#EF4444" : c.muted, flexShrink: 0 }}>{p.ora}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: c.muted, textDecoration: "line-through" }}>{p.client}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Scissors size={12} color={c.muted} strokeWidth={2} /> {p.serviciu}
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: et.culoare, background: `${et.culoare}1F`, padding: "2px 9px", borderRadius: 50 }}>{et.text}</span>
                  </div>
                  {p.motivAnulare && <div style={{ fontSize: 12, color: c.muted, marginTop: 6, borderLeft: `3px solid ${et.culoare}80`, paddingLeft: 8, fontWeight: 600 }}>Motiv: <span style={{ fontWeight: 700 }}>{p.motivAnulare}</span></div>}
                </div>
                {/* Blocarea se oferă doar când clientul a renunțat de capul lui.
                    La refuzurile și anulările proprii — și la anulările care vin
                    după o mutare făcută de salon — n-are ce căuta: n-a greșit
                    nimeni. */}
                {deLaClient && p.esteApp && p.user_id && (() => {
                  const nrAnulari = abateriMap[p.user_id] || 0;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                      {!blocat && nrAnulari >= ANULARI_PANA_LA_AVERTISMENT && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#EF4444" }}>
                          Are {nrAnulari} anulări târzii
                        </span>
                      )}
                      <button onClick={() => toggleBlocClient(p.user_id)} style={{ padding: "7px 13px", borderRadius: 50, border: `1.5px solid ${blocat ? "#10B981" : "#EF4444"}`, background: "transparent", color: blocat ? "#10B981" : "#EF4444", fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                        {blocat ? "✓ Deblochează" : "Blochează"}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Gestionarea unei programări confirmate ── */}
      {gest && (() => {
        const btnBaza: React.CSSProperties = { padding: "11px 16px", borderRadius: 12, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", border: `1.5px solid ${c.border}`, background: c.surface2, color: c.text, textAlign: "left", display: "flex", alignItems: "center", gap: 10, width: "100%" };
        const camp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${c.border}`, background: c.surface2, color: c.text, fontSize: 14, fontFamily: "Nunito, sans-serif", boxSizing: "border-box" };
        const eticheta: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 800, color: c.text2, marginBottom: 6 };
        const etGest = etichetaZi(gest.data);

        async function ruleaza(fn: () => Promise<boolean>) {
          setLucru(true);
          const ok = await fn();
          setLucru(false);
          if (ok) inchideGestiune();
        }

        return (
          <div onClick={inchideGestiune}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: c.surface, borderRadius: 20, border: `1.5px solid ${c.border}`, padding: "22px 24px", width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>

              {/* Antetul — cine, când, ce */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: c.text }}>{gest.client}</div>
                <div style={{ fontSize: 13, color: c.muted, fontWeight: 600, marginTop: 3 }}>
                  {etGest.prefix ? `${etGest.prefix}, ` : ""}{etGest.rest} · ora {gest.ora}
                </div>
                <div style={{ fontSize: 13, color: c.muted, fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                  <Scissors size={12} color={c.muted} strokeWidth={2} /> {gest.serviciu}
                  {gest.pret > 0 && <span style={{ fontWeight: 800, color: "#FF6B00" }}>· {gest.pret} RON</span>}
                  {gest.groomer && <span>· {gest.groomer}</span>}
                </div>
                {!gest.esteApp && (
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: c.muted, marginTop: 8, background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 50, padding: "3px 10px", display: "inline-block" }}>
                    fără cont — clientul nu primește notificare
                  </div>
                )}
              </div>

              {mod === "meniu" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <button onClick={() => setMod("mutare")} style={btnBaza}>
                    <Clock size={16} color="#FF6B00" strokeWidth={2.2} />
                    <span><span style={{ display: "block" }}>Mută programarea</span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: c.muted }}>altă zi, altă oră sau alt specialist</span></span>
                  </button>
                  <button onClick={() => setMod("corectie")} style={btnBaza}>
                    <FileEdit size={16} color="#FF6B00" strokeWidth={2.2} />
                    <span><span style={{ display: "block" }}>Corectează serviciul sau prețul</span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: c.muted }}>pentru greșeli de scriere</span></span>
                  </button>
                  <button onClick={() => setMod("anulare")} style={{ ...btnBaza, border: "1.5px solid rgba(239,68,68,.4)", background: theme === "dark" ? "rgba(239,68,68,.08)" : "#FEF2F2", color: "#EF4444" }}>
                    <XCircle size={16} color="#EF4444" strokeWidth={2.2} />
                    <span><span style={{ display: "block" }}>Anulează programarea</span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: c.muted }}>ora se eliberează, clientul e anunțat</span></span>
                  </button>
                  <button onClick={inchideGestiune} style={{ ...btnBaza, justifyContent: "center", background: "transparent", border: "none", color: c.muted, fontWeight: 700 }}>Închide</button>
                </div>
              )}

              {mod === "mutare" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={eticheta}>Ziua</label>
                    <input type="date" value={mutData} min={isoData(new Date())} style={camp}
                      onChange={e => { setMutData(e.target.value); setMutOra(""); }} />
                  </div>
                  <div>
                    <label style={eticheta}>Ora</label>
                    {zilaMutare?.activ ? (
                      <select value={mutOra} style={camp} onChange={e => setMutOra(e.target.value)}>
                        <option value="">Alege ora</option>
                        {sloturiMutare.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <div style={{ ...camp, color: "#EF4444", fontWeight: 700 }}>Salonul e închis în ziua asta</div>
                    )}
                  </div>
                  {echipa.length > 0 && (
                    <div>
                      <label style={eticheta}>Specialist</label>
                      <select value={mutGroomer} style={camp} onChange={e => setMutGroomer(e.target.value)}>
                        <option value="">Fără specialist anume</option>
                        {echipa.filter(g => g.activ !== false).map(g => <option key={g.nume} value={g.nume}>{g.nume}</option>)}
                      </select>
                    </div>
                  )}
                  {conflictMutare && (
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#D97706", background: theme === "dark" ? "rgba(217,119,6,.10)" : "#FFFBEB", border: "1.5px solid rgba(217,119,6,.4)", borderRadius: 12, padding: "10px 14px", lineHeight: 1.5 }}>
                      Ora se suprapune cu {conflictMutare.client} ({conflictMutare.ora}). Poți salva oricum, dacă așa vrei.
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.55 }}>
                    Ora nouă e definitivă. Clientul primește o notificare și, dacă nu îi convine,
                    poate anula din contul lui fără să scrie niciun motiv.
                  </div>
                  {eroareMod && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#EF4444" }}>{eroareMod}</div>}
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => setMod("meniu")} style={{ ...btnBaza, width: "auto", justifyContent: "center", flex: 1 }}>Înapoi</button>
                    <button disabled={lucru || !mutOra || !mutData}
                      onClick={() => {
                        if (!mutOra) { setEroareMod("Alege o oră."); return; }
                        ruleaza(() => mutaProgramare(gest.id, mutData, mutOra, mutGroomer || null));
                      }}
                      style={{ ...btnBaza, width: "auto", flex: 2, justifyContent: "center", border: "none", background: "#FF6B00", color: "#fff", opacity: lucru || !mutOra ? .55 : 1 }}>
                      {lucru ? "Se mută..." : "Mută programarea"}
                    </button>
                  </div>
                </div>
              )}

              {mod === "corectie" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={eticheta}>Serviciul</label>
                    <select value={servicii.some(s => s.nume === corServiciu) ? corServiciu : ""} style={camp}
                      onChange={e => {
                        const s = servicii.find(x => x.nume === e.target.value);
                        setCorServiciu(e.target.value);
                        if (!s) return;
                        // La grooming prețul depinde de talie; o luăm de pe programare.
                        const t = (gest.talie || "medie") as keyof PreturiTalie;
                        const pret = s.preturi ? s.preturi[t] : s.pret;
                        const dur = s.durate ? s.durate[t] : s.durata;
                        if (pret) setCorPret(String(pret));
                        if (dur) setCorDurata(String(dur));
                      }}>
                      <option value="">{corServiciu && !servicii.some(s => s.nume === corServiciu) ? corServiciu : "Alege serviciul"}</option>
                      {servicii.map(s => <option key={s.id} value={s.nume}>{s.nume}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={eticheta}>Preț (RON)</label>
                      <input type="number" min={0} value={corPret} style={camp} onChange={e => setCorPret(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={eticheta}>Durata (min)</label>
                      <input type="number" min={5} step={5} value={corDurata} style={camp} onChange={e => setCorDurata(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.55 }}>
                    Clientul e anunțat doar dacă se schimbă prețul — acolo e vorba de banii lui.
                  </div>
                  {eroareMod && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#EF4444" }}>{eroareMod}</div>}
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => setMod("meniu")} style={{ ...btnBaza, width: "auto", justifyContent: "center", flex: 1 }}>Înapoi</button>
                    <button disabled={lucru}
                      onClick={() => {
                        const nume = corServiciu.trim();
                        if (!nume) { setEroareMod("Alege serviciul."); return; }
                        const dur = Number(corDurata) || 60;
                        if (dur < 5) { setEroareMod("Durata trebuie să fie de cel puțin 5 minute."); return; }
                        ruleaza(() => corecteazaProgramare(gest.id, { serviciu: nume, pret: Number(corPret) || 0, durata: dur }));
                      }}
                      style={{ ...btnBaza, width: "auto", flex: 2, justifyContent: "center", border: "none", background: "#FF6B00", color: "#fff", opacity: lucru ? .55 : 1 }}>
                      {lucru ? "Se salvează..." : "Salvează"}
                    </button>
                  </div>
                </div>
              )}

              {mod === "anulare" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={eticheta}>De ce anulezi?</label>
                    <textarea value={motivAnul} onChange={e => { setMotivAnul(e.target.value); setEroareMod(""); }}
                      rows={3} placeholder="Ex: specialistul e bolnav, salonul e închis în ziua aceea"
                      style={{ ...camp, resize: "vertical", lineHeight: 1.5 }} />
                    <div style={{ fontSize: 12, color: c.muted, marginTop: 7, lineHeight: 1.55 }}>
                      Motivul ajunge la client, în notificare. Îl cerem întotdeauna, nu doar la anulările
                      de ultim moment: omul își face alt plan sau își ia liber, deci merită să știe de ce.
                    </div>
                  </div>
                  {eroareMod && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#EF4444" }}>{eroareMod}</div>}
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => setMod("meniu")} style={{ ...btnBaza, width: "auto", justifyContent: "center", flex: 1 }}>Înapoi</button>
                    <button disabled={lucru}
                      onClick={() => {
                        if (motivAnul.trim().length < 5) { setEroareMod("Scrie un motiv de cel puțin 5 caractere."); return; }
                        ruleaza(() => anuleazaDeSalon(gest.id, motivAnul));
                      }}
                      style={{ ...btnBaza, width: "auto", flex: 2, justifyContent: "center", border: "none", background: "#EF4444", color: "#fff", opacity: lucru ? .55 : 1 }}>
                      {lucru ? "Se anulează..." : "Anulează programarea"}
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

// ===== CONSULTANT AI — funcții pure =====

const LUNI_RO = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
const ZILE_SAPTAMANA = ["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"];

function computeSnapshot(
  programari: ProgramareSalon[],
  recenzii: { rating: number; created_at: string }[],
  salonNume: string
) {
  const now = new Date();
  const an = now.getFullYear();
  const lunaIdx = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoLunaAc = `${an}-${pad(lunaIdx + 1)}`;
  const prevIdx = lunaIdx === 0 ? 11 : lunaIdx - 1;
  const prevAn = lunaIdx === 0 ? an - 1 : an;
  const isoLunaAnt = `${prevAn}-${pad(prevIdx + 1)}`;

  // Pauzele nu sunt vizite — nu au ce căuta în datele pe care le analizează
  // consultantul, altfel îi dă sfaturi pornind de la ore libere.
  const fin = programari.filter(p => p.status === "finalizat" && p.sursa !== "blocaj");
  const lunaAc = fin.filter(p => p.data.startsWith(isoLunaAc));
  const lunaAnt = fin.filter(p => p.data.startsWith(isoLunaAnt));
  const venAc = lunaAc.reduce((s, p) => s + p.pret, 0);
  const venAnt = lunaAnt.reduce((s, p) => s + p.pret, 0);

  const bySrv: Record<string, { count: number; venit: number }> = {};
  for (const p of lunaAc) {
    if (!p.serviciu) continue;
    if (!bySrv[p.serviciu]) bySrv[p.serviciu] = { count: 0, venit: 0 };
    bySrv[p.serviciu].count++;
    bySrv[p.serviciu].venit += p.pret;
  }
  const topServicii = Object.entries(bySrv)
    .map(([nume, v]) => ({ nume, count: v.count, venit: v.venit }))
    .sort((a, b) => b.venit - a.venit)
    .slice(0, 3);

  const byDow: Record<number, number> = {};
  for (const p of fin) {
    const dow = new Date(p.data + "T12:00:00").getDay();
    byDow[dow] = (byDow[dow] || 0) + 1;
  }
  const weeks = Math.max(1, new Set(fin.map(p => {
    const d = new Date(p.data + "T12:00:00");
    const s = new Date(d); s.setDate(d.getDate() - d.getDay());
    return s.toISOString().slice(0, 10);
  })).size);
  const ziSaptamana = Object.entries(byDow)
    .filter(([dow]) => Number(dow) !== 0)
    .map(([dow, cnt]) => ({ zi: ZILE_SAPTAMANA[Number(dow)], medie: Math.round((cnt / weeks) * 10) / 10 }))
    .sort((a, b) => b.medie - a.medie);

  const byGroomer: Record<string, { count: number; venit: number }> = {};
  for (const p of lunaAc) {
    const g = p.groomer || "Neatribuit";
    if (!byGroomer[g]) byGroomer[g] = { count: 0, venit: 0 };
    byGroomer[g].count++;
    byGroomer[g].venit += p.pret;
  }
  const groomeri = Object.entries(byGroomer)
    .map(([nume, v]) => ({ nume, count: v.count, venit: v.venit }))
    .sort((a, b) => b.venit - a.venit);

  const lastVisit: Record<string, string> = {};
  for (const p of fin) {
    if (!p.user_id) continue;
    if (!lastVisit[p.user_id] || p.data > lastVisit[p.user_id]) lastVisit[p.user_id] = p.data;
  }
  const clientiInactivi = Object.values(lastVisit).filter(d =>
    Math.floor((now.getTime() - new Date(d + "T12:00:00").getTime()) / 86400000) > 45
  ).length;

  const recLuna = recenzii.filter(r => r.created_at.slice(0, 7) === isoLunaAc);
  const ratingMediu = recLuna.length > 0
    ? Math.round(recLuna.reduce((s, r) => s + r.rating, 0) / recLuna.length * 10) / 10
    : null;

  return {
    salonNume,
    luna: `${LUNI_RO[lunaIdx]} ${an}`,
    programari: {
      lunaCurenta: lunaAc.length,
      lunaAnterioara: lunaAnt.length,
      variatieProc: lunaAnt.length > 0 ? Math.round(((lunaAc.length - lunaAnt.length) / lunaAnt.length) * 100) : 0,
    },
    incasari: {
      lunaCurenta: venAc,
      lunaAnterioara: venAnt,
      variatieProc: venAnt > 0 ? Math.round(((venAc - venAnt) / venAnt) * 100) : 0,
      // Vizite încheiate fără preț completat — de obicei cele de la telefon.
      // Consultantul trebuie să știe că suma e incompletă, ca să nu tragă
      // concluzii despre o scădere de venit care nu s-a întâmplat.
      faraPret: lunaAc.filter(p => !p.pret || p.pret <= 0).length,
    },
    topServicii,
    ziSaptamana,
    groomeri,
    clientiInactivi,
    ratingMediu,
    numarRecenzii: recLuna.length,
    totalRecenzii: recenzii.length,
  };
}

function computeSugestii(snapshot: ReturnType<typeof computeSnapshot>): { icon: LucideIcon; text: string; intrebare: string }[] {
  const sugestii: { icon: LucideIcon; text: string; intrebare: string }[] = [];

  const ziActive = snapshot.ziSaptamana.filter(z => z.medie > 0);
  if (ziActive.length >= 2) {
    const buna = ziActive[0];
    const slaba = ziActive[ziActive.length - 1];
    const proc = buna.medie > 0 ? Math.round((slaba.medie / buna.medie) * 100) : 0;
    if (proc < 45) {
      sugestii.push({
        icon: CalendarDays,
        text: `${slaba.zi} are ${proc}% din ocuparea de ${buna.zi} — cum umpli agenda?`,
        intrebare: `${slaba.zi} are o medie de ${slaba.medie} programari, fata de ${buna.medie} ${buna.zi}. Ce pot face concret sa cresc ocuparea in ziua ${slaba.zi}?`,
      });
    }
  }

  if (snapshot.clientiInactivi >= 3) {
    sugestii.push({
      icon: Users,
      text: `${snapshot.clientiInactivi} clienti fideli nu au revenit in 45+ zile`,
      intrebare: `Am ${snapshot.clientiInactivi} clienti cu vizite repetate care nu au mai revenit in 45+ zile. Ce strategie de reactivare recomanzi pentru un salon de grooming?`,
    });
  }

  if (snapshot.incasari.variatieProc < -10 && snapshot.incasari.lunaAnterioara > 0) {
    sugestii.push({
      icon: TrendingDown,
      text: `Incasarile au scazut cu ${Math.abs(snapshot.incasari.variatieProc)}% fata de luna trecuta`,
      intrebare: `Incasarile mele au scazut cu ${Math.abs(snapshot.incasari.variatieProc)}% fata de luna anterioara (${snapshot.incasari.lunaAnterioara} RON -> ${snapshot.incasari.lunaCurenta} RON). Care sunt cauzele probabile si ce pot face?`,
    });
  }

  if (snapshot.incasari.variatieProc > 15 && snapshot.incasari.lunaAnterioara > 0) {
    sugestii.push({
      icon: TrendingUp,
      text: `Crestere de ${snapshot.incasari.variatieProc}% fata de luna trecuta — cum consolidez?`,
      intrebare: `Salonul meu a crescut cu ${snapshot.incasari.variatieProc}% la incasari fata de luna trecuta. Ce pot face pentru a mentine si consolida aceasta crestere?`,
    });
  }

  if (snapshot.topServicii.length > 0 && snapshot.programari.lunaCurenta > 0) {
    const total = snapshot.topServicii.reduce((s, v) => s + v.count, 0);
    const top = snapshot.topServicii[0];
    const proc = total > 0 ? Math.round((top.count / total) * 100) : 0;
    if (proc > 55) {
      sugestii.push({
        icon: Scissors,
        text: `"${top.nume}" domina cu ${proc}% din programari — ma specializez sau diversific?`,
        intrebare: `Serviciul "${top.nume}" reprezinta ${proc}% din toate programarile mele luna aceasta. Ar trebui sa ma specializez mai mult sau sa diversific oferta?`,
      });
    }
  }

  return sugestii.slice(0, 3);
}

export default function DashboardSalon() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [salonData, setSalonData] = useState<any>(null);
  const [ratingSalon, setRatingSalon] = useState<{ medie: number; nr: number }>({ medie: 0, nr: 0 });
  const [recenziiSalon, setRecenziiSalon] = useState<{ id: string; user_id: string; programare_id: string | null; rating: number; text: string; created_at: string; nume: string; avatar_url: string | null; raspuns_salon: string | null; raspuns_at: string | null; animal: { nume: string; rasa: string | null } | null }[]>([]);
  const [filtruRecenzii, setFiltruRecenzii] = useState<"toate" | "azi" | "ieri" | "trecut">("toate");
  const [raspunsAiState, setRaspunsAiState] = useState<Record<string, { editare: boolean; draft: string; generand: boolean; trimitand: boolean; eroare: string | null }>>({});
  const [perioadaStat, setPerioadaStat] = useState<PerioadaStat>("azi");
  const [customStart, setCustomStart] = useState<string>(isoData(new Date()));
  const [customEnd, setCustomEnd] = useState<string>(isoData(new Date()));
  const [statExtins, setStatExtins] = useState<"venituri" | "deIncasat" | "programari" | "clienti" | "rating" | "servicii" | "talie" | null>(null);
  const [raportDeschis, setRaportDeschis] = useState(false);
  const [raportSel, setRaportSel] = useState({ venituri: true, programari: true, clienti: true, servicii: true, talie: true });
  const [exportLoading, setExportLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("statistici");
  const [isMobile, setIsMobile] = useState(false);
  const [programari, setProgramari] = useState<ProgramareSalon[]>([]);
  const [notificari, setNotificari] = useState<Notificare[]>([]);
  const [clientiRisc, setClientiRisc] = useState<{ userId: string; numeClient: string; telefon: string | null; numeAnimal: string | null; rasaAnimal: string | null; ultimaVizita: string; zileAbsenta: number; intervalMediu: number; mesajAI: string; cod?: string; reducere?: number }[]>([]);
  const [clientiRiscLoading, setClientiRiscLoading] = useState(false);
  const [clientiRiscEroare, setClientiRiscEroare] = useState<string | null>(null);
  const [mesajeCopiate, setMesajeCopiate] = useState<Record<string, boolean>>({});
  const [reducereRisc, setReducereRisc] = useState(0);
  const [ultimaAnalizaRisc, setUltimaAnalizaRisc] = useState<string | null>(null);
  const [mesajeTrimise, setMesajeTrimise] = useState<Record<string, boolean>>({});
  const [mesajTrimiteLoading, setMesajTrimiteLoading] = useState<Record<string, boolean>>({});
  const [aiTab, setAiTab] = useState<"recenzii" | "clientiInactivi" | "fisaIngrijire" | "consultant" | "postari" | null>(null);
  // Fișă post-grooming: stare per programare { draft, generand, trimitand, trimis, eroare }
  const [fisaState, setFisaState] = useState<Record<string, { draft: string; generand: boolean; trimitand: boolean; trimis: boolean; eroare: string | null }>>({});
  // Consultant AI — rapoarte premium (cache-uite) + intrebari libere (5/luna)
  const [rapoarte, setRapoarte] = useState<Record<string, ConsultantRaport | undefined>>({});
  const [raportLoading, setRaportLoading] = useState<string | null>(null); // tip-ul in curs de generare
  const [consRaportDeschis, setConsRaportDeschis] = useState<string | null>(null); // tip-ul afisat extins
  const [raportEroare, setRaportEroare] = useState<string | null>(null);
  // Intrebare punctuala
  const [consultantInput, setConsultantInput] = useState("");
  const [intrebareLoading, setIntrebareLoading] = useState(false);
  const [intrebariLuna, setIntrebariLuna] = useState(0); // cate intrebari libere s-au folosit luna asta
  const [qaList, setQaList] = useState<ConsultantQA[]>([]); // istoricul Q&A (persistat cross-device)
  const qaLoadedRef = React.useRef(false);
  const [userId, setUserId] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [profilSalon, setProfilSalon] = useState({ numeSalon: "", adresa: "", oras: "", telefon: "", descriere: "" });
  const [speciiSalon, setSpeciiSalon] = useState<string[]>([]);
  const [specializariSalon, setSpecializariSalon] = useState<string[]>([]);
  /** Închiderea contului de salon. */
  const [stergeDeschis, setStergeDeschis] = useState(false);
  const [stergeParola, setStergeParola] = useState("");
  const [stergeEroare, setStergeEroare] = useState("");
  const [stergeLoading, setStergeLoading] = useState(false);
  const [publicTinta, setPublicTinta] = useState<string>("");
  const [pozaUrl, setPozaUrl] = useState<string | null>(null);
  const [galerie, setGalerie] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGalerie, setUploadingGalerie] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropState, setCropState] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  /* Listele pornesc goale.
     Înainte porneau cu trei servicii inventate („Tuns complet 80 lei") și cu
     doi angajați care nu existau — „Maria Ionescu", „Andrei Pop". Se vedeau
     până răspundea baza, iar la saloanele care aveau câmpul necompletat
     rămâneau pe ecran. Un salon care apăsa Salvează fără să se uite și-i
     scria în cont, iar clienții ajungeau să rezerve la un specialist
     inexistent. La un coafor, „Rase mici" era și mai vizibil. */
  const [servicii, setServicii] = useState<Serviciu[]>([]);
  const [echipa, setEchipa] = useState<Groomer[]>([]);
  /** Cât timp încă citim din bază, listele goale nu înseamnă „n-ai nimic". */
  const [datePregatite, setDatePregatite] = useState(false);
  const [program, setProgram] = useState<ProgramSaptamanal>(PROGRAM_DEFAULT);
  const stepCalendar = useMemo(() => {
    const durate: number[] = [];
    for (const s of servicii) {
      if (s.durate) {
        for (const k of ["mica", "medie", "mare"] as const) {
          const d = Number(s.durate[k]) || 0;
          if (d > 0) durate.push(d);
        }
      }
      const d0 = Number(s.durata) || 0;
      if (d0 > 0) durate.push(d0);
    }
    return stepFromDurate(durate);
  }, [servicii]);
  const [zilaSelectata, setZilaSelectata] = useState<string>(() => isoData(new Date()));
  const [agendaZi, setAgendaZi] = useState<string>(() => isoData(new Date()));
  const [highlightProgramare, setHighlightProgramare] = useState<string | null>(null);
  const [filtruTalie, setFiltruTalie] = useState<"toate" | "mica" | "medie" | "mare">("toate");
  const [animaleIstoric, setAnimaleIstoric] = useState<AnimalIstoric[]>([]);
  const [cautareAnimal, setCautareAnimal] = useState("");
  const [animalDeschis, setAnimalDeschis] = useState<string | null>(null);
  const [clientiBlocati, setClientiBlocati] = useState<string[]>([]);
  const [abateriMap, setAbateriMap] = useState<Record<string, number>>({});
  /** Ce a răspuns baza când n-a mers încărcarea agendei. Gol = totul e bine. */
  const [eroareAgenda, setEroareAgenda] = useState("");
  /** Neprezentări per client. Se numără separat: o neprezentare e mai gravă decât o anulare târzie. */
  const [neprezentariMap, setNeprezentariMap] = useState<Record<string, number>>({});
  const [groomerOrarDeschis, setGroomerOrarDeschis] = useState<Record<number, boolean>>({});
  const [sloturiZi, setSloturiZi] = useState<SlotProgramare[]>([]);
  const [modalBlocare, setModalBlocare] = useState<{ slot: string; durata: number } | null>(null);
  const [tipBlocare, setTipBlocare] = useState<"telefonic" | "walkin" | "blocaj">("telefonic");
  const [numeBlocare, setNumeBlocare] = useState("");
  /** Serviciul ales din lista salonului la o programare telefonică. Gol = niciunul. */
  const [serviciuBlocare, setServiciuBlocare] = useState("");
  /** Prețul, opțional. Gol înseamnă „doar programare, fără încasare". */
  const [pretBlocare, setPretBlocare] = useState("");
  /** Salonul decide dacă vrea clientul în istoric sau doar ora blocată. */
  const [tineMinteClient, setTineMinteClient] = useState(false);
  const [durataBlocare, setDurataBlocare] = useState(60);
  const [groomerBlocare, setGroomerBlocare] = useState<string>("toti");
  const [groomerProgramTab, setGroomerProgramTab] = useState<string>("toti");

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

      // Profil + salon în paralel — câștig vizibil de viteză la logare
      const [{ data: profile }, { data: salonRow }] = await Promise.all([
        supabase.from("profiluri").select("*").eq("id", authUser.id).single(),
        supabase.from("saloane").select("*").eq("user_id", authUser.id).single(),
      ]);

      if (profile) {
        setUser({ ...profile, email: authUser.email });
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        if (profile.tema === "dark") {
          setTheme("dark");
          document.documentElement.dataset.theme = "dark";
          try { localStorage.setItem("calyhub_theme", "dark"); } catch {}
        }
      }

      if (salonRow) {
        setSalonData(salonRow);

        /*
         * Salon fără dată de trial (înscris înainte să existe coloana): o
         * scriem o singură dată, din data înscrierii. Până acum, lipsa datei
         * îl declara „abonat" — adică plătitor, în dashboard și în MRR-ul din
         * admin. Aici iese din zona de ghicit și trece în date reale.
         */
        if (!salonRow.trial_expira_la && salonRow.created_at) {
          const expira = new Date(new Date(salonRow.created_at).getTime() + ZILE_TRIAL * 24 * 60 * 60 * 1000).toISOString();
          // .then() ca să pornească — fără await, ca să nu întârzie încărcarea.
          supabase.from("saloane").update({ trial_expira_la: expira }).eq("id", salonRow.id).is("trial_expira_la", null).then(() => {});
        }
        setProfilSalon({
          numeSalon: salonRow.nume || "",
          adresa: salonRow.adresa || "",
          oras: salonRow.oras || "",
          telefon: salonRow.telefon || "",
          descriere: salonRow.descriere || "",
        });
        if (Array.isArray(salonRow.specii)) setSpeciiSalon(salonRow.specii);
        if (Array.isArray(salonRow.specializari)) setSpecializariSalon(salonRow.specializari);
        if (salonRow.public_tinta) setPublicTinta(salonRow.public_tinta);
        if (Array.isArray(salonRow.specializari)) setSpecializariSalon(salonRow.specializari);
        if (salonRow.poza_url) setPozaUrl(salonRow.poza_url);
        if (salonRow.galerie && Array.isArray(salonRow.galerie)) setGalerie(salonRow.galerie);
        if (salonRow.program && typeof salonRow.program === "object" && Object.keys(salonRow.program).length > 0) {
          setProgram({ ...PROGRAM_DEFAULT, ...salonRow.program });
        }
        /*
         * Identitățile lipsă se completează o singură dată, la prima intrare.
         *
         * Serviciile și membrii scriși înainte n-au `sid`/`uid`, deci legăturile
         * dintre ei se fac încă după nume. Le dăm un id acum și îl scriem în
         * bază, ca redenumirile de mâine să nu mai rupă nimic. Dacă scrierea
         * eșuează, aplicația merge mai departe pe potrivirea după nume.
         */
        const srvBrut: any[] = Array.isArray(salonRow.servicii) ? salonRow.servicii : [];
        const echBrut: any[] = Array.isArray(salonRow.echipa) ? salonRow.echipa : [];
        const lipsescIduri = srvBrut.some(s => !s?.sid) || echBrut.some(g => !g?.uid);
        const srvCuId = srvBrut.map((s: any) => ({ ...s, sid: s?.sid || idStabil() }));
        const echCuId = echBrut.map((g: any) => ({ ...g, uid: g?.uid || idStabil() }));
        if (lipsescIduri) {
          supabase.from("saloane").update({ servicii: srvCuId, echipa: echCuId }).eq("id", salonRow.id).then(() => {});
        }

        setServicii(srvCuId.map((s: any, i: number) => ({ ...s, id: i + 1 })));
        setEchipa(echCuId.map((g: any, i: number) => ({ ...g, id: i + 1 })));
        if (Array.isArray(salonRow.clienti_blocati)) setClientiBlocati(salonRow.clienti_blocati);
        setDatePregatite(true);

        // Toate sub-cererile în paralel — autoFinalizeaza nu blochează UI
        autoFinalizeaza(salonRow.id);
        loadProgramari(salonRow.id);
        loadAbateri(salonRow.id);
        loadNeprezentari(salonRow.id);
        loadAnimaleIstoric(salonRow.id, salonRow.domeniu !== "infrumusetare");
        loadNotificari(authUser.id);
      } else {
        // Fără rând de salon (wizard neterminat) tot am terminat de citit.
        setDatePregatite(true);
      }
    }

    /** Neprezentările fiecărui client — numărate separat de anulările târzii. */
    async function loadNeprezentari(salonId: string) {
      const { data } = await supabase
        .from("programari")
        .select("user_id")
        .eq("salon_id", salonId)
        .eq("status", "neprezentat");
      const map: Record<string, number> = {};
      (data || []).forEach((p: any) => { if (p.user_id) map[p.user_id] = (map[p.user_id] || 0) + 1; });
      setNeprezentariMap(map);
    }

    async function loadAbateri(salonId: string) {
      const { data } = await supabase
        .from("programari")
        .select("user_id")
        .eq("salon_id", salonId)
        .eq("status", "anulat")
        .not("motiv_anulare", "is", null)
        /*
         * Doar anulările clientului. Salonul scrie și el un motiv când anulează,
         * iar fără filtrul ăsta motivul lui ar fi numărat împotriva clientului:
         * omul căruia salonul i-a anulat de trei ori ar apărea cu „3 anulări
         * târzii" și salonul ar fi invitat să-l blocheze. Rândurile vechi au
         * `anulat_de` gol și sunt, toate, anulări ale clientului.
         */
        .or("anulat_de.is.null,anulat_de.eq.client")
        // Nici anulările care vin după o mutare făcută de salon: ora n-a fost
        // aleasă de client, deci nu i se pune în cârcă.
        .is("mutat_la", null);
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

    // La grooming istoricul e grupat pe animal; la infrumusetare, pe client.
    async function loadAnimaleIstoric(salonId: string, peAnimal: boolean) {
      let q = supabase
        .from("programari")
        .select("id, serviciu, pret, data, ora, status, animal_id, user_id, sursa, nume_client_extern")
        .eq("salon_id", salonId)
        .in("status", ["finalizat", "confirmat"]);
      if (peAnimal) q = q.not("animal_id", "is", null);
      const { data } = await q.order("data", { ascending: false });

      if (!data || data.length === 0) { setAnimaleIstoric([]); return; }

      const aziIso = isoData(new Date());
      const istoric = data.filter((p: any) => {
        const esteApp = !p.sursa || p.sursa === "app";
        // Programările luate la telefon intră în istoric doar dacă salonul a
        // bifat „Ține minte clientul" — atunci are un nume salvat. Fără nume,
        // rândul e o oră blocată, nu o persoană. Pauzele nu intră niciodată.
        const eClientRetinut = !esteApp && p.sursa !== "blocaj" && !!p.nume_client_extern;
        if (!esteApp && !eClientRetinut) return false;
        if (p.status === "finalizat") return true;
        if (p.status === "confirmat" && p.data < aziIso) return true;
        return false;
      });
      if (istoric.length === 0) { setAnimaleIstoric([]); return; }

      const animalIds = [...new Set(istoric.map((p: any) => p.animal_id))];
      const userIds = [...new Set(istoric.map((p: any) => p.user_id).filter(Boolean))];

      const [{ data: animals }, { data: profiles }] = await Promise.all([
        supabase.from("animale").select("id, nume, specie, sex, rasa, greutate, talie, varsta, alergii, vaccinat, poza_url, user_id").in("id", animalIds),
        userIds.length > 0 ? supabase.from("profiluri").select("id, nume, telefon").in("id", userIds) : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      const animalMap = Object.fromEntries((animals || []).map((a: any) => [a.id, a]));

      const grupat: Record<string, AnimalIstoric> = {};
      for (const p of istoric) {
        const esteAppP = !p.sursa || p.sursa === "app";
        // Clienții de la telefon n-au cont, deci n-au `user_id` propriu — rândul
        // e pe contul salonului. Îi grupăm după numele scris de salon, ca două
        // vizite ale aceleiași persoane să ajungă împreună.
        if (!esteAppP) {
          const cheie = `tel:${String(p.nume_client_extern).trim().toLowerCase()}`;
          if (!grupat[cheie]) {
            grupat[cheie] = {
              id: cheie, nume: p.nume_client_extern, specie: "", sex: "", rasa: "",
              greutate: null, talie: null, varsta: null, alergii: "", vaccinat: false, poza_url: null,
              stapanNume: p.nume_client_extern, stapanTelefon: null,
              // Fără cont, nu poate fi blocat — butonul nu apare.
              stapanUserId: null,
              vizite: [], totalCheltuit: 0, ultimaVizita: null,
            };
          }
          grupat[cheie].vizite.push({ id: p.id, serviciu: p.serviciu, pret: Number(p.pret) || 0, data: p.data, ora: p.ora, status: p.status as StatusProg });
          grupat[cheie].totalCheltuit += Number(p.pret) || 0;
          continue;
        }

        // Istoric pe client (saloane de infrumusetare)
        if (!peAnimal) {
          const cheie = p.user_id;
          if (!cheie) continue;
          const prof = profileMap[cheie];
          if (!grupat[cheie]) {
            grupat[cheie] = {
              id: cheie, nume: prof?.nume || "Client", specie: "", sex: "", rasa: "",
              greutate: null, talie: null, varsta: null, alergii: "", vaccinat: false, poza_url: null,
              stapanNume: prof?.nume || "Client", stapanTelefon: prof?.telefon || null, stapanUserId: cheie,
              vizite: [], totalCheltuit: 0, ultimaVizita: null,
            };
          }
          grupat[cheie].vizite.push({ id: p.id, serviciu: p.serviciu, pret: Number(p.pret) || 0, data: p.data, ora: p.ora, status: p.status as StatusProg });
          grupat[cheie].totalCheltuit += Number(p.pret) || 0;
          continue;
        }
        const a = animalMap[p.animal_id];
        if (!a) continue;
        if (!grupat[p.animal_id]) {
          const prof = profileMap[a.user_id] || profileMap[p.user_id];
          grupat[p.animal_id] = {
            id: a.id, nume: a.nume, specie: a.specie, sex: a.sex, rasa: a.rasa,
            greutate: a.greutate ?? null, talie: a.talie ?? null, varsta: a.varsta ?? null,
            alergii: a.alergii || "", vaccinat: a.vaccinat || false, poza_url: a.poza_url || null,
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
      const { data: dataRaw, error: eProg } = await supabase
        .from("programari")
        .select("id, ora, data, serviciu, pret, status, user_id, animal_id, sursa, nume_client_extern, durata, talie_animal, motiv_anulare, anulat_de, mutat_la, groomer, membru_uid, observatii")
        .eq("salon_id", salonId)
        .order("data", { ascending: true })
        .order("ora", { ascending: true });

      /*
       * Nu mai ascundem nimic.
       *
       * Înainte, filtrul de aici arunca orice programare anulată fără motiv —
       * ca să scape de refuzurile salonului. Efect neintenționat: și anulările
       * clientului făcute din timp (care n-au motiv, fiindcă nu li-l cerem)
       * dispăreau din agendă. Salonul nu afla niciodată că cineva a renunțat cu
       * trei zile înainte; ora arăta pur și simplu liberă.
       *
       * Acum știm cine a anulat, din `anulat_de`, deci le putem arăta pe toate,
       * fiecare cu eticheta ei.
       */
      /*
       * Eroarea nu mai e înghițită.
       *
       * Când lipsea o coloană din `select` (de pildă după ce am adăugat
       * `anulat_de` sau `mutat_la` fără să fie rulat SQL-ul), interogarea
       * eșua, `data` venea null, iar agenda arăta goală — fără nicio
       * programare și fără butoane. Salonul primea notificarea de rezervare
       * nouă și nu găsea nimic de apăsat, fără să afle de ce.
       */
      if (eProg) {
        setEroareAgenda(`Nu am putut încărca programările: ${eProg.message}`);
        console.error("loadProgramari error:", eProg);
        setProgramari([]);
        return;
      }
      setEroareAgenda("");

      const data = dataRaw || [];

      if (data.length === 0) { setProgramari([]); return; }

      const userIds = [...new Set(data.map((p: any) => p.user_id).filter(Boolean))];
      const animalIds = [...new Set(data.map((p: any) => p.animal_id).filter(Boolean))];

      const [{ data: profiles }, { data: animals }] = await Promise.all([
        userIds.length > 0 ? supabase.from("profiluri").select("id, nume, avatar_url").in("id", userIds) : Promise.resolve({ data: [] }),
        animalIds.length > 0 ? supabase.from("animale").select("id, nume, specie, sex, rasa, greutate, talie").in("id", animalIds) : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      const animalMap = Object.fromEntries((animals || []).map((a: any) => [a.id, a]));

      setProgramari(data.map((p: any) => {
        const profil = profileMap[p.user_id];
        const animal = animalMap[p.animal_id];
        const specieIconStr = specieIcon(animal?.specie);
        const sexIcon = animal?.sex === "femela" ? "♀" : animal?.sex === "mascul" ? "♂" : "";
        const talieEf = p.talie_animal || animal?.talie;
        const talieTxt = talieEf === "mica" ? "Mică" : talieEf === "medie" ? "Medie" : talieEf === "mare" ? "Mare" : null;
        const detalii = [animal?.rasa, animal?.greutate ? `${animal.greutate}kg` : null, talieTxt, sexIcon].filter(Boolean).join(", ");
        const esteApp = !p.sursa || p.sursa === "app";
        const clientNume = esteApp ? (profil?.nume || "—") : (p.nume_client_extern || (p.sursa === "telefonic" ? "Client telefonic" : p.sursa === "walkin" ? "Walk-in" : "Indisponibil"));
        const animalText = esteApp
          ? (animal?.nume ? `${specieIconStr} ${animal.nume}${detalii ? ` (${detalii})` : ""}` : "—")
          : (p.sursa === "blocaj" ? "—" : "Adăugat manual");
        return {
          id: p.id,
          user_id: p.user_id,
          client: clientNume,
          clientAvatar: esteApp ? (profil?.avatar_url || null) : null,
          animal: animalText,
          animalNume: esteApp ? (animal?.nume || null) : null,
          rasa: esteApp ? (animal?.rasa || null) : null,
          specie: esteApp ? (animal?.specie || null) : null,
          talie: talieEf || null,
          serviciu: p.serviciu,
          ora: p.ora,
          data: p.data,
          durata: Number(p.durata) || null,
          pret: Number(p.pret) || 0,
          status: p.status as StatusProg,
          esteApp,
          sursa: p.sursa || "app",
          motivAnulare: p.motiv_anulare || null,
          anulatDe: p.anulat_de || null,
          mutatLa: p.mutat_la || null,
          groomer: p.groomer || null,
          membruUid: p.membru_uid || null,
          observatii: p.observatii || null,
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

  /**
   * Închiderea contului de salon.
   *
   * Regula stabilită cu utilizatorul: salonul dispare din aplicație, dar
   * **denumirea rămâne** — altfel istoricul clienților ar arăta „Salon
   * necunoscut" în locul unei vizite reale. E și ce promit Termenii, §5.
   *
   * Programările viitoare se anulează și fiecare client e anunțat: un salon
   * care dispare fără o vorbă lasă oameni să se prezinte degeaba.
   */
  // Escape închide fereastra de închidere a contului.
  useEffect(() => {
    if (!stergeDeschis) return;
    const pe = (e: KeyboardEvent) => { if (e.key === "Escape" && !stergeLoading) setStergeDeschis(false); };
    window.addEventListener("keydown", pe);
    return () => window.removeEventListener("keydown", pe);
  }, [stergeDeschis, stergeLoading]);

  async function inchideSalonul() {
    setStergeEroare("");
    if (!stergeParola) { setStergeEroare("Scrie parola ca să confirmi."); return; }

    setStergeLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const email = authUser?.email;
    if (!authUser || !email || !salonData?.id) { setStergeEroare("Nu am putut citi contul. Reintră și încearcă din nou."); setStergeLoading(false); return; }

    const { error: eLogin } = await supabase.auth.signInWithPassword({ email, password: stergeParola });
    if (eLogin) { setStergeEroare("Parola nu e corectă."); setStergeLoading(false); return; }

    const azi = new Date().toISOString().slice(0, 10);

    // 1. Cine are programări viitoare, ca să-i putem anunța pe nume.
    const { data: viitoare } = await supabase
      .from("programari")
      .select("id, user_id, data, ora, serviciu")
      .eq("salon_id", salonData.id)
      .in("status", ["confirmat", "în așteptare"])
      .gte("data", azi);

    // 2. Le anulăm.
    await supabase
      .from("programari")
      .update({ status: "anulat", motiv_anulare: "Salonul și-a închis contul." })
      .eq("salon_id", salonData.id)
      .in("status", ["confirmat", "în așteptare"])
      .gte("data", azi);

    // 3. Îi anunțăm. Programările făcute de salon la telefon n-au user_id.
    const numeSalon = salonData.nume || "Salonul";
    const notificari = (viitoare || [])
      .filter((p: any) => p.user_id && p.user_id !== authUser.id)
      .map((p: any) => ({
        user_id: p.user_id,
        tip: "anulat",
        mesaj: `${numeSalon} și-a închis contul, iar programarea ta din ${p.data.split("-").reverse().join(".")} de la ${p.ora} a fost anulată.`,
        programare_id: p.id,
      }));
    if (notificari.length > 0) await supabase.from("notificari").insert(notificari);

    // 4. Golim salonul, dar păstrăm denumirea pentru istoricul clienților.
    const { error } = await supabase.from("saloane").update({
      sters_la: new Date().toISOString(),
      telefon: "", adresa: "", descriere: "",
      poza_url: null, galerie: [], servicii: [], echipa: [],
      specializari: [], public_tinta: null, lat: null, lng: null,
    }).eq("id", salonData.id);

    if (error) { setStergeEroare("Nu am putut închide contul. Încearcă din nou sau scrie-ne la parteneri@calyhub.ro."); setStergeLoading(false); return; }

    // 5. Contul de utilizator nu mai poate intra — aceeași regulă ca la client.
    await supabase.from("profiluri").update({ sters_la: new Date().toISOString() }).eq("id", authUser.id);

    try {
      localStorage.removeItem("calyhub_theme");
      localStorage.removeItem("calyhub_saloane_cache");
    } catch {}
    await supabase.auth.signOut();
    router.push("/?cont=inchis");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    // Tema aleasă rămâne în `profiluri.tema` și se recitește la reconectare.
    // Aici curățăm și cache-ul local, altfel paginile publice ar rămâne întunecate.
    document.documentElement.dataset.theme = "";
    try { localStorage.removeItem("calyhub_theme"); } catch {}
    router.push("/login");
  }

  const c = C[theme];
  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${c.border}`, fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", background: c.input, color: c.text };

  const numeSalon = salonData?.nume || "Salonul tau";
  // Verticala salonului — decide limbajul si ce sectiuni are rost sa existe.
  const domeniuSalon: DomeniuSalon = salonData?.domeniu === "infrumusetare" ? "infrumusetare" : "grooming";
  const DS = DOM_SALON[domeniuSalon];
  const areAnimale = DS.areAnimale;

  // Starea trialului. Deocamdata doar informam — blocarea vine odata cu platile.
  const trial = stareTrial(salonData?.trial_expira_la, salonData?.abonament_activ, salonData?.created_at);

  // O singura notificare in aplicatie cand trialul expira. Emailul vine cu Resend.
  useEffect(() => {
    if (!userId || trial.stare !== "expirat") return;
    let anulat = false;
    (async () => {
      const { data: existenta } = await supabase
        .from("notificari")
        .select("id")
        .eq("user_id", userId)
        .eq("tip", "trial_expirat")
        .limit(1);
      if (anulat || (existenta && existenta.length > 0)) return;
      const mesaj = "Trialul gratuit s-a încheiat. Alege un plan ca salonul să rămână vizibil și să primească programări. Datele rămân salvate încă o perioadă.";
      const { data: nou } = await supabase
        .from("notificari")
        .insert({ user_id: userId, tip: "trial_expirat", mesaj })
        .select("*")
        .single();
      if (!anulat && nou) setNotificari(n => [nou as Notificare, ...n]);
    })();
    return () => { anulat = true; };
  }, [userId, trial.stare]);

  const numeComplet = user?.nume?.split(" ")[0] || "Manager";
  const SUB_TABS: Tab[] = ["functii-ai", "profil-salon", "servicii", "echipa", "animale", "abonament", "setari", "ajutor"];
  const isSubTab = SUB_TABS.includes(tab);
  const TAB_LABELS: Record<Tab, string> = {
    agenda: "Agenda", statistici: "Statistici", program: "Program", notificari: "Notificări", "functii-ai": "Funcții AI",
    "profil-salon": "Profilul salonului", servicii: "Serviciile mele",
    echipa: "Echipa mea", animale: DS.istoricTitlu, abonament: "Abonamentul meu", setari: "Setări cont", ajutor: "Ajutor",
  };

  // Acces agenți AI în funcție de plan (sursa: saloane.plan din Supabase — cross-device)
  // Fallback pe localStorage pentru cazul în care salonData nu s-a incarcat inca
  const planIdCurent = (() => {
    if (salonData?.plan) return String(salonData.plan).toLowerCase();
    return "basic"; // planul se citeste din baza; "basic" e planul de intrare
  })();
  const aiAccess = {
    recenzii: ["basic", "pro", "business"].includes(planIdCurent),
    clientiInactivi: ["pro", "business"].includes(planIdCurent),
    fisaIngrijire: ["business"].includes(planIdCurent),
    consultant: ["business"].includes(planIdCurent),
    postari: ["business"].includes(planIdCurent),
  };
  const cicluCurent: Ciclu = salonData?.ciclu === "anual" ? "anual" : "lunar";

  /*
   * Limitele planului — useri și poze.
   *
   * Se aplică la **adăugare**, nu retroactiv, și nu șterg niciodată nimic.
   * Când salonul coboară pe un plan mai mic și e peste limită, își alege
   * singur cine rămâne activ (vezi `coborareInSuspensie`).
   */
  const limiteCurente = limitePlan(planIdCurent);
  const eUserActiv = (g: Groomer) => g.activ !== false;
  const userieActivi = echipa.filter(eUserActiv);
  const pozeAscunse: string[] = Array.isArray(salonData?.galerie_ascunse) ? salonData.galerie_ascunse : [];
  const galerieVizibila = galerie.filter(u => !pozeAscunse.includes(u));
  const potAdaugaUser = limiteCurente.maxUseri === null || userieActivi.length < limiteCurente.maxUseri;
  const potAdaugaPoza = limiteCurente.maxPoze === null || galerieVizibila.length < limiteCurente.maxPoze;

  /** Ecranul „alege cine rămâne", când coborârea de plan trece peste limită. */
  const [coborare, setCoborare] = useState<{ plan: PlanId; ciclu: Ciclu; useri: number[]; poze: string[] } | null>(null);

  const PLANURI_SALON = planuriPentru(areAnimale ? "grooming" : "infrumusetare");
  const [schimbPlan, setSchimbPlan] = useState(false);

  /**
   * Schimbarea planului, direct din cont.
   *
   * În trial se poate face oricând și de câte ori vrea salonul: ce vede în
   * aplicație e exact ce dă planul pe care stă acum, iar la finalul trialului
   * îi propunem planul pe care se află. Fără card, fără plată — deocamdată nu
   * există nicio încasare, iar butonul nu pretinde altceva.
   *
   * Fiecare schimbare intră în `plan_istoric`. La prima dispută despre
   * facturare o să vrei să știi ce a ales omul și când; iar după primele 20 de
   * saloane îți arată dacă lumea urcă sau coboară în trial. E o informație pe
   * care n-o poți recupera retroactiv dacă n-o scrii de la început.
   */
  /**
   * Ecranul unui agent AI care nu e în planul curent.
   *
   * Cât timp salonul e în trial, lacătul devine ușă: apeși și ești pe planul
   * ăla, pe loc, fără card. Înainte scria „Disponibil începând cu planul
   * Business" și te trimitea în alt tab — adică, timp de 14 zile, produsul îi
   * arăta omului ce nu are, exact în momentul în care voia să vadă ce are.
   */
  function PoartaPlan({ plan, text }: { plan: PlanId; text: React.ReactNode }) {
    const inTrial = trial.stare === "trial";
    return (
      <div style={{ padding: "22px 18px", textAlign: "center" }}>
        <div style={{ fontSize: 13.5, color: c.muted, marginBottom: 14, lineHeight: 1.6 }}>
          {inTrial ? (
            <>Face parte din planul <strong style={{ color: "#FF6B00" }}>{numePlan(plan)}</strong>. Ești în trial — îl poți încerca acum, fără card. {text}</>
          ) : (
            <>Disponibil în planul <strong style={{ color: "#FF6B00" }}>{numePlan(plan)}</strong>. {text}</>
          )}
        </div>
        <button onClick={() => (inTrial ? schimbaPlan(plan) : setTab("abonament"))} disabled={schimbPlan}
          style={{ fontSize: 13, fontWeight: 800, color: "#fff", background: "#FF6B00", border: "none", borderRadius: 50, padding: "10px 22px", cursor: schimbPlan ? "wait" : "pointer", fontFamily: "Nunito, sans-serif", opacity: schimbPlan ? .6 : 1, maxWidth: "100%" }}>
          {inTrial ? `Încearcă ${numePlan(plan)} acum` : `Alege planul ${numePlan(plan)}`}
        </button>
        {inTrial && (
          <div style={{ fontSize: 11.5, color: c.xmuted, marginTop: 9 }}>Te poți întoarce oricând la planul de acum.</div>
        )}
      </div>
    );
  }

  async function schimbaPlan(planNou: PlanId, cicluNou: Ciclu = cicluCurent) {
    if (!salonData?.id) return;
    if (planNou === planIdCurent && cicluNou === cicluCurent) { setSchimbPlan(false); return; }

    /*
     * Coborâre sub ce are salonul acum: nu tăiem noi.
     *
     * Aplicația nu decide cine mai lucrează și nu șterge poze. Deschidem
     * ecranul în care salonul alege singur ce rămâne activ, cu tot ce e peste
     * limită păstrat intact în bază.
     */
    const lim = limitePlan(planNou);
    const peUseri = lim.maxUseri !== null && userieActivi.length > lim.maxUseri;
    const pePoze = lim.maxPoze !== null && galerieVizibila.length > lim.maxPoze;
    if (peUseri || pePoze) {
      setCoborare({
        plan: planNou,
        ciclu: cicluNou,
        useri: userieActivi.slice(0, lim.maxUseri ?? userieActivi.length).map(g => g.id),
        poze: galerieVizibila.slice(0, lim.maxPoze ?? galerieVizibila.length),
      });
      return;
    }
    /*
     * Urcare: ce a fost scos revine singur.
     *
     * Am promis „dacă urci la loc, revin exact cum erau" — deci nu-l punem pe
     * om să reactiveze manual, unul câte unul, oameni pe care i-a dezactivat
     * doar fiindcă îi cerea planul.
     */
    const incapUserii = lim.maxUseri === null || echipa.length <= lim.maxUseri;
    const incapPozele = lim.maxPoze === null || galerie.length <= lim.maxPoze;
    const extra: Record<string, any> = {};
    if (incapUserii && echipa.some(g => g.activ === false)) {
      extra.echipa = echipa.map(g => ({ ...g, activ: true }));
    }
    if (incapPozele && pozeAscunse.length > 0) extra.galerie_ascunse = [];

    const ok = await scriePlan(planNou, cicluNou, Object.keys(extra).length ? extra : undefined);
    if (ok && extra.echipa) setEchipa(extra.echipa);
  }

  /** Scrierea propriu-zisă a planului, plus rândul din jurnal. */
  async function scriePlan(planNou: PlanId, cicluNou: Ciclu, extra?: Record<string, any>) {
    if (!salonData?.id) return false;
    const planVechi = planIdCurent;
    setSchimbPlan(true);
    const { data: scrise, error } = await supabase
      .from("saloane").update({ plan: planNou, ciclu: cicluNou, ...(extra || {}) }).eq("id", salonData.id).select("id");
    setSchimbPlan(false);
    if (error || !scrise?.length) { salveaza("Nu am putut schimba planul. Încearcă din nou."); return false; }

    setSalonData((s: any) => ({ ...s, plan: planNou, ciclu: cicluNou, ...(extra || {}) }));
    supabase.from("plan_istoric").insert({
      salon_id: salonData.id,
      plan_vechi: planVechi,
      plan_nou: planNou,
      ciclu: cicluNou,
      stare: trial.stare,
    }).then(() => {});
    salveaza(`Ai trecut pe planul ${numePlan(planNou)}.`);
    return true;
  }

  /**
   * Confirmarea coborârii: userii nebifați devin inactivi, pozele nebifate se
   * ascund din profilul public. Nimic nu se șterge — fișierele rămân în
   * storage, membrii echipei rămân în listă cu tot istoricul lor, iar dacă
   * salonul urcă la loc revin exact cum erau.
   */
  async function aplicaCoborare() {
    if (!coborare) return;
    const echipaNoua = echipa.map(g => ({ ...g, activ: coborare.useri.includes(g.id) }));
    const ascunse = galerie.filter(u => !coborare.poze.includes(u));
    const ok = await scriePlan(coborare.plan, coborare.ciclu, { echipa: echipaNoua, galerie_ascunse: ascunse });
    if (!ok) return;
    setEchipa(echipaNoua);
    setCoborare(null);
  }

  // Contor LUNAR de intrebari libere — sursa: Supabase (cross-device)
  useEffect(() => {
    if (!salonData?.id) return;
    let activ = true;
    const lunaKey = new Date().toISOString().slice(0, 7) + "-01"; // prima zi din luna
    (async () => {
      const { data } = await supabase
        .from("consultant_utilizare")
        .select("intrebari")
        .eq("salon_id", salonData.id)
        .eq("zi", lunaKey)
        .maybeSingle();
      if (!activ) return;
      setIntrebariLuna(data && typeof data.intrebari === "number" ? data.intrebari : 0);
    })();
    return () => { activ = false; };
  }, [salonData?.id]);

  // Incarca rapoartele cache-uite pentru luna curenta din Supabase
  useEffect(() => {
    if (!salonData?.id) return;
    let activ = true;
    const perioada = new Date().toISOString().slice(0, 7); // "2026-06"
    (async () => {
      const { data } = await supabase
        .from("consultant_rapoarte")
        .select("tip, continut, created_at")
        .eq("salon_id", salonData.id)
        .eq("perioada", perioada);
      if (!activ || !data) return;
      const map: Record<string, ConsultantRaport> = {};
      for (const r of data) map[r.tip] = { continut: r.continut, created_at: r.created_at };
      setRapoarte(map);
    })();
    return () => { activ = false; };
  }, [salonData?.id]);

  // Incarca istoricul Q&A (intrebari libere) din Supabase
  useEffect(() => {
    if (!salonData?.id) return;
    let activ = true;
    qaLoadedRef.current = false;
    (async () => {
      const { data } = await supabase
        .from("consultant_conversatii")
        .select("mesaje")
        .eq("salon_id", salonData.id)
        .maybeSingle();
      if (!activ) return;
      if (data?.mesaje && Array.isArray(data.mesaje)) {
        // pastram doar intrarile in format Q&A
        const qa = (data.mesaje as any[]).filter(m => m && typeof m.q === "string" && typeof m.a === "string");
        setQaList(qa as ConsultantQA[]);
      }
      qaLoadedRef.current = true;
    })();
    return () => { activ = false; };
  }, [salonData?.id]);

  // Salveaza istoricul Q&A in Supabase la fiecare schimbare (dupa ce s-a incarcat)
  useEffect(() => {
    if (!salonData?.id || !qaLoadedRef.current) return;
    const salonId = salonData.id;
    const t = setTimeout(() => {
      const deStocat = qaList.slice(-20); // ultimele 20 de intrebari
      supabase
        .from("consultant_conversatii")
        .upsert({ salon_id: salonId, mesaje: deStocat, updated_at: new Date().toISOString() }, { onConflict: "salon_id" })
        .then(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [qaList, salonData?.id]);
  const planLabelCurent = planIdCurent ? planIdCurent.charAt(0).toUpperCase() + planIdCurent.slice(1) : "Trial";
  // Tab implicit în „Funcții AI" = primul agent disponibil din plan
  const aiTabActiv = aiTab;
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

  /**
   * „Nu s-a prezentat" / „A venit".
   *
   * Programările trecute devin automat `finalizat`, ca salonul să n-aibă de
   * bifat nimic în zilele obișnuite. Butonul ăsta e pentru excepții: scoate
   * vizita din încasări și o numără la neprezentările clientului.
   *
   * Clientul nu e notificat. E o însemnare internă a salonului, nu o acuzație
   * trimisă pe telefonul omului.
   */
  async function marcheazaPrezenta(id: string, aVenit: boolean) {
    const nou: StatusProg = aVenit ? "finalizat" : "neprezentat";
    const { error } = await supabase.from("programari").update({ status: nou }).eq("id", id);
    if (error) { salveaza("Nu am putut salva. Încearcă din nou."); return; }
    setProgramari(p => p.map(pr => pr.id === id ? { ...pr, status: nou } : pr));
    salveaza(aVenit ? "Marcat ca vizită încheiată." : "Marcat ca neprezentare — iese din încasări.");
  }

  /** Data scrisă pe înțelesul omului, pentru notificări: „marți, 3 septembrie". */
  function dataLunga(dataIso: string) {
    const e = etichetaZi(dataIso);
    return e.prefix ? `${e.prefix.toLowerCase()}, ${e.rest.toLowerCase()}` : e.rest.toLowerCase();
  }

  /**
   * Salonul anulează o programare confirmată.
   *
   * Motivul e obligatoriu întotdeauna, spre deosebire de client, unde e cerut
   * doar sub 24 de ore. Când salonul anulează, omul își face alt plan sau
   * ratează o zi liberă — merită să știe de ce, indiferent cu cât timp înainte.
   *
   * `anulat_de: "salon"` scoate rândul din numărătoarea anulărilor târzii ale
   * clientului. Fără el, motivul scris de salon ar fi fost pus în cârca omului.
   */
  async function anuleazaDeSalon(id: string, motiv: string) {
    const prog = programari.find(p => p.id === id);
    const { data: scrise, error } = await supabase.from("programari")
      .update({ status: "anulat", motiv_anulare: motiv.trim(), anulat_de: "salon" })
      .eq("id", id).select("id");
    if (error || !scrise?.length) { salveaza("Nu am putut anula. Încearcă din nou."); return false; }

    setProgramari(p => p.map(pr => pr.id === id ? { ...pr, status: "anulat" as StatusProg, motivAnulare: motiv.trim() } : pr));
    if (prog?.user_id && prog.esteApp) {
      await supabase.from("notificari").insert({
        user_id: prog.user_id,
        tip: "anulat",
        mesaj: `❌ ${numeSalon} a anulat programarea ta de ${dataLunga(prog.data)}, ora ${prog.ora} — ${prog.serviciu}. Motiv: ${motiv.trim()}`,
        programare_id: id,
      });
    }
    salveaza("Programare anulată — clientul a fost anunțat.");
    return true;
  }

  /**
   * Mutarea unei programări confirmate.
   *
   * Ora nouă e definitivă, iar clientul e anunțat (varianta A, decisă cu
   * utilizatorul): salonul sună omul oricum înainte să miște ceva, iar o
   * propunere de confirmat ar lăsa ora blocată până răspunde cineva.
   * În schimb, clientul poate anula liber după mutare, fără motiv.
   */
  async function mutaProgramare(id: string, dataNoua: string, oraNoua: string, groomerNou: string | null) {
    const prog = programari.find(p => p.id === id);
    if (!prog) return false;
    const { data: scrise, error } = await supabase.from("programari")
      // `mutat_la` e ce dă clientului dreptul să anuleze fără motiv după ce
      // salonul i-a schimbat ora — altfel ar fi obligat să se justifice pentru
      // o mutare pe care n-a făcut-o el.
      .update({
        data: dataNoua, ora: oraNoua, groomer: groomerNou,
        membru_uid: groomerNou ? (echipa.find(g => g.nume === groomerNou)?.uid || null) : null,
        mutat_la: new Date().toISOString(),
      })
      .eq("id", id).select("id");
    if (error || !scrise?.length) { salveaza("Nu am putut muta programarea."); return false; }

    const uidNou = groomerNou ? (echipa.find(g => g.nume === groomerNou)?.uid || null) : null;
    setProgramari(p => p.map(pr => pr.id === id ? { ...pr, data: dataNoua, ora: oraNoua, groomer: groomerNou, membruUid: uidNou } : pr));
    if (prog.user_id && prog.esteApp) {
      const schimbaSpecialist = groomerNou && groomerNou !== prog.groomer ? ` Te preia ${groomerNou}.` : "";
      await supabase.from("notificari").insert({
        user_id: prog.user_id,
        tip: "mutat",
        mesaj: `📅 ${numeSalon} a mutat programarea ta „${prog.serviciu}" din ${dataLunga(prog.data)}, ora ${prog.ora}, în ${dataLunga(dataNoua)}, ora ${oraNoua}.${schimbaSpecialist} Dacă nu îți convine, o poți anula din contul tău.`,
        programare_id: id,
      });
    }
    salveaza("Programare mutată — clientul a fost anunțat.");
    return true;
  }

  /**
   * Corectarea serviciului, prețului sau duratei — pentru greșeli de scriere.
   * Nu e o schimbare de plan, deci clientul nu primește notificare decât dacă
   * se schimbă prețul: acolo e vorba de banii lui.
   */
  async function corecteazaProgramare(id: string, patch: { serviciu: string; pret: number; durata: number }) {
    const prog = programari.find(p => p.id === id);
    const { data: scrise, error } = await supabase.from("programari")
      .update(patch).eq("id", id).select("id");
    if (error || !scrise?.length) { salveaza("Nu am putut salva corectura."); return false; }

    setProgramari(p => p.map(pr => pr.id === id ? { ...pr, ...patch } : pr));
    if (prog?.user_id && prog.esteApp && prog.pret !== patch.pret) {
      await supabase.from("notificari").insert({
        user_id: prog.user_id,
        tip: "modificat",
        mesaj: `✏️ ${numeSalon} a actualizat programarea ta de ${dataLunga(prog.data)}: ${patch.serviciu} — ${patch.pret} RON.`,
        programare_id: id,
      });
    }
    salveaza("Programare actualizată.");
    return true;
  }

  /**
   * Refuzul unei cereri neconfirmate.
   *
   * Motivul e **opțional**, spre deosebire de anularea unei programări
   * confirmate: o cerere n-a fost niciodată o promisiune, iar un salon care
   * refuză zece cereri pe zi n-are timp să scrie zece explicații. Când există
   * totuși un motiv, ajunge la client — costă un clic și îl scutește de
   * întrebări.
   *
   * Cardul nu mai dispare de pe ecran, cum se întâmpla înainte: rămâne în
   * lista de anulări a zilei, marcat „Ai refuzat cererea".
   */
  async function respinge(id: string, motiv?: string) {
    const m = (motiv || "").trim();
    const { error } = await supabase.from("programari")
      .update({ status: "anulat", anulat_de: "salon_refuz", motiv_anulare: m || null })
      .eq("id", id);
    if (error) { salveaza("Nu am putut refuza cererea. Încearcă din nou."); console.error("Reject error:", error); return; }
    const prog = programari.find(p => p.id === id);
    setProgramari(p => p.map(pr => pr.id === id
      ? { ...pr, status: "anulat" as StatusProg, anulatDe: "salon_refuz", motivAnulare: m || null }
      : pr));
    if (prog?.user_id && prog.esteApp) {
      await supabase.from("notificari").insert({
        user_id: prog.user_id,
        tip: "anulat",
        mesaj: `❌ ${numeSalon} nu a putut prelua cererea ta — ${prog.serviciu}${m ? `. Motiv: ${m}` : ""}`,
        programare_id: id,
      });
    }
    salveaza("Cerere refuzată — clientul a fost anunțat.");
  }
  function salveaza(msg: string) { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); }

  function deschideNotificare(n: Notificare) {
    if (!n.citit) {
      setNotificari(nots => nots.map(x => x.id === n.id ? { ...x, citit: true } : x));
      supabase.from("notificari").update({ citit: true }).eq("id", n.id).then(({ error }) => {
        if (error) setNotificari(nots => nots.map(x => x.id === n.id ? { ...x, citit: false } : x));
      });
    }
    /*
     * Fiecare notificare duce undeva.
     *
     * Jumătate dintre ele erau moarte la clic: aflai că un client a anulat sau
     * că ți-a expirat trialul, apăsai, și nu se întâmpla nimic. O notificare pe
     * care o poți apăsa și care nu face nimic e mai rea decât una simplă — pare
     * stricată.
     */
    if (n.tip === "programare_noua" || n.tip === "anulat") {
      const prog = n.programare_id ? programari.find(p => p.id === n.programare_id) : null;
      if (prog) { setAgendaZi(prog.data); setHighlightProgramare(prog.id); }
      setTab("agenda");
    } else if (n.tip === "recenzie_noua") {
      setTab("functii-ai");
      setAiTab("recenzii");
    } else if (n.tip === "trial_expirat") {
      // Notificarea spune „alege un plan" — deci te duce acolo unde alegi.
      setTab("abonament");
    }
  }

  async function genereazaRaportExcel() {
    const { start, end, label } = intervalPerioada(perioadaStat, customStart, customEnd);
    const inRange = (d: string) => d >= start && d <= end;
    const esteVenit = (p: ProgramareSalon) => eIncasare(p.status);
    const progRange = programari.filter(p => inRange(p.data) && !ePauza(p.sursa));
    const venitRange = progRange.filter(esteVenit);
    if (progRange.length === 0) { salveaza("Nicio programare în perioada aleasă"); return; }
    setExportLoading(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const numeSalon = salonData?.nume || profilSalon.numeSalon || "Salon";

      const totalVenit = venitRange.reduce((s, p) => s + (p.pret || 0), 0);
      const clientiUnici = new Set(progRange.map(p => p.user_id).filter(Boolean)).size;
      const sumar = [
        ["Raport CalyHub", ""],
        ["Salon", numeSalon],
        ["Perioadă", label],
        ["Interval", `${start} → ${end}`],
        ["Generat la", new Date().toLocaleString("ro-RO")],
        ["", ""],
        ["Total încasări (RON)", totalVenit],
        ["Total programări", progRange.length],
        ["Clienți unici", clientiUnici],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sumar), "Sumar");

      if (raportSel.venituri) {
        const perZi: Record<string, { venit: number; nr: number }> = {};
        venitRange.forEach(p => { (perZi[p.data] ||= { venit: 0, nr: 0 }); perZi[p.data].venit += p.pret || 0; perZi[p.data].nr++; });
        const rows = Object.entries(perZi).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([data, v]) => ({ Data: data, "Încasări (RON)": v.venit, "Programări": v.nr }));
        rows.push({ Data: "TOTAL", "Încasări (RON)": totalVenit, "Programări": venitRange.length });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Venituri");
      }

      if (raportSel.programari) {
        const rows = progRange.slice().sort((a, b) => a.data < b.data ? -1 : a.data > b.data ? 1 : (a.ora < b.ora ? -1 : 1)).map(p => ({
          Data: p.data, Ora: p.ora, Client: p.client, ...(areAnimale ? { Animal: p.animal } : {}), Serviciu: p.serviciu,
          "Preț (RON)": p.pret || 0, Status: p.status,
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Programări");
      }

      if (raportSel.clienti) {
        const perClient: Record<string, { nume: string; nr: number; total: number }> = {};
        progRange.forEach(p => {
          const key = p.user_id || p.client;
          (perClient[key] ||= { nume: p.client, nr: 0, total: 0 });
          perClient[key].nr++;
          if (esteVenit(p)) perClient[key].total += p.pret || 0;
        });
        const rows = Object.values(perClient).sort((a, b) => b.total - a.total).map(c => ({ Client: c.nume, "Programări": c.nr, "Total cheltuit (RON)": c.total }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Clienți");
      }

      if (raportSel.servicii) {
        const servCount: Record<string, { nr: number; venit: number }> = {};
        venitRange.forEach(p => { if (p.serviciu) { (servCount[p.serviciu] ||= { nr: 0, venit: 0 }); servCount[p.serviciu].nr++; servCount[p.serviciu].venit += p.pret || 0; } });
        const totalNr = Object.values(servCount).reduce((a, b) => a + b.nr, 0);
        const rows = Object.entries(servCount).sort((a, b) => b[1].nr - a[1].nr).map(([nume, v]) => ({
          Serviciu: nume, "Nr.": v.nr, "Procent (%)": totalNr > 0 ? Math.round((v.nr / totalNr) * 100) : 0, "Venit (RON)": v.venit,
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Servicii");
      }

      if (raportSel.talie && areAnimale) {
        const t = { mica: 0, medie: 0, mare: 0, necunoscuta: 0 };
        venitRange.forEach(p => { if (p.talie === "mica") t.mica++; else if (p.talie === "medie") t.medie++; else if (p.talie === "mare") t.mare++; else t.necunoscuta++; });
        const tot = t.mica + t.medie + t.mare + t.necunoscuta;
        const pct = (n: number) => tot > 0 ? Math.round((n / tot) * 100) : 0;
        const rows = [
          { Talie: "Mică", "Nr.": t.mica, "Procent (%)": pct(t.mica) },
          { Talie: "Medie", "Nr.": t.medie, "Procent (%)": pct(t.medie) },
          { Talie: "Mare", "Nr.": t.mare, "Procent (%)": pct(t.mare) },
          { Talie: "Necunoscută", "Nr.": t.necunoscuta, "Procent (%)": pct(t.necunoscuta) },
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Talie");
      }

      const slug = numeSalon.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      XLSX.writeFile(wb, `raport-${slug}-${start}_${end}.xlsx`);
      setRaportDeschis(false);
    } catch (e) {
      console.error(e);
      salveaza("Eroare la generarea raportului");
    } finally {
      setExportLoading(false);
    }
  }

  async function toggleBlocClient(clientUserId: string) {
    if (!salonData?.id || !clientUserId) return;
    const blocat = clientiBlocati.includes(clientUserId);
    const noua = blocat ? clientiBlocati.filter(id => id !== clientUserId) : [...clientiBlocati, clientUserId];
    const { error } = await supabase.from("saloane").update({ clienti_blocati: noua }).eq("id", salonData.id);
    if (error) { salveaza("Eroare la salvare"); console.error(error); return; }
    setClientiBlocati(noua);
    salveaza(blocat ? "Client deblocat" : "Client blocat — nu mai poate rezerva");
  }

  async function incarcaClientiRisc(salonId: string) {
    setClientiRiscLoading(true);
    setClientiRiscEroare(null);
    try {
      // 1. Fetch all finalized appointments for this salon
      const { data: prog } = await supabase
        .from("programari")
        .select("id, user_id, data, serviciu, animal_id")
        .eq("salon_id", salonId)
        .eq("status", "finalizat")
        .not("user_id", "is", null)
        .neq("user_id", userId)
        .order("data", { ascending: true });

      if (!prog || prog.length === 0) { setClientiRisc([]); return; }

      // 2. Group by user_id, compute last visit + average interval
      const byUser: Record<string, { dates: string[]; servicii: string[]; animalIds: string[]; lastProgId: string }> = {};
      for (const p of prog) {
        if (!p.user_id) continue;
        if (!byUser[p.user_id]) byUser[p.user_id] = { dates: [], servicii: [], animalIds: [], lastProgId: p.id };
        byUser[p.user_id].dates.push(p.data);
        byUser[p.user_id].lastProgId = p.id; // ordered ASC → ultimul suprascrie
        if (p.serviciu) byUser[p.user_id].servicii.push(p.serviciu);
        if (p.animal_id && !byUser[p.user_id].animalIds.includes(p.animal_id)) byUser[p.user_id].animalIds.push(p.animal_id);
      }

      const today = new Date();
      const atRiskUserIds: string[] = [];
      const atRiskMeta: Record<string, { ultimaVizita: string; zileAbsenta: number; intervalMediu: number; ultimulServiciu: string; animalId: string | null; lastProgId: string }> = {};

      for (const [userId, { dates, servicii, animalIds }] of Object.entries(byUser)) {
        if (dates.length < 2) continue; // need at least 2 visits to compute interval
        const sorted = [...dates].sort();
        const lastDate = new Date(sorted[sorted.length - 1]);
        const zileAbsenta = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);

        // average interval between consecutive visits
        let totalInterval = 0;
        for (let i = 1; i < sorted.length; i++) {
          const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
          totalInterval += diff;
        }
        const intervalMediu = Math.round(totalInterval / (sorted.length - 1));

        if (intervalMediu > 0 && zileAbsenta > intervalMediu * 1.2) {
          atRiskUserIds.push(userId);
          atRiskMeta[userId] = {
            ultimaVizita: sorted[sorted.length - 1],
            zileAbsenta,
            intervalMediu,
            ultimulServiciu: servicii[servicii.length - 1] || "grooming",
            animalId: animalIds[0] || null,
            lastProgId: byUser[userId].lastProgId,
          };
        }
      }

      if (atRiskUserIds.length === 0) { setClientiRisc([]); return; }

      // 3. Fetch profiles + animals for at-risk users
      const allAnimalIds = [...new Set(Object.values(atRiskMeta).map(m => m.animalId).filter(Boolean) as string[])];
      const [{ data: profiles }, { data: animals }] = await Promise.all([
        supabase.from("profiluri").select("id, nume, telefon").in("id", atRiskUserIds),
        allAnimalIds.length > 0 ? supabase.from("animale").select("id, nume, rasa").in("id", allAnimalIds) : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      const animalMap = Object.fromEntries((animals || []).map((a: any) => [a.id, a]));

      // 4. Build ClientRisc[] payload
      const clientiPayload = atRiskUserIds.slice(0, 10).map(userId => {
        const meta = atRiskMeta[userId];
        const profil = profileMap[userId];
        const animal = meta.animalId ? animalMap[meta.animalId] : null;
        return {
          userId,
          numeClient: profil?.nume || "Client",
          telefon: profil?.telefon || null,
          numeAnimal: animal?.nume || null,
          rasaAnimal: animal?.rasa || null,
          ultimaVizita: meta.ultimaVizita,
          zileAbsenta: meta.zileAbsenta,
          intervalMediu: meta.intervalMediu,
          ultimulServiciu: meta.ultimulServiciu,
          ultimaProgramareId: meta.lastProgId,
        };
      });

      // 5. POST to API route to generate AI messages (optionally with a reactivation discount)
      const cod = reducereRisc > 0 ? `REVIN${reducereRisc}` : "";
      const res = await fetch("/api/ai/clienti-risc", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-domeniu": areAnimale ? "grooming" : "infrumusetare" },
        body: JSON.stringify({ clienti: clientiPayload, reducere: reducereRisc, cod }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare server");
      const rezultat = json.clienti || [];
      const acum = new Date().toISOString();
      setClientiRisc(rezultat);
      setUltimaAnalizaRisc(acum);
      setMesajeTrimise({}); // analiză nouă → resetăm starea „trimis"
      // Sursa de adevar: Supabase (cross-device). localStorage ramane fallback rapid.
      await supabase.from("clienti_risc_analiza").upsert(
        { salon_id: salonId, data: acum, clienti: rezultat, trimise: [], updated_at: acum },
        { onConflict: "salon_id" }
      );
      try { localStorage.setItem(`calyhub_clienti_risc_${salonId}`, JSON.stringify({ data: acum, clienti: rezultat, trimise: [] })); } catch {}
    } catch (e: any) {
      setClientiRiscEroare(e.message || "Eroare la încărcarea datelor");
    } finally {
      setClientiRiscLoading(false);
    }
  }

  // Trimite mesajul de reactivare generat de AI direct în aplicația clientului (notificare in-app, fără cost SMS)
  async function trimiteMesajReactivare(client: typeof clientiRisc[number]) {
    if (!client.userId || mesajeTrimise[client.userId] || mesajTrimiteLoading[client.userId]) return;
    setMesajTrimiteLoading(prev => ({ ...prev, [client.userId]: true }));
    const { error } = await supabase.from("notificari").insert({
      user_id: client.userId,
      tip: "mesaj_salon",
      mesaj: `💬 ${numeSalon}: ${client.mesajAI}`,
      programare_id: (client as any).ultimaProgramareId || null,
    });
    setMesajTrimiteLoading(prev => ({ ...prev, [client.userId]: false }));
    if (error) {
      console.error("Trimitere mesaj reactivare - eroare:", error);
      setClientiRiscEroare("Nu am putut trimite mesajul. Încearcă din nou.");
      return;
    }
    const next = { ...mesajeTrimise, [client.userId]: true };
    setMesajeTrimise(next);
    // Persistăm starea „trimis" în Supabase (cross-device) + localStorage fallback
    if (salonData?.id) {
      const trimise = Object.keys(next);
      await supabase.from("clienti_risc_analiza").upsert(
        { salon_id: salonData.id, data: ultimaAnalizaRisc, clienti: clientiRisc, trimise, updated_at: new Date().toISOString() },
        { onConflict: "salon_id" }
      );
      try { localStorage.setItem(`calyhub_clienti_risc_${salonData.id}`, JSON.stringify({ data: ultimaAnalizaRisc, clienti: clientiRisc, trimise })); } catch {}
    }
  }

  // ===== CONSULTANT AI =====
  // Genereaza (sau regenereaza) un raport premium. Se cache-uieste in Supabase per luna.
  async function genereazaRaport(tip: string, forta = false) {
    const salonId = salonData?.id;
    if (!salonId || raportLoading) return;
    // daca exista deja in cache si nu fortam regenerarea, doar il deschidem
    if (!forta && rapoarte[tip]) { setConsRaportDeschis(tip); return; }
    setRaportLoading(tip);
    setConsRaportDeschis(tip);
    setRaportEroare(null);
    const snapshot = computeSnapshot(programari, recenziiSalon, numeSalon);
    const perioada = new Date().toISOString().slice(0, 7);
    try {
      const res = await fetch("/api/ai/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip, snapshot, salonNume: numeSalon, domeniu: domeniuSalon }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare server");
      const created_at = new Date().toISOString();
      setRapoarte(prev => ({ ...prev, [tip]: { continut: json.raspuns, created_at } }));
      await supabase.from("consultant_rapoarte").upsert(
        { salon_id: salonId, tip, perioada, continut: json.raspuns, created_at },
        { onConflict: "salon_id,tip,perioada" }
      );
    } catch (e: any) {
      setRaportEroare(e.message || "Nu am putut genera raportul. Încearcă din nou.");
    } finally {
      setRaportLoading(null);
    }
  }

  // Pune o intrebare punctuala (plafon 5/luna). Single-turn, fara memorie de chat.
  async function puneIntrebare() {
    const intrebare = consultantInput.trim();
    const salonId = salonData?.id;
    if (!intrebare || !salonId || intrebareLoading || intrebariLuna >= 5) return;
    setConsultantInput("");
    setIntrebareLoading(true);
    setRaportEroare(null);
    // Increment atomic LUNAR in Supabase (contor comun pe toate dispozitivele)
    const { data: total } = await supabase.rpc("consultant_intreaba", { p_salon_id: salonId });
    if (typeof total === "number") setIntrebariLuna(total);
    const snapshot = computeSnapshot(programari, recenziiSalon, numeSalon);
    try {
      const res = await fetch("/api/ai/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intrebare, snapshot, salonNume: numeSalon, domeniu: domeniuSalon }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare server");
      setQaList(prev => [...prev, { q: intrebare, a: json.raspuns, created_at: new Date().toISOString() }]);
    } catch (e: any) {
      setQaList(prev => [...prev, { q: intrebare, a: `Nu am putut genera răspunsul: ${e.message || "eroare necunoscuta"}`, created_at: new Date().toISOString() }]);
    } finally {
      setIntrebareLoading(false);
    }
  }

  // ===== FIȘĂ ÎNGRIJIRE POST-GROOMING =====
  function setFisa(id: string, patch: Partial<{ draft: string; generand: boolean; trimitand: boolean; trimis: boolean; eroare: string | null }>) {
    setFisaState(prev => {
      const baza = prev[id] || { draft: "", generand: false, trimitand: false, trimis: false, eroare: null };
      return { ...prev, [id]: { ...baza, ...patch } };
    });
  }

  /**
   * Fișa se scrie o singură dată per programare.
   *
   * Fără limita asta, „Regenerează" ar putea fi apăsat la nesfârșit: fiecare
   * apăsare costă circa un ban, iar zece apăsări pe fiecare programare ar face
   * din 5 lei pe lună, 50. Textul rămâne editabil de mână după generare.
   */
  async function genereazaFisa(p: ProgramareSalon) {
    // Deja scrisă pentru programarea asta — nu mai plătim încă o generare.
    if (fisaState[p.id]?.draft) return;
    setFisa(p.id, { generand: true, eroare: null });
    try {
      const res = await fetch("/api/ai/fisa-ingrijire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animal: p.animalNume, rasa: p.rasa, specie: p.specie, serviciu: p.serviciu, salonNume: numeSalon, client: p.client, domeniu: domeniuSalon }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare server");
      setFisa(p.id, { draft: json.fisa || "", generand: false });
    } catch (e: any) {
      setFisa(p.id, { generand: false, eroare: e.message || "Nu am putut genera fișa" });
    }
  }

  async function trimiteFisa(p: ProgramareSalon) {
    const st = fisaState[p.id];
    if (!st?.draft.trim() || !p.user_id || st.trimitand || st.trimis) return;
    setFisa(p.id, { trimitand: true, eroare: null });
    const { error } = await supabase.from("notificari").insert({
      user_id: p.user_id,
      tip: "fisa_ingrijire",
      mesaj: `📋 ${numeSalon}: ${st.draft.trim()}`,
      programare_id: p.id,
    });
    if (error) {
      console.error("Trimitere fișă îngrijire - eroare:", error);
      setFisa(p.id, { trimitand: false, eroare: "Nu am putut trimite fișa. Încearcă din nou." });
      return;
    }
    setFisa(p.id, { trimitand: false, trimis: true });
  }

  // Ore trecute de la ultima analiză (null dacă nu există)
  const oreDeLaAnalizaRisc = ultimaAnalizaRisc
    ? Math.floor((Date.now() - new Date(ultimaAnalizaRisc).getTime()) / 3600000)
    : null;
  const analizaRiscDisponibila = oreDeLaAnalizaRisc === null || oreDeLaAnalizaRisc >= 24;

  // Încarcă analiza salvată (cache 24 ore) — sursa: Supabase (cross-device)
  useEffect(() => {
    if (!salonData?.id) return;
    let activ = true;
    const aplica = (data: string, clienti: any[], trimise: string[]) => {
      setUltimaAnalizaRisc(data);
      setClientiRisc(clienti);
      setMesajeTrimise(Object.fromEntries(trimise.map((uid: string) => [uid, true])));
    };
    // fallback imediat din localStorage (evita flash) pana raspunde DB-ul
    try {
      const raw = localStorage.getItem(`calyhub_clienti_risc_${salonData.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data && Array.isArray(parsed?.clienti)) {
          aplica(parsed.data, parsed.clienti, Array.isArray(parsed.trimise) ? parsed.trimise : []);
        }
      }
    } catch {}
    (async () => {
      const { data } = await supabase
        .from("clienti_risc_analiza")
        .select("data, clienti, trimise")
        .eq("salon_id", salonData.id)
        .maybeSingle();
      if (!activ || !data) return;
      if (data.data && Array.isArray(data.clienti)) {
        aplica(data.data, data.clienti, Array.isArray(data.trimise) ? data.trimise : []);
      }
    })();
    return () => { activ = false; };
  }, [salonData?.id]);

  function setRaspunsState(id: string, patch: Partial<{ editare: boolean; draft: string; generand: boolean; trimitand: boolean; eroare: string | null }>) {
    setRaspunsAiState(prev => {
      const curent = prev[id] || { editare: false, draft: "", generand: false, trimitand: false, eroare: null };
      return { ...prev, [id]: { ...curent, ...patch } };
    });
  }

  async function genereazaRaspunsAi(r: typeof recenziiSalon[number]) {
    setRaspunsState(r.id, { editare: true, generand: true, eroare: null });
    try {
      const res = await fetch("/api/ai/raspuns-recenzie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonNume: salonData?.nume,
          clientNume: r.nume,
          rating: r.rating,
          text: r.text,
          animal: r.animal,
          // Fără verticală, răspunsul ar vorbi despre blană la un coafor.
          domeniu: areAnimale ? "grooming" : "infrumusetare",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Eroare la generare");
      setRaspunsState(r.id, { generand: false, draft: json.raspuns });
    } catch (err: any) {
      setRaspunsState(r.id, { generand: false, eroare: err?.message || "Nu am putut genera răspunsul. Încearcă din nou." });
    }
  }

  async function trimiteRaspunsRecenzie(r: typeof recenziiSalon[number]) {
    const draft = (raspunsAiState[r.id]?.draft || "").trim();
    if (!draft) return;
    setRaspunsState(r.id, { trimitand: true, eroare: null });
    const acum = new Date().toISOString();
    const { data: updated, error } = await supabase.from("recenzii").update({ raspuns_salon: draft, raspuns_at: acum }).eq("id", r.id).select("id");
    if (error || !updated || updated.length === 0) {
      if (error) console.error("Salvare răspuns recenzie - eroare:", error);
      setRaspunsState(r.id, { trimitand: false, eroare: "Nu am putut salva răspunsul (verifică permisiunile bazei de date). Încearcă din nou." });
      return;
    }
    setRecenziiSalon(prev => prev.map(x => x.id === r.id ? { ...x, raspuns_salon: draft, raspuns_at: acum } : x));
    setRaspunsState(r.id, { trimitand: false, editare: false, draft: "" });
    if (r.user_id) {
      const { error: notifErr } = await supabase.from("notificari").insert({
        user_id: r.user_id,
        tip: "raspuns_recenzie",
        mesaj: `⭐ ${numeSalon} a răspuns la recenzia ta`,
        programare_id: r.programare_id || null,
      });
      if (notifErr) console.error("Notificare răspuns recenzie - eroare:", notifErr);
    }
    salveaza("Răspuns trimis");
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
      .select("id, ora, durata, status, sursa, serviciu, nume_client_extern, groomer")
      .eq("salon_id", salonId)
      .eq("data", zi)
      .neq("status", "anulat");
    setSloturiZi((data as SlotProgramare[]) || []);
  }

  useEffect(() => {
    if (salonData?.id && tab === "program") loadSloturiZi(salonData.id, zilaSelectata);
  }, [salonData?.id, zilaSelectata, tab]);

  useEffect(() => {
    if (!salonData?.id) return;
    (async () => {
      const { data } = await supabase
        .from("recenzii")
        .select("id, user_id, programare_id, rating, text, created_at, raspuns_salon, raspuns_at, autor_anonim")
        .eq("salon_id", salonData.id)
        .order("created_at", { ascending: false });
      if (!data || data.length === 0) { setRatingSalon({ medie: 0, nr: 0 }); setRecenziiSalon([]); return; }
      const suma = (data as any[]).reduce((s, r) => s + r.rating, 0);
      setRatingSalon({ medie: suma / data.length, nr: data.length });
      const userIds = Array.from(new Set((data as any[]).map(r => r.user_id)));
      const [{ data: profile }, { data: programari }] = await Promise.all([
        supabase.from("profiluri").select("id, nume, avatar_url").in("id", userIds),
        supabase.from("programari").select("user_id, animal_id, data").eq("salon_id", salonData.id).eq("status", "finalizat").in("user_id", userIds).order("data", { ascending: false }),
      ]);
      const pmap = new Map((profile || []).map((p: any) => [p.id, p]));
      const ultimAnimalPerUser = new Map<string, string>();
      for (const p of (programari || []) as any[]) {
        if (!ultimAnimalPerUser.has(p.user_id) && p.animal_id) ultimAnimalPerUser.set(p.user_id, p.animal_id);
      }
      const animalIds = Array.from(new Set(Array.from(ultimAnimalPerUser.values())));
      const { data: animale } = animalIds.length > 0
        ? await supabase.from("animale").select("id, nume, rasa").in("id", animalIds)
        : { data: [] as any[] };
      const amap = new Map((animale || []).map((a: any) => [a.id, a]));
      setRecenziiSalon((data as any[]).map(r => {
        const animalId = ultimAnimalPerUser.get(r.user_id);
        const animal = animalId ? amap.get(animalId) : null;
        return {
          id: r.id, user_id: r.user_id, programare_id: r.programare_id || null, rating: r.rating, text: r.text, created_at: r.created_at,
          // Autorul și-a închis contul: recenzia rămâne, numele și poza nu.
          nume: r.autor_anonim ? "Client CalyHub" : (pmap.get(r.user_id)?.nume || "Client CalyHub"),
          avatar_url: r.autor_anonim ? null : (pmap.get(r.user_id)?.avatar_url || null),
          raspuns_salon: r.raspuns_salon || null,
          raspuns_at: r.raspuns_at || null,
          animal: animal ? { nume: animal.nume, rasa: animal.rasa || null } : null,
        };
      }));
    })();
  }, [salonData?.id]);

  async function blocheazaSlot() {
    if (!salonData?.id || !userId || !modalBlocare) return;
    const sursa = tipBlocare;
    const implicit = tipBlocare === "blocaj" ? "Pauză / Indisponibil" : tipBlocare === "walkin" ? "Walk-in" : "Programare telefonică";
    // Serviciul ales din listă înlocuiește eticheta generică — apoi statisticile
    // pe servicii îl numără la fel ca pe o rezervare din aplicație.
    const serviciu = tipBlocare !== "blocaj" && serviciuBlocare ? serviciuBlocare : implicit;
    const pretNum = tipBlocare !== "blocaj" ? Number(pretBlocare) || 0 : 0;
    const { data: nou, error } = await supabase.from("programari").insert({
      user_id: userId,
      salon_id: salonData.id,
      serviciu,
      pret: pretNum,
      data: zilaSelectata,
      ora: modalBlocare.slot,
      durata: durataBlocare,
      status: "confirmat",
      sursa,
      // Numele se salvează doar dacă salonul a cerut să ținem minte clientul.
      // Fără el, rândul rămâne o oră blocată, fără nicio persoană în spate.
      nume_client_extern: tipBlocare !== "blocaj" && tineMinteClient ? (numeBlocare.trim() || null) : null,
      groomer: groomerBlocare === "toti" ? null : groomerBlocare,
      membru_uid: groomerBlocare === "toti" ? null : (echipa.find(g => g.nume === groomerBlocare)?.uid || null),
    }).select("id, ora, durata, status, sursa, serviciu, nume_client_extern, groomer").single();
    if (error || !nou) { salveaza("Eroare la blocare"); console.error(error); return; }
    setSloturiZi(s => [...s, nou as SlotProgramare]);
    setModalBlocare(null);
    setNumeBlocare("");
    setServiciuBlocare("");
    setPretBlocare("");
    setTineMinteClient(false);
    setGroomerBlocare("toti");
    salveaza(tipBlocare === "blocaj" ? "Oră blocată" : pretNum > 0 ? "Programare adăugată" : "Programare adăugată — fără preț");
  }

  async function deblocheazaSlot(id: string) {
    const { error } = await supabase.from("programari").delete().eq("id", id);
    if (error) { salveaza("Eroare la deblocare"); return; }
    setSloturiZi(s => s.filter(x => x.id !== id));
    salveaza("Slot deblocat");
  }

  async function uploadAvatar(file: File) {
    if (!userId) return;
    const problema = verificaPoza(file);
    if (problema) { salveaza(problema); return; }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { salveaza("Eroare la upload!"); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    const { error: eSalvare } = await supabase.from("profiluri").update({ avatar_url: url }).eq("id", userId);
    setUploadingAvatar(false);
    if (eSalvare) { salveaza("Poza s-a încărcat, dar nu am putut-o salva în cont. Încearcă din nou."); return; }
    setAvatarUrl(url);
    salveaza("Avatar actualizat!");
  }

  async function stergeAvatar() {
    if (!userId) return;
    const { error } = await supabase.from("profiluri").update({ avatar_url: null }).eq("id", userId);
    if (error) { salveaza("Nu am putut șterge poza. Încearcă din nou."); return; }
    setAvatarUrl(null);
    salveaza("Avatar șters!");
  }

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCropSrc(reader.result as string); setCropOpen(true); setCropZoom(1); setCropState({ x: 0, y: 0 }); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleCropSave() {
    if (!cropSrc || !croppedAreaPixels) return;
    const img = new window.Image();
    img.src = cropSrc;
    await new Promise(r => { img.onload = r; });
    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
    canvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
      setCropOpen(false);
      setCropSrc(null);
      await uploadCover(file);
    }, "image/jpeg", 0.92);
  }

  async function uploadCover(file: File) {
    if (!salonData?.id) return;
    const problema = verificaPoza(file);
    if (problema) { salveaza(problema); return; }
    setUploadingCover(true);
    const ext = file.name.split(".").pop();
    const path = `${salonData.user_id}/cover.${ext}`;
    const { error: upErr } = await supabase.storage.from("saloane").upload(path, file, { upsert: true });
    if (upErr) { salveaza("Eroare la upload!"); setUploadingCover(false); return; }
    const { data: urlData } = supabase.storage.from("saloane").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    const { error: eSalvare } = await supabase.from("saloane").update({ poza_url: url }).eq("id", salonData.id);
    setUploadingCover(false);
    if (eSalvare) { salveaza("Poza s-a încărcat, dar nu am putut-o salva. Încearcă din nou."); return; }
    setPozaUrl(url);
    setSalonData((s: any) => ({ ...s, poza_url: url }));
    salveaza("Poza de prezentare actualizată!");
  }

  async function uploadGalerie(files: FileList) {
    if (!salonData?.id) return;
    // La galerie se aleg mai multe deodată: verificăm tot lotul înainte, ca să
    // nu urcăm jumătate și să ne oprim la mijloc.
    for (let i = 0; i < files.length; i++) {
      const problema = verificaPoza(files[i]);
      if (problema) { salveaza(`${files[i].name}: ${problema}`); return; }
    }
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
    const { error: eSalvare } = await supabase.from("saloane").update({ galerie: updated }).eq("id", salonData.id);
    setUploadingGalerie(false);
    if (eSalvare) { salveaza("Pozele s-au încărcat, dar nu am putut salva galeria. Încearcă din nou."); return; }
    setGalerie(updated);
    if (newUrls.length < files.length) {
      salveaza(`${newUrls.length} din ${files.length} poze au fost adăugate — restul n-au putut fi încărcate.`);
      return;
    }
    salveaza(`${newUrls.length} ${newUrls.length === 1 ? "poză adăugată" : "poze adăugate"} în galerie!`);
  }

  async function stergeGalerie(url: string) {
    if (!confirm("Ștergi poza din galerie?")) return;
    const updated = galerie.filter(u => u !== url);
    const { error } = await supabase.from("saloane").update({ galerie: updated }).eq("id", salonData.id);
    if (error) { salveaza("Nu am putut șterge poza. Încearcă din nou."); return; }
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
                <LogoSemn size={40} tema={theme} priority />
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
                  {/* Pe telefon rămâne doar săgeata, ca să încapă titlul: „← Înapoi"
                      singur nu spune unde ești. */}
                  <button onClick={() => setTab("statistici")} aria-label="Înapoi la statistici"
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "5px 11px" : "5px 12px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, fontSize: 13, fontWeight: 700, color: c.muted, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                    {isMobile ? "←" : "← Înapoi"}
                  </button>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{TAB_LABELS[tab]}</div>
                </>
              )}
            </div>

            {/* Center: main tab buttons (only when not in sub-tab) */}
            {!isSubTab && (
              <div style={{ display: "flex", alignItems: "center", gap: 2, flex: "0 1 auto", overflow: "hidden" }}>
                {([
                  { t: "statistici" as const, Icon: BarChart3, label: "Statistici" },
                  { t: "agenda" as const, Icon: CalendarDays, label: "Agenda" },
                  { t: "program" as const, Icon: Clock, label: "Program" },
                  { t: "notificari" as const, Icon: Bell, label: `Notificări${necitite > 0 ? ` (${necitite})` : ""}` },
                ]).map(({ t, Icon, label }) => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: isMobile ? "7px 10px" : "7px 14px", borderRadius: 50, border: "none", background: tab === t ? "#FF6B00" : "transparent", color: tab === t ? "#fff" : c.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s", position: "relative", display: "flex", alignItems: "center", gap: isMobile ? 0 : 6 }}>
                    <Icon size={isMobile ? 20 : 16} strokeWidth={2} />
                    {!isMobile && label}
                    {t === "notificari" && necitite > 0 && (
                      <span style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: "50%", background: tab === t ? "#fff" : "#EF4444" }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Right: user menu */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <UserMenu numeComplet={numeComplet} numeSalon={numeSalon} tab={tab} onLogout={handleLogout} onNav={setTab} isMobile={isMobile} avatarUrl={avatarUrl} pozaUrl={pozaUrl} planId={planIdCurent} DS={DS} />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* ── Starea trialului ── */}
            {trial.stare === "trial" && trial.zileRamase <= ZILE_AVERTISMENT && (
              <div style={{ marginBottom: 20, background: c.orangeAccent, border: `1.5px solid ${c.orangeBorder}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <Clock size={20} color="#FF6B00" strokeWidth={2} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>
                    {trial.zileRamase === 0 ? "Trialul se încheie astăzi" : `Trialul se încheie în ${zileText(trial.zileRamase)}`}
                  </div>
                  {/* Spunem pe ce plan e, ca ziua 15 să nu fie o surpriză.
                      Propunerea de facturare va fi exact planul de aici. */}
                  <div style={{ fontSize: 12.5, color: c.muted, marginTop: 2 }}>
                    Ești pe planul <strong style={{ color: c.text }}>{numePlan(salonData?.plan)}</strong> — cu el continui, dacă nu schimbi.
                  </div>
                </div>
                <button onClick={() => setTab("abonament")}
                  style={{ padding: "10px 18px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                  Vezi planurile →
                </button>
              </div>
            )}

            {trial.stare === "expirat" && (
              <div style={{ marginBottom: 20, background: theme === "dark" ? "rgba(239,68,68,.10)" : "#FEF2F2", border: "1.5px solid rgba(239,68,68,.35)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <AlertTriangle size={20} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>Trialul s-a încheiat</div>
                  <div style={{ fontSize: 12.5, color: c.muted, marginTop: 2, lineHeight: 1.5 }}>
                    Alege un plan ca să continui. Datele salonului rămân salvate încă {zileText(trial.zilePanaLaStergere)};
                    programările deja confirmate se desfășoară normal.
                  </div>
                </div>
                <button onClick={() => setTab("abonament")}
                  style={{ padding: "10px 18px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                  Alege un plan →
                </button>
              </div>
            )}

            {/* Interogarea agendei a eșuat — de obicei o coloană care lipsește
                din bază. Mai bine un mesaj decât un calendar gol care pare
                pur și simplu o zi liberă. */}
            {eroareAgenda && (
              <div style={{ marginBottom: 18, background: theme === "dark" ? "rgba(239,68,68,.10)" : "#FEF2F2", border: "1.5px solid rgba(239,68,68,.35)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <AlertTriangle size={20} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>Agenda nu s-a putut încărca</div>
                  <div style={{ fontSize: 12.5, color: c.muted, marginTop: 3, lineHeight: 1.55 }}>
                    {eroareAgenda}
                    <br />Dacă mesajul pomenește o coloană, lipsește din baza de date — rulează fișierul SQL corespunzător.
                  </div>
                </div>
              </div>
            )}

            {/* AGENDA — calendar pe zi, coloane per specialist */}
            {tab === "agenda" && (
              <AgendaCalendar
                programari={programari}
                echipa={echipa}
                program={program}
                agendaZi={agendaZi}
                setAgendaZi={setAgendaZi}
                filtruTalie={filtruTalie}
                setFiltruTalie={setFiltruTalie}
                areAnimale={areAnimale}
                accepta={accepta}
                respinge={respinge}
                clientiBlocati={clientiBlocati}
                abateriMap={abateriMap}
                neprezentariMap={neprezentariMap}
                marcheazaPrezenta={marcheazaPrezenta}
                toggleBlocClient={toggleBlocClient}
                highlightProgramare={highlightProgramare}
                onHighlightConsumat={() => setHighlightProgramare(null)}
                c={c}
                theme={theme}
                servicii={servicii}
                anuleazaDeSalon={anuleazaDeSalon}
                mutaProgramare={mutaProgramare}
                corecteazaProgramare={corecteazaProgramare}
              />
            )}

            {/* ISTORIC ANIMALE */}
            {tab === "animale" && (() => {
              const q = cautareAnimal.trim().toLowerCase();
              const lista = q
                ? animaleIstoric.filter(a => a.nume.toLowerCase().includes(q) || a.stapanNume.toLowerCase().includes(q) || (a.rasa || "").toLowerCase().includes(q))
                : animaleIstoric;
              return (
                <div>
                  <PageHeader icon={areAnimale ? PawPrint : Users} title={DS.istoricTitlu} sub={DS.istoricSub} />
                  <div style={{ marginBottom: 16 }}>
                    <input value={cautareAnimal} onChange={e => setCautareAnimal(e.target.value)} placeholder={DS.istoricCauta} style={inp} />
                  </div>
                  {animaleIstoric.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 16, border: `1.5px dashed ${c.border}` }}>
                      <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>{areAnimale ? <PawPrint size={28} color={c.muted} strokeWidth={1.5} /> : <Users size={28} color={c.muted} strokeWidth={1.5} />}</div>
                      {DS.istoricGol}<br />Vizitele apar aici după ce programările din aplicație au fost confirmate și au trecut.
                    </div>
                  ) : lista.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: c.muted, fontSize: 14 }}>Niciun rezultat pentru &bdquo;{cautareAnimal}&rdquo;.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {lista.map(a => {
                        const deschis = animalDeschis === a.id;
                        // Clienții luați la telefon n-au cont: nu au animal, poză sau
                        // telefon în aplicație. Îi marcăm, ca lipsa datelor să se
                        // înțeleagă, nu să pară o eroare.
                        const faraCont = String(a.id).startsWith("tel:");
                        return (
                          <div key={a.id} style={{ background: c.surface, borderRadius: 16, border: deschis ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, overflow: "hidden" }}>
                            <button onClick={() => setAnimalDeschis(deschis ? null : a.id)}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                              <div style={{ width: 50, height: 50, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, overflow: "hidden" }}>
                                {a.poza_url ? <img src={a.poza_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (faraCont ? <Phone size={20} color="#FF6B00" strokeWidth={2} /> : areAnimale ? specieIcon(a.specie) : <User size={22} color="#FF6B00" strokeWidth={2} />)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: c.text, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                                  {areAnimale && !faraCont ? `${specieIcon(a.specie)} ` : ""}{a.nume}
                                  {faraCont && <span style={{ fontSize: 10, fontWeight: 800, color: c.muted, background: c.surface2, border: `1px solid ${c.border}`, padding: "2px 8px", borderRadius: 50 }}>fără cont</span>}
                                </div>
                                {areAnimale && !faraCont && <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{[a.rasa, talieLabel(a.talie), a.greutate ? `${a.greutate}kg` : null].filter(Boolean).join(" · ")}</div>}
                                {areAnimale && !faraCont
                                  ? <div style={{ fontSize: 11, color: c.xmuted, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><User size={11} color={c.xmuted} strokeWidth={2} /> {a.stapanNume}</div>
                                  : a.ultimaVizita && <div style={{ fontSize: 11, color: c.xmuted, marginTop: 2 }}>Ultima vizită: {new Date(a.ultimaVizita).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</div>}
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
                                  {!areAnimale && a.stapanTelefon && <span style={{ background: c.surface3, color: c.text2, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Phone size={11} color={c.text2} strokeWidth={2} /> {a.stapanTelefon}</span>}
                                  {areAnimale && !faraCont && talieLabel(a.talie) && <span style={{ background: c.orangeAccent, color: "#FF6B00", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>{talieLabel(a.talie)}</span>}
                                  {areAnimale && !faraCont && a.sex && <span style={{ background: c.surface3, color: c.text2, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>{a.sex === "femela" ? "♀ Femelă" : "♂ Mascul"}</span>}
                                  {areAnimale && !faraCont && a.varsta ? <span style={{ background: c.surface3, color: c.text2, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>{a.varsta} ani</span> : null}
                                  {areAnimale && !faraCont && a.stapanTelefon && <span style={{ background: c.surface3, color: c.text2, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Phone size={11} color={c.text2} strokeWidth={2} /> {a.stapanNume} · {a.stapanTelefon}</span>}
                                  {areAnimale && !faraCont && (areAlergii(a.alergii)
                                    ? <span style={{ background: "rgba(239,68,68,.12)", color: "#DC2626", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><AlertTriangle size={11} color="#DC2626" strokeWidth={2} /> Alergii: {a.alergii}</span>
                                    : <span style={{ background: "rgba(16,185,129,.12)", color: "#059669", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={11} color="#059669" strokeWidth={2} /> Fără alergii</span>
                                  )}
                                  {areAnimale && !faraCont && (a.vaccinat
                                    ? <span style={{ background: "rgba(16,185,129,.12)", color: "#059669", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>Vaccinat</span>
                                    : <span style={{ background: "rgba(239,68,68,.12)", color: "#DC2626", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><XCircle size={11} color="#DC2626" strokeWidth={2} /> Nevaccinat</span>
                                  )}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Istoric vizite</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  {a.vizite.map(v => (
                                    <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: c.surface, borderRadius: 10, border: `1px solid ${c.border}` }}>
                                      <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, display: "flex", alignItems: "center", gap: 4 }}><Scissors size={13} color={c.text} strokeWidth={2} /> {v.serviciu}</div>
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
                                        {blocat ? <span style={{ color: "#EF4444", display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} /> Client blocat — nu poate rezerva</span> : abateri > 0 ? <span style={{ color: abateri >= ANULARI_PANA_LA_AVERTISMENT ? "#EF4444" : "#D97706", display: "inline-flex", alignItems: "center", gap: 4 }}><AlertTriangle size={12} color={abateri >= ANULARI_PANA_LA_AVERTISMENT ? "#EF4444" : "#D97706"} strokeWidth={2} /> {abateri} {abateri === 1 ? "anulare târzie" : "anulări târzii"}{abateri >= ANULARI_PANA_LA_AVERTISMENT ? " — poți bloca clientul" : ""}</span> : <span>✓ Fără anulări</span>}
                                      </div>
                                      <button onClick={() => toggleBlocClient(a.stapanUserId!)} style={{ padding: "7px 16px", borderRadius: 50, border: `1.5px solid ${blocat ? "#10B981" : "#EF4444"}`, background: "transparent", color: blocat ? "#10B981" : "#EF4444", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                        {blocat ? "✓ Deblochează clientul" : "Blochează clientul"}
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
              const now = new Date();
              const { start, end, label: perLabel } = intervalPerioada(perioadaStat, customStart, customEnd);
              const inRange = (d: string) => d >= start && d <= end;
              /*
               * Cererile refuzate ies din numărătoare.
               *
               * Un salon plin care refuză 20 de cereri nu are 20 de anulări și
               * nici 20 de programări — are 20 de ore ocupate. Le numărăm
               * separat, ca să nu umfle nici totalul, nici rata de anulare.
               */
              const progRange = programari.filter(p => inRange(p.data) && !ePauza(p.sursa) && !eRefuz(p));
              const refuzateRange = programari.filter(p => inRange(p.data) && !ePauza(p.sursa) && eRefuz(p)).length;
              const anulateRange = progRange.filter(p => p.status === "anulat").length;
              const venitRange = progRange.filter(p => eIncasare(p.status));
              // Vizite încheiate cărora salonul n-a completat prețul — de obicei
              // cele de la telefon. Cifra de încasări e incompletă cu ele.
              const faraPret = venitRange.filter(p => !p.pret || p.pret <= 0).length;
              const incasariPer = venitRange.reduce((s, p) => s + (p.pret || 0), 0);
              // Ce urmează în perioada aleasă — bani care încă n-au intrat.
              const deIncasatRange = progRange.filter(p => eDeIncasat(p.status));
              const deIncasatPer = deIncasatRange.reduce((s, p) => s + (p.pret || 0), 0);
              const neprezentariPer = progRange.filter(p => p.status === "neprezentat").length;
              const clientiPer = new Set(progRange.map(p => p.user_id).filter(Boolean)).size;
              const asteptarePer = progRange.filter(p => p.status === "în așteptare").length;

              /*
               * Ziua păstrează și programările, nu doar cifra.
               *
               * Înainte, cardul desfăcut arăta „Azi — 1" și atât: salonul vedea
               * numărul, dar nu putea afla despre ce e vorba fără să caute prin
               * agendă. O cifră fără detaliu nu răspunde la nicio întrebare.
               */
              const zileMap: Record<string, { venit: number; nr: number; clienti: Set<string>; progs: ProgramareSalon[] }> = {};
              progRange.forEach(p => {
                (zileMap[p.data] ||= { venit: 0, nr: 0, clienti: new Set<string>(), progs: [] });
                zileMap[p.data].nr++;
                zileMap[p.data].progs.push(p);
                if (p.user_id) zileMap[p.data].clienti.add(p.user_id);
                if (eIncasare(p.status)) zileMap[p.data].venit += p.pret || 0;
              });
              const zileBreakdown = Object.entries(zileMap)
                .map(([data, v]) => ({
                  data, venit: v.venit, nr: v.nr, clienti: v.clienti.size,
                  progs: [...v.progs].sort((a, b) => a.ora < b.ora ? -1 : 1),
                }))
                .sort((a, b) => a.data < b.data ? 1 : -1);

              const servCount: Record<string, number> = {};
              venitRange.forEach(p => { if (p.serviciu) servCount[p.serviciu] = (servCount[p.serviciu] || 0) + 1; });
              const totalServ = Object.values(servCount).reduce((a, b) => a + b, 0);
              const serviciiPop = Object.entries(servCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nume, cnt], i) => ({
                nume, pct: totalServ > 0 ? Math.round((cnt / totalServ) * 100) : 0, cnt,
                col: ["#FF6B00", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"][i],
              }));
              /*
               * Productivitatea se grupează după identitatea specialistului, cu
               * numele lui de acum. Dacă se grupa după numele scris pe
               * programare, o redenumire îi rupea istoricul în două persoane.
               */
              const numeDupaUid = new Map(echipa.filter(g => g.uid).map(g => [g.uid as string, g.nume]));
              const groomerMap: Record<string, { nr: number; venit: number }> = {};
              venitRange.forEach(p => {
                const numeCurent = p.membruUid ? numeDupaUid.get(p.membruUid) : undefined;
                const g = (numeCurent && numeCurent.trim()) || ((p.groomer && p.groomer.trim()) ? p.groomer : "Neatribuit");
                (groomerMap[g] ||= { nr: 0, venit: 0 });
                groomerMap[g].nr++;
                groomerMap[g].venit += p.pret || 0;
              });
              const groomerProd = Object.entries(groomerMap).sort((a, b) => b[1].nr - a[1].nr).map(([nume, v], i) => ({
                nume, nr: v.nr, venit: v.venit,
                pct: venitRange.length > 0 ? Math.round((v.nr / venitRange.length) * 100) : 0,
                col: ["#FF6B00", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"][i % 6],
              }));
              const talieCount = { mica: 0, medie: 0, mare: 0, necunoscuta: 0 };
              venitRange.forEach(p => {
                if (p.talie === "mica") talieCount.mica++;
                else if (p.talie === "medie") talieCount.medie++;
                else if (p.talie === "mare") talieCount.mare++;
                else talieCount.necunoscuta++;
              });
              const totalTalie = talieCount.mica + talieCount.medie + talieCount.mare + talieCount.necunoscuta;
              const talieDominanta = totalTalie === 0 ? "—" : ([
                { label: "Mică", cnt: talieCount.mica }, { label: "Medie", cnt: talieCount.medie },
                { label: "Mare", cnt: talieCount.mare }, { label: "Necunoscută", cnt: talieCount.necunoscuta },
              ].sort((a, b) => b.cnt - a.cnt)[0].label);
              // Delta față de perioada anterioară echivalentă (aceeași durată, imediat înainte)
              const lenDays = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
              const prevEndD = new Date(start); prevEndD.setDate(prevEndD.getDate() - 1);
              const prevStartD = new Date(prevEndD); prevStartD.setDate(prevStartD.getDate() - (lenDays - 1));
              const prevStartIso = isoData(prevStartD), prevEndIso = isoData(prevEndD);
              const incasariPrev = programari.filter(p => eIncasare(p.status) && p.data >= prevStartIso && p.data <= prevEndIso).reduce((s, p) => s + (p.pret || 0), 0);
              const deltaPct = incasariPrev > 0 ? Math.round(((incasariPer - incasariPrev) / incasariPrev) * 100) : null;
              const lunaCurenta = now.getMonth(), anulCurent = now.getFullYear();
              const LUNI_SCURT = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];
              const ultimeleLuni: { luna: string; val: number }[] = [];
              for (let i = 5; i >= 0; i--) {
                const dt = new Date(anulCurent, lunaCurenta - i, 1);
                const m = dt.getMonth(), y = dt.getFullYear();
                const val = programari.filter(p => {
                  const d = new Date(p.data);
                  return d.getMonth() === m && d.getFullYear() === y && eIncasare(p.status);
                }).reduce((s, p) => s + (p.pret || 0), 0);
                ultimeleLuni.push({ luna: LUNI_SCURT[m], val });
              }
              const maxLunar = Math.max(...ultimeleLuni.map(x => x.val), 1);

              const PERIOADE: { val: PerioadaStat; label: string }[] = [
                { val: "azi", label: "Azi" }, { val: "ieri", label: "Ieri" },
                { val: "saptamana", label: "Săptămână" }, { val: "luna", label: "Lună" },
                { val: "an", label: "An" }, { val: "custom", label: "Interval" },
              ];
              const inp: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif", outline: "none" };
              const SECTIUNI: { key: keyof typeof raportSel; label: string }[] = [
                { key: "venituri", label: "Venituri" }, { key: "programari", label: "Programări" },
                { key: "clienti", label: "Clienți" }, { key: "servicii", label: "Servicii populare" },
                ...(areAnimale ? [{ key: "talie" as const, label: "Distribuție talie" }] : []),
              ];
              const cards = [
                // „Încasări" înseamnă acum doar vizite chiar încheiate. Ce urmează
                // stă separat, la „De încasat" — două cifre, amândouă adevărate.
                { id: "venituri" as const, Icon: Wallet, label: `Încasări ${perLabel.toLowerCase()}`, valoare: `${incasariPer} RON`,
                  sub: [
                    `${venitRange.length} ${venitRange.length === 1 ? "vizită încheiată" : "vizite încheiate"}`,
                    faraPret > 0 ? `${faraPret} fără preț completat` : null,
                    neprezentariPer > 0 ? `${neprezentariPer} ${neprezentariPer === 1 ? "neprezentare" : "neprezentări"}` : null,
                  ].filter(Boolean).join(" · "),
                  color: "#10B981", clickable: true },
                { id: "deIncasat" as const, Icon: Clock, label: "De încasat", valoare: `${deIncasatPer} RON`, sub: `${deIncasatRange.length} ${deIncasatRange.length === 1 ? "programare confirmată" : "programări confirmate"}, încă neefectuate`, color: "#3B82F6", clickable: false },
                { id: "programari" as const, Icon: CalendarDays, label: `Programări ${perLabel.toLowerCase()}`, valoare: `${progRange.length}`,
                  sub: [
                    `${asteptarePer} în așteptare`,
                    `${deIncasatRange.length} confirmate`,
                    anulateRange > 0 ? `${anulateRange} anulate` : null,
                    // Numărate separat, în afara totalului de deasupra.
                    refuzateRange > 0 ? `${refuzateRange} refuzate de tine (nesocotite)` : null,
                  ].filter(Boolean).join(" · "),
                  color: "#FF6B00", clickable: true },
                { id: "clienti" as const, Icon: Users, label: `Clienți ${perLabel.toLowerCase()}`, valoare: `${clientiPer}`, sub: `${incasariPer} RON încasați`, color: "#8B5CF6", clickable: true },
                { id: "rating" as const, Icon: Star, label: "Rating mediu (total)", valoare: ratingSalon.nr > 0 ? ratingSalon.medie.toFixed(1) : "—", sub: ratingSalon.nr > 0 ? `din ${ratingSalon.nr} ${ratingSalon.nr === 1 ? "recenzie" : "recenzii"}` : "Încă fără recenzii", color: "#F59E0B", clickable: true },
              ];
              return (
              <div>
                {/* Selector perioadă + raport */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {PERIOADE.map(p => (
                      <button key={p.val} onClick={() => { setPerioadaStat(p.val); setStatExtins(null); }}
                        style={{ padding: "8px 16px", borderRadius: 50, border: perioadaStat === p.val ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: perioadaStat === p.val ? "#FF6B00" : c.surface, color: perioadaStat === p.val ? "#fff" : c.text, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setRaportDeschis(v => !v)}
                    style={{ ...btnPrimary, padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    <Download size={15} strokeWidth={2} /> Generează raport Excel
                  </button>
                </div>

                {perioadaStat === "custom" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c.muted }}>De la</span>
                    <input type="date" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)} style={inp} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: c.muted }}>până la</span>
                    <input type="date" value={customEnd} min={customStart} max={isoData(new Date())} onChange={e => setCustomEnd(e.target.value)} style={inp} />
                  </div>
                )}

                {raportDeschis && (
                  <div style={{ background: c.surface, borderRadius: 18, border: "2px solid #FF6B00", padding: "20px 22px", marginBottom: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: c.text, marginBottom: 4 }}>Raport Excel — {perLabel}</div>
                    <div style={{ fontSize: 12.5, color: c.muted, marginBottom: 16 }}>Bifează ce vrei să incluzi în fișier. Se descarcă un .xlsx cu câte o foaie per secțiune.</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
                      {SECTIUNI.map(s => {
                        const activ = raportSel[s.key];
                        return (
                          <button key={s.key} onClick={() => setRaportSel(r => ({ ...r, [s.key]: !r[s.key] }))}
                            style={{ padding: "8px 14px", borderRadius: 50, border: activ ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: activ ? "#FFF3EA" : c.surface, color: activ ? "#FF6B00" : c.muted, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                            <span>{activ ? "✓" : "+"}</span> {s.label}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <button onClick={genereazaRaportExcel} disabled={exportLoading || !Object.values(raportSel).some(Boolean)}
                        style={{ ...btnPrimary, padding: "12px 22px", opacity: (exportLoading || !Object.values(raportSel).some(Boolean)) ? 0.6 : 1, cursor: (exportLoading || !Object.values(raportSel).some(Boolean)) ? "not-allowed" : "pointer" }}>
                        {exportLoading ? "Se generează…" : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Download size={15} strokeWidth={2} /> Descarcă .xlsx</span>}
                      </button>
                      <span style={{ fontSize: 12.5, color: c.muted }}>{progRange.length} programări în perioadă</span>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
                  {cards.map(card => {
                    const deschis = card.clickable && statExtins === card.id;
                    return (
                    <div key={card.label} onClick={card.clickable ? () => setStatExtins(prev => prev === card.id ? null : card.id) : undefined}
                      style={{ background: c.surface, borderRadius: 18, padding: "18px 20px", border: deschis ? "2px solid #10B981" : "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.07)", cursor: card.clickable ? "pointer" : "default", position: "relative" }}>
                      <div style={{ marginBottom: 8 }}><card.Icon size={22} color={card.color} strokeWidth={2} /></div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{card.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: c.text, lineHeight: 1 }}>{card.valoare}</div>
                      <div style={{ fontSize: 12, color: card.color, fontWeight: 700, marginTop: 6 }}>{card.sub}</div>
                      {card.clickable && <div style={{ position: "absolute", top: 16, right: 16, fontSize: 12, color: c.muted, fontWeight: 800 }}>{deschis ? "▲" : "▼"}</div>}
                      {deschis && card.id !== "rating" && (
                        <div onClick={e => e.stopPropagation()} style={{ marginTop: 16, paddingTop: 14, borderTop: `1.5px solid ${c.border}` }}>
                          {zileBreakdown.length === 0 ? (
                            <div style={{ fontSize: 13, color: c.muted, fontStyle: "italic" }}>Nicio programare în această perioadă.</div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                              {zileBreakdown.map(z => {
                                const et = etichetaZi(z.data);
                                const val = card.id === "venituri" ? `${z.venit} RON` : card.id === "programari" ? `${z.nr}` : `${z.clienti}`;
                                // Ce se enumeră sub zi, după cardul deschis.
                                const randuri = card.id === "venituri" ? z.progs.filter(p => eIncasare(p.status)) : z.progs;
                                return (
                                  <div key={z.data} style={{ padding: "8px 12px", borderRadius: 10, background: c.surface2 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
                                        {et.prefix && <span style={{ fontSize: 12, fontWeight: 900, color: et.azi ? "#FF6B00" : c.text, flexShrink: 0 }}>{et.prefix}</span>}
                                        <span style={{ fontSize: 12, fontWeight: 700, color: et.prefix ? c.muted : c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{et.rest}</span>
                                      </div>
                                      <span style={{ fontSize: 14, fontWeight: 900, color: c.text, flexShrink: 0 }}>{val}</span>
                                    </div>
                                    {randuri.length > 0 && (
                                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                                        {randuri.map(pr => {
                                          // La anulate spunem și cine a anulat: „anulată" sec
                                          // nu deosebește renunțarea clientului de o mutare
                                          // făcută de salon.
                                          const st = pr.status === "anulat" ? etichetaAnulareScurt(pr) : STARE_SCURT[pr.status];
                                          return (
                                            <div key={pr.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, flexWrap: "wrap" }}>
                                              <span style={{ fontWeight: 900, color: c.text2, flexShrink: 0, minWidth: 38 }}>{pr.ora}</span>
                                              <span style={{ fontWeight: 800, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{pr.client}</span>
                                              <span style={{ color: c.muted, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.serviciu}</span>
                                              {pr.pret > 0 && <span style={{ fontWeight: 900, color: "#FF6B00", flexShrink: 0 }}>{pr.pret} RON</span>}
                                              <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 10.5, fontWeight: 800, color: st.culoare, background: `${st.culoare}1F`, padding: "1px 8px", borderRadius: 50 }}>{st.text}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {card.id === "venituri" && (
                            <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1.5px dashed ${c.border}` }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Evoluție lunară (ultimele 6 luni)</span>
                                {deltaPct !== null && (
                                  <span style={{ fontSize: 12, fontWeight: 900, color: deltaPct >= 0 ? "#10B981" : "#EF4444", background: deltaPct >= 0 ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)", padding: "3px 10px", borderRadius: 50 }}>
                                    {deltaPct >= 0 ? "▲" : "▼"} {Math.abs(deltaPct)}% vs perioada anterioară
                                  </span>
                                )}
                              </div>
                              {ultimeleLuni.map(({ luna, val }) => (
                                <div key={luna} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                                  <div style={{ width: 32, fontSize: 12, fontWeight: 700, color: c.muted, flexShrink: 0 }}>{luna}</div>
                                  <div style={{ flex: 1, height: 8, background: c.surface3, borderRadius: 4 }}><div style={{ height: "100%", width: `${(val / maxLunar) * 100}%`, background: "#FF6B00", borderRadius: 4 }} /></div>
                                  <div style={{ fontSize: 12.5, fontWeight: 800, color: c.text, width: 58, textAlign: "right", flexShrink: 0 }}>{val}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {deschis && card.id === "rating" && (() => {
                        const aziIso = isoData(new Date());
                        const ieriD = new Date(); ieriD.setDate(ieriD.getDate() - 1);
                        const ieriIso = isoData(ieriD);
                        const numara = (f: typeof filtruRecenzii) => recenziiSalon.filter(r => {
                          const d = isoData(new Date(r.created_at));
                          if (f === "azi") return d === aziIso;
                          if (f === "ieri") return d === ieriIso;
                          if (f === "trecut") return d < ieriIso;
                          return true;
                        }).length;
                        const recenziiFiltrate = recenziiSalon.filter(r => {
                          const d = isoData(new Date(r.created_at));
                          if (filtruRecenzii === "azi") return d === aziIso;
                          if (filtruRecenzii === "ieri") return d === ieriIso;
                          if (filtruRecenzii === "trecut") return d < ieriIso;
                          return true;
                        });
                        const optiuni: { val: typeof filtruRecenzii; label: string }[] = [
                          { val: "toate", label: "Toate" }, { val: "azi", label: "Azi" },
                          { val: "ieri", label: "Ieri" }, { val: "trecut", label: "Mai vechi" },
                        ];
                        return (
                          <div onClick={e => e.stopPropagation()} style={{ marginTop: 16, paddingTop: 14, borderTop: `1.5px solid ${c.border}` }}>
                            {recenziiSalon.length > 0 && (
                              <div style={{ marginBottom: 14 }}>
                                <select value={filtruRecenzii} onChange={e => setFiltruRecenzii(e.target.value as typeof filtruRecenzii)}
                                  style={{ padding: "6px 12px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.surface2, color: c.text, fontSize: 12, fontWeight: 700, fontFamily: "Nunito, sans-serif", cursor: "pointer", outline: "none" }}>
                                  {optiuni.map(o => <option key={o.val} value={o.val}>{o.label} ({numara(o.val)})</option>)}
                                </select>
                              </div>
                            )}
                            {recenziiSalon.length === 0 ? (
                              <div style={{ textAlign: "center", padding: "16px 0" }}>
                                <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}><Star size={28} color="#F59E0B" strokeWidth={1.5} /></div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: c.text, marginBottom: 2 }}>Încă nu ai recenzii</div>
                                <div style={{ fontSize: 12, color: c.muted }}>Clienții pot lăsa o recenzie după o programare finalizată.</div>
                              </div>
                            ) : recenziiFiltrate.length === 0 ? (
                              <div style={{ fontSize: 13, color: c.muted, fontStyle: "italic" }}>Nicio recenzie în această perioadă.</div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {recenziiFiltrate.map(r => (
                                  <div key={r.id} style={{ background: c.surface2, borderRadius: 12, padding: "12px 14px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {r.avatar_url
                                          ? <img src={r.avatar_url} alt={r.nume} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                                          : <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#FF6B00", flexShrink: 0 }}>{r.nume.charAt(0)}</div>
                                        }
                                        <div>
                                          <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>{r.nume}</div>
                                          <div style={{ fontSize: 11, color: c.muted }}>{new Date(r.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</div>
                                        </div>
                                      </div>
                                      <div style={{ display: "flex", gap: 1 }}>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} color="#F59E0B" strokeWidth={2} fill="#F59E0B" />)}</div>
                                    </div>
                                    <p style={{ fontSize: 12.5, color: c.text2, lineHeight: 1.6, margin: 0 }}>{r.text}</p>

                                    {/* Răspuns salon — doar afișare. Generarea AI se face în „Funcții AI". */}
                                    {r.raspuns_salon ? (
                                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                          <span style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 1 }}>Răspunsul salonului</span>
                                          {r.raspuns_at && <span style={{ fontSize: 10.5, color: c.muted }}>{new Date(r.raspuns_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</span>}
                                        </div>
                                        <p style={{ fontSize: 12.5, color: c.text2, lineHeight: 1.6, margin: 0 }}>{r.raspuns_salon}</p>
                                      </div>
                                    ) : (
                                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                                        <button onClick={() => { setTab("functii-ai"); setAiTab("recenzii"); }}
                                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 50, border: "1.5px solid #FF6B00", background: "transparent", color: "#FF6B00", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                          <Sparkles size={13} strokeWidth={2} /> Răspunde cu AI
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    );
                  })}
                </div>

                <h2 style={{ fontSize: 18, fontWeight: 900, color: c.text, marginBottom: 20 }}>Statistici detaliate</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "start" }}>
                  {/* CARD SERVICII & GROOMERI */}
                  {(() => {
                    const deschis = statExtins === "servicii";
                    return (
                      <div onClick={() => setStatExtins(prev => prev === "servicii" ? null : "servicii")}
                        style={{ background: c.surface, borderRadius: 18, padding: "18px 20px", border: deschis ? "2px solid #10B981" : "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.07)", cursor: "pointer", position: "relative" }}>
                        <div style={{ marginBottom: 8 }}><Scissors size={22} color="#FF6B00" strokeWidth={2} /></div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Servicii & {DS.rolPluralCap} — {perLabel.toLowerCase()}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: c.text, lineHeight: 1.1 }}>{serviciiPop.length > 0 ? serviciiPop[0].nume : "—"}</div>
                        <div style={{ fontSize: 12, color: "#FF6B00", fontWeight: 700, marginTop: 6 }}>{totalServ} {totalServ === 1 ? "serviciu efectuat" : "servicii efectuate"} · {groomerProd.length} {groomerProd.length === 1 ? DS.rol : DS.rolPlural}</div>
                        <div style={{ position: "absolute", top: 16, right: 16, fontSize: 12, color: c.muted, fontWeight: 800 }}>{deschis ? "▲" : "▼"}</div>
                        {deschis && (
                          <div onClick={e => e.stopPropagation()} style={{ marginTop: 16, paddingTop: 14, borderTop: `1.5px solid ${c.border}` }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Top servicii</div>
                            {serviciiPop.length === 0 ? (
                              <div style={{ fontSize: 13, color: c.muted, fontStyle: "italic" }}>Niciun serviciu efectuat încă.</div>
                            ) : serviciiPop.map(s => (
                              <div key={s.nume} style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700, color: c.text2 }}>{s.nume}</span><span style={{ fontSize: 13, fontWeight: 800, color: s.col }}>{s.cnt}× ({s.pct}%)</span></div>
                                <div style={{ height: 6, background: c.surface3, borderRadius: 3 }}><div style={{ height: "100%", width: `${s.pct}%`, background: s.col, borderRadius: 3 }} /></div>
                              </div>
                            ))}
                            <div style={{ fontSize: 12, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 0.5, margin: "20px 0 12px" }}>Productivitate {DS.rolPlural}</div>
                            {groomerProd.length === 0 ? (
                              <div style={{ fontSize: 13, color: c.muted, fontStyle: "italic" }}>Nicio programare atribuită încă.</div>
                            ) : groomerProd.map(g => (
                              <div key={g.nume} style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: g.nume === "Neatribuit" ? c.muted : c.text2, display: "inline-flex", alignItems: "center", gap: 4 }}>{g.nume === "Neatribuit" ? <><User size={13} color={c.muted} strokeWidth={2} /> Neatribuit</> : <><Scissors size={13} color={c.text2} strokeWidth={2} /> {g.nume}</>}</span>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: g.col }}>{g.nr} {g.nr === 1 ? "progr." : "progr."} · {g.venit} RON</span>
                                </div>
                                <div style={{ height: 6, background: c.surface3, borderRadius: 3 }}><div style={{ height: "100%", width: `${g.pct}%`, background: g.col, borderRadius: 3 }} /></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {/* CARD DISTRIBUȚIE TALIE — doar la saloanele care lucreaza cu animale */}
                  {areAnimale && (() => {
                    const deschis = statExtins === "talie";
                    return (
                      <div onClick={() => setStatExtins(prev => prev === "talie" ? null : "talie")}
                        style={{ background: c.surface, borderRadius: 18, padding: "18px 20px", border: deschis ? "2px solid #10B981" : "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.07)", cursor: "pointer", position: "relative" }}>
                        <div style={{ marginBottom: 8 }}><PawPrint size={22} color="#8B5CF6" strokeWidth={2} /></div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Distribuție pe talie — {perLabel.toLowerCase()}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: c.text, lineHeight: 1.1 }}>{talieDominanta}</div>
                        <div style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 700, marginTop: 6 }}>{totalTalie} {totalTalie === 1 ? "programare" : "programări"}</div>
                        <div style={{ position: "absolute", top: 16, right: 16, fontSize: 12, color: c.muted, fontWeight: 800 }}>{deschis ? "▲" : "▼"}</div>
                        {deschis && (
                          <div onClick={e => e.stopPropagation()} style={{ marginTop: 16, paddingTop: 14, borderTop: `1.5px solid ${c.border}` }}>
                            {totalTalie === 0 ? (
                              <div style={{ fontSize: 13, color: c.muted, fontStyle: "italic" }}>Nicio programare efectuată încă.</div>
                            ) : [
                              { key: "mica", label: "Mică", cnt: talieCount.mica, col: "#10B981" },
                              { key: "medie", label: "Medie", cnt: talieCount.medie, col: "#FF6B00" },
                              { key: "mare", label: "Mare", cnt: talieCount.mare, col: "#8B5CF6" },
                              ...(talieCount.necunoscuta > 0 ? [{ key: "necunoscuta", label: "Necunoscută", cnt: talieCount.necunoscuta, col: "#9CA3AF" }] : []),
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
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                    <button onClick={() => {
                      const snapshot = notificari;
                      setNotificari(n => n.map(x => ({ ...x, citit: true })));
                      supabase.from("notificari").update({ citit: true }).eq("user_id", userId).then(({ error }) => {
                        if (error) setNotificari(snapshot);
                      });
                    }} style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                      Marchează toate citite
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  {notificari.length === 0 && (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: c.muted, fontSize: 14, background: c.surface, borderRadius: 16, border: `1.5px dashed ${c.border}` }}>
                      Nu ai notificări încă.
                    </div>
                  )}
                  {(() => {
                    const grupNotif: { data: string; items: Notificare[] }[] = [];
                    for (const n of notificari) {
                      const d = isoData(new Date(n.created_at));
                      let g = grupNotif.find(x => x.data === d);
                      if (!g) { g = { data: d, items: [] }; grupNotif.push(g); }
                      g.items.push(n);
                    }
                    return grupNotif.map(g => {
                      const et = etichetaZi(g.data);
                      const necititeZi = g.items.filter(n => !n.citit).length;
                      return (
                        <div key={g.data}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, position: "sticky", top: 66, background: c.pageBg, padding: "6px 0", zIndex: 5 }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                              {et.prefix && <span style={{ fontSize: 14, fontWeight: 900, color: et.azi ? "#FF6B00" : c.text }}>{et.prefix}</span>}
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: et.prefix ? c.muted : c.text }}>{et.rest}</span>
                            </div>
                            <div style={{ flex: 1, height: 1, background: c.border }} />
                            {necititeZi > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "#FF6B00", padding: "1px 8px", borderRadius: 50 }}>{necititeZi}</span>}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {g.items.map(n => {
                              // Aflăm clientul (poza) din programarea legată de notificare
                              const progNotif = n.programare_id ? programari.find(p => p.id === n.programare_id) : null;
                              const avatarClient = progNotif?.clientAvatar || null;
                              const numeClient = progNotif?.client || "";
                              const iconTip = n.tip === "programare_noua" ? <Bell size={20} color="#FF6B00" strokeWidth={2} /> : n.tip === "confirmat" ? <CheckCircle2 size={20} color="#10B981" strokeWidth={2} /> : n.tip === "anulat" ? <XCircle size={20} color="#EF4444" strokeWidth={2} /> : n.tip === "recenzie_noua" ? <Star size={20} color="#F59E0B" strokeWidth={2} /> : <Lightbulb size={20} color="#6B7280" strokeWidth={2} />;
                              const badgeTip = n.tip === "programare_noua" ? <Bell size={11} color="#FF6B00" strokeWidth={2.6} /> : n.tip === "confirmat" ? <CheckCircle2 size={12} color="#10B981" strokeWidth={2.6} /> : n.tip === "anulat" ? <XCircle size={12} color="#EF4444" strokeWidth={2.6} /> : n.tip === "recenzie_noua" ? <Star size={11} color="#F59E0B" strokeWidth={2.6} /> : <Lightbulb size={11} color="#6B7280" strokeWidth={2.6} />;
                              return (
                              <div key={n.id} onClick={() => deschideNotificare(n)}
                                style={{ background: n.citit ? c.surface : (theme === "dark" ? "rgba(255,107,0,0.24)" : "rgba(255,107,0,0.16)"), borderRadius: 14, padding: "14px 18px", border: n.citit ? `1.5px solid ${c.border}` : "2px solid #FF6B00", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
                                <div style={{ flexShrink: 0, position: "relative" }}>
                                  {avatarClient ? (
                                    <>
                                      <img src={avatarClient} alt={numeClient} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", display: "block" }} />
                                      <div style={{ position: "absolute", bottom: -4, right: -4, width: 19, height: 19, borderRadius: "50%", background: c.surface, border: `1.5px solid ${c.surface}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.25)" }}>
                                        {badgeTip}
                                      </div>
                                    </>
                                  ) : numeClient ? (
                                    <>
                                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: "#FF6B00" }}>{numeClient.charAt(0).toUpperCase()}</div>
                                      <div style={{ position: "absolute", bottom: -4, right: -4, width: 19, height: 19, borderRadius: "50%", background: c.surface, border: `1.5px solid ${c.surface}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.25)" }}>
                                        {badgeTip}
                                      </div>
                                    </>
                                  ) : iconTip}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 14, fontWeight: n.citit ? 600 : 800, color: c.text, lineHeight: 1.5 }}>{n.mesaj.replace(/^\p{Emoji_Presentation}️?\s*/u, '')}</div>
                                  <div style={{ fontSize: 12, color: c.xmuted, marginTop: 4 }}>{formatTimp(n.created_at)}</div>
                                  {n.tip === "recenzie_noua" && aiAccess.recenzii && (
                                    <button
                                      onClick={e => { e.stopPropagation(); deschideNotificare(n); }}
                                      style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 50, border: "1.5px solid #FF6B00", background: "transparent", color: "#FF6B00", fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                      <Sparkles size={11} strokeWidth={2} /> Răspunde cu AI
                                    </button>
                                  )}
                                </div>
                                {!n.citit && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 4 }} />}
                              </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* FUNCȚII AI */}
            {tab === "functii-ai" && (
              <div style={{ maxWidth: 920 }}>
                <PageHeader icon={Sparkles} title="Funcții AI" sub="Asistenții AI care lucrează pentru salonul tău" />

                {/* Neural Cards Grid */}
                {(() => {
                  const AI_DEFS = [
                    { key: "recenzii" as const,        label: "Răspunsuri la recenzii", desc: "Generează răspunsuri profesionale la recenzii",  Icon: Star,          color: "#F59E0B", rgb: "245,158,11",  acces: aiAccess.recenzii,        comingSoon: false, plan: "Basic"    },
                    { key: "clientiInactivi" as const, label: "Clienți inactivi",        desc: "Reactivează clienții care nu au mai revenit",    Icon: Users,         color: "#EF4444", rgb: "239,68,68",   acces: aiAccess.clientiInactivi, comingSoon: false, plan: "Pro"      },
                    { key: "fisaIngrijire" as const,   label: DS.fisaTitluScurt,      desc: DS.fisaDesc,     Icon: ClipboardList, color: "#06B6D4", rgb: "6,182,212",   acces: aiAccess.fisaIngrijire,   comingSoon: false, plan: "Business" },
                    { key: "consultant" as const,      label: "Consultant AI",            desc: "Rapoarte de business din datele tale reale",     Icon: Sparkles,      color: "#6366F1", rgb: "99,102,241",  acces: aiAccess.consultant,      comingSoon: false, plan: "Business" },
                    { key: "postari" as const,         label: "Postări sociale",          desc: "Generează conținut pentru social media",         Icon: ImageIcon,     color: "#EC4899", rgb: "236,72,153",  acces: false,                    comingSoon: true,  plan: null       },
                  ];
                  const agentActiv = AI_DEFS.find(a => a.key === aiTabActiv);
                  const accentColor = agentActiv?.color ?? "#6366F1";
                  const accentRgb   = agentActiv?.rgb   ?? "99,102,241";
                  const panouAgent = (
                    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: isMobile ? 12 : 18, marginLeft: 2, borderRadius: "0 0 0 4px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* ============ AGENT 1 — RĂSPUNSURI AI LA RECENZII ============ */}
                  {aiTabActiv === "recenzii" && (
                  <div style={{ background: c.surface, borderRadius: 18, border: `1.5px solid ${aiAccess.recenzii ? "rgba(255,107,0,.3)" : c.border}`, overflow: "hidden" }}>
                    <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${c.border}` }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: theme === "dark" ? "rgba(255,107,0,.15)" : "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Star size={20} color="#FF6B00" strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>Răspunsuri AI la recenzii</div>
                        <div style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>Generează răspunsuri profesionale la recenziile clienților</div>
                      </div>
                      {aiAccess.recenzii
                        ? <span style={{ fontSize: 11, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,.12)", padding: "4px 10px", borderRadius: 50, flexShrink: 0 }}>Activ</span>
                        : <span style={{ fontSize: 11, fontWeight: 800, color: c.muted, background: c.surface2, padding: "4px 10px", borderRadius: 50, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><Lock size={11} strokeWidth={2.4} /> Plan Basic</span>}
                    </div>

                    {!aiAccess.recenzii ? (
                      <PoartaPlan plan="basic" text={"Răspunde clienților în câteva secunde, cu un ton care întărește reputația salonului."} />
                    ) : (
                      <div style={{ padding: "16px 18px" }}>
                        {recenziiSalon.length === 0 ? (
                          <div style={{ padding: "16px 0", textAlign: "center" }}>
                            <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}><Star size={26} color="#F59E0B" strokeWidth={1.5} /></div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: c.text, marginBottom: 2 }}>Încă nu ai recenzii</div>
                            <div style={{ fontSize: 12, color: c.muted }}>Clienții pot lăsa o recenzie după o programare finalizată.</div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {recenziiSalon.map(r => (
                              <div key={r.id} style={{ background: c.surface2, borderRadius: 12, padding: "12px 14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {r.avatar_url
                                      ? <img src={r.avatar_url} alt={r.nume} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                                      : <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#FF6B00", flexShrink: 0 }}>{r.nume.charAt(0)}</div>}
                                    <div>
                                      <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>{r.nume}</div>
                                      <div style={{ fontSize: 11, color: c.muted }}>{new Date(r.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</div>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", gap: 1 }}>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} color="#F59E0B" strokeWidth={2} fill="#F59E0B" />)}</div>
                                </div>
                                <p style={{ fontSize: 12.5, color: c.text2, lineHeight: 1.6, margin: 0 }}>{r.text}</p>

                                {(() => {
                                  const st = raspunsAiState[r.id];
                                  if (r.raspuns_salon && !st?.editare) {
                                    return (
                                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                          <span style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 1 }}>Răspunsul salonului</span>
                                          {r.raspuns_at && <span style={{ fontSize: 10.5, color: c.muted }}>{new Date(r.raspuns_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</span>}
                                        </div>
                                        <p style={{ fontSize: 12.5, color: c.text2, lineHeight: 1.6, margin: 0 }}>{r.raspuns_salon}</p>
                                      </div>
                                    );
                                  }
                                  if (st?.editare) {
                                    return (
                                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                          <Sparkles size={12} strokeWidth={2} /> Răspuns AI {st.generand ? "— se generează…" : "(editabil)"}
                                        </div>
                                        <textarea
                                          value={st.draft}
                                          onChange={e => setRaspunsState(r.id, { draft: e.target.value })}
                                          placeholder={st.generand ? "Claude scrie un răspuns personalizat…" : "Scrie sau editează răspunsul aici…"}
                                          disabled={st.generand}
                                          rows={3}
                                          style={{ width: "100%", boxSizing: "border-box", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text, fontSize: 12.5, fontFamily: "Nunito, sans-serif", lineHeight: 1.6, padding: "9px 11px", resize: "vertical" }}
                                        />
                                        {st.eroare && <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 6 }}>{st.eroare}</div>}
                                        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                                          <button onClick={() => genereazaRaspunsAi(r)} disabled={st.generand}
                                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 50, border: `1.5px solid #FF6B00`, background: "transparent", color: "#FF6B00", fontSize: 12, fontWeight: 800, cursor: st.generand ? "default" : "pointer", opacity: st.generand ? .6 : 1, fontFamily: "Nunito, sans-serif" }}>
                                            <Sparkles size={13} strokeWidth={2} /> {st.draft ? "Regenerează" : "Generează"}
                                          </button>
                                          <button onClick={() => trimiteRaspunsRecenzie(r)} disabled={st.generand || st.trimitand || !st.draft.trim()}
                                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 12, fontWeight: 800, cursor: (st.generand || st.trimitand || !st.draft.trim()) ? "default" : "pointer", opacity: (st.generand || st.trimitand || !st.draft.trim()) ? .5 : 1, fontFamily: "Nunito, sans-serif" }}>
                                            <Send size={13} strokeWidth={2} /> {st.trimitand ? "Se trimite…" : "Trimite răspuns"}
                                          </button>
                                          <button onClick={() => setRaspunsState(r.id, { editare: false, draft: "", eroare: null })} disabled={st.generand || st.trimitand}
                                            style={{ padding: "7px 14px", borderRadius: 50, border: "none", background: "transparent", color: c.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                            Renunță
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                                      <button onClick={() => genereazaRaspunsAi(r)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 50, border: "1.5px solid #FF6B00", background: "transparent", color: "#FF6B00", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                        <Sparkles size={13} strokeWidth={2} /> Generează răspuns AI
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  )}

                  {/* ============ AGENT 2 — CLIENȚI INACTIVI ============ */}
                  {aiTabActiv === "clientiInactivi" && (
                  <div style={{ background: c.surface, borderRadius: 18, border: `1.5px solid ${aiAccess.clientiInactivi ? "rgba(245,158,11,.35)" : c.border}`, overflow: "hidden" }}>
                    <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${c.border}` }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: theme === "dark" ? "rgba(245,158,11,.15)" : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Users size={20} color="#D97706" strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>Clienți inactivi</div>
                        <div style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>Identifică clienții care nu au mai revenit și pregătește mesajul de reactivare</div>
                      </div>
                      {aiAccess.clientiInactivi
                        ? <span style={{ fontSize: 11, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,.12)", padding: "4px 10px", borderRadius: 50, flexShrink: 0 }}>Activ</span>
                        : <span style={{ fontSize: 11, fontWeight: 800, color: c.muted, background: c.surface2, padding: "4px 10px", borderRadius: 50, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><Lock size={11} strokeWidth={2.4} /> Plan Pro</span>}
                    </div>

                    {!aiAccess.clientiInactivi ? (
                      <PoartaPlan plan="pro" text={"Recâștigă clienții care nu au mai trecut pe la salon, cu mesaje pregătite de AI."} />
                    ) : (
                      <div style={{ padding: "16px 18px" }}>
                        {/* Bara de control: ultima analiză + buton */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                          <div style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>
                            {ultimaAnalizaRisc
                              ? <>Ultima analiză: <strong style={{ color: c.text }}>{new Date(ultimaAnalizaRisc).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</strong>{!analizaRiscDisponibila && <> · disponibilă din nou în {24 - (oreDeLaAnalizaRisc ?? 0)} {(24 - (oreDeLaAnalizaRisc ?? 0)) === 1 ? "oră" : "ore"}</>}</>
                              : "Nicio analiză făcută încă."}
                          </div>
                          <button
                            onClick={() => salonData?.id && analizaRiscDisponibila && incarcaClientiRisc(salonData.id)}
                            disabled={clientiRiscLoading || !analizaRiscDisponibila}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 50, border: `1.5px solid ${theme === "dark" ? "rgba(245,158,11,.4)" : "#FDE68A"}`, background: theme === "dark" ? "rgba(245,158,11,.1)" : "#FFFBEB", color: "#D97706", fontSize: 12.5, fontWeight: 800, cursor: (clientiRiscLoading || !analizaRiscDisponibila) ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", opacity: (clientiRiscLoading || !analizaRiscDisponibila) ? 0.55 : 1 }}>
                            <Sparkles size={13} color="#D97706" strokeWidth={2} />
                            {clientiRiscLoading ? "Se analizează..." : analizaRiscDisponibila ? "Analizează acum" : "Analiză recentă"}
                          </button>
                        </div>

                        {!analizaRiscDisponibila && (
                          <div style={{ fontSize: 11.5, color: c.xmuted, marginBottom: 14, fontStyle: "italic" }}>
                            Analiza se poate reface o dată la 24 de ore — datele afișate mai jos sunt din ultima analiză.
                          </div>
                        )}

                        {/* Reducere opțională inclusă în mesajul AI */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                          <span style={{ fontSize: 12.5, color: c.muted, fontWeight: 700 }}>Reducere de reactivare (opțional):</span>
                          {[0, 10, 15, 20].map(v => {
                            const activ = reducereRisc === v;
                            return (
                              <button
                                key={v}
                                onClick={() => setReducereRisc(v)}
                                disabled={clientiRiscLoading}
                                style={{ padding: "5px 12px", borderRadius: 50, fontSize: 12.5, fontWeight: 800, fontFamily: "Nunito, sans-serif", cursor: clientiRiscLoading ? "default" : "pointer", border: `1.5px solid ${activ ? "#D97706" : c.border}`, background: activ ? "#D97706" : "transparent", color: activ ? "#fff" : c.muted, transition: "all .15s" }}>
                                {v === 0 ? "Fără" : `${v}%`}
                              </button>
                            );
                          })}
                          {reducereRisc > 0 && (
                            <span style={{ fontSize: 11.5, color: "#D97706", fontWeight: 700 }}>Cod inclus: REVIN{reducereRisc}</span>
                          )}
                        </div>

                        {clientiRiscEroare && (
                          <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.3)", color: "#EF4444", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                            {clientiRiscEroare}
                          </div>
                        )}

                        {!clientiRiscLoading && clientiRisc.length === 0 && !clientiRiscEroare && (
                          <div style={{ padding: "20px", textAlign: "center", color: c.muted, fontSize: 13.5, background: c.surface2, borderRadius: 14, border: `1.5px dashed ${c.border}` }}>
                            {ultimaAnalizaRisc ? "Nicio programare nu indică un client inactiv momentan." : "Apasă butonul „Analizează acum” pentru a vedea clienții care nu au mai revenit."}
                          </div>
                        )}

                        {clientiRisc.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {clientiRisc.map(client => (
                              <div key={client.userId} style={{ background: c.surface2, borderRadius: 16, overflow: "hidden", border: `1.5px solid ${theme === "dark" ? "rgba(245,158,11,.3)" : "#FDE68A"}` }}>
                                <div style={{ height: 3, background: "linear-gradient(90deg, #D97706 0%, #F59E0B 100%)" }} />
                                <div style={{ padding: "14px 16px 16px" }}>
                                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                                    <div>
                                      <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>{client.numeClient}</div>
                                      {client.numeAnimal && (
                                        <div style={{ fontSize: 12, color: c.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                                          <PawPrint size={11} color={c.muted} strokeWidth={2} /> {client.numeAnimal}{client.rasaAnimal ? ` · ${client.rasaAnimal}` : ""}
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                      <div style={{ fontSize: 12, fontWeight: 800, color: "#D97706", background: theme === "dark" ? "rgba(245,158,11,.15)" : "#FEF3C7", padding: "3px 10px", borderRadius: 50 }}>
                                        {client.zileAbsenta} zile absent
                                      </div>
                                      <div style={{ fontSize: 11, color: c.muted, marginTop: 3 }}>obișnuit: la {client.intervalMediu} zile</div>
                                    </div>
                                  </div>

                                  <div style={{ height: 1, background: c.border2, marginBottom: 12 }} />

                                  <div style={{ fontSize: 12.5, color: c.muted, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                                    <Sparkles size={12} color="#D97706" strokeWidth={2} /> Mesaj de reactivare sugerat de AI
                                  </div>
                                  <div style={{ fontSize: 13, color: c.text, lineHeight: 1.65, background: theme === "dark" ? "rgba(245,158,11,.08)" : "#FFFBEB", border: `1px solid ${theme === "dark" ? "rgba(245,158,11,.2)" : "#FDE68A"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                                    {client.mesajAI}
                                  </div>

                                  {client.cod && client.reducere ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "#D97706", background: theme === "dark" ? "rgba(245,158,11,.1)" : "#FEF3C7", border: `1px dashed ${theme === "dark" ? "rgba(245,158,11,.4)" : "#FBBF24"}`, borderRadius: 8, padding: "7px 11px", marginBottom: 12 }}>
                                      <Tag size={12} color="#D97706" strokeWidth={2.2} /> Cod inclus: {client.cod} · {client.reducere}% reducere — de aplicat manual la plată
                                    </div>
                                  ) : null}

                                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(client.mesajAI);
                                        setMesajeCopiate(prev => ({ ...prev, [client.userId]: true }));
                                        setTimeout(() => setMesajeCopiate(prev => ({ ...prev, [client.userId]: false })), 2500);
                                      }}
                                      style={{ flex: 1, minWidth: 120, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${theme === "dark" ? "rgba(245,158,11,.4)" : "#FDE68A"}`, background: mesajeCopiate[client.userId] ? (theme === "dark" ? "rgba(16,185,129,.15)" : "#D1FAE5") : (theme === "dark" ? "rgba(245,158,11,.1)" : "#FFFBEB"), color: mesajeCopiate[client.userId] ? "#10B981" : "#D97706", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all .2s" }}>
                                      {mesajeCopiate[client.userId] ? <><CheckCircle2 size={14} color="#10B981" strokeWidth={2} /> Copiat!</> : <><Download size={13} color="#D97706" strokeWidth={2} /> Copiază mesajul</>}
                                    </button>
                                    {(() => {
                                      const trimis = mesajeTrimise[client.userId];
                                      const loading = mesajTrimiteLoading[client.userId];
                                      return (
                                        <button
                                          onClick={() => trimiteMesajReactivare(client)}
                                          disabled={trimis || loading}
                                          style={{ flex: 1, minWidth: 120, padding: "10px 0", borderRadius: 10, border: "none", background: trimis ? (theme === "dark" ? "rgba(16,185,129,.15)" : "#D1FAE5") : "#D97706", color: trimis ? "#10B981" : "#fff", fontSize: 13, fontWeight: 800, cursor: (trimis || loading) ? "default" : "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: loading ? .7 : 1 }}>
                                          {trimis
                                            ? <><CheckCircle2 size={14} color="#10B981" strokeWidth={2} /> Trimis în aplicație</>
                                            : loading
                                              ? "Se trimite…"
                                              : <><Send size={13} color="#fff" strokeWidth={2} /> Trimite în aplicație</>}
                                        </button>
                                      );
                                    })()}
                                    <button disabled style={{ flex: 1, minWidth: 120, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${c.border}`, background: "transparent", color: c.muted, fontSize: 13, fontWeight: 700, cursor: "not-allowed", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                      <Phone size={13} color={c.muted} strokeWidth={2} /> Trimite SMS (în curând)
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  )}

                  {/* ============ AGENT 3 — FIȘĂ ÎNGRIJIRE POST-GROOMING ============ */}
                  {aiTabActiv === "fisaIngrijire" && (() => {
                    const finalizate = programari
                      .filter(p => p.status === "finalizat" && p.esteApp && p.user_id && p.animalNume)
                      .sort((a, b) => (b.data + b.ora).localeCompare(a.data + a.ora))
                      .slice(0, 20);
                    return (
                    <div style={{ background: c.surface, borderRadius: 18, border: `1.5px solid ${aiAccess.fisaIngrijire ? "rgba(59,130,246,.35)" : c.border}`, overflow: "hidden" }}>
                      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: theme === "dark" ? "rgba(59,130,246,.15)" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <ClipboardList size={20} color="#3B82F6" strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>{DS.fisaTitlu}</div>
                          <div style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>Trimite clientului sfaturi de îngrijire personalizate pe rasă, după fiecare vizită</div>
                        </div>
                        {aiAccess.fisaIngrijire
                          ? <span style={{ fontSize: 11, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,.12)", padding: "4px 10px", borderRadius: 50, flexShrink: 0 }}>Activ</span>
                          : <span style={{ fontSize: 11, fontWeight: 800, color: c.muted, background: c.surface2, padding: "4px 10px", borderRadius: 50, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><Lock size={11} strokeWidth={2.4} /> Plan Business</span>}
                      </div>

                      {!aiAccess.fisaIngrijire ? (
                        <PoartaPlan plan="business" text={DS.fisaPitch} />
                      ) : finalizate.length === 0 ? (
                        <div style={{ padding: "22px 18px", textAlign: "center" }}>
                          <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}><ClipboardList size={26} color="#3B82F6" strokeWidth={1.5} /></div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: c.text, marginBottom: 2 }}>Nicio programare finalizată încă</div>
                          <div style={{ fontSize: 12, color: c.muted }}>După ce o programare din aplicație devine finalizată, poți trimite clientului o fișă de îngrijire.</div>
                        </div>
                      ) : (
                        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                          {finalizate.map(p => {
                            const st = fisaState[p.id];
                            return (
                              <div key={p.id} style={{ background: c.surface2, borderRadius: 12, padding: "12px 14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                    {p.clientAvatar
                                      ? <img src={p.clientAvatar} alt={p.client} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                                      : <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.orangeAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#FF6B00", flexShrink: 0 }}>{p.client.charAt(0)}</div>}
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>{p.animalNume}{p.rasa ? ` · ${p.rasa}` : ""}</div>
                                      <div style={{ fontSize: 11, color: c.muted }}>{p.client} · {p.serviciu} · {new Date(p.data).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}</div>
                                    </div>
                                  </div>
                                  {st?.trimis
                                    ? <span style={{ fontSize: 11, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,.12)", padding: "5px 11px", borderRadius: 50, display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}><CheckCircle2 size={13} strokeWidth={2.4} /> Trimisă</span>
                                    : !st || (!st.draft && !st.generand)
                                      ? <button onClick={() => genereazaFisa(p)}
                                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 50, border: "1.5px solid #3B82F6", background: "transparent", color: "#3B82F6", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                                          <Sparkles size={13} strokeWidth={2} /> Generează fișa
                                        </button>
                                      : null}
                                </div>

                                {st && (st.generand || st.draft) && !st.trimis && (
                                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: "#3B82F6", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                      <Sparkles size={12} strokeWidth={2} /> Fișă AI {st.generand ? "— se generează…" : "(editabilă)"}
                                    </div>
                                    <textarea
                                      value={st.draft}
                                      onChange={e => setFisa(p.id, { draft: e.target.value })}
                                      disabled={st.generand}
                                      rows={8}
                                      style={{ width: "100%", boxSizing: "border-box", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text, fontSize: 12.5, fontFamily: "Nunito, sans-serif", lineHeight: 1.6, padding: "9px 11px", resize: "vertical" }}
                                    />
                                    {st.eroare && <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 6 }}>{st.eroare}</div>}
                                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                                      {/* Fișa se scrie o singură dată. Textul rămâne editabil
                                          de mână, dar nu se mai cere alta de la model. */}
                                      <span style={{ fontSize: 11.5, color: c.xmuted, alignSelf: "center" }}>
                                        Poți edita textul înainte să-l trimiți.
                                      </span>
                                      <button onClick={() => trimiteFisa(p)} disabled={st.generand || st.trimitand || !st.draft.trim()}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 50, border: "none", background: "#3B82F6", color: "#fff", fontSize: 12, fontWeight: 800, cursor: (st.generand || st.trimitand || !st.draft.trim()) ? "default" : "pointer", opacity: (st.generand || st.trimitand || !st.draft.trim()) ? .5 : 1, fontFamily: "Nunito, sans-serif" }}>
                                        <Send size={13} strokeWidth={2} /> {st.trimitand ? "Se trimite…" : "Trimite clientului"}
                                      </button>
                                    </div>
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

                  {/* ============ AGENT CONSULTANT AI ============ */}
                  {aiTabActiv === "consultant" && (() => {
                    const snapshot = computeSnapshot(programari, recenziiSalon, numeSalon);
                    const sugestii = computeSugestii(snapshot);
                    const ramaseIntrebari = 5 - intrebariLuna;
                    const lunaCurentaLabel = new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
                    const RAPOARTE_DEF: { tip: string; Icon: LucideIcon; iconColor: string; label: string; desc: string }[] = [
                      { tip: "lunar", Icon: BarChart3, iconColor: "#FF6B00", label: "Raportul lunii", desc: "Ce a mers, ce nu, 3 recomandări" },
                      { tip: "preturi", Icon: Wallet, iconColor: "#10B981", label: "Analiză prețuri & încasări", desc: "Unde câștigi și unde pierzi bani" },
                      { tip: "crestere", Icon: TrendingUp, iconColor: "#6366F1", label: "Plan de creștere", desc: "3 acțiuni concrete, prioritizate" },
                      { tip: "echipa", Icon: Users, iconColor: "#F59E0B", label: "Performanța echipei", desc: `Productivitatea ${DS.rolPlural}` },
                    ];
                    const p = isMobile ? "12px 14px" : "16px 18px";
                    const pInner = isMobile ? "12px 14px" : "16px 18px";
                    return (
                    <div style={{ background: c.surface, borderRadius: isMobile ? 14 : 18, border: `1.5px solid ${aiAccess.consultant ? "rgba(99,102,241,.35)" : c.border}`, overflow: "hidden" }}>
                      {/* Header */}
                      <div style={{ padding: p, display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: theme === "dark" ? "rgba(99,102,241,.15)" : "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Sparkles size={18} color="#6366F1" strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 900, color: c.text }}>Consultant AI</div>
                          {!isMobile && <div style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>Rapoarte de business pregătite din datele tale reale</div>}
                        </div>
                        {aiAccess.consultant
                          ? <span style={{ fontSize: 10, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,.12)", padding: "3px 9px", borderRadius: 50, flexShrink: 0 }}>Activ</span>
                          : <span style={{ fontSize: 10, fontWeight: 800, color: c.muted, background: c.surface2, padding: "3px 9px", borderRadius: 50, display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}><Lock size={10} strokeWidth={2.4} />{!isMobile && " Plan Business"}</span>}
                      </div>

                      {!aiAccess.consultant ? (
                        <PoartaPlan plan="business" text={"Consultantul AI îți pregătește rapoarte de business din datele reale ale salonului tău."} />
                      ) : (
                        <div style={{ padding: pInner }}>

                          {/* Insights gratuite (zero cost) */}
                          {sugestii.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: "#6366F1", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={11} color="#6366F1" strokeWidth={2} /> Ce am observat în datele tale</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {sugestii.map((s, i) => (
                                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, background: theme === "dark" ? "rgba(99,102,241,.08)" : "#EEF2FF", borderRadius: 10, padding: isMobile ? "10px 11px" : "9px 12px", border: `1px solid ${theme === "dark" ? "rgba(99,102,241,.2)" : "#C7D2FE"}` }}>
                                    {React.createElement(s.icon, { size: 16, color: "#6366F1", strokeWidth: 2, style: { flexShrink: 0 } })}
                                    <span style={{ flex: 1, fontSize: isMobile ? 12 : 12.5, color: c.text, fontWeight: 600, lineHeight: 1.4 }}>{s.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rapoarte premium */}
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: c.muted, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 7 }}>Rapoarte premium — {lunaCurentaLabel}</div>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
                              {RAPOARTE_DEF.map(r => {
                                const gata = !!rapoarte[r.tip];
                                const seGenereaza = raportLoading === r.tip;
                                const deschis = consRaportDeschis === r.tip;
                                return (
                                  <button key={r.tip} onClick={() => genereazaRaport(r.tip)} disabled={!!raportLoading}
                                    style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: deschis ? (theme === "dark" ? "rgba(99,102,241,.14)" : "#EEF2FF") : c.surface2, border: `1.5px solid ${deschis ? "#6366F1" : c.border}`, borderRadius: 12, padding: "11px 13px", cursor: raportLoading ? "default" : "pointer", fontFamily: "Nunito, sans-serif", opacity: (raportLoading && !seGenereaza) ? .55 : 1, width: "100%" }}>
                                    <span style={{ width: 32, height: 32, borderRadius: 8, background: theme === "dark" ? "rgba(255,255,255,.06)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><r.Icon size={17} color={r.iconColor} strokeWidth={2} /></span>
                                    <span style={{ flex: 1, minWidth: 0 }}>
                                      <span style={{ display: "block", fontSize: 13, fontWeight: 800, color: c.text }}>{r.label}</span>
                                      <span style={{ display: "block", fontSize: 11, color: c.muted, fontWeight: 600, lineHeight: 1.3 }}>{r.desc}</span>
                                    </span>
                                    {seGenereaza
                                      ? <span style={{ display: "inline-flex", gap: 3, flexShrink: 0 }}>{[0,1,2].map(j => <span key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366F1", opacity: .7 }} />)}</span>
                                      : <span style={{ fontSize: 9, fontWeight: 800, color: gata ? "#10B981" : "#6366F1", background: gata ? "rgba(16,185,129,.12)" : "transparent", border: gata ? "none" : "1.5px solid #6366F1", padding: "3px 8px", borderRadius: 50, flexShrink: 0, textTransform: "uppercase", letterSpacing: .5 }}>{gata ? "Vezi" : "Generează"}</span>}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Raport deschis */}
                            {consRaportDeschis && (rapoarte[consRaportDeschis] || raportLoading === consRaportDeschis) && (
                              <div style={{ marginTop: 10, background: c.surface2, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: isMobile ? "13px 14px" : "16px 18px" }}>
                                {raportLoading === consRaportDeschis ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: c.muted, fontSize: 13 }}>
                                    <span style={{ display: "inline-flex", gap: 4 }}>{[0,1,2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", opacity: .7 }} />)}</span>
                                    Pregătesc raportul...
                                  </div>
                                ) : (
                                  <>
                                    <div style={{ wordBreak: "break-word" }}><RaportFormatat text={rapoarte[consRaportDeschis]!.continut} c={c} isMobile={isMobile} /></div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${c.border}`, flexWrap: "wrap", gap: 6 }}>
                                      <span style={{ fontSize: 10.5, color: c.xmuted, fontWeight: 600 }}>Generat {new Date(rapoarte[consRaportDeschis]!.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                      <button onClick={() => genereazaRaport(consRaportDeschis, true)} disabled={!!raportLoading}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: "#6366F1", background: "none", border: "1.5px solid #6366F1", borderRadius: 50, padding: "5px 12px", cursor: raportLoading ? "default" : "pointer", fontFamily: "Nunito, sans-serif", opacity: raportLoading ? .5 : 1 }}>
                                        <RefreshCw size={12} strokeWidth={2.4} /> Regenerează
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                            {raportEroare && <div style={{ marginTop: 8, fontSize: 12, color: "#DC2626", fontWeight: 700 }}>{raportEroare}</div>}
                          </div>

                          {/* Intrebare punctuala (5/luna) */}
                          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 14 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: c.muted, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 7 }}>Întrebare punctuală</div>

                            {/* Istoric Q&A */}
                            {qaList.length > 0 && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, maxHeight: isMobile ? 260 : 340, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
                                {qaList.map((qa, i) => (
                                  <div key={i}>
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                                      <div style={{ maxWidth: isMobile ? "90%" : "82%", background: theme === "dark" ? "rgba(255,107,0,.18)" : "#FFF3EA", border: "1.5px solid rgba(255,107,0,.4)", borderRadius: "14px 14px 4px 14px", padding: isMobile ? "8px 11px" : "9px 13px", fontSize: isMobile ? 12.5 : 13, color: c.text, fontWeight: 700, lineHeight: 1.55, wordBreak: "break-word" }}>{qa.q}</div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                      <div style={{ maxWidth: isMobile ? "92%" : "85%", background: c.surface2, border: `1.5px solid ${c.border}`, borderRadius: "14px 14px 14px 4px", padding: isMobile ? "9px 12px" : "11px 14px", wordBreak: "break-word" }}>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: "#6366F1", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={9} color="#6366F1" strokeWidth={2} /> Consultant AI</div>
                                        <RaportFormatat text={qa.a} c={c} isMobile={isMobile} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {intrebareLoading && (
                                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                    <div style={{ background: c.surface2, border: `1.5px solid ${c.border}`, borderRadius: "14px 14px 14px 4px", padding: "10px 14px" }}>
                                      <span style={{ display: "inline-flex", gap: 4 }}>{[0,1,2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", opacity: .7 }} />)}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Input intrebare */}
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                              <textarea
                                value={consultantInput}
                                onChange={e => setConsultantInput(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !isMobile) { e.preventDefault(); puneIntrebare(); } }}
                                disabled={intrebareLoading || ramaseIntrebari <= 0}
                                rows={isMobile ? 2 : 1}
                                placeholder={ramaseIntrebari <= 0 ? "Ai folosit cele 5 întrebări pe luna aceasta" : "Întreabă ceva punctual despre salon..."}
                                style={{ flex: 1, borderRadius: 14, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text, fontSize: 13, fontFamily: "Nunito, sans-serif", padding: "10px 14px", outline: "none", resize: "none", lineHeight: 1.5, minHeight: isMobile ? 54 : 42 }}
                              />
                              <button onClick={() => puneIntrebare()} disabled={intrebareLoading || !consultantInput.trim() || ramaseIntrebari <= 0}
                                style={{ width: 42, height: 42, borderRadius: 12, border: "none", background: "#6366F1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: (intrebareLoading || !consultantInput.trim() || ramaseIntrebari <= 0) ? "default" : "pointer", opacity: (intrebareLoading || !consultantInput.trim() || ramaseIntrebari <= 0) ? .45 : 1, flexShrink: 0, marginBottom: isMobile ? 6 : 1 }}>
                                <Send size={16} strokeWidth={2} />
                              </button>
                            </div>

                            <div style={{ marginTop: 7 }}>
                              <span style={{ fontSize: 11, color: ramaseIntrebari <= 1 ? "#D97706" : c.xmuted, fontWeight: ramaseIntrebari <= 1 ? 700 : 500 }}>
                                {ramaseIntrebari > 0 ? `${ramaseIntrebari} din 5 întrebări rămase luna aceasta` : "Întrebările se reîncarcă luna viitoare. Rapoartele rămân disponibile."}
                              </span>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                    );
                  })()}

                  {/* ============ AGENT 4 — POSTĂRI SOCIALE (în curând) ============ */}
                  {aiTabActiv === "postari" && (
                  <div style={{ background: c.surface, borderRadius: 18, border: `1.5px solid ${c.border}`, overflow: "hidden", opacity: 0.85 }}>
                    <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ImageIcon size={20} color={c.muted} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>Postări sociale</div>
                        <div style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>Generează postări pentru social media în câteva secunde</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: c.muted, background: c.surface2, padding: "4px 10px", borderRadius: 50, flexShrink: 0 }}>În curând</span>
                    </div>
                  </div>
                  )}

                    </div>{/* end flex-column content */}
                    </div>
                  );
                  const grilaAgenti = (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: isMobile ? 4 : 24 }}>
                      {AI_DEFS.map((ag, idx) => {
                        const sel = aiTabActiv === ag.key;
                        return (
                          <React.Fragment key={ag.key}>
                          <button
                            onClick={() => setAiTab(sel ? null : ag.key)}
                            style={{
                              position: "relative", display: "flex", flexDirection: ag.comingSoon && !isMobile ? "row" : "column",
                              alignItems: ag.comingSoon && !isMobile ? "center" : "flex-start",
                              gap: ag.comingSoon && !isMobile ? 14 : 0,
                              textAlign: "left", padding: ag.comingSoon ? "14px 18px" : (!ag.acces && ag.plan ? "18px 18px 46px" : "18px 18px 20px"),
                              borderRadius: 18, fontFamily: "Nunito, sans-serif",
                              border: sel ? `2px solid ${ag.color}` : `1px solid ${theme === "dark" ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
                              background: sel
                                ? theme === "dark"
                                  ? `linear-gradient(135deg, rgba(${ag.rgb},.13) 0%, rgba(${ag.rgb},.05) 100%)`
                                  : `linear-gradient(135deg, rgba(${ag.rgb},.08) 0%, rgba(${ag.rgb},.03) 100%)`
                                : c.surface,
                              boxShadow: sel ? `0 0 0 1px ${ag.color}22, 0 8px 28px ${ag.color}18` : c.cardShadow,
                              cursor: "pointer", transition: "all .2s",
                              opacity: ag.comingSoon ? .72 : 1,
                              gridColumn: (ag.comingSoon && !isMobile) ? "span 2" : undefined,
                            }}>
                            {/* Număr ordine */}
                            <div style={{ fontSize: 10, fontWeight: 900, color: ag.color, opacity: sel ? .65 : .28, letterSpacing: 1.5, marginBottom: ag.comingSoon && !isMobile ? 0 : 10, flexShrink: 0 }}>0{idx + 1}</div>
                            {/* Icoană */}
                            <div style={{ width: ag.comingSoon && !isMobile ? 38 : 46, height: ag.comingSoon && !isMobile ? 38 : 46, borderRadius: 14, background: `rgba(${ag.rgb},${sel ? .18 : .10})`, boxShadow: sel ? `0 0 18px ${ag.color}28` : "none", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: ag.comingSoon && !isMobile ? 0 : 14, flexShrink: 0, transition: "box-shadow .2s" }}>
                              <ag.Icon size={ag.comingSoon && !isMobile ? 18 : 22} color={ag.color} strokeWidth={1.8} />
                            </div>
                            {/* Texte */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: ag.comingSoon && !isMobile ? 13 : 14, fontWeight: 900, color: c.text, marginBottom: 3 }}>{ag.label}</div>
                              <div style={{ fontSize: 11.5, color: c.muted, lineHeight: 1.5, fontWeight: 600 }}>{ag.desc}</div>
                            </div>
                            {/* Badge status */}
                            <div style={{ position: "absolute", top: 13, right: 13 }}>
                              {ag.comingSoon
                                ? <span style={{ fontSize: 9, fontWeight: 900, color: ag.color, background: `rgba(${ag.rgb},.13)`, padding: "3px 8px", borderRadius: 50, letterSpacing: .8, textTransform: "uppercase" as const }}>În curând</span>
                                : ag.acces
                                  ? <span style={{ fontSize: 9, fontWeight: 900, color: "#10B981", background: "rgba(16,185,129,.12)", padding: "3px 8px", borderRadius: 50, letterSpacing: .8, textTransform: "uppercase" as const }}>Activ</span>
                                  : <span style={{ fontSize: 9, fontWeight: 900, color: c.muted, background: c.surface2, padding: "3px 8px", borderRadius: 50, display: "flex", alignItems: "center", gap: 3, letterSpacing: .5, textTransform: "uppercase" as const }}><Lock size={9} strokeWidth={2.5} />Blocat</span>
                              }
                            </div>
                            {/* Bara jos — accent (activ) sau info plan (blocat) */}
                            {!ag.comingSoon && ag.acces && (
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: "0 0 18px 18px", background: sel ? ag.color : "transparent", transition: "background .2s" }} />
                            )}
                            {!ag.comingSoon && !ag.acces && ag.plan && (
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: `1px solid ${theme === "dark" ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}`, borderRadius: "0 0 18px 18px", padding: "7px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: theme === "dark" ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)" }}>
                                <span style={{ fontSize: 10.5, color: c.muted, fontWeight: 700 }}>Disponibil în planul <strong style={{ color: c.text2 }}>{ag.plan}</strong></span>
                                <span onClick={e => { e.stopPropagation(); setTab("abonament"); }} style={{ fontSize: 10.5, fontWeight: 800, color: ag.color, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0 }}>Schimbă planul →</span>
                              </div>
                            )}
                          </button>
                          {isMobile && sel && (
                            <div style={{ gridColumn: "1 / -1", marginTop: 4, marginBottom: 14 }}>{panouAgent}</div>
                          )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  );
                  return (<>
                    {grilaAgenti}
                    {!isMobile && panouAgent}
                  </>);
                })()}
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
              const groomerActiv = groomerProgramTab !== "toti" ? echipa.find(g => g.nume === groomerProgramTab) : null;
              const programEfectiv = groomerActiv?.orar && Object.keys(groomerActiv.orar).length > 0 ? groomerActiv.orar : program;
              const programZiSel = programEfectiv[String(dowSel)];
              const sloturiPosibile = programZiSel ? genereazaSloturiZi(programZiSel, stepCalendar) : [];
              const sloturiZiVizibile = groomerProgramTab === "toti"
                ? sloturiZi
                : sloturiZi.filter(p => !p.groomer || p.groomer === groomerProgramTab);
              const aziIso = isoData(new Date());
              const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

              return (
                <div style={{ maxWidth: 900 }}>
                  <PageHeader icon={Clock} title="Program & disponibilitate" sub="Setează orarul săptămânal și gestionează sloturile" />

                  {/* ORAR SĂPTĂMÂNAL */}
                  <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: c.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><CalendarDays size={16} color="#FF6B00" strokeWidth={2} /> Orar săptămânal</div>
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
                    <div style={{ fontSize: 15, fontWeight: 900, color: c.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Clock size={16} color="#FF6B00" strokeWidth={2} /> Gestionează sloturi (următoarele 14 zile)</div>

                    {echipa.length > 0 && (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Specialist</div>
                        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 14, borderBottom: `1px solid ${c.border2}` }}>
                          <button onClick={() => setGroomerProgramTab("toti")}
                            style={{ padding: "8px 14px", borderRadius: 10, border: groomerProgramTab === "toti" ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: groomerProgramTab === "toti" ? c.orangeAccent : c.surface, color: groomerProgramTab === "toti" ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                            <Users size={13} color="currentColor" strokeWidth={2} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Toți
                          </button>
                          {userieActivi.map(g => (
                            <button key={g.id} onClick={() => setGroomerProgramTab(g.nume)}
                              style={{ padding: "8px 14px", borderRadius: 10, border: groomerProgramTab === g.nume ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: groomerProgramTab === g.nume ? c.orangeAccent : c.surface, color: groomerProgramTab === g.nume ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                              <User size={13} color="currentColor" strokeWidth={2} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> {g.nume || "Specialist"}
                            </button>
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: c.muted, marginBottom: 12 }}>
                          {groomerProgramTab === "toti"
                            ? "Vezi sloturile salonului (orar salon, toate programările)."
                            : `Vezi grila lui ${groomerProgramTab} — orarul lui și doar programările atribuite lui.`}
                        </div>
                      </>
                    )}

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
                        {groomerProgramTab === "toti" ? "Salon închis în această zi. Modifică orarul săptămânal pentru a deschide." : `${groomerProgramTab} nu lucrează în această zi.`}
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: c.muted, marginBottom: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981", display: "inline-block" }} /> Liber</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF6B00", display: "inline-block" }} /> Rezervat (CalyHub)</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} /> Blocat manual</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                          {sloturiPosibile.map(slot => {
                            const ocupare = sloturiZiVizibile.find(p => suprapunere(slot, stepCalendar, p));
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
                                  setGroomerBlocare(groomerProgramTab === "toti" ? "toti" : groomerProgramTab);
                                }
                              }}
                                style={{ padding: "10px 6px", borderRadius: 10, border: `1.5px solid ${border}`, background: bg, color, fontSize: 12, fontWeight: 800, cursor: (eTrecut && !ocupare) ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", textAlign: "center", opacity: eTrecut && !ocupare ? 0.5 : 1 }}>
                                <div>{label}</div>
                                {ocupare && ocupaPrimulSlot && (
                                  <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, opacity: .85 }}>
                                    {ocupare.sursa === "app" ? "App" : ocupare.sursa === "telefonic" ? `${ocupare.nume_client_extern || "Telefonic"}` : ocupare.sursa === "walkin" ? `${ocupare.nume_client_extern || "Walk-in"}` : "Pauză"}
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
                          {[{ v: "telefonic", l: "Telefonic" }, { v: "walkin", l: "Walk-in" }, { v: "blocaj", l: "Pauză" }].map(o => (
                            <button key={o.v} onClick={() => setTipBlocare(o.v as any)}
                              style={{ padding: "10px 6px", borderRadius: 10, border: tipBlocare === o.v ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: tipBlocare === o.v ? c.orangeAccent : c.surface, color: tipBlocare === o.v ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                              {o.l}
                            </button>
                          ))}
                        </div>

                        {/* Doar la clienți reali. La pauză nu se cere nimic — e o oră
                            blocată, nu o vizită, și nu intră în nicio statistică. */}
                        {tipBlocare !== "blocaj" && (
                          <>
                            {servicii.length > 0 && (
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 6 }}>Serviciu <span style={{ color: c.xmuted, fontWeight: 600 }}>(opțional)</span></div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {servicii.filter(sv => sv.nume.trim()).map(sv => {
                                    const ales = serviciuBlocare === sv.nume;
                                    return (
                                      <button key={sv.id} onClick={() => {
                                        if (ales) { setServiciuBlocare(""); return; }
                                        setServiciuBlocare(sv.nume);
                                        // Prețul și durata se completează singure, ca la
                                        // rezervarea din aplicație. Pot fi schimbate după.
                                        const p = sv.pret || sv.preturi?.medie || "";
                                        if (p) setPretBlocare(String(p));
                                        const d = Number(sv.durata || sv.durate?.medie || 0);
                                        if (d > 0) setDurataBlocare(d);
                                      }}
                                        style={{ padding: "8px 13px", borderRadius: 50, border: ales ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: ales ? c.orangeAccent : c.surface, color: ales ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                        {sv.nume}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 6 }}>Preț încasat <span style={{ color: c.xmuted, fontWeight: 600 }}>(opțional)</span></div>
                              <input value={pretBlocare} onChange={e => setPretBlocare(e.target.value)} type="number" placeholder="—" style={inp} />
                              <div style={{ fontSize: 11, color: c.muted, marginTop: 6, lineHeight: 1.5 }}>
                                {pretBlocare
                                  ? "Intră la Încasări, ca orice vizită."
                                  : "Fără preț, se numără doar la Programări — nu la Încasări."}
                              </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 6 }}>Nume client <span style={{ color: c.xmuted, fontWeight: 600 }}>(opțional)</span></div>
                              <input value={numeBlocare} onChange={e => setNumeBlocare(e.target.value)} placeholder="Ex: Maria Popescu" style={inp} />
                              <button onClick={() => setTineMinteClient(v => !v)}
                                style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                                <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: tineMinteClient ? "none" : `1.5px solid ${c.border}`, background: tineMinteClient ? "#FF6B00" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {tineMinteClient && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                                </span>
                                <span style={{ fontSize: 12.5, color: c.text2, fontWeight: 700 }}>Ține minte clientul</span>
                              </button>
                              <div style={{ fontSize: 11, color: c.muted, marginTop: 6, lineHeight: 1.5 }}>
                                {tineMinteClient
                                  ? "Apare în Istoric clienți, cu vizitele lui."
                                  : "Ora se blochează, dar nu reținem pe nimeni."}
                              </div>
                            </div>
                          </>
                        )}

                        {echipa.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 8 }}>Specialist</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              <button onClick={() => setGroomerBlocare("toti")}
                                style={{ padding: "8px 14px", borderRadius: 50, border: groomerBlocare === "toti" ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: groomerBlocare === "toti" ? "#FF6B00" : c.surface, color: groomerBlocare === "toti" ? "#fff" : c.text2, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                Toți
                              </button>
                              {userieActivi.map(g => (
                                <button key={g.id} onClick={() => setGroomerBlocare(g.nume)}
                                  style={{ padding: "8px 14px", borderRadius: 50, border: groomerBlocare === g.nume ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: groomerBlocare === g.nume ? c.orangeAccent : c.surface, color: groomerBlocare === g.nume ? "#FF6B00" : c.text2, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                  <User size={12} color="currentColor" strokeWidth={2} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> {g.nume || "Specialist"}
                                </button>
                              ))}
                            </div>
                            <div style={{ fontSize: 11, color: c.muted, marginTop: 6 }}>
                              {groomerBlocare === "toti" ? "Blochează slotul pentru toți specialiștii." : `Blochează doar pentru ${groomerBlocare} — ceilalți rămân disponibili.`}
                            </div>
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
                <PageHeader icon={Store} title="Profilul salonului" sub="Actualizează datele publice ale salonului" />

                {/* POZA DE PREZENTARE */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><ImageIcon size={14} color={c.text2} strokeWidth={2} /> Poza de prezentare</div>
                  <div style={{ position: "relative", width: "100%", height: 200, borderRadius: 14, overflow: "hidden", background: c.surface2, border: `1.5px dashed ${c.border}`, marginBottom: 14 }}>
                    {pozaUrl ? (
                      <img src={pozaUrl} alt="Cover salon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <ImageIcon size={40} color={c.muted} strokeWidth={1.5} />
                        <span style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>Nicio poză încărcată</span>
                      </div>
                    )}
                  </div>
                  <label style={{ display: "inline-block", cursor: "pointer" }}>
                    <div style={{ padding: "10px 20px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "inline-block" }}>
                      {uploadingCover ? "Se încarcă..." : pozaUrl ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Pencil size={13} strokeWidth={2} /> Schimbă poza</span> : <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Upload size={13} strokeWidth={2} /> Încarcă poza</span>}
                    </div>
                    <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingCover} onChange={handleCoverSelect} />
                  </label>
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 8 }}>{TEXT_REGULI_POZA}. Această poză apare pe cardul salonului tău.</div>
                </div>

                {/* GALERIE */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, display: "flex", alignItems: "center", gap: 6 }}><ImageIcon size={14} color={c.text2} strokeWidth={2} /> Galerie salon ({galerieVizibila.length}{limiteCurente.maxPoze !== null ? `/${limiteCurente.maxPoze}` : ""})</div>
                    {potAdaugaPoza && (
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
                      <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}><ImageIcon size={32} color={c.muted} strokeWidth={1.5} /></div>
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
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 10 }}>
                    Clienții văd galeria când intră pe profilul salonului tău.
                    {limiteCurente.maxPoze !== null && ` Planul ${numePlan(planIdCurent)} include ${limiteCurente.maxPoze} poze.`}
                  </div>
                  {/* Pozele peste limita planului nu se șterg din storage — se
                      ascund din profil și revin întregi dacă salonul urcă la loc. */}
                  {pozeAscunse.length > 0 && (
                    <div style={{ fontSize: 11.5, color: "#D97706", marginTop: 6, fontWeight: 700 }}>
                      {pozeAscunse.length} {pozeAscunse.length === 1 ? "poză ascunsă" : "poze ascunse"} din profil — depășesc planul curent. Revin dacă urci la un plan mai mare.
                    </div>
                  )}
                </div>

                {/* DATE SALON */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 16 }}>Date salon</div>
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

                    {/* Specii acceptate — doar la saloanele de grooming */}
                    {areAnimale && (
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Cu ce animale lucrezi</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: 8 }}>
                          {SPECII.map(s => {
                            const sel = speciiSalon.includes(s.val);
                            return (
                              <button key={s.val} type="button"
                                onClick={() => setSpeciiSalon(prev => prev.includes(s.val) ? prev.filter(x => x !== s.val) : [...prev, s.val])}
                                style={{ padding: "10px 4px", borderRadius: 12, border: sel ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: sel ? c.orangeAccent : c.surface2, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all .18s" }}>
                                <span style={{ fontSize: 22 }}>{s.icon}</span>
                                <span style={{ fontSize: 10, fontWeight: 800, color: sel ? "#FF6B00" : c.muted }}>{s.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: 11, color: speciiSalon.length === 0 ? "#EF4444" : c.muted, marginTop: 8, fontWeight: speciiSalon.length === 0 ? 700 : 400 }}>
                          {speciiSalon.length === 0
                            ? "Selectează cel puțin o specie — altfel clienții nu știu dacă le primești animalul."
                            : "Clienții văd asta pe cardul salonului și în profil, înainte să rezerve."}
                        </div>
                      </div>
                    )}

                    {/* Publicul salonului — se alegea doar în wizardul de înscriere, deci
                        saloanele înscrise înainte n-aveau cum să-l completeze niciodată. */}
                    {!areAnimale && (
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Cui se adresează salonul</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                          {[
                            { val: "barbati", titlu: "Bărbați", sub: "Frizerie, barbă, styling" },
                            { val: "dama", titlu: "Damă", sub: "Coafor, culoare, unghii" },
                            { val: "ambele", titlu: "Amândouă", sub: "Salon mixt" },
                          ].map(o => {
                            const sel = publicTinta === o.val;
                            return (
                              <button key={o.val} type="button" onClick={() => setPublicTinta(o.val)}
                                style={{ padding: "11px 12px", borderRadius: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "center",
                                  border: sel ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: sel ? c.orangeAccent : c.surface2, transition: "all .18s" }}>
                                <div style={{ fontSize: 13, fontWeight: 900, color: sel ? "#FF6B00" : c.text }}>{o.titlu}</div>
                                <div style={{ fontSize: 10.5, color: c.muted, marginTop: 2, lineHeight: 1.4 }}>{o.sub}</div>
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: 11, color: publicTinta ? c.muted : "#EF4444", marginTop: 8, fontWeight: publicTinta ? 400 : 700 }}>
                          {publicTinta
                            ? "Clienții văd întâi saloanele care lucrează cu ei."
                            : "Necompletat — clienții nu știu dacă lucrezi cu ei."}
                        </div>
                      </div>
                    )}

                    {/* Specializări — doar la înfrumusețare. Listă fixă, cel mult 3:
                        altfel fiecare salon le bifează pe toate ca să apară peste tot,
                        iar filtrul clientului nu mai selectează nimic. */}
                    {!areAnimale && (
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>
                          Ce fel de salon ești <span style={{ color: c.xmuted, fontWeight: 600 }}>(max. {MAX_SPECIALIZARI})</span>
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 8 }}>
                          {SPECIALIZARI.map(sp => {
                            const sel = specializariSalon.includes(sp.val);
                            const plin = specializariSalon.length >= MAX_SPECIALIZARI && !sel;
                            return (
                              <button key={sp.val} type="button" disabled={plin}
                                onClick={() => setSpecializariSalon(prev => prev.includes(sp.val)
                                  ? prev.filter(x => x !== sp.val)
                                  : prev.length >= MAX_SPECIALIZARI ? prev : [...prev, sp.val])}
                                style={{ textAlign: "left", padding: "11px 13px", borderRadius: 12, cursor: plin ? "not-allowed" : "pointer", opacity: plin ? .45 : 1,
                                  border: sel ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: sel ? c.orangeAccent : c.surface2,
                                  fontFamily: "Nunito, sans-serif", transition: "all .18s" }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: sel ? "#FF6B00" : c.text }}>{sel ? "✓ " : ""}{sp.label}</div>
                                <div style={{ fontSize: 10.5, color: c.muted, marginTop: 2, lineHeight: 1.4 }}>{sp.exemple}</div>
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: 11, color: specializariSalon.length === 0 ? "#EF4444" : c.muted, marginTop: 8, fontWeight: specializariSalon.length === 0 ? 700 : 400 }}>
                          {specializariSalon.length === 0
                            ? "Alege cel puțin una — după ea te găsesc clienții care caută exact ce faci."
                            : `${specializariSalon.length} din ${MAX_SPECIALIZARI} alese. Clienții filtrează lista de saloane după ele.`}
                        </div>
                      </div>
                    )}

                    <button onClick={async () => {
                      if (areAnimale && speciiSalon.length === 0) { salveaza("Selectează cel puțin o specie."); return; }
                      if (!areAnimale && specializariSalon.length === 0) { salveaza("Alege cel puțin o specializare."); return; }
                      const { data: { user: authUser } } = await supabase.auth.getUser();
                      if (authUser) {
                        const patch: any = {
                          nume: profilSalon.numeSalon,
                          adresa: profilSalon.adresa,
                          oras: profilSalon.oras,
                          telefon: profilSalon.telefon,
                          descriere: profilSalon.descriere,
                        };
                        if (areAnimale) patch.specii = speciiSalon;
                        else { patch.specializari = specializariSalon; patch.public_tinta = publicTinta || null; }
                        const { error: eProfil } = await supabase.from("saloane").update(patch).eq("user_id", authUser.id);
                        if (eProfil) { salveaza("Nu am putut salva profilul. Încearcă din nou."); return; }
                        setSalonData((s: any) => ({ ...s, ...patch }));

                        // Adresa s-a putut schimba — refacem punctul de pe hartă,
                        // altfel distanța arătată clienților rămâne cea veche.
                        if (profilSalon.adresa.trim() || profilSalon.oras.trim()) {
                          try {
                            const q = [profilSalon.adresa, profilSalon.oras].filter(Boolean).join(", ");
                            const r = await fetch(`/api/geocod?q=${encodeURIComponent(q)}`);
                            if (r.ok) {
                              const { lat, lng } = await r.json();
                              if (typeof lat === "number" && typeof lng === "number") {
                                await supabase.from("saloane")
                                  .update({ lat, lng, geocodat_la: new Date().toISOString() })
                                  .eq("user_id", authUser.id);
                              }
                            }
                          } catch { /* rămâne fără coordonate */ }
                        }
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
                <PageHeader icon={Scissors} title="Serviciile mele" sub="Gestioneaza serviciile oferite de salon" />
                {/* Lista goală înseamnă două lucruri diferite: „încă se încarcă" și
                    „chiar n-ai niciunul". Fără distincția asta, salonul ar crede că
                    și-a pierdut serviciile și le-ar adăuga din nou. */}
                {!datePregatite && (
                  <div style={{ fontSize: 13, color: c.muted, padding: "18px 0" }}>Se încarcă serviciile…</div>
                )}
                {datePregatite && servicii.length === 0 && (
                  <div style={{ background: c.surface, border: `1.5px dashed ${c.border}`, borderRadius: 16, padding: "22px 24px", marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: c.text, marginBottom: 6 }}>Niciun serviciu adăugat</div>
                    <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.6 }}>
                      Clienții nu pot rezerva până nu adaugi cel puțin unul.
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {servicii.map((s, i) => {
                    const preturi = s.preturi || { mica: s.pret || "", medie: s.pret || "", mare: s.pret || "" };
                    const durate = s.durate || { mica: s.durata || "", medie: s.durata || "", mare: s.durata || "" };
                    const TALII = [
                      { key: "mica" as const, label: "Mică" },
                      { key: "medie" as const, label: "Medie" },
                      { key: "mare" as const, label: "Mare" },
                    ];
                    return (
                    <div key={s.id} style={{ background: c.surface, borderRadius: 16, padding: "16px 20px", border: `1.5px solid ${c.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00" }}>Serviciul {i + 1}</div>
                        <button onClick={() => {
                          // Ultimul serviciu nu se poate șterge: wizardul cere minimum
                          // unul la înscriere, iar un salon fără servicii nu poate primi
                          // nicio programare.
                          if (servicii.length <= 1) { salveaza("Trebuie să rămână cel puțin un serviciu. Modifică-l pe acesta sau adaugă altul întâi."); return; }
                          const nume = s.nume.trim() || "serviciul fără nume";
                          if (!confirm(`Ștergi „${nume}"? Se pierd și prețurile pentru el.`)) return;
                          setServicii(sv => sv.filter(x => x.id !== s.id));
                        }} style={{ fontSize: 12, color: c.xmuted, background: "none", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>✕ Șterge</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input value={s.nume} onChange={e => setServicii(sv => sv.map(x => x.id === s.id ? { ...x, nume: e.target.value } : x))} placeholder="Denumire serviciu" style={inp} />
                        {!areAnimale ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, marginBottom: 5 }}>Preț (RON)</div>
                              <input value={s.pret} onChange={e => setServicii(sv => sv.map(x => x.id === s.id ? { ...x, pret: e.target.value, preturi: undefined } : x))}
                                type="number" placeholder="—" style={{ ...inp, padding: "10px 12px", fontSize: 13 }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, marginBottom: 5 }}>Durată (min)</div>
                              <input value={s.durata} onChange={e => setServicii(sv => sv.map(x => x.id === s.id ? { ...x, durata: e.target.value, durate: undefined } : x))}
                                type="number" placeholder="—" style={{ ...inp, padding: "10px 12px", fontSize: 13 }} />
                            </div>
                          </div>
                        ) : (<>
                        <div style={{ fontSize: 12, color: c.muted, fontWeight: 700, marginTop: 4 }}>Preț și durată pe talie (lasă gol dacă nu oferi pentru o talie):</div>
                        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr", gap: 8, alignItems: "center" }}>
                          <div></div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textAlign: "center" }}>Preț (RON)</div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: c.xmuted, textAlign: "center" }}>Durată (min)</div>
                          {TALII.map(t => (
                            <React.Fragment key={t.key}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: c.text2 }}>
                                {t.label}
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
                        </>)}
                      </div>
                    </div>
                    );
                  })}
                </div>
                <button onClick={() => setServicii(sv => [...sv, { id: Date.now(), sid: idStabil(), nume: "", pret: "", durata: "", preturi: { mica: "", medie: "", mare: "" }, durate: { mica: "", medie: "", mare: "" } }])} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed #FF6B00`, background: c.orangeAccent, color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", marginBottom: 16 }}>+ Adauga serviciu</button>
                <button onClick={async () => {
                  // Aceeași regulă ca în wizard: fără servicii, nimeni nu poate rezerva.
                  const valide = servicii.filter(s => s.nume.trim());
                  if (valide.length === 0) { salveaza("Adaugă cel puțin un serviciu cu denumire înainte să salvezi."); return; }
                  const { data: { user: authUser } } = await supabase.auth.getUser();
                  if (!authUser) { salveaza("Sesiunea a expirat. Reintră în cont."); return; }

                  /*
                   * Redenumirea unui serviciu se propagă la specialiști.
                   *
                   * Legătura ține de `sid`, deci nu se mai rupe — dar numele
                   * salvat lângă el ar rămâne cel vechi și ar apărea în
                   * interfață. Îl aducem la zi în același moment.
                   */
                  const numeDupaSid = new Map(servicii.filter(sv => sv.sid).map(sv => [sv.sid as string, sv.nume]));
                  const echipaSincronizata = echipa.map(g => {
                    if (!Array.isArray(g.servicii_oferite)) return g;
                    let atins = false;
                    const arr = g.servicii_oferite.map(o => {
                      if (typeof o === "string" || !o?.sid) return o;
                      const numeNou = numeDupaSid.get(o.sid);
                      if (!numeNou || numeNou === o.nume) return o;
                      atins = true;
                      return { ...o, nume: numeNou };
                    });
                    return atins ? { ...g, servicii_oferite: arr } : g;
                  });
                  const echipaSchimbata = echipaSincronizata.some((g, i) => g !== echipa[i]);

                  const { error } = await supabase.from("saloane")
                    .update(echipaSchimbata ? { servicii, echipa: echipaSincronizata } : { servicii })
                    .eq("user_id", authUser.id);
                  if (error) { salveaza("Nu am putut salva serviciile. Încearcă din nou."); return; }
                  if (echipaSchimbata) setEchipa(echipaSincronizata);
                  salveaza("Servicii actualizate!");
                }} style={btnPrimary}>Salveaza serviciile</button>
              </div>
            )}

            {/* ECHIPA */}
            {tab === "echipa" && (
              <div style={{ maxWidth: 560 }}>
                <PageHeader icon={Users} title="Echipa mea" sub={DS.echipaSub} />
                {!datePregatite && (
                  <div style={{ fontSize: 13, color: c.muted, padding: "18px 0" }}>Se încarcă echipa…</div>
                )}
                {/* Echipa e opțională — mesajul trebuie să spună că nu e o problemă. */}
                {datePregatite && echipa.length === 0 && (
                  <div style={{ background: c.surface, border: `1.5px dashed ${c.border}`, borderRadius: 16, padding: "22px 24px", marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: c.text, marginBottom: 6 }}>Niciun {DS.rol} adăugat</div>
                    <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.6 }}>
                      Nu e obligatoriu — clienții pot rezerva direct la salon. Dacă adaugi {DS.rolPlural}, clientul își poate alege persoana și fiecare poate avea orar propriu.
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
                  {echipa.map(g => {
                    const orarDeschis = !!groomerOrarDeschis[g.id];
                    const orarG: ProgramSaptamanal = g.orar || PROGRAM_DEFAULT;
                    return (
                      <div key={g.id} style={{ background: c.surface, borderRadius: 16, border: `1.5px solid ${c.border}`, overflow: "hidden" }}>
                        {/* User scos peste limita planului: datele lui rămân, dar
                            nu mai primește rezervări noi. Se întoarce cu un clic,
                            dacă planul are loc. */}
                        {g.activ === false && (
                          <div style={{ background: theme === "dark" ? "rgba(217,119,6,.10)" : "#FFFBEB", borderBottom: "1.5px solid rgba(217,119,6,.35)", padding: "9px 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: "#D97706", flex: 1, minWidth: 180 }}>
                              Inactiv — depășește cei {limiteCurente.maxUseri} useri din planul {numePlan(planIdCurent)}. Nu primește rezervări noi.
                            </span>
                            <button onClick={() => {
                              if (!potAdaugaUser) { setTab("abonament"); return; }
                              setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, activ: true } : x));
                            }}
                              style={{ fontSize: 11.5, fontWeight: 800, color: potAdaugaUser ? "#D97706" : c.muted, background: "transparent", border: `1.5px solid ${potAdaugaUser ? "#D97706" : c.border}`, padding: "6px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                              {potAdaugaUser ? "Reactivează" : "Vezi planurile"}
                            </button>
                          </div>
                        )}
                        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", opacity: g.activ === false ? .6 : 1 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><User size={20} color="#FF6B00" strokeWidth={2} /></div>
                          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 10, minWidth: 0 }}>
                            <input value={g.nume} onChange={e => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, nume: e.target.value } : x))} placeholder="Nume specialist" style={inp} />
                            <input value={g.specialitate} onChange={e => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, specialitate: e.target.value } : x))} placeholder="Specialitate / rol" style={inp} />
                          </div>
                          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <button onClick={() => setGroomerOrarDeschis(s => ({ ...s, [g.id]: !s[g.id] }))}
                              style={{ fontSize: 12, fontWeight: 800, color: orarDeschis ? "#FF6B00" : c.muted, background: orarDeschis ? c.orangeAccent : c.surface2, border: `1.5px solid ${orarDeschis ? "#FF6B00" : c.border}`, padding: "7px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                              Orar {orarDeschis ? "▲" : "▼"}
                            </button>
                            <button onClick={() => {
                              const nume = g.nume.trim() || `acest ${DS.rol}`;
                              // Programările deja făcute pe numele lui rămân, dar apar
                              // în agendă la „Fără specialist" — merită spus înainte.
                              if (!confirm(`Ștergi pe ${nume}? Se pierd orarul și prețurile lui. Programările lui rămân în agendă și în statistici, cu numele de acum.`)) return;
                              setEchipa(ec => ec.filter(x => x.id !== g.id));
                            }} aria-label={`Șterge ${g.nume || "specialistul"}`} style={{ fontSize: 13, color: "#EF4444", background: "rgba(239,68,68,.1)", border: "none", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>✕</button>
                          </div>
                        </div>
                        {orarDeschis && (
                          <div style={{ borderTop: `1.5px solid ${c.border}`, padding: "16px 20px", background: c.surface2 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Orar săptămânal — {g.nume || "specialist"}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {ZILE_ORDINE.map(k => {
                                const zi = orarG[k] || { activ: false, start: "09:00", end: "18:00" };
                                const selStyle: React.CSSProperties = { padding: "6px 8px", borderRadius: 8, border: `1.5px solid ${c.border}`, background: c.input, color: c.text, fontSize: 13, fontWeight: 700, fontFamily: "Nunito, sans-serif", cursor: "pointer" };
                                return (
                                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 36 }}>
                                    <div style={{ width: 80, fontSize: 13, fontWeight: 700, color: zi.activ ? c.text : c.xmuted, flexShrink: 0 }}>{ZILE_LABEL[k]}</div>
                                    <button onClick={() => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, orar: { ...(x.orar || PROGRAM_DEFAULT), [k]: { ...(x.orar?.[k] || PROGRAM_DEFAULT[k]), activ: !zi.activ } } } : x))}
                                      style={{ padding: "5px 12px", borderRadius: 50, border: zi.activ ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: zi.activ ? "#FF6B00" : c.surface, color: zi.activ ? "#fff" : c.muted, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                                      {zi.activ ? "Activ" : "Inactiv"}
                                    </button>
                                    {zi.activ && (
                                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                        <select value={zi.start} onChange={e => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, orar: { ...(x.orar || PROGRAM_DEFAULT), [k]: { ...(x.orar?.[k] || PROGRAM_DEFAULT[k]), start: e.target.value } } } : x))} style={selStyle}>
                                          {ORE_OPTIUNI.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                        <span style={{ fontSize: 12, color: c.muted, fontWeight: 700 }}>—</span>
                                        <select value={zi.end} onChange={e => setEchipa(ec => ec.map(x => x.id === g.id ? { ...x, orar: { ...(x.orar || PROGRAM_DEFAULT), [k]: { ...(x.orar?.[k] || PROGRAM_DEFAULT[k]), end: e.target.value } } } : x))} style={selStyle}>
                                          {ORE_OPTIUNI.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {servicii.length > 0 && (
                              <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: c.xmuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Servicii oferite și prețuri</div>
                                <div style={{ fontSize: 11, color: c.muted, marginBottom: 12 }}>
                                  Bifează serviciile pe care le face {g.nume || "specialistul"}. Prețurile pornesc de la cele ale salonului — modifică-le dacă specialistul are tarife proprii (ex: junior / senior).
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                  {servicii.map(sv => {
                                    const oferite = g.servicii_oferite ?? [];
                                    const idx = gasesteOferit(oferite, sv);
                                    const activ = idx >= 0;
                                    const curent = activ ? oferite[idx] : null;
                                    const ovObj: ServiciuOferit = typeof curent === "string" ? { nume: sv.nume } : (curent as ServiciuOferit) || { nume: sv.nume };
                                    const preturiOv = ovObj.preturi || { mica: "", medie: "", mare: "" };
                                    const durateOv = ovObj.durate || { mica: "", medie: "", mare: "" };
                                    const preturiBaza = sv.preturi || { mica: sv.pret || "", medie: sv.pret || "", mare: sv.pret || "" };
                                    const durateBaza = sv.durate || { mica: sv.durata || "", medie: sv.durata || "", mare: sv.durata || "" };

                                    const updateOv = (mut: (o: ServiciuOferit) => ServiciuOferit) => setEchipa(ec => ec.map(x => {
                                      if (x.id !== g.id) return x;
                                      const arr = [...(x.servicii_oferite ?? [])];
                                      const i = gasesteOferit(arr, sv);
                                      if (i < 0) return x;
                                      // Rândurile vechi sunt doar un nume; le urcăm la obiect cu `sid`,
                                      // ca de-acum înainte să reziste la redenumire.
                                      const obj: ServiciuOferit = typeof arr[i] === "string" ? { sid: sv.sid, nume: sv.nume } : { ...(arr[i] as ServiciuOferit), sid: sv.sid, nume: sv.nume };
                                      arr[i] = mut(obj);
                                      return { ...x, servicii_oferite: arr };
                                    }));

                                    const TALII_LOC = [
                                      { key: "mica" as const, label: "Mică" },
                                      { key: "medie" as const, label: "Medie" },
                                      { key: "mare" as const, label: "Mare" },
                                    ];
                                    const inpSmall: React.CSSProperties = { ...inp, padding: "7px 9px", fontSize: 12 };

                                    return (
                                      <div key={sv.id} style={{ background: c.surface, borderRadius: 12, border: `1.5px solid ${activ ? "#FF6B00" : c.border}`, padding: "12px 14px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: activ ? 12 : 0 }}>
                                          <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>{sv.nume || "Serviciu fără nume"}</div>
                                          <button onClick={() => setEchipa(ec => ec.map(x => {
                                            if (x.id !== g.id) return x;
                                            const arr = [...(x.servicii_oferite ?? [])];
                                            const i = gasesteOferit(arr, sv);
                                            if (i >= 0) arr.splice(i, 1);
                                            else arr.push({ sid: sv.sid, nume: sv.nume });
                                            return { ...x, servicii_oferite: arr };
                                          }))}
                                            style={{ padding: "5px 12px", borderRadius: 50, border: activ ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: activ ? "#FF6B00" : c.surface2, color: activ ? "#fff" : c.muted, fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}>
                                            {activ ? "✓ Face" : "Nu face"}
                                          </button>
                                        </div>
                                        {activ && !areAnimale && (
                                          <>
                                            {/* Fără talii: la oameni un serviciu are un preț, nu trei.
                                                Se scrie pe toate trei cheile ca citirea de la client
                                                (care cade pe „medie") să găsească aceeași valoare. */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                                              <div>
                                                <div style={{ fontSize: 10, fontWeight: 800, color: c.xmuted, marginBottom: 4 }}>Preț (RON)</div>
                                                <input type="number" value={preturiOv.medie || ""} placeholder={preturiBaza.medie ? `${preturiBaza.medie} (salon)` : "—"}
                                                  onChange={e => { const v = e.target.value; updateOv(o => ({ ...o, preturi: { mica: v, medie: v, mare: v } })); }}
                                                  style={inpSmall} />
                                              </div>
                                              <div>
                                                <div style={{ fontSize: 10, fontWeight: 800, color: c.xmuted, marginBottom: 4 }}>Durată (min)</div>
                                                <input type="number" value={durateOv.medie || ""} placeholder={durateBaza.medie ? `${durateBaza.medie} (salon)` : "—"}
                                                  onChange={e => { const v = e.target.value; updateOv(o => ({ ...o, durate: { mica: v, medie: v, mare: v } })); }}
                                                  style={inpSmall} />
                                              </div>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                              <div style={{ fontSize: 10, color: c.xmuted }}>Lasă gol → folosește prețul salonului ({preturiBaza.medie || "—"} RON / {durateBaza.medie || "—"} min).</div>
                                              <button onClick={() => updateOv(o => ({ nume: o.nume }))}
                                                style={{ fontSize: 11, fontWeight: 700, color: c.muted, background: c.surface2, border: `1.5px solid ${c.border}`, padding: "4px 10px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                                ↺ Folosește prețurile salonului
                                              </button>
                                            </div>
                                          </>
                                        )}
                                        {activ && areAnimale && (
                                          <>
                                            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 6, alignItems: "center", marginBottom: 8 }}>
                                              <div></div>
                                              <div style={{ fontSize: 10, fontWeight: 800, color: c.xmuted, textAlign: "center" }}>Preț (RON)</div>
                                              <div style={{ fontSize: 10, fontWeight: 800, color: c.xmuted, textAlign: "center" }}>Durată (min)</div>
                                              {TALII_LOC.map(t => (
                                                <React.Fragment key={t.key}>
                                                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: c.text2 }}>
                                                    {t.label}
                                                  </div>
                                                  <div>
                                                    <input type="number" value={preturiOv[t.key] || ""} placeholder={preturiBaza[t.key] ? `${preturiBaza[t.key]} (salon)` : "—"}
                                                      onChange={e => updateOv(o => ({ ...o, preturi: { ...(o.preturi || { mica: "", medie: "", mare: "" }), [t.key]: e.target.value } }))}
                                                      style={inpSmall} />
                                                  </div>
                                                  <div>
                                                    <input type="number" value={durateOv[t.key] || ""} placeholder={durateBaza[t.key] ? `${durateBaza[t.key]} (salon)` : "—"}
                                                      onChange={e => updateOv(o => ({ ...o, durate: { ...(o.durate || { mica: "", medie: "", mare: "" }), [t.key]: e.target.value } }))}
                                                      style={inpSmall} />
                                                  </div>
                                                </React.Fragment>
                                              ))}
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                              <div style={{ fontSize: 10, color: c.xmuted }}>Lasă gol pe o talie → folosește prețul salonului ({preturiBaza.medie || "—"} RON / {durateBaza.medie || "—"} min pe medie).</div>
                                              <button onClick={() => updateOv(o => ({ nume: o.nume }))}
                                                style={{ fontSize: 11, fontWeight: 700, color: c.muted, background: c.surface2, border: `1.5px solid ${c.border}`, padding: "4px 10px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                                                ↺ Folosește prețurile salonului
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div style={{ fontSize: 11, color: c.xmuted, marginTop: 10 }}>
                                  {(g.servicii_oferite ?? []).length === 0 ? "Niciun serviciu bifat — clienții vor vedea toate serviciile salonului la prețurile de bază." : `${(g.servicii_oferite ?? []).length} ${(g.servicii_oferite ?? []).length === 1 ? "serviciu activ" : "servicii active"}`}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Limita se aplică la adăugare. Nu se șterge nimeni retroactiv —
                    userii peste limită rămân în listă, inactivi. */}
                {potAdaugaUser ? (
                  <button onClick={() => setEchipa(ec => [...ec, { id: Date.now(), uid: idStabil(), nume: "", specialitate: "", orar: { ...PROGRAM_DEFAULT } }])}
                    style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed #FF6B00`, background: c.orangeAccent, color: "#FF6B00", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", marginBottom: 16 }}>
                    + Adaugă specialist
                  </button>
                ) : (
                  <div style={{ padding: "16px 18px", borderRadius: 12, border: `1.5px dashed ${c.border}`, background: c.surface2, marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.text, marginBottom: 4 }}>
                      Ai {userieActivi.length} din {limiteCurente.maxUseri} useri incluși în {numePlan(planIdCurent)}
                    </div>
                    <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.55, marginBottom: 12 }}>
                      {trial.stare === "trial"
                        ? "Ești în trial — poți urca la un plan cu mai mulți useri chiar acum, fără card."
                        : "Urcă la un plan cu mai mulți useri ca să mai adaugi."}
                    </div>
                    <button onClick={() => setTab("abonament")}
                      style={{ fontSize: 13, fontWeight: 800, color: "#fff", background: "#FF6B00", border: "none", borderRadius: 50, padding: "9px 20px", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                      Vezi planurile
                    </button>
                  </div>
                )}
                <button onClick={async () => {
                  const { data: { user: authUser } } = await supabase.auth.getUser();
                  if (!authUser) { salveaza("Sesiunea a expirat. Reintră în cont."); return; }
                  const { error } = await supabase.from("saloane").update({ echipa }).eq("user_id", authUser.id);
                  if (error) { salveaza("Nu am putut salva echipa. Încearcă din nou."); return; }
                  salveaza("Echipa salvată!");
                }} style={btnPrimary}>Salvează echipa</button>
              </div>
            )}

            {/* ABONAMENT */}
            {tab === "abonament" && (
              <div style={{ maxWidth: 720 }}>
                <PageHeader icon={CreditCard} title="Abonamentul meu" sub="Planul salonului și starea trialului" />

                {/* Card plan curent — datele vin din baza, nu din memoria browserului */}
                <div style={{ background: "linear-gradient(135deg, #FF6B00 0%, #FF8C42 100%)", borderRadius: 20, padding: "26px 28px", color: "#fff", marginBottom: 18, boxShadow: "0 8px 28px rgba(255,107,0,.25)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, opacity: .85, marginBottom: 6 }}>Plan ales</div>
                      <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{numePlan(salonData?.plan)}</div>
                      <div style={{ fontSize: 14, opacity: .92, marginTop: 8 }}>
                        {trial.stare === "trial" ? "Trial gratuit — nu se percepe nimic" : trial.stare === "abonat" ? "Abonament activ" : "Trialul s-a încheiat"}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,.18)", padding: "8px 14px", borderRadius: 50, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                      {trial.stare === "trial" ? "În trial" : trial.stare === "abonat" ? "✓ Activ" : "Necesită plan"}
                    </div>
                  </div>
                  {trial.stare === "trial" && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.2)", marginTop: 18, paddingTop: 14, fontSize: 13, opacity: .92 }}>
                      Trialul se încheie în <strong>{zileText(trial.zileRamase)}</strong>
                    </div>
                  )}
                  {trial.stare === "expirat" && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.2)", marginTop: 18, paddingTop: 14, fontSize: 13, opacity: .92 }}>
                      Datele salonului rămân salvate încă <strong>{zileText(trial.zilePanaLaStergere)}</strong>. Programările confirmate se desfășoară normal.
                    </div>
                  )}
                </div>

                <div style={{ background: c.surface, borderRadius: 18, padding: "22px 26px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 14 }}>Detalii</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Plan", numePlan(salonData?.plan)],
                      ["Tip salon", DS.areAnimale ? "Grooming" : "Înfrumusețare"],
                      ["Facturare", cicluCurent === "anual" ? `Anual (-${REDUCERE_ANUALA}%)` : "Lunar"],
                      ["Comision pe programări", "0%"],
                      ["Stare", trial.stare === "trial" ? "Trial gratuit" : trial.stare === "abonat" ? "Abonament activ" : "Trial încheiat"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${c.border2}` }}>
                        <span style={{ color: c.muted }}>{k}</span>
                        <span style={{ fontWeight: 700, color: c.text, textAlign: "right" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schimbarea planului se face aici, nu prin ieșirea pe pagina
                    de înregistrare. În trial e liberă și instantanee: agenții AI
                    citesc `saloane.plan`, deci se deschid și se închid singuri. */}
                <div style={{ background: c.surface, borderRadius: 18, padding: "22px 26px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 4 }}>
                    {trial.stare === "trial" ? "Încearcă orice plan, cât ești în trial" : "Planuri"}
                  </div>
                  <div style={{ fontSize: 12.5, color: c.muted, marginBottom: 16, lineHeight: 1.55 }}>
                    {trial.stare === "trial"
                      ? "Te poți muta între ele oricând, de câte ori vrei. Nu îți cerem cardul și nu se plătește nimic — la finalul trialului îți propunem planul pe care ești."
                      : "Alege planul cu care continui. Plata online nu e încă activă."}
                  </div>

                  {/* Lunar / anual — alegerea se salvează acum în bază. Înainte
                      se pierdea, deși era o promisiune de preț. */}
                  <div style={{ display: "inline-flex", gap: 4, background: c.surface2, border: `1.5px solid ${c.border}`, borderRadius: 50, padding: 4, marginBottom: 16 }}>
                    {(["lunar", "anual"] as Ciclu[]).map(cc => {
                      const activ = cicluCurent === cc;
                      return (
                        <button key={cc} onClick={() => schimbaPlan(planIdCurent as PlanId, cc)} disabled={schimbPlan}
                          style={{ border: "none", borderRadius: 50, padding: "8px 18px", fontFamily: "Nunito, sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer", background: activ ? "#FF6B00" : "transparent", color: activ ? "#fff" : c.muted, display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {cc === "lunar" ? "Lunar" : "Anual"}
                          {cc === "anual" && <span style={{ fontSize: 10, fontWeight: 900, background: activ ? "rgba(255,255,255,.25)" : c.orangeAccent, color: activ ? "#fff" : "#FF6B00", padding: "2px 7px", borderRadius: 50 }}>-{REDUCERE_ANUALA}%</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
                    {PLANURI_SALON.map(pl => {
                      const activ = pl.id === planIdCurent;
                      return (
                        <div key={pl.id} style={{ borderRadius: 16, padding: "16px 18px", border: activ ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: activ ? c.orangeAccent : c.surface2, display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <span style={{ fontSize: 16, fontWeight: 900, color: c.text }}>{pl.nume}</span>
                            {activ && <span style={{ fontSize: 10.5, fontWeight: 900, color: "#FF6B00", background: c.surface, padding: "2px 9px", borderRadius: 50 }}>PLANUL TĂU</span>}
                          </div>
                          <div style={{ fontSize: 12, color: c.muted, fontWeight: 600, lineHeight: 1.45, minHeight: 34 }}>{pl.descriere}</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                            <span style={{ fontSize: 26, fontWeight: 900, color: c.text }}>{pretPlan(pl, cicluCurent)}</span>
                            <span style={{ fontSize: 12, fontWeight: 800, color: c.muted }}>lei / lună</span>
                          </div>
                          <div style={{ fontSize: 11, color: c.xmuted, fontWeight: 600 }}>
                            {cicluCurent === "anual" ? `facturat anual · ${pl.pretLunar} lei dacă plătești lunar` : "facturat lunar"}
                          </div>
                          <button onClick={() => schimbaPlan(pl.id)} disabled={activ || schimbPlan}
                            style={{ marginTop: 4, padding: "9px 0", borderRadius: 50, border: activ ? `1.5px solid ${c.border}` : "none", background: activ ? "transparent" : "#FF6B00", color: activ ? c.muted : "#fff", fontSize: 12.5, fontWeight: 800, cursor: activ ? "default" : "pointer", fontFamily: "Nunito, sans-serif", opacity: schimbPlan ? .6 : 1 }}>
                            {activ ? "Ești pe planul ăsta" : trial.stare === "trial" ? `Încearcă ${pl.nume}` : `Alege ${pl.nume}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={() => router.push("/preturi")}
                    style={{ marginTop: 14, background: "none", border: "none", padding: 0, color: "#FF6B00", fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    Vezi toate caracteristicile fiecărui plan →
                  </button>
                </div>

                <div style={{ background: c.surface2, borderRadius: 16, padding: "16px 20px", border: `1.5px solid ${c.border}`, fontSize: 13, color: c.muted, lineHeight: 1.6 }}>
                  Plata online nu este încă activă. Nu îți cerem cardul și nu se emite nicio factură
                  deocamdată — te anunțăm din timp înainte să se schimbe ceva.
                </div>
              </div>
            )}

            {/* SETARI */}
            {tab === "setari" && (
              <div style={{ maxWidth: 520 }}>
                <PageHeader icon={Settings} title="Setari cont" sub="Modifica datele contului tau de salon" />

                {/* AVATAR */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "24px", border: `1.5px solid ${c.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><ImageIcon size={14} color={c.text2} strokeWidth={2} /> Poza de profil</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ width: 96, height: 96, borderRadius: "50%", background: c.orangeAccent, border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0, overflow: "hidden" }}>
                      {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={40} color="#FF6B00" strokeWidth={2} />}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <label style={{ cursor: "pointer" }}>
                        <div style={{ padding: "10px 18px", borderRadius: 50, border: "1.5px solid #FF6B00", background: c.orangeAccent, color: "#FF6B00", fontSize: 13, fontWeight: 800, fontFamily: "Nunito, sans-serif" }}>
                          {uploadingAvatar ? "Se încarcă..." : avatarUrl ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Pencil size={13} strokeWidth={2} /> Schimbă</span> : <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Upload size={13} strokeWidth={2} /> Încarcă</span>}
                        </div>
                        <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingAvatar}
                          onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }} />
                      </label>
                      {avatarUrl && (
                        <button onClick={stergeAvatar}
                          style={{ padding: "10px 18px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Trash2 size={13} strokeWidth={2} /> Șterge</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 12 }}>{TEXT_REGULI_POZA}</div>
                </div>

                {/* Cele trei câmpuri erau necontrolate, iar butonul afișa „Parola
                    schimbata!" fără să apeleze nimic. Formularul e acum același
                    cu cel din dashboardul clientului, dintr-un singur fișier. */}
                <div style={{ marginBottom: 16 }}>
                  <SchimbaParola c={c} inp={inp} btnPrimary={btnPrimary} theme={theme} onGata={salveaza} />
                </div>
                {/* Butonul n-avea niciun onClick. Avertismentul a plecat în
                    fereastra de confirmare: are efect când apeși, nu cu trei
                    ecrane înainte. */}
                <div style={{ background: c.surface, borderRadius: 20, padding: "18px 22px", border: `1.5px solid ${c.border}` }}>
                  <button onClick={() => { setStergeDeschis(true); setStergeParola(""); setStergeEroare(""); }}
                    style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,.1)", border: "none", padding: "9px 18px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    Șterge salonul
                  </button>
                </div>
              </div>
            )}

            {/* AJUTOR */}
            {tab === "ajutor" && (
              <div style={{ maxWidth: 620 }}>
                <PageHeader icon={HelpCircle} title="Ajutor" sub="Suport dedicat pentru partenerii CalyHub" />
                {/* Răspunsurile promiteau două lucruri care nu există: marcarea
                    unei programări ca neprezentată, și plăți procesate de noi
                    „în 2-3 zile lucrătoare". CalyHub nu atinge banii clientului. */}
                <FAQ items={[
                  { q: "Cum adaug un serviciu nou?", r: areAnimale
                      ? "Din meniu, Serviciile mele → + Adaugă serviciu. Scrii denumirea, apoi prețul și durata pentru fiecare talie — mică, medie, mare. Poți lăsa goală o talie pentru care nu oferi serviciul."
                      : "Din meniu, Serviciile mele → + Adaugă serviciu. Scrii denumirea, prețul și durata, apoi salvezi." },
                  { q: "Cum accept o programare nouă?", r: "În tabul Agendă, cererile noi apar sus, marcate cu portocaliu. Apeși Acceptă ca să confirmi sau Refuză. Clientul e anunțat în ambele cazuri." },
                  { q: "Clientul nu s-a prezentat. Ce fac?", r: "În tabul Agendă, sub calendar, la Vizite încheiate, apeși „Nu s-a prezentat\" pe programarea lui. Iese din încasări și e numărată separat. Dacă te-ai grăbit, „Totuși a venit\" o pune la loc. De la prima neprezentare îți semnalăm clientul și îl poți bloca, ca să nu mai poată rezerva la tine." },
                  { q: "Cum încasez banii de la clienți?", r: "Direct de la client, în salon, ca până acum — CalyHub nu intermediază plata serviciilor și nu reține niciun comision. Aplicația îți aduce programările; banii rămân între tine și client. Singura plată către noi e abonamentul." },
                  { q: "Cum îmi schimb programul de lucru?", r: "Din tabul Program. Acolo setezi orarul pe fiecare zi și poți bloca intervale în care nu primești programări. Fiecare specialist poate avea și un orar propriu, din tabul Echipa mea." },
                  { q: "Cum îmi schimb planul?", r: "Din meniu, Abonamentul meu → Schimbă planul. Plata online nu e încă activă, așa că deocamdată nu se emite nicio factură și nu se reține nimic de pe card." },
                ]} />
                <div style={{ background: c.orangeAccent, border: `1px solid ${c.orangeBorder}`, borderRadius: 16, padding: "18px 22px", marginTop: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#FF6B00", marginBottom: 4 }}>Suport dedicat parteneri</div>
                  <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>
                    Scrie-ne la{" "}
                    <a href="mailto:parteneri@calyhub.ro?subject=Suport%20partener" style={{ color: "#FF6B00", fontWeight: 800 }}>parteneri@calyhub.ro</a>
                    {" "}— răspundem de regulă în aceeași zi lucrătoare.
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Fereastra de închidere a contului. Escape sau clic pe fundal o
            închid, iar „Renunț" e primul buton — la o acțiune fără întoarcere,
            ieșirea trebuie să fie mai ușoară decât intrarea. */}
        {/* ── Coborâre de plan: salonul alege ce rămâne activ ──
            Nici „rămân toți" (ar face din trial o portiță prin care oricine își
            adaugă echipa pe Business și coboară pe Basic), nici „taie aplicația
            primii din listă" (ar decide în locul omului cine mai lucrează). */}
        {coborare && (() => {
          const lim = limitePlan(coborare.plan);
          const preaMultiUseri = lim.maxUseri !== null && coborare.useri.length > lim.maxUseri;
          const preaMultePoze = lim.maxPoze !== null && coborare.poze.length > lim.maxPoze;
          const gata = !preaMultiUseri && !preaMultePoze;
          const arataUseri = lim.maxUseri !== null && userieActivi.length > lim.maxUseri;
          const arataPoze = lim.maxPoze !== null && galerieVizibila.length > lim.maxPoze;
          return (
            <div onClick={() => setCoborare(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
              <div onClick={e => e.stopPropagation()}
                style={{ background: c.surface, borderRadius: 20, border: `1.5px solid ${c.border}`, padding: "24px 26px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: c.text, marginBottom: 6 }}>
                  Treci pe planul {numePlan(coborare.plan)}
                </div>
                <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.6, marginBottom: 18 }}>
                  Alege ce rămâne activ. <strong style={{ color: c.text }}>Nu se șterge nimic</strong> — ce rămâne
                  nebifat își păstrează datele și istoricul, iar dacă urci la loc revine exact cum era.
                  Programările deja confirmate se desfășoară normal, oricum ai alege.
                </div>

                {arataUseri && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 8 }}>
                      Useri — {coborare.useri.length} din {lim.maxUseri} incluși
                      {preaMultiUseri && <span style={{ color: "#EF4444" }}> · mai scoate {coborare.useri.length - (lim.maxUseri || 0)}</span>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {userieActivi.map(g => {
                        const bifat = coborare.useri.includes(g.id);
                        return (
                          <button key={g.id}
                            onClick={() => setCoborare(cb => cb ? { ...cb, useri: bifat ? cb.useri.filter(x => x !== g.id) : [...cb.useri, g.id] } : cb)}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: 12, border: `1.5px solid ${bifat ? "#FF6B00" : c.border}`, background: bifat ? c.orangeAccent : c.surface2, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", width: "100%" }}>
                            <span style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${bifat ? "#FF6B00" : c.border}`, background: bifat ? "#FF6B00" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {bifat && <CheckCircle2 size={12} color="#fff" strokeWidth={3} />}
                            </span>
                            <span style={{ minWidth: 0 }}>
                              <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: c.text }}>{g.nume || "Fără nume"}</span>
                              {g.specialitate && <span style={{ fontSize: 11.5, color: c.muted, fontWeight: 600 }}>{g.specialitate}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {arataPoze && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.text2, marginBottom: 8 }}>
                      Poze în galerie — {coborare.poze.length} din {lim.maxPoze} incluse
                      {preaMultePoze && <span style={{ color: "#EF4444" }}> · mai scoate {coborare.poze.length - (lim.maxPoze || 0)}</span>}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {galerieVizibila.map(u => {
                        const bifat = coborare.poze.includes(u);
                        return (
                          <button key={u}
                            onClick={() => setCoborare(cb => cb ? { ...cb, poze: bifat ? cb.poze.filter(x => x !== u) : [...cb.poze, u] } : cb)}
                            style={{ padding: 0, border: `2.5px solid ${bifat ? "#FF6B00" : c.border}`, borderRadius: 12, cursor: "pointer", background: "none", width: 74, height: 74, overflow: "hidden", position: "relative", opacity: bifat ? 1 : .45 }}>
                            <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 9 }}>
                  <button onClick={() => setCoborare(null)}
                    style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1.5px solid ${c.border}`, background: "transparent", color: c.text2, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    Renunț
                  </button>
                  <button onClick={aplicaCoborare} disabled={!gata || schimbPlan}
                    style={{ flex: 2, padding: "11px 0", borderRadius: 12, border: "none", background: gata ? "#FF6B00" : c.border, color: gata ? "#fff" : c.muted, fontSize: 13.5, fontWeight: 900, cursor: gata && !schimbPlan ? "pointer" : "default", fontFamily: "Nunito, sans-serif", opacity: schimbPlan ? .6 : 1 }}>
                    {schimbPlan ? "Se salvează..." : `Treci pe ${numePlan(coborare.plan)}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {stergeDeschis && (
          <div onClick={() => !stergeLoading && setStergeDeschis(false)}
            style={{ position: "fixed", inset: 0, background: theme === "dark" ? "rgba(0,0,0,.68)" : "rgba(20,14,10,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, zIndex: 1000 }}>
            <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
              style={{ background: c.surface, borderRadius: 20, maxWidth: 430, width: "100%", boxShadow: c.shadow, border: `1.5px solid ${c.border}`, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "20px 22px 0" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(239,68,68,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={20} color="#EF4444" strokeWidth={2.2} />
                </span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: c.text, marginBottom: 3 }}>Închizi salonul?</div>
                  <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5 }}>Nu se poate anula după aceea.</div>
                </div>
              </div>
              <div style={{ padding: "14px 22px 20px" }}>
                <ul style={{ margin: "0 0 14px", paddingLeft: 18, fontSize: 12.5, color: c.text2, lineHeight: 1.75 }}>
                  <li>Salonul dispare din căutare și nu mai poate primi programări.</li>
                  <li><b>Programările viitoare se anulează</b>, iar clienții sunt anunțați.</li>
                  <li>Se șterg datele de contact, pozele, serviciile și echipa.</li>
                  <li>Denumirea rămâne în istoricul clienților, ca vizitele lor să aibă sens.</li>
                  <li>Nu mai poți intra cu acest cont.</li>
                </ul>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: c.text2, marginBottom: 6 }}>Scrie parola ca să confirmi</label>
                <input type="password" value={stergeParola} autoComplete="current-password" autoFocus
                  onChange={e => { setStergeParola(e.target.value); setStergeEroare(""); }}
                  onKeyDown={e => { if (e.key === "Enter" && !stergeLoading) inchideSalonul(); }}
                  placeholder="Parola contului" style={{ ...inp, marginBottom: 10 }} />
                {stergeEroare && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#EF4444", marginBottom: 10 }}>{stergeEroare}</div>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setStergeDeschis(false)} disabled={stergeLoading}
                    style={{ padding: "10px 20px", borderRadius: 50, border: `1.5px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    Renunț
                  </button>
                  <button onClick={inchideSalonul} disabled={stergeLoading}
                    style={{ fontSize: 13, fontWeight: 800, color: "#fff", background: "#EF4444", border: "none", padding: "10px 20px", borderRadius: 50, cursor: stergeLoading ? "wait" : "pointer", fontFamily: "Nunito, sans-serif", opacity: stergeLoading ? .6 : 1 }}>
                    {stergeLoading ? "Se închide..." : "Da, închide salonul"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer variant="salon" onAjutor={() => setTab("ajutor")} />
      </div>

      {/* ── CROP MODAL ── */}
      {cropOpen && cropSrc && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {/* Container crop */}
          <div style={{ position: "relative", width: "min(92vw, 560px)", height: "min(52vw, 315px)", borderRadius: 16, overflow: "hidden", background: "#000" }}>
            <Cropper
              image={cropSrc}
              crop={cropState}
              zoom={cropZoom}
              aspect={16 / 9}
              onCropChange={setCropState}
              onZoomChange={setCropZoom}
              onCropComplete={(_: unknown, px: { x: number; y: number; width: number; height: number }) => setCroppedAreaPixels(px)}
              style={{ containerStyle: { borderRadius: 16 } }}
            />
          </div>

          {/* Zoom slider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, width: "min(92vw, 560px)" }}>
            <ZoomOut size={18} color="#fff" strokeWidth={2} />
            <input type="range" min={1} max={3} step={0.05} value={cropZoom} onChange={e => setCropZoom(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#FF6B00", cursor: "pointer" }} />
            <ZoomIn size={18} color="#fff" strokeWidth={2} />
          </div>

          {/* Previzualizare etichetă */}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 10, fontFamily: "Nunito, sans-serif" }}>
            Mișcă și ajustează zoom-ul pentru a potrivi poza
          </div>

          {/* Butoane */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button onClick={() => { setCropOpen(false); setCropSrc(null); }}
              style={{ padding: "11px 28px", borderRadius: 50, border: "1.5px solid rgba(255,255,255,.25)", background: "transparent", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              Anulează
            </button>
            <button onClick={handleCropSave}
              style={{ padding: "11px 28px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 16px rgba(255,107,0,.4)" }}>
              Salvează poza →
            </button>
          </div>
        </div>
      )}
    </ThemeCtx.Provider>
  );
}

function UserMenu({ numeComplet, numeSalon, tab, onLogout, onNav, isMobile, avatarUrl, pozaUrl, planId, DS }: { numeComplet: string; numeSalon: string; tab: Tab; onLogout: () => void; onNav: (t: Tab) => void; isMobile?: boolean; avatarUrl?: string | null; pozaUrl?: string | null; planId?: string; DS: typeof DOM_SALON[DomeniuSalon] }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Tab | "logout" | null>(null);
  const { theme, c, toggleTheme } = useContext(ThemeCtx);
  const planIdUM = planId || (() => {
    return "basic"; // planul se citeste din baza; "basic" e planul de intrare
  })();
  const planNume = planIdUM ? planIdUM.charAt(0).toUpperCase() + planIdUM.slice(1) : null;
  const aiBlocat = !["basic", "pro", "business"].includes(planIdUM);

  const items: { icon: LucideIcon; label: string; sub: string; t: Tab; locked?: boolean }[] = [
    { icon: Sparkles, label: "Funcții AI", sub: "Asistenții AI ai salonului", t: "functii-ai", locked: aiBlocat },
    { icon: Store, label: "Profilul salonului", sub: "Editeaza datele firmei", t: "profil-salon" },
    { icon: Scissors, label: "Serviciile mele", sub: "Adauga / modifica servicii", t: "servicii" },
    { icon: Users, label: "Echipa mea", sub: `Gestionează ${DS.rolPlural}`, t: "echipa" },
    { icon: DS.areAnimale ? PawPrint : Users, label: DS.istoricTitlu, sub: DS.istoricMeniuSub, t: "animale" },
    { icon: CreditCard, label: "Abonamentul meu", sub: "Plan, facturare, istoric", t: "abonament" },
    { icon: Settings, label: "Setari cont", sub: "Schimba parola", t: "setari" },
    { icon: HelpCircle, label: "Ajutor", sub: "Support dedicat", t: "ajutor" },
  ];

  return (
    <div style={{ position: "relative" }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, padding: isMobile ? "6px 10px 6px 6px" : "6px 14px 6px 8px", borderRadius: 50, border: open ? "2px solid #FF6B00" : `1.5px solid ${c.border}`, background: open ? c.orangeAccent : c.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .15s" }}>
        <span aria-hidden style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scissors size={14} color="#FF6B00" strokeWidth={2} /></span>
        <span style={{ width: 30, height: 30, borderRadius: "50%", background: c.orangeAccent, border: "2px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, overflow: "hidden" }}>
          {(avatarUrl || pozaUrl) ? <img src={avatarUrl || pozaUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={15} color="#FF6B00" strokeWidth={2.2} />}
        </span>
        {!isMobile && <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{numeComplet}</span>}
        <span style={{ fontSize: 10, color: c.xmuted, display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>▼</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 270, background: c.surface, borderRadius: 18, border: `1.5px solid ${c.border}`, boxShadow: c.shadow, overflow: "hidden", zIndex: 200, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 96px)", maxBlockSize: "calc(100dvh - 96px)" }}>
          <div style={{ padding: "14px 18px", background: c.orangeAccent, borderBottom: `1px solid ${c.orangeBorder}`, flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: c.text }}>{numeSalon}</div>
            <div style={{ fontSize: 12, color: "#FF6B00", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>Cont salon <Scissors size={12} color="#FF6B00" strokeWidth={2} /> · {numeComplet}</div>
            {planNume && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, background: "rgba(255,107,0,.12)", borderRadius: 8, padding: "5px 10px" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#FF6B00" }}>Plan {planNume}</span>
                <button onClick={() => { onNav("abonament"); setOpen(false); }} style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", background: "none", border: "1px solid #FF6B00", borderRadius: 50, padding: "2px 9px", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Schimbă</button>
              </div>
            )}
          </div>
          <div style={{ padding: "6px 0", overflowY: "auto", flex: "1 1 auto", minHeight: 0 }}>
            {items.map(item => {
              const isActive = tab === item.t;
              const isHovered = hovered === item.t;
              return (
              <button key={item.t} onClick={() => { onNav(item.t); setOpen(false); }}
                onMouseEnter={() => setHovered(item.t)}
                onMouseLeave={() => setHovered(null)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: isActive ? c.orangeAccent : isHovered ? c.surface2 : "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", transition: "background .12s" }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: isActive ? "#FF6B00" : c.surface3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .12s" }}><item.icon size={18} color={isActive ? "#fff" : c.muted} strokeWidth={2} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#FF6B00" : c.text, display: "flex", alignItems: "center", gap: 6 }}>
                    {item.label}
                    {item.locked && <Lock size={11} color={c.xmuted} strokeWidth={2.4} />}
                  </div>
                  <div style={{ fontSize: 11, color: c.xmuted, marginTop: 1 }}>{item.sub}</div>
                </div>
              </button>
              );
            })}
          </div>
          <div style={{ borderTop: `1px solid ${c.border}`, padding: "12px 18px", flexShrink: 0 }}>
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
          <div style={{ borderTop: `1px solid ${c.border}`, padding: "6px 0", flexShrink: 0 }}>
            <button onClick={() => { setOpen(false); onLogout(); }}
              onMouseEnter={() => setHovered("logout")}
              onMouseLeave={() => setHovered(null)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: hovered === "logout" ? "rgba(239,68,68,.08)" : "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left", transition: "background .12s" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><LogOut size={17} color="#EF4444" strokeWidth={2} /></span>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>Iesire din cont</div>
            </button>
          </div>
        </div>
      )}
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
