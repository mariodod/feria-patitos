import Phaser from 'phaser';
import { GAME_WIDTH } from '../game/constants';
import { run } from '../game/runState';
import { pixelText } from '../game/systems/text';

interface SummaryData {
  success: boolean;
}

export class SummaryScene extends Phaser.Scene {
  private success = false;

  constructor() {
    super('summary');
  }

  init(data: SummaryData): void {
    this.success = data.success;
  }

  create(): void {
    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, 135, GAME_WIDTH, 270, 0x0e0f1a, 0.85);

    const title = this.success ? '¡FERIA COMPLETADA!' : 'PARTIDA TERMINADA';
    pixelText(this, GAME_WIDTH / 2, 80, title, 16, this.success ? '#6bd68a' : '#ff5d73').setOrigin(
      0.5,
      0,
    );
    pixelText(this, GAME_WIDTH / 2, 120, `DÓLARES: $${run.dollars}`, 12, '#ffd166').setOrigin(
      0.5,
      0,
    );
    pixelText(
      this,
      GAME_WIDTH / 2,
      146,
      `Mazo: ${run.deck.length} cartas  ·  Reliquias: ${run.relics.length}`,
      9,
    ).setOrigin(0.5, 0);

    const prompt = pixelText(this, GAME_WIDTH / 2, 190, 'CLIC PARA VOLVER AL MENÚ', 11).setOrigin(
      0.5,
      0,
    );
    this.tweens.add({ targets: prompt, alpha: 0.3, yoyo: true, repeat: -1, duration: 650 });

    this.input.once('pointerdown', () => this.scene.start('menu'));
  }
}
