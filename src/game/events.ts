export const HUD_STATE_EVENT = 'hud:state';

export interface HudState {
  levelName: string;
  score: number;
  quota: number;
  ammo: number;
  ammoMax: number;
  ducksRemaining: number;
  ducksTotal: number;
  wave: number;
  waves: number;
}
