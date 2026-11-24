export interface HitContext {
  dollars: number;
  bullseye: boolean;
  gold: boolean;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  price: number;
  onHit?: (ctx: HitContext) => HitContext;
  onStallStart?: (ammo: number) => number;
}

export const RELICS: Record<string, Relic> = {
  propina: {
    id: 'propina',
    name: 'PROPINA',
    description: '+$2 por cada patito derribado',
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
};

export const RELIC_IDS = Object.keys(RELICS);
