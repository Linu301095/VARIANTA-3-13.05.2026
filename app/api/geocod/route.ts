import { NextResponse } from "next/server";

/**
 * Transformă adresa unui salon în coordonate.
 *
 * Folosim Nominatim (OpenStreetMap), același serviciu cu care aflăm deja orașul
 * clientului din GPS. E gratis și nu cere cont, dar are două condiții pe care
 * un apel din browser nu le poate respecta: un `User-Agent` care spune cine
 * întreabă, și cel mult o cerere pe secundă. De asta trece prin server.
 *
 * Se cheamă rar — o dată când salonul se înscrie și încă o dată dacă își
 * schimbă adresa — deci nu ne apropiem de limite.
 *
 * Dacă nu găsește nimic, întoarce 404 și salonul rămâne fără coordonate:
 * apare mai departe în listă, doar că fără distanță. Înscrierea nu se blochează
 * niciodată din cauza asta.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const AGENT = "CalyHub/1.0 (https://varianta-3-13-05-2026.vercel.app)";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 6) {
    return NextResponse.json({ error: "Adresă prea scurtă" }, { status: 400 });
  }

  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=ro&accept-language=ro&q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": AGENT, "Accept": "application/json" },
      // Aceeași adresă dă același rezultat — nu are rost s-o cerem de două ori.
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Serviciul de hărți nu răspunde" }, { status: 502 });
    }
    const date = await res.json();
    const primul = Array.isArray(date) ? date[0] : null;
    if (!primul?.lat || !primul?.lon) {
      return NextResponse.json({ error: "Adresa nu a fost găsită" }, { status: 404 });
    }
    return NextResponse.json({
      lat: Number(primul.lat),
      lng: Number(primul.lon),
      potrivire: primul.display_name || null,
    });
  } catch {
    return NextResponse.json({ error: "Eroare la căutarea adresei" }, { status: 502 });
  }
}
