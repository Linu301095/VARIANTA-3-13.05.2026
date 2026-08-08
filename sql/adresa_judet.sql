-- ─────────────────────────────────────────────────────────────
-- Județul salonului și publicul căruia i se adresează
--
-- Adresa se completează acum pe bucăți în wizard (stradă, număr,
-- județ, oraș) și se scrie mai departe într-un singur câmp `adresa`,
-- ca până acum. Județul merge în plus într-o coloană a lui, ca să se
-- poată filtra și număra fără să despicăm textul adresei.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

alter table public.saloane
  add column if not exists judet text;

-- Cui se adresează salonul de înfrumusețare: barbati / dama / ambele.
-- La grooming rămâne gol — acolo distincția e pe specii, nu pe public.
alter table public.saloane
  add column if not exists public_tinta text;

-- Căutarea clientului filtrează după oraș, iar panoul de admin numără
-- pe județ — un index pe amândouă acoperă ambele cazuri.
create index if not exists saloane_judet_oras_idx
  on public.saloane (judet, oras);

-- Verificare: ar trebui să apară coloana `judet`.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'saloane' and column_name in ('judet', 'public_tinta', 'oras', 'adresa')
order by column_name;
