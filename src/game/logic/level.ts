import type { LevelDefinition } from '../../data/levels';
import type { StallKind } from '../../data/nodes';

/** Patitos que faltan por aparecer más los que siguen en el riel. */
export function remainingTargets(level: LevelDefinition, nextSpawn: number, alive: number): number {
  return level.ducks.length - nextSpawn + alive;
}

export function currentWave(level: LevelDefinition, nextSpawn: number): number {
  if (nextSpawn < level.ducks.length) return level.ducks[nextSpawn].wave;
  return level.ducks[level.ducks.length - 1]?.wave ?? 1;
}

export function isLevelComplete(nextSpawn: number, total: number, alive: number): boolean {
  return nextSpawn >= total && alive === 0;
}

/** Aplica el nodo elegido en el mapa al puesto que viene. */
export function applyStallKind(level: LevelDefinition, kind: StallKind): LevelDefinition {
  if (kind === 'fast') {
    return {
      ...level,
      quota: Math.round(level.quota * 1.1),
      ducks: level.ducks.map((duck) => ({ ...duck, speed: duck.speed * 1.25 })),
    };
  }
  if (kind === 'mystery') {
    return {
      ...level,
      quota: Math.round(level.quota * 0.9),
      ducks: level.ducks.map((duck, index) => (index % 3 === 0 ? { ...duck, gold: true } : duck)),
    };
  }
  return level;
}
