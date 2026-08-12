/**
 * Verificarea pozelor înainte de încărcare.
 *
 * Peste tot în aplicație scria „JPG, PNG, WEBP — max 5MB", dar nimeni nu
 * verifica nimic: un PDF de 40MB se salva liniştit, iar apoi aplicaţia
 * încerca să-l afişeze ca poză. Omul rămânea cu o iconiţă ruptă în loc de
 * avatar, fără să înţeleagă de ce, iar fişierul stătea mai departe în
 * stocare — care se plăteşte la gigabyte.
 *
 * Regulile stau aici ca să fie aceleaşi la avatar, la poza animalului şi la
 * pozele salonului. Dacă schimbăm limita, o schimbăm o dată.
 */

export const MARIME_MAX_MB = 5;
const MARIME_MAX = MARIME_MAX_MB * 1024 * 1024;

const TIPURI = ["image/jpeg", "image/png", "image/webp"];
/** Ce scriem sub butoanele de încărcare, ca textul să nu se abată de la reguli. */
export const TEXT_REGULI_POZA = `JPG, PNG sau WEBP — maximum ${MARIME_MAX_MB}MB`;

/**
 * Întoarce un mesaj de eroare, sau `null` dacă poza e bună.
 *
 * Mesajul e gata de arătat omului: spune şi ce e greşit, şi ce să facă.
 */
export function verificaPoza(file: File): string | null {
  if (!TIPURI.includes(file.type)) {
    // Unele telefoane trimit HEIC din poza de galerie — merită spus pe nume,
    // altfel omul crede că poza lui e stricată.
    const heic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
    if (heic) return "Pozele de pe iPhone (HEIC) nu pot fi afi\u0219ate pe web. Fă o captură de ecran cu poza și încarcă captura, sau schimbă din Setări \u2192 Cameră \u2192 Formate pe \u201eCea mai compatibil\u0103\u201d.";
    return `Alege o poză în format JPG, PNG sau WEBP.`;
  }
  if (file.size > MARIME_MAX) {
    const mb = (file.size / 1024 / 1024).toFixed(1).replace(".", ",");
    return `Poza e prea mare (${mb}MB). Alege una sub ${MARIME_MAX_MB}MB.`;
  }
  return null;
}
