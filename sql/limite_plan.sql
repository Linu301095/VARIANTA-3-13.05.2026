-- ─────────────────────────────────────────────────────────────
-- Limitele de plan — useri și poze
--
-- Regula stabilită (21.08.2026): **limitele nu șterg nimic.**
--
-- Când salonul coboară pe un plan mai mic și e peste limită, își alege singur
-- cine rămâne activ. Restul devin inactivi: datele, istoricul și programările
-- lor confirmate rămân intacte, iar dacă urcă la loc revin exact cum erau.
--
-- Nici varianta „rămân toți" (ar face din trial o portiță prin care oricine
-- își adaugă echipa pe Business și coboară pe Basic), nici varianta „taie
-- aplicația primii din listă" (ar decide în locul omului cine mai lucrează).
--
-- Ce are nevoie de SQL:
--   • Echipa NU are nevoie — `saloane.echipa` e jsonb, deci fiecare membru
--     primește pur și simplu un câmp `activ` în obiectul lui.
--   • Galeria are nevoie de o listă separată a pozelor ascunse, ca să nu
--     ștergem fișiere din storage doar pentru că cineva a coborât planul.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

alter table public.saloane
  add column if not exists galerie_ascunse text[] not null default '{}';

comment on column public.saloane.galerie_ascunse is
  'Poze care rămân în storage, dar nu apar în profilul public — surplusul peste limita planului. Se golește când salonul urcă la loc.';

-- Verificare: ar trebui să apară coloana.
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'saloane' and column_name = 'galerie_ascunse';
