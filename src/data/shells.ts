export type ShellId = 'precision' | 'scatter' | 'ricochet' | 'freeze';

export interface Shell {
  id: ShellId;
  name: string;
  description: string;
  /** Radio de impacto; sustituye al de la escopeta base. */
  radius: number;
  /** Multiplicador de los dólares conseguidos. */
  multiplier: number;
  ammoCost: number;
  /** Patitos extra que puede derribar además del primero. */
  extraTargets: number;
  /** Segundos de ralentización al disparar. */
  slow: number;
  /** Daño extra sobre el daño base del arma. */
  damage: number;
  price: number;
  hex: string;
}

/** La escopeta base siempre está disponible con clic; no es un cartucho. */
export const SHOTGUN = {
  radius: 13,
  multiplier: 1,
  ammoCost: 1,
};

export const SHELLS: Record<ShellId, Shell> = {
  precision: {
    id: 'precision',
    name: 'PRECISIÓN',
    description: 'Mira pequeña, el doble de dólares',
    radius: 7,
    multiplier: 2,
    ammoCost: 1,
    extraTargets: 0,
    slow: 0,
    damage: 1,
    price: 35,
    hex: '#ffd166',
  },
  scatter: {
    id: 'scatter',
    name: 'ESCOPETA',
    description: 'Mira ancha, cuesta 2 balas',
    radius: 22,
    multiplier: 1,
    ammoCost: 2,
    extraTargets: 0,
    slow: 0,
    damage: 0,
    price: 30,
    hex: '#ff8f6b',
  },
  ricochet: {
    id: 'ricochet',
    name: 'REBOTE',
    description: 'Derriba dos patitos',
    radius: 13,
    multiplier: 1,
    ammoCost: 1,
    extraTargets: 1,
    slow: 0,
    damage: 0,
    price: 40,
    hex: '#8be9fd',
  },
  freeze: {
    id: 'freeze',
    name: 'CONGELAR',
    description: 'Ralentiza los rieles 2,5 s',
    radius: 13,
    multiplier: 1,
    ammoCost: 1,
    extraTargets: 0,
    slow: 2.5,
    damage: 0,
    price: 35,
    hex: '#b39cff',
  },
};

export const SHELL_IDS = Object.keys(SHELLS) as ShellId[];
