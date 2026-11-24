import Phaser from 'phaser';
import {
  CARD_H,
  CARD_STEP,
  CARD_W,
  CARD_X,
  CARD_Y,
  GAME_WIDTH,
} from '../game/constants';
import { HUD_STATE_EVENT, SELECT_SHELL_EVENT, type HudState } from '../game/events';
import { pixelText } from '../game/systems/text';

export class HudScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private dollarsText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private bossText!: Phaser.GameObjects.Text;
  private bar!: Phaser.GameObjects.Graphics;
  private bossBar!: Phaser.GameObjects.Graphics;
  private slotBg: Phaser.GameObjects.Graphics[] = [];
  private slotName: Phaser.GameObjects.Text[] = [];
  private slotCost: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('hud');
  }

  create(): void {
    this.slotBg = [];
    this.slotName = [];
    this.slotCost = [];

    this.levelText = pixelText(this, 8, 6, '', 10);
    this.dollarsText = pixelText(this, GAME_WIDTH / 2, 6, '', 10, '#ffd166').setOrigin(0.5, 0);
    this.ammoText = pixelText(this, GAME_WIDTH - 8, 6, '', 10).setOrigin(1, 0);
    this.weaponText = pixelText(this, 8, 20, '', 8, '#8be9fd');
    this.bossText = pixelText(this, 8, 208, '', 8, '#ff9f1c');
    this.bar = this.add.graphics();
    this.bossBar = this.add.graphics();

    for (let i = 0; i < 4; i += 1) {
      const x = CARD_X + i * CARD_STEP;
      this.slotBg.push(this.add.graphics());
      this.slotName.push(pixelText(this, x + 6, CARD_Y + 7, '', 9));
      this.slotCost.push(
        pixelText(this, x + CARD_W - 6, CARD_Y + CARD_H - 16, '', 8, '#ffd166').setOrigin(1, 0),
      );
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.worldY < CARD_Y || pointer.worldY > CARD_Y + CARD_H) return;
      const index = Math.floor((pointer.worldX - CARD_X) / CARD_STEP);
      if (index < 0 || index > 3) return;
      const localX = pointer.worldX - (CARD_X + index * CARD_STEP);
      if (localX < 0 || localX > CARD_W) return;
      this.game.events.emit(SELECT_SHELL_EVENT, index);
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
    this.weaponText.setText(
      state.selected === -1 ? 'ESCOPETA BASE · CLIC PARA DISPARAR' : `CARTUCHO ${state.selected + 1}`,
    );

    const pct = Phaser.Math.Clamp(state.earned / state.quota, 0, 1);
    const width = GAME_WIDTH - 16;
    this.bar.clear();
    this.bar.fillStyle(0x000000, 0.55);
    this.bar.fillRect(8, 18, width, 5);
    this.bar.fillStyle(pct >= 1 ? 0x6bd68a : 0xff5d73);
    this.bar.fillRect(9, 19, (width - 2) * pct, 3);

    if (!state.boss) {
      this.bossText.setText('');
      this.bossBar.clear();
    } else {
      this.bossText.setText(`${state.boss.name}  ${state.boss.hp}/${state.boss.maxHp}`);
      const bossPct = Phaser.Math.Clamp(state.boss.hp / state.boss.maxHp, 0, 1);
      this.bossBar.clear();
      this.bossBar.fillStyle(0x000000, 0.6);
      this.bossBar.fillRect(8, 216, 200, 5);
      this.bossBar.fillStyle(0xff9f1c);
      this.bossBar.fillRect(9, 217, 198 * bossPct, 3);
    }

    for (let i = 0; i < 4; i += 1) {
      const shell = state.shells[i];
      const bg = this.slotBg[i];
      bg.clear();

      const x = CARD_X + i * CARD_STEP;
      const selected = state.selected === i;
      const border = selected ? 0xffd166 : shell ? parseInt(shell.hex.slice(1), 16) : 0x3a3a52;

      bg.fillStyle(0x161726, 0.94);
      bg.fillRect(x, CARD_Y, CARD_W, CARD_H);
      bg.lineStyle(selected ? 2 : 1, border);
      bg.strokeRect(x, CARD_Y, CARD_W, CARD_H);

      this.slotName[i].setText(shell ? `${i + 1} · ${shell.name}` : `${i + 1} · VACÍO`);
      this.slotName[i].setColor(shell ? '#fff1e6' : '#5a5a72');
      this.slotCost[i].setText(shell ? `${shell.cost} BALA${shell.cost === 1 ? '' : 'S'}` : '');
    }
  }
}
