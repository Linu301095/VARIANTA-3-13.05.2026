-- ============================================================
-- Consultant AI — rapoarte premium cache-uite + contor lunar întrebări
-- Refactorizare din chat → generator de rapoarte (cost controlat).
-- De rulat o singură dată în Supabase → SQL Editor.
-- ============================================================

-- 1) Rapoartele generate, cache-uite per salon / tip / lună.
--    Un raport se genereaza o data pe luna; redeschiderea il citeste din cache.
create table if not exists public.consultant_rapoarte (
  salon_id    uuid not null references public.saloane(id) on delete cascade,
  tip         text not null,            -- "lunar" | "preturi" | "crestere" | "echipa"
  perioada    text not null,            -- "2026-06" (anul-luna)
  continut    text not null,
  created_at  timestamptz not null default now(),
  primary key (salon_id, tip, perioada)
);

alter table public.consultant_rapoarte enable row level security;

drop policy if exists "salon owner manages own reports" on public.consultant_rapoarte;
create policy "salon owner manages own reports"
  on public.consultant_rapoarte
  for all
  using (
    exists (select 1 from public.saloane s
            where s.id = consultant_rapoarte.salon_id and s.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.saloane s
            where s.id = consultant_rapoarte.salon_id and s.user_id = auth.uid())
  );

-- 2) Contor LUNAR de întrebări libere (max 5/lună).
--    Reutilizam tabelul consultant_utilizare, dar cheia `zi` = prima zi din luna.
create or replace function public.consultant_intreaba(p_salon_id uuid)
returns int
language plpgsql
security invoker
as $$
declare
  v_total int;
  v_luna  date := date_trunc('month', current_date)::date;
begin
  insert into public.consultant_utilizare (salon_id, zi, intrebari)
  values (p_salon_id, v_luna, 1)
  on conflict (salon_id, zi)
  do update set intrebari = public.consultant_utilizare.intrebari + 1
  returning intrebari into v_total;
  return v_total;
end;
$$;
