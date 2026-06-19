import { NextRequest, NextResponse } from "next/server";
import { claude } from "../../../../lib/claude";

const HAIKU = "claude-haiku-4-5-20251001";

type Mesaj = { role: "user" | "assistant"; content: string };

function formateazaSnapshot(s: any): string {
  const semn = (n: number) => (n >= 0 ? `+${n}%` : `${n}%`);
  const linii: string[] = [
    `=== Date salon "${s.salonNume}" — ${s.luna} ===`,
    `Programari luna curenta: ${s.programari.lunaCurenta} (${semn(s.programari.variatieProc)} fata de luna trecuta: ${s.programari.lunaAnterioara})`,
    `Incasari luna curenta: ${s.incasari.lunaCurenta} RON (${semn(s.incasari.variatieProc)} fata de luna trecuta: ${s.incasari.lunaAnterioara} RON)`,
  ];
  if (s.topServicii?.length > 0) {
    linii.push(`Top servicii: ${s.topServicii.map((sv: any) => `${sv.nume} (${sv.count}x, ${sv.venit} RON)`).join("; ")}`);
  }
  if (s.ziSaptamana?.length > 0) {
    linii.push(`Medie programari/zi saptamana: ${s.ziSaptamana.map((z: any) => `${z.zi} ${z.medie}`).join(" | ")}`);
  }
  if (s.groomeri?.length > 0) {
    linii.push(`Groomeri luna curenta: ${s.groomeri.map((g: any) => `${g.nume} — ${g.count}x, ${g.venit} RON`).join("; ")}`);
  }
  linii.push(`Clienti inactivi (>45 zile): ${s.clientiInactivi}`);
  if (s.ratingMediu !== null && s.ratingMediu !== undefined) {
    linii.push(`Rating mediu: ${s.ratingMediu}/5 (${s.numarRecenzii} recenzii noi luna aceasta, ${s.totalRecenzii} total)`);
  } else {
    linii.push(`Total recenzii: ${s.totalRecenzii || 0}`);
  }
  return linii.join("\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mesaje, snapshot, salonNume } = body as { mesaje: Mesaj[]; snapshot: any; salonNume: string };

  if (!Array.isArray(mesaje) || mesaje.length === 0) {
    return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
  }

  const snapshotText = snapshot ? formateazaSnapshot(snapshot) : "";

  const systemPrompt = `Esti consultantul AI de business al salonului de grooming "${salonNume || "salon"}" pe platforma CalyHub.
Misiunea ta: analizezi datele reale ale salonului si oferi sfaturi concrete, actionabile, in limba romana.

${snapshotText ? `DATE REALE ALE SALONULUI (bazeaza-te pe acestea pentru orice raspuns):\n${snapshotText}` : "Salonul este nou si nu are date suficiente inca — ofera sfaturi generale de pornire."}

REGULI:
- Raspunde DOAR la intrebari legate de salon, grooming, business, echipa, marketing, preturi, servicii, clienti, finante
- La orice intrebare complet irelevanta, refuzi scurt in 1 propozitie si redirecezi: "Pot ajuta doar cu intrebari legate de activitatea salonului."
- Raspunsuri clare, practice, maxim 200 de cuvinte, fara introduceri pompoase
- Foloseste datele de mai sus ca baza — nu inventa cifre care nu apar acolo
- Daca datele sunt insuficiente pentru un raspuns precis, mentioneaza asta si ofera sfatul general relevant
- Ton: consultant direct cu experienta in industria pet grooming din Romania`;

  const mesajeTrunchiate = mesaje.slice(-6);

  try {
    const msg = await claude.messages.create({
      model: HAIKU,
      max_tokens: 500,
      system: systemPrompt,
      messages: mesajeTrunchiate,
    });

    const raspuns = (msg.content as any[])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text as string)
      .join("")
      .trim();

    return NextResponse.json({ raspuns });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Eroare la generarea raspunsului" }, { status: 500 });
  }
}
