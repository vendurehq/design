import { describe, expect, test } from 'bun:test';
import * as ramps from './tokens/colors.ts';
import { neutral } from './tokens/colors.ts';
import { darkTheme, lightTheme } from './tokens/semantic.ts';

// Every semantic colour is a token reference, a ramp step, or a mix of those.
// A hand-typed literal must be listed below with its reason. The list only
// shrinks: an entry whose value no longer needs it fails the test.
const ALLOWED_LITERALS: Record<string, string> = {
  'light:foreground-secondary': 'near neutral[700] (ΔE 0.012); not yet swapped',
  'light:muted-foreground':
    'contrast-tuned; neutral[500] fails "muted-foreground on background >= 4.5" (contrast.test)',
  'light:warning-text': 'tone text on hue 49, which has no ramp',
  'light:destructive-text':
    'contrast-tuned; destructive[500] fails "destructive-text on muted over background >= 4.5" (contrast.test)',
  'light:info-text':
    'contrast-tuned; brand[700] fails "info-text on background >= 4.5" (contrast.test)',
  'light:warning-indicator': 'hue 72, which has no ramp',
  'light:control-border':
    'contrast-tuned; neutral[400] fails "control-border on background >= 3 (non-text)" (contrast.test)',
  'dark:foreground': 'between neutral ramp steps (ΔE 0.014 to neutral[50]); not yet swapped',
  'dark:muted-foreground':
    'contrast-tuned; neutral[400] fails "muted-foreground on accent over surface-raised >= 4.5" (contrast.test)',
  'dark:success-text': 'tone text; success[300] passes but reads visibly duller',
  'dark:warning-text': 'tone text; warning[300] passes but reads visibly darker and duller',
  'dark:destructive-text':
    'contrast-tuned; destructive[400] fails "destructive-text on accent over surface >= 4.5" (contrast.test)',
};

const themes = { light: lightTheme, dark: darkTheme } as const;
const tokenNames = new Set([...Object.keys(lightTheme), ...Object.keys(darkTheme)]);
const rampValues = new Set<string>();
for (const [ramp, steps] of Object.entries(ramps)) {
  for (const [step, value] of Object.entries(steps as Record<string, string>)) {
    rampValues.add(value);
    tokenNames.add(`${ramp}-${step}`);
  }
}

const isOperand = (value: string): boolean => {
  const v = value.trim();
  if (['black', 'white', 'transparent'].includes(v)) return true;
  const ref = v.match(/^var\(--([\w-]+)\)$/);
  if (ref) return tokenNames.has(ref[1] as string);
  return rampValues.has(v);
};

const isSourced = (value: string): boolean => {
  if (isOperand(value)) return true;
  const mix = value.match(
    /^color-mix\(in oklab,\s*(.+?)(?:\s+[\d.]+%)?,\s*(.+?)(?:\s+[\d.]+%)?\)$/,
  );
  return Boolean(mix && isOperand(mix[1] as string) && isOperand(mix[2] as string));
};

describe('semantic colours come from tokens or ramp steps', () => {
  for (const [themeName, theme] of Object.entries(themes)) {
    for (const [key, value] of Object.entries(theme as Record<string, string>)) {
      const id = `${themeName}:${key}`;
      if (id in ALLOWED_LITERALS) {
        test(`${id} is still a literal (else drop it from ALLOWED_LITERALS)`, () => {
          expect(isSourced(value)).toBe(false);
        });
      } else {
        test(`${id} references a token or a ramp step`, () => {
          expect(isSourced(value)).toBe(true);
        });
      }
    }
  }

  test('every ALLOWED_LITERALS entry names a slot that exists', () => {
    for (const id of Object.keys(ALLOWED_LITERALS)) {
      const [themeName, key] = id.split(':') as [keyof typeof themes, string];
      expect(themes[themeName]).toHaveProperty(key);
    }
  });
});

// A semantic neutral (hue 231, chroma under 0.02) takes the chroma of the
// neutral step nearest in lightness, so text and surfaces share the ramp's
// cool bias (docs/design-tokens.md). Pure white has no chroma.
describe('semantic neutrals use the neutral ramp chroma', () => {
  const steps = Object.values(neutral).map((value) => {
    const [, l, c] = value.match(/^oklch\(([\d.]+) ([\d.]+) 231\)$/) as RegExpMatchArray;
    return { l: Number(l), c: Number(c) };
  });
  const literals = [
    ...Object.entries(ramps.surfaces).map(([step, value]) => [`surfaces[${step}]`, value]),
    ...Object.entries(themes).flatMap(([themeName, theme]) =>
      Object.entries(theme as Record<string, string>).map(([key, value]) => [
        `${themeName}:${key}`,
        value,
      ]),
    ),
  ];
  for (const [id, value] of literals) {
    const match = value?.match(/^oklch\(([\d.]+) ([\d.]+) 231\)$/);
    if (!match || Number(match[2]) >= 0.02 || Number(match[1]) === 1) continue;
    test(`${id} has the chroma of its nearest neutral step`, () => {
      const l = Number(match[1]);
      const nearest = steps.reduce((a, b) => (Math.abs(b.l - l) < Math.abs(a.l - l) ? b : a));
      expect(Number(match[2])).toBe(nearest.c);
    });
  }
});
