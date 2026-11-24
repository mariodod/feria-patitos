import Phaser from 'phaser';
import {
  CARD_H,
  CARD_STEP,
  CARD_W,
  CARD_X,
  CARD_Y,
  GAME_WIDTH,
  HAND_SIZE,
} from '../game/constants';
import { HUD_STATE_EVENT, SELECT_CARD_EVENT, type HudState } from '../game/events';
import { pixelText } from '../game/systems/text';

export class HudScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private dollarsText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private bar!: Phaser.GameObjects.Graphics;
  private cardBg: Phaser.GameObjects.Graphics[] = [];
  private cardName: Phaser.GameObjects.Text[] = [];
  private cardCost: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('hud');
  }

  create(): void {
    this.cardBg = [];
    this.cardName = [];
    this.cardCost = [];

    this.levelText = pixelText(this, 8, 6, '', 10);
    this.dollarsText = pixelText(this, GAME_WIDTH / 2, 6, '', 10, '#ffd166').setOrigin(0.5, 0);
    this.ammoText = pixelText(this, GAME_WIDTH - 8, 6, '', 10).setOrigin(1, 0);
    this.bar = this.add.graphics();

    for (let i = 0; i < HAND_SIZE; i += 1) {
      const x = CARD_X + i * CARD_STEP;
      this.cardBg.push(this.add.graphics());
      this.cardName.push(pixelText(this, x + 6, CARD_Y + 7, '', 9));
      this.cardCost.push(
        pixelText(this, x + CARD_W - 6, CARD_Y + CARD_H - 16, '', 8, '#ffd166').setOrigin(1, 0),
      );
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.worldY < CARD_Y || pointer.worldY > CARD_Y + CARD_H) return;
      const index = Math.floor((pointer.worldX - CARD_X) / CARD_STEP);
      if (index < 0 || index >= HAND_SIZE) return;
      const localX = pointer.worldX - (CARD_X + index * CARD_STEP);
      if (localX < 0 || localX > CARD_W) return;
      this.game.events.emit(SELECT_CARD_EVENT, index);
    });

    this.game.events.on(HUD_STATE_EVENT, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(HUD_STATE_EVENT, this.render, this);
    });
  }

  private render(state: HudState): void {
    this.levelText.setText(state.levelName);
    this.dollarsText.setText(`$${state.earned} / $${state.quota}`);
    this.ammoText.setText(`BALAS ${state.ammo}/${state.ammoMax}`);

    const pct = Phaser.Math.Clamp(state.earned / state.quota, 0, 1);
    const width = GAME_WIDTH - 16;
    this.bar.clear();
    this.bar.fillStyle(0x000000, 0.55);
    this.bar.fillRect(8, 18, width, 5);
    this.bar.fillStyle(pct >= 1 ? 0x6bd68a : 0xff5d73);
    this.bar.fillRect(9, 19, (width - 2) * pct, 3);

    for (let i = 0; i < HAND_SIZE; i += 1) {
      const card = state.hand[i];
      const bg = this.cardBg[i];
      bg.clear();

      if (!card) {
        this.cardName[i].setText('');
        this.cardCost[i].setText('');
        continue;
      }

      const x = CARD_X + i * CARD_STEP;
      const border = card.selected ? 0xffd166 : parseInt(card.color.slice(1), 16);
      bg.fillStyle(0x161726, 0.94);
      bg.fillRect(x, CARD_Y, CARD_W, CARD_H);
      bg.lineStyle(card.selected ? 2 : 1, border);
      bg.strokeRect(x, CARD_Y, CARD_W, CARD_H);

      this.cardName[i].setText(card.name);
      this.cardName[i].setColor(card.affordable ? '#fff1e6' : '#7a7a8a');
      this.cardCost[i].setText(`${card.cost} BALA${card.cost === 1 ? '' : 'S'}`);
      this.cardCost[i].setColor(card.affordable ? '#ffd166' : '#7a7a8a');
    }
  }
}
