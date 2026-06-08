import { NextRequest, NextResponse } from "next/server";
import { claude, CLAUDE_MODEL } from "../../../../lib/claude";

export async function POST(req: NextRequest) {
  const { salonNume, clientNume, rating, text, animal } = await req.json();

  if (!text || typeof rating !== "number") {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }

  const contextAnimal = animal?.nume
    ? `Animalul clientului: ${animal.nume}${animal.rasa ? ` (${animal.rasa})` : ""}.`
    : "";

  const prompt = `Ești asistentul salonului de grooming "${salonNume || "salon"}" și redactezi un răspuns la o recenzie lăsată de un client pe platforma CalyHub.

Recenzie primită:
- Client: ${clientNume || "Client CalyHub"}
- Rating: ${rating}/5 stele
- Text: "${text}"
${contextAnimal}

Scrie un răspuns scurt (2-4 propoziții), în limba română, cald și profesional, din perspectiva salonului:
- Dacă rating-ul e mare (4-5): mulțumește sincer, menționează animalul pe nume dacă îl știi, invită-l să revină.
- Dacă rating-ul e mic (1-3): recunoaște problema fără defensivitate, cere scuze pe scurt, oferă să discute direct pentru a remedia situația — fără promisiuni concrete pe care nu le poți confirma.
Nu folosi clișee exagerate, nu semna cu nume de persoană, nu adăuga emoji. Scrie direct textul răspunsului, fără ghilimele sau introduceri de tipul "Iată un răspuns:".`;

  try {
    const msg = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const raspuns = msg.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("")
      .trim();

    return NextResponse.json({ raspuns });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Eroare la generarea răspunsului" }, { status: 500 });
  }
}
