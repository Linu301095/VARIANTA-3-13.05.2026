-- ─────────────────────────────────────────────────────────────
-- Conturi pentru specialiști — Faza 2: acces la datele salonului
--
-- Faza 1 (sql/conturi_specialisti.sql) a dat specialistului acces la
-- PROGRAMĂRILE lui. Dashboardul propriu (Faza 2) mai are nevoie să citească
-- rândul salonului — numele, serviciile (preț/durată, doar de citit),
-- programul de lucru și echipa (ca să-și găsească propriul orar).
--
-- Nu se atinge nimic din politicile proprietarului sau ale adminului — se
-- adaugă o singură politică de citire, în plus.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

drop policy if exists "specialist citeste salonul lui" on public.saloane;
create policy "specialist citeste salonul lui" on public.saloane
  for select to authenticated
  using (exists (
    select 1 from public.salon_membri_cont smc
    where smc.salon_id = saloane.id and smc.user_id = auth.uid()
  ));

-- Verificare
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'saloane' order by policyname;
