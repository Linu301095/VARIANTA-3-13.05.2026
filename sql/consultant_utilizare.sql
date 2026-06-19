-- ============================================================
-- Consultant AI — contor zilnic de întrebări (cross-device)
-- Înlocuiește numărătoarea din localStorage. Un rând per salon/zi.
-- De rulat o singură dată în Supabase → SQL Editor.
-- ============================================================

create table if not exists public.consultant_utilizare (
  salon_id   uuid not null references public.saloane(id) on delete cascade,
  zi         date not null default current_date,
  intrebari  int  not null default 0,
  primary key (salon_id, zi)
);

alter table public.consultant_utilizare enable row level security;

drop policy if exists "salon owner manages own consultant usage" on public.consultant_utilizare;
create policy "salon owner manages own consultant usage"
  on public.consultant_utilizare
  for all
  using (
    exists (
      select 1 from public.saloane s
      where s.id = consultant_utilizare.salon_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.saloane s
      where s.id = consultant_utilizare.salon_id
        and s.user_id = auth.uid()
    )
  );

-- Incrementare atomica a contorului (evita race conditions intre dispozitive).
-- Returneaza noul total de intrebari pe ziua curenta.
create or replace function public.consultant_incrementeaza(p_salon_id uuid)
returns int
language plpgsql
security invoker
as $$
declare
  v_total int;
begin
  insert into public.consultant_utilizare (salon_id, zi, intrebari)
  values (p_salon_id, current_date, 1)
  on conflict (salon_id, zi)
  do update set intrebari = public.consultant_utilizare.intrebari + 1
  returning intrebari into v_total;
  return v_total;
end;
$$;
