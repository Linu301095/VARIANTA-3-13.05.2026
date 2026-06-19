import { NextRequest, NextResponse } from "next/server";
import { claude } from "../../../../lib/claude";

const HAIKU = "claude-haiku-4-5-20251001";

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

// Instructiunile pentru fiecare tip de raport premium.
const INSTRUCTIUNI_RAPORT: Record<string, string> = {
  lunar:
    "Genereaza RAPORTUL LUNII pentru acest salon, ca un consultant de business. Structura, cu titluri scurte:\n" +
    "1) Pe scurt — 2-3 propozitii cu starea generala a lunii.\n" +
    "2) Ce a mers bine — 2-3 puncte concrete bazate pe date.\n" +
    "3) Ce trebuie imbunatatit — 2-3 puncte.\n" +
    "4) 3 recomandari concrete pentru luna viitoare.\n" +
    "Maxim 280 de cuvinte. Foloseste cifrele reale din date.",
  preturi:
    "Genereaza o ANALIZA DE PRETURI SI INCASARI pentru acest salon. Acopera:\n" +
    "- Ce servicii aduc cei mai multi bani si care sunt sub-utilizate.\n" +
    "- Unde ar putea creste pretul sau crea pachete.\n" +
    "- O estimare realista a impactului.\n" +
    "Maxim 250 de cuvinte, concret, pe baza datelor reale.",
  crestere:
    "Genereaza un PLAN DE CRESTERE pentru acest salon, cu exact 3 actiuni concrete, prioritizate. " +
    "Pentru fiecare actiune: ce sa faca, de ce (legat de date), si rezultatul asteptat. " +
    "Maxim 250 de cuvinte.",
  echipa:
    "Genereaza o ANALIZA A PERFORMANTEI ECHIPEI (groomeri) pentru acest salon. Acopera:\n" +
    "- Cine performeaza si cine are nevoie de sprijin (pe baza programarilor/incasarilor).\n" +
    "- Echilibrarea programului.\n" +
    "- 2 recomandari concrete.\n" +
    "Daca nu exista date pe groomeri, spune asta si da sfaturi generale de organizare. Maxim 250 de cuvinte.",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tip, intrebare, snapshot, salonNume } = body as {
    tip?: string;
    intrebare?: string;
    snapshot: any;
    salonNume: string;
  };

  const snapshotText = snapshot ? formateazaSnapshot(snapshot) : "";

  const systemPrompt = `Esti consultantul AI de business al salonului de grooming "${salonNume || "salon"}" pe platforma CalyHub.
Misiunea ta: analizezi datele reale ale salonului si oferi sfaturi concrete, actionabile, in limba romana.

${snapshotText ? `DATE REALE ALE SALONULUI (bazeaza-te STRICT pe acestea):\n${snapshotText}` : "Salonul este nou si nu are date suficiente inca — ofera sfaturi generale de pornire."}

REGULI:
- Scrii in limba romana, ton de consultant cu experienta in pet grooming din Romania.
- Te bazezi pe cifrele reale de mai sus — NU inventa date care nu apar.
- Daca datele sunt insuficiente, spui asta clar si oferi sfatul general relevant.
- Practic si direct, fara introduceri pompoase. Formatare curata, cu titluri scurte si bullet-uri unde ajuta.`;

  let userContent = "";
  let maxTokens = 700;

  if (tip && INSTRUCTIUNI_RAPORT[tip]) {
    userContent = INSTRUCTIUNI_RAPORT[tip];
  } else if (intrebare && String(intrebare).trim()) {
    maxTokens = 400;
    userContent =
      `Intrebarea salonului: "${String(intrebare).trim()}"\n\n` +
      "Raspunde concret, in maxim 180 de cuvinte, doar pe baza datelor reale. " +
      "Daca intrebarea NU are legatura cu salonul, grooming, business, echipa, marketing, preturi, servicii, clienti sau finante, " +
      'refuza scurt intr-o propozitie: "Pot ajuta doar cu intrebari legate de activitatea salonului."';
  } else {
    return NextResponse.json({ error: "Lipseste tipul raportului sau intrebarea" }, { status: 400 });
  }

  try {
    const msg = await claude.messages.create({
      model: HAIKU,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
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
