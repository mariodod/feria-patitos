/** Carriles horizontales sobre los que se deslizan los patitos. */
export const LANES = [70, 120, 170];

export const SCORING = {
  /** Dólares por dar al cuerpo. Ponlo a 0 para que solo cuente la diana. */
  bodyPoints: 10,
  /** Dólares por dar en el círculo rojo de la diana. */
  bullseyePoints: 25,
  /** Radio de impacto sobre el cuerpo, en píxeles internos, a escala 2. */
  bodyRadius: 13,
  /** Radio del círculo rojo, en píxeles internos, a escala 2. */
  bullseyeRadius: 4,
  /** Multiplicadores por tipo de patito. */
  metalMultiplier: 2,
  bossMultiplier: 5,
};

export type DuckPattern = 'straight' | 'sine' | 'zigzag';

export interface DuckSpawn {
  /** Ms desde el inicio del puesto en que aparece este patito. */
  spawnAt: number;
  /** Índice de LANES por el que se desliza. */
  lane: number;
  /** Velocidad base en píxeles por segundo. */
  speed: number;
  /** 1 entra por la izquierda, -1 entra por la derecha. */
  direction: 1 | -1;
  /** Movimiento dentro del riel. */
  pattern: DuckPattern;
  wave: number;
  gold?: boolean;
  /** Disparos necesarios para derribarlo; 1 por defecto. */
  hp?: number;
  /** Escala del sprite; 2 por defecto, 5 para el jefe. */
  scale?: number;
  /** Patito de metal: textura blindada y más dólares. */
  metal?: boolean;
  /** Jefe: grande, mucha vida y barra de vida en el HUD. */
  boss?: boolean;
  /** Segundos que permanece antes de irse; 16 por defecto. */
  life?: number;
}

export interface LevelDefinition {
  id: string;
  name: string;
  ammo: number;
  quota: number;
  waves: number;
  bossName?: string;
  /** Lista cerrada: cada patito aparece una sola vez, en su momento. */
  ducks: DuckSpawn[];
}

export const LEVEL_1: LevelDefinition = {
  id: 'puesto-1',
  name: 'PUESTO 1 · PATITOS',
  ammo: 30,
  quota: 100,
  waves: 3,
  ducks: [
    { spawnAt: 400, lane: 0, speed: 40, direction: 1, pattern: 'straight', wave: 1 },
    { spawnAt: 1100, lane: 1, speed: 46, direction: -1, pattern: 'straight', wave: 1 },
    { spawnAt: 1800, lane: 2, speed: 38, direction: 1, pattern: 'sine', wave: 1 },
    { spawnAt: 2500, lane: 0, speed: 52, direction: -1, pattern: 'straight', wave: 1 },
    { spawnAt: 3400, lane: 1, speed: 44, direction: 1, pattern: 'sine', wave: 2 },
    { spawnAt: 4100, lane: 2, speed: 42, direction: -1, pattern: 'straight', wave: 2, gold: true },
    { spawnAt: 4800, lane: 0, speed: 50, direction: 1, pattern: 'zigzag', wave: 2 },
    { spawnAt: 5500, lane: 1, speed: 40, direction: -1, pattern: 'sine', wave: 2 },
    { spawnAt: 6200, lane: 2, speed: 46, direction: 1, pattern: 'straight', wave: 3 },
    { spawnAt: 6900, lane: 0, speed: 48, direction: -1, pattern: 'zigzag', wave: 3 },
    { spawnAt: 7600, lane: 1, speed: 44, direction: 1, pattern: 'sine', wave: 3, gold: true },
    { spawnAt: 8300, lane: 2, speed: 52, direction: -1, pattern: 'straight', wave: 3 },
  ],
};

/** Puestos 2 y 3: mismos patrones, más rápidos y con más cuota. */
const LEVEL_2: LevelDefinition = {
  ...LEVEL_1,
  id: 'puesto-2',
  name: 'PUESTO 2 · PATITOS',
  ammo: 32,
  quota: 130,
  ducks: LEVEL_1.ducks.map((duck, i) => ({
    ...duck,
    spawnAt: Math.max(200, duck.spawnAt - 300),
    speed: duck.speed + 5,
    gold: i === 2 || i === 7,
  })),
};

const LEVEL_3: LevelDefinition = {
  ...LEVEL_1,
  id: 'puesto-3',
  name: 'PUESTO 3 · PATITOS',
  ammo: 34,
  quota: 160,
  ducks: LEVEL_1.ducks.map((duck, i) => ({
    ...duck,
    spawnAt: Math.max(150, duck.spawnAt - 500),
    speed: duck.speed + 9,
    gold: i === 4 || i === 10,
  })),
};

/** Puesto 4: aparecen los primeros patitos de metal (2 impactos). */
const LEVEL_4: LevelDefinition = {
  ...LEVEL_1,
  id: 'puesto-4',
  name: 'PUESTO 4 · PATITOS DE METAL',
  ammo: 38,
  quota: 190,
  ducks: LEVEL_1.ducks.map((duck, i) => ({
    ...duck,
    spawnAt: Math.max(150, duck.spawnAt - 600),
    speed: duck.speed + 11,
    metal: i % 4 === 1,
    hp: i % 4 === 1 ? 2 : 1,
    gold: i === 5 || i === 10,
  })),
};

/** Puesto final: patitos de metal y el Pato Rey, que aguanta 12 impactos. */
const LEVEL_5: LevelDefinition = {
  id: 'puesto-5',
  name: 'PUESTO FINAL · EL PATO REY',
  ammo: 45,
  quota: 240,
  waves: 3,
  bossName: 'EL PATO REY',
  ducks: [
    { spawnAt: 400, lane: 0, speed: 46, direction: 1, pattern: 'straight', wave: 1 },
    { spawnAt: 1100, lane: 1, speed: 50, direction: -1, pattern: 'sine', wave: 1 },
    { spawnAt: 1800, lane: 2, speed: 48, direction: 1, pattern: 'straight', wave: 1, metal: true, hp: 2 },
    { spawnAt: 2600, lane: 0, speed: 54, direction: -1, pattern: 'zigzag', wave: 1 },
    { spawnAt: 3400, lane: 1, speed: 52, direction: 1, pattern: 'straight', wave: 2, gold: true },
    { spawnAt: 4200, lane: 2, speed: 50, direction: -1, pattern: 'sine', wave: 2, metal: true, hp: 3 },
    { spawnAt: 6000, lane: 2, speed: 16, direction: 1, pattern: 'straight', wave: 2, boss: true, hp: 12, scale: 5, life: 45 },
    { spawnAt: 7200, lane: 0, speed: 56, direction: -1, pattern: 'zigzag', wave: 3 },
    { spawnAt: 8000, lane: 1, speed: 52, direction: 1, pattern: 'sine', wave: 3, metal: true, hp: 2 },
  ],
};

export const LEVELS: LevelDefinition[] = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];
