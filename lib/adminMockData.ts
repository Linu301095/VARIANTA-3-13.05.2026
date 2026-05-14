export type MockClient = {
  id: string;
  nume: string;
  email: string;
  telefon: string;
  oras: string;
  dataInregistrare: string;
  nrAnimale: number;
  nrProgramari: number;
  status: "activ" | "blocat";
};

export type MockSalon = {
  id: string;
  nume: string;
  oras: string;
  email: string;
  telefon: string;
  plan: "starter" | "pro" | "business";
  nrAngajati: number;
  nrProgramariLuna: number;
  rating: number;
  dataInregistrare: string;
  status: "activ" | "suspendat" | "in_asteptare";
};

export type MockProgramare = {
  id: string;
  client: string;
  salon: string;
  oras: string;
  serviciu: string;
  pret: number;
  data: string;
  status: "confirmata" | "finalizata" | "anulata" | "in_asteptare";
};

export type MockReview = {
  id: string;
  client: string;
  salon: string;
  rating: number;
  text: string;
  data: string;
  raportat: boolean;
};

export type MockTichet = {
  id: string;
  salon: string;
  email: string;
  subiect: string;
  mesaj: string;
  urgenta: "scazuta" | "normala" | "urgenta";
  status: "nou" | "raspuns" | "rezolvat";
  data: string;
};

const NUME_CLIENT = ["Andrei Popescu","Maria Ionescu","Alexandra Dumitrescu","Mihai Stan","Elena Radu","Cristina Mocanu","George Vasilescu","Ioana Marin","Razvan Constantin","Diana Tudor","Bogdan Niculae","Ana-Maria Petre","Florin Diaconu","Roxana Avram","Sebastian Olteanu","Adriana Stoica","Catalin Munteanu","Larisa Gheorghe","Vlad Iliescu","Carmen Florea","Stefan Dragomir","Bianca Voicu","Tudor Manole","Simona Pop","Adrian Costache","Oana Mihai","Daniel Sava","Andreea Lungu","Marius Toma","Camelia Andrei","Gabriel Cojocaru","Iulia Stancu","Cosmin Barbu","Madalina Serban","Paul Apostol","Nicoleta Nedelcu","Robert Enache","Mirela Voinea","Octavian Filip","Beatrice Toader","Sergiu Iancu","Loredana Mircea","Alin Tanase","Raluca Vlad","Cristian Sandu","Anca Bucur","Lucian Crisan","Monica Negru","Horia Lazar","Veronica Dinu"];
const ORASE = ["București","Cluj-Napoca","Timișoara","Iași","Brașov","Constanța","Sibiu","Oradea"];
const NUME_SALON = ["Pet Style","Happy Tails","Glamour Paws","Royal Grooming","Cuddle & Cut","Furry Friends","Pampered Pets","Fluffy Buddies","Pet Spa Deluxe","Beauty Pet","Doggy Style","Cat Salon Lux","Caleb's Pets","Animal Beauty","Pet Paradise","Grooming Boutique","Happy Pet","Diamond Paws","Crystal Grooming","Magic Pet","Stylish Pets","Pet Charm","Royal Tails","Pet Elegance","Posh Paws","Lovely Pets","Pet Heaven","Sparkle Pet","Vogue Pets","Pet Couture"];
const SERVICII = ["Tuns complet","Toaletare standard","Spălat și uscat","Tuns ghiare","Curățare urechi","Tuns + spălat","Pachet complet"];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(daysBack: number, daysForward = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + rand(-daysBack, daysForward));
  d.setHours(rand(8, 19), rand(0, 11) * 5, 0, 0);
  return d;
}
function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, ""); }

export function generateMockData() {
  const clienti: MockClient[] = NUME_CLIENT.map((nume, i) => ({
    id: `c-${i + 1}`,
    nume,
    email: `${slug(nume)}@email.ro`,
    telefon: `07${rand(10, 99)} ${rand(100, 999)} ${rand(100, 999)}`,
    oras: pick(ORASE),
    dataInregistrare: randomDate(180).toISOString(),
    nrAnimale: rand(1, 3),
    nrProgramari: rand(0, 18),
    status: Math.random() > 0.95 ? "blocat" : "activ",
  }));

  const PLAN_DIST: ("starter" | "pro" | "business")[] = [
    ...Array(12).fill("starter"),
    ...Array(13).fill("pro"),
    ...Array(5).fill("business"),
  ];

  const saloane: MockSalon[] = NUME_SALON.map((nume, i) => ({
    id: `s-${i + 1}`,
    nume,
    oras: pick(ORASE),
    email: `contact@${slug(nume)}.ro`,
    telefon: `02${rand(10, 99)} ${rand(100, 999)} ${rand(100, 999)}`,
    plan: PLAN_DIST[i],
    nrAngajati: PLAN_DIST[i] === "starter" ? 1 : PLAN_DIST[i] === "pro" ? rand(2, 5) : rand(5, 12),
    nrProgramariLuna: rand(8, 180),
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    dataInregistrare: randomDate(200).toISOString(),
    status: Math.random() > 0.92 ? (Math.random() > 0.5 ? "suspendat" : "in_asteptare") : "activ",
  }));

  const STATUSURI: MockProgramare["status"][] = ["confirmata", "finalizata", "finalizata", "finalizata", "anulata", "in_asteptare"];
  const programari: MockProgramare[] = Array.from({ length: 220 }, (_, i) => {
    const c = pick(clienti);
    const s = pick(saloane);
    return {
      id: `p-${i + 1}`,
      client: c.nume,
      salon: s.nume,
      oras: s.oras,
      serviciu: pick(SERVICII),
      pret: rand(60, 280),
      data: randomDate(120, 30).toISOString(),
      status: pick(STATUSURI),
    };
  });

  const review_texte = [
    "Excelent! Cățelul meu a venit fericit acasă. Recomand cu drag.",
    "Personal foarte amabil și profesionist. Vom reveni cu siguranță!",
    "Tunsoare perfectă și prețuri corecte. Mulțumim!",
    "Salon curat, animăluții sunt tratați cu blândețe.",
    "Am avut emoții la prima vizită dar totul a decurs perfect.",
    "Programare ușoară prin CalyHub, salon impecabil.",
    "Foarte mulțumit, motanul meu e ca nou!",
    "Au știut să se descurce cu un cățel anxios. Bravo!",
    "Calitate-preț excelent. Recomand!",
    "Recomand din toată inima. Profesionalism la cel mai înalt nivel.",
    "Au întârziat 30 min. Personal nepoliticos.",
    "Tunsoarea nu a fost cum am cerut.",
    "Prețuri prea mari pentru servicii medii.",
  ];
  const reviews: MockReview[] = Array.from({ length: 15 }, (_, i) => ({
    id: `r-${i + 1}`,
    client: pick(clienti).nume,
    salon: pick(saloane).nume,
    rating: i < 12 ? rand(4, 5) : rand(1, 3),
    text: pick(review_texte),
    data: randomDate(60).toISOString(),
    raportat: i >= 12,
  }));

  const tichete: MockTichet[] = [
    { id: "t-1", salon: "Pet Style", email: "contact@petstyle.ro", subiect: "Nu pot adăuga un nou angajat", mesaj: "Bună, am încercat să adaug un nou groomer dar primesc o eroare la salvare.", urgenta: "normala", status: "nou", data: randomDate(2).toISOString() },
    { id: "t-2", salon: "Happy Tails", email: "contact@happytails.ro", subiect: "Eroare la încasare card", mesaj: "Clientul nu poate plăti cu cardul de 2 zile. Pierdem programări.", urgenta: "urgenta", status: "raspuns", data: randomDate(3).toISOString() },
    { id: "t-3", salon: "Royal Grooming", email: "contact@royalgrooming.ro", subiect: "Cum schimb planul de abonament?", mesaj: "Vreau să trec de la Pro la Business. Cum procedez?", urgenta: "scazuta", status: "rezolvat", data: randomDate(7).toISOString() },
    { id: "t-4", salon: "Glamour Paws", email: "contact@glamourpaws.ro", subiect: "Notificări email nu se trimit", mesaj: "Clienții se plâng că nu primesc confirmări pe email.", urgenta: "urgenta", status: "nou", data: randomDate(1).toISOString() },
    { id: "t-5", salon: "Cuddle & Cut", email: "contact@cuddlecut.ro", subiect: "Integrare Google Calendar", mesaj: "Vreau să sincronizez agenda cu Google Calendar.", urgenta: "normala", status: "raspuns", data: randomDate(5).toISOString() },
    { id: "t-6", salon: "Pet Spa Deluxe", email: "contact@petspadeluxe.ro", subiect: "Recuperare parolă admin", mesaj: "Nu mai am acces la cont. Am uitat parola și emailul nu vine.", urgenta: "urgenta", status: "rezolvat", data: randomDate(10).toISOString() },
    { id: "t-7", salon: "Furry Friends", email: "contact@furryfriends.ro", subiect: "Schimbare nume salon", mesaj: "Am rebrenduit salonul. Cum schimb numele afișat?", urgenta: "scazuta", status: "nou", data: randomDate(4).toISOString() },
    { id: "t-8", salon: "Beauty Pet", email: "contact@beautypet.ro", subiect: "Factură lipsă luna trecută", mesaj: "Nu am primit factura pentru luna aprilie. Vă rog asistență.", urgenta: "normala", status: "raspuns", data: randomDate(6).toISOString() },
  ];

  const istoricFinanciar = Array.from({ length: 6 }, (_, i) => {
    const luni = ["Dec", "Ian", "Feb", "Mar", "Apr", "Mai"];
    return {
      luna: luni[i],
      mrr: rand(1800, 4500) + i * 200,
      newSignups: rand(3, 12),
      churn: rand(0, 3),
    };
  });

  return { clienti, saloane, programari, reviews, tichete, istoricFinanciar };
}

export type MockData = ReturnType<typeof generateMockData>;
