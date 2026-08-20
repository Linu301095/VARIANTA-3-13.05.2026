-- ─────────────────────────────────────────────────────────────
-- Salonul poate anula și muta programările confirmate
--
-- Până acum, o programare confirmată era inertă: salonul n-o putea anula,
-- muta sau corecta. Dacă specialistul se îmbolnăvea, ora rămânea ocupată la
-- nesfârșit, clientul o vedea în cont, iar la final `autoFinalizeaza` o trecea
-- ca încheiată — deci intra la încasări o vizită care n-a avut loc.
--
-- ⚠️ De ce e nevoie de coloana asta ÎNAINTE de a scrie codul:
--
-- Dashboardul salonului numără anulările târzii ale fiecărui client așa:
-- „anulată + are motiv completat". Motivul e obligatoriu pentru client doar
-- sub 24 de ore, deci echivalența ținea. Din clipa în care și salonul scrie
-- un motiv când anulează, motivul lui ar fi numărat **împotriva clientului**:
-- un om căruia salonul i-a anulat de trei ori ar apărea marcat roșu cu
-- „3 anulări târzii", iar salonul ar fi invitat să-l blocheze. Pentru ceva ce
-- a făcut salonul.
--
-- `anulat_de` separă cele două. Rândurile vechi rămân `null` și sunt tratate
-- ca anulări ale clientului — singurele care existau până acum.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

alter table public.programari
  add column if not exists anulat_de text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'programari_anulat_de_check'
  ) then
    alter table public.programari
      add constraint programari_anulat_de_check
      check (anulat_de is null or anulat_de in ('client', 'salon'));
  end if;
end $$;

-- ------------------------------------------------------------
-- Când a mutat salonul programarea
--
-- Ora nouă e definitivă, iar clientul e doar anunțat. Ca schimbul să fie
-- corect, clientul căruia i s-a mutat ora poate anula **fără motiv**, chiar
-- dacă noua oră e peste mai puțin de 24 de ore — altfel salonul ar putea muta
-- o programare în ziua următoare, iar clientul ar fi obligat să se justifice
-- pentru o schimbare pe care n-a făcut-o el, și ar fi numărat ca anulare
-- târzie.
-- ------------------------------------------------------------
alter table public.programari
  add column if not exists mutat_la timestamptz;

-- Anulările de până acum sunt, toate, ale clientului: salonul n-avea butonul.
update public.programari
set anulat_de = 'client'
where status = 'anulat' and anulat_de is null and motiv_anulare is not null;

-- Verificare: ar trebui să apară coloana și restricția.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'programari' and column_name = 'anulat_de';
