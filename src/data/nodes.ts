export type StallKind = 'classic' | 'fast' | 'mystery';

export interface StallNode {
  id: StallKind;
  name: string;
  description: string;
  color: string;
}

/** Nodos entre puestos: solo cambian el siguiente puesto, no se guardan entre partidas. */
export const NODES: StallNode[] = [
  {
    id: 'classic',
    name: 'PUESTO CLÁSICO',
    description: 'Patitos a ritmo normal',
    color: '#fff1e6',
  },
  {
    id: 'fast',
    name: 'PUESTO RÁPIDO',
    description: 'Más velocidad, cuota +10%',
    color: '#ff8f6b',
  },
  {
    id: 'mystery',
    name: 'PUESTO MISTERIOSO',
    description: 'Más patitos dorados, cuota -10%',
    color: '#b39cff',
  },
];
