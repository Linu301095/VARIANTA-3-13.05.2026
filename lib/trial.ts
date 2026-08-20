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
 *
 * ATENȚIE: „abonat" se întoarce DOAR când `abonament_activ` e true în bază.
 * Nimic altceva nu poate produce cuvântul ăsta. Înainte, un salon fără dată de
 * trial era declarat abonat — apărea cu „Abonament activ" în dashboard și
 * intra la „MRR real (încasat)" în admin, deși nu plătise nimeni nimic.
 *
 * Pentru salonul fără `trial_expira_la` folosim `created_at + ZILE_TRIAL`:
 * e fix ce ar fi primit dacă trialul ar fi existat la înscrierea lui, și nu se
 * reîncarcă la fiecare intrare în cont, cum s-ar întâmpla dacă am porni
 * trialul „de acum".
 */
export function stareTrial(
  trialExpiraLa: string | null | undefined,
  abonamentActiv?: boolean | null,
  creatLa?: string | null,
  acum: Date = new Date()
): StareTrial {
  if (abonamentActiv) return { stare: "abonat" };

  const expira = trialExpiraLa
    ? new Date(trialExpiraLa)
    : creatLa
      ? new Date(new Date(creatLa).getTime() + ZILE_TRIAL * 24 * 60 * 60 * 1000)
      : null;

  // Fără nicio dată nu putem ști nimic. Nu inventăm nici abonament, nici
  // expirare: îl tratăm ca pe un trial care se încheie azi — banner portocaliu,
  // nu roșu, și în niciun caz numărat ca salon plătitor.
  if (!expira) return { stare: "trial", zileRamase: 0 };

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
