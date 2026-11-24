import Phaser from 'phaser';
import { SHELLS, SHELL_IDS, type ShellId } from '../data/shells';
import { UPGRADES, UPGRADE_IDS } from '../data/upgrades';
import { GAME_HEIGHT, GAME_WIDTH, SHOP_REFRESH_PRICE } from '../game/constants';
import { isUnlocked, loadMeta } from '../game/meta';
import { run, shop } from '../game/runState';
import { sfx } from '../game/systems/audio';
import { pixelText } from '../game/systems/text';

interface SlotView {
  bg: Phaser.GameObjects.Graphics;
  name: Phaser.GameObjects.Text;
  desc: Phaser.GameObjects.Text;
  price: Phaser.GameObjects.Text;
}

export class ShopScene extends Phaser.Scene {
  private message!: Phaser.GameObjects.Text;
  private dollarsText!: Phaser.GameObjects.Text;
  private metaText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  private crosshair!: Phaser.GameObjects.Image;
  private upgradeSlots: SlotView[] = [];
  private shellSlot!: SlotView;

  private lastX = GAME_WIDTH / 2;
  private lastY = GAME_HEIGHT / 2;

  constructor() {
    super('shop');
  }

  create(): void {
    this.input.setDefaultCursor('none');
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.lastX = pointer.worldX;
      this.lastY = pointer.worldY;
      this.crosshair.setPosition(this.lastX, this.lastY);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.setDefaultCursor('auto');
    });

    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0e0f1a, 0.85);
    pixelText(this, GAME_WIDTH / 2, 14, 'TALLER DE LA FERIA', 16).setOrigin(0.5, 0);
    this.dollarsText = pixelText(this, GAME_WIDTH / 2, 36, '', 12, '#ffd166').setOrigin(0.5, 0);
    this.message = pixelText(this, GAME_WIDTH / 2, 54, '', 9, '#ff8f6b').setOrigin(0.5, 0);
    this.infoText = pixelText(this, 12, 242, '', 9);
    this.metaText = pixelText(this, GAME_WIDTH / 2, 258, '', 8, '#8be9fd').setOrigin(0.5, 0);

    for (let i = 0; i < 3; i += 1) {
      const x = 12 + i * 116;
      this.upgradeSlots.push(this.makeSlot(x, 74, 108, 112, () => this.buyUpgrade(i)));
    }
    this.shellSlot = this.makeSlot(360, 74, 108, 112, this.buyShell);

    const refreshSlot = this.makeSlot(12, 196, 250, 40, this.refresh);
    this.drawPanel(refreshSlot.bg, 12, 196, 250, 40);
    pixelText(this, 137, 207, `REFRESCAR $${SHOP_REFRESH_PRICE}`, 10, '#ffd166').setOrigin(
      0.5,
      0,
    );

    const nextSlot = this.makeSlot(360, 196, 108, 40, this.nextStall);
    this.drawPanel(nextSlot.bg, 360, 196, 108, 40);
    pixelText(this, 414, 207, 'SIGUIENTE', 10).setOrigin(0.5, 0);

    this.crosshair = this.add
      .image(this.lastX, this.lastY, 'crosshair')
      .setDepth(1000);
    this.lastX = GAME_WIDTH / 2;
    this.lastY = GAME_HEIGHT / 2;

    this.render();
  }

  private makeSlot(x: number, y: number, w: number, h: number, onClick: () => void): SlotView {
    const slot: SlotView = {
      bg: this.add.graphics(),
      name: pixelText(this, x + 6, y + 8, '', 9),
      desc: pixelText(this, x + 6, y + 30, '', 8).setWordWrapWidth(w - 12),
      price: pixelText(this, x + 6, y + h - 20, '', 10, '#ffd166'),
    };
    this.add
      .zone(x, y, w, h)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', onClick);
    return slot;
  }

  private render(): void {
    if (!shop.ready) {
      shop.upgrades = Phaser.Math.RND.shuffle(
        UPGRADE_IDS.filter((id) => !run.upgrades.includes(id) && isUnlocked(id)),
      ).slice(0, 3);
      shop.shell = Phaser.Math.RND.pick(SHELL_IDS.filter((id) => isUnlocked(id)));
      shop.shellSold = false;
      shop.ready = true;
    }

    const meta = loadMeta();
    this.dollarsText.setText(`TUS DÓLARES: $${run.dollars}`);
    this.infoText.setText(
      `Mejoras: ${run.upgrades.length} · Cartuchos: ${run.shells.length}/4`,
    );
    this.metaText.setText(
      `TOTALES $${meta.totalDollars} · DESBLOQUEOS ${meta.unlocked.length}`,
    );

    this.upgradeSlots.forEach((slot, index) => {
      const id = shop.upgrades[index];
      if (!id) {
        this.drawPanel(slot.bg, 12 + index * 116, 74, 108, 112, true);
        slot.name.setText('VENDIDO').setColor('#7a7a8a');
        slot.desc.setText('');
        slot.price.setText('');
        return;
      }
      const upgrade = UPGRADES[id];
      this.drawPanel(slot.bg, 12 + index * 116, 74, 108, 112);
      slot.name.setText(upgrade.name).setColor('#8be9fd');
      slot.desc.setText(upgrade.description).setColor('#fff1e6');
      slot.price.setText(`$${upgrade.price}`);
    });

    if (!shop.shell || shop.shellSold) {
      this.drawPanel(this.shellSlot.bg, 360, 74, 108, 112, true);
      this.shellSlot.name.setText('VENDIDO').setColor('#7a7a8a');
      this.shellSlot.desc.setText('');
      this.shellSlot.price.setText('');
    } else {
      const shell = SHELLS[shop.shell];
      this.drawPanel(this.shellSlot.bg, 360, 74, 108, 112);
      this.shellSlot.name.setText(`CARTUCHO ${shell.name}`).setColor(shell.hex);
      this.shellSlot.desc.setText(shell.description).setColor('#fff1e6');
      this.shellSlot.price.setText(`$${shell.price}`);
    }
  }

  private drawPanel(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    sold = false,
  ): void {
    g.clear();
    g.fillStyle(sold ? 0x121320 : 0x1b1b3a, 0.96);
    g.fillRect(x, y, w, h);
    g.lineStyle(1, sold ? 0x33334a : 0x6b4f8a);
    g.strokeRect(x, y, w, h);
  }

  private buyUpgrade(index: number): void {
    const id = shop.upgrades[index];
    if (!id) return;
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
