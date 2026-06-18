import { NextRequest, NextResponse } from "next/server";

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
  const rasa = c.rasaAnimal || null;
  const animalText = animal ? animal : rasa ? `micuțul tău ${rasa}` : "micuțul tău";
  const serviciu = c.ultimulServiciu || "grooming";
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

  const rezultate = clienti.slice(0, 10).map((c) => {
    const mesajAI = genereazaMesaj(c, reducereVal, codVal);
    return { ...c, mesajAI, cod: codVal, reducere: reducereVal };
  });

  return NextResponse.json({ clienti: rezultate });
}
