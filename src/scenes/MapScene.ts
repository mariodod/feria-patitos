import Phaser from 'phaser';
import { NODES, type StallKind } from '../data/nodes';
import { GAME_WIDTH } from '../game/constants';
import { run } from '../game/runState';
import { sfx } from '../game/systems/audio';
import { pixelText } from '../game/systems/text';

/** Mapa de nodos mínimo: solo decide cómo es el siguiente puesto. */
export class MapScene extends Phaser.Scene {
  constructor() {
    super('map');
  }

  create(): void {
    this.input.setDefaultCursor('auto');
    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, 135, GAME_WIDTH, 270, 0x0e0f1a, 0.85);

    pixelText(this, GAME_WIDTH / 2, 18, 'ELIGE TU SIGUIENTE PUESTO', 14).setOrigin(0.5, 0);
    pixelText(this, GAME_WIDTH / 2, 44, 'Elige por dónde seguir la feria', 9).setOrigin(0.5, 0);

    NODES.forEach((node, index) => {
      const x = 12 + index * 158;
      const g = this.add.graphics();
      g.fillStyle(0x1b1b3a, 0.96);
      g.fillRect(x, 76, 140, 120);
      g.lineStyle(1, parseInt(node.color.slice(1), 16));
      g.strokeRect(x, 76, 140, 120);

      pixelText(this, x + 8, 86, node.name, 9, node.color).setWordWrapWidth(124);
      pixelText(this, x + 8, 118, node.description, 8).setWordWrapWidth(124);

      this.add
        .zone(x, 76, 140, 120)
        .setOrigin(0, 0)
        .setInteractive()
        .on('pointerdown', () => this.choose(node.id));
    });

    pixelText(this, GAME_WIDTH / 2, 224, 'Solo afecta a esta partida', 8).setOrigin(0.5, 0);
  }

  private choose(kind: StallKind): void {
    run.nextKind = kind;
    sfx.buy();
    this.scene.start('game');
    this.scene.launch('hud');
  }
}
