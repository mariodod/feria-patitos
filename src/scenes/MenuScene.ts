import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import { loadMeta } from '../game/meta';
import { resetRun } from '../game/runState';
import { unlockAudio } from '../game/systems/audio';
import { pixelText } from '../game/systems/text';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create(): void {
    this.input.setDefaultCursor('auto');
    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0e0f1a, 0.6);

    pixelText(this, GAME_WIDTH / 2, 82, 'FERIA DE PATITOS', 18).setOrigin(0.5);
    pixelText(
      this,
      GAME_WIDTH / 2,
      126,
      'Dispara con la escopeta. Compra mejoras y cartuchos.\nCuerpo $10 · Diana $25 · Dorado el doble',
      10,
    )
      .setOrigin(0.5)
      .setAlign('center');

    const prompt = pixelText(this, GAME_WIDTH / 2, 182, 'CLIC PARA EMPEZAR', 12).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, yoyo: true, repeat: -1, duration: 650 });

    const meta = loadMeta();
    pixelText(
      this,
      GAME_WIDTH / 2,
      150,
      `DÓLARES TOTALES: $${meta.totalDollars} · DESBLOQUEOS: ${meta.unlocked.length}`,
      8,
      '#8be9fd',
    ).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      unlockAudio();
      resetRun();
      this.scene.start('game');
      this.scene.launch('hud');
    });
  }
}
