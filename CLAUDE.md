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
