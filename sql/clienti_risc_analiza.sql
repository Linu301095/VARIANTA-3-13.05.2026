-- ============================================================
-- Clienți inactivi — analiza salvată (cross-device)
-- Înlocuiește cache-ul din localStorage. Un rând per salon.
-- De rulat o singură dată în Supabase → SQL Editor.
-- ============================================================

create table if not exists public.clienti_risc_analiza (
  salon_id    uuid primary key references public.saloane(id) on delete cascade,
  data        timestamptz not null default now(),
  clienti     jsonb not null default '[]'::jsonb,
  trimise     jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.clienti_risc_analiza enable row level security;

drop policy if exists "salon owner manages own risk analysis" on public.clienti_risc_analiza;
create policy "salon owner manages own risk analysis"
  on public.clienti_risc_analiza
  for all
  using (
    exists (
      select 1 from public.saloane s
      where s.id = clienti_risc_analiza.salon_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.saloane s
      where s.id = clienti_risc_analiza.salon_id
        and s.user_id = auth.uid()
    )
  );
