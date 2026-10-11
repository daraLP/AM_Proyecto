# Fase 3 · Desarrollo: `QuickCounter` (stepper + chips)

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: `docs/specs/README.md`


```ts
interface QuickCounterProps {
  stockActual: number;
  unidad: UnidadMedida;
  incrementos: number[];                 // por defecto [1, 5, 10]; configurable en Perfil
  onChangeDelta: (delta: number) => void; // delta con signo (+ entrada, − salida)
  disabled?: boolean;
}
```

| Comportamiento | Regla |
|---|---|
| Botones −/+ | Cambian el delta en 1 (con *haptics*); botón ≥ 56 pt |
| Campo numérico | Editable, acepta coma o punto, hasta 3 decimales; vacío = 0 |
| Chips | Toque = suma `+n`; pulsación larga = resta `−n` |
| Límite inferior | `delta ≥ -stockActual` (RN-01); el resultado proyectado se muestra siempre («Quedará: 4 litros») |
| Límite superior | Valor máximo configurable (p. ej. 999 999) |
| Confirmar | Deshabilitado si `delta = 0` |
| Accesibilidad | `accessibilityLabel` «Restar» / «Sumar»; el resultado proyectado se anuncia |

**`MovimientoModal`:** genera `opId = generarUuid()` al montarse y lo reutiliza en reintentos. Muestra `ReasonChips` (los 5 motivos de `MOTIVOS`, selección única; «Otro» habilita `nota`). Al confirmar llama a `registrarMovimiento`, deshabilita el botón mientras corre y maneja los errores del contrato.
