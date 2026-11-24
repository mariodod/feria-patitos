import type { ShotCardId } from '../../data/cards';

export interface DeckState {
  draw: ShotCardId[];
  hand: ShotCardId[];
  discard: ShotCardId[];
}

function shuffle(cards: ShotCardId[], random: () => number): ShotCardId[] {
  const out = cards.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function startHand(deck: ShotCardId[], size: number, random: () => number): DeckState {
  const shuffled = shuffle(deck, random);
  return { draw: shuffled.slice(size), hand: shuffled.slice(0, size), discard: [] };
}

/** Juega una carta y rellena la mano; baraja los descartes cuando hace falta. */
export function playCard(
  state: DeckState,
  index: number,
  size: number,
  random: () => number,
): DeckState {
  const hand = state.hand.slice();
  if (index < 0 || index >= hand.length) return state;

  const [played] = hand.splice(index, 1);
  let discard = [...state.discard, played];
  let draw = state.draw.slice();

  if (hand.length < size) {
    if (draw.length < size - hand.length) {
      draw = shuffle([...draw, ...discard], random);
      discard = [];
    }
    while (hand.length < size && draw.length > 0) {
      hand.push(draw.shift() as ShotCardId);
    }
  }

  return { draw, hand, discard };
}
