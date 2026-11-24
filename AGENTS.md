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
- **Contenido data-driven**: cartas, reliquias y puestos se definen en `src/data/`, nunca como condicionales dentro del bucle de juego. Añadir una carta debe ser añadir un objeto de datos, no editar la lógica.
- **Lógica pura separada**: reglas de puntuación, baraja y economía van en `src/game/logic/` y no importan Phaser. Los sistemas de Phaser (`src/game/systems/`) solo orquestan.
- **Hooks de reliquias** vía eventos (`onHit`, `onKill`, `onWaveEnd`, etc.). No cablees reliquias concretas dentro de las clases de juego.
- **Assets provisionales**: hasta M3 los sprites se generan con `Graphics.generateTexture()` en `BootScene`. Eso permite que la demo funcione sin archivos de imagen. Los assets definitivos van en `src/art/` con paleta reducida.
- **Idioma**: código y mensajes de commit en inglés; documentación y textos de juego en español.
- **Git/GitHub**: usa `gh` para cualquier operación de GitHub (issues, PRs, Pages). Rama principal `main`. No commitees `node_modules/`, `dist/` ni archivos `.local`.
- **Commits** pequeños y descriptivos (`add shot card data model`, `fix duck bounce bounds`). Un cambio = un propósito.

## Dónde poner las cosas

| Tarea | Archivo / carpeta |
| --- | --- |
| Arranque y config del juego | `src/main.ts` |
| Escenas (boot, menú, partida, HUD, tienda, resumen) | `src/scenes/` |
| Definiciones de cartas, reliquias, puestos | `src/data/` |
| Reglas sin motor (scoring, mazo, economía) | `src/game/logic/` |
| Sistemas y helpers de Phaser (texto, audio, spawn) | `src/game/systems/` |
| Constantes de resolución y eventos entre escenas | `src/game/constants.ts`, `src/game/events.ts` |
| Sprites, paletas, fuentes | `src/art/` |

## Cómo añadir contenido

1. **Carta de disparo**: añade una entrada al catálogo de `src/data/cards.ts` con `id`, `nombre`, `coste`, `efecto` y valores. La lógica del efecto va en un sistema registrado por `id`.
2. **Reliquia**: añade una entrada en `src/data/relics.ts` y suscribe un handler a los hooks existentes.
3. **Puesto**: añade una entrada en `src/data/levels.ts` con munición, cuota, número de oleadas y la lista cerrada de patitos (`spawnAt`, carril, velocidad, dirección, `pattern`, `wave` y `gold`). Nunca generes patitos en bucle dentro de la escena: destruir uno no debe provocar otro.

## Antes de dar algo por terminado

- `npm run build` pasa sin errores.
- `npm run dev` y la demo se juega de principio a fin sin errores en consola.
- Si cambias la lógica de puntuación o baraja, actualiza la documentación del plan en `README.md`.
