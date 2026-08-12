/**
 * Eticheta de pe cardul salonului.
 *
 * Înainte se punea după poziția în listă: primul salon primea „Top rated", al
 * doilea „Nou", al treilea „Popular", al patrulea „Premium", și de la capăt.
 * Un salon fără nicio recenzie ajungea „cel mai bine cotat", iar același card
 * putea purta „Top rated" și „Nou" în același timp.
 *
 * Acum fiecare etichetă are o condiție, iar dacă niciuna nu e îndeplinită
 * cardul nu poartă nimic. Regula e aceeași pentru amândouă verticalele —
 * saloanele de înfrumusețare și cele de grooming trec prin aceleași praguri.
 *
 * „Premium" a fost scoasă de tot: sugerează un plan plătit, iar clientul n-are
 * treabă cu ce abonament are salonul.
 */

export type Badge = { text: string; ton: "aur" | "verde" | "albastru" } | null;

/** Câte recenzii trebuie strânse înainte ca media să însemne ceva. */
export const MIN_RECENZII_TOP = 5;
/** Nota de la care în sus salonul e „Top rated". */
export const NOTA_TOP = 4.5;
/** Cât timp după înscriere salonul e încă „Nou". */
export const ZILE_NOU = 30;
/**
 * Câte programări în ultimele 30 de zile fac un salon „Popular".
 *
 * Numărul nu se poate calcula azi din dashboardul clientului: regulile de acces
 * din bază nu-i lasă să vadă programările altora. Ca să pornească eticheta e
 * nevoie de un contor ținut pe rândul salonului (de exemplu
 * `saloane.programari_30z`), actualizat de o sarcină programată. Până atunci
 * `programariRecente` vine nedefinit și eticheta pur și simplu nu apare —
 * restul regulilor merg mai departe.
 */
export const MIN_PROGRAMARI_POPULAR = 15;

export function calculeazaBadge(date: {
  medie?: number;
  nrRecenzii?: number;
  createdAt?: string | null;
  programariRecente?: number;
}): Badge {
  const { medie = 0, nrRecenzii = 0, createdAt, programariRecente } = date;

  // Ordinea contează: un salon poate îndeplini două condiții deodată, iar
  // atunci poartă doar pe cea mai valoroasă pentru client.
  if (nrRecenzii >= MIN_RECENZII_TOP && medie >= NOTA_TOP) {
    return { text: "Top rated", ton: "aur" };
  }

  if (typeof programariRecente === "number" && programariRecente >= MIN_PROGRAMARI_POPULAR) {
    return { text: "Popular", ton: "albastru" };
  }

  if (createdAt) {
    const zile = (Date.now() - new Date(createdAt).getTime()) / 86400000;
    if (zile >= 0 && zile <= ZILE_NOU) return { text: "Nou", ton: "verde" };
  }

  return null;
}

/** Culorile fiecărui ton, pe temă. */
export function culoriBadge(ton: "aur" | "verde" | "albastru", intunecat: boolean) {
  const paleta = {
    aur: { text: "#B45309", fundal: intunecat ? "rgba(245,158,11,.18)" : "#FEF3C7", plin: "#F59E0B" },
    verde: { text: "#047857", fundal: intunecat ? "rgba(16,185,129,.18)" : "#D1FAE5", plin: "#10B981" },
    albastru: { text: "#1D4ED8", fundal: intunecat ? "rgba(59,130,246,.18)" : "#DBEAFE", plin: "#3B82F6" },
  };
  const p = paleta[ton];
  return { text: intunecat ? p.plin : p.text, fundal: p.fundal, plin: p.plin };
}
