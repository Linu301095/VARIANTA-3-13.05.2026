/**
 * Regulile trialului CalyHub — un singur loc pentru toate.
 *
 * ATENȚIE: durata trialului NU se comunică public. Pe site scriem doar
 * „trial gratuit", niciodată numărul de zile.
 */

/** Cât ține trialul, de la finalizarea wizardului de salon. */
export const ZILE_TRIAL = 14;

/** După expirare, câte zile mai păstrăm datele salonului înainte de ștergere. */
export const ZILE_PANA_LA_STERGERE = 30;

/** Cu câte zile înainte de expirare începem să avertizăm în dashboard. */
export const ZILE_AVERTISMENT = 3;

export type StareTrial =
  | { stare: "abonat" }                                   // plătește — nu se aplică nimic
  | { stare: "trial"; zileRamase: number }                // în perioada de probă
  | { stare: "expirat"; zileDeLaExpirare: number; zilePanaLaStergere: number };

/** Câte zile întregi sunt între două momente (poate ieși negativ). */
function zileIntre(de: Date, pana: Date): number {
  const MS_ZI = 24 * 60 * 60 * 1000;
  const a = new Date(de.getFullYear(), de.getMonth(), de.getDate()).getTime();
  const b = new Date(pana.getFullYear(), pana.getMonth(), pana.getDate()).getTime();
  return Math.round((b - a) / MS_ZI);
}

/**
 * Starea salonului, calculată din datele lui.
 * `abonamentActiv` devine true abia când vom avea plăți (Stripe).
 */
export function stareTrial(
  trialExpiraLa: string | null | undefined,
  abonamentActiv?: boolean | null,
  acum: Date = new Date()
): StareTrial {
  if (abonamentActiv) return { stare: "abonat" };
  if (!trialExpiraLa) return { stare: "abonat" }; // saloane vechi, fără trial înregistrat

  const expira = new Date(trialExpiraLa);
  const zileRamase = zileIntre(acum, expira);

  if (zileRamase >= 0) return { stare: "trial", zileRamase };

  const zileDeLaExpirare = -zileRamase;
  return {
    stare: "expirat",
    zileDeLaExpirare,
    zilePanaLaStergere: Math.max(0, ZILE_PANA_LA_STERGERE - zileDeLaExpirare),
  };
}

/** Text scurt pentru zile, în română. */
export function zileText(n: number): string {
  return n === 1 ? "o zi" : `${n} zile`;
}
