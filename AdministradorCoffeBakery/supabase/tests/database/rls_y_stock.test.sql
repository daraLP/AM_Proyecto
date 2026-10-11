begin;
select plan(24);

-- ── Fixtures (como postgres: auth.uid() es NULL y los triggers de protección lo permiten) ──
insert into auth.users (id, aud, role, email, raw_user_meta_data) values
  ('a0000000-0000-0000-0000-000000000001','authenticated','authenticated','admin@test.com',  '{"nombre":"Admin"}'),
  ('b0000000-0000-0000-0000-000000000002','authenticated','authenticated','barista@test.com','{"nombre":"Barista"}'),
  ('c0000000-0000-0000-0000-000000000003','authenticated','authenticated','intruso@test.com','{"nombre":"Intruso","rol":"administrador"}');

update public.perfiles set rol = 'administrador' where id = 'a0000000-0000-0000-0000-000000000001';
update public.perfiles set rol = 'barista'       where id = 'b0000000-0000-0000-0000-000000000002';

insert into public.insumos (id, nombre, unidad_medida, stock_minimo)
values ('d0000000-0000-0000-0000-0000000000d1', 'Leche test', 'litros', 5);

insert into public.proveedores (nombre, latitud, longitud) values
  ('Cerca', 32.51, -117.0), ('Lejos', 32.90, -117.0);

-- 1) El alta ignora el rol enviado por el cliente (vulnerabilidad corregida)
select is((select rol from public.perfiles where id = 'c0000000-0000-0000-0000-000000000003'),
          'barista', 'signUp con rol=administrador en metadata crea un barista');

-- ── Sesión de BARISTA ──
do $$ begin
  perform set_config('request.jwt.claim.sub', 'b0000000-0000-0000-0000-000000000002', true);
  perform set_config('request.jwt.claims',
    '{"sub":"b0000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
end $$;
set local role authenticated;

-- 2) Un barista no se autopromueve
select throws_ok($$ update public.perfiles set rol = 'administrador'
                    where id = 'b0000000-0000-0000-0000-000000000002' $$,
                 '42501', null, 'barista no puede cambiar su rol');

-- 3-4) Entrada de 10
select lives_ok($$ select public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1',
                   10, 'Compra recibida', 'test', 'e0000000-0000-0000-0000-000000000001') $$,
                'registrar entrada');
select is((select stock_actual from public.insumos where id = 'd0000000-0000-0000-0000-0000000000d1'),
          10::numeric, 'stock = 10 tras la entrada');

-- 5-6) Salida de 6 → stock 4 → estado "bajo"
select lives_ok($$ select public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1',
                   -6, 'Uso en preparación', null, 'e0000000-0000-0000-0000-000000000002') $$,
                'registrar salida');
select is((select estado_stock from public.insumos where id = 'd0000000-0000-0000-0000-0000000000d1'),
          'bajo', 'estado_stock = bajo');

-- 7) El trigger creó exactamente un pendiente automático
select is((select count(*)::int from public.lista_compras
            where insumo_id = 'd0000000-0000-0000-0000-0000000000d1'
              and estado = 'pendiente' and origen = 'auto'),
          1, 'un pendiente automático');

-- 8-9) Otra salida no duplica el pendiente
select lives_ok($$ select public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1',
                   -1, 'Uso en preparación', null, 'e0000000-0000-0000-0000-000000000003') $$,
                'segunda salida');
select is((select count(*)::int from public.lista_compras
            where insumo_id = 'd0000000-0000-0000-0000-0000000000d1' and estado = 'pendiente'),
          1, 'sigue habiendo un único pendiente');

-- 10-11) Stock insuficiente: error y sin cambios (atomicidad)
select throws_ok($$ select public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1',
                    -100, 'Uso en preparación') $$,
                 '23514', null, 'rechaza stock negativo');
select is((select stock_actual from public.insumos where id = 'd0000000-0000-0000-0000-0000000000d1'),
          3::numeric, 'el stock no cambió tras el fallo');

-- 12) Motivo inválido
select throws_ok($$ select public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1',
                    1, 'motivo inventado') $$,
                 '22023', null, 'rechaza motivo inválido');

-- 13) Insert directo en movimientos denegado por RLS
select throws_ok($$ insert into public.movimientos_inventario
                    (insumo_id, usuario_id, tipo, cantidad, motivo, saldo_resultante)
                    values ('d0000000-0000-0000-0000-0000000000d1',
                            'b0000000-0000-0000-0000-000000000002', 'entrada', 1, 'Otro', 1) $$,
                 '42501', null, 'no hay INSERT directo en movimientos');

-- 14) Un barista no crea insumos
select throws_ok($$ insert into public.insumos (nombre, unidad_medida) values ('X', 'kg') $$,
                 '42501', null, 'barista no inserta insumos');

-- 15-16) Idempotencia: misma operación dos veces = un solo movimiento y un solo efecto
select is((select (public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1',
                   1, 'Otro', null, 'e0000000-0000-0000-0000-000000000010')).id),
          (select (public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1',
                   1, 'Otro', null, 'e0000000-0000-0000-0000-000000000010')).id),
          'la misma operación devuelve el mismo movimiento');
select is((select stock_actual from public.insumos where id = 'd0000000-0000-0000-0000-0000000000d1'),
          4::numeric, 'el stock se aplicó una sola vez');

-- ── Sesión de ADMINISTRADOR ──
do $$ begin
  perform set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
  perform set_config('request.jwt.claims',
    '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
end $$;

-- 17) Ni el administrador puede editar el stock directamente
select throws_ok($$ update public.insumos set stock_actual = 999
                    where id = 'd0000000-0000-0000-0000-0000000000d1' $$,
                 '42501', null, 'UPDATE directo de stock bloqueado');

-- 18-19) Compra: cierra el ítem y reintegra (sugerido = 2*5 - 4 = 6)
select lives_ok($$ select public.comprar_item(
                     (select id from public.lista_compras
                       where insumo_id = 'd0000000-0000-0000-0000-0000000000d1' and estado = 'pendiente')) $$,
                'comprar_item');
select is((select stock_actual from public.insumos where id = 'd0000000-0000-0000-0000-0000000000d1'),
          10::numeric, 'stock reintegrado a 10');

-- 20-21) Comprar de nuevo no suma otra vez
select lives_ok($$ select public.comprar_item(
                     (select id from public.lista_compras
                       where insumo_id = 'd0000000-0000-0000-0000-0000000000d1' and estado = 'comprado' limit 1)) $$,
                'comprar_item repetido');
select is((select stock_actual from public.insumos where id = 'd0000000-0000-0000-0000-0000000000d1'),
          10::numeric, 'no se suma dos veces');

-- ── De nuevo BARISTA ──
do $$ begin
  perform set_config('request.jwt.claim.sub', 'b0000000-0000-0000-0000-000000000002', true);
  perform set_config('request.jwt.claims',
    '{"sub":"b0000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
end $$;

-- 22) Los reportes son solo para administradores
select throws_ok($$ select * from public.consumo_por_insumo(now() - interval '1 day', now()) $$,
                 '42501', null, 'barista no ejecuta consumo_por_insumo');

-- 23-24) Haversine: orden por distancia y filtro por radio
select is((select nombre from public.proveedores_cercanos(32.5, -117.0, 50) limit 1),
          'Cerca', 'el más cercano va primero');
select is((select count(*)::int from public.proveedores_cercanos(32.5, -117.0, 10)),
          1, 'el radio de 10 km excluye al lejano');

select * from finish();
rollback;
