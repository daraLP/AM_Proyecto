# Ruta de ejecución recomendada

> **POSCafé · Specs · Guía** · Índice general: `docs/specs/README.md`


```mermaid
flowchart LR
  A["D-12…D-19<br/>Expo Router + tipos + repo"] --> B["DEV-01…04<br/>cliente, auth, servicios, caché"]
  B --> C["DEV-05…08<br/>contador rápido + detalle"]
  C --> D["DEV-11…12<br/>inventario y formulario"]
  D --> E["DEV-15…16<br/>lista de compras"]
  E --> F["DEV-17…18<br/>mapa"]
  C --> G["QA-04…07<br/>pgTAP + concurrencia"]
  E --> H["DEV-19…21<br/>push"]
  F --> I["DEV-09…10, 22…25<br/>dashboard, reportes, perfil"]
  H --> J["DEV-26…27 y QA-14<br/>EAS + CI"]
  I --> J
```

**Orden sugerido:** (1) resolver ADR-01/03 y estabilizar autenticación; (2) contador rápido de extremo a extremo (es el diferenciador del producto); (3) inventario y formulario; (4) lista de compras; (5) mapa; (6) push; (7) dashboard, reportes y perfil; (8) EAS y CI. Las suites pgTAP (QA-04…07) pueden ejecutarse en paralelo desde el paso 2.
