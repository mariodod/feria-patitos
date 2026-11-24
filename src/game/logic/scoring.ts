import { SCORING } from '../../data/levels';

export type DuckKind = 'normal' | 'metal' | 'boss';

/** Dólares por impacto. Los blindados y el jefe pagan más. */
export function scoreHit(bullseye: boolean, gold: boolean, kind: DuckKind = 'normal'): number {
  const zone = bullseye ? SCORING.bullseyePoints : SCORING.bodyPoints;
  const kindMultiplier =
    kind === 'boss'
      ? SCORING.bossMultiplier
      : kind === 'metal'
        ? SCORING.metalMultiplier
        : 1;
  const goldMultiplier = gold ? 2 : 1;
  return Math.round(zone * kindMultiplier * goldMultiplier);
}
