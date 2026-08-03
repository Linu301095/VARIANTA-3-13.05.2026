-- ============================================================
--  CalyHub — Trial gratuit + curățarea planului "starter"
--  Rulează în Supabase → SQL Editor. Se poate rula de mai multe ori.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Când expiră trialul salonului
--    Durata (14 zile) e decisă în cod, la finalul wizardului.
--    Pe site NU comunicăm numărul de zile, doar „trial gratuit".
-- ------------------------------------------------------------
alter table public.saloane
  add column if not exists trial_expira_la timestamptz;


-- ------------------------------------------------------------
-- 2. Nu mai există plan "starter"
--    Saloanele încep direct pe Basic, în trial, și pot urca la Pro/Business.
-- ------------------------------------------------------------
update public.saloane
set plan = 'basic'
where plan is null or plan not in ('basic', 'pro', 'business');

-- Saloanele vechi, fără trial înregistrat, primesc unul de acum înainte.
update public.saloane
set trial_expira_la = now() + interval '14 days'
where trial_expira_la is null;

-- De acum, doar cele trei planuri reale sunt acceptate.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'saloane_plan_check'
  ) then
    alter table public.saloane
      add constraint saloane_plan_check
      check (plan in ('basic', 'pro', 'business'));
  end if;
end $$;


-- ------------------------------------------------------------
-- 3. Verificare
-- ------------------------------------------------------------
select
  nume,
  plan,
  trial_expira_la::date as trial_pana_la,
  case when trial_expira_la > now() then 'în trial' else 'trial expirat' end as stare
from public.saloane
order by nume;
