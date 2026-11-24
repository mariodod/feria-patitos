# Feria de Patitos 🦆🎯

Un *shooting gallery* de feria convertido en roguelike de barajas: eliges qué tipo de disparo usar de tu mano de cartas, apuntas a los patitos y encadenas combos para superar la cuota de cada puesto. Entre puestos gastas tus tickets en la tienda, consigues nuevos disparos y reliquias, y construyes una build antes de que acabe la noche.

Estética **pixel art** con resolución interna baja (480×270) escalada con vecino más cercano, interfaz de cartas y números de daño estilo *Balatro*.

> **Estado: M2 completado.** Partida de 3 puestos con mano de cartas, tienda, reliquias y dólares como moneda. Queda el M3 (juice, mapa y progresión meta).

---

## Tecnología elegida

**Phaser 4 + TypeScript + Vite**, ejecutándose en el navegador.

| Opción | Por qué se descarta / se elige |
| --- | --- |
| **Phaser 4 + TS + Vite** ✅ | Motor 2D maduro con todo lo que esta demo necesita ya resuelto: sprites, input, tweens, escalado pixel-perfect y escenas. TypeScript aporta seguridad al estado complejo de un roguelike (barajas, reliquias, hooks). Vite da arranque y build rapidísimos. Además, se publica en GitHub Pages: cualquiera juega con un link, sin instalar nada. |
| Godot 4 | Excelente motor 2D, pero añade un binario pesado y una curva de arranque mayor para una primera demo compartible. Ideal si más adelante queremos exportar a escritorio/consola. |
| Unity | Demasiado pesado para el alcance; demasiada configuración frente a lo que necesitamos. |
| React + Canvas propio | La UI de cartas encaja bien en DOM, pero habría que reimplementar input, escenas, partículas y escalado que Phaser ya trae. |
| Pygame | Cómodo, pero la demo no se puede compartir por web y la capa de UI/combos requiere más trabajo manual. |

Decisión: web con Phaser 4. Si en el futuro queremos una capa de UI tipo Balatro en HTML/CSS, se puede añadir encima del canvas sin cambiar el motor.

---

## Plan para la primera demo jugable

La meta es poder abrir la web, pulsar *empezar*, jugar **3 puestos** con cartas, puntuación y tienda entre ellos, y llegar a una pantalla de victoria/derrota. Aproximadamente 5–10 minutos de partida.

### M0 — Base ✅ (hecho)
- [x] Repositorio en GitHub con `README.md` y `AGENTS.md`.
- [x] Vite + TypeScript strict + Phaser 4.
- [x] Resolución interna 480×270, escalado `FIT`, `pixelArt: true`.
- [x] Demo semilla: lista cerrada de 12 patitos con palito, diana y hora de aparición en `src/data/levels.ts`. Se deslizan por rieles; si fallas, salen de pantalla. El puesto termina cuando no quedan patitos por aparecer ni en juego. Mira, disparos, balas y dólares.

**Dólares:** cuerpo = $10, círculo rojo de la diana = $25 (número dorado y más sacudida), patito dorado = el doble. Lo ganado se acumula para gastarlo en la tienda. Se ajusta en `SCORING` (`src/data/levels.ts`). Si `bodyPoints` se pone a `0`, solo cuenta la diana y un impacto en el cuerpo no derriba al patito.

**Información oculta:** la oleada y cuántos patitos quedan **no se muestran** en el HUD; el jugador solo ve su dinero, las balas y la barra de la cuota.

### M1 — Núcleo de disparo ✅ (hecho)
- [x] Escenas separadas: `BootScene` (texturas), `MenuScene`, `GameScene` y `HudScene` (overlay que escucha eventos).
- [x] Patitos con patrones de movimiento dentro del riel: recto, seno y zigzag; patito dorado que duplica la puntuación.
- [x] 3 oleadas por puesto con cuota en dólares: victoria, cuota no alcanzada o balas agotadas.
- [x] HUD: puesto, balas, dólares y barra de cuota. Oleada y patitos restantes ocultos a propósito.
- [ ] Sprites definitivos en Aseprite (los provisionales ya se generan por código en `BootScene`).

### M2 — Capa roguelike ✅ (hecho)
- [x] Baraja de **cartas de disparo**: mano de 4 cartas, seleccionar una, disparar, descartar y robar otra (`src/game/logic/deck.ts`).
- [x] 5 tipos de disparo: normal, precisión, escopeta, rebote (2 patitos) y congelar.
- [x] Dólares con multiplicadores de carta, bonus por diana, patito dorado y reliquias; números flotantes y sacudida.
- [x] 3 reliquias con hooks (`onHit`, `onStallStart`) y tienda para comprar cartas y reliquias.
- [x] Tienda entre puestos: comprar con dólares; se retira la oferta comprada.
- [x] Bucle de partida: 3 puestos → tienda entre ellos → pantalla de resumen → menú.

### M3 — Juice y cierre de demo
- [ ] Partículas, *screen shake*, destellos y sonidos generados con WebAudio.
- [ ] Mapa simple de nodos para elegir el siguiente puesto.
- [ ] Progresión meta mínima en `localStorage` (desbloqueos entre partidas).
- [ ] Ajuste de balance: que la primera partida se pueda ganar.
- [ ] Publicar en GitHub Pages y verificar que la demo corre sin errores en consola.

### Definición de «demo jugable»
`npm install && npm run dev` → menú → partida de 3 puestos con cartas y tienda → pantalla final → reinicio. Sin errores en consola y `npm run build` pasa.

---

## Concepto de juego (bucle principal)

1. **Robar** una mano de cartas de disparo del mazo.
2. **Elegir** una carta: cada una define cómo sale el disparo (cadencia, alcance, rebotes, daño).
3. **Apuntar y disparar** a los patitos que cruzan el puesto con balas limitadas; diana = bonus, patito dorado = el doble.
4. **Ganar dólares**: cada patito tiene valor base; la precisión, las cartas y las reliquias lo multiplican.
5. **Cumplir la cuota** del puesto para avanzar; si no, se acaba la partida.
6. **Comprar** en la tienda con los dólares ganados: nuevas cartas y reliquias.
7. Repetir hasta completar la feria. Las builds se construyen con sinergias entre cartas y reliquias.

---

## Puesta en marcha

```bash
npm install
npm run dev      # servidor local, abre la URL que muestra Vite
npm run build    # typecheck + build de producción en dist/
npm run preview  # sirve dist/ localmente
```

## Controles (demo actual)

- **Mover el ratón**: mira.
- **Teclas 1–4 o clic en una carta**: elegir carta de disparo.
- **Clic izquierdo sobre el puesto**: disparar (gasta las balas de la carta).
- **Clic en la tienda**: comprar ofertas o ir al siguiente puesto.
- **Clic en el resumen**: volver al menú.

## Estructura

```
src/
  main.ts              # config de Phaser y arranque
  scenes/              # Boot, Menu, Game, Hud, Shop, Summary
  data/                # cards, relics, levels (data-driven)
  game/
    constants.ts       # resolución, offsets, layout de cartas
    events.ts          # eventos y tipos del HUD
    runState.ts        # dólares, mazo, reliquias y puesto actual
    logic/             # scoring, baraja y reglas de nivel (puro, sin Phaser)
    systems/           # helpers de Phaser (texto)
  art/                 # sprites y paletas (Aseprite / PNG)
AGENTS.md              # convenciones para agentes y contribuidores
```

## Roadmap (después de la demo)

Puestos jefes, mapa ramificado, más reliquias y cartas, retos diarios, shader CRT y versión móvil con controles táctiles.

---

Repositorio: `mariodod/feria-patitos`.
