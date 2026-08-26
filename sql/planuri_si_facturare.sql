-- ─────────────────────────────────────────────────────────────
-- Planul salonului: ciclu de facturare, jurnal, pregătire pentru Stripe
--
-- Regula stabilită (21.08.2026): în trial salonul stă pe un plan real și se
-- poate muta liber între ele, oricând, fără card. Ce vede în aplicație e exact
-- ce dă planul pe care e în clipa aia. La finalul trialului îi propunem planul
-- pe care se află — atât, fără socoteli pe care nu i le poți explica.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

-- ------------------------------------------------------------
-- 1. Ciclul de facturare — lunar sau anual
--
--    Pe pagina de planuri există comutatorul Lunar / Anual cu −17%. Omul
--    alegea „anual", apăsa, și alegerea **se pierdea**: nu exista nicio
--    coloană. E o promisiune de preț pe care n-o rețineam.
-- ------------------------------------------------------------
alter table public.saloane
  add column if not exists ciclu text not null default 'lunar';

alter table public.saloane
  drop constraint if exists saloane_ciclu_check;

alter table public.saloane
  add constraint saloane_ciclu_check
  check (ciclu in ('lunar', 'anual'));


-- ------------------------------------------------------------
-- 2. Câmpurile Stripe — goale până când integrăm plățile
--
--    Le adăugăm acum ca webhook-ul să aibă unde scrie fără o migrare făcută
--    în grabă, în ziua în care primul salon vrea să plătească.
--
--    `abonament_activ` (din trial_si_planuri.sql) rămâne comutatorul simplu
--    pe care îl citește lib/trial.ts; astea sunt detaliile din spate.
-- ------------------------------------------------------------
alter table public.saloane add column if not exists stripe_customer_id text;
alter table public.saloane add column if not exists stripe_subscription_id text;
alter table public.saloane add column if not exists plan_status text;
alter table public.saloane add column if not exists plan_expira_la timestamptz;

create unique index if not exists saloane_stripe_customer_idx
  on public.saloane (stripe_customer_id)
  where stripe_customer_id is not null;


-- ------------------------------------------------------------
-- 3. Jurnalul schimbărilor de plan
--
--    Două motive, amândouă practice:
--
--    a) La prima dispută despre facturare o să vrei să știi ce a ales omul și
--       când. Fără jurnal, `saloane.plan` arată doar starea de acum.
--    b) După primele 20 de saloane îți spune dacă lumea urcă sau coboară în
--       trial — informație pe care n-o poți recupera retroactiv dacă n-o scrii
--       de la început.
-- ------------------------------------------------------------
create table if not exists public.plan_istoric (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.saloane(id) on delete cascade,
  plan_vechi text,
  plan_nou text not null,
  ciclu text,
  -- „trial" | „abonat" | „expirat" — în ce moment de viață era salonul.
  stare text,
  schimbat_la timestamptz not null default now()
);

create index if not exists plan_istoric_salon_idx
  on public.plan_istoric (salon_id, schimbat_la desc);

alter table public.plan_istoric enable row level security;

-- Salonul își vede propriul jurnal și poate adăuga rânduri (schimbă planul).
drop policy if exists "salon citeste plan_istoric" on public.plan_istoric;
create policy "salon citeste plan_istoric" on public.plan_istoric
  for select to authenticated
  using (exists (
    select 1 from public.saloane s
    where s.id = plan_istoric.salon_id and s.user_id = auth.uid()
  ));

drop policy if exists "salon scrie plan_istoric" on public.plan_istoric;
create policy "salon scrie plan_istoric" on public.plan_istoric
  for insert to authenticated
  with check (exists (
    select 1 from public.saloane s
    where s.id = plan_istoric.salon_id and s.user_id = auth.uid()
  ));

-- Adminul vede tot (funcția vine din admin_scrie_saloane.sql).
drop policy if exists "admin citeste plan_istoric" on public.plan_istoric;
create policy "admin citeste plan_istoric" on public.plan_istoric
  for select to authenticated
  using (public.este_admin());


-- ------------------------------------------------------------
-- 4. Verificare
-- ------------------------------------------------------------
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'saloane'
  and column_name in ('ciclu', 'stripe_customer_id', 'stripe_subscription_id', 'plan_status', 'plan_expira_la')
order by column_name;
