-- ─────────────────────────────────────────────────────────────
-- Specializările salonului de înfrumusețare
--
-- Lista e fixă (7 valori, în `lib/specializari.ts`) și un salon poate bifa
-- cel mult 3. Fără listă fixă, categoriile se scriu în patru feluri și
-- filtrul devine inutil; fără limită, fiecare salon le bifează pe toate ca
-- să apară peste tot.
--
-- Grooming-ul rămâne gol — acolo distincția e pe specii, nu pe servicii.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

alter table public.saloane
  add column if not exists specializari text[] default '{}';

-- Doar valorile pe care le cunoaște aplicația, și cel mult trei.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'saloane_specializari_check'
  ) then
    alter table public.saloane
      add constraint saloane_specializari_check
      check (
        specializari is null
        or (
          array_length(specializari, 1) is null
          or (
            array_length(specializari, 1) <= 3
            and specializari <@ array[
              'coafor', 'frizerie', 'unghii', 'cosmetica',
              'epilare', 'machiaj', 'gene'
            ]::text[]
          )
        )
      );
  end if;
end $$;

-- Clientul filtrează „arată-mi doar saloanele de unghii" — un index GIN
-- face căutarea în listă imediată, oricâte saloane ar fi.
create index if not exists saloane_specializari_idx
  on public.saloane using gin (specializari);

-- Verificare: ar trebui să apară coloana, de tip ARRAY.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'saloane' and column_name = 'specializari';
