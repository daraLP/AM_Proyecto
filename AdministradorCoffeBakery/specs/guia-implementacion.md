# Guía de implementación (resumen)

> **POSCafé · Specs · Guía** · Índice general: [`README.md`](README.md)
> Versión corta. Detalle completo en [`05-guia/GUIA_IMPLEMENTACION.md`](05-guia/GUIA_IMPLEMENTACION.md) y plan de trabajo en [`05-guia/ruta-de-ejecucion.md`](05-guia/ruta-de-ejecucion.md).

## Arranque rápido

```bash
# 1. Base de datos (local)
supabase start && supabase db reset        # migraciones + seed

# 2. Variables (.env)
EXPO_PUBLIC_SUPABASE_URL=…
EXPO_PUBLIC_SUPABASE_ANON_KEY=…

# 3. App
npm install
npx expo start                              # dispositivo físico / development build

# 4. Calidad
npm run lint && npm run typecheck && npx jest && npm run test:db
```

## Pasos críticos

| Paso | Nota |
|---|---|
| Primer registro | Será **administrador** |
| `app.json` | Reemplazar claves de Google Maps y `extra.eas.projectId` (`REEMPLAZA_…`) |
| Push | `supabase functions deploy notify-low-stock`, `supabase secrets set WEBHOOK_SECRET=…` y crear el Database Webhook (`lista_compras` · `INSERT`) con `x-webhook-secret` ❔ |
| Pruebas | `npm test` no ejecuta `__tests__/` (H-19): use `npx jest` |

## Riesgos al desplegar

H-02, H-06, H-07 y H-19 (ver [`estado-actual.md`](00-contexto/estado-actual.md)).
