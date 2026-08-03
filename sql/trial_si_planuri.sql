-- ============================================================
--  CalyHub — Trial gratuit, planuri reale, ciclul de viață al salonului
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
-- 2. Abonament plătit — devine true abia când integrăm Stripe.
--    Cât timp e false, salonul e considerat în trial (sau expirat).
-- ------------------------------------------------------------
alter table public.saloane
  add column if not exists abonament_activ boolean not null default false;


-- ------------------------------------------------------------
-- 3. Nu mai există plan "starter"
--    Saloanele încep pe Basic, în trial, și pot urca la Pro/Business.
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
-- 4. Verificare — starea fiecărui salon
-- ------------------------------------------------------------
select
  nume,
  plan,
  abonament_activ,
  trial_expira_la::date as trial_pana_la,
  case
    when abonament_activ then 'abonat'
    when trial_expira_la > now() then 'în trial'
    when trial_expira_la > now() - interval '30 days' then 'suspendat'
    else 'de șters'
  end as stare
from public.saloane
order by nume;
