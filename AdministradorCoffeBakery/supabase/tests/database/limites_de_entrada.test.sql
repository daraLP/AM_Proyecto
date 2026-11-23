-- pgTAP · Migración 0005 (límites de entrada). Ejecutar con: supabase test db
begin;
select plan(7);

select throws_ok($$ insert into public.insumos (nombre, unidad_medida) values (repeat('a', 200), 'kg') $$,
                 '23514', null, 'insumo con nombre de 200 letras se rechaza');
select throws_ok($$ insert into public.insumos (nombre, unidad_medida) values ('   ', 'kg') $$,
                 '23514', null, 'insumo con nombre vacío (solo espacios) se rechaza');
select throws_ok($$ insert into public.insumos (nombre, unidad_medida, stock_minimo) values ('Tope', 'kg', 1000000) $$,
                 '23514', null, 'stock mínimo sobre el tope se rechaza');
select throws_ok($$ insert into public.categorias (nombre) values (repeat('c', 41)) $$,
                 '23514', null, 'categoría de 41 caracteres se rechaza');
select throws_ok($$ insert into public.proveedores (nombre, latitud, longitud) values ('Mal', 120, 0) $$,
                 '23514', null, 'latitud fuera de rango se rechaza');
select lives_ok($$ insert into public.insumos (nombre, unidad_medida) values (repeat('a', 80), 'kg') $$,
                'nombre de exactamente 80 letras sí pasa');
select lives_ok($$ insert into public.proveedores (nombre, telefono, direccion)
                   values ('Ok', '646 111 2233', repeat('d', 200)) $$,
                'proveedor con datos en el límite sí pasa');

select * from finish();
rollback;
