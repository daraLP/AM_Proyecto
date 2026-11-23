-- =====================================================================
-- POSCafé · Migración 0002 · Endurecimiento de seguridad + lógica de negocio
-- Adaptada a tu esquema: perfiles, categorias, proveedores, insumos,
-- proveedor_insumos, movimientos_inventario, lista_compras
--
-- ANTES DE EJECUTAR:
--   1) Diagnóstico ya revisado: solo existe manejar_nuevo_usuario() + trigger
--      al_crear_usuario; no hay triggers en tablas públicas ni usuarios registrados.
--   2) Haz respaldo (Database > Backups) o prueba primero en un proyecto de prueba.
--   3) Tras ejecutar, registra TU cuenta primero desde la app: será el administrador.
--
-- Valores reales detectados en tu base (se respetan sus CHECK existentes):
--   perfiles.rol          : 'administrador' | 'barista'
--   movimientos.tipo      : 'entrada' | 'salida'   (cantidad siempre POSITIVA; la dirección la da `tipo`)
--   movimientos.motivo    : 'Compra recibida' | 'Uso en preparación' | 'Merma/Vencido'
--                           | 'Ajuste de inventario' | 'Otro'
--   lista_compras.estado  : 'pendiente' | 'comprado'
--   insumos.unidad_medida : 'kg' | 'litros' | 'unidades' | 'cajas'
-- =====================================================================

begin;

create schema if not exists private;

-- ---------------------------------------------------------------------
-- 0. Helper de rol (evita repetir el EXISTS y recursión en RLS)
-- ---------------------------------------------------------------------
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'administrador'
  );
$$;

-- ---------------------------------------------------------------------
-- 1. PERFILES: cerrar escalada de privilegios y habilitar gestión
-- ---------------------------------------------------------------------
alter table public.perfiles alter column rol set default 'barista';
alter table public.perfiles enable row level security;

drop policy if exists editar_propio_perfil      on public.perfiles;
drop policy if exists ver_propio_perfil         on public.perfiles;
drop policy if exists ver_perfiles              on public.perfiles;
drop policy if exists admin_gestiona_perfiles   on public.perfiles;

-- Todos los autenticados ven nombres (necesario para el historial)
create policy ver_perfiles on public.perfiles
  for select to authenticated using (true);

-- Cada usuario edita solo su fila (el rol queda protegido por trigger)
create policy editar_propio_perfil on public.perfiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- El administrador gestiona usuarios
create policy admin_gestiona_perfiles on public.perfiles
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

create or replace function private.proteger_rol() returns trigger
language plpgsql as $$
begin
  -- auth.uid() es NULL en SQL Editor / service_role: se permite (acceso administrativo)
  if new.rol is distinct from old.rol
     and (select auth.uid()) is not null
     and not public.es_admin() then
    raise exception 'No autorizado para cambiar el rol' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists perfiles_proteger_rol on public.perfiles;
create trigger perfiles_proteger_rol
  before update on public.perfiles
  for each row execute function private.proteger_rol();

-- Tu trigger auth.users.al_crear_usuario ya existe y llama a manejar_nuevo_usuario().
-- CORRECCIÓN DE SEGURIDAD: la versión original tomaba el rol de raw_user_meta_data->>'rol',
-- que el cliente controla (cualquiera podía registrarse como administrador con signUp).
-- Ahora el rol NUNCA viene del cliente: el primer usuario es administrador y el resto baristas.
create or replace function public.manejar_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nombre', ''), 'Sin nombre'),
    case when not exists (select 1 from public.perfiles) then 'administrador' else 'barista' end
  )
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function public.manejar_nuevo_usuario() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Defaults, CHECKs y NOT NULL
-- ---------------------------------------------------------------------
alter table public.perfiles               alter column creado_en set default now();
alter table public.proveedores            alter column creado_en set default now();
alter table public.insumos                alter column creado_en set default now();
alter table public.insumos                alter column actualizado_en set default now();
alter table public.movimientos_inventario alter column creado_en set default now();
alter table public.lista_compras          alter column creado_en set default now();

alter table public.categorias             alter column id set default gen_random_uuid();
alter table public.proveedores            alter column id set default gen_random_uuid();
alter table public.insumos                alter column id set default gen_random_uuid();
alter table public.movimientos_inventario alter column id set default gen_random_uuid();
alter table public.lista_compras          alter column id set default gen_random_uuid();

alter table public.insumos alter column stock_actual set default 0;
alter table public.insumos alter column stock_minimo set default 0;

-- Ya existen en tu base (no se duplican): perfiles_rol_check, insumos_unidad_medida_check,
-- lista_compras_estado_check, movimientos_inventario_{tipo,motivo,cantidad}_check.
-- Solo se agregan los que faltan. NOT VALID: aplican a filas nuevas sin revisar las viejas.
alter table public.insumos drop constraint if exists insumos_stock_chk;
alter table public.insumos add constraint insumos_stock_chk
  check (stock_actual >= 0 and stock_minimo >= 0) not valid;

alter table public.movimientos_inventario drop constraint if exists mov_saldo_chk;
alter table public.movimientos_inventario add constraint mov_saldo_chk
  check (saldo_resultante >= 0) not valid;

alter table public.lista_compras drop constraint if exists lc_cantidad_chk;
alter table public.lista_compras add constraint lc_cantidad_chk
  check (cantidad_sugerida > 0) not valid;

-- NOT NULL en llaves foráneas, solo si no hay filas con NULL
do $$
begin
  if not exists (select 1 from public.movimientos_inventario where insumo_id is null) then
    alter table public.movimientos_inventario alter column insumo_id set not null;
  end if;
  if not exists (select 1 from public.movimientos_inventario where usuario_id is null) then
    alter table public.movimientos_inventario alter column usuario_id set not null;
  end if;
  if not exists (select 1 from public.lista_compras where insumo_id is null) then
    alter table public.lista_compras alter column insumo_id set not null;
  end if;
end $$;

-- Las llaves foráneas ya existen. Único cambio: el historial NO debe borrarse en cascada
-- al eliminar un insumo (usa baja lógica: insumos.activo = false).
alter table public.movimientos_inventario drop constraint if exists movimientos_inventario_insumo_id_fkey;
alter table public.movimientos_inventario add constraint movimientos_inventario_insumo_id_fkey
  foreign key (insumo_id) references public.insumos(id) on delete restrict;

-- ---------------------------------------------------------------------
-- 3. Columnas, tablas e índices nuevos
-- ---------------------------------------------------------------------
alter table public.insumos add column if not exists activo boolean not null default true;
alter table public.insumos add column if not exists estado_stock text generated always as (
  case when stock_actual <= 0 then 'agotado'
       when stock_actual <= stock_minimo then 'bajo'
       else 'ok' end) stored;

alter table public.movimientos_inventario add column if not exists client_op_id uuid;

alter table public.lista_compras add column if not exists origen text not null default 'manual';
alter table public.lista_compras add column if not exists cantidad_comprada numeric;
alter table public.lista_compras add column if not exists comprado_por uuid references public.perfiles(id) on delete set null;
alter table public.lista_compras add column if not exists comprado_en timestamptz;
alter table public.lista_compras add column if not exists creado_por uuid references public.perfiles(id) on delete set null;
alter table public.lista_compras drop constraint if exists lc_origen_chk;
alter table public.lista_compras add constraint lc_origen_chk check (origen in ('auto','manual'));

create table if not exists public.push_tokens (
  id             uuid primary key default gen_random_uuid(),
  usuario_id     uuid not null references public.perfiles(id) on delete cascade,
  token          text not null unique,
  plataforma     text not null check (plataforma in ('ios','android')),
  actualizado_en timestamptz not null default now()
);
alter table public.push_tokens enable row level security;
drop policy if exists tokens_propios on public.push_tokens;
create policy tokens_propios on public.push_tokens for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

-- Índices
create unique index if not exists mov_client_op_uidx
  on public.movimientos_inventario (client_op_id) where client_op_id is not null;
create index if not exists mov_insumo_fecha_idx on public.movimientos_inventario (insumo_id, creado_en desc);
create index if not exists mov_fecha_idx        on public.movimientos_inventario (creado_en desc);
create index if not exists insumos_categoria_idx on public.insumos (categoria_id) where activo;
create index if not exists insumos_nombre_idx    on public.insumos (lower(nombre));
create index if not exists insumos_estado_idx    on public.insumos (estado_stock) where activo;
create index if not exists pi_insumo_idx         on public.proveedor_insumos (insumo_id);
-- Un solo pendiente por insumo (falla si ya hay duplicados: revisa la consulta de diagnóstico)
create unique index if not exists lc_un_pendiente_por_insumo
  on public.lista_compras (insumo_id) where estado = 'pendiente';

-- ---------------------------------------------------------------------
-- 4. RLS reescrito (admin vs barista)
-- ---------------------------------------------------------------------
alter table public.categorias             enable row level security;
alter table public.proveedores            enable row level security;
alter table public.insumos                enable row level security;
alter table public.proveedor_insumos      enable row level security;
alter table public.movimientos_inventario enable row level security;
alter table public.lista_compras          enable row level security;

-- Categorías
drop policy if exists admin_escribe_categorias        on public.categorias;
drop policy if exists lectura_autenticados_categorias on public.categorias;
create policy lectura_categorias on public.categorias for select to authenticated using (true);
create policy admin_escribe_categorias on public.categorias for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Proveedores
drop policy if exists admin_escribe_proveedores        on public.proveedores;
drop policy if exists lectura_autenticados_proveedores on public.proveedores;
create policy lectura_proveedores on public.proveedores for select to authenticated using (true);
create policy admin_escribe_proveedores on public.proveedores for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Insumos (el stock solo cambia por RPC; ver trigger proteger_stock)
drop policy if exists admin_escribe_insumos        on public.insumos;
drop policy if exists lectura_autenticados_insumos on public.insumos;
create policy lectura_insumos on public.insumos for select to authenticated
  using (activo or public.es_admin());
create policy admin_escribe_insumos on public.insumos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Proveedor-insumos
drop policy if exists admin_escribe_proveedor_insumos        on public.proveedor_insumos;
drop policy if exists lectura_autenticados_proveedor_insumos on public.proveedor_insumos;
create policy lectura_proveedor_insumos on public.proveedor_insumos for select to authenticated using (true);
create policy admin_escribe_proveedor_insumos on public.proveedor_insumos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Movimientos: solo lectura directa; la escritura es por RPC (SECURITY DEFINER)
drop policy if exists autenticados_insertan_movimientos on public.movimientos_inventario;
drop policy if exists lectura_autenticados_movimientos  on public.movimientos_inventario;
create policy lectura_movimientos on public.movimientos_inventario for select to authenticated using (true);

-- Lista de compras: todos leen y agregan manualmente; marcar comprado va por RPC
drop policy if exists autenticados_actualizan_lista_compras on public.lista_compras;
drop policy if exists autenticados_insertan_lista_compras   on public.lista_compras;
drop policy if exists lectura_autenticados_lista_compras    on public.lista_compras;
create policy lectura_lista_compras on public.lista_compras for select to authenticated using (true);
create policy insertar_lista_manual on public.lista_compras for insert to authenticated
  with check (origen = 'manual' and estado = 'pendiente' and creado_por = (select auth.uid()));
create policy admin_escribe_lista_compras on public.lista_compras for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ---------------------------------------------------------------------
-- 5. Lógica de negocio: funciones y triggers
-- ---------------------------------------------------------------------

-- 5.0 actualizado_en automático
create or replace function private.tocar_actualizado() returns trigger
language plpgsql as $$
begin new.actualizado_en := now(); return new; end $$;
drop trigger if exists insumos_tocar on public.insumos;
create trigger insumos_tocar before update on public.insumos
  for each row execute function private.tocar_actualizado();

-- 5.1 El stock solo cambia mediante movimientos (ni siquiera el admin por UPDATE directo)
create or replace function private.proteger_stock() returns trigger
language plpgsql as $$
begin
  if new.stock_actual is distinct from old.stock_actual
     and (select auth.uid()) is not null
     and coalesce(current_setting('app.aplicando_movimiento', true), '') <> 'on' then
    raise exception 'El stock solo puede modificarse registrando un movimiento'
      using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists insumos_proteger_stock on public.insumos;
create trigger insumos_proteger_stock before update of stock_actual on public.insumos
  for each row execute function private.proteger_stock();

-- 5.2 Núcleo atómico del contador rápido
create or replace function private.aplicar_movimiento(
  p_insumo_id uuid, p_delta numeric, p_motivo text,
  p_nota text, p_client_op_id uuid, p_usuario uuid
) returns public.movimientos_inventario
language plpgsql security definer set search_path = public as $$
declare
  v_stock numeric; v_nuevo numeric; v_tipo text; v_mov public.movimientos_inventario;
begin
  if p_delta = 0 then
    raise exception 'La cantidad no puede ser cero' using errcode = '22023';
  end if;
  if p_motivo not in ('Compra recibida','Uso en preparación','Merma/Vencido','Ajuste de inventario','Otro') then
    raise exception 'Motivo inválido' using errcode = '22023';
  end if;

  -- Idempotencia (reintentos desde la cola offline)
  if p_client_op_id is not null then
    select * into v_mov from public.movimientos_inventario where client_op_id = p_client_op_id;
    if found then return v_mov; end if;
  end if;

  -- Bloqueo de fila: serializa movimientos concurrentes
  select stock_actual into v_stock from public.insumos
   where id = p_insumo_id and activo for update;
  if not found then
    raise exception 'Insumo no encontrado' using errcode = 'P0002';
  end if;

  v_nuevo := v_stock + p_delta;
  if v_nuevo < 0 then
    raise exception 'stock_insuficiente' using errcode = '23514';
  end if;

  v_tipo := case when p_delta > 0 then 'entrada' else 'salida' end;

  perform set_config('app.aplicando_movimiento', 'on', true);
  update public.insumos set stock_actual = v_nuevo where id = p_insumo_id;  -- dispara trigger de stock bajo
  perform set_config('app.aplicando_movimiento', 'off', true);

  insert into public.movimientos_inventario
    (insumo_id, usuario_id, tipo, cantidad, motivo, nota, saldo_resultante, client_op_id)
  values (p_insumo_id, p_usuario, v_tipo, abs(p_delta), p_motivo, p_nota, v_nuevo, p_client_op_id)
  returning * into v_mov;

  return v_mov;
end $$;

-- Elimina la versión de 4 parámetros si ya la creaste (evita sobrecargas ambiguas en la API)
drop function if exists public.registrar_movimiento(uuid, numeric, text, text);

create or replace function public.registrar_movimiento(
  p_insumo_id uuid, p_delta numeric, p_motivo text,
  p_nota text default null, p_client_op_id uuid default null
) returns public.movimientos_inventario
language plpgsql security definer set search_path = public as $$
begin
  if (select auth.uid()) is null
     or not exists (select 1 from public.perfiles where id = (select auth.uid())) then
    raise exception 'No autenticado' using errcode = '42501';
  end if;
  return private.aplicar_movimiento(p_insumo_id, p_delta, p_motivo, p_nota, p_client_op_id, (select auth.uid()));
end $$;

-- 5.3 Trigger de stock bajo → lista de compras (el push sale del Webhook sobre INSERT)
create or replace function private.al_cambiar_stock() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.activo and new.stock_actual <= new.stock_minimo then
    insert into public.lista_compras (insumo_id, proveedor_id, cantidad_sugerida, estado, origen)
    values (new.id, new.proveedor_principal_id,
            greatest(new.stock_minimo * 2 - new.stock_actual, 1), 'pendiente', 'auto')
    on conflict (insumo_id) where estado = 'pendiente' do nothing;
  end if;
  return new;
end $$;

drop trigger if exists insumos_stock_bajo on public.insumos;
create trigger insumos_stock_bajo
  after update of stock_actual, stock_minimo on public.insumos
  for each row execute function private.al_cambiar_stock();

-- 5.4 Marcar comprado y reintegrar stock
create or replace function public.comprar_item(
  p_item_id uuid, p_cantidad numeric default null, p_client_op_id uuid default null
) returns public.lista_compras
language plpgsql security definer set search_path = public as $$
declare v_item public.lista_compras; v_qty numeric;
begin
  if (select auth.uid()) is null
     or not exists (select 1 from public.perfiles where id = (select auth.uid())) then
    raise exception 'No autenticado' using errcode = '42501';
  end if;

  select * into v_item from public.lista_compras where id = p_item_id for update;
  if not found then raise exception 'Ítem no encontrado' using errcode = 'P0002'; end if;
  if v_item.estado = 'comprado' then return v_item; end if;          -- idempotente
  if v_item.estado <> 'pendiente' then
    raise exception 'El ítem no está pendiente' using errcode = '22023';
  end if;

  v_qty := coalesce(p_cantidad, v_item.cantidad_sugerida);
  if v_qty <= 0 then raise exception 'Cantidad inválida' using errcode = '22023'; end if;

  -- Primero cerrar el ítem: si la compra no supera el mínimo, el trigger podrá crear otro pendiente
  update public.lista_compras
     set estado = 'comprado', cantidad_comprada = v_qty,
         comprado_por = (select auth.uid()), comprado_en = now()
   where id = p_item_id returning * into v_item;

  perform private.aplicar_movimiento(
    v_item.insumo_id, v_qty, 'Compra recibida', 'Compra desde lista de compras',
    p_client_op_id, (select auth.uid()));

  return v_item;
end $$;

-- 5.5 Proveedores cercanos (Haversine, sin PostGIS)
create or replace function public.proveedores_cercanos(
  p_lat double precision, p_lng double precision,
  p_radio_km double precision default 10, p_insumo_id uuid default null
) returns table (
  id uuid, nombre text, telefono text, direccion text,
  latitud double precision, longitud double precision, distancia_m double precision
)
language sql stable set search_path = public as $$
  with d as (
    select p.id, p.nombre, p.telefono, p.direccion, p.latitud, p.longitud,
           6371000 * 2 * asin(sqrt(
             power(sin(radians(p.latitud - p_lat) / 2), 2) +
             cos(radians(p_lat)) * cos(radians(p.latitud)) *
             power(sin(radians(p.longitud - p_lng) / 2), 2)
           )) as distancia_m
    from public.proveedores p
    where p.latitud is not null and p.longitud is not null
      and (p_insumo_id is null or exists (
            select 1 from public.proveedor_insumos pi
            where pi.proveedor_id = p.id and pi.insumo_id = p_insumo_id))
  )
  select * from d where distancia_m <= p_radio_km * 1000 order by distancia_m;
$$;

-- 5.6 Dashboard y reportes
create or replace function public.resumen_dashboard()
returns table (total int, bajo int, agotado int)
language sql stable set search_path = public as $$
  select count(*)::int,
         count(*) filter (where estado_stock = 'bajo')::int,
         count(*) filter (where estado_stock = 'agotado')::int
  from public.insumos where activo;
$$;

-- Salidas (uso + merma) por día; las unidades de medida difieren, por eso se cuentan movimientos
create or replace function public.consumo_semanal(p_dias int default 7, p_tz text default 'America/Mexico_City')
returns table (dia date, salidas int)
language sql stable set search_path = public as $$
  select d::date, count(m.id)::int
  from generate_series((now() at time zone p_tz)::date - (p_dias - 1),
                       (now() at time zone p_tz)::date, interval '1 day') d
  left join public.movimientos_inventario m
    on (m.creado_en at time zone p_tz)::date = d::date
   and m.tipo = 'salida' and m.motivo in ('Uso en preparación','Merma/Vencido')
  group by 1 order by 1;
$$;

create or replace function public.consumo_por_insumo(p_desde timestamptz, p_hasta timestamptz)
returns table (insumo_id uuid, nombre text, unidad_medida text, consumido numeric, merma numeric)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query
  select i.id, i.nombre, i.unidad_medida,
         coalesce(sum(m.cantidad) filter (where m.motivo = 'Uso en preparación'), 0),
         coalesce(sum(m.cantidad) filter (where m.motivo = 'Merma/Vencido'), 0)
  from public.insumos i
  left join public.movimientos_inventario m
    on m.insumo_id = i.id and m.creado_en >= p_desde and m.creado_en < p_hasta
  group by i.id order by 4 desc;
end $$;

-- Permisos de ejecución
revoke all on function public.registrar_movimiento(uuid, numeric, text, text, uuid) from public, anon;
revoke all on function public.comprar_item(uuid, numeric, uuid)                     from public, anon;
revoke all on function public.consumo_por_insumo(timestamptz, timestamptz)           from public, anon;
grant execute on function public.registrar_movimiento(uuid, numeric, text, text, uuid) to authenticated;
grant execute on function public.comprar_item(uuid, numeric, uuid)                     to authenticated;
grant execute on function public.consumo_por_insumo(timestamptz, timestamptz)           to authenticated;
grant execute on function public.proveedores_cercanos(double precision, double precision, double precision, uuid) to authenticated;
grant execute on function public.resumen_dashboard()                                    to authenticated;
grant execute on function public.consumo_semanal(int, text)                             to authenticated;

-- ---------------------------------------------------------------------
-- 6. Storage (fotos de insumos) y Realtime
--    Si ya tienes un bucket para fotos, cambia 'fotos-insumos' por su nombre.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-insumos', 'fotos-insumos', true, 2097152, '{image/jpeg,image/png,image/webp}')
on conflict (id) do nothing;

drop policy if exists fotos_insumos_lectura on storage.objects;
drop policy if exists fotos_insumos_admin   on storage.objects;
create policy fotos_insumos_lectura on storage.objects for select to authenticated
  using (bucket_id = 'fotos-insumos');
create policy fotos_insumos_admin on storage.objects for all to authenticated
  using (bucket_id = 'fotos-insumos' and public.es_admin())
  with check (bucket_id = 'fotos-insumos' and public.es_admin());

do $$
begin
  alter publication supabase_realtime add table public.insumos;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.lista_compras;
exception when duplicate_object then null;
end $$;

commit;
