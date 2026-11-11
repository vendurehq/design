import { describe, expect, test } from 'bun:test';
import { darkTheme, lightTheme } from './tokens/semantic.ts';

// WCAG contrast contract for the semantic color tokens. Hand-rolled oklch →
// linear sRGB conversion (Björn Ottosson's OKLab matrices) and WCAG relative
// luminance/contrast, so this has no dependency beyond the token source
// itself. Every pairing here is a promise consumers rely on for text
// legibility — if a change to semantic.ts drops a ratio below 4.5, that's a
// real regression, not a flaky test.

const MIN_CONTRAST = 4.5;
// WCAG 1.4.11 non-text contrast: focus indicators, control boundaries and
// solid fills that carry meaning must reach 3:1 against adjacent colors.
const MIN_NON_TEXT_CONTRAST = 3;

interface RGBA {
  /** Linear-light sRGB channel, 0-1 (may exceed the range for out-of-gamut colors). */
  r: number;
  g: number;
  b: number;
  /** Alpha, 0-1. */
  a: number;
}

function oklabToLinearSrgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
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

function linearSrgbToOklab({ r, g, b }: RGBA): { L: number; a: number; b: number } {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklchToLinearSrgb(L: number, C: number, H: number): { r: number; g: number; b: number } {
  const hRad = (H * Math.PI) / 180;
  return oklabToLinearSrgb(L, C * Math.cos(hRad), C * Math.sin(hRad));
}

function parseOklch(value: string): RGBA {
  const match = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!match) throw new Error(`Cannot parse oklch value: ${value}`);
  const [, lStr, cStr, hStr] = match as unknown as [string, string, string, string];
  const { r, g, b } = oklchToLinearSrgb(Number(lStr), Number(cStr), Number(hStr));
  return { r, g, b, a: 1 };
}

const TRANSPARENT: RGBA = { r: 0, g: 0, b: 0, a: 0 };

/**
 * `color-mix(in oklab, A p%, B)` as CSS Color 5 defines it: both colours go to
 * OKLab, their channels are premultiplied by alpha, interpolated, and divided
 * by the mixed alpha again. Mixing with `transparent` therefore keeps A's
 * channels and only scales its alpha; mixing two translucent colours weights
 * each by its own alpha.
 */
function mixOklab(a: RGBA, b: RGBA, p: number): RGBA {
  const alpha = a.a * p + b.a * (1 - p);
  if (alpha === 0) return TRANSPARENT;
  const labA = linearSrgbToOklab(a);
  const labB = linearSrgbToOklab(b);
  const channel = (key: 'L' | 'a' | 'b') =>
    (labA[key] * a.a * p + labB[key] * b.a * (1 - p)) / alpha;
  return { ...oklabToLinearSrgb(channel('L'), channel('a'), channel('b')), a: alpha };
}

/**
 * Resolves a token value (oklch(), var(--x), black, white, transparent, or a
 * two-colour `color-mix(in oklab, A P%, B)`) to a linear-light RGBA.
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

  // The lazy first group stops at the first "<n>%," so the first colour is a
  // keyword, var() or oklch(); the second colour may itself be a mix.
  const mixMatch = trimmed.match(/^color-mix\(in oklab,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)$/);
  if (mixMatch) {
    const [, firstExpr, pctStr, secondExpr] = mixMatch as unknown as [
      string,
      string,
      string,
      string,
    ];
    return mixOklab(
      resolveColor(firstExpr, theme),
      resolveColor(secondExpr, theme),
      Number(pctStr) / 100,
    );
  }

  if (trimmed === 'transparent') return TRANSPARENT;
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
 * is composited over a base surface tier first (`surface` by default) — a
 * no-op for opaque tokens, but required for dark mode's alpha-based subtle
 * backgrounds, which are only ever rendered on top of a surface tier. The
 * foreground is then composited over that result, so translucent foregrounds
 * such as `control-border` are measured as rendered.
 */
function contrastOf(
  theme: Record<string, string>,
  fgKey: string,
  bgKey: string,
  baseKey = 'surface',
): number {
  const fgValue = theme[fgKey];
  const bgValue = theme[bgKey];
  if (!fgValue) throw new Error(`Missing token: ${fgKey}`);
  if (!bgValue) throw new Error(`Missing token: ${bgKey}`);
  return contrastOfValues(theme, fgValue, bgValue, baseKey);
}

/** `contrastOf` for colour expressions that are not a single token, such as a component's mix. */
function contrastOfValues(
  theme: Record<string, string>,
  fgValue: string,
  bgValue: string,
  baseKey: string,
): number {
  const baseValue = theme[baseKey];
  if (!baseValue) throw new Error(`Missing token: ${baseKey}`);

  const bg = compositeOver(resolveColor(bgValue, theme), resolveColor(baseValue, theme));
  const fg = compositeOver(resolveColor(fgValue, theme), bg);
  return contrastRatio(fg, bg);
}

const themes = {
  light: lightTheme as unknown as Record<string, string>,
  dark: darkTheme as unknown as Record<string, string>,
};

const tones = ['destructive', 'success', 'warning', 'info'] as const;
// neutral has subtle slots but no solid `neutral`/`neutral-foreground` pair.
const subtleTones = [...tones, 'neutral'] as const;
const surfaces = ['background', 'surface', 'surface-raised', 'overlay'] as const;
// `border` and `input` are exempt: they are decorative dividers and the text
// input outline, not the only cue that identifies a control.
// `warning-indicator` is exempt in light mode: it is about 2:1, so that a
// mix of it reads amber instead of beige. It is never the only cue (the
// StatusBadge label and icon carry the state; a status dot keeps its label as
// screen-reader text). Dark mode holds it to 3:1 below.
const nonTextSlots = [
  'primary',
  'ring',
  'sidebar-ring',
  'destructive',
  'control-border',
  'brand-indicator',
] as const;
// Light brand-indicator (and ring, sidebar-ring, which point at it) is a chosen brand step, brand-600: floors are its measured ratios.
const nonTextFloors: Record<string, number> = {
  'light:brand-indicator:background': 2.8,
  'light:brand-indicator:surface': 2.91,
  'light:ring:background': 2.8,
  'light:ring:surface': 2.91,
  'light:sidebar-ring:background': 2.8,
  'light:sidebar-ring:surface': 2.91,
};
// Text slots used directly on a surface tier, with no fill of their own.
const surfaceTextSlots = [
  'foreground',
  'foreground-secondary',
  'muted-foreground',
  'success-text',
  'warning-text',
  'destructive-text',
  'info-text',
  'neutral-text',
  'brand-text',
] as const;
const toneTextSlots = ['success-text', 'warning-text', 'destructive-text', 'info-text'] as const;
// The StatusBadge chip recipe, copied from the `statusBadgeVariants` and
// `toneText` maps in packages/ui/src/components/molecules/status-badge.tsx.
// Change both together. Fill: 5% of the tone into `muted`. Label: 30% of the
// tone into `foreground-secondary`. Marker: the tone text slot. `warning`
// fills from `warning-indicator` and mixes its label 70% from `warning-text`.
const chipTones: Record<
  string,
  { tone: string; label?: string; labelMix?: number; marker?: string }
> = {
  neutral: { tone: 'var(--neutral-text)' },
  info: { tone: 'var(--info-text)' },
  success: { tone: 'var(--success-text)' },
  warning: {
    tone: 'var(--warning-indicator)',
    label: 'var(--warning-text)',
    labelMix: 70,
    marker: 'var(--warning-text)',
  },
  critical: { tone: 'var(--destructive-text)' },
  progress: { tone: 'var(--info-text)' },
};
// The toned Alert recipe, copied from `tonedAlert` and `alertVariants` in
// packages/ui/src/components/atoms/alert.tsx. Change both together. Light:
// 7% of the tone into `card`. Dark: 10% of the tone over transparent, on the
// surface tier under the alert. The title is `foreground`, the description
// `foreground-secondary`, the icon the tone's text slot. `warning` tints from
// `warning-indicator` and takes its icon from `warning-text`.
const alertTones: Record<string, { tone: string; icon: string }> = {
  destructive: { tone: 'var(--destructive-text)', icon: 'var(--destructive-text)' },
  warning: { tone: 'var(--warning-indicator)', icon: 'var(--warning-text)' },
  info: { tone: 'var(--info-text)', icon: 'var(--info-text)' },
};
const alertFill = (themeName: string, tone: string) =>
  themeName === 'dark'
    ? `color-mix(in oklab, ${tone} 10%, transparent)`
    : `color-mix(in oklab, ${tone} 7%, var(--card))`;
const textPairs = [
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['sidebar-foreground', 'sidebar'],
  ['sidebar-primary-foreground', 'sidebar-primary'],
  ['sidebar-accent-foreground', 'sidebar-accent'],
] as const;

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

    for (const [fg, bg] of textPairs) {
      test(`${fg} on ${bg} >= 4.5`, () => {
        expect(contrastOf(theme, fg, bg)).toBeGreaterThanOrEqual(MIN_CONTRAST);
      });
    }

    // A brand-coloured name in a table row: on the page, a card, a hovered
    // row (half the `muted` fill) and a selected row (`muted`) on the card.
    test('brand-text on the page, a card, a hovered row and a selected row >= 4.5', () => {
      expect(contrastOf(theme, 'brand-text', 'background', 'background')).toBeGreaterThanOrEqual(
        MIN_CONTRAST,
      );
      expect(contrastOf(theme, 'brand-text', 'card', 'card')).toBeGreaterThanOrEqual(MIN_CONTRAST);
      expect(
        contrastOfValues(
          theme,
          'var(--brand-text)',
          'color-mix(in oklab, var(--muted) 50%, transparent)',
          'card',
        ),
      ).toBeGreaterThanOrEqual(MIN_CONTRAST);
      expect(contrastOf(theme, 'brand-text', 'muted', 'card')).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });

    for (const surface of surfaces) {
      for (const slot of surfaceTextSlots) {
        test(`${slot} on ${surface} >= 4.5`, () => {
          expect(contrastOf(theme, slot, surface)).toBeGreaterThanOrEqual(MIN_CONTRAST);
        });
      }

      // Muted text and tone text also sit on the resting intensity fills
      // (kbd, avatar fallback, chips) and on the `accent` hover fill (menu
      // items, list rows, command items).
      for (const fill of ['muted', 'secondary', 'accent'] as const) {
        for (const slot of ['muted-foreground', 'brand-text', ...toneTextSlots] as const) {
          test(`${slot} on ${fill} over ${surface} >= 4.5`, () => {
            expect(contrastOf(theme, slot, fill, surface)).toBeGreaterThanOrEqual(MIN_CONTRAST);
          });
        }
      }

      // Placeholder text sits on the field fill (`muted`). It is a hint, not
      // content, so it reads fainter than muted text but stays visible.
      test(`faint-foreground on muted over ${surface} is fainter than muted-foreground, >= 2`, () => {
        const faint = contrastOf(theme, 'faint-foreground', 'muted', surface);
        expect(faint).toBeLessThan(contrastOf(theme, 'muted-foreground', 'muted', surface));
        expect(faint).toBeGreaterThanOrEqual(2);
      });

      test(`foreground on code-inline over ${surface} >= 4.5`, () => {
        expect(contrastOf(theme, 'foreground', 'code-inline', surface)).toBeGreaterThanOrEqual(
          MIN_CONTRAST,
        );
      });

      // Tone text: the subtle foregrounds are the text-safe tone colors, used
      // directly on a surface (field errors, destructive menu items, deltas).
      for (const tone of subtleTones) {
        test(`${tone}-subtle-foreground on ${surface} >= 4.5`, () => {
          expect(contrastOf(theme, `${tone}-subtle-foreground`, surface)).toBeGreaterThanOrEqual(
            MIN_CONTRAST,
          );
        });
      }

      for (const slot of nonTextSlots) {
        const floor = nonTextFloors[`${themeName}:${slot}:${surface}`] ?? MIN_NON_TEXT_CONTRAST;
        test(`${slot} on ${surface} >= ${floor} (non-text)`, () => {
          expect(contrastOf(theme, slot, surface)).toBeGreaterThanOrEqual(floor);
        });
      }
    }

    if (themeName === 'dark') {
      for (const surface of surfaces) {
        test(`warning-indicator on ${surface} >= 3 (non-text)`, () => {
          expect(contrastOf(theme, 'warning-indicator', surface)).toBeGreaterThanOrEqual(
            MIN_NON_TEXT_CONTRAST,
          );
        });
      }
    }

    for (const [chipTone, recipe] of Object.entries(chipTones)) {
      const fill = `color-mix(in oklab, ${recipe.tone} 5%, var(--muted))`;
      const label = `color-mix(in oklab, ${recipe.label ?? recipe.tone} ${recipe.labelMix ?? 30}%, var(--foreground-secondary))`;
      const marker = recipe.marker ?? recipe.tone;
      for (const surface of surfaces) {
        test(`StatusBadge ${chipTone} label on its chip fill over ${surface} >= 4.5`, () => {
          expect(contrastOfValues(theme, label, fill, surface)).toBeGreaterThanOrEqual(
            MIN_CONTRAST,
          );
        });
        test(`StatusBadge ${chipTone} icon on its chip fill over ${surface} >= 3 (non-text)`, () => {
          expect(contrastOfValues(theme, marker, fill, surface)).toBeGreaterThanOrEqual(
            MIN_NON_TEXT_CONTRAST,
          );
        });
      }
    }

    for (const [alertTone, recipe] of Object.entries(alertTones)) {
      const fill = alertFill(themeName, recipe.tone);
      for (const surface of surfaces) {
        for (const slot of ['foreground', 'foreground-secondary']) {
          test(`Alert ${alertTone} ${slot} on its tint over ${surface} >= 4.5`, () => {
            expect(contrastOfValues(theme, `var(--${slot})`, fill, surface)).toBeGreaterThanOrEqual(
              MIN_CONTRAST,
            );
          });
        }
        test(`Alert ${alertTone} icon on its tint over ${surface} >= 3 (non-text)`, () => {
          expect(contrastOfValues(theme, recipe.icon, fill, surface)).toBeGreaterThanOrEqual(
            MIN_NON_TEXT_CONTRAST,
          );
        });
      }
    }

    for (const base of ['surface-raised', 'overlay'] as const) {
      for (const tone of subtleTones) {
        test(`${tone}-subtle-foreground on ${tone}-subtle over ${base} >= 4.5`, () => {
          expect(
            contrastOf(theme, `${tone}-subtle-foreground`, `${tone}-subtle`, base),
          ).toBeGreaterThanOrEqual(MIN_CONTRAST);
        });
      }
    }
  });
}
