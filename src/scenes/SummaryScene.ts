import Phaser from 'phaser';
import { GAME_WIDTH } from '../game/constants';
import { recordRun } from '../game/meta';
import { run } from '../game/runState';
import { pixelText } from '../game/systems/text';

interface SummaryData {
  success: boolean;
  reason?: 'win' | 'quota' | 'ammo';
  earned?: number;
  quota?: number;
  lastShot?: { hit: boolean; dollars: number; bullseye: boolean };
}

export class SummaryScene extends Phaser.Scene {
  private summaryData: SummaryData = { success: false };

  constructor() {
    super('summary');
  }

  init(data: SummaryData): void {
    this.summaryData = data;
  }

  create(): void {
    this.input.setDefaultCursor('auto');
    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, 135, GAME_WIDTH, 270, 0x0e0f1a, 0.85);

    const success = this.summaryData.success;
    pixelText(
      this,
      GAME_WIDTH / 2,
      48,
      success ? '¡FERIA COMPLETADA!' : 'PARTIDA TERMINADA',
      16,
      success ? '#6bd68a' : '#ff5d73',
    ).setOrigin(0.5, 0);

    const reason = success ? 'PUESTO SUPERADO' : this.reasonText();
    pixelText(this, GAME_WIDTH / 2, 78, reason, 10, success ? '#6bd68a' : '#ffd166').setOrigin(
      0.5,
      0,
    );

    pixelText(this, GAME_WIDTH / 2, 104, `DÓLARES: $${run.dollars}`, 12, '#ffd166').setOrigin(
      0.5,
      0,
    );
    pixelText(this, GAME_WIDTH / 2, 128, this.lastShotText(), 9, '#8be9fd').setOrigin(0.5, 0);
    pixelText(
      this,
      GAME_WIDTH / 2,
      150,
      `Mejoras: ${run.upgrades.length} · Cartuchos: ${run.shells.length}/4`,
      9,
    ).setOrigin(0.5, 0);

    const unlocked = recordRun(run.dollars);
    if (unlocked.length > 0) {
      pixelText(
        this,
        GAME_WIDTH / 2,
        170,
        `DESBLOQUEADO: ${unlocked.join(', ')}`,
        9,
        '#b39cff',
      ).setOrigin(0.5, 0);
    }

    const prompt = pixelText(this, GAME_WIDTH / 2, 202, 'CLIC PARA VOLVER AL MENÚ', 11).setOrigin(
      0.5,
      0,
    );
    this.tweens.add({ targets: prompt, alpha: 0.3, yoyo: true, repeat: -1, duration: 650 });

    this.input.once('pointerdown', () => this.scene.start('menu'));
  }

  private reasonText(): string {
    if (this.summaryData.reason === 'ammo') return 'TE QUEDASTE SIN BALAS';
    const earned = this.summaryData.earned ?? run.dollars;
    const quota = this.summaryData.quota ?? 0;
    return `CUOTA NO ALCANZADA  $${earned}/$${quota}`;
  }

  private lastShotText(): string {
    const shot = this.summaryData.lastShot;
    if (!shot) return '';
    if (!shot.hit) return 'Último disparo: al aire';
    if (shot.dollars === 0) return 'Último disparo: sin efecto';
    return `Último disparo: +$${shot.dollars}${shot.bullseye ? ' (DIANA)' : ''}`;
  }
}
