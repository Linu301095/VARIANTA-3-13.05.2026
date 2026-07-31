-- ============================================================
--  CalyHub — Etapa 2 (Înregistrare)
--  Rulează acest fișier o singură dată, în Supabase → SQL Editor.
--  Se poate rula de mai multe ori fără efecte secundare (IF NOT EXISTS).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Verticala salonului: înfrumusețare SAU grooming
--    Se alege la înregistrare și se scrie aici la finalul wizardului.
-- ------------------------------------------------------------
alter table public.saloane
  add column if not exists domeniu text;

-- Regulă: se acceptă doar cele două valori (sau gol, pentru saloanele vechi).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'saloane_domeniu_check'
  ) then
    alter table public.saloane
      add constraint saloane_domeniu_check
      check (domeniu is null or domeniu in ('infrumusetare', 'grooming'));
  end if;
end $$;

-- Saloanele existente sunt toate de grooming (platforma era doar pe pet).
update public.saloane set domeniu = 'grooming' where domeniu is null;

-- Căutarea pe domeniu + oraș va fi cea mai frecventă interogare publică.
create index if not exists saloane_domeniu_oras_idx
  on public.saloane (domeniu, oras);


-- ------------------------------------------------------------
-- 2. Dovada acceptării Termenilor și a Politicii de confidențialitate
--    (cerință GDPR: trebuie să poți arăta CÂND și CE versiune a acceptat)
-- ------------------------------------------------------------
alter table public.profiluri
  add column if not exists termeni_acceptati_la timestamptz;

alter table public.profiluri
  add column if not exists termeni_versiune text;


-- ------------------------------------------------------------
-- 3. Verificare — ce ar trebui să vezi după rulare
-- ------------------------------------------------------------
-- Coloanele noi:
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'saloane'   and column_name = 'domeniu') or
    (table_name = 'profiluri' and column_name in ('termeni_acceptati_la', 'termeni_versiune'))
  )
order by table_name, column_name;

-- Câte saloane are fiecare verticală:
select coalesce(domeniu, '(gol)') as domeniu, count(*) as saloane
from public.saloane
group by 1
order by 1;
