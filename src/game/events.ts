export const HUD_STATE_EVENT = 'hud:state';
export const SELECT_SHELL_EVENT = 'select:shell';

export interface ShellView {
  id: string;
  name: string;
  cost: number;
  hex: string;
}

export interface HudState {
  levelName: string;
  earned: number;
  quota: number;
  ammo: number;
  ammoMax: number;
  /** Cuatro ranuras; null significa vacía. */
  shells: (ShellView | null)[];
  /** -1 = escopeta base, 0..3 = cartucho seleccionado. */
  selected: number;
  /** Barra de vida del jefe mientras siga en pantalla. */
  boss: { name: string; hp: number; maxHp: number } | null;
}
