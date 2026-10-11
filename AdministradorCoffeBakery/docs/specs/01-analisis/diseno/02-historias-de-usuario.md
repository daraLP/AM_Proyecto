# Fase 1 · Análisis: Historias de usuario y criterios de aceptación clave

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: `docs/specs/README.md`


| ID | Historia | Criterios (Dado/Cuando/Entonces) |
|---|---|---|
| HU-01 | Como barista quiero restar stock con un gesto para registrar el uso sin llenar formularios. | **CA-01** Dado un insumo con stock 10, cuando resto 6 con motivo «Uso en preparación», entonces el stock es 4 y el historial muestra saldo 4. **CA-02** Cuando intento restar más que el stock, entonces veo un mensaje y el stock no cambia. |
| HU-02 | Como dueño quiero ser avisado cuando algo se acaba. | **CA-03** Cuando el stock cruza el mínimo, entonces aparece un solo ítem pendiente y llega una notificación. **CA-04** Dos movimientos bajo el mínimo no duplican el ítem. |
| HU-03 | Como encargado quiero marcar una compra y que se reponga el stock. | **CA-05** Cuando confirmo la compra de 6, entonces el stock sube 6 y el ítem queda «comprado». **CA-06** Confirmar dos veces no suma dos veces. |
| HU-04 | Como administrador quiero que nadie se autopromueva. | **CA-07** Un `signUp` con `rol: 'administrador'` crea un barista. **CA-08** Un barista no puede cambiar su rol. |
| HU-05 | Como barista quiero ver proveedores cercanos. | **CA-09** Con permiso, el mapa muestra proveedores ordenados por distancia. **CA-10** Sin permiso, la app sigue funcionando. |
