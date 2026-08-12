"use client";
import Logo from "../../../components/Logo";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";
import SelectCautabil from "../../../components/SelectCautabil";
import { NUME_JUDETE, oraseDin, areSectoare, BUCURESTI } from "../../../lib/orase";
import { SPECIALIZARI, MAX_SPECIALIZARI, specializariSugerate } from "../../../lib/specializari";
import {
  Store, Scissors, Users, CheckCircle, Plus, Trash2, Clock,
  Building2, FileText, MapPin, Phone, AlignLeft, Globe, Receipt,
  Camera, ImagePlus, X, PawPrint, Check, Sparkles,
} from "lucide-react";

const C = {
  surface: "var(--pub-surface)",
  surface2: "var(--pub-surface2)",
  bg: "var(--pub-bg)",
  line: "var(--pub-line)",
  text: "var(--pub-text)",
  text2: "var(--pub-text2)",
  muted: "var(--pub-muted)",
  dim: "var(--pub-dim)",
  orange: "var(--pub-orange)",
  orangeSoft: "var(--pub-orange-soft)",
};

const inp: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", background: "var(--pub-surface)", color: C.text };
const inpErr: React.CSSProperties = { ...inp, border: "1.5px solid var(--pub-danger)" };
const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 6 };
const errStyle: React.CSSProperties = { fontSize: 12, color: "var(--pub-danger)", marginTop: 4, fontWeight: 600 };
const sectiune: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: "var(--pub-orange-text)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 };

type Serviciu = { nume: string; pret: string; durata: string };
/** `orar` lipsă = specialistul ține programul salonului. Așa îl citesc și dashboardurile. */
type Membru = { nume: string; specialitate: string; orar?: Record<string, ZiProgram> };
type ZiProgram = { activ: boolean; start: string; end: string };
type Domeniu = "infrumusetare" | "grooming";

const STEPS = ["Date firmă", "Servicii", "Echipă & Program", "Fotografii", "Gata!"];

/** Tot ce difera intre cele doua verticale, intr-un singur loc. */
const DOM: Record<Domeniu, {
  eticheta: string; Icon: typeof Scissors; areSpecii: boolean;
  rol: string; rolPlural: string; rolPlaceholder: string; specialitatePlaceholder: string;
  numePlaceholder: string; descriereePlaceholder: string; serviciuPlaceholder: string;
  serviciiSugerate: string[];
}> = {
  infrumusetare: {
    eticheta: "Înfrumusețare",
    Icon: Scissors,
    areSpecii: false,
    rol: "specialist",
    rolPlural: "specialiști",
    rolPlaceholder: "Ex: Maria Ionescu",
    specialitatePlaceholder: "Ex: Colorist",
    numePlaceholder: "Ex: Studio Bella",
    descriereePlaceholder: "Salon de coafură și manichiură în centrul orașului...",
    serviciuPlaceholder: "Ex: Tuns + coafat",
    serviciiSugerate: ["Tuns damă", "Tuns bărbați", "Coafat", "Vopsit", "Manichiură", "Pedichiură", "Tratament facial", "Extensii gene"],
  },
  grooming: {
    eticheta: "Grooming",
    Icon: PawPrint,
    areSpecii: true,
    rol: "groomer",
    rolPlural: "groomeri",
    rolPlaceholder: "Ex: Maria Ionescu",
    specialitatePlaceholder: "Ex: Rase mici",
    numePlaceholder: "Ex: Pet Spa Băneasa",
    descriereePlaceholder: "Salon specializat în câini de talie mică...",
    serviciuPlaceholder: "Ex: Tuns + băiță câine mic",
    serviciiSugerate: ["Tuns rasă", "Tuns igienic", "Baie + uscat", "Deparazitare", "Tăiat unghii", "Curățare urechi", "Deshedding", "Periere blană"],
  },
};

/**
 * Cui se adresează un salon de înfrumusețare.
 *
 * Serviciile diferă mult între cele două: un salon de bărbați nu face vopsit
 * și extensii, unul de damă nu face barbă. Întrebăm întâi, apoi arătăm doar ce
 * are sens — altfel lista de sugestii e pe jumătate nefolositoare.
 */
export type Public = "barbati" | "dama" | "ambele";

const PUBLIC_OPTIUNI: { val: Public; titlu: string; sub: string; Icon: typeof Scissors }[] = [
  { val: "barbati", titlu: "Bărbați", sub: "Frizerie, barbă, styling", Icon: Users },
  { val: "dama", titlu: "Damă", sub: "Coafor, culoare, unghii, cosmetică", Icon: Users },
  { val: "ambele", titlu: "Amândouă", sub: "Salon mixt", Icon: Users },
];

/** Serviciile propuse, pe public. Cele comune apar la amândouă. */
const SERVICII_PUBLIC: Record<Exclude<Public, "ambele">, string[]> = {
  barbati: [
    "Tuns bărbați", "Tuns mașină", "Aranjat barbă", "Ras la brici", "Tuns copii",
    "Spălat + styling", "Vopsit păr bărbați", "Tratament scalp",
  ],
  dama: [
    "Tuns damă", "Coafat", "Vopsit", "Șuvițe", "Balayage", "Tratament păr",
    "Coafură eveniment", "Manichiură", "Pedichiură", "Unghii cu gel",
    "Tratament facial", "Extensii gene", "Pensat sprâncene", "Epilat",
  ],
};

/** Lista propusă pentru publicul ales. */
function serviciiPentru(p: Public | null): string[] {
  if (p === "barbati") return SERVICII_PUBLIC.barbati;
  if (p === "dama") return SERVICII_PUBLIC.dama;
  if (p === "ambele") return [...SERVICII_PUBLIC.barbati, ...SERVICII_PUBLIC.dama];
  return [];
}

const SPECII = [
  { val: "caine",   label: "Câine",     icon: "🐕" },
  { val: "pisica",  label: "Pisică",    icon: "🐈" },
  { val: "iepure",  label: "Iepure",    icon: "🐇" },
  { val: "pasare",  label: "Pasăre",    icon: "🐦" },
  { val: "rozator", label: "Rozătoare", icon: "🐹" },
  { val: "reptila", label: "Reptilă",   icon: "🦎" },
  { val: "altele",  label: "Altele",    icon: "🐾" },
];

const ZILE = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
/**
 * Cheile sunt zilele din JavaScript (`getDay()`: duminică = 0), fiindcă exact
 * așa citesc programul agenda salonului și calendarul de rezervare. Wizardul
 * scria „luni"/„marti" și câmpul `deschis`, iar dashboardurile căutau „1"/„2"
 * și `activ` — programul ales la înscriere se pierdea în tăcere și salonul
 * rămânea pe orarul implicit.
 */
const ZILE_KEYS = ["1", "2", "3", "4", "5", "6", "0"];

const PROGRAM_DEFAULT: Record<string, ZiProgram> = {
  "1": { activ: true,  start: "09:00", end: "18:00" },
  "2": { activ: true,  start: "09:00", end: "18:00" },
  "3": { activ: true,  start: "09:00", end: "18:00" },
  "4": { activ: true,  start: "09:00", end: "18:00" },
  "5": { activ: true,  start: "09:00", end: "18:00" },
  "6": { activ: true,  start: "10:00", end: "14:00" },
  "0": { activ: false, start: "10:00", end: "14:00" },
};

const ENTITATI = ["SRL", "SRL-D", "PFA", "Persoană fizică", "Altele"];

/** Durata trialului. NU se comunica public — pe site scriem doar "trial gratuit". */
const ZILE_TRIAL = 14;

export default function ConfigurareSalon() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Verticala aleasa la inregistrare. O citim intai din memoria browserului,
  // apoi din datele contului (daca omul revine de pe alt dispozitiv).
  const [domeniu, setDomeniu] = useState<Domeniu | null>(null);

  const [dateFirma, setDateFirma] = useState({
    numeSalon: "", strada: "", numar: "", judet: "", oras: "", telefon: "", descriere: "",
    tipEntitate: "SRL", denumireLegala: "", cui: "", sediuFiscal: "",
  });
  /** Sediul fiscal e cel mai des la aceeași adresă — pornim de la „la fel". */
  const [sediuLaFel, setSediuLaFel] = useState(true);
  const [speciiSelectate, setSpeciiSelectate] = useState<string[]>(["caine"]);
  /** Cui se adresează salonul de înfrumusețare — decide ce servicii propunem. */
  const [publicTinta, setPublicTinta] = useState<Public | null>(null);
  const [servicii, setServicii] = useState<Serviciu[]>([{ nume: "", pret: "", durata: "" }]);
  /** Categoriile după care clientul filtrează. Listă fixă, cel mult 3. */
  const [specializari, setSpecializari] = useState<string[]>([]);
  /** Sugestia s-a aplicat o dată; după aceea alegerea e a omului. */
  const specializariAtinse = useRef(false);
  const [echipa, setEchipa] = useState<Membru[]>([{ nume: "", specialitate: "" }]);
  const [program, setProgram] = useState<Record<string, ZiProgram>>(PROGRAM_DEFAULT);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galerieFiles, setGalerieFiles] = useState<File[]>([]);
  const [galeriePreviews, setGaleriePreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);

  useEffect(() => {
    let anulat = false;
    (async () => {
      const dinSesiune = sessionStorage.getItem("calyhub_reg_domeniu");
      const numeSalvat = sessionStorage.getItem("calyhub_reg_numeSalon");
      if (numeSalvat) setDateFirma(f => (f.numeSalon ? f : { ...f, numeSalon: numeSalvat }));
      if (dinSesiune === "infrumusetare" || dinSesiune === "grooming") {
        setDomeniu(dinSesiune);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (anulat) return;
      const dinCont = user?.user_metadata?.domeniu;
      if (dinCont === "infrumusetare" || dinCont === "grooming") setDomeniu(dinCont);
      const numeCont = user?.user_metadata?.numeSalon;
      if (numeCont) setDateFirma(f => (f.numeSalon ? f : { ...f, numeSalon: numeCont }));
    })();
    return () => { anulat = true; };
  }, []);

  const d = domeniu ? DOM[domeniu] : null;

  /**
   * Propunem specializările din serviciile deja scrise — un salon care are
   * „Manichiură" și „Unghii cu gel" e evident de unghii. Se întâmplă o singură
   * dată: din clipa în care omul atinge o bifă, alegerea îi aparține.
   */
  useEffect(() => {
    if (specializariAtinse.current) return;
    const propuse = specializariSugerate(servicii.map(s => s.nume).filter(Boolean));
    if (propuse.length > 0) setSpecializari(propuse);
  }, [servicii]);

  /**
   * Serviciile scrise de mână — cele care nu se regăsesc în lista propusă.
   * Nu le trimitem nicăieri și nu le folosim pentru alte saloane: rămân ale
   * salonului, salvate exact cum le-a scris. Le arătăm doar ca să se vadă că
   * fac parte din același set, nu că sunt o excepție.
   */
  const serviciiProprii = (() => {
    if (!d) return [];
    const propuse = new Set((d.areSpecii ? d.serviciiSugerate : serviciiPentru(publicTinta)).map(s => s.toLowerCase()));
    const vazute = new Set<string>();
    return servicii
      .map(s => s.nume.trim())
      .filter(n => {
        const k = n.toLowerCase();
        if (!n || propuse.has(k) || vazute.has(k)) return false;
        vazute.add(k);
        return true;
      });
  })();

  function setFirma(k: string, v: string) {
    setDateFirma(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  function toggleSpecie(val: string) {
    setSpeciiSelectate(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);
  }

  function adaugaServiciuSugerat(nume: string) {
    setServicii(sv => {
      if (sv.some(s => s.nume.trim().toLowerCase() === nume.toLowerCase())) return sv;
      const gol = sv.findIndex(s => !s.nume.trim() && !s.pret.trim() && !s.durata.trim());
      if (gol >= 0) return sv.map((s, i) => i === gol ? { ...s, nume } : s);
      return [...sv, { nume, pret: "", durata: "" }];
    });
  }

  function setZi(key: string, field: keyof ZiProgram, value: string | boolean) {
    setProgram(p => ({ ...p, [key]: { ...p[key], [field]: value } }));
  }

  /**
   * Adresa, scrisă într-un singur rând. Baza păstrează un singur câmp `adresa`,
   * iar clientul o vede așa pe cardul salonului; despărțirea în strada/număr
   * există doar ca să nu fie scrisă greșit la completare.
   */
  function adresaCompleta(cuJudet = false) {
    const strada = dateFirma.strada.trim();
    const nr = dateFirma.numar.trim();
    const oras = dateFirma.oras.trim();
    const judet = dateFirma.judet.trim();
    const inceput = [strada, nr && `nr. ${nr}`].filter(Boolean).join(" ");
    // La București orașul e chiar sectorul, deci nu-l mai repetăm ca județ.
    const loc = cuJudet && judet && judet !== oras && !areSectoare(judet) ? `${oras}, jud. ${judet}` : oras;
    return [inceput, loc].filter(Boolean).join(", ");
  }

  function validateStep0() {
    const e: Record<string, string> = {};
    if (!domeniu) e.domeniu = "Alege tipul salonului";
    if (!dateFirma.numeSalon.trim()) e.numeSalon = "Câmp obligatoriu";
    if (!dateFirma.strada.trim()) e.strada = "Câmp obligatoriu";
    if (!dateFirma.numar.trim()) e.numar = "Obligatoriu";
    if (!dateFirma.judet.trim()) e.judet = "Alege județul";
    if (!dateFirma.oras.trim()) e.oras = areSectoare(dateFirma.judet) ? "Alege sectorul" : "Alege orașul";
    if (!sediuLaFel && !dateFirma.sediuFiscal.trim()) e.sediuFiscal = "Scrie adresa sediului fiscal";
    if (!dateFirma.cui.trim()) e.cui = "CUI obligatoriu";
    if (d?.areSpecii && speciiSelectate.length === 0) e.specii = "Selectează cel puțin o specie";
    return e;
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    // La înfrumusețare, publicul decide ce servicii propunem — fără el, lista de
    // sugestii n-are ce arăta.
    if (!d?.areSpecii && !publicTinta) e.publicTinta = "Alege cui se adresează salonul";
    if (!servicii.some(s => s.nume.trim())) e.serviciiMinim = "Adaugă cel puțin un serviciu";
    if (!d?.areSpecii && specializari.length === 0) e.specializari = "Alege cel puțin o specializare";
    servicii.forEach((s, i) => {
      if (!s.nume.trim()) e[`s_nume_${i}`] = "Obligatoriu";
      if (!s.pret.trim()) e[`s_pret_${i}`] = "Obligatoriu";
      if (!s.durata.trim()) e[`s_durata_${i}`] = "Obligatoriu";
    });
    return e;
  }

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function onGalerieChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setGalerieFiles(prev => [...prev, ...files]);
    setGaleriePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  }

  function removeGalerie(idx: number) {
    setGalerieFiles(prev => prev.filter((_, i) => i !== idx));
    setGaleriePreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function uploadPhotos(userId: string) {
    setUploadingPhotos(true);
    try {
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `${userId}/cover.${ext}`;
        const { error } = await supabase.storage.from("saloane").upload(path, coverFile, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from("saloane").getPublicUrl(path);
          await supabase.from("saloane").update({ poza_url: `${data.publicUrl}?t=${Date.now()}` }).eq("user_id", userId);
        }
      }
      if (galerieFiles.length > 0) {
        const urls: string[] = [];
        for (let i = 0; i < galerieFiles.length; i++) {
          const file = galerieFiles[i];
          const ext = file.name.split(".").pop();
          const path = `${userId}/gallery/${Date.now()}_${i}.${ext}`;
          const { error } = await supabase.storage.from("saloane").upload(path, file, { upsert: true });
          if (!error) {
            const { data } = supabase.storage.from("saloane").getPublicUrl(path);
            urls.push(data.publicUrl);
          }
        }
        if (urls.length > 0) {
          await supabase.from("saloane").update({ galerie: urls }).eq("user_id", userId);
        }
      }
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function next() {
    if (step === 0) {
      const e = validateStep0();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    if (step === 2) {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setSavedUserId(user.id);

      const { error: salonError } = await supabase
        .from("saloane")
        .upsert({
          user_id: user.id,
          nume: dateFirma.numeSalon.trim(),
          adresa: adresaCompleta(true),
          oras: dateFirma.oras.trim(),
          judet: dateFirma.judet.trim(),
          telefon: dateFirma.telefon.trim(),
          descriere: dateFirma.descriere.trim(),
          servicii: servicii.filter(s => s.nume.trim()),
          echipa: echipa.filter(g => g.nume.trim()),
          // Salonul porneste pe planul de intrare, in trial. Planul se schimba la pasul urmator.
          plan: "basic",
          trial_expira_la: new Date(Date.now() + ZILE_TRIAL * 24 * 60 * 60 * 1000).toISOString(),
          domeniu,
          specii: d?.areSpecii ? speciiSelectate : [],
          public_tinta: d?.areSpecii ? null : publicTinta,
          specializari: d?.areSpecii ? [] : specializari,
          tip_entitate: dateFirma.tipEntitate,
          denumire_legala: dateFirma.denumireLegala.trim(),
          cui: dateFirma.cui.trim(),
          sediu_fiscal: sediuLaFel ? adresaCompleta(true) : dateFirma.sediuFiscal.trim(),
          program,
        }, { onConflict: "user_id" });

      if (salonError) console.error("Salon upsert error:", salonError);

      // Punctul pe hartă, ca să putem calcula distanța până la client.
      // Dacă adresa nu e găsită, salonul rămâne fără coordonate și apare mai
      // departe în listă, doar fără distanță — înscrierea nu se blochează.
      try {
        const r = await fetch(`/api/geocod?q=${encodeURIComponent(adresaCompleta(true))}`);
        if (r.ok) {
          const { lat, lng } = await r.json();
          if (typeof lat === "number" && typeof lng === "number") {
            await supabase.from("saloane")
              .update({ lat, lng, geocodat_la: new Date().toISOString() })
              .eq("user_id", user.id);
          }
        }
      } catch { /* fără coordonate, mergem mai departe */ }

      setSaving(false);
    }
    if (step === 3 && savedUserId && (coverFile || galerieFiles.length > 0)) {
      await uploadPhotos(savedUserId);
    }
    setErrors({});
    setStep(s => s + 1);
  }

  const progress = (step / (STEPS.length - 1)) * 100;

  const programRezumat = ZILE_KEYS
    .filter(k => program[k].activ)
    .map(k => `${ZILE[ZILE_KEYS.indexOf(k)].slice(0, 3)} ${program[k].start}–${program[k].end}`)
    .join(" · ");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--pub-surface)", borderBottom: `1px solid ${C.line}`, height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Logo h={44} priority />
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {d && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.orangeSoft, border: `1px solid var(--pub-orange-border)`, color: "var(--pub-orange-text)", fontSize: 12, fontWeight: 800, padding: "5px 12px", borderRadius: 50, whiteSpace: "nowrap" }}>
                <d.Icon size={13} strokeWidth={2.2} /> {d.eticheta}
              </span>
            )}
            <div className="nav-hide-sm" style={{ fontSize: 13, color: C.dim, fontWeight: 600, whiteSpace: "nowrap" }}>Pasul {step + 1} din {STEPS.length}</div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 580 }}>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 4 }}>
              {STEPS.map((l, i) => (
                <div key={l} style={{ fontSize: 11.5, fontWeight: 700, color: i <= step ? C.orange : C.dim, textAlign: "center", flex: 1 }}>{l}</div>
              ))}
            </div>
            <div style={{ height: 4, background: C.line, borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: C.orange, borderRadius: 4, transition: "width .4s" }} />
            </div>
          </div>

          <div style={{ background: C.surface, borderRadius: 26, padding: "clamp(24px,5vw,42px)", border: `1px solid ${C.line}`, boxShadow: "0 14px 46px var(--pub-shadow)" }}>

            {/* ── STEP 0 — Date firmă ── */}
            {step === 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Store size={24} color={C.orange} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>Datele salonului</h2>
                    <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>Informații publice + date de facturare</p>
                  </div>
                </div>

                {/* Verticala — apare doar daca nu a fost aleasa la inregistrare */}
                {!domeniu && (
                  <div style={{ marginBottom: 24, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>Ce fel de salon ai?</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, fontWeight: 600 }}>Configurăm serviciile în funcție de această alegere.</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {(Object.keys(DOM) as Domeniu[]).map(k => {
                        const cfg = DOM[k];
                        return (
                          <button key={k} type="button"
                            onClick={() => { setDomeniu(k); setErrors(e => { const n = { ...e }; delete n.domeniu; return n; }); }}
                            style={{ border: `1.5px solid ${C.line}`, borderRadius: 16, padding: "14px 10px", background: C.surface, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 7 }}>
                              <cfg.Icon size={22} color={C.dim} strokeWidth={1.9} />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{cfg.eticheta}</div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.domeniu && <div style={errStyle}>{errors.domeniu}</div>}
                  </div>
                )}

                {/* Secțiunea A — Date publice */}
                <div style={sectiune}><Globe size={12} strokeWidth={2.5} /> Date publice</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                  <div>
                    <label style={label}>Numele salonului *</label>
                    <input value={dateFirma.numeSalon} onChange={e => setFirma("numeSalon", e.target.value)} type="text" placeholder={d?.numePlaceholder || "Numele salonului"} style={errors.numeSalon ? inpErr : inp} />
                    {errors.numeSalon && <div style={errStyle}>{errors.numeSalon}</div>}
                  </div>
                  {/* ── Adresa, pe bucăți ──
                      Județul și orașul se aleg din listă, nu se scriu liber: baza are
                      nevoie de o singură formă a numelui, altfel „Cluj" și „Cluj-Napoca"
                      ajung două orașe diferite în căutare și în paginile de oraș. */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 12 }}>
                      <div>
                        <label style={label}><MapPin size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Strada *</label>
                        <input value={dateFirma.strada} onChange={e => setFirma("strada", e.target.value)} type="text" placeholder="Str. Florilor" style={errors.strada ? inpErr : inp} />
                        {errors.strada && <div style={errStyle}>{errors.strada}</div>}
                      </div>
                      <div>
                        <label style={label}>Număr *</label>
                        <input value={dateFirma.numar} onChange={e => setFirma("numar", e.target.value)} type="text" placeholder="12A" style={errors.numar ? inpErr : inp} />
                        {errors.numar && <div style={errStyle}>{errors.numar}</div>}
                      </div>
                    </div>

                    <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={label}>Județul *</label>
                        <SelectCautabil
                          valoare={dateFirma.judet}
                          optiuni={NUME_JUDETE}
                          eroare={!!errors.judet}
                          permiteLiber={false}
                          placeholder="Alege județul"
                          onSchimba={v => {
                            // Alt județ înseamnă altă listă de orașe — golim alegerea veche.
                            setDateFirma(f => ({ ...f, judet: v, oras: "" }));
                            setErrors(er => { const n = { ...er }; delete n.judet; delete n.oras; return n; });
                          }}
                        />
                        {errors.judet && <div style={errStyle}>{errors.judet}</div>}
                      </div>
                      <div>
                        <label style={label}>{areSectoare(dateFirma.judet) ? "Sectorul *" : "Orașul *"}</label>
                        <SelectCautabil
                          valoare={dateFirma.oras}
                          optiuni={oraseDin(dateFirma.judet)}
                          eroare={!!errors.oras}
                          dezactivat={!dateFirma.judet}
                          placeholder={dateFirma.judet ? (areSectoare(dateFirma.judet) ? "Alege sectorul" : "Alege orașul") : "Întâi alege județul"}
                          onSchimba={v => setFirma("oras", v)}
                        />
                        {errors.oras && <div style={errStyle}>{errors.oras}</div>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={label}><Phone size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Telefon public</label>
                    <input value={dateFirma.telefon} onChange={e => setFirma("telefon", e.target.value)} type="tel" placeholder="07XX XXX XXX" style={inp} />
                  </div>
                  <div>
                    <label style={label}><AlignLeft size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Descriere scurtă</label>
                    <textarea value={dateFirma.descriere} onChange={e => setFirma("descriere", e.target.value)} placeholder={d?.descriereePlaceholder} rows={3}
                      style={{ ...inp, resize: "vertical" }} />
                  </div>

                  {/* Specii — doar pentru grooming */}
                  {d?.areSpecii && (
                    <div>
                      <label style={label}>Specii acceptate *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: 8 }}>
                        {SPECII.map(s => {
                          const sel = speciiSelectate.includes(s.val);
                          return (
                            <button key={s.val} type="button" onClick={() => toggleSpecie(s.val)}
                              style={{ padding: "10px 4px", borderRadius: 12, border: sel ? `2px solid ${C.orange}` : `1.5px solid ${C.line}`, background: sel ? C.orangeSoft : C.surface2, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all .18s" }}>
                              <span style={{ fontSize: 22 }}>{s.icon}</span>
                              <span style={{ fontSize: 10, fontWeight: 800, color: sel ? C.orange : C.dim }}>{s.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {errors.specii && <div style={{ ...errStyle, marginTop: 6 }}>{errors.specii}</div>}
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: C.line, marginBottom: 24 }} />

                {/* Secțiunea B — Date facturare */}
                <div style={sectiune}><Receipt size={12} strokeWidth={2.5} /> Date pentru facturare</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="ch-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={label}><Building2 size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Tip entitate</label>
                      <select value={dateFirma.tipEntitate} onChange={e => setFirma("tipEntitate", e.target.value)}
                        style={{ ...inp, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}>
                        {ENTITATI.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={label}><FileText size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />CUI *</label>
                      <input value={dateFirma.cui} onChange={e => setFirma("cui", e.target.value)} type="text" placeholder="RO12345678" style={errors.cui ? inpErr : inp} />
                      {errors.cui && <div style={errStyle}>{errors.cui}</div>}
                    </div>
                  </div>
                  <div>
                    <label style={label}>Denumire legală</label>
                    <input value={dateFirma.denumireLegala} onChange={e => setFirma("denumireLegala", e.target.value)} type="text" placeholder="Ex: Bella Studio SRL" style={inp} />
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Dacă diferă de numele comercial al salonului</div>
                  </div>
                  {/* ── Sediul fiscal ──
                      La majoritatea saloanelor e aceeași adresă, deci pornim de la „la fel"
                      și o completăm singuri. Cine are sediul în altă parte bifează a doua
                      variantă și primește un câmp de scris. */}
                  <div>
                    <label style={label}><MapPin size={12} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Sediu fiscal</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {([
                        { laFel: true, titlu: "La aceeași adresă cu salonul", sub: "Se completează singur din adresa de mai sus" },
                        { laFel: false, titlu: "La altă adresă", sub: "Scrii tu adresa sediului social" },
                      ]).map(o => {
                        const bifat = sediuLaFel === o.laFel;
                        return (
                          <button key={String(o.laFel)} type="button"
                            onClick={() => { setSediuLaFel(o.laFel); setErrors(er => { const n = { ...er }; delete n.sediuFiscal; return n; }); }}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 11, textAlign: "left", width: "100%",
                              padding: "12px 14px", borderRadius: 14, cursor: "pointer", fontFamily: "Nunito, sans-serif",
                              border: bifat ? "1.5px solid var(--pub-orange)" : `1.5px solid ${C.line}`,
                              background: bifat ? C.orangeSoft : C.surface,
                              transition: "border-color .18s, background .18s",
                            }}>
                            <span aria-hidden style={{
                              width: 19, height: 19, borderRadius: 6, flexShrink: 0, marginTop: 1,
                              border: bifat ? "none" : `1.5px solid ${C.line}`,
                              background: bifat ? "var(--pub-orange)" : C.surface,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {bifat && <Check size={13} color="#fff" strokeWidth={3.2} />}
                            </span>
                            <span>
                              <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: C.text }}>{o.titlu}</span>
                              <span style={{ display: "block", fontSize: 12, color: C.muted, marginTop: 2 }}>{o.sub}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {sediuLaFel ? (
                      <div style={{ marginTop: 9, padding: "10px 14px", background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 13, color: C.muted, fontWeight: 600 }}>
                        {adresaCompleta(true) || "Se completează după ce scrii adresa salonului."}
                      </div>
                    ) : (
                      <div style={{ marginTop: 9 }}>
                        <input value={dateFirma.sediuFiscal} onChange={e => setFirma("sediuFiscal", e.target.value)} type="text"
                          placeholder="Str. Exemplu nr. 5, București" style={errors.sediuFiscal ? inpErr : inp} />
                        {errors.sediuFiscal && <div style={errStyle}>{errors.sediuFiscal}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1 — Servicii ── */}
            {step === 1 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Scissors size={24} color={C.orange} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>Meniul de servicii</h2>
                    <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>Ce oferi, cât costă, cât durează</p>
                  </div>
                </div>

                {/* ── Cui se adresează salonul — doar la înfrumusețare ──
                    Un salon de bărbați nu face vopsit și extensii, unul de damă nu
                    face barbă. Întrebăm întâi, apoi propunem doar ce are sens. */}
                {d && !d.areSpecii && (
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>Cui se adresează salonul *</div>
                    <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
                      După asta îți arătăm lista de servicii potrivită.
                    </div>
                    <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
                      {PUBLIC_OPTIUNI.map(o => {
                        const ales = publicTinta === o.val;
                        return (
                          <button key={o.val} type="button"
                            onClick={() => { setPublicTinta(o.val); setErrors(er => { const n = { ...er }; delete n.publicTinta; return n; }); }}
                            style={{
                              padding: "13px 11px", borderRadius: 14, cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "center",
                              border: ales ? "2px solid var(--pub-orange)" : `1.5px solid ${C.line}`,
                              background: ales ? C.orangeSoft : C.surface,
                              transition: "border-color .18s, background .18s",
                            }}>
                            <div style={{ fontSize: 13.5, fontWeight: 900, color: ales ? "var(--pub-orange-text)" : C.text }}>{o.titlu}</div>
                            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{o.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.publicTinta && <div style={errStyle}>{errors.publicTinta}</div>}
                  </div>
                )}

                {/* Sugestii rapide — după publicul ales la înfrumusețare, fixe la grooming */}
                {d && (d.areSpecii || publicTinta) && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 9, lineHeight: 1.5 }}>
                      Alege din listă serviciile pe care le faci. Dacă unul nu e în listă, îl scrii tu mai jos.
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {(d.areSpecii ? d.serviciiSugerate : serviciiPentru(publicTinta)).map(s => {
                        const deja = servicii.some(x => x.nume.trim().toLowerCase() === s.toLowerCase());
                        return (
                          <button key={s} type="button" onClick={() => adaugaServiciuSugerat(s)} disabled={deja}
                            style={{ padding: "7px 13px", borderRadius: 50, border: `1.5px solid ${deja ? C.line : "var(--pub-orange-border)"}`, background: deja ? C.surface2 : C.orangeSoft, color: deja ? C.dim : "var(--pub-orange-text)", fontSize: 12.5, fontWeight: 800, cursor: deja ? "default" : "pointer", fontFamily: "Nunito, sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}>
                            {deja ? <CheckCircle size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.8} />} {s}
                          </button>
                        );
                      })}

                      {/* Serviciile scrise de mână stau lângă celelalte, nu separat — sunt
                          servicii la fel de bune, doar că nu erau în lista noastră. */}
                      {serviciiProprii.map(s => (
                        <span key={`propriu-${s}`}
                          style={{ padding: "7px 13px", borderRadius: 50, border: `1.5px dashed ${C.line}`, background: C.surface2, color: C.text2, fontSize: 12.5, fontWeight: 800, fontFamily: "Nunito, sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <CheckCircle size={13} strokeWidth={2.5} color={C.dim} /> {s}
                        </span>
                      ))}
                    </div>
                    {serviciiProprii.length > 0 && (
                      <div style={{ fontSize: 11.5, color: C.dim, marginTop: 8 }}>
                        Cele cu contur punctat sunt scrise de tine. Se salvează exact așa cum le-ai scris.
                      </div>
                    )}
                  </div>
                )}

                {errors.serviciiMinim && (
                  <div style={{ ...errStyle, marginBottom: 12, fontSize: 13 }}>{errors.serviciiMinim}</div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {servicii.map((s, i) => (
                    <div key={i} style={{ background: C.surface2, borderRadius: 16, padding: "14px 16px", border: `1px solid ${C.line}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--pub-orange-text)" }}>Serviciul {i + 1}</div>
                        {servicii.length > 1 && (
                          <button onClick={() => setServicii(sv => sv.filter((_, idx) => idx !== i))}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.dim, display: "flex", alignItems: "center" }}>
                            <Trash2 size={15} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                          <label style={{ ...label, fontSize: 12 }}>Denumire *</label>
                          <input value={s.nume} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, nume: e.target.value } : x))}
                            placeholder={d?.serviciuPlaceholder} style={errors[`s_nume_${i}`] ? inpErr : inp} />
                          {errors[`s_nume_${i}`] && <div style={{ ...errStyle, fontSize: 11 }}>{errors[`s_nume_${i}`]}</div>}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <label style={{ ...label, fontSize: 12 }}>Preț (RON) *</label>
                            <input value={s.pret} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, pret: e.target.value } : x))}
                              type="number" placeholder="80" style={errors[`s_pret_${i}`] ? inpErr : inp} />
                          </div>
                          <div>
                            <label style={{ ...label, fontSize: 12 }}>Durată (min) *</label>
                            <input value={s.durata} onChange={e => setServicii(sv => sv.map((x, idx) => idx === i ? { ...x, durata: e.target.value } : x))}
                              type="number" placeholder="60" style={errors[`s_durata_${i}`] ? inpErr : inp} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setServicii(sv => [...sv, { nume: "", pret: "", durata: "" }])}
                    style={{ padding: "12px", borderRadius: 12, border: `1.5px dashed ${C.orange}`, background: C.orangeSoft, color: "var(--pub-orange-text)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Plus size={16} strokeWidth={2.5} /> Adaugă serviciu
                  </button>
                </div>

                {/* ── Specializări — doar la înfrumusețare ── */}
                {!d?.areSpecii && (
                  <div style={{ marginTop: 30, paddingTop: 24, borderTop: `1px solid ${C.line}` }}>
                    <div style={sectiune}>
                      <Sparkles size={12} strokeWidth={2.5} /> Ce fel de salon ești? *
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: "-8px 0 14px" }}>
                      După asta te găsesc clienții care caută exact ce faci tu.
                      Alege între 1 și {MAX_SPECIALIZARI} — pe cele în care chiar ești bun.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 10 }}>
                      {SPECIALIZARI.map(sp => {
                        const activ = specializari.includes(sp.val);
                        const plin = specializari.length >= MAX_SPECIALIZARI && !activ;
                        return (
                          <button key={sp.val} type="button" disabled={plin}
                            onClick={() => {
                              specializariAtinse.current = true;
                              setSpecializari(prev => prev.includes(sp.val)
                                ? prev.filter(x => x !== sp.val)
                                : prev.length >= MAX_SPECIALIZARI ? prev : [...prev, sp.val]);
                              setErrors(e => { const n = { ...e }; delete n.specializari; return n; });
                            }}
                            style={{
                              textAlign: "left", padding: "13px 15px", borderRadius: 14, cursor: plin ? "not-allowed" : "pointer",
                              fontFamily: "Nunito, sans-serif", opacity: plin ? .45 : 1,
                              border: activ ? `2px solid ${C.orange}` : `1.5px solid ${errors.specializari ? "var(--pub-danger)" : C.line}`,
                              background: activ ? C.orangeSoft : C.surface, transition: "all .18s",
                            }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                              <span style={{
                                width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                                border: activ ? "none" : `1.5px solid ${C.line}`,
                                background: activ ? C.orange : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {activ && <Check size={11} color="#fff" strokeWidth={3.5} />}
                              </span>
                              <span style={{ fontSize: 14, fontWeight: 800, color: activ ? "var(--pub-orange-text)" : C.text }}>{sp.label}</span>
                            </div>
                            <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.45, paddingLeft: 24 }}>{sp.exemple}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: specializari.length >= MAX_SPECIALIZARI ? "var(--pub-orange-text)" : C.dim }}>
                      {specializari.length} din {MAX_SPECIALIZARI} alese
                      {specializari.length >= MAX_SPECIALIZARI && " — scoate una ca să pui alta"}
                    </div>
                    {errors.specializari && <div style={errStyle}>{errors.specializari}</div>}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2 — Echipă & Program ── */}
            {step === 2 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Users size={24} color={C.orange} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>Echipă & Program</h2>
                    <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>{d ? `${d.rolPlural.charAt(0).toUpperCase()}${d.rolPlural.slice(1)} tăi și orarul salonului` : "Echipa ta și orarul salonului"}</p>
                  </div>
                </div>

                <div style={sectiune}>
                  <Users size={12} strokeWidth={2.5} /> Echipa <span style={{ color: C.dim, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(opțional)</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {echipa.map((g, i) => {
                    const areOrar = !!g.orar;
                    const orarG = g.orar || PROGRAM_DEFAULT;
                    const setOrarZi = (k: string, camp: keyof ZiProgram, val: string | boolean) =>
                      setEchipa(ec => ec.map((x, idx) => idx === i
                        ? { ...x, orar: { ...(x.orar || program), [k]: { ...(x.orar || program)[k], [camp]: val } } }
                        : x));
                    return (
                    <div key={i} style={{ border: `1.5px solid ${areOrar ? "var(--pub-orange-border)" : C.line}`, borderRadius: 14, padding: 14, background: C.surface }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 140px" }}>
                          <label style={{ ...label, fontSize: 12 }}>Nume {d?.rol || "specialist"}</label>
                          <input value={g.nume} onChange={e => setEchipa(ec => ec.map((x, idx) => idx === i ? { ...x, nume: e.target.value } : x))}
                            placeholder={d?.rolPlaceholder || "Ex: Maria Ionescu"} style={inp} />
                        </div>
                        <div style={{ flex: "1 1 140px" }}>
                          <label style={{ ...label, fontSize: 12 }}>Specialitate</label>
                          <input value={g.specialitate} onChange={e => setEchipa(ec => ec.map((x, idx) => idx === i ? { ...x, specialitate: e.target.value } : x))}
                            placeholder={d?.specialitatePlaceholder || "Ex: Colorist"} style={inp} />
                        </div>
                        {echipa.length > 1 && (
                          <button onClick={() => setEchipa(ec => ec.filter((_, idx) => idx !== i))}
                            style={{ padding: "11px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.surface, cursor: "pointer", color: C.dim, display: "flex", alignItems: "center", flexShrink: 0 }}>
                            <Trash2 size={15} strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {/* Orar propriu — opțional. Fără el, specialistul ține programul salonului. */}
                      <button
                        onClick={() => setEchipa(ec => ec.map((x, idx) => {
                          if (idx !== i) return x;
                          if (x.orar) { const { orar, ...rest } = x; return rest; }
                          return { ...x, orar: JSON.parse(JSON.stringify(program)) };
                        }))}
                        style={{ marginTop: 12, padding: "8px 14px", borderRadius: 50, cursor: "pointer", fontFamily: "Nunito, sans-serif", fontSize: 12, fontWeight: 800,
                          border: areOrar ? `1.5px solid ${C.orange}` : `1.5px solid ${C.line}`,
                          background: areOrar ? C.orangeSoft : C.surface2,
                          color: areOrar ? "var(--pub-orange-text)" : C.muted,
                          display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Clock size={13} strokeWidth={2.4} /> {areOrar ? "Are orar propriu ▲" : "Lucrează alt orar? ▼"}
                      </button>

                      {areOrar && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
                          <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 10 }}>
                            Pornit de la programul salonului. Schimbă doar zilele care diferă — poți reveni oricând din cont.
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {ZILE_KEYS.map((k, idx) => {
                              const zi = orarG[k];
                              return (
                                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <div style={{ width: 66, fontSize: 12, fontWeight: 800, color: zi.activ ? C.text : C.dim, flexShrink: 0 }}>{ZILE[idx]}</div>
                                  <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", flexShrink: 0 }}>
                                    <input type="checkbox" checked={zi.activ} onChange={e => setOrarZi(k, "activ", e.target.checked)}
                                      style={{ accentColor: "#FF6B00", width: 15, height: 15, cursor: "pointer" }} />
                                    <span style={{ fontSize: 11.5, fontWeight: 700, color: zi.activ ? "var(--pub-orange-text)" : C.dim }}>{zi.activ ? "Lucrează" : "Liber"}</span>
                                  </label>
                                  {zi.activ && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                                      <input type="time" value={zi.start} onChange={e => setOrarZi(k, "start", e.target.value)}
                                        style={{ ...inp, width: "auto", padding: "5px 8px", fontSize: 12.5, fontWeight: 700 }} />
                                      <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>–</span>
                                      <input type="time" value={zi.end} onChange={e => setOrarZi(k, "end", e.target.value)}
                                        style={{ ...inp, width: "auto", padding: "5px 8px", fontSize: 12.5, fontWeight: 700 }} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  <button onClick={() => setEchipa(ec => [...ec, { nume: "", specialitate: "" }])}
                    style={{ padding: "12px", borderRadius: 12, border: `1.5px dashed ${C.orange}`, background: C.orangeSoft, color: "var(--pub-orange-text)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Plus size={16} strokeWidth={2.5} /> Adaugă {d?.rol || "specialist"}
                  </button>
                </div>

                <div style={{ height: 1, background: C.line, marginBottom: 24 }} />

                <div style={sectiune}><Clock size={12} strokeWidth={2.5} /> Program de lucru</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ZILE_KEYS.map((key, idx) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: program[key].activ ? C.orangeSoft : C.surface2, border: `1px solid ${program[key].activ ? "var(--pub-orange-border)" : C.line}`, transition: "all .18s", flexWrap: "wrap" }}>
                      <div style={{ width: 72, fontSize: 13, fontWeight: 800, color: program[key].activ ? C.text : C.dim, flexShrink: 0 }}>{ZILE[idx]}</div>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                        <input type="checkbox" checked={program[key].activ} onChange={e => setZi(key, "activ", e.target.checked)}
                          style={{ accentColor: "#FF6B00", width: 16, height: 16, cursor: "pointer" }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: program[key].activ ? "var(--pub-orange-text)" : C.dim }}>{program[key].activ ? "Deschis" : "Închis"}</span>
                      </label>
                      {program[key].activ && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                          <input type="time" value={program[key].start} onChange={e => setZi(key, "start", e.target.value)}
                            style={{ ...inp, width: "auto", padding: "6px 10px", fontSize: 13, fontWeight: 700 }} />
                          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, flexShrink: 0 }}>–</span>
                          <input type="time" value={program[key].end} onChange={e => setZi(key, "end", e.target.value)}
                            style={{ ...inp, width: "auto", padding: "6px 10px", fontSize: 13, fontWeight: 700 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3 — Fotografii ── */}
            {step === 3 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Camera size={24} color={C.orange} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>Fotografii salon</h2>
                    <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>Poți adăuga sau modifica oricând din cont</p>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={sectiune}><Camera size={12} strokeWidth={2.5} /> Poza de profil / cover</div>
                  <label style={{ display: "block", cursor: "pointer" }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={onCoverChange} />
                    {coverPreview ? (
                      <div style={{ position: "relative", width: "100%", height: 180, borderRadius: 16, overflow: "hidden", border: `2px solid ${C.orange}` }}>
                        <img src={coverPreview} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,.5)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 50 }}>
                          Schimbă foto
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: "100%", height: 180, borderRadius: 16, border: `1.5px dashed var(--pub-orange-border)`, background: C.orangeSoft, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <Camera size={32} color={C.orange} strokeWidth={1.5} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--pub-orange-text)" }}>Adaugă poza principală</span>
                        <span style={{ fontSize: 12, color: C.dim }}>JPG, PNG · max 10MB</span>
                      </div>
                    )}
                  </label>
                </div>

                <div>
                  <div style={sectiune}><ImagePlus size={12} strokeWidth={2.5} /> Galerie foto</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {galeriePreviews.map((src, idx) => (
                      <div key={idx} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: `1.5px solid ${C.line}` }}>
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button onClick={() => removeGalerie(idx)} type="button"
                          style={{ position: "absolute", top: 5, right: 5, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={13} color="#fff" strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                    <label style={{ aspectRatio: "1", borderRadius: 12, border: `1.5px dashed var(--pub-orange-border)`, background: C.orangeSoft, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
                      <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onGalerieChange} />
                      <ImagePlus size={22} color={C.orange} strokeWidth={1.8} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--pub-orange-text)" }}>Adaugă</span>
                    </label>
                  </div>
                </div>

                <button onClick={next} disabled={uploadingPhotos} className="ch-cta"
                  style={{ marginTop: 24, width: "100%", padding: "14px 24px", borderRadius: 50, border: "none", background: uploadingPhotos ? "#FFB07A" : C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: uploadingPhotos ? "default" : "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif" }}>
                  {uploadingPhotos ? "Se încarcă..." : "Salvează și continuă →"}
                </button>
                <button onClick={() => { setStep(s => s + 1); }} type="button"
                  style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 50, border: `1.5px solid ${C.line}`, background: C.surface, color: C.muted, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  Sari peste →
                </button>
                <button onClick={() => { setErrors({}); setStep(s => s - 1); }} type="button"
                  style={{ marginTop: 6, width: "100%", padding: "10px", borderRadius: 50, border: "none", background: "transparent", color: C.dim, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  ← Înapoi
                </button>
              </div>
            )}

            {/* ── STEP 4 — Gata! ── */}
            {step === 4 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.orangeSoft, border: `3px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <CheckCircle size={40} color={C.orange} strokeWidth={1.8} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 10 }}>Salonul tău e live!</h2>
                <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
                  <strong style={{ color: C.text }}>{dateFirma.numeSalon}</strong> apare acum pe CalyHub.<br />
                  Primești programări automat — chiar și când dormi.
                </p>

                <div style={{ background: C.orangeSoft, border: `1px solid var(--pub-orange-border)`, borderRadius: 18, padding: "18px 20px", marginBottom: 28, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--pub-orange-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle size={14} strokeWidth={2.5} /> Trial gratuit activat
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {d && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2, fontWeight: 600 }}>
                        <d.Icon size={14} color={C.orange} strokeWidth={2} />
                        Salon de {d.eticheta.toLowerCase()}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2, fontWeight: 600 }}>
                      <MapPin size={14} color={C.orange} strokeWidth={2} />
                      {adresaCompleta(true)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2, fontWeight: 600 }}>
                      <Scissors size={14} color={C.orange} strokeWidth={2} />
                      {servicii.filter(s => s.nume).length} servicii configurate
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2, fontWeight: 600 }}>
                      <Users size={14} color={C.orange} strokeWidth={2} />
                      {echipa.filter(g => g.nume).length || 1} {d?.rolPlural || "specialiști"}
                    </div>
                    {dateFirma.cui && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text2, fontWeight: 600 }}>
                        <FileText size={14} color={C.orange} strokeWidth={2} />
                        {dateFirma.tipEntitate} · CUI: {dateFirma.cui}
                      </div>
                    )}
                    {programRezumat && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: C.text2, fontWeight: 600 }}>
                        <Clock size={14} color={C.orange} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{programRezumat}</span>
                      </div>
                    )}
                    {d?.areSpecii && speciiSelectate.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.text2, fontWeight: 600, flexWrap: "wrap" }}>
                        {speciiSelectate.map(v => {
                          const s = SPECII.find(x => x.val === v);
                          return s ? <span key={v}>{s.icon} {s.label}</span> : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={() => router.push("/register/abonament-salon")} className="ch-cta"
                  style={{ padding: "14px 32px", borderRadius: 50, border: "none", background: C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif" }}>
                  Continuă spre alegerea planului →
                </button>
              </div>
            )}

            {step < 3 && (
              <button onClick={next} disabled={saving} className="ch-cta"
                style={{ marginTop: 24, width: "100%", padding: "14px 24px", borderRadius: 50, border: "none", background: saving ? "#FFB07A" : C.orange, color: "#fff", fontSize: 15, fontWeight: 800, cursor: saving ? "default" : "pointer", boxShadow: "0 8px 24px rgba(255,107,0,.32)", fontFamily: "Nunito, sans-serif", transition: "background .2s" }}>
                {saving ? "Se salvează..." : step === 2 ? "Finalizează configurarea →" : "Continuă →"}
              </button>
            )}
            {step > 0 && step < 3 && (
              <button onClick={() => { setErrors({}); setStep(s => s - 1); }}
                style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 50, border: `1.5px solid ${C.line}`, background: C.surface, color: C.muted, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                ← Înapoi
              </button>
            )}

          </div>
        </div>
      </main>
      <Footer variant="auth" />
    </div>
  );
}
