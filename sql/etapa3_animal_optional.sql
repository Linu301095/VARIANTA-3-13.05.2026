-- ============================================================
--  CalyHub — Etapa 3 (Configurare animal · animalul devine opțional)
--  Rulează în Supabase → SQL Editor. Se poate rula de mai multe ori.
-- ============================================================

-- Până acum, formularul cerea TOATE datele animalului. Acum cerem doar
-- numele, specia și talia (de talie depinde prețul la grooming), iar restul
-- sunt opționale. Ca să putem salva profilul fără ele, coloanele trebuie
-- să accepte valoarea goală.
--
-- Notă: dacă o coloană e deja opțională, comanda nu face nimic și nu dă eroare.

alter table public.animale alter column sex       drop not null;
alter table public.animale alter column rasa      drop not null;
alter table public.animale alter column greutate  drop not null;
alter table public.animale alter column varsta    drop not null;
alter table public.animale alter column alergii   drop not null;


-- ------------------------------------------------------------
-- Verificare — coloanele care acceptă valori goale
-- ------------------------------------------------------------
select column_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'animale'
  and column_name in ('nume', 'specie', 'talie', 'sex', 'rasa', 'greutate', 'varsta', 'alergii')
order by column_name;

-- Ar trebui să vezi is_nullable = YES pentru sex, rasa, greutate, varsta, alergii.
-- Pentru nume, specie si talie nu conteaza — le cerem oricum in formular.
