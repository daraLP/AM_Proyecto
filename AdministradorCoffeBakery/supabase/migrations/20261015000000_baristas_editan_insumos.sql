-- =====================================================================
-- POSCafé · Migración 0003 · Los baristas pueden crear y editar insumos
-- Cambia RN-10. Se mantienen las protecciones de integridad:
--   · stock_actual solo cambia por registrar_movimiento / comprar_item (trigger insumos_proteger_stock)
--   · los baristas no pueden desactivar ni borrar insumos
--   · los baristas solo crean insumos con stock 0 (el stock inicial se registra como movimiento)
-- =====================================================================

begin;

-- Crear insumos (solo con stock 0 y activos)
drop policy if exists baristas_crean_insumos on public.insumos;
create policy baristas_crean_insumos on public.insumos
  for insert to authenticated
  with check (
    stock_actual = 0
    and activo = true
    and exists (select 1 from public.perfiles where id = (select auth.uid()))
  );

-- Editar insumos activos; la fila resultante debe seguir activa (no pueden desactivar)
drop policy if exists baristas_editan_insumos on public.insumos;
create policy baristas_editan_insumos on public.insumos
  for update to authenticated
  using (
    activo = true
    and exists (select 1 from public.perfiles where id = (select auth.uid()))
  )
  with check (activo = true);

-- Fotos de insumos: los baristas pueden subir y reemplazar (no borrar)
drop policy if exists fotos_insumos_baristas_subir on storage.objects;
create policy fotos_insumos_baristas_subir on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos-insumos');

drop policy if exists fotos_insumos_baristas_actualizar on storage.objects;
create policy fotos_insumos_baristas_actualizar on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos-insumos')
  with check (bucket_id = 'fotos-insumos');

commit;

