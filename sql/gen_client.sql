-- ─────────────────────────────────────────────────────────────
-- Genul clientului
--
-- La înfrumusețare serviciile sunt împărțite pe bărbați / damă, iar
-- salonul își declară deja publicul țintă (`saloane.public_tinta`).
-- Ca să putem arăta din prima saloanele potrivite, avem nevoie și de
-- genul persoanei. Se cere obligatoriu la înregistrarea clientului,
-- indiferent dacă are sau nu animal.
--
-- Rămâne gol pentru conturile de salon și pentru clienții înscriși
-- înainte de această modificare — aceia îl pot completa din
-- dashboard → Profil.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

alter table public.profiluri
  add column if not exists gen text;

-- Doar cele două valori pe care le scrie aplicația (sau gol).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiluri_gen_check'
  ) then
    alter table public.profiluri
      add constraint profiluri_gen_check
      check (gen is null or gen in ('masculin', 'feminin'));
  end if;
end $$;

-- Verificare: ar trebui să apară coloana `gen`, de tip text.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'profiluri' and column_name = 'gen';
