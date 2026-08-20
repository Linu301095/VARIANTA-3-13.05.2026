-- ─────────────────────────────────────────────────────────────
-- Adminul poate scrie starea abonamentului unui salon
--
-- Panoul /admin → Saloane → Detalii are patru butoane care schimbă
-- `trial_expira_la` și `abonament_activ`. Fără politica de mai jos, RLS
-- respinge scrierea **în tăcere**: `update` nu dă eroare, doar nu atinge
-- niciun rând. Butonul pare că merge și nu se schimbă nimic.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

-- ------------------------------------------------------------
-- 1. „Cine întreabă e admin?"
--
--    Funcție SECURITY DEFINER ca să citească `profiluri` fără să treacă
--    din nou prin RLS. Altfel politica ar depinde de politica de pe
--    profiluri, și am risca o recursivitate greu de depanat.
-- ------------------------------------------------------------
create or replace function public.este_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiluri
    where id = auth.uid() and rol = 'admin'
  );
$$;

revoke all on function public.este_admin() from public;
grant execute on function public.este_admin() to authenticated;

-- ------------------------------------------------------------
-- 2. Politicile de admin pe `saloane`
--
--    Adminul vede toate saloanele (are nevoie pentru panou) și le poate
--    modifica. Politicile existente ale salonului asupra rândului propriu
--    rămân neatinse — RLS le combină cu SAU.
-- ------------------------------------------------------------
alter table public.saloane enable row level security;

drop policy if exists "admin citeste saloane" on public.saloane;
create policy "admin citeste saloane" on public.saloane
  for select to authenticated
  using (public.este_admin());

drop policy if exists "admin scrie saloane" on public.saloane;
create policy "admin scrie saloane" on public.saloane
  for update to authenticated
  using (public.este_admin())
  with check (public.este_admin());

-- ------------------------------------------------------------
-- 3. Verificare — trebuie să apară cele două politici de admin,
--    lângă cele care existau deja pe tabel.
-- ------------------------------------------------------------
select policyname as politica, cmd as operatie, roles
from pg_policies
where schemaname = 'public' and tablename = 'saloane'
order by policyname;
