# Raport de lucru — 02.06.2026

## Tema zilei: Înlocuirea emoji-urilor cu iconițe SVG (aspect mai profesional)

Punct de plecare: aplicația era prietenoasă, dar avea **prea multe emoji** (~390
apariții în UI), ceea ce dădea un aspect „de jucărie" și inconsistent (emoji se
randează diferit pe Android / iPhone / Windows).

---

## 1. Audit & strategie

- **Inventar complet emoji** → fișier `INVENTAR-EMOJI.md`
  - ~390 apariții totale, cele mai încărcate: salon dashboard (~150), client dashboard (~132)
  - Împărțite în 4 categorii cu recomandare: **PĂSTREAZĂ / SVG / SCOATE**
    1. Iconițe funcționale (taburi, butoane) → SVG
    2. Indicatori status (🔴🟢🟠) → buline CSS
    3. Decorative (🔥👑✨🎁…) → scoase
    4. Specie/talie animal → emoji doar în selectoare
- **Decizie tehnică:** bibliotecă **`lucide-react`** (set unic SVG, tree-shaking,
  consistent pe orice telefon, gratuit/MIT)
- Instalat `lucide-react` în proiect

---

## 2. Implementat — Dashboard CLIENT (prima „degustare")

Înlocuiri făcute în `app/dashboard/client/page.tsx`:

| Zonă | Înainte | Acum |
|------|---------|------|
| Meniu navigare (dropdown cont) | 👤 🐾 📅 🔔 🔒 ❓ | SVG: `User` `PawPrint` `Calendar` `Bell` `Settings` `HelpCircle` |
| Headere secțiune (`PageHeader`) | aceleași emoji | iconițe SVG portocalii |
| Clopoțel notificări (header) | 🔔 | `Bell` SVG |
| Theme toggle | ☀️ 🌙 | `Sun` / `Moon` SVG |
| Logout | 🚪 | `LogOut` SVG (roșu) |
| Avatar fallback | 👤 | `User` SVG |
| Badge-uri carduri saloane | 🔥 Popular / 👑 Premium / ⭐ | doar text „POPULAR / PREMIUM" |
| Tab „Programările mele" | titlu simplu cu emoji | **`PageHeader`** — casetă portocalie + titlu + subtitlu (consistent cu restul) |

> Fix suplimentar cerut: tab-ul „Programările mele" arăta diferit de celelalte
> secțiuni → trecut pe componenta `PageHeader`, acum identic cu Profil/Animale/etc.

---

## 3. Ce s-a păstrat intenționat (brand & semi-funcțional)

- **🐾** ca element de brand → salut („Bună, X! 🐾") + semnătura „Cont client 🐾"
- **Emoji specie/talie** (🐶🐱 / 🐕🐺) în selectoarele de adăugare animal — încă neînlocuite
- **✂️ ⭐ 📍** din conținut (carduri, rating, oraș) — pasul următor

---

## 4. Deploy

- Toate modificările: dezvoltate pe `claude/continue-supabase-integration-76ABe`
- Merge în `main` → **live pe Vercel (producție)**
- Commit-uri separate per pas (revert ușor dacă e nevoie)

---

## 5. Status & feedback

- ✅ Direcția cu SVG **place** — confirmat de client
- ✅ Fix consistență „Programările mele" — făcut

---

## RĂMAS PENTRU MÂINE (03.06.2026)

### Dashboard CLIENT — continuare
- [ ] Selectoare **specie animal** (🐶🐱🐰🐦🐹🦎) → SVG sau păstrare doar în selector
- [ ] Selectoare **talie** (🐕‍🦺🐕🐺 Mică/Medie/Mare) → text/SVG uniform (lupul 🐺 pt „mare" e ciudat)
- [ ] Iconițe din conținut: ✂️ (carduri), ⭐ (rating), 📍 (oraș), 🔍 (căutare)
- [ ] Status notificări (✅❌🔔) în lista de notificări
- [ ] Card programare: 📅 🕐 👤 (text compact dată/oră/groomer)

### Dashboard SALON — neînceput
- [ ] Același tratament ca la client (~150 emoji): taburi, headere, status,
      iconițe agendă, badge-uri talie
- [ ] Status agendă: 🔴🟢🟠 → buline CSS

### Pagini publice — neînceput
- [ ] Home, Cum funcționează, Prețuri, Despre noi, Footer
- [ ] Scos decorative: 🎁 🎯 💸 🛡 🤝 🌟 ❤ etc.

---

**Concluzie zi:** Bază pusă (bibliotecă + strategie + inventar). Dashboard client
~70% de-emoji-zat pe zonele de chrome (navigare, headere, butoane). Mâine:
finalizat client (conținut + selectoare) și atacat dashboard salon.
