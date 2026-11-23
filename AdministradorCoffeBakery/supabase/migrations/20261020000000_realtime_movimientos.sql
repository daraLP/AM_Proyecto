-- =====================================================================
-- POSCafé · Migración 0004 · Realtime para movimientos
-- Permite que un perfil vea al instante lo que registra otro (historial y «Actividad del equipo»).
-- Idempotente: si la tabla ya está en la publicación, no hace nada.
-- =====================================================================
do $$
begin
  alter publication supabase_realtime add table public.movimientos_inventario;
exception when duplicate_object then null;
end $$;
