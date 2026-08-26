# CalyHub — Reguli proiect

## ÎN LUCRU — Capitolul D: DASHBOARDURI (prioritate maximă)

Am întrerupt intenționat categoria C după Etapa 3 ca să facem dashboardurile, pentru că
ele sunt partea care decide dacă un salon de înfrumusețare rămâne sau pleacă.
**DE REVENIT după: Etapa 5 (Abonament salon), Etapa 6 (Ai uitat parola), Etapa 7 (Resetare parolă).**

| # | Etapa | Ce cuprinde | Stare |
|---|---|---|---|
| D1 | Clientul fără animal | Comutator „Pentru tine / Pentru animalul tău", căutare filtrată pe domeniu, rezervare fără animal la înfrumusețare | ✅ gata (31.07.2026) |
| D2 | Limbajul dashboardului client | „groomer" → „specialist" unde e beauty, talia doar la grooming | ✅ gata (31.07.2026) |
| D3 | Dashboardul salonului pe verticală | Echipă, agendă, tabul „Animale" ascuns la beauty, prețuri fără talie | ✅ gata (31.07.2026) |
| D4 | Statistici + agenți AI pe verticală | Rapoartele și prompturile AI vorbesc limba verticalei | ✅ gata (31.07.2026) |

**Context măsurat (31.07.2026):** `app/dashboard/salon/page.tsx` (~2150 linii) conține 95 apariții
„groomer", 152 „animal", 98 „talie". `app/dashboard/client/page.tsx` (~2570 linii) conține
65 „groomer", 181 „animal", 47 „talie". Toată aplicația reală (căutare, profil salon, rezervare,
agendă, statistici) stă în aceste două fișiere.

**Regula pe care se sprijină tot capitolul (stabilită de utilizator):** un singur cont de client,
cu profil de persoană; animalul e opțional. Fără animal → vede doar lumea de înfrumusețare.
Cu animal → comutator între „Pentru tine" și „Pentru animalul tău". Animalul se poate adăuga
oricând. Ca să rezervi la grooming trebuie să ai un animal în cont; la înfrumusețare nu.

---

## Categoria C: ecrane de acces — ✅ TERMINATĂ (toate 7)

Toate cele 7 ecrane sunt refăcute pe direcția dublă, cu dark mode și responsive verificat.

| # | Etapa | Fișier | Stare |
|---|---|---|---|
| 1 | Conectare | `app/login/page.tsx` | ✅ gata (30.07.2026) |
| 2 | Înregistrare | `app/register/page.tsx` | ✅ gata (31.07.2026) |
| 3 | Configurare animal | `app/register/configurare-animal/page.tsx` | ✅ gata (31.07.2026) — animalul e opțional |
| 4 | Configurare salon | `app/register/configurare-salon/page.tsx` | ✅ gata (31.07.2026) — făcut odată cu Etapa 2, fiind dependent de verticală |
| 5 | Abonament salon | `app/register/abonament-salon/page.tsx` | ✅ gata (03.08.2026) — se poate sări; fără „partener fondator" |
| 6 | Ai uitat parola | `app/forgot-password/page.tsx` | ✅ gata (03.08.2026) |
| 7 | Resetare parolă | `app/reset-password/page.tsx` | ✅ gata (03.08.2026) |

**Decizii luate (31.07.2026):**

1. **Verticala se alege la ÎNREGISTRARE**, nu în wizard (varianta A). Motiv: wizardul depinde de ea (servicii, denumiri de rol, specii), iar alegerea e ireversibilă → stă la vedere, la început.
2. **Salvarea verticalei — varianta 1:** merge în metadata `signUp` + `sessionStorage`, iar în tabelul `saloane` se scrie la finalul wizardului. Nu creăm rând în `saloane` la înregistrare (ar umple baza cu saloane fantomă).
3. **Bannerul „3 luni gratuite pentru parteneri fondatori"** — scos din `/register`. A rămas doar mențiunea sobră „Fără card la înscriere · 0% comision".
4. **Bifa de Termeni** — obligatorie ȘI salvată în bază (`profiluri.termeni_acceptati_la` + `termeni_versiune`), ca să existe dovada consimțământului.

**SQL de rulat în Supabase:**
- `sql/stergere_salon.sql` — **obligatoriu pentru ștergerea salonului**, adaugă `saloane.sters_la` + index parțial pe saloanele active. Fără el, butonul „Șterge salonul" eșuează, iar căutarea clientului crapă (filtrează după coloana asta).
- `sql/neprezentari.sql` — **obligatoriu pentru marcarea neprezentărilor**, permite valoarea `neprezentat` pe `programari.status`. Fără el, butonul „Nu s-a prezentat" eșuează.
- `sql/rating_saloane.sql` — **obligatoriu pentru notele de pe carduri**, creează vederea `saloane_rating` (medie + număr per salon). Fără ea, dashboardul clientului nu mai poate calcula notele și toate saloanele apar ca „Nou". Înlocuiește descărcarea tuturor recenziilor din bază la fiecare intrare în cont.
- `sql/coordonate_salon.sql` — **obligatoriu pentru distanță**, adaugă `saloane.lat`, `saloane.lng`, `saloane.geocodat_la`. Fără el, înscrierea salonului merge dar nu salvează coordonatele, iar pe carduri nu apare nicio distanță.
- `sql/stergere_cont.sql` — **obligatoriu pentru ștergerea contului**, adaugă `profiluri.sters_la` și `recenzii.autor_anonim`. Fără el, butonul „Șterge contul" din dashboardul clientului eșuează.
- `sql/specializari_salon.sql` — **obligatoriu**, adaugă `saloane.specializari text[]` + restricția (max 3, doar cele 7 valori) și index GIN. Fără el, înscrierea unui salon de înfrumusețare eșuează.
- `sql/program_zile_numerice.sql` — **decis să NU se ruleze (10.08.2026).** Repară `saloane.program` la rândurile scrise de wizardul vechi (chei `luni`/`deschis` → `1`/`activ`). Wizardul scrie corect de la 10.08.2026; saloanele mai vechi își resalvează programul manual din dashboard. Fișierul rămâne în repo dacă apar multe rânduri vechi.
- `sql/planuri_si_facturare.sql` — **obligatoriu pentru schimbarea planului din dashboard**,
  adaugă `saloane.ciclu`, coloanele Stripe și tabelul `plan_istoric`.
- `sql/salon_modifica_programari.sql` — **obligatoriu pentru anularea și mutarea programărilor de
  către salon**, adaugă `programari.anulat_de` și `programari.mutat_la`.
- `sql/admin_scrie_saloane.sql` — **obligatoriu pentru butoanele de stare din `/admin`**, adaugă
  `public.este_admin()` + politicile RLS de citire/scriere pe `saloane` pentru admin. Fără el,
  butoanele *Trial nou* / *Marchează abonat* nu schimbă nimic.
- `sql/gen_client.sql` — adaugă `profiluri.gen` (masculin/feminin). Obligatoriu la înregistrarea clientului, indiferent dacă are animal; editabil din dashboard → Profil. Conturile mai vechi îl au gol.
- `sql/adresa_judet.sql` — ✅ rulat (adaugă `saloane.judet` și `saloane.public_tinta`, index județ+oraș)
- `sql/etapa2_domeniu_si_termeni.sql` — ✅ rulat (adaugă `saloane.domeniu`, coloanele de termeni, index domeniu+oraș)
- `sql/etapa3_animal_optional.sql` — ✅ rulat (face opționale `sex`, `rasa`, `greutate`, `varsta`, `alergii` din `animale`)
- `sql/trial_si_planuri.sql` — adaugă `saloane.trial_expira_la`, scoate planul `starter`, restricționează `plan` la basic/pro/business

**TRIAL — ciclul de viață al salonului (decizie 03.08.2026)**

Regulile stau într-un singur loc: `lib/trial.ts` (`ZILE_TRIAL = 14`,
`ZILE_PANA_LA_STERGERE = 30`, `ZILE_AVERTISMENT = 3`).

| Perioadă | Ce se întâmplă |
|---|---|
| Zilele 1–14 | Trial. Acces complet, fără card. |
| Ultimele 3 zile | Banner portocaliu în dashboard: „Trialul se încheie în X zile". |
| Ziua 15 | Trial expirat → banner roșu + o notificare în aplicație (o singură dată). |
| Zilele 15–44 | **Suspendare** (deocamdată doar anunțată, nu aplicată). |
| Ziua 45 | Ștergerea datelor salonului. Contul de utilizator rămâne. |

**Durata NU se comunică public** — peste tot scriem doar „trial gratuit". Promisiunea
„primele 3 luni gratuite" a fost scoasă de peste tot, la fel și „Garanție 30 zile"
(nu putem returna bani cât timp nu încasăm nimic).

Nu mai există plan `starter`: salonul pornește pe **Basic în trial** la finalul wizardului,
iar la pasul de abonament poate urca la Pro/Business.

**Ce înseamnă „suspendat" (când se va aplica):** salonul păstrează accesul la cont și la datele
lui și le poate exporta; profilul public dispare din căutare; nu mai primește programări noi;
agenții AI se opresc. **Programările deja confirmate se desfășoară normal.** La ștergere se
păstrează denumirea salonului în istoricul clienților, ca istoricul lor să rămână coerent.
Scris în Termeni, secțiunea 5 (versiunea 1.1).

---

### ⚠️ DE REVENIT CÂND FACEM STRIPE

1. **`saloane.abonament_activ`** — coloana există deja, e mereu `false`. Webhook-ul Stripe o
   pune pe `true` la plată reușită și pe `false` la eșec/anulare. `lib/trial.ts` o citește deja:
   dacă e `true`, nu se mai afișează niciun banner.
2. **Blocarea efectivă** — azi doar anunțăm. De activat: ascunderea profilului din căutarea
   publică (`app/dashboard/client/page.tsx`, lista de saloane), oprirea rezervărilor noi și
   oprirea agenților AI pentru saloanele suspendate.
3. **Butonul „Alege un plan"** din bannere duce la tabul Abonament — acolo trebuie legat
   checkout-ul real, nu doar salvarea planului în `saloane.plan`.
4. **Butoanele manuale din `/admin`** (vezi mai jos) rămân ca override după Stripe — scriu
   exact aceleași două coloane pe care le va scrie webhook-ul.

### Planul în trial — probă reală, nu lacăte (21.08.2026)

**Ce era:** salonul în trial stă pe planul ales în wizard, de obicei Basic. Deci timp de 14 zile
vedea **un agent AI din patru** și trei ecrane cu „Disponibil începând cu planul Business", care îl
trimiteau în alt tab. Trialul, adică exact momentul în care omul ar trebui să vadă ce cumpără, era
momentul în care i se arăta ce nu are.

**Regula stabilită cu utilizatorul:**

| Când | Ce vede |
|---|---|
| În trial | planul pe care stă **acum** — dar se poate muta liber între Basic / Pro / Business, oricând, de câte ori vrea, fără card |
| Ultimele 3 zile | bannerul spune pe ce plan e: „Ești pe Pro — cu el continui, dacă nu schimbi" |
| Ziua 15 | i se propune **planul pe care se află**. Atât — fără socoteli de tipul „planul pe care a stat cele mai multe zile", pe care nu i le poți explica într-o propoziție |
| După trial, fără confirmare | rămâne pe planul lui, în starea „expirat". **Nu** cade automat pe Basic: o retrogradare tăcută ar face să dispară funcții fără ca omul să fi atins nimic |

**Lacătul a devenit ușă.** Pe un agent din alt plan, cât timp salonul e în trial, scrie „Ești în
trial — îl poți încerca acum, fără card", iar butonul schimbă planul **pe loc**, fără să ieși din
pagină. Limitarea citește `saloane.plan`, deci agenții se deschid singuri. Sub buton scrie că te
poți întoarce oricând.

**Schimbarea planului se face din tabul Abonament**, cu cele trei carduri și comutatorul
lunar/anual. Înainte butonul te scotea pe `/register/abonament-salon` — pagina din înscriere.

**Trei lucruri pregătite pentru facturare (Stripe încă nu există):**

1. **`saloane.ciclu`** — lunar/anual. Până acum omul alegea „anual" cu −17%, apăsa, și alegerea
   **se pierdea**: nu exista coloană. Era o promisiune de preț pe care n-o rețineam.
2. **Coloanele Stripe**, goale: `stripe_customer_id`, `stripe_subscription_id`, `plan_status`,
   `plan_expira_la`. Webhook-ul are unde scrie, fără migrare făcută în grabă.
3. **`plan_istoric`** — jurnal al schimbărilor (de pe ce, pe ce, ce ciclu, în ce stare de trial).
   La prima dispută despre facturare o să vrei să știi ce a ales omul și când; iar după primele 20
   de saloane îți arată dacă lumea urcă sau coboară în trial. Informație care nu se poate recupera
   retroactiv.

**Ce NU s-a făcut:** nicio simulare de plată, niciun buton „Plătește" care nu plătește, nicio
factură falsă. Sub planuri scrie mai departe că plata online nu e activă.

**De ținut minte la Stripe:** mutarea între planuri în mijlocul unei luni plătite cere proratare —
Stripe o face singur, dar interfața va trebui să spună ce se întâmplă cu banii. În trial nu există
problema asta, fiindcă nu e niciun ban la mijloc.

**SQL:** `sql/planuri_si_facturare.sql` — **obligatoriu**, adaugă `saloane.ciclu`, coloanele Stripe
și tabelul `plan_istoric`. Fără el, schimbarea planului din dashboard eșuează.

### Starea abonamentului — comandă manuală în admin (20.08.2026)

**Fundătura de dinainte:** salonul cu trialul expirat vedea bannerul roșu „Alege un plan ca să
continui", apăsa, alegea Pro — și bannerul rămânea. Alegerea planului scrie doar `saloane.plan`;
„abonat" cere `abonament_activ = true`, iar singurul lucru care o pune pe true e webhook-ul
Stripe. Stripe nu există. Deci nimeni nu putea ieși vreodată din „expirat", nici măcar pentru test.

**Acum**, în `/admin` → Saloane → **Detalii**, fiecare salon are patru butoane care scriu direct
în `saloane.trial_expira_la` și `saloane.abonament_activ`: *Trial nou (14 zile)* · *Trial pe
terminate (2 zile)* · *Trial expirat (ieri)* · *Marchează abonat / Anulează abonatul*.
Tot ciclul de viață se poate parcurge cap-coadă fără plăți.

**⚠️ Cere `sql/admin_scrie_saloane.sql`.** Fără el, RLS respinge scrierea **în tăcere** — un
`update` blocat de RLS nu întoarce eroare, doar zero rânduri, deci butonul părea că merge și nu
se schimba nimic. Fișierul adaugă funcția `public.este_admin()` (SECURITY DEFINER, ca politica să
nu depindă de RLS-ul de pe `profiluri`) și două politici pe `saloane`: citire și scriere pentru
admin. În cod, `update`-ul are acum `.select("id")` și, la zero rânduri, spune pe ecran că RLS
a refuzat — nu mai eșuează mut.

**Trei bug-uri reparate odată cu asta:**

1. **`lib/trial.ts` declara „abonat" salonul fără dată de trial.** Rândul
   `if (!trialExpiraLa) return { stare: "abonat" }` însemna „nu știu → înseamnă că plătește”:
   dashboardul scria „Abonament activ", iar adminul îl aduna la **„MRR real (încasat)"** și la
   rata de conversie. Venituri inventate, exact boala scoasă din admin în 04.08.
   Acum **„abonat" se întoarce doar când `abonament_activ` e true**, nimic altceva; salonul fără
   dată își calculează trialul din `created_at + 14 zile`.
2. **Wizardul reîncărca trialul.** `trial_expira_la` era în `upsert`, deci oricine retrecea
   wizardul (accesibil oricând din cont) primea încă 14 zile — trial nelimitat. Acum se scrie
   separat, doar `.is("trial_expira_la", null)`. Trialul se dă o dată în viața salonului.
3. **Vindecare automată:** la prima intrare în cont, salonul fără dată primește
   `created_at + 14 zile` scris în bază, o singură dată. Iese din zona de ghicit.

### ⚠️ DE REVENIT CÂND FACEM EMAIL (Resend)

1. **Emailurile de trial** — azi există doar notificarea în aplicație, deci un salon care nu
   intră în cont **nu află** că i-a expirat trialul. De trimis: cu 3 zile înainte de expirare,
   la expirare, și cu 7 zile înainte de ștergere.
2. **Ștergerea efectivă NU se activează până nu există emailul** — altfel am șterge datele
   cuiva care n-a fost anunțat. E și risc juridic, nu doar comercial.
3. **Sarcina programată** — azi starea se calculează la intrarea în cont. Pentru emailuri e
   nevoie de un cron zilnic (Vercel Cron sau pg_cron în Supabase) care scanează
   `trial_expira_la` și trimite.

**SQL:** `sql/trial_si_planuri.sql` adaugă `trial_expira_la` și `abonament_activ`.

**PLANURILE stau într-un singur fișier:** `lib/planuri.ts`. Prețuri, caracteristici, verticală și ciclul lunar/anual sunt folosite deopotrivă de `/preturi`, `/register/abonament-salon` și tabul „Abonamentul meu" din dashboard. Orice modificare se face doar acolo.

**Atenție:** `TERMENI_VERSIUNE` din `app/register/page.tsx` trebuie schimbat ori de câte ori se modifică textul din Termeni sau Confidențialitate.

**Ce NU se atinge în categoria C:** logica Supabase existentă (`signInWithPassword`, `signUp`, upsert profil, temă, redirect pe rol) și OAuth-ul social — butoanele Google/Facebook/telefon rămân decorative până la etapa lor din TODO-ul de lansare.

### Specializările salonului + „pentru cine caut" (10.08.2026)

Două filtre noi în dashboardul clientului, amândouă doar pe verticala de înfrumusețare.

**Specializări** — listă fixă de 7 (`lib/specializari.ts`), **cel mult 3 per salon**. Lista fixă
împiedică „Frizerie" / „frizerie barbati" / „Barber Shop" să devină categorii diferite; limita de 3
împiedică salonul să le bifeze pe toate ca să apară peste tot. Se aleg în wizard (pasul Servicii,
obligatoriu minim 1) și se pot schimba din dashboard → Profilul salonului. Wizardul le **propune**
din serviciile deja scrise, o singură dată — după prima bifă alegerea e a omului.
Coloană: `saloane.specializari text[]`.

**Genul ordonează, NU filtrează (decizie 11.08.2026).** Prima variantă avea rândul „Caut: pentru
mine / pentru altcineva / toate", care chiar ascundea saloane. A fost scoasă: un filtru care scoate
din listă salonul greșit costă o rezervare, o ordine greșită nu costă nimic. Acum `profiluri.gen`
doar ordonează lista sub sortarea „Recomandate" — saloanele cu `public_tinta` potrivit primele, apoi
cele mixte și cele nedeclarate, apoi restul. Sub butoanele de sortare scrie de ce e lista în ordinea
aia. Nimic nu dispare, deci mama care rezervă pentru băiat n-are nevoie de niciun buton.

**Publicul salonului se editează și din dashboard** (Profilul salonului → „Cui se adresează
salonul"). Înainte se putea alege doar în wizard, deci saloanele înscrise mai devreme rămâneau
`public_tinta` gol pentru totdeauna — și ordonarea lucra pe date pe care nimeni nu le putea completa.

### Programările luate la telefon (12.08.2026)

Salonul poate bloca o oră din tabul Program, alegând între **Telefonic · Walk-in · Pauză**.
Primele două sunt clienți reali fără cont; a treia nu e client.

**Pauzele nu intră nicăieri** — nici la programări, nici la încasări, nici în Excel, nici în datele
Consultantului AI. Rămân doar în calendar, ca oră ocupată (`ePauza` în `app/dashboard/salon/page.tsx`).

**La Telefonic / Walk-in, trei câmpuri opționale**, iar salonul decide de fiecare dată:

| Câmp | Completat | Gol |
|---|---|---|
| Serviciul (din lista salonului) | completează prețul și durata singur; intră în statisticile pe servicii | rămâne „Programare telefonică" |
| Prețul | intră la **Încasări** | se numără doar la **Programări** |
| Numele + bifa „Ține minte clientul" | apare în **Istoric clienți**, grupat după nume, marcat „fără cont" | ora se blochează, nu se reține nimeni |

**Sub cardul Încasări scrie câte vizite n-au preț completat**, ca suma să nu pară completă când nu e.
Aceeași informație ajunge la **Consultantul AI**, cu instrucțiunea să spună explicit că suma e
incompletă — altfel ar semnala scăderi de venit care nu s-au întâmplat.

Clienții fără cont **nu pot fi blocați** (butonul nu apare) și nu au animal, poză sau telefon în
aplicație — cardul lor poartă eticheta „fără cont", ca lipsa datelor să se înțeleagă.

### Neprezentările și încasările reale (rezolvat 12.08.2026)

**Ce era:** când ora unei programări trecea, `autoFinalizeaza` o marca automat `finalizat`, iar
„Încasări" numărau și programările `confirmat`. Un client care nu venea intra la încasări, iar
o programare de peste patru zile apărea deja la „Încasări luna asta". Salonul nu avea cum să
corecteze nimic.

**Ce e acum:**

| Cifră | Ce numără |
|---|---|
| **Încasări** | doar `finalizat` — vizite chiar încheiate |
| **De încasat** | doar `confirmat` — programări viitoare, bani care n-au intrat |
| Neprezentări | `neprezentat`, arătate sub Încasări când există |

**Marcarea automată a rămas** (decizia utilizatorului): programările trecute devin `finalizat`
singure, ca salonul să n-aibă de bifat nimic în zilele obișnuite. În agendă, sub calendar, apare
secțiunea **„Vizite încheiate"** cu butonul „Nu s-a prezentat" pentru excepții, și „Totuși a venit"
pentru corecție. Doar programările venite din aplicație — cele adăugate manual la telefon n-au
client care să lipsească.

**Neprezentările se numără separat de anulările târzii** (`neprezentariMap` vs `abateriMap`), iar
blocarea clientului e oferită **de la prima neprezentare**, nu de la un prag: o neprezentare e mai
gravă decât o anulare cu trei ore înainte, care măcar dă un semn.

**Clientul vede statusul** ca „Neprezentare", în istoric. Nu primește notificare — e o însemnare
internă a salonului, nu o acuzație trimisă pe telefon. Nu poate lăsa recenzie la o vizită la care
n-a fost.

**SQL:** `sql/neprezentari.sql` adaugă valoarea `neprezentat` în restricția de pe `programari.status`.

### Închiderea contului de salon (decizie 12.08.2026)

| Ce | Cum |
|---|---|
| Programările viitoare | Se anulează automat, iar fiecare client primește notificare: „X și-a închis contul, iar programarea ta din … a fost anulată." |
| Datele salonului | Contact, poze, galerie, descriere, servicii, echipă, specializări, coordonate — golite. |
| **Denumirea** | **Rămâne.** Altfel istoricul clienților ar arăta „Salon necunoscut" în locul unei vizite reale. E și ce promit Termenii, §5. |
| Recenziile primite | Rămân legate de rândul salonului, care nu se șterge. |
| Contul | `saloane.sters_la` + `profiluri.sters_la` — nu mai poate intra, la fel ca la client. |

Căutarea clientului filtrează `.is("sters_la", null)`, deci saloanele închise dispar din listă.
Se cere parola înainte de confirmare.

### Salonul poate modifica programările confirmate (20.08.2026)

**Ce era:** programarea confirmată era un dreptunghi verde **inert** în calendar. Salonul n-o putea
anula, muta sau corecta. Dacă specialistul se îmbolnăvea, ora rămânea ocupată la nesfârșit,
clientul o vedea în cont, iar `autoFinalizeaza` o trecea ca încheiată — deci intra la **încasări**
o vizită care n-a avut loc. Asimetrie: salonul putea șterge o oră blocată de el (telefonic,
walk-in, pauză), dar nu putea atinge programarea unui client real.

**Acum**, clic pe programarea confirmată din agendă → trei acțiuni:

| Acțiune | Reguli |
|---|---|
| **Mută** (zi, oră, specialist) | ora nouă e **definitivă**, clientul e doar anunțat (varianta A). Suprapunerea e semnalată, nu blocată — unele saloane suprapun intenționat. |
| **Corectează** serviciul / prețul / durata | clientul primește notificare **doar dacă se schimbă prețul** — acolo e vorba de banii lui |
| **Anulează** | motivul e **obligatoriu întotdeauna**, spre deosebire de client (unde e cerut doar sub 24h): omul își face alt plan sau își ia liber, deci merită să știe de ce |

**De ce varianta A și nu „salonul propune, clientul confirmă":** salonul sună clientul oricum
înainte să miște ceva. O propunere de confirmat ar adăuga o stare pe care nimeni n-o urmărește,
iar ora ar rămâne blocată până răspunde cineva. Compensația: **clientul mutat anulează liber.**

**Două capcane rezolvate odată cu asta:**

1. **`anulat_de`** — dashboardul salonului numără anulările târzii ale clientului ca
   „anulată + are motiv completat". Din clipa în care și salonul scrie un motiv, motivul lui ar fi
   fost pus în cârca clientului: un om căruia salonul i-a anulat de trei ori ar fi apărut cu
   „3 anulări târzii", iar salonul ar fi fost invitat să-l blocheze.
2. **`mutat_la`** — dacă salonul mută programarea în ziua următoare, clientul ar fi fost obligat
   să scrie un motiv (regula de sub 24h) pentru o schimbare pe care n-a făcut-o el. Acum
   programarea mutată se anulează **fără motiv, oricând**, iar pe cardul clientului scrie de ce.

**SQL:** `sql/salon_modifica_programari.sql` — **obligatoriu**, adaugă `programari.anulat_de`
(client/salon) și `programari.mutat_la`. Fără el, butoanele de anulare și mutare eșuează.

### Refuzurile nu mai dispar fără urmă (21.08.2026)

**Ce era, în trei straturi:**

1. `loadProgramari` arunca din start orice programare anulată **fără motiv** — heuristica prin
   care încerca să ascundă refuzurile salonului. Efect neintenționat: și **anulările clientului
   făcute din timp** (care n-au motiv, fiindcă nu li-l cerem peste 24h) dispăreau din agendă.
   Salonul nu afla niciodată că cineva a renunțat cu trei zile înainte — ora arăta liberă.
2. La apăsarea pe *Refuză*, cardul dispărea instantaneu de pe ecran (`filter`), fără confirmare
   și fără nicio urmă.
3. Secțiunea de sub calendar se numea **„Anulări de la client"** și conținea de-a valma anulările
   clientului, refuzurile salonului și anulările făcute de salon — trei lucruri puse toate în
   cârca clientului.

**Acum:** nimic nu se mai ascunde. Fiecare card poartă eticheta lui — *Clientul a anulat* ·
*Ai refuzat cererea* · *Ai anulat programarea* — iar butonul „Blochează" apare doar la primul caz.

**Motivul la refuz e opțional**, spre deosebire de anularea unei programări confirmate (unde e
obligatoriu): o cerere n-a fost niciodată o promisiune, iar un salon care refuză zece cereri pe zi
n-are timp să scrie zece explicații. Trei scurtături de un clic + câmp liber.

**`anulat_de` are trei valori:** `client`, `salon` (a anulat una confirmată), `salon_refuz`
(a refuzat o cerere). Ultimele două arată identic în bază, dar înseamnă altceva.

**În statistici, refuzurile sunt scoase din numărătoare** — nu intră nici la „Programări", nici la
„anulate". Un salon plin care refuză 20 de cereri nu are 20 de anulări, are 20 de ore ocupate.
Apar separat, marcate „(nesocotite)". Refuzurile nu apar nici în grila calendarului: ora n-a fost
niciodată ocupată de ele.

**Clientul vede acum pe card cine a anulat și de ce.** Înainte scria doar „Anulat", identic
indiferent cine renunțase, iar motivul — obligatoriu pentru salon de la punctul 13 — trăia doar în
notificare: se citea o dată și se pierdea.

**SQL:** `sql/salon_modifica_programari.sql` — **de rulat din nou**, restricția de pe `anulat_de`
se reface cu a treia valoare.

### Recenziile clientului — modificare și ștergere (12.08.2026)

Clientul își poate **modifica** recenzia doar în primele `ORE_EDITARE_RECENZIE = 48` de ore și
doar cât timp salonul n-a răspuns; după răspuns e o conversație, nu un monolog, iar o notă
schimbată sub răspuns l-ar lăsa pe salon cu o replică fără sens. **Ștergerea rămâne posibilă
oricând** — e ce a scris omul despre propria experiență.

Media salonului se recalculează pe loc la ambele. Butoanele stau sub recenzie, în tabul
Programări → Istoric; când modificarea nu mai e permisă, scrie de ce.

### Anularea programărilor — regulile (stabilite 12.08.2026)

| Situație | Ce poate face clientul |
|---|---|
| Cerere **neconfirmată** de salon | O retrage oricând, **fără motiv**. Salonul primește notificare. |
| Programare **confirmată**, cu peste 24h înainte | O anulează **fără motiv**. Salonul primește notificare că ora e liberă. |
| Programare **confirmată**, sub 24h | O anulează, dar **trebuie să scrie un motiv** (min. 5 caractere). |

Anularea **nu se blochează niciodată** (înainte era interzisă sub 12h): un „nu mai ajung" cu
trei ore înainte e mai bun pentru salon decât un client care pur și simplu nu apare.

`ORE_ANULARE_LIBERA = 24` în `app/dashboard/client/page.tsx`.

**Anulările târzii se numără.** `motiv_anulare` completat = anulare sub 24h, deci `abateriMap`
din dashboardul salonului numără exact anulările târzii ale fiecărui client. De la
`ANULARI_PANA_LA_AVERTISMENT = 3` (în `app/dashboard/salon/page.tsx`) semnalul devine roșu și
salonul e invitat explicit să decidă dacă mai primește clientul — butonul „Blochează" există
deja și scrie în `saloane.clienti_blocati`.

### Speciile acceptate (rezolvat 03–04.08.2026)
Clientul vede acum cu ce animale lucrează salonul: iconițe pe cardul din listă și
un rând „Lucrează cu" în profil. Dacă animalul selectat nu e pe listă, apare un
avertisment roșu înainte de rezervare. Datele existau deja în `saloane.specii`.

**Editare din dashboard (04.08.2026):** speciile se puteau alege doar o dată, în
wizardul de înregistrare. Acum există aceeași grilă și în dashboardul salonului,
tabul „Profilul salonului" → sub Descriere → „Cu ce animale lucrezi". Apare doar
la saloanele de grooming (`areAnimale`), se salvează în `saloane.specii` odată cu
restul datelor de profil și nu se poate salva cu lista goală.

## Agenții AI — toți patru folosesc modele reale (12.08.2026)

Până azi, trei din patru erau șabloane vândute ca AI. Acum:

| Agent | Model | Cost / generare |
|---|---|---|
| Răspunsuri la recenzii | Haiku 4.5 | ~0,5 bani |
| Alertă clienți inactivi | Haiku 4.5 (mesajele; detecția era deja reală) | ~0,4 bani / client |
| Fișă îngrijire / Recomandări după vizită | Haiku 4.5 | ~1,1 bani |
| Consultant AI | Haiku 4.5 | ~3–5 bani / raport |

**Toate au șabloanele vechi ca plasă de siguranță:** dacă lipsește
`ANTHROPIC_API_KEY` sau pică serviciul, salonul primește tot ceva utilizabil,
iar răspunsul spune `sursa: "sablon"` în loc de `"ai"`.

**Frâne puse pe cost:**
- **Fișa se generează o singură dată per programare** (`genereazaFisa` iese devreme dacă
  există deja `draft`). Butonul „Regenerează" a fost scos — textul rămâne editabil de mână.
- Mesajele de reactivare pentru toți clienții se cer **într-o singură cerere**, nu una per client.
- Consultantul: rapoartele se salvează în `consultant_rapoarte` (cache), întrebările libere sunt
  limitate la 5/lună prin `consultant_utilizare`.

**Simulare (curs 4,6 lei/USD, Haiku la $1/$5 per milion de tokeni):** un salon cu 20 de
programări pe zi și fișă la fiecare costă **~4,8 lei/lună** — 2,6% din abonamentul Business.
La 200 de saloane, în cel mai negru scenariu, ~980 lei/lună.

**De pus înainte de lansare:** un plafon lunar în console.anthropic.com → Limits.

**Rămâne șablon, dar nu se numește AI:** postările sociale („În curând", neimplementate).

**De reevaluat separat:** agentul de predicție rebooking (vezi
`docs/BLUEPRINT-MULTI-VERTICALA.md` §9).

## SEO (OBLIGATORIU pentru orice pagină nouă)

Orice pagină publică nouă adăugată în aplicație trebuie să respecte standardul SEO deja stabilit:

1. **Metadata individuală** — fiecare pagină exportă propriul `metadata: Metadata` cu:
   - `title` unic și descriptiv (include keyword-uri RO)
   - `description` 140-160 caractere, conține keyword-uri naturale
   - `alternates: { canonical: "/ruta" }`
   - `openGraph` complet (title, description, url, type)
   - `keywords` array cu termeni RO relevanți

2. **Pentru paginile `"use client"`** — metadata se pune într-un `layout.tsx` separat în același folder (nu poți exporta `metadata` dintr-un client component).

3. **Pagini private (dashboard, setări utilizator)** — `robots: { index: false, follow: false }`.

4. **Pagini locale / orașe** — adaugă JSON-LD `LocalBusiness` + `BreadcrumbList`, înregistrează ruta în `app/sitemap.ts` și (dacă folosește URL keyword-rich) în `next.config.js` rewrites.

5. **Adaugă în `app/sitemap.ts`** orice rută publică nouă cu `priority` și `changeFrequency` corespunzătoare.

6. **Conținut vizibil = conținut indexabil:**
   - Folosește un singur `<h1>` per pagină, descriptiv.
   - Ierarhie corectă `h1 → h2 → h3`.
   - Text real în HTML, nu doar în imagini.
   - `alt` pe toate imaginile relevante.
   - Link-uri interne către alte pagini din site.

7. **URL-uri** — doar lowercase, cuvinte separate prin `-`, fără diacritice, keyword-rich (ex: `/saloane-grooming-bucuresti`, nu `/page-42`).

## Stil cod

- Inline styles (no Tailwind classes în practică)
- Font Nunito, brand color `#FF6B00`
- Footer cu varianta corectă pe fiecare tip de pagină
- Limba română pentru tot conținutul UI

## Identitatea vizuală — trei piese + ansamblul (05.08.2026)

| Piesă | Fișiere | Unde se folosește |
|---|---|---|
| **Logo** (chenar + siluete) | `logo-semn.png` + `-dark` | dashboard client, dashboard salon, admin, favicon |
| **Denumirea** („CalyHub") | `logo-nume.png` + `-dark` | antetul paginilor publice |
| **Sloganul** | `logo-slogan.png` + `-dark` | antetul paginilor publice (peste 560px) |
| **Ansamblul** | `logo.png` + `-dark` | imaginea de share, print, oriunde e nevoie de marca întreagă |

Numele și sloganul sunt **decupate din `logo.png`**, deci literele sunt exact cele din logo.
Chenarul e desenat ca vector (în `Logo.tsx` și `LogoSemn.tsx`), ca să se coloreze după temă.

**Componente:** `components/Logo.tsx` = toate trei (pagini publice) · `components/LogoSemn.tsx` =
doar logo-ul (dashboarduri, admin). La 38px, badge-ul întreg avea numele de ~10px și sloganul de
~4px — o mâzgăleală în colț; de aceea acolo folosim doar logo-ul.

**Iconițe generate din logo** (script cu PIL, chenarul „ars" în imagine fiindcă un fișier de
iconiță nu poate conține vector adaptabil): `favicon.ico` (16/32/48), `apple-touch-icon.png` (180,
fundal alb — iOS nu ține transparența), `icon.png` (512, Android/PWA).

**⚠️ Imaginea de share (`og-image.png`, 1200×630, fundal alb).** Apare când cineva trimite linkul
pe WhatsApp, Facebook, LinkedIn, Telegram, iMessage. Înainte era declarată în `layout.tsx` dar
**fișierul nu exista** — la fel `favicon.ico` și `apple-touch-icon.png`, toate trei dădeau 404.

**Capcana Next.js:** o pagină care își definește propriul `openGraph` îl **înlocuiește** pe cel din
layout, imaginea inclusă. Zece pagini făceau asta și pierdeau imaginea. Fiecare are acum explicit
`images: ["/og-image.png"]`. **Orice pagină publică nouă cu `openGraph` propriu trebuie s-o adauge.**

## Logo (OFICIAL — rămâne acesta)

- Fișierul `public/logo.png` este logo-ul oficial al aplicației CalyHub și **rămâne acesta**.
- Design: chenar rotunjit (jumătate negru `#1A1A1A`, jumătate portocaliu `#FF6B00`) cu silueta câine (negru) + pisică (portocaliu) și textul „CalyHub" dedesubt.
- Versiunea curentă este **decupată strâns** (fără marginile albe goale) și are **fundal transparent** (PNG RGBA, ~894×873) — astfel apare mai mare la aceeași înălțime în header, fără să schimbăm designul.
- Toate paginile și dashboard-urile referențiază `/logo.png` (un singur fișier sursă). Header public la `height: 44`, dashboard la `height: 38`.
- NU se modifică designul logo-ului fără cerere explicită. Dacă logo-ul se mărește, butoanele din header se micșorează pe mobil prin clasele `.hdr-btn` / `.hdr-nav` din `app/globals.css` (media query `@max-width:640px`).
- Notă: `logo.png` e folosit și ca imagine OpenGraph în `app/layout.tsx`; fiind transparent, pe share social fundalul poate apărea negru/alb — la nevoie se face o imagine OG dedicată cu fundal, separat de logo.

### Semnul din antetul paginilor publice (05.08.2026)

**Problema:** în antet, badge-ul întreg la 54px făcea numele „CalyHub" de ~14px și sloganul
„BEAUTY · ÎNGRIJIRE · ÎNCREDERE" de ~4px — o pată gri. Purtam pe fiecare pagină un nume ilizibil.

**Soluția:** `components/Logo.tsx` afișează cele trei bucăți una lângă alta — chenarul cu
siluetele, cuvântul și sloganul. **Toate sunt decupate din `logo.png`**, nu rescrise cu alt font,
deci literele sunt exact cele din logo. Fișiere noi în `public/`:
`logo-semn.png`, `logo-nume.png`, `logo-slogan.png` + variantele `-dark`.

**Singurul lucru redesenat e chenarul.** În logo el înconjoară tot pătratul, inclusiv zona de
text, deci nu se putea decupa doar partea de sus. E acum vector în `Logo.tsx`, cu aceeași formă
rotunjită și aceleași două culori; jumătatea „neagră" folosește `--marca-contur`, care devine
deschisă pe temă întunecată.

**`logo.png` rămâne neatins** și se folosește mai departe pentru OpenGraph, favicon, dashboarduri
și panoul de admin.

**Cele trei bucăți sunt elemente separate, nu un singur link.** Doar chenarul cu siluetele e
`<Link>` către pagina principală; numele și sloganul stau lângă el, ca imagini. Când toate trei
erau într-un singur `<a>`, regula generală `a:hover` din `globals.css` (ridică 2px și adaugă
`box-shadow`) desena un dreptunghi gri de 256px peste tot ansamblul — arăta ca o selecție.
Clasa `.ch-marca-link` anulează efectele generale de link și lasă doar o estompare ușoară.

**Animația** (`components/MarcaAnim.tsx` + `.ch-marca*` în `globals.css`): semnul apare, numele se
dezvăluie de la stânga la dreapta ca și cum ar fi scris, sloganul vine ultimul. Rulează **o
singură dată pe sesiune** (`sessionStorage`) — antetul e pe fiecare pagină, iar o mișcare la
fiecare navigare ar deveni obositoare.

**Scara pe ecrane mici** — semnul e mult mai lat decât pătratul de dinainte, deci trebuia făcut
loc butoanelor din dreapta:

| Lățime | Ce se vede |
|---|---|
| ≥ 561px | semn + nume + slogan |
| 401–560px | semn + nume, semn micșorat la 42px |
| 341–400px | la fel, mai mic (38px), plus butoane mai strânse |
| ≤ 340px | doar semnul — numele nu mai încape |

Verificat că antetul încape pe 320, 360, 390, 430, 768 și 1280px.

## Branch & deploy

- Development: `claude/change-project-background-zPuM4`
- Production (Vercel auto-deploy): `main`
- Pentru ca modificările să apară pe Vercel, trebuie merge din branch-ul de dev în `main` și push pe `main`.

## DE REVIZUIT (direcția nouă: înfrumusețare + grooming)

- **PLANURILE (`app/preturi/page.tsx`) — de revizuit pe parcurs.** Structura actuală (Basic 57/69 · Pro 99/119 · Business 182/219 lei) a fost rescrisă pentru direcția nouă (saloane de înfrumusețare ȘI grooming), dar **prețurile, limitele de useri și distribuția funcțiilor per plan rămân de recalibrat** după ce validăm piața beauty. De reevaluat: dacă un salon de frizerie are nevoie de aceleași limite ca un salon de grooming, dacă „useri" e unitatea corectă de facturare, și dacă 3 planuri sunt suficiente sau trebuie un plan de intrare mai ieftin.

- **AGENȚII AI — decizie luată (31.07.2026, D4):** rămân **4 agenți**, în aceeași distribuție pe planuri. Doi sunt neutri (răspunsuri la recenzii, clienți inactivi), doi își schimbă conținutul după verticala salonului: „Fișă îngrijire post-grooming" ↔ „Recomandări după vizită" (șabloane diferite în `app/api/ai/fisa-ingrijire/route.ts`) și Consultant AI (prompturi diferite în `app/api/ai/consultant/route.ts`). **Rămâne de reevaluat**: agentul de **predicție rebooking** (relevant mai ales pe beauty — vezi `docs/BLUEPRINT-MULTI-VERTICALA.md` §9).

- **PLANURILE pe verticală — decizie luată (31.07.2026, D4):** aceleași 3 planuri și aceleași prețuri pentru ambele verticale; diferă doar cum sunt formulate caracteristicile. Pe `/preturi` și `/instrumente-ai` există un comutator „Salon de înfrumusețare / Salon de grooming".

- **Salonul care face și oameni, și animale:** rămâne regula un salon = o verticală. Cazul e practic imposibil în același spațiu (autorizare sanitară diferită). Cine are ambele afaceri își face două conturi; soluția curată vine mai târziu prin **multi-locație** (deja promisă ca „în curând" în planul Business), unde fiecare locație are verticala ei.

## Home — împărțit în două zone (05.08.2026)

**Varianta scurtă (3 secțiuni, 294 de cuvinte) a fost încercată și respinsă de utilizator.**
S-a revenit la Home-ul plin și s-a rezolvat doar problema reală: pagina vorbea alternativ cu
clientul și cu proprietarul de salon, fără să spună vreodată unde se termină partea fiecăruia.

Conținutul a rămas tot (823 de cuvinte, 6 secțiuni). Ce s-a adăugat e **semnalizarea**:

| Unde | Ce |
|---|---|
| Sub cele două carduri din hero | bară „Vezi în detaliu: Partea clienților · Partea saloanelor" — sar direct la ancore |
| Începutul zonei client | bandă portocalie `#pentru-clienti` — „Zona 1 din 2 · De aici încolo vorbim cu tine, clientul", cu buton „Am un salon →" |
| Sfârșitul zonei client | „Aici se termină partea clienților. Ai un salon? Sari la partea ta ↓" + CTA de cont |
| Începutul zonei salon | bandă `#pentru-saloane` — „Zona 2 din 2", cu buton „Sunt client →" |
| Secțiunea Planuri | eyebrow devine „PLANURI · TOT PARTEA SALOANELOR", ca să se vadă că e aceeași zonă |
| Sfârșitul zonei salon | „Aici se termină partea saloanelor. Ce urmează e din nou pentru amândoi." |

Funcția `banda()` din `app/page.tsx` generează benzile; `scrollMarginTop: 86` le oprește sub
antetul lipit. Zonele au rămas în ordinea de dinainte (client, apoi salon) — nu s-a mutat
niciun conținut, doar s-a marcat unde începe și unde se termină fiecare.

**Corecții după prima trecere (05.08.2026):**
1. **Butoanele din benzi spun ce fac, nu cine ești.** „Am un salon →" pus în zona clienților se
   citea invers, ca și cum acolo ar fi fost partea saloanelor. Acum: „Sari la partea saloanelor ↓"
   și „Urcă la partea clienților ↑". La fel, bara de sub hero începe cu „Pagina are două părți."
2. **Iconița zonei client e `User`, nu `PawPrint`.** Clientul e om; animalul e opțional. Foarfeca
   a rămas la saloane.
3. **Fiecare zonă are acum două sub-ramuri, simetric.**
   - **Clienți:** „Cont fără animal → Saloane de înfrumusețare" și „Cont cu animal →
     Înfrumusețare și grooming". Spun regula din D1 pe față: de ce unii clienți nu văd grooming.
     Dedesubt: „Nu trebuie să alegi acum. Începi fără animal și îl adaugi oricând."
   - **Saloane:** „Salon de înfrumusețare → Frizerie, coafor, unghii, cosmetică" și „Salon de
     grooming → Tuns, îmbăiere, îngrijire animale", cu diferențele reale din `lib/planuri.ts`
     (preț pe serviciu vs pe talie, specialiști vs groomeri, recomandări după vizită vs fișă
     post-grooming, specii acceptate). Sub ele, grila de 6 funcții comune, introdusă de
     „Restul e la fel, indiferent ce alegi".
4. **Titlurile descriu oferta, nu comportamentul omului.** Prima variantă avea „Vii doar pentru
   tine" / „Vii și cu animalul" — respinse. La fel, „ce primești" a fost scos din banda
   saloanelor.

**Nu s-a pierdut nimic din SEO** — dimpotrivă, Home a urcat de la 729 la 823 de cuvinte.

---

## Panoul de admin (`/admin`) — refăcut 04.08.2026

Panoul nu știa de verticale și, mai grav, **inventa cifre**: fiecare salon era citit ca `plan: "basic"`
și `status: "activ"` (hardcodat în cod, nu din bază), ratingul era mereu `0`, iar graficul „Evoluție MRR"
și distribuția planurilor veneau din `Math.random()`. Adică dashboardul arăta venituri care nu există.

**Ce e acum real, citit din Supabase:** planul, verticala (`domeniu`), starea de trial (prin `lib/trial.ts`),
mărimea echipei, numărul de servicii, speciile, ratingul și recenziile (din tabelul `recenzii`),
graficul de înscrieri pe ultimele 6 luni (din `created_at`).

**Verticala:** comutator global în header („Toate / Înfrumusețare / Grooming") care filtrează Overview,
Saloane, Programări, Abonamente, Recenzii. Clienții NU se filtrează — un cont de client nu aparține unei
verticale; în schimb tabul Clienți arată „cu animal" (grooming + înfrumusețare) vs „fără animal"
(doar înfrumusețare), care e distincția reală din D1.

**MRR-ul e împărțit în două:** „MRR real (încasat)" = doar saloanele cu `abonament_activ = true`, deci 0
cât timp Stripe nu e conectat; „MRR potențial" = saloanele în trial × prețul planului lor. Plus pâlnia
trialului și rata de conversie.

**Ce a fost scos pentru că era fals:** butoanele „Blochează client" și „Suspendă salon" (scriau doar în
`localStorage`, se pierdeau la refresh — nu există coloană de stare în bază), moderarea recenziilor
(nu există coloană de raportare), cifrele de trafic din Marketing (Search Console neconectat), și
câmpurile editabile de preț din Setări (arătau planul `starter` la 0 lei și Pro la 99 — valori vechi).

**Ce a rămas demo, marcat explicit ca atare:** tichetele de suport — nu există tabel și nici formular
de suport în dashboardul salonului.

**Taburi reformulate:** „Setări sistem" → **„Configurație"**, ecran de citire care arată planurile din
`lib/planuri.ts` (cu comutator pe verticală), regulile din `lib/trial.ts`, verticalele, orașele SEO și o
listă „ce nu e conectat încă" (Stripe, Resend, pagina publică de salon, Search Console, OAuth).
„Marketing/SEO" arată inventarul real de rute și câte saloane există în fiecare oraș.

**Structura taburilor (04.08.2026, a doua trecere):**
- **Programări** — nu mai înșiră toate programările. Sus 4 KPI (finalizate, total, în așteptare, anulate),
  apoi un **rezumat pe salon**: finalizate / confirmate / în așteptare / anulate / total / luna asta / volum /
  ultima programare, cu rând de TOTAL jos și sortare (finalizate, total, volum, alfabetic). Saloanele cu 0
  programări apar estompate — se vede imediat cine s-a înscris și nu folosește platforma. Lista detaliată a
  rămas, dar ascunsă în spatele butonului „Vezi lista detaliată".
- **Abonamente** — sub defalcarea pe plan există acum **lista saloanelor de pe fiecare plan** (secțiuni
  pliabile Business / Pro / Basic), cu verticală, oraș, stare de trial, echipă, programări pe lună și data
  înscrierii.
- **Recenzii** — două surse. „Recenzii primite de saloane" e **grupat pe salon** (tabel cu nr. recenzii,
  medie, câte sub 3★, câte fără răspuns, ultima) și abia la clic pe un salon se deschid recenziile lui.
  „Recenzii despre CalyHub" nu există încă — vezi mai jos.

**⚠️ DE REVENIT — recenzii despre platforma CalyHub (cerut 04.08.2026).**
Azi recenziile sunt doar **despre saloane** (client → vizită, salonul poate răspunde). Nu există niciun loc
în care cineva să evalueze **CalyHub** ca produs. Pentru asta e nevoie de: (1) tabel nou
`recenzii_aplicatie` (rating, text, rol autor client/salon, data), (2) un formular în dashboardul clientului
și în cel al salonului, care întreabă după câteva utilizări, (3) ecranul de admin care le adună.
Are sens **după lansare**, când există utilizatori reali — înainte ar răspunde doar conturile de test.
Tabul există deja în admin și explică exact ce lipsește.

**⚠️ DE REVENIT — tabul „Configurație" (cerut 04.08.2026).** Deocamdată e ecran de citire peste
`lib/planuri.ts` și `lib/trial.ts`. **De reluat aproape de lansare**, când se știe ce trebuie să fie editabil
din interfață (prețuri, orașe, mod mentenanță, banner) și ce rămâne în cod.

**De revenit:** blocare/suspendare reală (odată cu Stripe), moderarea recenziilor (odată cu raportarea
din dashboardul salonului), tabel de tichete, date de trafic (odată cu Search Console — și numai după
actualizarea politicii de cookie-uri).

---

## ⚠️ ETAPĂ ÎNAINTE DE LANSARE — Partea publică: pagina de salon + paginile de oraș

**Decis 04.08.2026: se face aproape de lansare, nu acum.** Motivul: cât timp baza e goală,
codul ar fi scris și testat pe gol. Se face când există saloane reale de arătat.

**Problema (măsurată 04.08.2026), în trei straturi:**

1. **Paginile de oraș sunt marketing, nu căutare.** `app/saloane/[domeniu]/[oras]/page.tsx`
   are `ORASE` (5 orașe scrise de mână) și `DOMENII` scrise în cod, se generează la build (SSG)
   și nu atinge Supabase niciodată. Un salon real înscris nu apare acolo.
2. **Nu există pagină publică de salon.** Nu există nicio rută `/salon/[…]`. Singurul loc unde
   se vede un salon e dashboardul clientului, adică **după login** — deci Google nu vede nimic.
   Ăsta e stratul care lipsește cu adevărat.
3. **Sunt zero saloane reale.** O listă live azi ar afișa gol — mai rău decât textul actual.

**Unde e valoarea:** pagina de oraș aduce trafic pe „coafor București", dar **pagina de salon**
scalează: 200 de saloane = 200 de pagini indexabile. Oamenii caută „Salon Bella Cluj" mai des
decât „coafor Cluj". Și e argumentul de vânzare: *„te înscrii și primești o pagină proprie în Google"*.
**Azi salonul plătește abonament și nu are nicio prezență publică.**

**Planul, în ordinea de execuție (~2 zile dev + un SQL):**

| Pas | Ce | Când |
|---|---|---|
| 1 | **RLS public** — politică `anon SELECT` pe `saloane`, doar coloanele publice și doar saloanele care au terminat wizardul. Plus coloană `slug` unică (`bella-hair-cluj`), ca să nu avem URL cu uuid. | înainte de lansare |
| 2 | **`/salon/[slug]`** — SSR + ISR (revalidate 1h): poză, galerie, descriere, servicii cu prețuri (pe talie la grooming, simplu la înfrumusețare), echipă, program, specii acceptate, recenzii reale, JSON-LD `LocalBusiness` + `aggregateRating`. „Rezervă" → `/register?redirect=/salon/slug` sau direct în dashboard dacă e logat. Intră în sitemap. | **înainte de lansare** (e ce promitem saloanelor) |
| 3 | **Pagina de oraș devine hibridă** — sus lista reală citită server-side, jos rămâne tot conținutul SEO de acum. Dacă orașul are 0 saloane, lista dispare și apare „Încă nu avem saloane în X — fii primul" → `/register`. Pagina nu arată niciodată goală și se populează singură, fără deploy. | după primele 5–10 saloane |
| 4 | **Orașele nu mai sunt hardcodate** — `select distinct oras from saloane` unit cu cele 5 de acum ca minim. Un salon din Sibiu → apare automat `/saloane-infrumusetare-sibiu`. Sitemap generat la fel. | după pasul 3 |

**Decizii de luat înainte de a scrie cod (rămân deschise):**
- **Ce se vede fără cont:** propunerea — nume, oraș, adresă, telefon, descriere, poze, servicii cu
  prețuri, recenzii, program. **Fără** sloturile libere (acolo trebuie cont). Prețurile publice sunt
  exact motivul pentru care se dă clic din Google; ascunse, pagina nu are rost.
- **Telefonul public** — dacă îl afișăm, unii clienți vor suna direct și vor sări peste platformă.
  Nu costă acum (0% comision), dar salonul va vedea mai puține programări în CalyHub.
  Recomandarea: îl afișăm — încrederea contează mai mult decât atribuirea la început.
- **Termeni** — de scris explicit că datele de profil ale salonului (inclusiv telefonul) apar public.

---

## ⚠️ PLAN ETAPIZAT PÂNĂ LA LANSARE (stabilit 11.08.2026)

**Punctul de plecare, măsurat:** aplicația trăiește doar pe `varianta-3-13-05-2026.vercel.app`.
Nu există domeniu cumpărat, nici adresă de email. Firma e înființată, dar cu coduri CAEN de
vânzări online — nepotrivite pentru SaaS. Fără cont bancar pe firmă.

**Codul presupune deja `calyhub.ro`:** `SITE_URL` din `app/layout.tsx` și `app/sitemap.ts`,
plus 11 fișiere care conțin domeniul și 6 locuri din interfață care trimit la
`support@calyhub.ro` (ștergerea contului, schimbarea emailului, FAQ, footer).

| # | Etapa | Ce trebuie făcut | Cost | Ce deblochează |
|---|---|---|---|---|
| 0 | **Domeniul** | Verifică și cumpără `calyhub.ro` (rotld.ro sau orice registrar). Dacă e ocupat de altcineva → discuție despre schimbarea numelui, care atinge logo, texte și tot SEO-ul. | ~15 EUR/an | absolut tot restul |
| 1 | **Emailul** | Redirecționare de la registrar către o adresă personală (primire) + cont Resend cu domeniul verificat prin DNS (trimitere). | 0–6 EUR/lună | confirmare programare, emailuri de trial, ștergerea datelor la 45 zile, schimbarea emailului din Profil, bun venit salon |
| 2 | **Firma** | Coduri CAEN la ONRC (6201, 6311, 6312) · cont bancar pe firmă (Revolut Business, online) · contabil pentru regim fiscal și TVA. | ~400–600 RON | Stripe, facturare |
| 3 | **Încasările** | Cont Stripe (cere IBAN pe firmă + CUI), integrare, webhook care pune `abonament_activ = true`, portal de facturi. | ~4 zile dev | primul salon plătitor |
| 4 | **Facturarea** | SmartBill + transmitere în SPV ANAF. **e-Factura e obligatorie B2B din iulie 2024**, iar CalyHub facturează saloane. | — | conformitate |
| 5 | **Juridic** | CUI afișat pe site (footer + Confidențialitate) · actualizarea politicii **înainte** de activarea Resend (devine procesator) · contract cadru B2B + DPA. | consultant | primul client real |
| 6 | **SMS Twilio** | Ultima, poate niciodată. Cere firmă pusă la punct, sender ID aprobat de operatori (zile–săptămâni), card, și actualizarea politicii. | ~0.04–0.07 EUR/SMS | reminder 24h · **butonul „Trimite SMS" din agentul de clienți inactivi** |

**⚠️ Ce așteaptă concret Twilio (punctul 7 din inventarul dashboardului salon):**
în `app/dashboard/salon/page.tsx`, agentul „Clienți inactivi" are butonul **„Trimite SMS (în curând)"**,
dezactivat, fără nicio acțiune în spate. Mesajele de reactivare se scriu deja cu Claude, deci textul
e gata — lipsește doar canalul prin care pleacă. Când se face Twilio, butonul se leagă acolo.
Până atunci salonul copiază mesajul și îl trimite singur, iar eticheta „(în curând)" spune adevărul.

**De reevaluat atunci:** dacă până acolo există aplicația de telefon cu notificări push, reactivarea
prin push e gratis și acoperă clienții care au aplicația instalată. SMS-ul rămâne util doar pentru
ceilalți — vezi și nota despre permisiunea de notificări din TODO post-lansare.

**Decizii luate în discuție:**

1. **Resend înaintea lui Twilio.** Emailul e gratis, nu cere aprobări de la operatori și deblochează
   lucruri care azi lipsesc de tot. Twilio cere firma pusă la punct și costă la fiecare mesaj.
2. **Reminderul de 24h nu justifică singur Twilio** — push-ul din aplicația de telefon îl face gratis.
   De reevaluat abia atunci; SMS-ul rămâne util doar pentru cine nu instalează aplicația.
3. **Lansarea nu așteaptă Stripe.** Saloanele intră în trial de 14 zile fără card; Stripe devine
   necesar în ziua în care primul salon vrea să plătească.


## TODO post-lansare

- **⚠️ NOTIFICĂRI — cererea de permisiune la instalare (decis 11.08.2026).**
  În `app/dashboard/client/page.tsx`, tabul Notificări → blocul „Preferințe notificări" are două
  comutatoare („Remindere programări — WhatsApp sau SMS, cu 24 de ore înainte" și „Newsletter
  CalyHub") care **nu se salvează nicăieri**: sunt stare locală, iar butonul „Salvează preferințele"
  doar afișează un toast. La refresh revin la implicit. Nu există niciun sistem de SMS sau push în
  aplicație. Aceeași promisiune apare și în FAQ (tabul Ajutor, întrebarea 3).

  **Ce se face când ajungem la aplicația de telefon (PWA sau nativă):** la instalare, aplicația
  întreabă o singură dată dacă vrea notificări push — momentul potrivit e **după prima programare
  reușită**, nu la prima deschidere (altfel omul refuză din reflex și nu mai poate fi întrebat,
  iOS nu redeschide dialogul). Răspunsul se salvează în bază, iar comutatoarele din tabul Notificări
  devin reale și reflectă starea permisiunii din sistem. Push-ul rezolvă și reminderul de 24h fără
  costul SMS-urilor (~0.04–0.07 EUR/mesaj prin Twilio).

  **Rezolvat provizoriu (11.08.2026):** comutatoarele au fost **scoase**, iar blocul se numește acum
  „Cum te anunțăm" și spune adevărul — notificări în aplicație la confirmare, anulare și răspuns la
  recenzie; fără SMS și fără emailuri de marketing. Răspunsul din FAQ a fost rescris la fel.
  Se întorc, reale, odată cu aplicația de telefon.

- **⚠️ SCHIMBAREA EMAILULUI (11.08.2026).** Câmpul Email din dashboardul clientului → Profil era
  editabil, dar la salvare se scriau doar `nume`, `telefon` și `gen` — omul îl schimba, primea
  „Profil actualizat!", iar la refresh era tot cel vechi. Acum e **doar de citit**, cu trimitere la
  support. Schimbarea reală (`supabase.auth.updateUser({ email })`) trimite un link de confirmare la
  adresa nouă, deci **așteaptă Resend** — cu mailerul implicit din Supabase riscăm ca omul să rămână
  blocat între două adrese dacă emailul nu ajunge.

- **Code splitting pe tab-uri (punctul E din optimizarea de performanță)** — `app/dashboard/client/page.tsx` (~2300 linii) și `app/dashboard/salon/page.tsx` (~2150 linii) sunt fișiere uriașe cu toate tab-urile la un loc. De spart fiecare tab într-un fișier separat (`tabs/saloane.tsx`, `tabs/programari.tsx`, etc.), de creat un Context provider pentru state-ul comun (user, salon, theme, notificari) și de folosit `dynamic(() => import(...))` pentru lazy loading. Estimare: 4-6 ore. Câștig: -40% bundle inițial. De făcut DUPĂ ce restul aplicației e stabilă post-lansare.

- **Pagina Confidențialitate (`app/confidentialitate/page.tsx`) — parțial corectată (iulie 2026).**
  - ✅ **Cookie-uri** — scoase mențiunile despre Google Analytics 4, Hotjar, Facebook Pixel, Google Ads. Pagina declară acum doar cookie-uri esențiale și precizează explicit că analiza/marketingul NU sunt active. **Dacă se activează vreunul, politica trebuie actualizată ÎNAINTE.**
  - ✅ **SMS Twilio** — scos din lista de procesatori; telefonul e declarat ca fiind folosit de salon pentru contact, nu pentru SMS automate.
  - ✅ **„bcrypt"** — reformulat: „gestionate securizat prin Supabase Auth, conform standardelor din industrie".
  - ✅ **Claim-uri de securitate** — scoase „audit semestrial", „backup criptat zilnic", „monitorizare continuă intruziuni"; păstrate doar afirmații susținute (HTTPS/TLS, RLS, furnizori certificați).
  - ❌ **CUI lipsă** — încă de adăugat CUI-ul real al firmei în pagină + footer (`components/Footer.tsx`) — obligatoriu legal.
  - ⚠️ **De validat juridic** înainte de lansare, împreună cu un consultant.

- **Conectare socială + telefon (login `/app/login/page.tsx`) — butoane estetice, FĂRĂ funcții încă.** Pe pagina de login există 3 butoane decorative: „Continuă cu Google", „Continuă cu Facebook", „Continuă cu telefonul". Niciunul nu are cod în spate momentan — doar email + parolă funcționează real. De implementat aproape de prezentare/lansare:
  1. **Google OAuth** — proiect Google Cloud Console + chei OAuth puse în Supabase (Authentication → Providers). Gratis.
  2. **Facebook OAuth** — aplicație Facebook for Developers + chei în Supabase. Gratis.
  3. **Telefon (SMS OTP)** — `signInWithOtp` / `verifyOtp`, necesită provider SMS conectat în Supabase (Twilio etc.). Cost per SMS (~0.04-0.07 EUR). Numere de normalizat E.164 (`+407...`).
  4. **Rută callback** `/auth/callback` (nu există încă) — necesară pentru OAuth: creează profilul dacă userul e nou și redirecționează după rol (client/salon). De decis ce se întâmplă cu user nou prin Google/FB (nu trece prin formularul care alege tipul cont): recomandare → cont client automat.
  5. **Account linking** — de activat în Supabase ca să nu se creeze conturi duble când cineva folosește același email pe parolă și pe Google.
  6. Înregistrarea rămâne cu email + parolă (cum e acum); social/telefon doar la conectare.

---

# RAPORT COMPLET CALYHUB — 29 Mai 2026

## BLOC 1 — APLICAȚIE WEB

### ✅ Gata și funcțional
- Autentificare email + parolă
- Înregistrare client (email, telefon, profil animal, poză animal, avatar)
- Înregistrare salon (wizard 4 pași: date firmă, servicii, echipă)
- Sloturi și servicii per specialist (groomer)
- Calendar disponibilitate salon (orar, blocări, sloturi 30min)
- Booking client (căutare salon, rezervare slot, observații la programare)
- Confirmare/refuz programare de către salon
- Agendă salon (sortare: în așteptare primele, apoi descrescător pe oră)
- Notificări in-app (client + salon) cu optimistic update
- Dashboard client (programări, saloane, animale, profil, notificări)
- Dashboard salon (agendă, statistici reale, echipă, programări, rapoarte)
- Dashboard admin (~50%) — tab-urile Overview/Clienți/Saloane/Programări/Abonamente folosesc date reale din Supabase; tab-urile Recenzii/Tichete Suport/Marketing/Setări folosesc mock din `adminMockData.ts` (localStorage)
- Statistici salon (încasări, top servicii, productivitate groomer, export Excel)
- Recenzii — scriere/afișare (~85%) — scriere, validare, afișare pe profil salon și dashboard, agregare rating pe carduri (RatingBadge) — toate cu date reale. Lipsă: răspuns salon, raportare, moderare admin reală
- Performanță: paralelizare query-uri, optimistic UI, cache saloane, indexuri SQL
- SEO complet pe toate paginile publice
- Pagini publice: Home, Cum funcționează, Despre noi, Prețuri, Termeni, Confidențialitate
- Copy revizuit (fără cifre fabricate, fără diminutive, ton profesional)
- Filtre saloane (rating, serviciu) + sortare
- Dark mode
- Mobile UX (~90%)

### ❌ Lipsește / Nefuncțional

**🔐 Autentificare (aproape de lansare)**
- Google OAuth — buton vizual, cod lipsă. Chei Google Cloud Console (gratis)
- Facebook OAuth — buton vizual. Chei Facebook for Developers (gratis)
- Telefon (SMS OTP) — buton vizual. Necesită Twilio (~0.04-0.07 EUR/SMS)
- Ruta `/auth/callback` — nu există, necesară pentru OAuth
- Account linking — de activat în Supabase (evită conturi duble)

**📧 Comunicare (înainte de lansare)**
- Email confirmare programare — nu se trimite nimic (Resend, ~1 zi)
- Email bun venit la înregistrare salon
- SMS reminder 24h (Twilio) — marcat „în curând"
- Email-uri profesionale pe domeniu (support@, parteneri@, privacy@)

**💳 Plăți (etapa 2)**
- Stripe / Netopia — nicio integrare. Abonamentele sunt vizuale, nu se încasează
- Webhook Stripe (activare/dezactivare plan automat)
- Portal Stripe Billing (autoservice factură/card/anulare)
- Câmpuri reale abonament în DB: `stripe_customer_id`, `stripe_subscription_id`, `plan_expiry`, `plan_status` (acum în localStorage)

**🧾 Facturare (etapa 2)**
- SmartBill / Facturis API — factură automată la activare abonament
- e-Factura (SPV ANAF) — obligatorie B2B din iulie 2024. Nicio integrare

**📋 Legal / GDPR**
- Pagina Confidențialitate — inexactități (cookie-uri, SMS Twilio, „bcrypt" vs Supabase, claim-uri securitate)
- CUI firmă — lipsă din site (footer + confidențialitate). Obligatoriu legal
- DPA (Data Processing Agreement) CalyHub ↔ saloane
- Contract cadru B2B cu salonul

**🔍 UX / Calitate date**
- Distanța „1.2 km" hardcodată (necesită Google Maps API)
- Verificare email la register (neconfirmat în Supabase)
- Filtrare saloane pe preț (acum doar serviciu + rating)

**📱 Aplicație nativă** — vezi Bloc 4

## BLOC 2 — FIRMĂ & LEGAL (CalyHub SRL)
- ✅ SRL înregistrat la ONRC
- ❌ Activitate înregistrată
- ❌ Cont bancar pe firmă (obligatoriu înainte de Stripe/Netopia; Revolut Business recomandat)
- ❌ Coduri CAEN actualizate (6201, 6311, 6312) — la ONRC, ~200-400 RON
- ❌ CUI afișat pe site (obligatoriu legal)
- ❌ Contract cadru B2B cu salonul (consultant juridic)
- ❌ DPA GDPR (CalyHub processor ↔ salon operator)
- ❌ NDA pentru colaboratori externi

## BLOC 3 — FISCAL
- ❌ Regim fiscal ales (micro 1%/3% vs profit 16%) — cu contabil
- ❌ Înregistrare TVA (opțional sub 300K RON/an) — cu contabil
- ❌ Software facturare compatibil e-Factura (SmartBill recomandat)
- ❌ Transmitere factură în SPV ANAF (e-Factura) — obligatoriu B2B din iulie 2024
- ✅ Casă de marcat — NU e necesară (SaaS B2B)

## BLOC 4 — APLICAȚIE NATIVĂ (App Store / Google Play)
- **Varianta 1 — PWA:** aplicația web se „instalează" pe telefon, notificări push, 2-3 zile dev, NU trece prin store-uri (instalare din browser). Nu apare în App Store/Play.
- **Varianta 2 — React Native / Expo:** aplicație nativă reală, apare în store-uri, ~2-3 luni dev de la zero. Costuri: $99/an Apple + $25 o dată Google.
- **Varianta 3 — Capacitor/Ionic:** wrapper peste web existent, mai rapid decât RN, performanță mai slabă.
- **Recomandare:** lansare cu PWA, apoi React Native după primii clienți/venituri.

## BLOC 5 — ORDINE RECOMANDATĂ PÂNĂ LA LANSARE

**Etapa 1 — Firmă & legal (săpt. 1, nu e dev)**
1. Actualizare coduri CAEN la ONRC
2. Cont bancar pe firmă (Revolut Business)
3. Regim fiscal cu contabil
4. Consultant juridic: contract B2B + DPA GDPR
5. Software facturare (SmartBill)

**Etapa 2 — Plăți & facturare (săpt. 2, ~4 zile dev)**
6. Cont Stripe (necesită IBAN firmă)
7. Integrare Stripe Billing + webhook
8. Integrare SmartBill API + e-Factura
9. CUI în footer + confidențialitate

**Etapa 3 — Comunicare (săpt. 2-3, ~2 zile dev)**
10. Email confirmare programare (Resend)
11. Email bun venit salon
12. Email-uri profesionale pe domeniu

**Etapa 4 — Înainte de prezentare (~1 zi dev)**
13. Pagina Confidențialitate corectată juridic
14. Google OAuth + Facebook OAuth activate

**Post-lansare (după primii clienți)**
- SMS reminder Twilio · Telefon OTP login · Code splitting dashboard · Hartă Google Maps · PWA → React Native

## PROGRES GENERAL (~78% overall până la lansare)
- Aplicație web ~82% · SEO 100% · Copy 100% · Auth socială 20% · Plăți 10% · Email/SMS 15% · e-Factura 0% · Legal 10% · Fiscal 0% · App nativă 0%
- **Estimare până la lansare corectă: 3-4 săptămâni** (din care ~1 săpt. juridic/fiscal, nu dev)

---

# RAPORT COMPLET CALYHUB — 22 Iunie 2026

## BLOC 1 — APLICAȚIE WEB

### ✅ Gata și funcțional

**Core produs**
- Autentificare email + parolă
- Înregistrare client (profil, animal, poză, avatar)
- Înregistrare salon (wizard 4 pași: date firmă, servicii, echipă)
- Booking client (căutare, filtrare rating/serviciu, rezervare slot)
- Confirmare / refuz programare de către salon
- Agendă salon (în așteptare primele, calendar vizual)
- Notificări in-app (client + salon) cu optimistic update
- Dark mode, Mobile UX ~90%

**Dashboard salon**
- Agendă, statistici reale, echipă, programări, export Excel
- Recenzii — scriere, afișare, rating agregat pe carduri (~85%)

**Funcții AI — toate 4 implementate și cross-device**
- Răspunsuri AI la recenzii (Plan Basic)
- Alertă + mesaj reactivare clienți inactivi (Plan Pro)
- Fișă îngrijire post-grooming (Plan Business)
- Consultant AI — rapoarte premium cached + 5 întrebări/lună (Plan Business) ← nou
- Neural Cards UI redesign cu culori per agent ← nou
- Toate datele AI sincronizate cross-device via Supabase ← nou

**Dashboard admin** (~50%) — Overview/Clienți/Saloane/Programări/Abonamente cu date reale; Recenzii/Suport/Marketing/Setări cu mock

**Pagini publice** — Home, Cum funcționează, Despre noi, Prețuri, Termeni, Confidențialitate
**SEO** — 100% pe toate paginile publice
**Consultant AI prezent** pe toate paginile cu liste de funcții AI ← nou

### ❌ Lipsește / Nefuncțional

**🔐 Autentificare socială**
- Google OAuth — buton vizual, fără cod
- Facebook OAuth — buton vizual, fără cod
- Telefon SMS OTP — buton vizual, fără cod
- Ruta `/auth/callback` — nu există

**📧 Comunicare**
- Email confirmare programare — nimic trimis (Resend, ~1 zi dev)
- Email bun venit la înregistrare salon
- SMS reminder 24h — „în curând"

**💳 Plăți**
- Stripe / Netopia — zero integrare, abonamente sunt vizuale
- Webhook activare/dezactivare plan automat
- Câmpuri reale abonament în DB (`stripe_customer_id`, etc.) — acum în localStorage

**🧾 Facturare**
- SmartBill API, e-Factura SPV ANAF — zero integrare

**📋 Legal / GDPR**
- Pagina Confidențialitate — inexactități juridice (cookie-uri nedeclarate corect, SMS, „bcrypt")
- CUI firmă lipsă din site — obligatoriu legal
- DPA CalyHub ↔ saloane, contract cadru B2B

**🔍 UX minor**
- Distanță „1.2 km" hardcodată (Google Maps API)
- Filtrare saloane pe preț lipsă

## BLOC 2 — FIRMĂ & LEGAL (CalyHub SRL)
- ✅ SRL înregistrat la ONRC
- ❌ Coduri CAEN actualizate (6201, 6311, 6312) — la ONRC, ~200-400 RON
- ❌ Cont bancar pe firmă (obligatoriu înainte de Stripe/Netopia; Revolut Business recomandat)
- ❌ CUI afișat pe site (obligatoriu legal)
- ❌ Contract cadru B2B cu salonul (consultant juridic)
- ❌ DPA GDPR (CalyHub processor ↔ salon operator)
- ❌ NDA pentru colaboratori externi

## BLOC 3 — FISCAL
- ❌ Regim fiscal ales (micro 1%/3% vs profit 16%) — cu contabil
- ❌ Înregistrare TVA (opțional sub 300K RON/an) — cu contabil
- ❌ Software facturare compatibil e-Factura (SmartBill recomandat)
- ❌ Transmitere factură în SPV ANAF (e-Factura) — obligatoriu B2B din iulie 2024
- ✅ Casă de marcat — NU e necesară (SaaS B2B)

## BLOC 4 — APLICAȚIE NATIVĂ (App Store / Google Play)
- **Varianta 1 — PWA:** aplicația web se „instalează" pe telefon, notificări push, 2-3 zile dev, NU trece prin store-uri (instalare din browser). Nu apare în App Store/Play.
- **Varianta 2 — React Native / Expo:** aplicație nativă reală, apare în store-uri, ~2-3 luni dev de la zero. Costuri: $99/an Apple + $25 o dată Google.
- **Varianta 3 — Capacitor/Ionic:** wrapper peste web existent, mai rapid decât RN, performanță mai slabă.
- **Recomandare:** lansare cu PWA, apoi React Native după primii clienți/venituri.

## PROGRES PER DOMENIU

| Domeniu | Mai 29 | 22 Iunie | Delta |
|---|---|---|---|
| Aplicație web core | 85% | 88% | +3% |
| Funcții AI | 65% | 92% | +27% |
| Cross-device sync | 20% | 95% | +75% |
| UI/UX design | 80% | 86% | +6% |
| SEO | 100% | 100% | — |
| Copy public | 100% | 100% | — |
| Auth socială | 20% | 20% | — |
| Plăți | 10% | 10% | — |
| Email/SMS | 15% | 15% | — |
| e-Factura | 0% | 0% | — |
| Legal / GDPR | 10% | 10% | — |
| Fiscal | 0% | 0% | — |
| App nativă | 0% | 0% | — |

## PROGRES GENERAL (~82% overall până la lansare)
- Aplicație web ~88% · Funcții AI 92% · Cross-device sync 95% · SEO 100% · Copy 100% · Auth socială 20% · Plăți 10% · Email/SMS 15% · e-Factura 0% · Legal 10% · Fiscal 0% · App nativă 0%
- **Estimare până la lansare: 2-3 săptămâni** (din care ~1 săpt. juridic/fiscal, nu dev; dev pur rămas ~6-7 zile)

## BLOC 5 — ORDINE RECOMANDATĂ PÂNĂ LA LANSARE

**Săpt. 1 — Non-dev (firmă)**
1. Actualizare coduri CAEN la ONRC
2. Cont bancar pe firmă (Revolut Business)
3. Regim fiscal cu contabil
4. Consultant juridic: contract B2B + DPA GDPR

**Săpt. 2 — Dev (~4 zile)**
5. Cont Stripe (necesită IBAN firmă) + webhook activare plan
6. CUI în footer + confidențialitate
7. Corectare pagină Confidențialitate (juridic)

**Săpt. 3 — Dev (~2 zile)**
8. Email confirmare programare (Resend)
9. Email bun venit salon

**Opțional pre-lansare (~1 zi)**
10. Google OAuth + Facebook OAuth activate

**Post-lansare (după primii clienți)**
- SMS reminder Twilio · Telefon OTP login · SmartBill/e-Factura · Code splitting dashboard · Hartă Google Maps · PWA → React Native
