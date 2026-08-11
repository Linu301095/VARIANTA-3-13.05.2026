/**
 * Regulile de parolă, într-un singur loc.
 *
 * Se folosesc la înregistrare (`app/register`) și la schimbarea parolei din
 * dashboard. Ținute separat ca să nu ajungem cu două praguri diferite: e
 * absurd ca formularul de înscriere să ceară 12 caractere, iar schimbarea
 * parolei să accepte 8.
 *
 * Culorile sunt variabilele publice `--pub-*`; dashboardurile își au paleta
 * lor, deci acolo se trimit culorile prin `culori`.
 */

/** -1 = câmp gol, 0..3 = slabă → puternică. */
export function putereParola(p: string): number {
  if (!p) return -1;
  let scor = 0;
  if (p.length >= 8) scor++;
  if (p.length >= 12) scor++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) scor++;
  if (/\d/.test(p)) scor++;
  if (/[^A-Za-z0-9]/.test(p)) scor++;
  return Math.min(3, Math.max(0, scor - 1));
}

export const PUTERE_PUBLIC = [
  { t: "Slabă", c: "var(--pub-danger)" },
  { t: "Acceptabilă", c: "#E08900" },
  { t: "Bună", c: "var(--pub-ok)" },
  { t: "Puternică", c: "var(--pub-ok)" },
];

/** Aceleași trepte, cu culori fixe — pentru dashboarduri, care nu au `--pub-*`. */
export const PUTERE_DASH = [
  { t: "Slabă", c: "#EF4444" },
  { t: "Acceptabilă", c: "#E08900" },
  { t: "Bună", c: "#10B981" },
  { t: "Puternică", c: "#10B981" },
];

/**
 * Ce lipsește ca parola să fie mai puternică, în ordinea impactului.
 * Bara singură spune „Slabă" și îl lasă pe om să ghicească de ce; asta îi spune
 * ce să facă. Arătăm cel mult două sfaturi deodată, ca să nu pară o listă de
 * cerințe imposibile.
 */
export function sfaturiParola(p: string): string[] {
  const s: string[] = [];
  if (p.length < 12) s.push("fă-o de cel puțin 12 caractere");
  if (!/[A-Z]/.test(p) || !/[a-z]/.test(p)) s.push("amestecă litere mari și mici");
  if (!/\d/.test(p)) s.push("adaugă o cifră");
  if (!/[^A-Za-z0-9]/.test(p)) s.push("pune un semn, de exemplu ! sau ?");
  return s.slice(0, 2);
}

/** Minimul acceptat la înscriere și la schimbare. */
export const PAROLA_MIN = 8;
