import Phaser from 'phaser';
import { GAME_WIDTH } from '../game/constants';
import { HUD_STATE_EVENT, type HudState } from '../game/events';
import { pixelText } from '../game/systems/text';

export class HudScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  private bar!: Phaser.GameObjects.Graphics;

  constructor() {
    super('hud');
  }

  create(): void {
    this.levelText = pixelText(this, 8, 6, '', 10);
    this.scoreText = pixelText(this, GAME_WIDTH / 2, 6, '', 10).setOrigin(0.5, 0);
    this.ammoText = pixelText(this, GAME_WIDTH - 8, 6, '', 10).setOrigin(1, 0);
    this.infoText = pixelText(this, GAME_WIDTH / 2, 20, '', 10).setOrigin(0.5, 0);
    this.bar = this.add.graphics();

    this.game.events.on(HUD_STATE_EVENT, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(HUD_STATE_EVENT, this.render, this);
    });
  }

  private render(state: HudState): void {
    this.levelText.setText(state.levelName);
    this.scoreText.setText(`${state.score}/${state.quota}`);
    this.ammoText.setText(`BALAS ${state.ammo}/${state.ammoMax}`);
    this.infoText.setText(
      `OLEADA ${state.wave}/${state.waves}   PATITOS ${state.ducksRemaining}/${state.ducksTotal}`,
    );

    const pct = Phaser.Math.Clamp(state.score / state.quota, 0, 1);
    const width = GAME_WIDTH - 16;
    this.bar.clear();
    this.bar.fillStyle(0x000000, 0.55);
    this.bar.fillRect(8, 250, width, 8);
    this.bar.fillStyle(pct >= 1 ? 0x6bd68a : 0xff5d73);
    this.bar.fillRect(9, 251, (width - 2) * pct, 6);
  }
}
