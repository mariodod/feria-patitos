import Phaser from 'phaser';

export function pixelTextStyle(
  size = 10,
  color = '#fff1e6',
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'monospace',
    fontSize: `${size}px`,
    color,
  };
}

export function pixelText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 10,
  color = '#fff1e6',
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, pixelTextStyle(size, color));
}
