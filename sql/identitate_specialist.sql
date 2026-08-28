-- ─────────────────────────────────────────────────────────────
-- Programarea reține specialistul ca identitate, nu ca nume scris
--
-- Până acum, `programari.groomer` era un șir de caractere: „Maria". Salonul o
-- redenumea în „Maria Popescu" și, în tăcere:
--   • programările ei vechi rămâneau agățate de un om care nu mai există
--   • în calendar apărea o coloană nouă, iar cele vechi cădeau la
--     „Fără specialist"
--   • în statistici, istoricul ei se rupea în două persoane diferite
--
-- Aceeași boală o aveau serviciile bifate la un specialist, care se potriveau
-- tot după denumire — dar acolo n-a fost nevoie de SQL: `saloane.servicii` și
-- `saloane.echipa` sunt jsonb, deci fiecare rând a primit pur și simplu un
-- câmp `sid`, respectiv `uid`, completat automat la prima intrare în cont.
--
-- `groomer` NU se șterge: rămâne pentru afișare și pentru programările scrise
-- înainte de coloana asta. Codul caută întâi după `membru_uid` și abia apoi
-- după nume, deci istoricul vechi continuă să funcționeze fără nicio migrare.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

alter table public.programari
  add column if not exists membru_uid text;

comment on column public.programari.membru_uid is
  'Identitatea stabilă a specialistului (saloane.echipa[].uid). Numele din coloana groomer e doar eticheta afișată și poate fi schimbat oricând.';

create index if not exists programari_membru_uid_idx
  on public.programari (salon_id, membru_uid)
  where membru_uid is not null;

-- Verificare: ar trebui să apară coloana.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'programari' and column_name = 'membru_uid';
