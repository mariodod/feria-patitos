import Phaser from 'phaser';
import { CARDS, CARD_IDS, type ShotCardId } from '../data/cards';
import { RELIC_IDS, RELICS } from '../data/relics';
import { GAME_WIDTH } from '../game/constants';
import { run, shop } from '../game/runState';
import { pixelText } from '../game/systems/text';

export class ShopScene extends Phaser.Scene {
  private message!: Phaser.GameObjects.Text;

  constructor() {
    super('shop');
  }

  create(): void {
    if (shop.offers.length === 0) {
      shop.offers = Phaser.Math.RND.shuffle(CARD_IDS.slice()).slice(0, 3);
    }
    if (!shop.relic) {
      const available = RELIC_IDS.filter((id) => !run.relics.includes(id));
      shop.relic = available.length > 0 ? Phaser.Math.RND.pick(available) : null;
    }

    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, 135, GAME_WIDTH, 270, 0x0e0f1a, 0.85);

    pixelText(this, GAME_WIDTH / 2, 14, 'TIENDA DE LA FERIA', 16).setOrigin(0.5, 0);
    pixelText(this, GAME_WIDTH / 2, 36, `TUS DÓLARES: $${run.dollars}`, 12, '#ffd166').setOrigin(
      0.5,
      0,
    );
    this.message = pixelText(this, GAME_WIDTH / 2, 54, '', 9, '#ff8f6b').setOrigin(0.5, 0);

    shop.offers.forEach((id, index) => {
      const card = CARDS[id];
      const x = 24 + index * 155;
      this.panel(x, 74, 140, 112);
      pixelText(this, x + 8, 82, card.name, 10, card.hex);
      pixelText(this, x + 8, 100, card.description, 8).setWordWrapWidth(124);
      pixelText(this, x + 8, 168, `$${card.price}`, 10, '#ffd166');
      this.button(x, 74, 140, 112, () => this.buyCard(id, index));
    });

    if (shop.relic) {
      const relic = RELICS[shop.relic];
      this.panel(24, 200, 270, 52);
      pixelText(this, 32, 207, `RELIQUIA: ${relic.name}`, 10, '#8be9fd');
      pixelText(this, 32, 223, relic.description, 8).setWordWrapWidth(250);
      pixelText(this, 244, 232, `$${relic.price}`, 10, '#ffd166').setOrigin(1, 0);
      this.button(24, 200, 270, 52, this.buyRelic);
    }

    this.panel(308, 200, 148, 52);
    pixelText(this, 382, 220, 'SIGUIENTE PUESTO', 10).setOrigin(0.5, 0);
    this.button(308, 200, 148, 52, this.nextStall);

    pixelText(this, GAME_WIDTH / 2, 262, `Mazo actual: ${run.deck.length} cartas`, 8).setOrigin(
      0.5,
      0,
    );
  }

  private panel(x: number, y: number, w: number, h: number): void {
    const g = this.add.graphics();
    g.fillStyle(0x1b1b3a, 0.96);
    g.fillRect(x, y, w, h);
    g.lineStyle(1, 0x6b4f8a);
    g.strokeRect(x, y, w, h);
  }

  private button(x: number, y: number, w: number, h: number, onClick: () => void): void {
    this.add
      .zone(x, y, w, h)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', onClick);
  }

  private buyCard(id: ShotCardId, index: number): void {
    const price = CARDS[id].price;
    if (run.dollars < price) {
      this.say('TE FALTAN DÓLARES');
      return;
    }
    run.dollars -= price;
    run.deck.push(id);
    shop.offers.splice(index, 1);
    this.scene.restart();
  }

  private buyRelic = (): void => {
    if (!shop.relic) return;
    const price = RELICS[shop.relic].price;
    if (run.dollars < price) {
      this.say('TE FALTAN DÓLARES');
      return;
    }
    run.dollars -= price;
    run.relics.push(shop.relic);
    shop.relic = null;
    this.scene.restart();
  };

  private nextStall = (): void => {
    run.stallIndex += 1;
    this.scene.start('game');
    this.scene.launch('hud');
  };

  private say(text: string): void {
    this.message.setText(text);
    this.time.delayedCall(1000, () => this.message.setText(''));
  }
}
