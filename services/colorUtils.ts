type Rgb = { r: number; g: number; b: number };

const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function parseHex(hex: string): Rgb | null {
  const match = HEX_PATTERN.exec(hex);
  if (!match) {
    return null;
  }

  let value = match[1];
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_PATTERN.test(value);
}

/** Campur dua warna; amount 0 = warna awal, 1 = warna target. */
export function mixColor(from: string, to: string, amount: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) {
    return from;
  }

  const ratio = Math.max(0, Math.min(1, amount));
  return toHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  });
}

export function darken(hex: string, amount = 0.2): string {
  return mixColor(hex, '#000000', amount);
}

export function lighten(hex: string, amount = 0.2): string {
  return mixColor(hex, '#FFFFFF', amount);
}

/** Tambahkan alpha 0-1 ke warna hex, contoh withAlpha('#16A34A', 0.12). */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) {
    return hex;
  }
  const value = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${toHex(rgb)}${value}`;
}
