-- ============================================================
-- Consultant AI — istoricul conversațiilor (un rând per salon)
-- De rulat o singură dată în Supabase → SQL Editor.
-- ============================================================

create table if not exists public.consultant_conversatii (
  salon_id    uuid primary key references public.saloane(id) on delete cascade,
  mesaje      jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.consultant_conversatii enable row level security;

-- Doar proprietarul salonului (saloane.user_id == auth.uid())
-- poate citi/scrie conversația salonului său.
drop policy if exists "salon owner manages own consultant chat" on public.consultant_conversatii;
create policy "salon owner manages own consultant chat"
  on public.consultant_conversatii
  for all
  using (
    exists (
      select 1 from public.saloane s
      where s.id = consultant_conversatii.salon_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.saloane s
      where s.id = consultant_conversatii.salon_id
        and s.user_id = auth.uid()
    )
  );
