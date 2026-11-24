export type ShotCardId = 'normal' | 'precision' | 'scatter' | 'ricochet' | 'freeze';

export interface ShotCard {
  id: ShotCardId;
  name: string;
  description: string;
  /** Radio de impacto en píxeles internos. */
  radius: number;
  /** Multiplicador de los dólares conseguidos. */
  multiplier: number;
  ammoCost: number;
  /** Patitos que puede derribar un disparo. */
  hits: number;
  /** Segundos que ralentiza los patitos; 0 si no ralentiza. */
  slow: number;
  price: number;
  color: number;
  hex: string;
}

export const CARDS: Record<ShotCardId, ShotCard> = {
  normal: {
    id: 'normal',
    name: 'NORMAL',
    description: 'Disparo estándar',
    radius: 13,
    multiplier: 1,
    ammoCost: 1,
    hits: 1,
    slow: 0,
    price: 20,
    color: 0xfff1e6,
    hex: '#fff1e6',
  },
  precision: {
    id: 'precision',
    name: 'PRECISIÓN',
    description: 'Mira pequeña, el doble de dólares',
    radius: 7,
    multiplier: 2,
    ammoCost: 1,
    hits: 1,
    slow: 0,
    price: 35,
    color: 0xffd166,
    hex: '#ffd166',
  },
  scatter: {
    id: 'scatter',
    name: 'ESCOPETA',
    description: 'Mira ancha, gana menos',
    radius: 22,
    multiplier: 0.7,
    ammoCost: 2,
    hits: 1,
    slow: 0,
    price: 30,
    color: 0xff8f6b,
    hex: '#ff8f6b',
  },
  ricochet: {
    id: 'ricochet',
    name: 'REBOTE',
    description: 'Puede derribar dos patitos',
    radius: 13,
    multiplier: 1,
    ammoCost: 1,
    hits: 2,
    slow: 0,
    price: 40,
    color: 0x8be9fd,
    hex: '#8be9fd',
  },
  freeze: {
    id: 'freeze',
    name: 'CONGELAR',
    description: 'Ralentiza los rieles 2,5 s',
    radius: 13,
    multiplier: 1,
    ammoCost: 1,
    hits: 1,
    slow: 2.5,
    price: 35,
    color: 0xb39cff,
    hex: '#b39cff',
  },
};

export const CARD_IDS = Object.keys(CARDS) as ShotCardId[];

export const STARTING_DECK: ShotCardId[] = [
  'normal',
  'normal',
  'normal',
  'normal',
  'precision',
  'precision',
  'scatter',
  'scatter',
  'ricochet',
  'freeze',
];
