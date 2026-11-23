-- =====================================================================
-- POSCafé · Migración 0005 · Límites de entrada (casos límite)
-- La app ya recorta y valida los textos y cantidades, pero la base de datos es la autoridad:
-- un cliente modificado (o un bug) no debe poder guardar nombres de 10 000 letras
-- ni cantidades que desborden numeric. NOT VALID: aplican a filas nuevas sin revisar las viejas.
-- =====================================================================
begin;

alter table public.insumos drop constraint if exists insumos_nombre_chk;
alter table public.insumos add constraint insumos_nombre_chk
  check (char_length(btrim(nombre)) between 2 and 80) not valid;

alter table public.insumos drop constraint if exists insumos_stock_max_chk;
alter table public.insumos add constraint insumos_stock_max_chk
  check (stock_actual <= 999999 and stock_minimo <= 999999) not valid;

alter table public.categorias drop constraint if exists categorias_nombre_chk;
alter table public.categorias add constraint categorias_nombre_chk
  check (char_length(btrim(nombre)) between 2 and 40) not valid;

alter table public.proveedores drop constraint if exists proveedores_texto_chk;
alter table public.proveedores add constraint proveedores_texto_chk
  check (
    char_length(btrim(nombre)) between 2 and 80
    and (telefono  is null or char_length(telefono)  <= 20)
    and (direccion is null or char_length(direccion) <= 200)
  ) not valid;

alter table public.proveedores drop constraint if exists proveedores_coordenadas_chk;
alter table public.proveedores add constraint proveedores_coordenadas_chk
  check (
    (latitud  is null or latitud  between -90  and 90)
    and (longitud is null or longitud between -180 and 180)
  ) not valid;

alter table public.perfiles drop constraint if exists perfiles_nombre_chk;
alter table public.perfiles add constraint perfiles_nombre_chk
  check (char_length(nombre) between 1 and 60) not valid;

alter table public.movimientos_inventario drop constraint if exists mov_nota_chk;
alter table public.movimientos_inventario add constraint mov_nota_chk
  check (nota is null or char_length(nota) <= 200) not valid;

alter table public.lista_compras drop constraint if exists lc_cantidad_max_chk;
alter table public.lista_compras add constraint lc_cantidad_max_chk
  check (cantidad_sugerida <= 999999 and (cantidad_comprada is null or cantidad_comprada <= 999999)) not valid;

-- El alta de usuario recorta el nombre (el cliente podría mandar metadata más larga que el CHECK)
create or replace function public.manejar_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data->>'nombre'), ''), 'Sin nombre'), 60),
    case when not exists (select 1 from public.perfiles) then 'administrador' else 'barista' end
  )
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function public.manejar_nuevo_usuario() from public, anon, authenticated;

-- Un movimiento no puede superar el tope (evita desbordes numéricos antes de tocar el stock)
create or replace function private.validar_delta() returns trigger
language plpgsql as $$
begin
  if new.cantidad > 999999 then
    raise exception 'La cantidad supera el máximo permitido' using errcode = '22003';
  end if;
  return new;
end $$;
drop trigger if exists mov_validar_delta on public.movimientos_inventario;
create trigger mov_validar_delta before insert on public.movimientos_inventario
  for each row execute function private.validar_delta();

commit;
