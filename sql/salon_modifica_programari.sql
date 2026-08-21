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

-- `anulat_de` are trei valori, nu două:
--   client       — clientul și-a anulat programarea
--   salon        — salonul a anulat o programare deja confirmată
--   salon_refuz  — salonul a refuzat o cerere neconfirmată
--
-- Ultimele două arată la fel în bază (status `anulat`), dar înseamnă lucruri
-- diferite: o cerere refuzată n-a fost niciodată o programare, deci n-are ce
-- căuta la „anulate" în statistici. Un salon plin care refuză 20 de cereri nu
-- are 20 de anulări, are 20 de ore ocupate.
--
-- Restricția se reface de fiecare dată, ca fișierul să poată fi rulat din nou
-- peste o bază care are deja versiunea cu două valori.
alter table public.programari
  drop constraint if exists programari_anulat_de_check;

alter table public.programari
  add constraint programari_anulat_de_check
  check (anulat_de is null or anulat_de in ('client', 'salon', 'salon_refuz'));

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

-- Rândurile anulate fără motiv sunt refuzuri ale salonului: până acum, motivul
-- lipsă era chiar semnalul după care aplicația le ascundea din agendă.
update public.programari
set anulat_de = 'salon_refuz'
where status = 'anulat' and anulat_de is null and motiv_anulare is null;

-- Verificare: ar trebui să apară coloana și restricția.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'programari' and column_name = 'anulat_de';
