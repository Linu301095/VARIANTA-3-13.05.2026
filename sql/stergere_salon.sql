-- ─────────────────────────────────────────────────────────────
-- Închiderea contului de salon
--
-- Regula stabilită (12.08.2026): salonul dispare din aplicație — din
-- căutare, din rezervări, cu date de contact, poze, servicii și echipă
-- șterse. Rămâne doar **denumirea**, ca istoricul clienților să aibă sens:
-- „Tuns damă, 3 martie, 120 lei — Sofia Hair" în loc de „Salon necunoscut".
--
-- E și ce promit Termenii, secțiunea 5: „se păstrează denumirea salonului în
-- istoricul clienților, ca istoricul lor să rămână coerent".
--
-- Programările viitoare se anulează și clienții sunt anunțați — asta se
-- întâmplă din aplicație, nu de aici.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

alter table public.saloane
  add column if not exists sters_la timestamptz;

-- Căutarea clientului cere mereu saloanele nesterse; un index parțial ține
-- interogarea rapidă fără să ocupe spațiu pentru rândurile închise.
create index if not exists saloane_active_idx
  on public.saloane (oras)
  where sters_la is null;

-- Verificare: ar trebui să apară coloana `sters_la`.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'saloane' and column_name = 'sters_la';
