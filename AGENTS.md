# AGENTS.md — Feria de Patitos

Instrucciones para agentes y contribuidores de este repositorio. Léelas antes de tocar código.

## Qué es esto

Roguelike de barajas estilo Balatro ambientado en un puesto de disparar patitos de feria. Pixel art, web, Phaser 4 + TypeScript + Vite. La meta actual es la **primera demo jugable** descrita en `README.md` (hitos M0–M3).

## Comandos

```bash
npm install
npm run dev      # desarrollo
npm run build    # tsc --noEmit && vite build  — debe pasar antes de dar nada por hecho
npm run preview  # probar el build de producción
```

No hay tests aún. Cuando se añadan, la lógica pura debe ser testeable sin Phaser y los comandos de test se documentarán aquí.

## Reglas del proyecto

- **TypeScript strict** (`tsconfig.json`). No uses `any` salvo que no haya alternativa y lo justifiques.
- **Resolución fija 480×270.** `pixelArt: true`, `roundPixels: true`, escalado `Phaser.Scale.FIT`. No cambies la resolución ni actives anti-aliasing sin permiso: rompe la estética pixel art.
- **Posiciones enteras** en sprites (`setPosition(Math.round(x), Math.round(y))`) para evitar bordes borrosos.
- **No hay cartas.** La escopeta base siempre está disponible con clic. Los **cartuchos especiales** son consumibles en 4 ranuras (teclas 1–4) y **las mejoras** son permanentes; al empezar no se tiene ninguno de los dos.
- **Contenido data-driven**: cartuchos, mejoras y puestos se definen en `src/data/`, nunca como condicionales dentro del bucle de juego. Añadir un cartucho o una mejora debe ser añadir un objeto de datos, no editar la lógica.
- **Lógica pura separada**: reglas de puntuación y de nivel van en `src/game/logic/` y no importan Phaser. Los sistemas de Phaser (`src/game/systems/`) solo orquestan.
- **Hooks de mejoras** (`onHit`, `onStallStart` en `src/data/upgrades.ts`). No cablees mejoras concretas dentro de las clases de juego.
- **Moneda**: la puntuación son dólares (`run.dollars` en `src/game/runState.ts`) y se gastan en la tienda. El HUD **no** debe mostrar la oleada ni cuántos patitos quedan: es información oculta a propósito.
- **State por partida vs meta**: `run` se reinicia con `resetRun()` al empezar cada partida: mejoras, cartuchos, dólares y nodo se pierden. Solo `src/game/meta.ts` persiste (en `localStorage`) y únicamente guarda desbloqueos y dólares totales acumulados para umbrales. Nunca guardes mejoras de una partida.
- **Vida y daño**: los patitos pueden tener `hp` > 1 (metal, jefe). El daño base es 1 y se incrementa con hooks `onHit` de mejoras y con el campo `damage` del cartucho. Nunca asumas que un impacto derriba al patito: comprueba `hp` y muestra el feedback visual de daño parcial.
- **Cursor**: `GameScene` y `ShopScene` ocultan el cursor y muestran la mira (`crosshair`); menú, mapa y resumen dejan el cursor visible (`auto`).
- **Tienda**: las ofertas se conservan entre compras (se marcan `VENDIDO`); solo se regeneran al pagar `SHOP_REFRESH_PRICE`. No llames a `scene.restart()` para reflejar una compra: vuelve a dibujar con `render()`. Las zonas interactivas y la mira se crean **una sola vez** en `create()`. Los `Text` de los slots se **recrean** en cada `render()`: reutilizar un `Text` con `setText()` tras pasar de `VENDIDO` a una oferta real lanza `Cannot read properties of null (reading 'drawImage')` en Phaser 4 y deja la escena colgada.
- **Assets provisionales**: hasta M3 los sprites se generan con `Graphics.generateTexture()` en `BootScene`. Eso permite que la demo funcione sin archivos de imagen. Los assets definitivos van en `src/art/` con paleta reducida.
- **Idioma**: código y mensajes de commit en inglés; documentación y textos de juego en español.
- **Git/GitHub**: usa `gh` para cualquier operación de GitHub (issues, PRs, Pages). Rama principal `main`. No commitees `node_modules/`, `dist/` ni archivos `.local`.
- **Commits** pequeños y descriptivos (`add shot card data model`, `fix duck bounce bounds`). Un cambio = un propósito.

## Dónde poner las cosas

| Tarea | Archivo / carpeta |
| --- | --- |
| Arranque y config del juego | `src/main.ts` |
| Escenas (boot, menú, partida, HUD, tienda, mapa, resumen) | `src/scenes/` |
| Definiciones de cartuchos, mejoras, puestos, nodos | `src/data/` |
| Reglas sin motor (scoring, nivel) | `src/game/logic/` |
| Audio WebAudio y helpers de texto | `src/game/systems/` |
| Constantes de resolución y eventos entre escenas | `src/game/constants.ts`, `src/game/events.ts` |
| Sprites, paletas, fuentes | `src/art/` |

## Cómo añadir contenido

1. **Cartucho especial**: añade una entrada en `src/data/shells.ts` con `radius`, `multiplier`, `ammoCost`, `extraTargets`, `slow`, `price` y `hex`. Se consume al disparar y no se posee al empezar.
2. **Mejora**: añade una entrada en `src/data/upgrades.ts` con `price` y los hooks `onHit` y/o `onStallStart` que necesite. Es permanente durante la partida.
3. **Puesto**: añade una entrada en `src/data/levels.ts` con munición, cuota, oleadas y la lista cerrada de patitos (`spawnAt`, carril, velocidad, dirección, `pattern`, `wave`, `gold`, `hp`, `scale`, `metal`, `boss` y `life`). Nunca generes patitos en bucle dentro de la escena: destruir uno no debe provocar otro.

## Antes de dar algo por terminado

- `npm run build` pasa sin errores.
- `npm run dev` y la demo se juega de principio a fin sin errores en consola.
- Al terminar una partida y empezar otra, mejoras, cartuchos y dólares están a cero (solo persisten desbloqueos).
- Si cambias la lógica de puntuación, el mapa o la tienda, actualiza la documentación del plan en `README.md`.
