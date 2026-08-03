/**
 * Planurile CalyHub — SINGURA sursă de adevăr.
 *
 * Folosit de: /preturi (pagina publică), /register/abonament-salon (ultimul pas
 * al înscrierii) și tabul „Abonamentul meu" din dashboardul salonului.
 * Dacă schimbi un preț sau o caracteristică, se schimbă peste tot deodată.
 */

export type PlanId = "basic" | "pro" | "business";
export type Vertical = "infrumusetare" | "grooming";
export type Ciclu = "lunar" | "anual";

export const VERTICAL: Record<Vertical, {
  eticheta: string;
  rol: string;
  rolPl: string;
  pret: string;
  fisa: string;
}> = {
  infrumusetare: {
    eticheta: "Salon de înfrumusețare",
    rol: "specialist",
    rolPl: "specialiști",
    pret: "Preț și durată pe serviciu",
    fisa: "recomandări după vizită",
  },
  grooming: {
    eticheta: "Salon de grooming",
    rol: "groomer",
    rolPl: "groomeri",
    pret: "Preț și durată pe talie (mică / medie / mare)",
    fisa: "fișă de îngrijire post-grooming",
  },
};

export type Plan = {
  id: PlanId;
  nume: string;
  tagline: string;
  descriere: string;
  pretLunar: number;
  pretAnual: number;
  badge: string | null;
  recomandat: boolean;
  prefix: string | null;
  features: string[];
};

/** Reducerea la plata anuală, în procente (calculată din prețuri). */
export const REDUCERE_ANUALA = 17;

export function planuriPentru(v: Vertical): Plan[] {
  const V = VERTICAL[v];
  return [
    {
      id: "basic",
      nume: "Basic",
      tagline: "Salonul solo",
      descriere: `Pentru un ${V.rol} singur sau cu un asistent`,
      pretLunar: 69,
      pretAnual: 57,
      badge: null,
      recomandat: false,
      prefix: null,
      features: [
        `Până la 2 useri (${V.rol} + asistent)`,
        V.pret,
        "Programări nelimitate, agendă digitală",
        "Profil public + galerie 5 poze",
        "Statistici esențiale — Azi / Lună, rating, recenzii",
        "Raport Excel (perioada curentă)",
        "Remindere WhatsApp nelimitate + 30 SMS / lună",
        "Suport pe email",
        "✨ Agent AI: răspunsuri la recenzii",
      ],
    },
    {
      id: "pro",
      nume: "Pro",
      tagline: "Salon cu echipă",
      descriere: "Pentru saloane în creștere, 3-6 persoane",
      pretLunar: 119,
      pretAnual: 99,
      badge: "Cel mai popular",
      recomandat: true,
      prefix: "Tot ce e în Basic, plus:",
      features: [
        "3-6 useri, fiecare cu orar individual",
        `Clientul alege ${V.rol}ul + blocaj per ${V.rol}`,
        "Galerie 10 poze",
        "Statistici complete — filtre Azi / Săptămână / Lună / An / Interval",
        `Evoluție lunară și productivitate per ${V.rol}`,
        "Raport Excel complet (secțiuni selectabile)",
        "Remindere WhatsApp nelimitate + 100 SMS / lună",
        'Badge "Profil verificat"',
        "✨ Agent AI: alertă clienți inactivi",
      ],
    },
    {
      id: "business",
      nume: "Business",
      tagline: "Salon mare / lanț",
      descriere: "Pentru saloane mari sau cu mai multe locații",
      pretLunar: 219,
      pretAnual: 182,
      badge: "All-in",
      recomandat: false,
      prefix: "Tot ce e în Pro, plus:",
      features: [
        `Useri nelimitați + login individual per ${V.rol} (în curând)`,
        'Listare promovată în oraș — badge "Recomandat"',
        "Remindere WhatsApp + SMS nelimitate",
        "Suport prioritar 24/7 + manager dedicat",
        "Multi-locație (în curând)",
        `✨ Agent AI: ${V.fisa}`,
        "✨ Agent AI: Consultant de business",
      ],
    },
  ];
}

/** Prețul afișat pentru un plan, în funcție de ciclul de facturare. */
export function pretPlan(p: Plan, ciclu: Ciclu): number {
  return ciclu === "anual" ? p.pretAnual : p.pretLunar;
}

/** Numele afișat al unui plan, pornind de la id-ul salvat în baza de date. */
export function numePlan(id: string | null | undefined): string {
  const p = planuriPentru("infrumusetare").find(x => x.id === id);
  return p ? p.nume : "Basic";
}
