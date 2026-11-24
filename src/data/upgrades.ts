export interface HitContext {
  dollars: number;
  bullseye: boolean;
  gold: boolean;
  aimRadius: number;
  extraTargets: number;
  slowOnHit: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  price: number;
  onHit?: (ctx: HitContext) => HitContext;
  onStallStart?: (ammo: number) => number;
}

/** Mejoras permanentes del arma y del puesto. No son cartas ni se consumen. */
export const UPGRADES: Record<string, Upgrade> = {
  miraAncha: {
    id: 'miraAncha',
    name: 'MIRA ANCHA',
    description: '+5 al radio de impacto',
    price: 30,
    onHit: (ctx) => ({ ...ctx, aimRadius: ctx.aimRadius + 5 }),
  },
  canon: {
    id: 'canon',
    name: 'CAÑÓN REFORZADO',
    description: 'Los dólares ×1,25',
    price: 55,
    onHit: (ctx) => ({ ...ctx, dollars: ctx.dollars * 1.25 }),
  },
  rebote: {
    id: 'rebote',
    name: 'REBOTE',
    description: '+1 patito por disparo',
    price: 45,
    onHit: (ctx) => ({ ...ctx, extraTargets: ctx.extraTargets + 1 }),
  },
  lento: {
    id: 'lento',
    name: 'PATITOS LENTOS',
    description: 'Ralentiza 2 s al disparar',
    price: 40,
    onHit: (ctx) => ({ ...ctx, slowOnHit: Math.max(ctx.slowOnHit, 2) }),
  },
  propina: {
    id: 'propina',
    name: 'PROPINA',
    description: '+$2 por cada patito',
    price: 45,
    onHit: (ctx) => ({ ...ctx, dollars: ctx.dollars + 2 }),
  },
  cinturon: {
    id: 'cinturon',
    name: 'CINTURÓN',
    description: '+4 balas en cada puesto',
    price: 40,
    onStallStart: (ammo) => ammo + 4,
  },
  dianaOro: {
    id: 'dianaOro',
    name: 'DIANA DE ORO',
    description: '+$5 al acertar en la diana',
    price: 50,
    onHit: (ctx) => ({ ...ctx, dollars: ctx.dollars + (ctx.bullseye ? 5 : 0) }),
  },
  dorado: {
    id: 'dorado',
    name: 'OJO PARA EL ORO',
    description: '+$10 por patito dorado',
    price: 45,
    onHit: (ctx) => ({ ...ctx, dollars: ctx.dollars + (ctx.gold ? 10 : 0) }),
  },
};

export const UPGRADE_IDS = Object.keys(UPGRADES);
