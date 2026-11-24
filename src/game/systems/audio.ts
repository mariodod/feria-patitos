let context: AudioContext | null = null;

/** Debe llamarse desde un gesto del usuario para cumplir con el autoplay. */
export function unlockAudio(): void {
  if (context) {
    if (context.state === 'suspended') void context.resume();
    return;
  }
  try {
    context = new AudioContext();
  } catch {
    context = null;
  }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0,
): void {
  if (!context) return;
  const start = context.currentTime + delay;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(start);
  osc.stop(start + duration);
}

function noise(duration: number, volume: number): void {
  if (!context) return;
  const frames = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;

  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  source.connect(gain);
  gain.connect(context.destination);
  source.start();
}

export const sfx = {
  shoot(): void {
    noise(0.06, 0.06);
    tone(160, 0.08, 'square', 0.03);
  },
  hit(): void {
    tone(660, 0.1, 'triangle', 0.06);
  },
  bullseye(): void {
    tone(880, 0.14, 'sine', 0.07);
    tone(1320, 0.1, 'sine', 0.04, 0.05);
  },
  buy(): void {
    tone(523, 0.09, 'square', 0.05);
    tone(784, 0.12, 'square', 0.04, 0.08);
  },
  lose(): void {
    tone(220, 0.25, 'sawtooth', 0.05);
    tone(160, 0.35, 'sawtooth', 0.04, 0.15);
  },
  win(): void {
    [523, 659, 784, 1046].forEach((freq, index) => tone(freq, 0.18, 'square', 0.05, index * 0.1));
  },
};
