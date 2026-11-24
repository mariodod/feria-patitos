import type { StallKind } from '../data/nodes';
import type { ShellId } from '../data/shells';

export interface RunState {
  dollars: number;
  /** Cartuchos especiales consumibles; el jugador empieza sin ninguno. */
  shells: ShellId[];
  /** Mejoras permanentes del arma y del puesto (solo durante esta partida). */
  upgrades: string[];
  stallIndex: number;
  nextKind: StallKind;
}

export function createRun(): RunState {
  return { dollars: 0, shells: [], upgrades: [], stallIndex: 0, nextKind: 'classic' };
}

export const run: RunState = createRun();

export function resetRun(): void {
  Object.assign(run, createRun());
}

/** Ofertas de la tienda; se conservan entre compras y solo cambian al refrescar. */
export const shop: {
  upgrades: (string | null)[];
  shell: ShellId | null;
  shellSold: boolean;
  ready: boolean;
} = {
  upgrades: [],
  shell: null,
  shellSold: false,
  ready: false,
};

export function prepareShop(): void {
  shop.upgrades = [];
  shop.shell = null;
  shop.shellSold = false;
  shop.ready = false;
}
