/** Carriles horizontales sobre los que se deslizan los patitos. */
export const LANES = [70, 120, 170];

export const SCORING = {
  /** Puntos por dar al cuerpo. Ponlo a 0 para que solo cuente la diana. */
  bodyPoints: 10,
  /** Puntos por dar en el círculo rojo de la diana. */
  bullseyePoints: 25,
  /** Radio de impacto sobre el cuerpo, en píxeles internos. */
  bodyRadius: 13,
  /** Radio del círculo rojo, en píxeles internos. */
  bullseyeRadius: 4,
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
}

export interface LevelDefinition {
  id: string;
  name: string;
  ammo: number;
  quota: number;
  waves: number;
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

/** Los tres puestos de una partida. Cada uno es más rápido y exige más dólares. */
export const LEVELS: LevelDefinition[] = [
  LEVEL_1,
  {
    ...LEVEL_1,
    id: 'puesto-2',
    name: 'PUESTO 2 · PATITOS',
    quota: 130,
    ducks: LEVEL_1.ducks.map((duck, i) => ({
      ...duck,
      spawnAt: Math.max(200, duck.spawnAt - 300),
      speed: duck.speed + 5,
      gold: i === 2 || i === 7,
    })),
  },
  {
    ...LEVEL_1,
    id: 'puesto-3',
    name: 'PUESTO 3 · PATITOS',
    quota: 160,
    ducks: LEVEL_1.ducks.map((duck, i) => ({
      ...duck,
      spawnAt: Math.max(150, duck.spawnAt - 500),
      speed: duck.speed + 9,
      gold: i === 4 || i === 10,
    })),
  },
];
