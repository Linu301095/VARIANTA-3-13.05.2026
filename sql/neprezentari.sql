-- ─────────────────────────────────────────────────────────────
-- Neprezentările — status nou pentru programări
--
-- Până acum, când ora unei programări trecea, aplicația o marca automat
-- „finalizat". Un client care nu venea intra deci la **încasări**, iar
-- salonul își vedea cifrele umflate fără nicio cale de a le corecta.
--
-- Statusul `neprezentat` rezolvă asta: salonul apasă un buton în agendă,
-- programarea iese din încasări și clientul e numărat separat.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

-- Dacă pe coloana `status` există o restricție care enumeră valorile permise,
-- o refacem cu `neprezentat` inclus. Dacă nu există niciuna, blocul nu face
-- nimic — coloana e text liber și acceptă oricum noua valoare.
do $$
declare r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.programari'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%status%'
  loop
    execute format('alter table public.programari drop constraint %I', r.conname);
  end loop;

  alter table public.programari
    add constraint programari_status_check
    check (status in ('în așteptare', 'confirmat', 'finalizat', 'anulat', 'neprezentat'));
end $$;

-- Verificare: ar trebui să apară restricția, cu toate cele cinci valori.
select conname, pg_get_constraintdef(oid) as definitie
from pg_constraint
where conrelid = 'public.programari'::regclass and contype = 'c';
