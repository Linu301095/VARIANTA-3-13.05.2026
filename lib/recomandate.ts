/**
 * Secțiunea „Recomandate" din lista de saloane.
 *
 * Înainte lua pur și simplu primele două saloane din listă și le arăta sub un
 * titlu care promitea o alegere. Cu trei saloane în bază, aceleași carduri
 * apăreau de două ori pe același ecran.
 *
 * Acum e o recomandare adevărată — și **se aprinde singură**, fără să mai
 * modificăm cod. Cât timp lista e scurtă sau niciun salon nu strânge destule
 * recenzii, funcția întoarce lista goală și secțiunea nu se afișează deloc.
 * În ziua în care ai destule saloane cu recenzii, apare de la sine.
 *
 * De reevaluat când există trafic: se poate adăuga „are locuri libere azi",
 * care cere sloturile calculate server-side.
 */

/** Sub atâtea saloane în listă, o secțiune de recomandări n-are ce alege. */
export const MIN_SALOANE_LISTA = 12;
/** Câte saloane trebuie să merite recomandarea ca secțiunea să apară. */
export const MIN_RECOMANDATE = 3;
/** Câte arătăm cel mult. */
export const MAX_RECOMANDATE = 4;
/** Pragurile de calitate — aceleași cu ale badge-ului „Top rated". */
export const NOTA_MINIMA = 4.5;
export const RECENZII_MINIME = 5;

type Rating = { medie: number; nr: number } | undefined;

/**
 * Saloanele de pus în față. Lista goală înseamnă „nu afișa secțiunea".
 *
 * `rating` e harta de note deja calculată în dashboard, pe id de salon.
 */
export function alegeRecomandate<T extends { id: string | number }>(
  saloane: T[],
  rating: Record<string, { medie: number; nr: number }>,
): T[] {
  if (saloane.length < MIN_SALOANE_LISTA) return [];

  const merita = saloane.filter(s => {
    const r: Rating = rating[String(s.id)];
    return !!r && r.nr >= RECENZII_MINIME && r.medie >= NOTA_MINIMA;
  });

  if (merita.length < MIN_RECOMANDATE) return [];

  // Nota întâi, apoi numărul de recenzii: între două saloane cu 4.8, îl punem
  // în față pe cel confirmat de mai multă lume.
  return [...merita]
    .sort((a, b) => {
      const ra = rating[String(a.id)], rb = rating[String(b.id)];
      if (rb.medie !== ra.medie) return rb.medie - ra.medie;
      return rb.nr - ra.nr;
    })
    .slice(0, MAX_RECOMANDATE);
}
