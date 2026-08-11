-- ─────────────────────────────────────────────────────────────
-- Închiderea contului de client
--
-- Regula stabilită (11.08.2026, varianta B): datele personale se șterg,
-- dar recenziile rămân — fără nume, fără poză, fără legătură cu persoana.
-- Altfel un salon ar pierde reputația construită într-un an fiindcă zece
-- clienți și-au închis contul, iar un client supărat și-ar putea șterge
-- contul special ca să strice media unui salon.
--
-- O recenzie fără nume, fără poză și fără cale înapoi la cont nu mai e
-- dată cu caracter personal, deci păstrarea ei e în regulă și față de GDPR.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- Se poate rula de mai multe ori fără efect secundar.
-- ─────────────────────────────────────────────────────────────

-- Momentul închiderii. Cât timp e completat, contul nu mai poate fi folosit:
-- la conectare aplicația îl deconectează imediat și îi spune de ce.
alter table public.profiluri
  add column if not exists sters_la timestamptz;

-- Recenzia rămâne, dar se afișează ca „Client CalyHub".
alter table public.recenzii
  add column if not exists autor_anonim boolean not null default false;

-- Verificare: ar trebui să apară amândouă coloanele.
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'profiluri' and column_name = 'sters_la')
    or (table_name = 'recenzii' and column_name = 'autor_anonim')
  )
order by table_name;
