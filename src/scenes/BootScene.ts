import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import { LANES } from '../data/levels';

interface DuckColors {
  body: number;
  wing: number;
  beak: number;
}

/** Generates every texture in code so the demo needs no image files. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.makeDuckTexture('duck', { body: 0xf4d35e, wing: 0xffe9a8, beak: 0xef6f6c });
    this.makeDuckTexture('duck-gold', { body: 0xffc300, wing: 0xffe57a, beak: 0xe05a3c });
    this.makeCrosshair();
    this.makeSpark();
    this.makeBackdrop();
    this.scene.start('menu');
  }

  private makeDuckTexture(key: string, colors: DuckColors): void {
    const g = this.make.graphics({}, false);

    g.fillStyle(0x9b6b3f);
    g.fillRect(7, 12, 2, 8);
    g.fillStyle(0xc98b52);
    g.fillRect(7, 12, 1, 8);

    g.fillStyle(colors.body);
    g.fillRect(3, 3, 10, 9);
    g.fillRect(9, 1, 5, 5);
    g.fillRect(1, 4, 2, 4);
    g.fillStyle(colors.wing);
    g.fillRect(4, 5, 5, 3);
    g.fillStyle(colors.beak);
    g.fillRect(14, 3, 2, 2);
    g.fillStyle(0x1b1b2f);
    g.fillRect(12, 2, 1, 1);

    g.fillStyle(0xfff1e6);
    g.fillCircle(7, 7, 3);
    g.fillStyle(0xe63946);
    g.fillCircle(7, 7, 2);
    g.fillStyle(0x9b1d2b);
    g.fillCircle(7, 7, 1);

    g.generateTexture(key, 16, 20);
    g.destroy();
  }

  private makeCrosshair(): void {
    const g = this.make.graphics({}, false);
    g.lineStyle(1, 0xffffff);
    g.strokeCircle(4, 4, 3);
    g.fillStyle(0xff5d73);
    g.fillRect(4, 4, 1, 1);
    g.generateTexture('crosshair', 9, 9);
    g.destroy();
  }

  private makeSpark(): void {
    const g = this.make.graphics({}, false);
    g.fillStyle(0xfff1e6);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture('spark', 2, 2);
    g.destroy();
  }

  private makeBackdrop(): void {
    const g = this.make.graphics({}, false);
    g.fillStyle(0x1b1b3a);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let i = 0; i < 12; i += 1) {
      g.fillStyle(i % 2 === 0 ? 0xff5d73 : 0xfff1e6);
      g.fillRect(i * 40, 0, 40, 10);
    }

    g.fillStyle(0x2d2b55);
    g.fillRect(0, 10, GAME_WIDTH, 188);

    for (const lane of LANES) {
      g.fillStyle(0x5a3d29);
      g.fillRect(0, lane - 2, GAME_WIDTH, 5);
      g.fillStyle(0xc98b52);
      g.fillRect(0, lane - 2, GAME_WIDTH, 1);
      g.fillStyle(0x2a1b16);
      g.fillRect(0, lane + 2, GAME_WIDTH, 1);
    }

    g.fillStyle(0x6b4f8a);
    g.fillRect(0, 198, GAME_WIDTH, 12);
    g.fillStyle(0x3a2e4d);
    g.fillRect(0, 210, GAME_WIDTH, GAME_HEIGHT - 210);

    g.generateTexture('backdrop', GAME_WIDTH, GAME_HEIGHT);
    g.destroy();
  }
}
