# Fase 4 · Pruebas: Unitarias y de componentes (Jest)

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: [`../../README.md`](../../README.md)

## 1. Configuración

| Archivo | Contenido |
|---|---|
| `jest.config.js` | `preset: "jest-expo"`; `setupFiles: ["<rootDir>/jest.setup.js"]`; `testMatch`: `tests/**/*.test.ts` **y** `__tests__/**/*.test.{ts,tsx}`; `moduleNameMapper` `^@/(.*)$ → src/$1` |
| `jest.app.config.js` | Mismo preset y alias; `testMatch` solo `tests/**/*.test.ts`; `collectCoverageFrom`: `src/services/**`, `src/hooks/**`, `src/components/**`, `src/utils/**` |
| `jest.setup.js` | Fija valores falsos `EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321` y `EXPO_PUBLIC_SUPABASE_ANON_KEY=anon-key-de-prueba` para que las pruebas **nunca** hablen con un Supabase real |
| `package.json` | `"test": "jest --ci -c jest.app.config.js"` |

### Ejecución

```bash
npx jest              # jest.config.js: tests/ + __tests__/ (todo)
npm test              # jest.app.config.js: solo tests/ (H-19)
npx jest --coverage -c jest.app.config.js
```

Librerías: `jest-expo ~58`, `@testing-library/react-native` (RNTL).

## 2. Casos por archivo

### 2.1 `tests/envioUnico.test.ts` — `crearBloqueo`

| Caso | Resultado esperado |
|---|---|
| Dos toques seguidos | Se ejecuta una sola vez |
| Pasado el enfriamiento | Vuelve a permitir |
| Promesa pendiente | Se ignora aunque haya pasado el enfriamiento |
| Promesa que falla | Se libera el bloqueo |
| Función que lanza | No queda bloqueado (`hasta = 0` y relanza) |

### 2.2 `tests/utils_baseline.test.ts`

Regresión de `parsearNumero`: `"0x10"` y `"1e3"` devuelven 0 (antes 16 y 1000).

### 2.3 `tests/utils.test.ts`

| Grupo | Aserciones representativas |
|---|---|
| Modo avión | Mensajes de red → `MENSAJES.red`; *timeout* → `MENSAJES.lento`; texto técnico → `MENSAJES.generico`; `ErrorUsuario` tal cual; `23514`+`stock_insuficiente` → código; `22003` → `numeroGrande`; `null`/`undefined` no rompen |
| Formato | `formatearCantidad(4)="4"`, `2.5`, `NaN/Infinity="0"`; `formatearDistancia(850)="850 m"`, `2300="2.3 km"`; fecha inválida `""`; `parsearNumero` con vacío, signo, punto solos y válidos (`12,5`, ` 7 `) |
| Delta/stock | `acotarDelta(-20, 5) = -5`; `(-1, 0) = 0`; stock negativo = 0; `Infinity = 0`; `stockProyectado(0.1, 0.2) = 0.3` |
| Actividad | Movimiento sin perfil → «Alguien»; «tú» (verbo en segunda persona); `tiempoRelativo(null/basura)=""`; «ahora mismo»; fecha futura sin negativos |

### 2.4 `tests/validacion.test.ts`

| Grupo | Aserciones |
|---|---|
| Campos vacíos | Texto vacío o solo espacios inválido; cantidad vacía inválida; correo vacío inválido; teléfono vacío válido (opcional) |
| Texto en lugar de número / negativos | Rechaza texto; `-5` → «No puede ser negativo…»; cero no permitido por defecto y permitido con `permitirCero`; coma decimal; 4 decimales inválido; `1000000` inválido; `999999` válido; `"9"×400` no rompe |
| `filtrarEntradaNumerica` | Quita letras; coma→punto; un solo separador; máx. 3 decimales; sin negativos (salvo `permitirNegativo`); emoji/símbolos |
| Texto largo | Nombre de 200 inválido; de 80 válido; colapsa espacios (`normalizarTexto`); correo de 300 inválido; teléfono largo/con letras inválido; `646 111 2233` válido |

### 2.5 `__tests__/`

| Archivo | Casos |
|---|---|
| `actividad.test.ts` | `tiempoRelativo` (tabla: 10 s → «ahora mismo», 5 min, 3 h, 26 h → «ayer»; tolera vacíos), `describirMovimiento` (otra persona, «Tú», «Alguien») |
| `Encabezado.test.tsx` | Muestra título sin «Volver» en raíz; muestra «Volver» y regresa al pulsarlo |
| `errores.test.ts` | Tablas `it.each` de códigos y mensajes (incluye `40001`/`40P01`/`55P03` → concurrencia); fotos y servidor; `ErrorUsuario` tal cual; texto técnico desconocido → mensaje por defecto; **tono** (sin jerga, breves, terminan en punto); detección de stock insuficiente por código; `aErrorUsuario` conserva el código |
| `Feedback.test.tsx` | Toast muestra título/detalle y se cierra al tocarlo; un toast nuevo reemplaza al anterior; diálogo `confirmar` resuelve `true`/`false`; `informar` con un solo botón «Entendido»; `Aviso` en línea; hooks fuera de proveedor fallan con mensaje claro |
| `geocodificacion.test.ts` | Primera coincidencia; texto corto sin llamar al geocodificador; sin resultados con orientación; falla traducida; `direccionDeCoordenada` legible y nunca lanza; `formatearDireccion` omite partes vacías/repetidas |
| `QuickCounter.test.tsx` | No permite restar más que el stock; chip suma incremento; pulsación larga resta; muestra proyección |
| `ReasonChips.test.tsx` | Muestra los 5 motivos y devuelve el elegido |
| `traducirError.test.ts` | Delegación en el traductor central |
| `utils.test.ts` | `formatearDistancia`, `parsearNumero` (coma y vacío), `formatearCantidad`, RN-01, CA-01 (10 − 6 = 4), `generarUuid` v4 distinto cada vez |

## 3. Convenciones de prueba observadas

1. Casos con nombre en español que citan RN/CA (`"RN-01: …"`, `"CA-01: …"`).
2. `(globalThis as any).__DEV__ = false` para silenciar registros en pruebas de errores.
3. Pruebas de **tono** de mensajes: ninguno contiene jerga técnica; son breves y terminan en punto.
4. Regresiones documentadas (`parsearNumero`).
5. Servicios con dependencias nativas se aíslan con *mocks* (p. ej. `expo-location`).

## 4. Pruebas pendientes sugeridas

| Prioridad | Objeto | Caso |
|---|---|---|
| Alta | `useRegistrarMovimiento` | Optimismo + *rollback* ante error; invalidaciones |
| Alta | `MovimientoModalScreen` | `opId` estable entre reintentos; camino sin conexión |
| Alta | `registrarMovimiento` | Reintento único tras `23505` con `opId` (400 ms, temporizadores simulados) |
| Media | `useUiStore.setIncrementos` | Normalización (máx. 4, únicos, 3 decimales) |
| Media | `clasificar` | Caso `insumos_stock_max_chk` (H-13) |
| Media | `services/dashboard` | `respuestaInvalida`, `numeroValido` |
| Baja | `SupplierMap`/`InsumoCard` | Render y accesibilidad |
