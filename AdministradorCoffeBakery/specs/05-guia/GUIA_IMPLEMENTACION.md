# Guía de implementación

> **POSCafé · Specs · Guía** · Índice general: [`../README.md`](../README.md)
> Cómo reproducir el entorno y poner en marcha el sistema tal como está en el código. Los pasos que dependen de archivos no incluidos en el volcado (`config.toml`, `.env.example`, `ci.yml`, configuración del webhook) se marcan ❔.

## 1. Requisitos

| Herramienta | Uso |
|---|---|
| Node.js (versión compatible con Expo 58) y npm | Dependencias y scripts |
| Expo CLI (`npx expo`) y EAS CLI (`>= 16.0.0` según `eas.json`) | Ejecución y *builds* |
| Supabase CLI (`^3.2`) | Migraciones, pgTAP y Edge Function |
| Docker | `supabase start` (entorno local) |
| Proyecto Supabase | Auth, PostgREST, Realtime, Storage, Functions |
| Dispositivo físico | Push; `react-native-maps` y `expo-notifications` requieren *development build* (no Expo Go) |
| `pgbench` (opcional) | Prueba de estrés |

## 2. Base de datos

### 2.1 Migraciones (en orden cronológico)

| # | Archivo | Contenido |
|---|---|---|
| 0001 | `20261001000000_esquema_base.sql` | Tablas base, restricciones e índices (reconstruido desde los tipos generados) |
| 0002 | `20261010000000_endurecimiento_poscafe.sql` | RLS por rol, funciones, triggers, Storage, Realtime; corrige 3 brechas de seguridad |
| 0003 | `20261015000000_baristas_editan_insumos.sql` | Políticas `baristas_crean_insumos` y `baristas_editan_insumos` (ADR-08) |
| 0004 | `20261020000000_realtime_movimientos.sql` | Publica `movimientos_inventario` en Realtime |
| 0005 | `20261122000000_limites_de_entrada.sql` | `CHECK … NOT VALID`, trigger `mov_validar_delta` |

> La numeración 0001–0005 es la usada en esta documentación; los archivos reales llevan marca de tiempo.

```bash
supabase start            # entorno local ❔ (config.toml no incluido)
supabase db reset         # aplica migraciones + seed.sql
# Proyecto remoto
supabase link --project-ref <ref>
supabase db push
```

### 2.2 Datos de ejemplo (`supabase/seed.sql`)

Categorías, proveedores (cerca de Ensenada, B.C.) e insumos. El stock se inserta directamente como `postgres` (H-03) y al final se ejecuta `update insumos set stock_minimo = stock_minimo where stock_actual <= stock_minimo` para generar los pendientes automáticos de los insumos que nacen bajo el mínimo (workaround de H-02). Los proveedores usan una zona geográfica fija: cambie las coordenadas para probar el mapa en otra ciudad.

### 2.3 Primer administrador

El **primer usuario registrado** recibe el rol `administrador` (los demás `barista`). Registre primero a la persona dueña del negocio. Para promover/degradar después: pantalla «Usuarios y roles» o SQL como `postgres`.

> Procedimiento operativo ante pérdida del administrador: ⬜ sin documentar en el código (H-07). Como `postgres`: `update public.perfiles set rol = 'administrador' where id = '<uuid>'` (los triggers de protección permiten el cambio cuando `auth.uid()` es nulo).

## 3. Variables de entorno y configuración

| Elemento | Dónde | Valor |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` | URL del proyecto |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` | Clave pública `anon` |
| `app.json` → `ios.config.googleMapsApiKey` | `app.json` | Hoy `REEMPLAZA_CON_TU_CLAVE_IOS` |
| `app.json` → clave de Google Maps de Android | `app.json` | Marcador `REEMPLAZA_…` (verificar nombre exacto) |
| `app.json` → `extra.eas.projectId` | `app.json` | Marcador `REEMPLAZA_…`; sin él el push queda desactivado |
| Permisos iOS | `infoPlist` | Ubicación en uso, cámara y fotos (textos en español) |
| Permisos Android | `app.json` | `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `CAMERA`, `POST_NOTIFICATIONS` |
| Identificadores | `app.json` | `com.poscafe.app` (iOS y Android), esquema `poscafe` |

`.env` **no** debe versionarse; confirmar `.gitignore` ❔ (H-06). Use `.env.example` como plantilla ❔.

## 4. Notificaciones push

```bash
supabase functions deploy notify-low-stock
supabase secrets set WEBHOOK_SECRET=<valor-secreto>
# SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta la plataforma en las Edge Functions
```

1. En el panel de Supabase, cree un **Database Webhook** sobre `public.lista_compras`, evento `INSERT`, tipo *Supabase Edge Functions* o HTTP hacia `notify-low-stock`, con la cabecera `x-webhook-secret: <mismo valor>`. ❔ No está versionado.
2. Reemplace `extra.eas.projectId` por el real (`eas init`).
3. Pruebe en un dispositivo físico (los simuladores no reciben push).

## 5. Aplicación

```bash
npm install                    # .npmrc presente ❔
npm run lint
npm run typecheck
npx jest                       # todas las pruebas Jest (npm test omite __tests__/, H-19)
npm run test:db                # pgTAP
npx expo start                 # desarrollo con Expo
eas build --profile development --platform android   # cliente de desarrollo (APK)
eas build --profile preview                           # distribución interna
eas build --profile production                        # producción (autoIncrement)
```

Perfiles de `eas.json`: `development` (`developmentClient`, distribución interna, APK), `preview` (interna, APK), `production` (`autoIncrement`); `submit.production` vacío.

## 6. Verificación posterior a la instalación

| Comprobación | Resultado esperado |
|---|---|
| Registro del primer usuario | Perfil con rol `administrador` |
| Segundo registro | Rol `barista` |
| Barista abre `/dashboard/reports` | Redirige a `/dashboard` |
| Movimiento de −1 con stock suficiente | Stock baja; aparece en el historial |
| Salida que cruza el mínimo | Ítem `AUTO` en Compras (y push si el webhook está configurado) |
| Modo avión + movimiento | Banner «Sin conexión…»; se aplica al reconectar |
| `npm run test:db` | 26 + 7 aserciones superadas |

## 7. Riesgos conocidos al desplegar

H-02 (insumos nacidos bajo el mínimo), H-06 (webhook/secretos no versionados), H-07 (degradación del último administrador por API), H-19 (`npm test`). Ver [`../00-contexto/estado-actual.md`](../00-contexto/estado-actual.md).
