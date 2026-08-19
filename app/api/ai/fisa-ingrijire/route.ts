import { NextRequest, NextResponse } from "next/server";
import { claude } from "../../../../lib/claude";

const HAIKU = "claude-haiku-4-5";

/**
 * Fișa trimisă clientului după vizită.
 *
 * Până acum era un tabel fix: se ghicea tipul de blană din numele rasei și se
 * întorcea același text pentru toți câinii cu blană dublă. Pe card scria „Fișă
 * AI", ceea ce nu era adevărat.
 *
 * Acum o scrie Claude, pornind de la animalul și serviciile reale. Șabloanele
 * au rămas dedesubt ca plasă de siguranță — dacă lipsește cheia sau pică
 * serviciul, salonul primește tot ceva utilizabil.
 *
 * Costă circa un ban pe fișă. Dashboardul o generează o singură dată per
 * programare, ca să nu se poată apăsa la nesfârșit.
 */

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


/* ─────────── ÎNFRUMUSEȚARE ───────────
   Aici nu există „tip de blană": conținutul se alege după serviciul efectuat. */

type TipServiciuBeauty = "vopsit" | "tuns" | "coafat" | "manichiura" | "pedichiura" | "facial" | "gene" | "generic";

const SERVICII_BEAUTY: { tip: TipServiciuBeauty; chei: string[] }[] = [
  { tip: "vopsit", chei: ["vopsit", "vopsea", "culoare", "suvite", "balayage", "ombre", "blond", "nuantare", "decolorare", "rada"] },
  { tip: "manichiura", chei: ["manichiura", "unghii", "gel", "semipermanent", "constructie"] },
  { tip: "pedichiura", chei: ["pedichiura", "picioare"] },
  { tip: "facial", chei: ["facial", "cosmetica", "curatare", "hidratare", "peeling", "masca", "ten"] },
  { tip: "gene", chei: ["gene", "extensii", "lifting gene", "sprancene", "laminare"] },
  { tip: "coafat", chei: ["coafat", "coafura", "styling", "ondulat", "indreptat", "placa", "bucle"] },
  { tip: "tuns", chei: ["tuns", "tunsoare", "tundere", "breton", "barba", "frizerie"] },
];

function detecteazaServiciuBeauty(serviciu: string): TipServiciuBeauty {
  const s = faraDiacritice(serviciu || "");
  if (!s) return "generic";
  for (const g of SERVICII_BEAUTY) {
    if (g.chei.some(k => s.includes(k))) return g.tip;
  }
  return "generic";
}

const CONTINUT_BEAUTY: Record<TipServiciuBeauty, { intro: string; randuri: string[]; revenire: string }> = {
  vopsit: {
    intro: "Culoarea proaspătă are nevoie de puțină grijă în primele zile ca să rămână intensă",
    randuri: [
      "Așteaptă 48 de ore înainte de primul spălat — culoarea are nevoie de timp să se fixeze.",
      "Folosește șampon fără sulfați, special pentru păr vopsit; sulfații scot culoarea mai repede.",
      "Spală cu apă călduță, nu fierbinte — căldura deschide cuticula și lasă pigmentul să iasă.",
      "Protejează părul de soare și de clorul din piscină; ambele decolorează vizibil.",
      "O mască de culoare o dată pe săptămână păstrează nuanța vie între vizite.",
    ],
    revenire: "Rădăcinile se văd de obicei după 4-6 săptămâni.",
  },
  tuns: {
    intro: "O tunsoare își păstrează forma dacă e întreținută corect",
    randuri: [
      "Usucă părul cu aer călduț, nu fierbinte, și îndreaptă-l cu peria în direcția tunsorii.",
      "Folosește un produs termoprotector înainte de placă sau ondulator.",
      "Vârfurile se degradează primele — o ajustare mică le păstrează sănătoase mai mult.",
    ],
    revenire: "Pentru a păstra forma, revino la 4-8 săptămâni, în funcție de lungime.",
  },
  coafat: {
    intro: "Coafura ține mai mult cu câteva obiceiuri simple",
    randuri: [
      "Dormi pe o față de pernă din satin — reduce frizz-ul și păstrează forma.",
      "Evită să atingi părul des; grăsimea de pe mâini îl face să cadă mai repede.",
      "Un șampon uscat a doua zi prelungește coafura fără spălat.",
    ],
    revenire: "Te așteptăm oricând ai nevoie de o coafură nouă.",
  },
  manichiura: {
    intro: "Manichiura rezistă mai mult dacă unghiile sunt hidratate",
    randuri: [
      "Aplică ulei de cuticule zilnic — previne crăpăturile și desprinderea.",
      "Poartă mănuși la curățenie; detergenții slăbesc stratul aplicat.",
      "Nu folosi unghiile ca instrument (deschis cutii, desprins etichete).",
      "Nu îndepărta singură produsul — ridică stratul natural al unghiei.",
    ],
    revenire: "Programează completarea la 3-4 săptămâni, înainte să crească prea mult.",
  },
  pedichiura: {
    intro: "Picioarele au nevoie de hidratare constantă după tratament",
    randuri: [
      "Aplică o cremă pentru picioare seara, mai ales pe călcâie.",
      "Poartă încălțăminte lejeră în primele ore după tratament.",
      "Evită piscina și saună 24 de ore.",
    ],
    revenire: "Recomandăm o vizită la 4-6 săptămâni.",
  },
  facial: {
    intro: "După tratament, pielea e mai receptivă — dar și mai sensibilă",
    randuri: [
      "Evită machiajul în primele 12 ore, ca pielea să respire.",
      "Folosește protecție solară zilnic; pielea tratată se pigmentează mai ușor.",
      "Fără saună, piscină sau exerciții intense 24 de ore.",
      "Hidratează dimineața și seara, cu produse fără alcool.",
    ],
    revenire: "Rezultatele se mențin cel mai bine cu un tratament la 4 săptămâni.",
  },
  gene: {
    intro: "Extensiile țin mai mult dacă eviți umezeala în primele ore",
    randuri: [
      "Fără apă, aburi sau saună în primele 24-48 de ore.",
      "Nu freca ochii și evită demachiantele pe bază de ulei.",
      "Piaptănă genele dimineața, cu peria primită, ca să rămână aliniate.",
      "Dormi pe spate dacă poți — pe o parte se turtesc mai repede.",
    ],
    revenire: "Completarea se face de obicei la 2-3 săptămâni.",
  },
  generic: {
    intro: "Câteva recomandări ca rezultatul să se păstreze cât mai mult",
    randuri: [
      "Respectă indicațiile primite de la specialistul tău în primele 24 de ore.",
      "Folosește produse potrivite tipului tău de păr sau piele.",
      "Programează-te din timp — locurile bune se ocupă repede.",
    ],
    revenire: "Te așteptăm cu drag la următoarea vizită.",
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
  const { animal, rasa, serviciu, specie, salonNume, domeniu, client } = await req.json();

  // ── Fișa scrisă de Claude ──
  if (process.env.ANTHROPIC_API_KEY) {
    const eBeauty = domeniu === "infrumusetare";
    const numeClient = (client && String(client).trim().split(" ")[0]) || null;

    const system = eBeauty
      ? [
          "Ești specialistul dintr-un salon de înfrumusețare din România și scrii clientului, după vizită, câteva recomandări de întreținere acasă.",
          "",
          "Reguli:",
          "- Recomandările trebuie să fie despre SERVICIUL chiar efectuat. La vopsit vorbește despre culoare și șampon potrivit; la manichiură despre unghii; la tratament facial despre ten. Nu da sfaturi generale.",
          "- Structură: un titlu scurt, o propoziție de introducere, 4-6 puncte care încep cu •, apoi o propoziție despre când merită revenit.",
          "- Ton cald și practic, fără termeni tehnici. Text simplu, fără markdown și fără asteriscuri.",
          "- Nu inventa produse cu nume comercial și nu promite rezultate.",
          "- Maximum 180 de cuvinte.",
        ].join("\n")
      : [
          "Ești groomerul dintr-un salon de îngrijire animale din România și scrii stăpânului, după vizită, o fișă de îngrijire pentru acasă.",
          "",
          "Reguli:",
          "- Sfaturile trebuie potrivite RASEI și tipului de blană al animalului, și SERVICIILOR chiar efectuate. Un pudel tuns scurt și un husky deshedding primesc lucruri diferite.",
          "- Vorbește despre animal pe nume.",
          "- Structură: un titlu scurt, o propoziție de introducere, 4-6 puncte care încep cu •, apoi o propoziție despre peste cât timp merită revenit.",
          "- Ton cald și practic. Text simplu, fără markdown și fără asteriscuri.",
          "- Nu da sfaturi veterinare și nu recomanda medicamente. Dacă ceva ține de sănătate, spune să întrebe medicul veterinar.",
          "- Maximum 180 de cuvinte.",
        ].join("\n");

    const detalii = [
      salonNume ? `Salon: ${salonNume}` : null,
      numeClient ? `Client: ${numeClient}` : null,
      !eBeauty && animal ? `Animal: ${animal}` : null,
      !eBeauty && rasa ? `Rasă: ${rasa}` : null,
      !eBeauty && specie ? `Specie: ${specie}` : null,
      serviciu ? `Servicii efectuate: ${serviciu}` : null,
      salonNume ? `Semnează la final cu: — Echipa ${salonNume}` : null,
    ].filter(Boolean).join("\n");

    try {
      const msg = await claude.messages.create({
        model: HAIKU,
        max_tokens: 500,
        system,
        messages: [{ role: "user", content: detalii || "Scrie o fișă generală de îngrijire." }],
      });
      const scris = (msg.content as any[])
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text as string)
        .join("")
        .trim();
      if (scris) return NextResponse.json({ fisa: scris, sursa: "ai" });
    } catch (err) {
      console.error("fisa-ingrijire: Claude a esuat, folosim sabloanele.", err);
    }
  }

  // ── Plasa de siguranță: șabloane pe tip de blană / serviciu ──

  // Saloanele de înfrumusețare primesc recomandări pentru client, nu pentru animal.
  if (domeniu === "infrumusetare") {
    const tipB = detecteazaServiciuBeauty(serviciu || "");
    const cb = CONTINUT_BEAUTY[tipB];
    const numeClient = (client && String(client).trim().split(" ")[0]) || null;
    const salut = numeClient ? `${numeClient}, ` : "";
    const serviciuTxt = serviciu ? String(serviciu).toLowerCase() : "vizită";
    const semnaturaB = salonNume
      ? `Pentru orice nelămurire, ne poți scrie oricând. — Echipa ${salonNume}`
      : "Pentru orice nelămurire, ne poți scrie oricând.";

    const fisaB = [
      `Recomandări după ${serviciuTxt}`,
      "",
      `${salut}${salut ? "c" : "C"}${cb.intro.slice(1)}:`,
      "",
      ...cb.randuri.map(r => `• ${r}`),
      "",
      cb.revenire,
      "",
      semnaturaB,
    ].join("\n");

    return NextResponse.json({ fisa: fisaB });
  }

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
