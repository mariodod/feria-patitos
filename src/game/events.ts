export const HUD_STATE_EVENT = 'hud:state';
export const SELECT_CARD_EVENT = 'select:card';

export interface CardView {
  id: string;
  name: string;
  cost: number;
  color: string;
  selected: boolean;
  affordable: boolean;
}

export interface HudState {
  levelName: string;
  earned: number;
  quota: number;
  ammo: number;
  ammoMax: number;
  hand: CardView[];
}
