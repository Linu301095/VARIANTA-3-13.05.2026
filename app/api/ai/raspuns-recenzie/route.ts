import { NextRequest, NextResponse } from "next/server";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: NextRequest) {
  const { salonNume, clientNume, rating, text, animal } = await req.json();

  if (!text || typeof rating !== "number") {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }

  const salon = salonNume || "salonul nostru";
  const client = clientNume || "drag client";
  const animalNume = animal?.nume || null;
  const animalRasa = animal?.rasa || null;
  const animalText = animalNume
    ? animalNume
    : animalRasa
    ? `micuțul tău ${animalRasa}`
    : "animalul tău";

  let raspuns: string;

  if (rating >= 4) {
    if (animalNume) {
      raspuns = pick([
        `Mulțumim mult, ${client}! Ne bucurăm că ${animalNume} a plecat fericit și aranjat. Îl așteptăm cu drag data viitoare la ${salon}!`,
        `Îți mulțumim pentru cuvintele frumoase, ${client}! ${animalNume} a fost o bucurie pentru noi și abia așteptăm să îl revedem.`,
        `Recenzia ta înseamnă mult pentru echipa noastră, ${client}! Suntem fericiți că ${animalNume} s-a simțit bine la noi. Te așteptăm oricând!`,
        `Mulțumim frumos, ${client}! A fost o plăcere să avem grijă de ${animalNume} și sperăm să vă revedem curând la ${salon}.`,
        `Apreciem enorm feedback-ul tău, ${client}! ${animalNume} a fost adorabil și echipa noastră a fost încântată să lucreze cu el. Ne vedem la următoarea vizită!`,
        `Îți mulțumim din inimă, ${client}! ${animalNume} a stat minunat și suntem bucuroși că ați ales ${salon}. Vă așteptăm cu drag!`,
      ]);
    } else {
      raspuns = pick([
        `Mulțumim mult, ${client}! Ne bucurăm că ai fost mulțumit de serviciile noastre. Te așteptăm cu drag și data viitoare!`,
        `Îți mulțumim pentru recenzia frumoasă, ${client}! Feedback-ul tău ne motivează să oferim în continuare cele mai bune servicii.`,
        `Recenzia ta înseamnă mult pentru noi, ${client}! Suntem bucuroși că ai ales ${salon} și te așteptăm oricând.`,
        `Mulțumim frumos pentru cuvintele bune, ${client}! A fost o plăcere și sperăm să te revedem curând.`,
        `Apreciem feedback-ul tău, ${client}! Echipa ${salon} depune tot efortul pentru a oferi servicii de calitate și ne bucurăm că se simte.`,
        `Îți mulțumim, ${client}! Fiecare recenzie pozitivă ne face să mergem mai departe cu același entuziasm. Te așteptăm oricând!`,
      ]);
    }
  } else if (rating === 3) {
    raspuns = pick([
      `Mulțumim pentru feedback, ${client}! Luăm în serios toate observațiile și lucrăm continuu să îmbunătățim experiența la ${salon}. Te invităm să revii pentru a vedea progresul nostru.`,
      `Îți mulțumim că ne-ai lăsat o recenzie, ${client}. Feedback-ul tău ne ajută să ne îmbunătățim. Sperăm să avem ocazia să îți oferim o experiență mai bună data viitoare.`,
      `Apreciem că ți-ai luat timp să ne lași o recenzie, ${client}. Vom analiza observațiile tale cu atenție și te așteptăm oricând pentru a îndrepta orice neajuns.`,
      `Mulțumim pentru onestitate, ${client}! Fiecare feedback ne ajută să creștem. Sperăm să te revedem și să îți dovedim că putem face mai mult.`,
      `Îți mulțumim pentru recenzie, ${client}. Suntem conștienți că mai avem de lucrat și apreciem că ne oferi această șansă. Te așteptăm cu drag!`,
    ]);
  } else {
    raspuns = pick([
      `Ne pare rău că experiența nu a fost la înălțimea așteptărilor tale, ${client}. Îți mulțumim că ne-ai anunțat și ne-ar face plăcere să discutăm direct pentru a remedia situația. Te invităm să ne contactezi.`,
      `Îți mulțumim pentru feedback, ${client}, chiar dacă nu este ușor de citit. Regretăm că lucrurile nu au mers cum trebuia și suntem deschiși să discutăm pentru a găsi o soluție.`,
      `Ne cerem scuze pentru experiența neplăcută, ${client}. Feedback-ul tău este important pentru noi și vom analiza cu atenție ce s-a întâmplat. Te rugăm să ne contactezi direct dacă dorești să discutăm mai mult.`,
      `Regretăm că vizita nu a fost pe măsura așteptărilor, ${client}. Luăm în serios fiecare sesizare și ne-ar face plăcere să discutăm personal pentru a îndrepta situația.`,
      `Îți mulțumim că ne-ai spus, ${client}. Nu aceasta este experiența pe care dorim să o oferim și vom face tot posibilul să îmbunătățim lucrurile. Te așteptăm să ne dai o nouă șansă.`,
    ]);
  }

  return NextResponse.json({ raspuns });
}
