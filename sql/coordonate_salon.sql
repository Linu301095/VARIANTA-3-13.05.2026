-- ─────────────────────────────────────────────────────────────
-- Coordonatele salonului, pentru distanța reală
--
-- Până acum pe cardul salonului scria „1.2 km" doar la saloanele demo, iar
-- la cele reale nu scria nimic: distanța nu se calcula niciodată.
--
-- Ca să meargă, salonul are nevoie de un punct pe hartă. Adresa scrisă în
-- wizard se transformă în latitudine/longitudine (prin OpenStreetMap) și se
-- salvează aici. Clientul își dă poziția din GPS, iar distanța se calculează
-- în browser — nu se trimite nicăieri.
--
-- `geocodat_la` ne spune când s-a făcut ultima potrivire, ca să știm care
-- rânduri au rămas în urmă după o schimbare de adresă.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

alter table public.saloane
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists geocodat_la timestamptz;

-- Verificare: ar trebui să apară cele trei coloane.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'saloane'
  and column_name in ('lat', 'lng', 'geocodat_la')
order by column_name;
