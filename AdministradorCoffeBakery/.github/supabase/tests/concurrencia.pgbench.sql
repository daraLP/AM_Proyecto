BEGIN;
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
SELECT set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
SET LOCAL ROLE authenticated;
SELECT public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1', -1, 'Uso en preparación');
COMMIT;
