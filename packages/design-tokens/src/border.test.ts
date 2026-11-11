import { describe, expect, test } from 'bun:test';
import { brand, neutral } from './tokens/colors.ts';
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

  // `input` is softer than the neutral[200] it replaced (OSS-1179): an outline
  // button on a white card had too hard an edge.
  test('input renders between neutral[100] and neutral[200] on white', () => {
    const value = onWhite(lightTheme.input);
    expect(value).toBeGreaterThan(lightness(oklchToLinear(neutral[200])) + 0.03);
    expect(value).toBeLessThan(lightness(oklchToLinear(neutral[100])) - 0.01);
  });

  test('dark keeps its white mixes', () => {
    expect(darkTheme.border).toBe('color-mix(in oklab, white 7.5%, transparent)');
    expect(darkTheme.input).toBe('color-mix(in oklab, white 13%, transparent)');
  });
});

// Component recipes that mix `border` or `input` were tuned against the old
// solid steps. These check that each still renders the colour it rendered
// over the old step (oklab distance under 0.01).

type Rgba = { rgb: Rgb; a: number };

function oklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const solid = (value: string): Rgba => ({ rgb: oklchToLinear(value), a: 1 });
const TRANSPARENT: Rgba = { rgb: [0, 0, 0], a: 0 };

/** `color-mix(in oklab, x p, y)`, premultiplied as CSS Color 5 defines it. */
function mix(x: Rgba, y: Rgba, p: number): Rgba {
  const a = x.a * p + y.a * (1 - p);
  const lx = oklab(x.rgb);
  const ly = oklab(y.rgb);
  const lab = lx.map((c, i) => (c * x.a * p + (ly[i] as number) * y.a * (1 - p)) / a) as Rgb;
  return { rgb: fromOklab(lab), a };
}

/** Alpha compositing in gamma-encoded sRGB, as browsers do. */
function over(top: Rgba, base: Rgb): Rgb {
  return top.rgb.map((c, i) =>
    toLinear(top.a * toGamma(c) + (1 - top.a) * toGamma(base[i] as number)),
  ) as Rgb;
}

const distance = (x: Rgb, y: Rgb) => {
  const [a, b] = [oklab(x), oklab(y)];
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};

const percent = (value: string) => Number(value.match(/([\d.]+)%/)?.[1]) / 100;
const fg = solid(lightTheme.foreground);
const newBorder = mix(fg, TRANSPARENT, percent(lightTheme.border));
const newInput = mix(fg, TRANSPARENT, percent(lightTheme.input));
const oldBorder = solid(neutral[100]);
const oldInput = solid(neutral[200]);
const white: Rgb = [1, 1, 1];

describe('Recipes that mix the light border still render as before', () => {
  test('outline Button hover border: input with 9.5% foreground over the hover fill is the same step darker than rest as before', () => {
    // The light outline Button paints its fill under the border, so on hover
    // the border sits on the hover fill (card with 4% foreground). The rest
    // edge is softer than the old neutral[200], so hover is compared as the
    // step from rest, not as an absolute colour.
    const hoverFill = over(mix(solid('oklch(1 0 0)'), fg, 0.96), white);
    const stepBefore = lightness(oldInput.rgb) - lightness(over(mix(oldInput, fg, 0.88), white));
    const rest = over(newInput, white);
    const stepAfter = lightness(rest) - lightness(over(mix(newInput, fg, 0.905), hoverFill));
    expect(Math.abs(stepBefore - stepAfter)).toBeLessThan(0.01);
  });

  test('Card accent border: 30% brand-500 in border (was 38%)', () => {
    const brand500 = solid(brand[500]);
    const before = over(mix(brand500, oldBorder, 0.38), white);
    const after = over(mix(brand500, newBorder, 0.3), white);
    expect(distance(before, after)).toBeLessThan(0.01);
  });

  for (const tone of ['destructive-text', 'warning-indicator', 'info-text'] as const) {
    test(`Alert border, ${tone}: 14% tone in border (was 22%)`, () => {
      const toneColour = solid(lightTheme[tone]);
      const fill = over(mix(toneColour, solid('oklch(1 0 0)'), 0.07), white);
      const before = over(mix(toneColour, oldBorder, 0.22), fill);
      const after = over(mix(toneColour, newBorder, 0.14), fill);
      expect(distance(before, after)).toBeLessThan(0.01);
    });
  }
});
