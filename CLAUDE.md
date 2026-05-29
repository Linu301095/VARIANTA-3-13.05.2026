# CalyHub — Reguli proiect

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

## Branch & deploy

- Development: `claude/change-project-background-zPuM4`
- Production (Vercel auto-deploy): `main`
- Pentru ca modificările să apară pe Vercel, trebuie merge din branch-ul de dev în `main` și push pe `main`.

## TODO post-lansare

- **Code splitting pe tab-uri (punctul E din optimizarea de performanță)** — `app/dashboard/client/page.tsx` (~2300 linii) și `app/dashboard/salon/page.tsx` (~2150 linii) sunt fișiere uriașe cu toate tab-urile la un loc. De spart fiecare tab într-un fișier separat (`tabs/saloane.tsx`, `tabs/programari.tsx`, etc.), de creat un Context provider pentru state-ul comun (user, salon, theme, notificari) și de folosit `dynamic(() => import(...))` pentru lazy loading. Estimare: 4-6 ore. Câștig: -40% bundle inițial. De făcut DUPĂ ce restul aplicației e stabilă post-lansare.

- **Pagina Confidențialitate (`app/confidentialitate/page.tsx`) — de revizuit înainte de prezentare/lansare.** Are inexactități juridice care trebuie corectate ca să nu expună firma la sancțiuni ANSPDCP:
  1. **Cookie-uri declarate dar (probabil) neinstalate** — pagina menționează Google Analytics 4, Hotjar, Facebook Pixel, Google Ads. De confirmat care sunt real active și de scos restul (declararea de prelucrări inexistente e o problemă GDPR).
  2. **SMS Twilio** — pagina spune că se colectează telefon pentru SMS-uri de reminder; SMS-ul e „în curând" în tot restul aplicației. De reformulat ca funcție viitoare până e activ real.
  3. **„Parole criptate cu bcrypt"** — aplicația folosește Supabase Auth, nu bcrypt gestionat direct. De reformulat: „prin Supabase, conform standardelor de securitate".
  4. **CUI lipsă** — de adăugat CUI-ul real al firmei în pagină + footer (`components/Footer.tsx`) — obligatoriu legal.
  5. **Claim-uri de securitate de susținut** — „audit semestrial", „backup criptat zilnic", „monitorizare continuă intruziuni" — de păstrat doar ce e real.

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
