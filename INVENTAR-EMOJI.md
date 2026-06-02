# Inventar emoji CalyHub — audit aspect

Generat pentru decizia de „de-emoji-zare". Total brut: **~390 apariții** în UI.
Recomandare per emoji: **PĂSTREAZĂ** / **SVG** (înlocuire cu icon vectorial) / **SCOATE**.

---

## Distribuție pe fișiere

| Fișier | Nr. emoji | Tip pagină |
|--------|-----------|-----------|
| `dashboard/salon/page.tsx` | ~150 | privat |
| `dashboard/client/page.tsx` | ~132 | privat |
| `cum-functioneaza/page.tsx` | 38 | public |
| `page.tsx` (home) | 31 | public |
| `preturi/page.tsx` | 7 | public |
| `components/HeroCards.tsx` | 7 | public |
| `components/Footer.tsx` | 6 | public |
| `despre-noi/page.tsx` | 4 | public |
| restul (login, register, contact, admin…) | ~15 | mixt |

---

## 1. ICONIȚE FUNCȚIONALE — taburi, butoane, headere → **SVG**

Acestea dau structura aplicației. Funcția lor (scanare rapidă) e bună, dar emoji se
randează inconsistent pe Android/iOS/Windows. Înlocuire 1:1 cu set Lucide React.

| Emoji | Folosit pentru | Recomandare |
|-------|---------------|-------------|
| 📅 | tab Agenda / Programări / „Data" | SVG `Calendar` |
| 🕐 | tab Program / „Ora" | SVG `Clock` |
| 🔔 | tab Notificări | SVG `Bell` |
| 📊 | tab Statistici | SVG `BarChart3` |
| 🔒 | tab Setări cont | SVG `Settings` (nu lacăt) |
| 💳 | tab Abonament | SVG `CreditCard` |
| 👥 | Echipa / Clienți | SVG `Users` |
| 👤 | Profil / groomer / stăpân | SVG `User` |
| 🏪 | Profil salon / „Salon" | SVG `Store` |
| ❓ | tab Ajutor | SVG `HelpCircle` |
| ✏️ | buton Editează/Schimbă | SVG `Pencil` |
| 🗑️ | buton Șterge | SVG `Trash2` |
| 📤 / 📥 | Încarcă / Descarcă-Generează | SVG `Upload` / `Download` |
| 📷 | Poză profil/prezentare | SVG `Camera` |
| 🖼️ | Galerie salon | SVG `Image` |
| 📞 | Telefon (client/salon) | SVG `Phone` |
| 📍 | Oraș / adresă | SVG `MapPin` |
| 🔍 | Căutare | SVG `Search` |
| ⭐ | Rating | SVG `Star` (umplut) |
| ✓ / ✕ | confirmă / închide / „Face" | SVG `Check` / `X` |
| ➕ | Animal nou | SVG `Plus` |
| 🚪 | Logout | SVG `LogOut` |
| ☀️ / 🌙 | Theme toggle | SVG `Sun` / `Moon` |
| 📋 / 📝 | Date salon / Observații | SVG `ClipboardList` / `FileText` |
| 🗓️ | Gestionează sloturi | SVG `CalendarDays` |
| 📏 | Talie necunoscută / „Distribuție" | SVG `Ruler` |
| 💬 | empty state recenzii | SVG `MessageSquare` |
| ✉️ | Footer email | SVG `Mail` |
| 🛡 | „protejat/securitate" | SVG `Shield` |

---

## 2. INDICATORI DE STATUS → **CSS (bulină colorată), nu emoji**

| Emoji | Folosit pentru | Recomandare |
|-------|---------------|-------------|
| 🔴 | Blocat / Client blocat | bulină roșie CSS 8px |
| 🟢 | Liber | bulină verde CSS |
| 🟠 | Rezervat | bulină portocalie CSS |
| ✅ | confirmat (notif/mesaj) | SVG `CheckCircle` verde |
| ❌ | anulat/respins | SVG `XCircle` roșu |
| ⚠️ | alertă/abateri | SVG `AlertTriangle` |
| ℹ️ | info notificare | SVG `Info` |
| 💉 | Vaccinat | SVG `Syringe` sau text simplu |
| 💊 | Alergii | text simplu (scoate emoji) |

---

## 3. DECORATIVE / PLAYFUL → **SCOATE** (sau redu drastic)

Astea fac aspectul „copilăros". Câștig mare la profesionalism, risc zero.

| Emoji | Unde | Recomandare |
|-------|------|-------------|
| 🔥 | badge „Popular" (carduri salon) | SCOATE — text „Popular" e suficient |
| 👑 | badge „Premium" | SCOATE — sau SVG `Crown` discret |
| ✨ | specie „Altele" / sclipici | SCOATE |
| 🎁 | „cadou/ofertă" (home, prețuri) | SCOATE sau SVG `Gift` |
| 🎯 | „țintă/obiectiv" | SCOATE |
| 💸 / 💰 | bani (home, cum-functioneaza) | SCOATE — sau SVG `Wallet` o singură dată |
| 📜 | „termeni" | SCOATE |
| 🤝 🌟 ❤ | despre-noi (valori) | SCOATE — 3 emoji decor pe pagină de prezentare |
| 🚫 | „fără X" | SVG `Ban` doar dacă chiar e buton |

---

## 4. SPECIE & TALIE ANIMAL — caz special (semi-funcțional)

Emoji ca selector de specie/talie **ajută** la recunoaștere rapidă, dar sunt și
sursa principală de „aspect de jucărie". Recomandare nuanțată:

| Emoji | Folosit | Recomandare |
|-------|---------|-------------|
| 🐶 🐱 🐰 🐦 🐹 🦎 | selector specie animal (register, profil) | **PĂSTREAZĂ doar în selectorul de adăugare animal**; scoate din badge-urile repetate din liste |
| 🐕‍🦺 🐕 🐺 | talie Mică/Medie/Mare | **înlocuiește cu text** „Mică/Medie/Mare" în badge-uri; lupul 🐺 pentru „mare" e bizar. Eventual SVG `Dog` uniform |
| 🐾 (labă) | brand / empty states / „Cont client 🐾" | **PĂSTREAZĂ** — e elementul de brand. Limitează la: logo, 1× empty state, semnătură cont |
| ✂️ (foarfece) | identitate grooming / servicii | **PĂSTREAZĂ selectiv** ca semn de brand grooming; în rest SVG `Scissors` |

---

## Rezumat strategie

1. **🐾 + ✂️** = identitatea CalyHub → se păstrează, dar rărite (de la zeci la câteva).
2. **Toate iconițele de UI** (taburi, butoane) → set unic SVG (Lucide) = consistență pe orice telefon.
3. **Status** (🔴🟢🟠) → buline CSS.
4. **Decorativele** (🔥👑✨🎁🎯💸📜🤝🌟❤) → scoase.
5. **Specie/talie** → emoji doar în selectorul de adăugare; în liste, text sau SVG uniform.

**Estimare efort:** instalare `lucide-react` + înlocuire = ~1 zi pentru dashboard-uri,
~0.5 zi paginile publice. Scoaterea decorativelor = ~1-2 ore, se poate face prima.
