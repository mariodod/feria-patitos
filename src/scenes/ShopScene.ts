import Phaser from 'phaser';
import { SHELLS, SHELL_IDS, type ShellId } from '../data/shells';
import { UPGRADES, UPGRADE_IDS } from '../data/upgrades';
import { GAME_HEIGHT, GAME_WIDTH, SHOP_REFRESH_PRICE } from '../game/constants';
import { isUnlocked, loadMeta } from '../game/meta';
import { run, shop } from '../game/runState';
import { sfx } from '../game/systems/audio';
import { pixelText } from '../game/systems/text';

export class ShopScene extends Phaser.Scene {
  private message!: Phaser.GameObjects.Text;
  private crosshair!: Phaser.GameObjects.Image;

  constructor() {
    super('shop');
  }

  create(): void {
    this.input.setDefaultCursor('none');
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.crosshair?.setPosition(pointer.worldX, pointer.worldY);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.setDefaultCursor('auto');
    });
    this.render();
  }

  private render(): void {
    this.children.removeAll(true);

    if (!shop.ready) {
      shop.upgrades = Phaser.Math.RND.shuffle(
        UPGRADE_IDS.filter((id) => !run.upgrades.includes(id) && isUnlocked(id)),
      ).slice(0, 3);
      shop.shell = Phaser.Math.RND.pick(SHELL_IDS.filter((id) => isUnlocked(id)));
      shop.shellSold = false;
      shop.ready = true;
    }

    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, 135, GAME_WIDTH, 270, 0x0e0f1a, 0.85);

    const meta = loadMeta();
    pixelText(this, GAME_WIDTH / 2, 14, 'TALLER DE LA FERIA', 16).setOrigin(0.5, 0);
    pixelText(this, GAME_WIDTH / 2, 36, `TUS DÓLARES: $${run.dollars}`, 12, '#ffd166').setOrigin(
      0.5,
      0,
    );
    this.message = pixelText(this, GAME_WIDTH / 2, 54, '', 9, '#ff8f6b').setOrigin(0.5, 0);

    for (let i = 0; i < 3; i += 1) {
      const x = 12 + i * 116;
      const id = shop.upgrades[i];
      this.panel(x, 74, 108, 112, id === null);

      if (!id) {
        pixelText(this, x + 6, 118, 'VENDIDO', 9, '#7a7a8a').setWordWrapWidth(96);
        continue;
      }

      const upgrade = UPGRADES[id];
      pixelText(this, x + 6, 82, upgrade.name, 9, '#8be9fd').setWordWrapWidth(96);
      pixelText(this, x + 6, 104, upgrade.description, 8).setWordWrapWidth(96);
      pixelText(this, x + 6, 166, `$${upgrade.price}`, 10, '#ffd166');
      this.button(x, 74, 108, 112, () => this.buyUpgrade(id, i));
    }

    const shellId = shop.shell;
    this.panel(360, 74, 108, 112, !shellId || shop.shellSold);
    if (shellId && !shop.shellSold) {
      const shell = SHELLS[shellId];
      pixelText(this, 366, 82, `CARTUCHO ${shell.name}`, 9, shell.hex).setWordWrapWidth(96);
      pixelText(this, 366, 104, shell.description, 8).setWordWrapWidth(96);
      pixelText(this, 366, 166, `$${shell.price}`, 10, '#ffd166');
      this.button(360, 74, 108, 112, this.buyShell);
    } else {
      pixelText(this, 366, 118, 'VENDIDO', 9, '#7a7a8a').setWordWrapWidth(96);
    }

    this.panel(12, 196, 250, 40);
    pixelText(this, 137, 207, `REFRESCAR $${SHOP_REFRESH_PRICE}`, 10, '#ffd166').setOrigin(0.5, 0);
    this.button(12, 196, 250, 40, this.refresh);

    this.panel(360, 196, 108, 40);
    pixelText(this, 414, 207, 'SIGUIENTE', 10).setOrigin(0.5, 0);
    this.button(360, 196, 108, 40, this.nextStall);

    pixelText(
      this,
      12,
      242,
      `Mejoras: ${run.upgrades.length} · Cartuchos: ${run.shells.length}/4`,
      9,
    );
    pixelText(
      this,
      GAME_WIDTH / 2,
      258,
      `TOTALES $${meta.totalDollars} · DESBLOQUEOS ${meta.unlocked.length}`,
      8,
      '#8be9fd',
    ).setOrigin(0.5, 0);

    this.crosshair = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'crosshair').setDepth(1000);
  }

  private panel(x: number, y: number, w: number, h: number, sold = false): void {
    const g = this.add.graphics();
    g.fillStyle(sold ? 0x121320 : 0x1b1b3a, 0.96);
    g.fillRect(x, y, w, h);
    g.lineStyle(1, sold ? 0x33334a : 0x6b4f8a);
    g.strokeRect(x, y, w, h);
  }

  private button(x: number, y: number, w: number, h: number, onClick: () => void): void {
    this.add
      .zone(x, y, w, h)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', onClick);
  }

  private buyUpgrade(id: string, index: number): void {
    const price = UPGRADES[id].price;
    if (run.dollars < price) {
      this.say('TE FALTAN DÓLARES');
      return;
    }
    run.dollars -= price;
    run.upgrades.push(id);
    shop.upgrades[index] = null;
    sfx.buy();
    this.render();
  }

  private buyShell = (): void => {
    if (!shop.shell || shop.shellSold) return;
    const id: ShellId = shop.shell;
    if (run.shells.length >= 4) {
      this.say('CARTUCHOS LLENOS (4/4)');
      return;
    }
    if (run.dollars < SHELLS[id].price) {
      this.say('TE FALTAN DÓLARES');
      return;
    }
    run.dollars -= SHELLS[id].price;
    run.shells.push(id);
    shop.shell = null;
    shop.shellSold = true;
    sfx.buy();
    this.render();
  };

  private refresh = (): void => {
    if (run.dollars < SHOP_REFRESH_PRICE) {
      this.say('TE FALTAN DÓLARES');
      return;
    }
    run.dollars -= SHOP_REFRESH_PRICE;
    shop.ready = false;
    sfx.buy();
    this.render();
  };

  private nextStall = (): void => {
    run.stallIndex += 1;
    this.scene.start('map');
  };

  private say(text: string): void {
    this.message.setText(text);
    this.time.delayedCall(1000, () => this.message.setText(''));
  }
}
