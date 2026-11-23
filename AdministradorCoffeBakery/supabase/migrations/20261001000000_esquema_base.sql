-- =====================================================================
-- POSCafé · Migración 0001 · Esquema base
-- Reconstruido a partir de los tipos generados y de lo que asume la 0002.
-- Para un proyecto Supabase NUEVO. Si tu proyecto ya tiene estas tablas, NO la ejecutes.
-- Las constraints llevan los nombres que menciona la 0002.
-- =====================================================================
begin;

create table if not exists public.perfiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  nombre    text not null,
  rol       text not null default 'barista',
  creado_en timestamptz default now(),
  constraint perfiles_rol_check check (rol in ('administrador', 'barista'))
);

create table if not exists public.categorias (
  id     uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table if not exists public.proveedores (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  telefono  text,
  direccion text,
  latitud   double precision,
  longitud  double precision,
  creado_en timestamptz default now()
);

create table if not exists public.insumos (
  id                     uuid primary key default gen_random_uuid(),
  nombre                 text not null,
  categoria_id           uuid references public.categorias(id),
  unidad_medida          text not null,
  stock_actual           numeric not null default 0,
  stock_minimo           numeric not null default 0,
  proveedor_principal_id uuid references public.proveedores(id),
  foto_url               text,
  creado_en              timestamptz default now(),
  actualizado_en         timestamptz default now(),
  constraint insumos_unidad_medida_check
    check (unidad_medida in ('kg', 'litros', 'unidades', 'cajas'))
);

create table if not exists public.proveedor_insumos (
  proveedor_id uuid not null references public.proveedores(id) on delete cascade,
  insumo_id    uuid not null references public.insumos(id) on delete cascade,
  primary key (proveedor_id, insumo_id)
);

create table if not exists public.movimientos_inventario (
  id               uuid primary key default gen_random_uuid(),
  insumo_id        uuid references public.insumos(id) on delete cascade,
  usuario_id       uuid references public.perfiles(id),
  tipo             text not null,
  cantidad         numeric not null,
  motivo           text not null,
  nota             text,
  saldo_resultante numeric not null,
  creado_en        timestamptz default now(),
  constraint movimientos_inventario_tipo_check check (tipo in ('entrada', 'salida')),
  constraint movimientos_inventario_cantidad_check check (cantidad > 0),
  constraint movimientos_inventario_motivo_check check (motivo in
    ('Compra recibida', 'Uso en preparación', 'Merma/Vencido', 'Ajuste de inventario', 'Otro'))
);

create table if not exists public.lista_compras (
  id                uuid primary key default gen_random_uuid(),
  insumo_id         uuid references public.insumos(id),
  proveedor_id      uuid references public.proveedores(id),
  cantidad_sugerida numeric not null,
  estado            text not null default 'pendiente',
  creado_en         timestamptz default now(),
  constraint lista_compras_estado_check check (estado in ('pendiente', 'comprado'))
);

-- Alta de perfil al registrarse (la 0002 reemplaza esta función por la versión segura)
create or replace function public.manejar_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'nombre', ''), 'Sin nombre'))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.manejar_nuevo_usuario();

-- RLS activado desde el inicio (sin políticas = nadie accede hasta que la 0002 las crea)
alter table public.perfiles               enable row level security;
alter table public.categorias             enable row level security;
alter table public.proveedores            enable row level security;
alter table public.insumos                enable row level security;
alter table public.proveedor_insumos      enable row level security;
alter table public.movimientos_inventario enable row level security;
alter table public.lista_compras          enable row level security;

commit;
