# Feria de Patitos 🦆🎯

Un *shooting gallery* de feria convertido en roguelike: disparas con una escopeta base, usas **cartuchos especiales** que compras y mejoras el arma entre puestos. Apuntas a los patitos para ganar dólares y superar la cuota de cada puesto. No hay cartas: al empezar no tienes ningún cartucho ni mejora.

Estética **pixel art** con resolución interna baja (480×270) escalada con vecino más cercano y números de dinero estilo *Balatro*.

> **Estado: M2 completado.** Partida de 3 puestos con escopeta base, cartuchos especiales, mejoras, tienda y dólares como moneda. Queda el M3 (juice, mapa y progresión meta).

---

## Tecnología elegida

**Phaser 4 + TypeScript + Vite**, ejecutándose en el navegador.

| Opción | Por qué se descarta / se elige |
| --- | --- |
| **Phaser 4 + TS + Vite** ✅ | Motor 2D maduro con todo lo que esta demo necesita ya resuelto: sprites, input, tweens, escalado pixel-perfect y escenas. TypeScript aporta seguridad al estado complejo de un roguelike (cartuchos, mejoras, hooks). Vite da arranque y build rapidísimos. Además, se publica en GitHub Pages: cualquiera juega con un link, sin instalar nada. |
| Godot 4 | Excelente motor 2D, pero añade un binario pesado y una curva de arranque mayor para una primera demo compartible. Ideal si más adelante queremos exportar a escritorio/consola. |
| Unity | Demasiado pesado para el alcance; demasiada configuración frente a lo que necesitamos. |
| React + Canvas propio | La UI de cartas encaja bien en DOM, pero habría que reimplementar input, escenas, partículas y escalado que Phaser ya trae. |
| Pygame | Cómodo, pero la demo no se puede compartir por web y la capa de UI/combos requiere más trabajo manual. |

Decisión: web con Phaser 4. Si en el futuro queremos una capa de UI tipo Balatro en HTML/CSS, se puede añadir encima del canvas sin cambiar el motor.

---

## Plan para la primera demo jugable

La meta es poder abrir la web, pulsar *empezar*, jugar **3 puestos** con la escopeta, cartuchos y mejoras, con tienda entre ellos, y llegar a una pantalla de victoria/derrota. Aproximadamente 5–10 minutos de partida.

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
- [x] **Escopeta base** siempre disponible con clic; al empezar no hay cartuchos ni mejoras.
- [x] **Cartuchos especiales** en 4 ranuras (teclas 1–4 o clic): precisión, escopeta, rebote y congelar. Se consumen al usarlos.
- [x] **8 mejoras permanentes** del arma y del puesto con hooks (`onHit`, `onStallStart`).
- [x] Dólares con multiplicadores de cartucho, bonus por diana, patito dorado y mejoras; números flotantes y sacudida.
- [x] Tienda entre puestos: comprar mejoras y cartuchos con dólares; se retira la oferta comprada y el cursor vuelve a verse.
- [x] Bucle de partida: 3 puestos → tienda entre ellos → pantalla de resumen → menú.

### M3 — Juice y cierre de demo
- [ ] Partículas, *screen shake*, destellos y sonidos generados con WebAudio.
- [ ] Mapa simple de nodos para elegir el siguiente puesto.
- [ ] Progresión meta mínima en `localStorage` (desbloqueos entre partidas).
- [ ] Ajuste de balance: que la primera partida se pueda ganar.
- [ ] Publicar en GitHub Pages y verificar que la demo corre sin errores en consola.

### Definición de «demo jugable»
`npm install && npm run dev` → menú → partida de 3 puestos con escopeta, cartuchos y tienda → pantalla final → reinicio. Sin errores en consola y `npm run build` pasa.

---

## Concepto de juego (bucle principal)

1. **Disparar** con la escopeta base (clic) o elegir un cartucho especial con las teclas 1–4.
2. **Cada cartucho** cambia el disparo: mira más pequeña, más ancha, dos patitos o ralentización. Se consume al usarlo.
3. **Apuntar a los patitos** con balas limitadas; diana = bonus, patito dorado = el doble.
4. **Ganar dólares**: cada patito tiene valor base; la precisión, los cartuchos y las mejoras lo multiplican.
5. **Cumplir la cuota** del puesto para avanzar; si no, se acaba la partida.
6. **Comprar** en la tienda con los dólares ganados: mejoras permanentes y cartuchos nuevos.
7. Repetir hasta completar la feria. La build se construye con sinergias entre mejoras y cartuchos.

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
- **Clic izquierdo sobre el puesto**: disparar con la escopeta base.
- **Teclas 1–4 o clic en una ranura**: seleccionar un cartucho especial (si lo tienes); vuelve a pulsar para volver a la escopeta.
- **Clic en la tienda**: comprar mejoras/cartuchos o ir al siguiente puesto.
- **Clic en el resumen**: volver al menú.

## Estructura

```
src/
  main.ts              # config de Phaser y arranque
  scenes/              # Boot, Menu, Game, Hud, Shop, Summary
  data/                # shells, upgrades, levels (data-driven)
  game/
    constants.ts       # resolución, offsets, layout de cartuchos
    events.ts          # eventos y tipos del HUD
    runState.ts        # dólares, cartuchos, mejoras y puesto actual
    logic/             # scoring y reglas de nivel (puro, sin Phaser)
    systems/           # helpers de Phaser (texto)
  art/                 # sprites y paletas (Aseprite / PNG)
AGENTS.md              # convenciones para agentes y contribuidores
```

## Roadmap (después de la demo)

Puestos jefes, mapa ramificado, más reliquias y cartas, retos diarios, shader CRT y versión móvil con controles táctiles.

---

Repositorio: `mariodod/feria-patitos`.
