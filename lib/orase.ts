/**
 * Județele și orașele României — pentru câmpul de adresă din înscrierea salonului.
 *
 * De ce o listă, nu un câmp liber: „Cluj", „Cluj Napoca", „cluj-napoca" și
 * „CLUJ-NAPOCA" sunt patru orașe diferite pentru o bază de date. Paginile de
 * oraș, căutarea clientului și rapoartele se sprijină toate pe scrierea exactă.
 *
 * Sunt cuprinse municipiile și orașele — nu și comunele. Un salon stă într-un
 * oraș; dacă totuși lipsește localitatea cuiva, câmpul acceptă și un text scris
 * de mână, ca să nu blocăm pe nimeni.
 */

export type Judet = { nume: string; orase: string[] };

/** Sectoarele Bucureștiului — apar în loc de listă de orașe. */
export const SECTOARE = ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6"];

export const BUCURESTI = "București";

export const JUDETE: Judet[] = [
  { nume: "Alba", orase: ["Alba Iulia", "Aiud", "Blaj", "Sebeș", "Cugir", "Ocna Mureș", "Câmpeni", "Zlatna", "Teiuș", "Abrud", "Baia de Arieș"] },
  { nume: "Arad", orase: ["Arad", "Ineu", "Lipova", "Chișineu-Criș", "Curtici", "Nădlac", "Pâncota", "Pecica", "Sântana", "Sebiș"] },
  { nume: "Argeș", orase: ["Pitești", "Câmpulung", "Curtea de Argeș", "Mioveni", "Ștefănești", "Topoloveni", "Costești"] },
  { nume: "Bacău", orase: ["Bacău", "Onești", "Moinești", "Comănești", "Buhuși", "Dărmănești", "Târgu Ocna", "Slănic-Moldova"] },
  { nume: "Bihor", orase: ["Oradea", "Salonta", "Marghita", "Beiuș", "Aleșd", "Valea lui Mihai", "Ștei", "Săcueni", "Nucet", "Vașcău"] },
  { nume: "Bistrița-Năsăud", orase: ["Bistrița", "Năsăud", "Beclean", "Sângeorz-Băi"] },
  { nume: "Botoșani", orase: ["Botoșani", "Dorohoi", "Darabani", "Săveni", "Ștefănești", "Flămânzi", "Bucecea"] },
  { nume: "Brașov", orase: ["Brașov", "Făgăraș", "Săcele", "Codlea", "Zărnești", "Râșnov", "Victoria", "Rupea", "Predeal", "Ghimbav"] },
  { nume: "Brăila", orase: ["Brăila", "Ianca", "Însurăței", "Făurei"] },
  { nume: "București", orase: SECTOARE },
  { nume: "Buzău", orase: ["Buzău", "Râmnicu Sărat", "Nehoiu", "Pogoanele", "Pătârlagele"] },
  { nume: "Caraș-Severin", orase: ["Reșița", "Caransebeș", "Bocșa", "Oravița", "Moldova Nouă", "Oțelu Roșu", "Anina", "Băile Herculane"] },
  { nume: "Călărași", orase: ["Călărași", "Oltenița", "Budești", "Lehliu Gară", "Fundulea"] },
  { nume: "Cluj", orase: ["Cluj-Napoca", "Turda", "Dej", "Câmpia Turzii", "Gherla", "Huedin"] },
  { nume: "Constanța", orase: ["Constanța", "Mangalia", "Medgidia", "Năvodari", "Cernavodă", "Ovidiu", "Eforie", "Techirghiol", "Hârșova", "Murfatlar", "Negru Vodă"] },
  { nume: "Covasna", orase: ["Sfântu Gheorghe", "Târgu Secuiesc", "Covasna", "Baraolt", "Întorsura Buzăului"] },
  { nume: "Dâmbovița", orase: ["Târgoviște", "Moreni", "Pucioasa", "Găești", "Titu", "Fieni", "Răcari"] },
  { nume: "Dolj", orase: ["Craiova", "Băilești", "Calafat", "Filiași", "Segarcea", "Dăbuleni", "Bechet"] },
  { nume: "Galați", orase: ["Galați", "Tecuci", "Târgu Bujor", "Berești"] },
  { nume: "Giurgiu", orase: ["Giurgiu", "Bolintin-Vale", "Mihăilești"] },
  { nume: "Gorj", orase: ["Târgu Jiu", "Motru", "Rovinari", "Bumbești-Jiu", "Târgu Cărbunești", "Novaci", "Turceni", "Țicleni"] },
  { nume: "Harghita", orase: ["Miercurea Ciuc", "Odorheiu Secuiesc", "Gheorgheni", "Toplița", "Cristuru Secuiesc", "Bălan", "Vlăhița", "Borsec"] },
  { nume: "Hunedoara", orase: ["Deva", "Hunedoara", "Petroșani", "Vulcan", "Lupeni", "Orăștie", "Brad", "Simeria", "Călan", "Hațeg", "Petrila", "Uricani"] },
  { nume: "Ialomița", orase: ["Slobozia", "Fetești", "Urziceni", "Țăndărei", "Amara", "Căzănești"] },
  { nume: "Iași", orase: ["Iași", "Pașcani", "Hârlău", "Târgu Frumos", "Podu Iloaiei"] },
  { nume: "Ilfov", orase: ["Voluntari", "Pantelimon", "Buftea", "Popești-Leordeni", "Bragadiru", "Chitila", "Otopeni", "Măgurele"] },
  { nume: "Maramureș", orase: ["Baia Mare", "Sighetu Marmației", "Borșa", "Vișeu de Sus", "Baia Sprie", "Târgu Lăpuș", "Seini", "Cavnic", "Ulmeni", "Dragomirești", "Săliștea de Sus"] },
  { nume: "Mehedinți", orase: ["Drobeta-Turnu Severin", "Orșova", "Strehaia", "Vânju Mare", "Baia de Aramă"] },
  { nume: "Mureș", orase: ["Târgu Mureș", "Reghin", "Sighișoara", "Târnăveni", "Luduș", "Iernut", "Sovata", "Sărmașu", "Miercurea Nirajului", "Ungheni"] },
  { nume: "Neamț", orase: ["Piatra Neamț", "Roman", "Târgu Neamț", "Bicaz", "Roznov"] },
  { nume: "Olt", orase: ["Slatina", "Caracal", "Balș", "Corabia", "Drăgănești-Olt", "Scornicești", "Piatra-Olt", "Potcoava"] },
  { nume: "Prahova", orase: ["Ploiești", "Câmpina", "Băicoi", "Mizil", "Breaza", "Sinaia", "Bușteni", "Comarnic", "Vălenii de Munte", "Boldești-Scăeni", "Azuga", "Plopeni", "Slănic", "Urlați"] },
  { nume: "Satu Mare", orase: ["Satu Mare", "Carei", "Negrești-Oaș", "Tășnad", "Ardud", "Livada"] },
  { nume: "Sălaj", orase: ["Zalău", "Șimleu Silvaniei", "Jibou", "Cehu Silvaniei"] },
  { nume: "Sibiu", orase: ["Sibiu", "Mediaș", "Cisnădie", "Agnita", "Avrig", "Dumbrăveni", "Copșa Mică", "Ocna Sibiului", "Săliște", "Tălmaciu", "Miercurea Sibiului"] },
  { nume: "Suceava", orase: ["Suceava", "Fălticeni", "Rădăuți", "Câmpulung Moldovenesc", "Vatra Dornei", "Gura Humorului", "Siret", "Solca", "Broșteni", "Dolhasca", "Frasin", "Liteni", "Milișăuți", "Salcea", "Vicovu de Sus"] },
  { nume: "Teleorman", orase: ["Alexandria", "Roșiorii de Vede", "Turnu Măgurele", "Zimnicea", "Videle"] },
  { nume: "Timiș", orase: ["Timișoara", "Lugoj", "Sânnicolau Mare", "Jimbolia", "Buziaș", "Deta", "Făget", "Recaș", "Ciacova", "Gătaia"] },
  { nume: "Tulcea", orase: ["Tulcea", "Măcin", "Babadag", "Isaccea", "Sulina"] },
  { nume: "Vaslui", orase: ["Vaslui", "Bârlad", "Huși", "Negrești", "Murgeni"] },
  { nume: "Vâlcea", orase: ["Râmnicu Vâlcea", "Drăgășani", "Băbeni", "Bălcești", "Brezoi", "Călimănești", "Horezu", "Ocnele Mari", "Băile Govora", "Băile Olănești", "Berbești"] },
  { nume: "Vrancea", orase: ["Focșani", "Adjud", "Mărășești", "Odobești", "Panciu"] },
];

/** Numele județelor, pentru lista din stânga. */
export const NUME_JUDETE = JUDETE.map(j => j.nume);

/** Orașele unui județ; lista goală dacă județul nu e cunoscut. */
export function oraseDin(judet: string): string[] {
  return JUDETE.find(j => j.nume === judet)?.orase ?? [];
}

/** Bucureștiul se împarte în sectoare, nu în orașe. */
export function areSectoare(judet: string): boolean {
  return judet === BUCURESTI;
}

/**
 * Pregătește un text pentru căutare: fără diacritice, fără majuscule.
 * Ca „targu mures" să găsească „Târgu Mureș".
 */
export function normalizeaza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ăâ]/g, "a").replace(/[îí]/g, "i").replace(/[șş]/g, "s").replace(/[țţ]/g, "t")
    .trim();
}
