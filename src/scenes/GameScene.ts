import Phaser from 'phaser';
import { LANES, LEVEL_1, SCORING, type DuckPattern, type DuckSpawn } from '../data/levels';
import {
  BODY_OFFSET_Y,
  BULLSEYE_OFFSET_X,
  DUCK_HALF_WIDTH,
  DUCK_LIFETIME,
  GAME_HEIGHT,
  GAME_WIDTH,
} from '../game/constants';
import { HUD_STATE_EVENT, type HudState } from '../game/events';
import { currentWave, isLevelComplete, remainingTargets } from '../game/logic/level';
import { scoreHit } from '../game/logic/scoring';
import { pixelText, pixelTextStyle } from '../game/systems/text';

interface Duck {
  sprite: Phaser.GameObjects.Image;
  baseSpeed: number;
  direction: 1 | -1;
  pattern: DuckPattern;
  gold: boolean;
  age: number;
}

type RoundResult = 'cleared' | 'ammo' | 'quota';

export class GameScene extends Phaser.Scene {
  private ducks: Duck[] = [];
  private crosshair!: Phaser.GameObjects.Image;
  private centerText!: Phaser.GameObjects.Text;
  private score = 0;
  private ammo = LEVEL_1.ammo;
  private elapsedMs = 0;
  private nextSpawn = 0;
  private running = true;

  constructor() {
    super('game');
  }

  create(): void {
    this.ducks = [];
    this.score = 0;
    this.ammo = LEVEL_1.ammo;
    this.elapsedMs = 0;
    this.nextSpawn = 0;
    this.running = true;

    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.input.setDefaultCursor('none');
    this.crosshair = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'crosshair').setDepth(100);
    this.centerText = pixelText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, '', 14).setOrigin(0.5).setDepth(60);

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

    this.emitHud();
  }

  update(_time: number, delta: number): void {
    if (!this.running) return;

    const dt = delta / 1000;
    this.elapsedMs += delta;

    while (
      this.nextSpawn < LEVEL_1.ducks.length &&
      this.elapsedMs >= LEVEL_1.ducks[this.nextSpawn].spawnAt
    ) {
      this.spawnDuck(LEVEL_1.ducks[this.nextSpawn]);
      this.nextSpawn += 1;
    }

    for (let i = this.ducks.length - 1; i >= 0; i -= 1) {
      const duck = this.ducks[i];
      duck.age += dt;
      const speed = this.speedFor(duck);
      duck.sprite.x += speed * dt;
      duck.sprite.setFlipX(speed < 0);

      const outside =
        duck.sprite.x < -DUCK_HALF_WIDTH || duck.sprite.x > GAME_WIDTH + DUCK_HALF_WIDTH;
      if (outside || duck.age >= DUCK_LIFETIME) {
        duck.sprite.destroy();
        this.ducks.splice(i, 1);
      }
    }

    this.checkLevelEnd();
    this.emitHud();
  }

  private speedFor(duck: Duck): number {
    let speed = duck.baseSpeed * duck.direction;
    if (duck.pattern === 'sine') {
      speed *= 0.65 + 0.35 * Math.sin(duck.age * 3);
    }
    if (duck.pattern === 'zigzag' && Math.floor(duck.age / 1.4) % 2 === 1) {
      speed *= -1;
    }
    return speed;
  }

  private spawnDuck(spawn: DuckSpawn): void {
    const startX = spawn.direction === 1 ? -DUCK_HALF_WIDTH : GAME_WIDTH + DUCK_HALF_WIDTH;
    const key = spawn.gold ? 'duck-gold' : 'duck';
    const sprite = this.add
      .image(startX, LANES[spawn.lane], key)
      .setOrigin(0.5, 1)
      .setScale(2);

    this.ducks.push({
      sprite,
      baseSpeed: spawn.speed,
      direction: spawn.direction,
      pattern: spawn.pattern,
      gold: spawn.gold ?? false,
      age: 0,
    });
  }

  private fire(x: number, y: number): void {
    if (this.ammo <= 0) {
      this.endRound('ammo');
      return;
    }
    this.ammo -= 1;

    // Frontmost duck wins: higher depth first, then the most recently added.
    let index = -1;
    let frontDepth = -Infinity;
    for (let i = 0; i < this.ducks.length; i += 1) {
      const duck = this.ducks[i];
      const cy = duck.sprite.y - BODY_OFFSET_Y;
      const hit = Phaser.Math.Distance.Between(x, y, duck.sprite.x, cy) <= SCORING.bodyRadius;

      if (hit && duck.sprite.depth >= frontDepth) {
        index = i;
        frontDepth = duck.sprite.depth;
      }
    }

    if (index !== -1) {
      const duck = this.ducks[index];
      const bullseye =
        Phaser.Math.Distance.Between(
          x,
          y,
          duck.sprite.x + BULLSEYE_OFFSET_X,
          duck.sprite.y - BODY_OFFSET_Y,
        ) <= SCORING.bullseyeRadius;
      const points = scoreHit(bullseye, duck.gold);

      if (points > 0) {
        this.ducks.splice(index, 1);
        const cx = duck.sprite.x;
        const cy = duck.sprite.y - BODY_OFFSET_Y;
        this.score += points;
        this.popScore(cx, cy, points, bullseye);
        this.spark(cx, cy);
        duck.sprite.destroy();
        this.cameras.main.shake(bullseye ? 100 : 60, bullseye ? 0.007 : 0.004);
      } else {
        this.popScore(x, y, 0, false);
      }
    }

    this.checkLevelEnd();
    this.emitHud();
  }

  private popScore(x: number, y: number, points: number, bullseye: boolean): void {
    const text = points === 0 ? 'FALLO' : `+${points}`;
    const color = points === 0 ? '#9b9b9b' : bullseye ? '#ffd166' : '#fff1e6';
    const label = this.add
      .text(x, y, text, pixelTextStyle(bullseye ? 12 : 10, color))
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

  private checkLevelEnd(): void {
    if (isLevelComplete(this.nextSpawn, LEVEL_1.ducks.length, this.ducks.length)) {
      this.endRound(this.score >= LEVEL_1.quota ? 'cleared' : 'quota');
    }
  }

  private endRound(result: RoundResult): void {
    this.running = false;
    const message =
      result === 'cleared'
        ? '¡PUESTO SUPERADO!'
        : result === 'ammo'
          ? 'SE ACABARON LAS BALAS'
          : 'CUOTA NO ALCANZADA';
    this.centerText.setText(`${message}\n${this.score}/${LEVEL_1.quota} PUNTOS\nCLIC PARA REPETIR`);
  }

  private emitHud(): void {
    const state: HudState = {
      levelName: LEVEL_1.name,
      score: this.score,
      quota: LEVEL_1.quota,
      ammo: this.ammo,
      ammoMax: LEVEL_1.ammo,
      ducksRemaining: remainingTargets(LEVEL_1, this.nextSpawn, this.ducks.length),
      ducksTotal: LEVEL_1.ducks.length,
      wave: currentWave(LEVEL_1, this.nextSpawn),
      waves: LEVEL_1.waves,
    };
    this.game.events.emit(HUD_STATE_EVENT, state);
  }
}
