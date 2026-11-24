import Phaser from 'phaser';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

const LANES = [70, 120, 170];
const DUCK_HALF_WIDTH = 16;
const HIT_OFFSET_Y = 26;
const ROUND_SECONDS = 30;
const START_AMMO = 30;

interface Duck {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  points: number;
}

/** Demo semilla: un puesto de patitos minimalista para validar el stack. */
class DemoScene extends Phaser.Scene {
  private ducks: Duck[] = [];
  private crosshair!: Phaser.GameObjects.Image;
  private scoreText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private centerText!: Phaser.GameObjects.Text;

  private score = 0;
  private ammo = START_AMMO;
  private timeLeft = ROUND_SECONDS;
  private spawnTimer = 0;
  private running = true;

  constructor() {
    super('demo');
  }

  create(): void {
    this.ducks = [];
    this.score = 0;
    this.ammo = START_AMMO;
    this.timeLeft = ROUND_SECONDS;
    this.spawnTimer = 0;
    this.running = true;

    this.createTextures();
    this.drawBackground();
    this.input.setDefaultCursor('none');

    this.crosshair = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'crosshair').setDepth(100);
    this.scoreText = this.add.text(8, 6, '', this.textStyle()).setDepth(50);
    this.ammoText = this.add.text(GAME_WIDTH - 8, 6, '', this.textStyle()).setOrigin(1, 0).setDepth(50);
    this.timeText = this.add.text(GAME_WIDTH / 2, 6, '', this.textStyle()).setOrigin(0.5, 0).setDepth(50);
    this.centerText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', this.textStyle(14))
      .setOrigin(0.5)
      .setDepth(60);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.crosshair.setPosition(pointer.worldX, pointer.worldY);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.running) {
        this.scene.restart();
        return;
      }
      this.fire(pointer.worldX, pointer.worldY);
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.running) return;
        this.timeLeft -= 1;
        if (this.timeLeft <= 0) this.endRound();
        this.updateHud();
      },
    });

    this.updateHud();
  }

  update(_time: number, delta: number): void {
    if (!this.running) return;

    this.spawnTimer += delta;
    if (this.spawnTimer >= 550 && this.ducks.length < 6) {
      this.spawnTimer = 0;
      this.spawnDuck();
    }

    const dt = delta / 1000;
    for (const duck of this.ducks) {
      duck.sprite.x += duck.vx * dt;

      if (duck.sprite.x < DUCK_HALF_WIDTH || duck.sprite.x > GAME_WIDTH - DUCK_HALF_WIDTH) {
        duck.vx *= -1;
        duck.sprite.x = Phaser.Math.Clamp(
          duck.sprite.x,
          DUCK_HALF_WIDTH,
          GAME_WIDTH - DUCK_HALF_WIDTH,
        );
      }
      duck.sprite.setFlipX(duck.vx < 0);
    }
  }

  private spawnDuck(): void {
    const sprite = this.add
      .image(Phaser.Math.Between(20, GAME_WIDTH - 20), Phaser.Math.RND.pick(LANES), 'duck')
      .setOrigin(0.5, 1)
      .setScale(2);
    const duck: Duck = {
      sprite,
      vx: Phaser.Math.Between(25, 55) * (Phaser.Math.Between(0, 1) ? 1 : -1),
      points: 10,
    };
    this.ducks.push(duck);
  }

  private fire(x: number, y: number): void {
    if (this.ammo <= 0) {
      this.endRound();
      return;
    }
    this.ammo -= 1;

    const index = this.ducks.findIndex((duck) => {
      const cx = duck.sprite.x;
      const cy = duck.sprite.y - HIT_OFFSET_Y;
      return Phaser.Math.Distance.Between(x, y, cx, cy) <= 13;
    });

    if (index !== -1) {
      const duck = this.ducks.splice(index, 1)[0];
      const cx = duck.sprite.x;
      const cy = duck.sprite.y - HIT_OFFSET_Y;
      this.score += duck.points;
      this.popScore(cx, cy, duck.points);
      this.spark(cx, cy);
      duck.sprite.destroy();
      this.cameras.main.shake(60, 0.004);
    }

    this.updateHud();
  }

  private popScore(x: number, y: number, points: number): void {
    const label = this.add
      .text(x, y, `+${points}`, this.textStyle(10))
      .setOrigin(0.5)
      .setDepth(80);
    this.tweens.add({
      targets: label,
      y: y - 22,
      alpha: 0,
      duration: 500,
      onComplete: () => label.destroy(),
    });
  }

  private spark(x: number, y: number): void {
    for (let i = 0; i < 5; i += 1) {
      const bit = this.add.image(x, y, 'spark').setDepth(70);
      const angle = (Math.PI * 2 * i) / 5;
      this.tweens.add({
        targets: bit,
        x: x + Math.cos(angle) * 16,
        y: y + Math.sin(angle) * 16,
        alpha: 0,
        duration: 280,
        onComplete: () => bit.destroy(),
      });
    }
  }

  private endRound(): void {
    this.running = false;
    this.centerText.setText(
      `FIN DEL PUESTO\n${this.score} PUNTOS\nCLIC PARA REPETIR`,
    );
  }

  private updateHud(): void {
    this.scoreText.setText(`PUNTOS ${this.score}`);
    this.ammoText.setText(`BALAS ${this.ammo}`);
    this.timeText.setText(`${this.timeLeft}s`);
  }

  private textStyle(size = 10): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'monospace',
      fontSize: `${size}px`,
      color: '#fff1e6',
    };
  }

  private createTextures(): void {
    const g = this.make.graphics({}, false);

    // Palito que sostiene al patito sobre el riel.
    g.fillStyle(0x9b6b3f);
    g.fillRect(7, 12, 2, 8);
    g.fillStyle(0xc98b52);
    g.fillRect(7, 12, 1, 8);

    // Cuerpo, cabeza, ala, cola, pico y ojo.
    g.fillStyle(0xf4d35e);
    g.fillRect(3, 3, 10, 9);
    g.fillRect(9, 1, 5, 5);
    g.fillRect(1, 4, 2, 4);
    g.fillStyle(0xffe9a8);
    g.fillRect(4, 5, 5, 3);
    g.fillStyle(0xef6f6c);
    g.fillRect(14, 3, 2, 2);
    g.fillStyle(0x1b1b2f);
    g.fillRect(12, 2, 1, 1);

    // Diana en el centro del cuerpo.
    g.fillStyle(0xfff1e6);
    g.fillCircle(7, 7, 3);
    g.fillStyle(0xe63946);
    g.fillCircle(7, 7, 2);
    g.fillStyle(0x9b1d2b);
    g.fillCircle(7, 7, 1);

    g.generateTexture('duck', 16, 20);
    g.clear();

    g.lineStyle(1, 0xffffff);
    g.strokeCircle(4, 4, 3);
    g.fillStyle(0xff5d73);
    g.fillRect(4, 4, 1, 1);
    g.generateTexture('crosshair', 9, 9);
    g.clear();

    g.fillStyle(0xfff1e6);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture('spark', 2, 2);
    g.destroy();
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1b1b3a);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let i = 0; i < 12; i += 1) {
      bg.fillStyle(i % 2 === 0 ? 0xff5d73 : 0xfff1e6);
      bg.fillRect(i * 40, 0, 40, 10);
    }

    bg.fillStyle(0x2d2b55);
    bg.fillRect(0, 10, GAME_WIDTH, 188);

    // Rieles sobre los que se deslizan los patitos.
    for (const lane of LANES) {
      bg.fillStyle(0x5a3d29);
      bg.fillRect(0, lane - 2, GAME_WIDTH, 5);
      bg.fillStyle(0xc98b52);
      bg.fillRect(0, lane - 2, GAME_WIDTH, 1);
      bg.fillStyle(0x2a1b16);
      bg.fillRect(0, lane + 2, GAME_WIDTH, 1);
    }

    bg.fillStyle(0x6b4f8a);
    bg.fillRect(0, 198, GAME_WIDTH, 12);
    bg.fillStyle(0x3a2e4d);
    bg.fillRect(0, 210, GAME_WIDTH, GAME_HEIGHT - 210);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0e0f1a',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [DemoScene],
});
