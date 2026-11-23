# Bitácora de IA y diario de decisiones · POSCafé

## Cómo empezó

Todo partió de un prompt largo en el que le pedí a Claude que actuara como arquitecto de software senior y escribiera el SDD (documento de diseño) de POSCafé. Le di el stack que quería (React Native con Expo Router, Supabase, notificaciones push y react-native-maps) y las ocho secciones que tenía que cubrir, desde la arquitectura hasta las pruebas y el despliegue con EAS. Al final pegué el documento de especificaciones de la cafetería, con el flujo del "contador rápido", los roles de administrador y barista, la lista de compras y los proveedores en un mapa.

Claude me entregó el SDD completo y añadió por su cuenta una matriz de trazabilidad y una sección de riesgos. También tomó decisiones que la especificación no pedía. El stock solo cambia a través de funciones de la base de datos y no por escritura directa. Cada movimiento lleva un identificador único para que no se duplique si la app reenvía una operación sin conexión. Al marcar una compra, primero se cierra el ítem y después se suma el stock. La relación entre proveedores e insumos quedó de muchos a muchos. Me avisó además de tres supuestos que yo debía confirmar: que el primer usuario registrado sería administrador, que el barista podría marcar compras, y que las notificaciones y el mapa necesitan una build de desarrollo y no funcionan en Expo Go. Esas ideas me parecieron razonables y se quedaron en el proyecto.

## Cómo siguió la construcción

Después trabajé con Claude por etapas, con pruebas reales en cada una. La más importante fue un cambio de regla: que los baristas puedan crear y editar insumos, pero no cambiar el stock a mano ni desactivarlos. Para comprobarlo no me conformé con que "se viera bien". Claude me dio consultas SQL para revisar que cada insumo nuevo tuviera su movimiento de "Stock inicial", que el saldo coincidiera con el stock y que la alerta de stock bajo hubiera llegado a la lista de compras. También me dio una tabla de pruebas manuales (editar, abrir Reportes como barista, cerrar sesión, avión) y me pidió que anotara ✅ o ❌ en cada una antes de hacer el commit.

Más adelante apareció el error "JWT issued at future" justo después de iniciar sesión. Claude me explicó que no era un fallo de mi código sino un desfase de reloj de uno o dos segundos entre servicios de Supabase, y que el aviso rojo salía solo en desarrollo porque mi código hacía un `console.error`. Me propuso arreglarlo reintentando la carga del perfil unas pocas veces, solo para ese error. Acepté su consejo de no mezclarlo con el cambio anterior y dejarlo en un commit aparte.

Cuando le pedí que terminara la aplicación, me tocó probarla en mi editor, y ahí aparecieron errores de TypeScript que Claude no veía en su entorno: los íconos de las pestañas, los botones de los formularios, una lista con `null` y la función de Deno. Claude corrigió los cuatro grupos, pero me dijo con claridad que no podía reproducir mis errores exactos y que había escrito los arreglos para que funcionaran con sus tipos y con los míos.

## Dónde se equivocó la IA

El caso más claro fue la Edge Function. Me aparecieron dos errores en el editor: uno por importar desde una URL y otro porque `createClient` no tenía tipo. Claude había creado un archivo de ayuda (`deno-shim.d.ts`) que solo servía para el TypeScript normal, y mi extensión de Deno lo ignoraba. Él mismo lo reconoció como un error de enfoque. Yo me di cuenta porque le pegué los diagnósticos tal cual salían en mi editor, y eso le permitió ver que usaba la extensión de Deno. La solución correcta fue declarar la dependencia en un `deno.json` e importarla por nombre. Esta vez la comprobó con Deno, con lint y con chequeo de tipos. Aun así, me aclaró que no pudo desplegar ni ejecutar la función, así que eso sigue sin probarse.

Lo aprendí de ahí: lo que la IA prueba en su entorno no siempre coincide con el mío, y por eso conviene pegarle el error exacto de mi editor.

## La segunda parte: reconstruir los specs desde el código

Al final le pedí que rehiciera toda la carpeta `specs/` a partir del código real, con una regla estricta: el código manda, y si algo difiere del SDD o de los documentos viejos, se documenta lo que hace el código y se señala el cambio. Por eso la documentación final tiene nombres en español (`registrar_movimiento`, `insumos`, `estado_stock`), distintos de los nombres en inglés que usaba el primer SDD, y recoge que el barista sí puede crear insumos.

Claude volvió a equivocarse en detalles y se corrigió cada vez que contrastó con el código. Dijo que había pruebas de rutas cuando no las hay. Dibujó mal el contador (los chips suman al tocar y restan al mantener pulsado). Inventó nombres de archivos que luego resultaron distintos, y escribió cuatro diagramas con errores de sintaxis que un analizador detectó. De esa revisión salió además un hallazgo real: `npm test` no ejecuta las pruebas de la carpeta `__tests__/`.

También rechazamos, o dejamos marcado como no implementado, lo que venía de los documentos viejos y no existía en el código: la "migración 0003" de idempotencia, la regla original de que el barista solo mueve stock y el pipeline de CI propuesto. Lo que no se pudo comprobar (el webhook, los secretos, el `ci.yml`) quedó marcado como no verificable en lugar de rellenarlo.

## Mi criterio

Mi criterio fue no creerle a la IA por cómo suena, sino por lo que se puede comprobar. Las pruebas en el teléfono, las consultas SQL, los errores pegados desde mi editor y la comparación con el código fueron lo que decidió si algo estaba bien. Cuando una respuesta no se podía comprobar, prefería que quedara marcada como pendiente.

## Pendiente

Arreglar `npm test` para que incluya todas las pruebas, probar la Edge Function desplegada, ejecutar la prueba de concurrencia que ya existe y corregir las etiquetas del gráfico semanal.
