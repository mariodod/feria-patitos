import { STARTING_DECK, type ShotCardId } from '../data/cards';

export interface RunState {
  dollars: number;
  deck: ShotCardId[];
  relics: string[];
  stallIndex: number;
}

export function createRun(): RunState {
  return { dollars: 0, deck: [...STARTING_DECK], relics: [], stallIndex: 0 };
}

export const run: RunState = createRun();

export function resetRun(): void {
  Object.assign(run, createRun());
}

/** Ofertas de la tienda; se regeneran al entrar en cada tienda. */
export const shop: { offers: ShotCardId[]; relic: string | null } = {
  offers: [],
  relic: null,
};

export function prepareShop(): void {
  shop.offers = [];
  shop.relic = null;
}
