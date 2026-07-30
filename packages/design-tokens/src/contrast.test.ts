import { describe, expect, test } from 'bun:test';
import { darkTheme, lightTheme } from './tokens/semantic.ts';

// WCAG contrast contract for the semantic color tokens. Hand-rolled oklch →
// linear sRGB conversion (Björn Ottosson's OKLab matrices) and WCAG relative
// luminance/contrast, so this has no dependency beyond the token source
// itself. Every pairing here is a promise consumers rely on for text
// legibility — if a change to semantic.ts drops a ratio below 4.5, that's a
// real regression, not a flaky test.

const MIN_CONTRAST = 4.5;

interface RGBA {
  /** Linear-light sRGB channel, 0-1 (may exceed the range for out-of-gamut colors). */
  r: number;
  g: number;
  b: number;
  /** Alpha, 0-1. */
  a: number;
}

function oklchToLinearSrgb(L: number, C: number, H: number): { r: number; g: number; b: number } {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function parseOklch(value: string): RGBA {
  const match = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!match) throw new Error(`Cannot parse oklch value: ${value}`);
  const [, lStr, cStr, hStr] = match as unknown as [string, string, string, string];
  const { r, g, b } = oklchToLinearSrgb(Number(lStr), Number(cStr), Number(hStr));
  return { r, g, b, a: 1 };
}

/**
 * Resolves a token value (oklch(), var(--x), or color-mix(in oklab, C P%, transparent))
 * to a linear-light RGBA. `color-mix(in oklab, C P%, transparent)` reduces to C at
 * alpha P%, since mixing any color with `transparent` in a rectangular color space
 * only scales alpha — the non-transparent endpoint's channels are unchanged.
 */
function resolveColor(value: string, theme: Record<string, string>): RGBA {
  const trimmed = value.trim();

  const varMatch = trimmed.match(/^var\(--([\w-]+)\)$/);
  if (varMatch) {
    const key = varMatch[1] as string;
    const ref = theme[key];
    if (!ref) throw new Error(`Unresolved token reference: --${key}`);
    return resolveColor(ref, theme);
  }

  const mixMatch = trimmed.match(/^color-mix\(in oklab,\s*(.+?)\s+([\d.]+)%,\s*transparent\)$/);
  if (mixMatch) {
    const [, colorExpr, pctStr] = mixMatch as unknown as [string, string, string];
    const resolved = resolveColor(colorExpr, theme);
    return { ...resolved, a: resolved.a * (Number(pctStr) / 100) };
  }

  if (trimmed === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  if (trimmed === 'white') return { r: 1, g: 1, b: 1, a: 1 };

  if (trimmed.startsWith('oklch(')) return parseOklch(trimmed);

  throw new Error(`Cannot resolve color value: ${value}`);
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

// sRGB transfer function and its inverse — needed to alpha-composite in the
// gamma-encoded space browsers actually blend in (CSS "simple alpha
// compositing" operates on the rendered channel values, not linear light).
function linearToGamma(c: number): number {
  const clamped = clamp01(c);
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

function gammaToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Composites a (possibly translucent) color over an opaque background. No-op when fg is opaque. */
function compositeOver(fg: RGBA, bg: RGBA): RGBA {
  if (fg.a >= 1) return fg;
  const fgGamma = [fg.r, fg.g, fg.b].map(linearToGamma);
  const bgGamma = [bg.r, bg.g, bg.b].map(linearToGamma);
  const blended = fgGamma.map((f, i) =>
    gammaToLinear(fg.a * f + (1 - fg.a) * (bgGamma[i] as number)),
  );
  return { r: blended[0] as number, g: blended[1] as number, b: blended[2] as number, a: 1 };
}

function relativeLuminance({ r, g, b }: RGBA): number {
  return 0.2126 * clamp01(r) + 0.7152 * clamp01(g) + 0.0722 * clamp01(b);
}

function contrastRatio(a: RGBA, b: RGBA): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Contrast between a foreground token and a background token. The background
 * is always composited over `surface` first — a no-op for the opaque light-mode
 * tokens, but required for dark mode's alpha-based subtle backgrounds, which
 * are only ever rendered on top of a surface tier.
 */
function contrastOf(theme: Record<string, string>, fgKey: string, bgKey: string): number {
  const fgValue = theme[fgKey];
  const bgValue = theme[bgKey];
  const surfaceValue = theme.surface;
  if (!fgValue) throw new Error(`Missing token: ${fgKey}`);
  if (!bgValue) throw new Error(`Missing token: ${bgKey}`);
  if (!surfaceValue) throw new Error('Missing token: surface');

  const fg = resolveColor(fgValue, theme);
  const bg = compositeOver(resolveColor(bgValue, theme), resolveColor(surfaceValue, theme));
  return contrastRatio(fg, bg);
}

const themes = {
  light: lightTheme as unknown as Record<string, string>,
  dark: darkTheme as unknown as Record<string, string>,
};

const tones = ['destructive', 'success', 'warning', 'info'] as const;
// neutral has subtle slots but no solid `neutral`/`neutral-foreground` pair.
const subtleTones = [...tones, 'neutral'] as const;

for (const [themeName, theme] of Object.entries(themes)) {
  describe(`${themeName} theme contrast`, () => {
    test('foreground on background >= 4.5', () => {
      expect(contrastOf(theme, 'foreground', 'background')).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });

    test('primary-foreground on primary >= 4.5', () => {
      expect(contrastOf(theme, 'primary-foreground', 'primary')).toBeGreaterThanOrEqual(
        MIN_CONTRAST,
      );
    });

    test('muted-foreground on background >= 4.5', () => {
      expect(contrastOf(theme, 'muted-foreground', 'background')).toBeGreaterThanOrEqual(
        MIN_CONTRAST,
      );
    });

    test('brand-foreground on brand >= 4.5', () => {
      expect(contrastOf(theme, 'brand-foreground', 'brand')).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });

    test('secondary-foreground on secondary >= 4.5', () => {
      expect(contrastOf(theme, 'secondary-foreground', 'secondary')).toBeGreaterThanOrEqual(
        MIN_CONTRAST,
      );
    });

    test('accent-foreground on accent >= 4.5', () => {
      expect(contrastOf(theme, 'accent-foreground', 'accent')).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });

    for (const tone of tones) {
      test(`${tone}-foreground on ${tone} >= 4.5`, () => {
        expect(contrastOf(theme, `${tone}-foreground`, tone)).toBeGreaterThanOrEqual(MIN_CONTRAST);
      });
    }

    for (const tone of subtleTones) {
      test(`${tone}-subtle-foreground on ${tone}-subtle >= 4.5`, () => {
        expect(
          contrastOf(theme, `${tone}-subtle-foreground`, `${tone}-subtle`),
        ).toBeGreaterThanOrEqual(MIN_CONTRAST);
      });
    }
  });
}
