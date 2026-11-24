import Phaser from 'phaser';
import { LANES, LEVELS, SCORING, type DuckPattern, type DuckSpawn } from '../data/levels';
import { SHOTGUN, SHELLS, type ShellId } from '../data/shells';
import { UPGRADES, type HitContext } from '../data/upgrades';
import {
  BODY_OFFSET_Y,
  BULLSEYE_OFFSET_X,
  DUCK_HALF_WIDTH,
  DUCK_LIFETIME,
  GAME_HEIGHT,
  GAME_WIDTH,
} from '../game/constants';
import {
  HUD_STATE_EVENT,
  SELECT_SHELL_EVENT,
  type HudState,
  type ShellView,
} from '../game/events';
import { isLevelComplete } from '../game/logic/level';
import { scoreHit } from '../game/logic/scoring';
import { prepareShop, run } from '../game/runState';
import { pixelTextStyle } from '../game/systems/text';

interface Duck {
  sprite: Phaser.GameObjects.Image;
  baseSpeed: number;
  direction: 1 | -1;
  pattern: DuckPattern;
  gold: boolean;
  age: number;
}

export class GameScene extends Phaser.Scene {
  private level = LEVELS[0];
  private ducks: Duck[] = [];
  private crosshair!: Phaser.GameObjects.Image;
  private selectedShell = -1;
  private earned = 0;
  private ammo = 0;
  private ammoMax = 0;
  private elapsedMs = 0;
  private nextSpawn = 0;
  private slowUntil = 0;
  private running = true;

  constructor() {
    super('game');
  }

  create(): void {
    this.level = LEVELS[run.stallIndex] ?? LEVELS[LEVELS.length - 1];
    this.ducks = [];
    this.earned = 0;
    this.elapsedMs = 0;
    this.nextSpawn = 0;
    this.slowUntil = 0;
    this.running = true;
    this.selectedShell = -1;

    this.ammoMax = run.upgrades.reduce(
      (total, id) => UPGRADES[id]?.onStallStart?.(total) ?? total,
      this.level.ammo,
    );
    this.ammo = this.ammoMax;

    this.add.image(0, 0, 'backdrop').setOrigin(0, 0);
    this.input.setDefaultCursor('none');
    this.crosshair = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'crosshair').setDepth(100);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.crosshair.setPosition(pointer.worldX, pointer.worldY);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // La franja inferior son los cartuchos: la gestiona HudScene.
      if (pointer.worldY >= 214) return;
      if (!this.running) return;
      this.fire(pointer.worldX, pointer.worldY);
    });

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < 4) this.selectShell(index);
    });

    this.game.events.on(SELECT_SHELL_EVENT, this.selectShell, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(SELECT_SHELL_EVENT, this.selectShell, this);
      this.input.setDefaultCursor('auto');
    });

    this.emitHud();
  }

  update(_time: number, delta: number): void {
    if (!this.running) return;

    const dt = delta / 1000;
    this.elapsedMs += delta;

    while (
      this.nextSpawn < this.level.ducks.length &&
      this.elapsedMs >= this.level.ducks[this.nextSpawn].spawnAt
    ) {
      this.spawnDuck(this.level.ducks[this.nextSpawn]);
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
    if (this.time.now < this.slowUntil) speed *= 0.35;
    if (duck.pattern === 'sine') speed *= 0.65 + 0.35 * Math.sin(duck.age * 3);
    if (duck.pattern === 'zigzag' && Math.floor(duck.age / 1.4) % 2 === 1) speed *= -1;
    return speed;
  }

  private spawnDuck(spawn: DuckSpawn): void {
    const startX = spawn.direction === 1 ? -DUCK_HALF_WIDTH : GAME_WIDTH + DUCK_HALF_WIDTH;
    const sprite = this.add
      .image(startX, LANES[spawn.lane], spawn.gold ? 'duck-gold' : 'duck')
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

  private selectShell(index: number): void {
    if (!this.running || index < 0 || index >= run.shells.length) return;
    this.selectedShell = this.selectedShell === index ? -1 : index;
    this.emitHud();
  }

  private applyHooks(ctx: HitContext): HitContext {
    return run.upgrades.reduce((value, id) => UPGRADES[id]?.onHit?.(value) ?? value, ctx);
  }

  private fire(x: number, y: number): void {
    const shot = this.applyHooks({
      dollars: 0,
      bullseye: false,
      gold: false,
      aimRadius: SHOTGUN.radius,
      extraTargets: 0,
      slowOnHit: 0,
    });

    const shellId: ShellId | undefined = run.shells[this.selectedShell];
    const shell = shellId ? SHELLS[shellId] : null;
    const cost = shell?.ammoCost ?? SHOTGUN.ammoCost;

    if (this.ammo < cost) {
      this.finishRun(false);
      return;
    }
    this.ammo -= cost;

    const radius = shell ? shell.radius + (shot.aimRadius - SHOTGUN.radius) : shot.aimRadius;
    const maxTargets = 1 + shot.extraTargets + (shell?.extraTargets ?? 0);
    const slow = shot.slowOnHit + (shell?.slow ?? 0);
    const multiplier = shell?.multiplier ?? SHOTGUN.multiplier;

    const targets = this.ducks
      .map((duck, index) => ({
        duck,
        index,
        distance: Phaser.Math.Distance.Between(x, y, duck.sprite.x, duck.sprite.y - BODY_OFFSET_Y),
      }))
      .filter((target) => target.distance <= radius)
      .sort((a, b) => b.duck.sprite.depth - a.duck.sprite.depth || b.index - a.index)
      .slice(0, maxTargets);

    if (slow > 0) this.slowUntil = this.time.now + slow * 1000;

    for (const target of targets) {
      const duck = target.duck;
      const bullseye =
        Phaser.Math.Distance.Between(
          x,
          y,
          duck.sprite.x + BULLSEYE_OFFSET_X,
          duck.sprite.y - BODY_OFFSET_Y,
        ) <= SCORING.bullseyeRadius;

      const hit = this.applyHooks({
        dollars: scoreHit(bullseye, duck.gold) * multiplier,
        bullseye,
        gold: duck.gold,
        aimRadius: 0,
        extraTargets: 0,
        slowOnHit: 0,
      });
      const dollars = Math.round(hit.dollars);

      this.earned += dollars;
      run.dollars += dollars;
      this.popScore(duck.sprite.x, duck.sprite.y - BODY_OFFSET_Y, dollars, bullseye);
      this.spark(duck.sprite.x, duck.sprite.y - BODY_OFFSET_Y);
      duck.sprite.destroy();
    }

    if (targets.length > 0) {
      const hitDucks = new Set(targets.map((target) => target.duck));
      this.ducks = this.ducks.filter((duck) => !hitDucks.has(duck));
      this.cameras.main.shake(60, 0.004);
    }

    // El cartucho se consume; vuelve a dispararse con la escopeta base.
    if (shell) {
      run.shells.splice(this.selectedShell, 1);
      this.selectedShell = -1;
    }

    this.checkLevelEnd();
    this.emitHud();
  }

  private popScore(x: number, y: number, dollars: number, bullseye: boolean): void {
    const label = this.add
      .text(x, y, `+$${dollars}`, pixelTextStyle(bullseye ? 12 : 10, bullseye ? '#ffd166' : '#fff1e6'))
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
    if (!isLevelComplete(this.nextSpawn, this.level.ducks.length, this.ducks.length)) return;
    if (this.earned < this.level.quota) {
      this.finishRun(false);
      return;
    }

    this.running = false;
    this.scene.stop('hud');
    if (run.stallIndex >= LEVELS.length - 1) {
      this.scene.start('summary', { success: true });
    } else {
      prepareShop();
      this.scene.start('shop');
    }
  }

  private finishRun(success: boolean): void {
    this.running = false;
    this.scene.stop('hud');
    this.scene.start('summary', { success });
  }

  private emitHud(): void {
    const shells: (ShellView | null)[] = [];
    for (let i = 0; i < 4; i += 1) {
      const id = run.shells[i];
      shells.push(
        id
          ? { id, name: SHELLS[id].name, cost: SHELLS[id].ammoCost, hex: SHELLS[id].hex }
          : null,
      );
    }

    const state: HudState = {
      levelName: this.level.name,
      earned: this.earned,
      quota: this.level.quota,
      ammo: this.ammo,
      ammoMax: this.ammoMax,
      shells,
      selected: this.selectedShell,
    };
    this.game.events.emit(HUD_STATE_EVENT, state);
  }
}
