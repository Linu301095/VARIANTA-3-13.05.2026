/**
 * Distanța dintre client și salon.
 *
 * Se calculează în browser, din coordonatele salonului (salvate la înscriere)
 * și poziția clientului luată din GPS. Poziția clientului **nu se trimite
 * nicăieri** și nu se salvează — trăiește cât ține sesiunea.
 *
 * E distanță în linie dreaptă, nu pe drum. Pentru „care salon e mai aproape"
 * e suficientă și e gratis; distanța pe străzi ar cere un serviciu de rutare
 * plătit, care la 2–3 km diferență nu schimbă alegerea nimănui.
 */

export type Punct = { lat: number; lng: number };

const RAZA_PAMANT_KM = 6371;

/** Formula haversine — distanța pe suprafața globului, în kilometri. */
export function distantaKm(a: Punct, b: Punct): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAZA_PAMANT_KM * Math.asin(Math.sqrt(h));
}

/**
 * Cum o scriem pe card.
 * Sub un kilometru arătăm metri rotunjiți la 50 — „850 m" e util, „847 m" e
 * o precizie pe care GPS-ul oricum n-o are.
 */
export function scrieDistanta(km: number): string {
  if (!isFinite(km) || km < 0) return "";
  if (km < 1) {
    const m = Math.max(50, Math.round((km * 1000) / 50) * 50);
    return `${m} m`;
  }
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}

/** Punctul salonului, dacă îl are. Rândurile mai vechi n-au coordonate. */
export function punctSalon(s: { lat?: number | null; lng?: number | null }): Punct | null {
  if (typeof s.lat !== "number" || typeof s.lng !== "number") return null;
  if (s.lat === 0 && s.lng === 0) return null;
  return { lat: s.lat, lng: s.lng };
}
