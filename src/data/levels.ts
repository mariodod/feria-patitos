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

export interface DuckSpawn {
  /** Ms desde el inicio del puesto en que aparece este patito. */
  spawnAt: number;
  /** Índice de LANES por el que se desliza. */
  lane: number;
  /** Velocidad en píxeles por segundo. */
  speed: number;
  /** 1 entra por la izquierda, -1 entra por la derecha. */
  direction: 1 | -1;
}

export interface LevelDefinition {
  id: string;
  name: string;
  ammo: number;
  /** Lista cerrada: cada patito aparece una sola vez, en su momento. */
  ducks: DuckSpawn[];
}

export const LEVEL_1: LevelDefinition = {
  id: 'puesto-1',
  name: 'PUESTO 1 · PATITOS',
  ammo: 30,
  ducks: [
    { spawnAt: 400, lane: 0, speed: 34, direction: 1 },
    { spawnAt: 1100, lane: 1, speed: 42, direction: -1 },
    { spawnAt: 1800, lane: 2, speed: 30, direction: 1 },
    { spawnAt: 2500, lane: 0, speed: 48, direction: -1 },
    { spawnAt: 3200, lane: 1, speed: 36, direction: 1 },
    { spawnAt: 3900, lane: 2, speed: 44, direction: -1 },
    { spawnAt: 4600, lane: 0, speed: 32, direction: 1 },
    { spawnAt: 5300, lane: 1, speed: 50, direction: -1 },
    { spawnAt: 6000, lane: 2, speed: 38, direction: 1 },
    { spawnAt: 6700, lane: 0, speed: 46, direction: -1 },
    { spawnAt: 7400, lane: 1, speed: 34, direction: 1 },
    { spawnAt: 8100, lane: 2, speed: 40, direction: -1 },
  ],
};
