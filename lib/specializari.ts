/**
 * Specializările unui salon de înfrumusețare.
 *
 * De ce o listă fixă și scurtă: dacă salonul își scrie singur categoria, în
 * două luni avem „Frizerie", „frizerie barbati", „Barber Shop" și „Barbershop"
 * ca patru lucruri diferite, iar filtrul devine inutil. Aici sunt șapte, alese
 * o dată, aceleași în wizardul de înscriere, în dashboardul salonului și în
 * filtrele clientului.
 *
 * De ce cel mult trei: fără limită, orice salon le bifează pe toate ca să apară
 * peste tot — iar o categorie pe care o are toată lumea nu mai selectează pe
 * nimeni. Trei acoperă și un salon mixt serios („coafor + unghii + cosmetică"),
 * dar îl obligă să spună ce face de fapt.
 *
 * Grooming-ul nu are specializări: acolo distincția reală e pe specii.
 */

export type Specializare = {
  val: string;
  label: string;
  /** Ce se vede sub bifă în wizard — să nu bifeze cineva „Cosmetică" pentru epilat. */
  exemple: string;
};

/** Câte poate bifa un salon. */
export const MAX_SPECIALIZARI = 3;

export const SPECIALIZARI: Specializare[] = [
  { val: "coafor",    label: "Coafor",             exemple: "Tuns, coafat, vopsit, șuvițe, tratamente păr" },
  { val: "frizerie",  label: "Frizerie / Barbershop", exemple: "Tuns bărbați, barbă, ras la brici" },
  { val: "unghii",    label: "Unghii",             exemple: "Manichiură, pedichiură, gel, construcție" },
  { val: "cosmetica", label: "Cosmetică",          exemple: "Tratamente faciale, curățare, îngrijire ten" },
  { val: "epilare",   label: "Epilare",            exemple: "Ceară, laser, pensat" },
  { val: "machiaj",   label: "Machiaj",            exemple: "Machiaj de zi, eveniment, mireasă" },
  { val: "gene",      label: "Gene & sprâncene",   exemple: "Extensii gene, laminare, tuns și vopsit sprâncene" },
];

/** Denumirea de afișat pentru o valoare din bază. */
export function labelSpecializare(val: string): string {
  return SPECIALIZARI.find(s => s.val === val)?.label ?? val;
}

/**
 * Serviciile pe care le-a trecut salonul, transformate în specializări propuse.
 * E doar o sugestie de bifat — omul confirmă. Fără asta, cei mai mulți ar sări
 * peste pas sau ar bifa la întâmplare.
 */
export function specializariSugerate(numeServicii: string[]): string[] {
  const text = numeServicii.join(" ").toLowerCase();
  const are = (...cuvinte: string[]) => cuvinte.some(c => text.includes(c));
  const out: string[] = [];
  if (are("coaf", "vopsit", "șuvi", "suvi", "balayage", "tuns damă", "tuns dama", "tratament păr", "tratament par")) out.push("coafor");
  if (are("barb", "brici", "tuns bărbați", "tuns barbati", "tuns mașină", "tuns masina", "frizer")) out.push("frizerie");
  if (are("manichi", "pedichi", "unghii")) out.push("unghii");
  if (are("facial", "ten", "cosmet", "curățare", "curatare")) out.push("cosmetica");
  if (are("epilat", "ceară", "ceara", "pensat", "laser")) out.push("epilare");
  if (are("machiaj", "make")) out.push("machiaj");
  if (are("gene", "sprâncene", "sprancene", "laminare")) out.push("gene");
  return out.slice(0, MAX_SPECIALIZARI);
}
