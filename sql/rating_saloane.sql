-- ─────────────────────────────────────────────────────────────
-- Nota medie a fiecărui salon, calculată în bază
--
-- Dashboardul clientului afla notele cerând TOATE recenziile din bază,
-- fără niciun filtru, la fiecare intrare în cont — apoi le aduna în telefon.
-- Cu zece recenzii nu se simte; cu cincizeci de mii ar trage câțiva MB de
-- fiecare dată, pentru fiecare client, ca să afișeze trei cifre.
--
-- Vederea de mai jos ține doar rezultatul: un rând per salon. Rămâne un rând
-- per salon și când vor exista un milion de recenzii, fiindcă mărimea ei
-- depinde de câte saloane sunt, nu de câte recenzii.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

create or replace view public.saloane_rating as
select
  salon_id,
  round(avg(rating)::numeric, 2) as medie,
  count(*)                       as nr
from public.recenzii
group by salon_id;

-- Vederea trebuie citită de oricine e conectat, la fel ca recenziile din care
-- vine. `security_invoker` face ca regulile de acces ale tabelului `recenzii`
-- să se aplice mai departe — vederea nu deschide o portiță pe lângă ele.
alter view public.saloane_rating set (security_invoker = on);

grant select on public.saloane_rating to anon, authenticated;

-- Verificare: un rând pentru fiecare salon care are cel puțin o recenzie.
select * from public.saloane_rating order by nr desc;
