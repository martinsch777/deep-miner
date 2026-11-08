# DEEP MINER

Roguelite de minería vertical con Canvas 2D y módulos ES. Interfaz en español rioplatense, recursos originales dibujados localmente, sin frameworks, CDN, cuentas ni backend. El juego completo se puede cachear y ejecutar sin conexión.

## Ejecutar

Requiere Node.js 18 o posterior para el servidor y las pruebas; no hace falta instalar paquetes.

Desde esta carpeta:

```sh
npm start
```

Abrir `http://localhost:4173`. Detener con Ctrl+C. También sirve cualquier servidor estático con tipos MIME correctos para JavaScript y `.webmanifest`.

No abrir `index.html` con doble clic: `file://` no permite comprobar Service Workers y puede bloquear módulos ES. El servidor incluido sirve únicamente archivos; no contiene lógica de juego ni guarda partidas. No es necesario en producción si se publica en un hosting estático.

## Cómo jugar

- Mantener la cruceta o WASD/flechas para moverse o perforar. La última dirección presionada tiene prioridad; soltarla recupera la anterior si sigue mantenida.
- Espacio o Escanear: 8 de energía, revela minerales cercanos por 6 segundos, cooldown de 9 segundos.
- Base: confirma el regreso inmediato desde cualquier punto y vende el 100% de la carga. No es necesario desandar los túneles.
- Batería agotada o acción sin energía suficiente: rescate automático y venta al 50%, redondeada hacia abajo. Nunca se permite energía negativa.
- Mochila llena: el mineral queda en el suelo. Se puede seguir perforando y volver a recogerlo si hubiera espacio; nunca bloquea el movimiento.
- Las cápsulas dan 30 créditos y restauran 18 de energía. Hay suministros cada 12 m en la columna central, además de cápsulas aleatorias. Esta ruta permite completar el objetivo con equipo mejorado en todas las semillas probadas.
- Encontrar el Núcleo entre 110 y 120 m y regresar voluntariamente completa la misión. No ocupa mochila. Desde 70 m aparece una brújula con dirección y distancia Manhattan. Un rescate pierde el Núcleo de esa expedición.
- Comprar mejoras en Taller. Una expedición conserva su equipo inicial aunque se compren mejoras entre pausas; los nuevos niveles se usan en la siguiente.
- Esc o botón de pausa: continuar, guardar y salir, o regresar a base. Cambiar de pestaña pausa y guarda.
- Ajustes: sonido, lado de cruceta, movimiento reducido, tutorial y exportación/importación JSON con validación y confirmación antes de reemplazar el progreso.

## Archivos

```text
index.html                 Entrada y contenedores accesibles
style.css                  Pantallas, HUD, cruceta y zonas seguras
manifest.webmanifest       Instalación standalone portrait
sw.js                      Precache local versionado
icons/                     PNG 192, 512 y Apple Touch 180
src/config.js              Economía, costos, tiempos y mejoras
src/rng.js                 PRNG reproducible
src/world.js               Biomas, cuevas, vetas, cápsulas y Núcleo
src/game.js                Lógica independiente de DOM y Canvas
src/render.js              Tiles, robot, iluminación y partículas
src/input.js               Pointer Events y teclado con limpieza
src/save.js                IndexedDB, copia local y validación v1
src/audio.js               Síntesis mediante Web Audio
src/pwa.js                 Registro y estado de recursos offline
src/main.js                Navegación, HUD y ciclo de paso fijo
tests/game.test.js          Pruebas con node:test
server.mjs                 Servidor estático local sin dependencias
```

El mapa tiene 31 × 121 casillas. Se guardan semilla y cambios de casillas, inventario, posición, equipo de la expedición, batería y cooldown. No se guarda una copia completa del terreno. El PRNG del mundo no usa `Math.random`; cada expedición obtiene su semilla inicial de `crypto.getRandomValues`.

La lógica avanza a 60 pasos por segundo con acumulador y delta máximo de 100 ms. Canvas limita DPR a 2, dibuja únicamente tiles visibles y desactiva efectos de partículas y seguimiento suavizado al reducir movimiento. Al ocultarse la página deja de actualizar y dibujar el juego.

## Guardado y recuperación

IndexedDB es el almacén principal; una copia síncrona en localStorage cubre `pagehide`, cierres y fallback. Al iniciar se elige la copia válida más reciente. Una copia local con JSON ilegible se conserva en `deep-miner-v1-recovery` y se intenta recuperar IndexedDB. Los datos inválidos nunca se importan. Si no queda ninguna copia válida se informa al usuario y se inicia un estado nuevo.

Guardado tras compras, recogidas, objetivos, cambios de pantalla, cada cuatro segundos de juego y en `visibilitychange`/`pagehide`. Las transacciones IndexedDB se serializan para evitar escrituras fuera de orden. La exportación permite respaldar o transferir la partida sin servidor. No se almacena información personal.

El navegador puede borrar almacenamiento de un sitio por presión de espacio, ajustes del usuario o modo privado. Exportar periódicamente es la forma de conservar un respaldo independiente.

## Publicar por HTTPS

### GitHub Pages

1. Crear un repositorio y subir el contenido de esta carpeta a la raíz de una rama, conservando `src/` e `icons/`.
2. En Settings → Pages seleccionar publicación desde esa rama y carpeta raíz.
3. Habilitar HTTPS y abrir la URL del repositorio cuando termine la publicación.
4. Esperar el indicador **OFFLINE LISTO**. Todas las rutas son relativas, compatibles con `/nombre-del-repositorio/`.

También se puede subir el mismo contenido a cualquier hosting estático HTTPS. No se necesita compilación, comandos de instalación, variables de entorno ni servidor de aplicaciones. `tests/`, `server.mjs`, `package.json` y README no son necesarios para jugar, aunque se pueden conservar como código fuente.

Esta entrega no crea un repositorio ni publica en una cuenta externa; incluye todos los archivos listos para hacerlo.

### Instalar en iPhone

1. Abrir la URL HTTPS en **Safari** con conexión.
2. Esperar **OFFLINE LISTO** antes de cerrar la página.
3. Compartir → Agregar a pantalla de inicio → Agregar.
4. Abrir el icono y esperar nuevamente **OFFLINE LISTO**: confirmar esto también en la app instalada.
5. Jugar una expedición, pausar y cerrarla. Activar modo avión, desactivar Wi-Fi y abrir el icono.
6. Confirmar que carga la portada, Continuar recupera la expedición y funcionan perforación, sonido, escáner, venta y taller. Cerrar y reabrir aún en modo avión; confirmar créditos y mejoras.

Un iPhone que acceda a la IP HTTP de una computadora en la misma red puede mostrar la página, pero ese origen no es seguro para instalar y probar el Service Worker. Usar HTTPS para la prueba real de instalación.

### Actualizaciones

Cambiar el nombre de caché en `sw.js` al publicar cambios de recursos. La nueva versión se instala de forma completa; espera a que se cierren las pestañas de la versión anterior. Cerrar todas las ventanas del juego y reabrir con conexión aplica la actualización. No se fuerza una recarga durante una expedición. La limpieza afecta solo cachés `deep-miner-shell-*`, no IndexedDB ni localStorage. No cambiar la clave de guardado al actualizar recursos; si cambia el esquema, agregar una migración explícita de versión.

## Pruebas ejecutadas

```sh
npm test
```

20 pruebas aprobadas con Node 22: determinismo, dimensiones y Núcleo; movimiento; tiempos y costos de rocas; carga llena; venta y rescate; compras y máximos; equipo de futuras expediciones; energía insuficiente y exactamente cero; escáner y cooldown; cápsulas y objetivo; récords; serialización/reconstrucción; rechazo de importaciones inválidas; bordes y cambio de dirección; recorrido hasta el Núcleo con equipo máximo en 100 semillas; integridad de recursos precacheados; manifest e iconos PNG.

Verificación en navegador de escritorio integrado:

- Portada y arte Canvas, tutorial, expedición, pulsación mantenida, recogida y venta por 20 créditos.
- Récord y progreso conservados después de recargar; Continuar recupera expedición guardada.
- Indicador OFFLINE LISTO. Con el servidor local detenido, recarga completa desde el caché, continuación y activación del escáner con gasto de energía.
- Vista de partida en 375 × 812 y 390 × 844 CSS px: ancho y alto del documento iguales al viewport, sin desborde.
- Sin errores JavaScript observados durante la revisión.

## Lista de comprobación manual en iPhone

Pendiente de ejecutar en un dispositivo físico; la emulación de tamaño no verifica Safari, multitáctil, notch ni rendimiento del hardware.

- Completar el procedimiento de modo avión anterior, también tras cerrar la PWA por completo.
- Mantener cada dirección 5 s y soltar fuera del botón; comprobar que se detiene.
- Pulsar dos direcciones con dos dedos; verificar prioridad de la más reciente y que `pointercancel` no deje controles atascados.
- Escanear mientras se mantiene la cruceta; comprobar cooldown y ausencia de zoom o selección.
- Llenar la mochila, perforar otra veta y volver a base; verificar límite y desglose.
- Agotar energía durante movimiento, perforación y escáner; comprobar un único rescate al 50% y ningún saldo negativo.
- Refrescar durante perforación, reabrir desde pantalla de inicio y continuar con inventario y modificaciones conservados. La perforación parcial puede reiniciarse sin cobrar energía adicional.
- Girar el dispositivo y volver a vertical; verificar HUD, cruceta, notch, barra inferior y liberación de direcciones activas.
- Exportar, importar la misma partida, intentar JSON mal formado, versión desconocida y carga fuera de límites. Confirmar que los inválidos no sustituyen el progreso.
- Repetir con sonido silenciado, movimiento reducido y cruceta a la derecha.
- Medir fluidez en iPhone 13; no se afirma haber medido 60 FPS en un iPhone físico.

## Límites y evolución

No se comprobó instalación física en Safari iOS ni se midieron FPS en iPhone 13. Las pruebas de navegador comprueban tamaños CSS y una sesión offline en escritorio. En ventanas muy bajas o en orientación horizontal puede ser necesario desplazar la interfaz; la experiencia principal es vertical. La música opcional no se incluyó; los efectos son sintetizados localmente. Como mejoras futuras: pruebas automatizadas de UI en WebKit, más variaciones de decoración y música procedural opcional. No hay enemigos, gravedad ni servicios online, conforme al alcance solicitado.
