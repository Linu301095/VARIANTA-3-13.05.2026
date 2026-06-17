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
  const { clienti }: { clienti: ClientRisc[] } = await req.json();

  if (!Array.isArray(clienti) || clienti.length === 0) {
    return NextResponse.json({ clienti: [] });
  }

  const rezultate = await Promise.all(
    clienti.slice(0, 10).map(async (c) => {
      const prompt = `Ești asistentul unui salon de grooming și trebuie să scrii un mesaj scurt de reactivare pentru un client care nu a mai revenit.

Date client:
- Nume client: ${c.numeClient}
- Animal: ${c.numeAnimal ? `${c.numeAnimal}${c.rasaAnimal ? ` (${c.rasaAnimal})` : ""}` : "necunoscut"}
- Ultimul serviciu: ${c.ultimulServiciu || "grooming"}
- Ultima vizită: acum ${c.zileAbsenta} zile
- Intervalul lui obișnuit de vizită: la ${c.intervalMediu} zile

Scrie un mesaj de WhatsApp/SMS de maxim 3 propoziții, în română, prietenos și cald, fără clișee. Nu promite reduceri. Nu folosi emoji. Menționează animalul pe nume dacă îl știi. Scopul e să îl reinvitați natural, nu să pară o reclamă. Scrie direct mesajul, fără introduceri.`;

      try {
        const msg = await claude.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 200,
          messages: [{ role: "user", content: prompt }],
        });

        const mesajAI = (msg.content as any[])
          .filter((b: any) => b.type === "text")
          .map((b: any) => b.text as string)
          .join("")
          .trim();

        return { ...c, mesajAI };
      } catch {
        return null;
      }
    })
  );

  return NextResponse.json({ clienti: rezultate.filter(Boolean) });
}
