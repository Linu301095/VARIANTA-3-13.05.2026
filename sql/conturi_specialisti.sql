-- ─────────────────────────────────────────────────────────────
-- Conturi pentru specialiști — Faza 1
--
-- Un „user" nu e un rând în lista de echipă, e un om care își gestionează
-- singur programul. Salonul îl invită cu un cod (manual, până există Resend
-- pentru email), specialistul își face cont pe /inregistrare-cont-specialist
-- și de atunci intră singur, direct la agenda lui.
--
-- `saloane.echipa` (jsonb) NU se schimbă de formă — numele, orarul, serviciile
-- fiecărui membru rămân exact acolo. Tabelul de mai jos e doar legătura dintre
-- un membru (`uid`, deja existent din identitate_specialist.sql) și un cont
-- real din `auth.users`. Așa nu riscăm să stricăm interfața „Echipa mea",
-- construită adânc pe forma actuală a listei.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────


-- ------------------------------------------------------------
-- 1. Tabelul de legătură
-- ------------------------------------------------------------
create table if not exists public.salon_membri_cont (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.saloane(id) on delete cascade,
  -- Corespunde uid-ului din saloane.echipa[].
  membru_uid text not null,
  -- Gol până revendică; nimeni nu poate scrie aici direct — vezi funcția de mai jos.
  user_id uuid references auth.users(id) on delete set null,
  cod_invitatie text,
  cod_expira_la timestamptz,
  created_at timestamptz not null default now(),
  unique (salon_id, membru_uid)
);

create index if not exists salon_membri_cont_user_idx
  on public.salon_membri_cont (user_id) where user_id is not null;


-- ------------------------------------------------------------
-- 2. `profiluri.tip` capătă a treia valoare
--
--    Dacă există deja o restricție pe coloană (enumerând valorile permise),
--    o refacem cu „specialist" inclus. Dacă nu există niciuna, blocul nu face
--    nimic — coloana e text liber și acceptă oricum noua valoare.
-- ------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.profiluri'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%tip%'
  loop
    execute format('alter table public.profiluri drop constraint %I', r.conname);
  end loop;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiluri' and column_name = 'tip'
  ) then
    alter table public.profiluri
      add constraint profiluri_tip_check
      check (tip is null or tip in ('client', 'salon', 'specialist'));
  end if;
end $$;


-- ------------------------------------------------------------
-- 3. RLS pe tabelul de legătură
--
--    Proprietarul salonului vede și scrie tot (generează/revocă coduri,
--    revocă accesul unui cont). Specialistul își vede DOAR rândul lui —
--    ca să afle la ce salon și cu ce uid e legat, la intrarea în dashboard.
--    Scrierea legăturii (revendicarea codului) se face exclusiv prin
--    funcția SECURITY DEFINER de mai jos, nu direct pe tabel.
-- ------------------------------------------------------------
alter table public.salon_membri_cont enable row level security;

drop policy if exists "salon citeste membri_cont" on public.salon_membri_cont;
create policy "salon citeste membri_cont" on public.salon_membri_cont
  for select to authenticated
  using (exists (select 1 from public.saloane s where s.id = salon_membri_cont.salon_id and s.user_id = auth.uid()));

drop policy if exists "salon scrie membri_cont" on public.salon_membri_cont;
create policy "salon scrie membri_cont" on public.salon_membri_cont
  for all to authenticated
  using (exists (select 1 from public.saloane s where s.id = salon_membri_cont.salon_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.saloane s where s.id = salon_membri_cont.salon_id and s.user_id = auth.uid()));

drop policy if exists "specialist citeste randul lui" on public.salon_membri_cont;
create policy "specialist citeste randul lui" on public.salon_membri_cont
  for select to authenticated
  using (user_id = auth.uid());


-- ------------------------------------------------------------
-- 4. „E specialistul legat de acest membru din acest salon?"
--
--    SECURITY DEFINER ca politicile de pe `programari` să nu depindă de
--    RLS-ul de pe `salon_membri_cont` (același motiv ca la `este_admin()`).
-- ------------------------------------------------------------
create or replace function public.este_membru_activ(p_salon_id uuid, p_membru_uid text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.salon_membri_cont
    where salon_id = p_salon_id and membru_uid = p_membru_uid and user_id = auth.uid()
  );
$$;

revoke all on function public.este_membru_activ(uuid, text) from public;
grant execute on function public.este_membru_activ(uuid, text) to authenticated;


-- ------------------------------------------------------------
-- 5. Revendicarea codului
--
--    Singurul loc care scrie `user_id` pe legătură. Codul e global (nu ține
--    de un salon anume la căutare), dar unic printre codurile încă valabile —
--    pagina de înregistrare încearcă din nou dacă din întâmplare generează
--    unul care se ciocnește cu altul activ.
-- ------------------------------------------------------------
create or replace function public.redeem_cod_specialist(p_cod text)
returns table(salon_id uuid, membru_uid text, salon_nume text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  if auth.uid() is null then
    raise exception 'Trebuie să fii conectat.';
  end if;

  select smc.salon_id as sid, smc.membru_uid as uid, s.nume as nume
  into r
  from public.salon_membri_cont smc
  join public.saloane s on s.id = smc.salon_id
  where smc.cod_invitatie = p_cod
    and smc.cod_expira_la > now()
    and smc.user_id is null
  limit 1;

  if r is null then
    raise exception 'Codul nu este valid sau a expirat.';
  end if;

  update public.salon_membri_cont
  set user_id = auth.uid(), cod_invitatie = null, cod_expira_la = null
  where salon_membri_cont.salon_id = r.sid and salon_membri_cont.membru_uid = r.uid;

  return query select r.sid, r.uid, r.nume;
end;
$$;

revoke all on function public.redeem_cod_specialist(text) from public;
grant execute on function public.redeem_cod_specialist(text) to authenticated;


-- ------------------------------------------------------------
-- 6. RLS pe `programari` — agenda proprie a specialistului
--
--    Politicile existente ale proprietarului nu se ating; RLS le combină
--    cu SAU. Un specialist poate atinge doar programările cu `membru_uid`
--    egal cu al lui, în salonul la care e legat.
--
--    Blocarea/deblocarea unei ore (`sursa = 'blocaj'`) e restricționată
--    separat, ca specialistul să nu poată insera sau șterge programări
--    reale de client — doar orele lui indisponibile.
-- ------------------------------------------------------------
drop policy if exists "specialist citeste programarile lui" on public.programari;
create policy "specialist citeste programarile lui" on public.programari
  for select to authenticated
  using (membru_uid is not null and public.este_membru_activ(salon_id, membru_uid));

drop policy if exists "specialist scrie programarile lui" on public.programari;
create policy "specialist scrie programarile lui" on public.programari
  for update to authenticated
  using (membru_uid is not null and public.este_membru_activ(salon_id, membru_uid))
  with check (membru_uid is not null and public.este_membru_activ(salon_id, membru_uid));

drop policy if exists "specialist blocheaza ore proprii" on public.programari;
create policy "specialist blocheaza ore proprii" on public.programari
  for insert to authenticated
  with check (sursa = 'blocaj' and membru_uid is not null and public.este_membru_activ(salon_id, membru_uid));

drop policy if exists "specialist deblocheaza ore proprii" on public.programari;
create policy "specialist deblocheaza ore proprii" on public.programari
  for delete to authenticated
  using (sursa = 'blocaj' and membru_uid is not null and public.este_membru_activ(salon_id, membru_uid));


-- ------------------------------------------------------------
-- 7. Verificare
-- ------------------------------------------------------------
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'salon_membri_cont' order by policyname;
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'programari' and policyname ilike 'specialist%' order by policyname;
