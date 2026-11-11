import { describe, expect, test } from 'bun:test';
import { neutral } from './tokens/colors.ts';
import { darkTheme, lightTheme } from './tokens/semantic.ts';

// Light `border` and `input` are translucent foreground mixes, so an edge stays
// visible on a grey surface. On white they must render as the solid steps they
// replaced (neutral[100] and neutral[200]), so a page of white cards looks the
// same. Browsers composite alpha in gamma-encoded sRGB, so the check does too.

type Rgb = [number, number, number];

function oklchToLinear(value: string): Rgb {
  const match = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!match) throw new Error(`Cannot parse oklch value: ${value}`);
  const [L, C, H] = match.slice(1).map(Number) as Rgb;
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function lightness([r, g, b]: Rgb): number {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

const toGamma = (c: number) => {
  const x = Math.max(0, Math.min(1, c));
  return x <= 0.0031308 ? x * 12.92 : 1.055 * x ** (1 / 2.4) - 0.055;
};
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** `color-mix(in oklab, var(--foreground) p%, transparent)` composited over white. */
function onWhite(value: string): number {
  const match = value.match(/^color-mix\(in oklab, var\(--foreground\) ([\d.]+)%, transparent\)$/);
  if (!match) throw new Error(`Not a translucent foreground mix: ${value}`);
  const alpha = Number(match[1]) / 100;
  const fg = oklchToLinear(lightTheme.foreground);
  return lightness(fg.map((c) => toLinear(alpha * toGamma(c) + (1 - alpha))) as Rgb);
}

describe('Light border tokens are translucent and match the old steps on white', () => {
  test('border renders as neutral[100] on white', () => {
    expect(
      Math.abs(onWhite(lightTheme.border) - lightness(oklchToLinear(neutral[100]))),
    ).toBeLessThan(0.005);
  });

  test('input renders as neutral[200] on white', () => {
    expect(
      Math.abs(onWhite(lightTheme.input) - lightness(oklchToLinear(neutral[200]))),
    ).toBeLessThan(0.005);
  });

  test('dark keeps its white mixes', () => {
    expect(darkTheme.border).toBe('color-mix(in oklab, white 7.5%, transparent)');
    expect(darkTheme.input).toBe('color-mix(in oklab, white 13%, transparent)');
  });
});
