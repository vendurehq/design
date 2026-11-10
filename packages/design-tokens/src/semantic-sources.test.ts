import { describe, expect, test } from 'bun:test';
import * as ramps from './tokens/colors.ts';
import { darkTheme, lightTheme } from './tokens/semantic.ts';

// Every semantic colour is a token reference, a ramp step, or a mix of those.
// A hand-typed literal must be listed below with its reason. The list only
// shrinks: an entry whose value no longer needs it fails the test.
const ALLOWED_LITERALS: Record<string, string> = {
  'light:background':
    'between neutral ramp steps; neutral[50] drops muted text on accent to 4.4999 (contrast.test)',
  'light:foreground':
    'between neutral[900] and [950], with more chroma than the ramp; the light shadows derive from it',
  'light:foreground-secondary': 'near neutral[700] (ΔE 0.012); not yet swapped',
  'light:surface': 'surface tier above the top neutral step; no ramp step fits',
  'light:surface-raised': 'pure white raised tier; the neutral ramp has no white step',
  'light:muted-foreground':
    'contrast: 4.5:1 on accent, muted and secondary over every tier (contrast.test)',
  'light:faint-foreground':
    'placeholder tier between muted-foreground and the canvas; nearest step is visibly off',
  'light:success-text': 'tone text, not a ramp step by design (docs/design-tokens.md)',
  'light:warning-text': 'tone text on hue 49, which has no ramp',
  'light:destructive-text': 'tone text; destructive[500] fails 4.5:1 on muted (contrast.test)',
  'light:info-text': 'tone text; brand[700] fails 4.5:1 on background (contrast.test)',
  'light:warning-indicator': 'hue 72, which has no ramp',
  'light:control-border':
    'contrast: 3:1 non-text on every tier; neutral[400] fails (contrast.test)',
  'dark:foreground': 'between neutral ramp steps (ΔE 0.014 to neutral[50]); not yet swapped',
  'dark:foreground-secondary': 'between neutral[200] and [300]; nearest step is visibly off',
  'dark:surface': 'dark surface tier between neutral[900] and [800]; no ramp step fits',
  'dark:surface-raised': 'dark raised tier between neutral[900] and [800]; no ramp step fits',
  'dark:secondary-foreground': 'between neutral[50] and [100]; nearest step is visibly off',
  'dark:muted-foreground':
    'contrast: 4.5:1 on accent over surface-raised; neutral[400] fails (contrast.test)',
  'dark:faint-foreground': 'placeholder tier; nearest step is visibly off',
  'dark:accent-foreground': 'between neutral[50] and [100]; nearest step is visibly off',
  'dark:destructive': 'margin over 3:1 non-text; destructive[500] holds only 3.07',
  'dark:destructive-foreground':
    'contrast: destructive[50] gives 4.38 on destructive (contrast.test)',
  'dark:success-text': 'tone text, 11° off the success ramp by design',
  'dark:warning-text': 'tone text; warning[300] is visibly darker',
  'dark:destructive-text': 'tone text; destructive[400] fails 4.5:1 on accent (contrast.test)',
  'dark:neutral-text': 'tone text, brighter than muted-foreground; nearest step is visibly off',
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
