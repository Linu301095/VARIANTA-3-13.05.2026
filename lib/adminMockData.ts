/**
 * Date demo pentru panoul de admin.
 *
 * ATENȚIE: aici a rămas DOAR ce nu are corespondent în baza de date.
 * Clienții, saloanele, programările și recenziile se citesc real din Supabase
 * (vezi `fetchAdminData` din `app/admin/page.tsx`). Tichetele de suport nu au
 * încă tabel, deci rămân demo — și sunt marcate ca atare în interfață.
 */

export type TichetDemo = {
  id: string;
  salon: string;
  email: string;
  subiect: string;
  mesaj: string;
  urgenta: "scazuta" | "normala" | "urgenta";
  status: "nou" | "raspuns" | "rezolvat";
  data: string;
};

/** Zile în urmă → dată ISO, ca tichetele demo să pară recente. */
function acumMinus(zile: number): string {
  const d = new Date();
  d.setDate(d.getDate() - zile);
  return d.toISOString();
}

export const TICHETE_DEMO: TichetDemo[] = [
  { id: "t-1", salon: "Studio Bella", email: "contact@studiobella.ro", subiect: "Nu pot adăuga un specialist nou", mesaj: "Bună, am încercat să adaug o colegă în echipă dar primesc eroare la salvare.", urgenta: "normala", status: "nou", data: acumMinus(2) },
  { id: "t-2", salon: "Happy Tails", email: "contact@happytails.ro", subiect: "Cum schimb speciile acceptate?", mesaj: "Am început să lucrez și cu pisici, unde bifez asta?", urgenta: "normala", status: "raspuns", data: acumMinus(3) },
  { id: "t-3", salon: "Royal Grooming", email: "contact@royalgrooming.ro", subiect: "Cum schimb planul de abonament?", mesaj: "Vreau să trec de la Pro la Business. Cum procedez?", urgenta: "scazuta", status: "rezolvat", data: acumMinus(7) },
  { id: "t-4", salon: "Glamour Hair", email: "contact@glamourhair.ro", subiect: "Notificări email nu se trimit", mesaj: "Clienții se plâng că nu primesc confirmări pe email.", urgenta: "urgenta", status: "nou", data: acumMinus(1) },
  { id: "t-5", salon: "Cuddle & Cut", email: "contact@cuddlecut.ro", subiect: "Trialul mi-a expirat", mesaj: "Mi-a apărut bannerul roșu. Ce se întâmplă cu programările deja confirmate?", urgenta: "urgenta", status: "nou", data: acumMinus(1) },
  { id: "t-6", salon: "Nails & Co", email: "contact@nailsco.ro", subiect: "Recuperare parolă", mesaj: "Nu mai am acces la cont. Am cerut resetarea și emailul nu vine.", urgenta: "urgenta", status: "rezolvat", data: acumMinus(10) },
];
