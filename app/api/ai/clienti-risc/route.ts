import { NextRequest, NextResponse } from "next/server";
import { claude } from "../../../../lib/claude";

const HAIKU = "claude-haiku-4-5";

/**
 * Mesajul de reactivare pentru clienții care n-au mai venit.
 *
 * Detectarea clienților a fost mereu reală — se compară absența cu ritmul
 * obișnuit al fiecăruia. **Mesajul** era însă tot un șablon ales la întâmplare,
 * deși scria „sugerat de AI".
 *
 * Acum îl scrie Claude, pentru fiecare client în parte: cât a trecut, ce
 * serviciu prefera, cum îl cheamă pe animal. Se trimit toți clienții într-o
 * singură cerere, ca să nu plătim de zece ori antetul.
 *
 * Costă sub o jumătate de ban per client. Se apasă rar — reactivarea are și
 * un răgaz de 24 de ore între analize.
 */

type ClientRisc = {
  userId: string;
  numeClient: string;
  telefon: string | null;
  numeAnimal: string | null;
  rasaAnimal: string | null;
  ultimaVizita: string;
  zileAbsenta: number;
  intervalMediu: number;
  ultimulServiciu: string;
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genereazaMesaj(c: ClientRisc, reducereVal: number, codVal: string): string {
  const animal = c.numeAnimal || null;
  const serviciu = c.ultimulServiciu || "vizită";
  const client = c.numeClient || "drag client";
  const depasit = c.zileAbsenta > c.intervalMediu * 1.5;

  const sufixReducere =
    reducereVal > 0 && codVal
      ? ` Folosește codul ${codVal} pentru ${reducereVal}% reducere la următoarea programare.`
      : "";

  let mesaje: string[];

  if (depasit) {
    if (animal) {
      mesaje = [
        `Bună, ${client}! ${animal} ne lipsește — a trecut ceva timp de la ultimul ${serviciu} și probabil că are nevoie de îngrijire. Te așteptăm oricând!${sufixReducere}`,
        `Salut, ${client}! Ne gândim la ${animal} și cum mai este. Dacă ești gata pentru o nouă vizită, suntem aici pentru voi.${sufixReducere}`,
        `Bună, ${client}! ${animal} merită o răsfățare — a trecut mai mult decât de obicei de la ultimul ${serviciu}. Suntem gata să îl primim oricând!${sufixReducere}`,
        `Salut, ${client}! A trecut ceva timp și ${animal} probabil că ar aprecia o vizită la noi. Rezervă un loc când ești disponibil.${sufixReducere}`,
        `Bună, ${client}! ${animal} ne-a lăsat o impresie bună data trecută și ne-ar face plăcere să îl revedem curând pentru un nou ${serviciu}.${sufixReducere}`,
        `Salut, ${client}! E posibil că ${animal} are din nou nevoie de îngrijire. Suntem disponibili și te așteptăm oricând cu drag!${sufixReducere}`,
      ];
    } else {
      mesaje = [
        `Bună, ${client}! A trecut ceva timp de la ultima vizită și ne-ar face plăcere să vă revedem. Suntem oricând disponibili pentru o programare.${sufixReducere}`,
        `Salut, ${client}! Ne gândim la voi și sperăm că totul este bine. Când ești gata pentru o nouă vizită, te așteptăm cu drag.${sufixReducere}`,
        `Bună, ${client}! A trecut mai mult decât de obicei de la ultimul ${serviciu}. Suntem gata să vă primim oricând!${sufixReducere}`,
        `Salut, ${client}! O nouă sesiune de ${serviciu} ar putea fi exact ce trebuie acum. Te așteptăm cu drag la noi!${sufixReducere}`,
      ];
    }
  } else {
    if (animal) {
      mesaje = [
        `Bună, ${client}! ${animal} mai are nevoie de noi? Se apropie perioada pentru un nou ${serviciu} și suntem bucuroși să îl programăm.${sufixReducere}`,
        `Salut, ${client}! Dacă ${animal} are nevoie de ${serviciu} în curând, suntem disponibili. Te așteptăm!${sufixReducere}`,
        `Bună, ${client}! E din nou momentul pentru ${serviciu} și ${animal} ar putea fi primul pe lista noastră. Rezervă un loc oricând!${sufixReducere}`,
        `Salut, ${client}! ${animal} a fost un oaspete grozav data trecută. Îl așteptăm oricând pentru o nouă vizită!${sufixReducere}`,
        `Bună, ${client}! Dacă ${animal} e gata de o nouă sesiune de ${serviciu}, noi suntem pregătiți. Te așteptăm!${sufixReducere}`,
      ];
    } else {
      mesaje = [
        `Bună, ${client}! Se apropie momentul pentru un nou ${serviciu}. Suntem disponibili și te așteptăm cu drag!${sufixReducere}`,
        `Salut, ${client}! Dacă aveți nevoie de ${serviciu} în curând, suntem gata să vă programăm. Te așteptăm!${sufixReducere}`,
        `Bună, ${client}! E perioada potrivită pentru ${serviciu} și suntem bucuroși să vă revenim alături. Rezervă oricând!${sufixReducere}`,
        `Salut, ${client}! Un nou ${serviciu} e la orizont. Suntem disponibili și abia așteptăm să vă revedem!${sufixReducere}`,
      ];
    }
  }

  return pick(mesaje);
}

export async function POST(req: NextRequest) {
  const { clienti, reducere, cod }: { clienti: ClientRisc[]; reducere?: number; cod?: string } =
    await req.json();

  if (!Array.isArray(clienti) || clienti.length === 0) {
    return NextResponse.json({ clienti: [] });
  }

  const reducereVal = typeof reducere === "number" && reducere > 0 ? reducere : 0;
  const codVal = reducereVal > 0 && cod ? cod : "";

  const lot = clienti.slice(0, 10);

  // ── Mesajele scrise de Claude, toate într-o singură cerere ──
  if (process.env.ANTHROPIC_API_KEY) {
    const eBeauty = req.headers.get("x-domeniu") === "infrumusetare";
    const system = [
      eBeauty
        ? "Ești proprietarul unui salon de înfrumusețare din România și scrii unor clienți care n-au mai venit de ceva vreme."
        : "Ești proprietarul unui salon de îngrijire animale din România și scrii unor clienți care n-au mai venit de ceva vreme.",
      "",
      "Reguli:",
      "- Un mesaj scurt pentru fiecare client, 1-2 propoziții, ca pentru WhatsApp.",
      "- Pornește de la ce știi despre el: de cât timp n-a mai venit, ce serviciu făcea de obicei" + (eBeauty ? "." : ", cum îl cheamă pe animal."),
      "- Ton prietenos și firesc, ca de la om la om. Fără limbaj de reclamă, fără majuscule, fără emoji peste unul.",
      "- Nu-l face să se simtă dator sau vinovat că n-a venit.",
      reducereVal > 0
        ? `- Menționează discret reducerea de ${reducereVal}% cu codul ${codVal}.`
        : "- Nu inventa reduceri sau oferte.",
      "",
      "Răspunde DOAR cu un array JSON de forma [{\"i\": 0, \"mesaj\": \"...\"}], câte un obiect pentru fiecare client, în ordinea primită. Fără alt text.",
    ].join("\n");

    const lista = lot.map((c, i) => [
      `#${i}`,
      `client: ${c.numeClient || "necunoscut"}`,
      c.numeAnimal ? `animal: ${c.numeAnimal}${c.rasaAnimal ? ` (${c.rasaAnimal})` : ""}` : null,
      `ultimul serviciu: ${c.ultimulServiciu || "necunoscut"}`,
      `nu a mai venit de ${c.zileAbsenta} zile (de obicei revine la ${c.intervalMediu} zile)`,
    ].filter(Boolean).join(", ")).join("\n");

    try {
      const msg = await claude.messages.create({
        model: HAIKU,
        max_tokens: 900,
        system,
        messages: [{ role: "user", content: lista }],
      });
      const brut = (msg.content as any[])
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text as string)
        .join("")
        .trim();
      const potrivit = brut.match(/\[[\s\S]*\]/);
      if (potrivit) {
        const parsate = JSON.parse(potrivit[0]) as { i: number; mesaj: string }[];
        const dupaIndex = new Map(parsate.map(p => [p.i, String(p.mesaj || "").trim()]));
        const rezultateAI = lot.map((c, i) => ({
          ...c,
          // Dacă modelul a sărit un client, cade pe șablon doar acela.
          mesajAI: dupaIndex.get(i) || genereazaMesaj(c, reducereVal, codVal),
          cod: codVal,
          reducere: reducereVal,
        }));
        return NextResponse.json({ clienti: rezultateAI, sursa: "ai" });
      }
    } catch (err) {
      console.error("clienti-risc: Claude a esuat, folosim sabloanele.", err);
    }
  }

  // ── Plasa de siguranță: mesaje gata scrise ──
  const rezultate = lot.map((c) => {
    const mesajAI = genereazaMesaj(c, reducereVal, codVal);
    return { ...c, mesajAI, cod: codVal, reducere: reducereVal };
  });

  return NextResponse.json({ clienti: rezultate, sursa: "sablon" });
}
