# Feria de Patitos 🦆🎯

Un *shooting gallery* de feria convertido en roguelike de barajas: eliges qué tipo de disparo usar de tu mano de cartas, apuntas a los patitos y encadenas combos para superar la cuota de cada puesto. Entre puestos gastas tus tickets en la tienda, consigues nuevos disparos y reliquias, y construyes una build antes de que acabe la noche.

Estética **pixel art** con resolución interna baja (480×270) escalada con vecino más cercano, interfaz de cartas y números de daño estilo *Balatro*.

> **Estado: M0 completado.** Hay un scaffold funcional y una demo semilla (disparar a patitos con temporalizador y puntuación). El juego roguelike completo está en el plan más abajo.

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
- [x] Demo semilla: patitos que rebotan, mira, disparos, balas, tiempo, puntos y reinicio.

### M1 — Núcleo de disparo
- [ ] Escenas separadas: `BootScene`, `MenuScene`, `GameScene`, `HudScene`.
- [ ] Patas de pato con patrones de movimiento (recto, seno, zigzag, patito dorado).
- [ ] Sistema de oleadas y cuota de puntos por puesto; victoria/derrota por puesto.
- [ ] HUD real: baraja restante, mano de cartas, balas, tiempo, puntos, multiplicador.
- [ ] Sprites pixel art reales (generados por código primero, luego Aseprite).

### M2 — Capa roguelike (el corazón de la demo)
- [ ] Baraja de **cartas de disparo**: robar 4–5 cartas por oleada, seleccionar una, disparar, descartar y recargar.
- [ ] 4–6 tipos de disparo con efectos distintos: normal, rápido, escopeta, rebote, congelar, explosivo.
- [ ] Puntuación estilo Balatro: `base × multiplicador`, combo por aciertos consecutivos y *headshots*; números flotantes y feedback visual.
- [ ] 3–4 reliquias con hooks sobre eventos (`onHit`, `onKill`, `onWaveEnd`).
- [ ] Tienda entre puestos: comprar cartas/reliquias, quitar cartas, gestionar tickets.
- [ ] Bucle de partida: 3 puestos → pantalla de resumen → victoria/derrota → reiniciar.

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
3. **Apuntar y disparar** a los patitos que cruzan el puesto con balas limitadas y tiempo contado.
4. **Sumar puntos**: cada patito tiene valor base; los combos, precisión y reliquias multiplican el resultado.
5. **Cumplir la cuota** del puesto para avanzar; si no, se acaba la partida.
6. **Comprar** en la tienda con tickets: nuevas cartas, reliquias o quitar cartas malas.
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
- **Clic izquierdo**: disparar (gasta una bala).
- **Clic tras el fin del puesto**: repetir ronda.

## Estructura prevista

```
src/
  main.ts              # config de Phaser y arranque
  scenes/              # Boot, Menu, Game, Hud, Shop, Summary
  data/                # definiciones de cartas, reliquias y puestos (data-driven)
  game/
    logic/             # lógica pura: scoring, baraja, economía (testeable)
    systems/           # spawn, combos, hooks de reliquias
  art/                 # sprites y paletas (Aseprite / PNG)
AGENTS.md              # convenciones para agentes y contribuidores
```

## Roadmap (después de la demo)

Puestos jefes, mapa ramificado, más reliquias y cartas, retos diarios, shader CRT y versión móvil con controles táctiles.

---

Repositorio: `mariodod/feria-patitos`.
