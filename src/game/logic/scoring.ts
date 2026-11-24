import { SCORING } from '../../data/levels';

/** Puntos por un impacto. Los patitos dorados duplican cualquier zona. */
export function scoreHit(bullseye: boolean, gold: boolean): number {
  const base = bullseye ? SCORING.bullseyePoints : SCORING.bodyPoints;
  return gold ? base * 2 : base;
}
