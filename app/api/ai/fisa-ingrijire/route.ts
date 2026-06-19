import { NextRequest, NextResponse } from "next/server";

// Fișă de îngrijire post-grooming generată din șabloane (fără cost tokeni).
// Personalizare pe tip de blană (dedus din rasă) + serviciul efectuat.

function faraDiacritice(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ș|ş/g, "s")
    .replace(/ț|ţ/g, "t");
}

type TipBlana =
  | "dublu"
  | "cret"
  | "lung"
  | "sarmos"
  | "scurt"
  | "pisica_lunga"
  | "pisica_scurta"
  | "generic";

// Cuvinte-cheie din numele rasei → tip de blană
const RASE: { tip: TipBlana; chei: string[] }[] = [
  { tip: "dublu", chei: ["husky", "malamute", "golden", "labrador retriever", "samoyed", "corgi", "australian", "border collie", "collie", "chow", "pomeranian", "shiba", "akita", "elvetian", "ciobanesc", "saint bernard", "berner", "spitz", "eskimo", "keeshond"] },
  { tip: "cret", chei: ["pudel", "caniche", "poodle", "bichon", "lagotto", "caniş", "barbet"] },
  { tip: "lung", chei: ["yorkshire", "yorkie", "maltez", "shih tzu", "lhasa", "cocker", "afghan", "setter", "papillon", "havanez", "coton"] },
  { tip: "sarmos", chei: ["schnauzer", "terrier", "westie", "west highland", "scottish", "fox terrier", "griffon", "cairn", "airedale", "wirehaired", "sarmos"] },
  { tip: "scurt", chei: ["beagle", "boxer", "bulldog", "buldog", "dalmatian", "pinscher", "chihuahua", "pug", "mops", "rottweiler", "doberman", "dog", "amstaff", "pitbull", "staffordshire", "weimaraner", "vizsla", "pointer"] },
  { tip: "pisica_lunga", chei: ["persan", "maine coon", "ragdoll", "norvegian", "siberian", "angora", "birmanez", "himalaya"] },
  { tip: "pisica_scurta", chei: ["british", "scottish fold", "siamez", "bengal", "sphynx", "european", "abisinian", "burmez"] },
];

function detecteazaTipBlana(rasa: string | null, specie?: string | null): TipBlana {
  const r = rasa ? faraDiacritice(rasa) : "";
  const sp = specie ? faraDiacritice(specie) : "";
  if (r) {
    for (const g of RASE) {
      if (g.chei.some(k => r.includes(k))) return g.tip;
    }
  }
  // Fără potrivire pe rasă: cădem pe specie
  if (sp.includes("pisic") || sp.includes("cat")) return "pisica_scurta";
  return "generic";
}

const CONTINUT: Record<TipBlana, { intro: string; randuri: string[] }> = {
  dublu: {
    intro: "are blană dublă, deasă, care necesită îngrijire regulată ca să rămână sănătoasă",
    randuri: [
      "Periaj de 3-4 ori pe săptămână, cu o perie tip undercoat rake, pentru a preveni năpârlirea excesivă și nodurile din stratul des.",
      "Zone de atenție: în spatele urechilor, sub picioare și la coadă — aici se formează cel mai des noduri.",
      "Baie acasă nu mai devreme de 3-4 săptămâni; spălatul prea des usucă pielea. Folosește un șampon pentru blană dublă.",
      "Nu rade blana scurt — stratul de blană protejează animalul atât de căldură, cât și de frig.",
    ],
  },
  cret: {
    intro: "are blană creață, care se încâlcește repede și are nevoie de periaj frecvent",
    randuri: [
      "Periaj zilnic sau la 2 zile, cu un pieptene metalic, ca blana să nu se încâlcească.",
      "Zone de atenție: botul, lăbuțele și zona din jurul ochilor.",
      "Baie acasă la 3-4 săptămâni, cu balsam, pentru a păstra blana moale.",
      "Tunde cu grijă părul din jurul ochilor, ca să eviți iritațiile.",
    ],
  },
  lung: {
    intro: "are păr lung, fin, care se încâlcește ușor fără periaj zilnic",
    randuri: [
      "Periaj zilnic, cu o perie moale, pentru a preveni nodurile.",
      "Zone de atenție: urechile, burta și zona din spatele picioarelor.",
      "Baie acasă la 2-3 săptămâni, cu un șampon delicat.",
      "Atenție la părul din jurul ochilor și la petele de lacrimi (tear stains).",
    ],
  },
  sarmos: {
    intro: "are blană sârmoasă, cu o textură care se păstrează prin periaj regulat",
    randuri: [
      "Periaj de 2-3 ori pe săptămână, cu o perie cu peri tari.",
      "Zone de atenție: barba, sprâncenele și picioarele.",
      "Baie acasă la 4-6 săptămâni — blana sârmoasă nu necesită spălat frecvent.",
      "Pentru a păstra textura, evită tunsul cu mașina prea des (ideal este trimming-ul manual).",
    ],
  },
  scurt: {
    intro: "are păr scurt, ușor de întreținut, dar cu pielea sensibilă la uscăciune",
    randuri: [
      "Periaj o dată pe săptămână, cu o mănușă de cauciuc, pentru a îndepărta părul mort.",
      "Zone de atenție: pielea — rasele cu păr scurt sunt predispuse la uscăciune.",
      "Baie acasă la 4-6 săptămâni; spălatul prea des irită pielea.",
      "Verifică periodic urechile, mai ales dacă sunt căzute.",
    ],
  },
  pisica_lunga: {
    intro: "are blană lungă care se încâlcește foarte ușor și are nevoie de periaj zilnic",
    randuri: [
      "Periaj zilnic, cu un pieptene metalic, pentru a preveni nodurile.",
      "Zone de atenție: burta, zona din spate și sub picioare.",
      "Baie doar la nevoie, cu un șampon special pentru pisici.",
      "Periajul regulat reduce ghemotoacele de păr înghițite (hairballs).",
    ],
  },
  pisica_scurta: {
    intro: "are blană scurtă, ușor de întreținut",
    randuri: [
      "Periaj de 1-2 ori pe săptămână, cu o perie moale.",
      "Baie rar, doar la nevoie.",
      "Atenție la unghii și la curățarea periodică a urechilor.",
    ],
  },
  generic: {
    intro: "are nevoie de îngrijire regulată pentru a-și păstra blana sănătoasă",
    randuri: [
      "Periaj regulat, adaptat tipului de blană, pentru a preveni nodurile.",
      "Baie acasă nu prea des — respectă recomandările pentru tipul de blană.",
      "Verifică periodic urechile, unghiile și pielea.",
    ],
  },
};

function sfatServiciu(serviciu: string): string {
  const s = faraDiacritice(serviciu || "");
  if (s.includes("tuns") || s.includes("tundere") || s.includes("tunsoare"))
    return "După tuns, blana e mai sensibilă — evită expunerea prelungită la soare în primele 1-2 zile.";
  if (s.includes("baie") || s.includes("spalat") || s.includes("spalare"))
    return "După baie, asigură-te că animalul e complet uscat, mai ales în zonele cu blană deasă.";
  if (s.includes("deshe") || s.includes("naparlire") || s.includes("deghisare") || s.includes("desh"))
    return "Tratamentul de năpârlire reduce semnificativ părul mort câteva săptămâni — continuă periajul acasă pentru efect maxim.";
  if (s.includes("unghi") || s.includes("ghear"))
    return "Verifică lungimea unghiilor lunar; dacă auzi clicuri pe podea, e timpul pentru o nouă tăiere.";
  return "";
}

export async function POST(req: NextRequest) {
  const { animal, rasa, serviciu, specie, salonNume } = await req.json();

  const numeAnimal = (animal && String(animal).trim()) || "Animalul tău";
  const tip = detecteazaTipBlana(rasa || null, specie || null);
  const c = CONTINUT[tip];
  const sfat = sfatServiciu(serviciu || "");

  const randuri = c.randuri.map(r => `• ${r}`);
  if (sfat) randuri.push(`• ${sfat}`);

  const serviciuTxt = serviciu ? ` după ${String(serviciu).toLowerCase()}` : "";
  const semnatura = salonNume ? `Pentru orice nelămurire, ne poți scrie oricând. — Echipa ${salonNume}` : "Pentru orice nelămurire, ne poți scrie oricând.";

  const fisa = [
    `Fișă de îngrijire pentru ${numeAnimal}${serviciuTxt} 🐾`,
    "",
    `${numeAnimal} ${c.intro}. Iată câteva recomandări ca să rămână în formă până la următoarea vizită:`,
    "",
    ...randuri,
    "",
    semnatura,
  ].join("\n");

  return NextResponse.json({ fisa });
}
