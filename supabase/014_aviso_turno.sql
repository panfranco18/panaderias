-- Vincula un aviso al turno que lo generó, para poder borrarlo en
-- cascada si el turno se elimina o se corrige.

alter table public.avisos_personal
  add column if not exists turno_id uuid references public.turnos_personal(id) on delete cascade;
