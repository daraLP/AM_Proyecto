-- Datos de PRUEBA para un proyecto nuevo (ejecútalo en el SQL Editor DESPUÉS de las 3 migraciones).
-- Proveedores ubicados cerca de Ensenada, B.C. Cambia las coordenadas si quieres probar el mapa en otra ciudad.
-- El stock se inserta directo (como postgres); en la app todo cambio de stock va por registrar_movimiento.

insert into public.categorias (nombre) values ('Lácteos'), ('Café'), ('Desechables')
on conflict (nombre) do nothing;

insert into public.proveedores (nombre, telefono, direccion, latitud, longitud) values
  ('Distribuidora Centro', '646 111 2233', 'Av. Ruiz 100, Ensenada', 31.8650, -116.6030),
  ('Lácteos del Valle',    '646 444 5566', 'Carretera Tecate km 5', 31.9000, -116.6100),
  ('Proveedor sin ubicación', '646 000 0000', null, null, null);

insert into public.insumos (nombre, categoria_id, unidad_medida, stock_actual, stock_minimo, proveedor_principal_id)
select v.nombre, c.id, v.unidad, v.stock, v.minimo, p.id
from (values
  ('Leche entera',   'Lácteos',     'litros',   20, 5, 'Lácteos del Valle'),
  ('Café en grano',  'Café',        'kg',        8, 3, 'Distribuidora Centro'),
  ('Azúcar',         'Café',        'kg',        2, 4, 'Distribuidora Centro'),   -- ya en BAJO
  ('Vasos 12 oz',    'Desechables', 'cajas',     0, 2, 'Distribuidora Centro')    -- ya AGOTADO
) as v(nombre, cat, unidad, stock, minimo, prov)
join public.categorias c on c.nombre = v.cat
join public.proveedores p on p.nombre = v.prov;

insert into public.proveedor_insumos (proveedor_id, insumo_id)
select i.proveedor_principal_id, i.id from public.insumos i where i.proveedor_principal_id is not null
on conflict do nothing;

-- Genera los pendientes automáticos de los insumos que ya nacieron bajo/agotado
-- (el trigger corre al actualizar stock_minimo; si ya tienes el webhook, también enviará push).
update public.insumos set stock_minimo = stock_minimo where stock_actual <= stock_minimo;
