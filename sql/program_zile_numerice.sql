-- ─────────────────────────────────────────────────────────────
-- Programul salonului: din „luni/deschis" în „1/activ"
--
-- Wizardul de înscriere salva zilele ca `luni`, `marti`, … cu câmpul
-- `deschis`. Agenda salonului și calendarul de rezervare citesc zilele
-- din JavaScript — `"1"` … `"6"`, duminica `"0"` — cu câmpul `activ`.
-- Nepotrivirea făcea ca programul ales la înscriere să fie ignorat, iar
-- salonul să rămână pe orarul implicit luni–vineri 09:00–18:00.
--
-- Wizardul scrie corect de acum. Fișierul ăsta repară rândurile vechi.
-- Rulează-l o singură dată; a doua oară nu mai are ce converti.
--
-- De rulat în Supabase → SQL Editor → New query → Run.
-- ─────────────────────────────────────────────────────────────

-- ── 1. Cine e afectat (rulează întâi asta, ca să vezi ce urmează) ──
select id, nume, oras, program
from public.saloane
where program ? 'luni';


-- ── 2. Conversia ──
update public.saloane s
set program = (
  select jsonb_object_agg(
    m.cheie_noua,
    jsonb_build_object(
      -- „deschis" devine „activ"; orele rămân cum erau
      'activ', coalesce((s.program -> m.cheie_veche ->> 'deschis')::boolean, false),
      'start', coalesce(s.program -> m.cheie_veche ->> 'start', '09:00'),
      'end',   coalesce(s.program -> m.cheie_veche ->> 'end',   '18:00')
    )
  )
  from (values
    ('luni', '1'), ('marti', '2'), ('miercuri', '3'), ('joi', '4'),
    ('vineri', '5'), ('sambata', '6'), ('duminica', '0')
  ) as m(cheie_veche, cheie_noua)
  where s.program ? m.cheie_veche
)
where jsonb_typeof(program) = 'object'
  and program ? 'luni';


-- ── 3. Verificare ──
-- „de_convertit" trebuie să fie 0. „convertite" = saloanele cu program
-- citibil; restul (0 din amândouă) n-au completat niciodată un program și
-- folosesc orarul implicit — e în regulă.
select
  count(*) filter (where program ? 'luni') as de_convertit,
  count(*) filter (where program ? '1')    as convertite,
  count(*)                                  as total_saloane
from public.saloane;
