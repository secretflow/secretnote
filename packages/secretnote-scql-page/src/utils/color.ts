export function randomHex() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function hex2rgb(hex: string): [number, number, number] {
  const color = hex.indexOf('#') === 0 ? hex : `#${hex}`;
  let val = Number(`0x${color.substr(1)}`);
  if (!(color.length === 4 || color.length === 7) || Number.isNaN(val)) {
    throw new Error('Invalid hex color.');
  }

  const bits = color.length === 4 ? 4 : 8;
  const mask = (1 << bits) - 1;
  const bgr = ['b', 'g', 'r'].map(() => {
    const c = val & mask;
    val >>= bits;
    return bits === 4 ? 17 * c : c;
  });

  return [bgr[2], bgr[1], bgr[0]];
}

export function invert(hex: string): string {
  const [r, g, b] = hex2rgb(hex);
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#ffffff';
}
