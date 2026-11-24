export interface MetaState {
  totalDollars: number;
  bestRun: number;
  unlocked: string[];
}

const KEY = 'feria-patitos-meta-v1';
const EMPTY: MetaState = { totalDollars: 0, bestRun: 0, unlocked: [] };

/** Umbrales de desbloqueo. Solo persisten estos permisos, nunca mejoras de una partida. */
const UNLOCKS = [
  { id: 'canon', at: 150 },
  { id: 'freeze', at: 250 },
  { id: 'dianaOro', at: 400 },
  { id: 'perforante', at: 600 },
  { id: 'martillo', at: 1000 },
];

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, unlocked: [] };
    const parsed = JSON.parse(raw) as Partial<MetaState>;
    return {
      totalDollars: typeof parsed.totalDollars === 'number' ? parsed.totalDollars : 0,
      bestRun: typeof parsed.bestRun === 'number' ? parsed.bestRun : 0,
      unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked : [],
    };
  } catch {
    return { ...EMPTY, unlocked: [] };
  }
}

export function saveMeta(meta: MetaState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(meta));
  } catch {
    // Almacenamiento no disponible: la partida sigue siendo jugable.
  }
}

export function recordRun(dollars: number): string[] {
  const meta = loadMeta();
  meta.totalDollars += dollars;
  meta.bestRun = Math.max(meta.bestRun, dollars);

  const fresh: string[] = [];
  for (const rule of UNLOCKS) {
    if (meta.totalDollars >= rule.at && !meta.unlocked.includes(rule.id)) {
      meta.unlocked.push(rule.id);
      fresh.push(rule.id);
    }
  }
  saveMeta(meta);
  return fresh;
}

/** Contenido disponible desde la primera partida; el resto se desbloquea. */
const BASE_CONTENT = [
  'precision',
  'scatter',
  'ricochet',
  'miraAncha',
  'propina',
  'cinturon',
  'rebote',
  'lento',
  'dorado',
];

export function isUnlocked(id: string): boolean {
  return BASE_CONTENT.includes(id) || loadMeta().unlocked.includes(id);
}
