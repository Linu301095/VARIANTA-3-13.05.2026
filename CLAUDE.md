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

### Speciile acceptate (rezolvat 03–04.08.2026)
Clientul vede acum cu ce animale lucrează salonul: iconițe pe cardul din listă și
un rând „Lucrează cu" în profil. Dacă animalul selectat nu e pe listă, apare un
avertisment roșu înainte de rezervare. Datele existau deja în `saloane.specii`.

**Editare din dashboard (04.08.2026):** speciile se puteau alege doar o dată, în
wizardul de înregistrare. Acum există aceeași grilă și în dashboardul salonului,
tabul „Profilul salonului" → sub Descriere → „Cu ce animale lucrezi". Apare doar
la saloanele de grooming (`areAnimale`), se salvează în `saloane.specii` odată cu
restul datelor de profil și nu se poate salva cu lista goală.

## ⚠️ ETAPĂ ÎNAINTE DE LANSARE — Agenții AI: șabloane vs. model real

**DE AMINTIT LA FIECARE REZUMAT DE STARE, până e rezolvată.**

Stare măsurată (03.08.2026) — din cei 4 agenți promovați ca „asistenți AI",
**doar unul folosește efectiv un model**:

| Agent | Implementare | Cost tokeni |
|---|---|---|
| Răspunsuri la recenzii | șabloane (`app/api/ai/raspuns-recenzie/route.ts`) | 0 |
| Alertă clienți inactivi | șabloane (`app/api/ai/clienti-risc/route.ts`) | 0 |
| Recomandări după vizită / Fișă post-grooming | șabloane (`app/api/ai/fisa-ingrijire/route.ts`) | 0 |
| **Consultant AI** | **Haiku 4.5** (`app/api/ai/consultant/route.ts`) | plătit |

Frâne deja puse pe Consultant: rapoartele se salvează în `consultant_rapoarte`
(cache, nu se regenerează), întrebările libere sunt limitate la 5/lună prin
`consultant_utilizare`. Limite: 700 tokeni la rapoarte, 400 la întrebări.

**Problema:** pe `/instrumente-ai` toți patru sunt prezentați ca „asistenți AI".
Pentru trei dintre ei e automatizare pe reguli, nu AI. Nu e o minciună gravă și e
practică obișnuită, dar la o întrebare tehnică directă răspunsul onest e altul.

**De făcut înainte de lansare — prioritatea 1:** convertirea agentului de
**răspunsuri la recenzii** la model real. Acolo personalizarea chiar se vede —
AI-ul ar răspunde la *ce a scris* clientul, nu doar la câte stele a dat. Cu Haiku,
costul e neglijabil. Ceilalți doi pot rămâne pe șabloane.

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

## Logo (OFICIAL — rămâne acesta)

- Fișierul `public/logo.png` este logo-ul oficial al aplicației CalyHub și **rămâne acesta**.
- Design: chenar rotunjit (jumătate negru `#1A1A1A`, jumătate portocaliu `#FF6B00`) cu silueta câine (negru) + pisică (portocaliu) și textul „CalyHub" dedesubt.
- Versiunea curentă este **decupată strâns** (fără marginile albe goale) și are **fundal transparent** (PNG RGBA, ~894×873) — astfel apare mai mare la aceeași înălțime în header, fără să schimbăm designul.
- Toate paginile și dashboard-urile referențiază `/logo.png` (un singur fișier sursă). Header public la `height: 44`, dashboard la `height: 38`.
- NU se modifică designul logo-ului fără cerere explicită. Dacă logo-ul se mărește, butoanele din header se micșorează pe mobil prin clasele `.hdr-btn` / `.hdr-nav` din `app/globals.css` (media query `@max-width:640px`).
- Notă: `logo.png` e folosit și ca imagine OpenGraph în `app/layout.tsx`; fiind transparent, pe share social fundalul poate apărea negru/alb — la nevoie se face o imagine OG dedicată cu fundal, separat de logo.

## Branch & deploy

- Development: `claude/change-project-background-zPuM4`
- Production (Vercel auto-deploy): `main`
- Pentru ca modificările să apară pe Vercel, trebuie merge din branch-ul de dev în `main` și push pe `main`.

## DE REVIZUIT (direcția nouă: înfrumusețare + grooming)

- **PLANURILE (`app/preturi/page.tsx`) — de revizuit pe parcurs.** Structura actuală (Basic 57/69 · Pro 99/119 · Business 182/219 lei) a fost rescrisă pentru direcția nouă (saloane de înfrumusețare ȘI grooming), dar **prețurile, limitele de useri și distribuția funcțiilor per plan rămân de recalibrat** după ce validăm piața beauty. De reevaluat: dacă un salon de frizerie are nevoie de aceleași limite ca un salon de grooming, dacă „useri" e unitatea corectă de facturare, și dacă 3 planuri sunt suficiente sau trebuie un plan de intrare mai ieftin.

- **AGENȚII AI — decizie luată (31.07.2026, D4):** rămân **4 agenți**, în aceeași distribuție pe planuri. Doi sunt neutri (răspunsuri la recenzii, clienți inactivi), doi își schimbă conținutul după verticala salonului: „Fișă îngrijire post-grooming" ↔ „Recomandări după vizită" (șabloane diferite în `app/api/ai/fisa-ingrijire/route.ts`) și Consultant AI (prompturi diferite în `app/api/ai/consultant/route.ts`). **Rămâne de reevaluat**: agentul de **predicție rebooking** (relevant mai ales pe beauty — vezi `docs/BLUEPRINT-MULTI-VERTICALA.md` §9).

- **PLANURILE pe verticală — decizie luată (31.07.2026, D4):** aceleași 3 planuri și aceleași prețuri pentru ambele verticale; diferă doar cum sunt formulate caracteristicile. Pe `/preturi` și `/instrumente-ai` există un comutator „Salon de înfrumusețare / Salon de grooming".

- **Salonul care face și oameni, și animale:** rămâne regula un salon = o verticală. Cazul e practic imposibil în același spațiu (autorizare sanitară diferită). Cine are ambele afaceri își face două conturi; soluția curată vine mai târziu prin **multi-locație** (deja promisă ca „în curând" în planul Business), unde fiecare locație are verticala ei.

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

## TODO post-lansare

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
