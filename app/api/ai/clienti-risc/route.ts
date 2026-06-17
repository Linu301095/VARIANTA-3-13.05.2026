import { NextRequest, NextResponse } from "next/server";
import { claude, CLAUDE_MODEL } from "../../../../lib/claude";

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

export async function POST(req: NextRequest) {
  const { clienti, reducere, cod }: { clienti: ClientRisc[]; reducere?: number; cod?: string } = await req.json();

  if (!Array.isArray(clienti) || clienti.length === 0) {
    return NextResponse.json({ clienti: [] });
  }

  const reducereVal = typeof reducere === "number" && reducere > 0 ? reducere : 0;
  const codVal = reducereVal > 0 && cod ? cod : "";

  const rezultate = await Promise.all(
    clienti.slice(0, 10).map(async (c) => {
      const instructiuneReducere = reducereVal > 0 && codVal
        ? `\n\nMenționează firesc, spre finalul mesajului, că pot folosi codul ${codVal} pentru ${reducereVal}% reducere la următoarea programare. Integrează-l natural în text, nu îl pune ca pe un banner publicitar și nu insista.`
        : `\n\nNu promite reduceri.`;

      const prompt = `Ești asistentul unui salon de grooming și trebuie să scrii un mesaj scurt de reactivare pentru un client care nu a mai revenit.

Date client:
- Nume client: ${c.numeClient}
- Animal: ${c.numeAnimal ? `${c.numeAnimal}${c.rasaAnimal ? ` (${c.rasaAnimal})` : ""}` : "necunoscut"}
- Ultimul serviciu: ${c.ultimulServiciu || "grooming"}
- Ultima vizită: acum ${c.zileAbsenta} zile
- Intervalul lui obișnuit de vizită: la ${c.intervalMediu} zile

Scrie un mesaj de WhatsApp/SMS de maxim 3 propoziții, în română, prietenos și cald, fără clișee. Nu folosi emoji. Menționează animalul pe nume dacă îl știi. Scopul e să îl reinvitați natural, nu să pară o reclamă. Scrie direct mesajul, fără introduceri.${instructiuneReducere}`;

      try {
        const msg = await claude.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 220,
          messages: [{ role: "user", content: prompt }],
        });

        const mesajAI = (msg.content as any[])
          .filter((b: any) => b.type === "text")
          .map((b: any) => b.text as string)
          .join("")
          .trim();

        return { ...c, mesajAI, cod: codVal, reducere: reducereVal };
      } catch {
        return null;
      }
    })
  );

  return NextResponse.json({ clienti: rezultate.filter(Boolean) });
}
