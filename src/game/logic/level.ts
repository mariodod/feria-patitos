import type { LevelDefinition } from '../../data/levels';

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
