import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { cn } from './utils.ts';

// The theme every consumer loads. The keys come from here, so a new token
// fails this file until `cn` knows its utility.
const themeCss = readFileSync(
  fileURLToPath(import.meta.resolve('@vendure-io/design-tokens/css/theme')),
  'utf8',
);

function themeKeys(namespace: string): string[] {
  const keys = [...themeCss.matchAll(new RegExp(`^\\s*--${namespace}-([a-z0-9-]+):`, 'gm'))]
    .map((match) => match[1] ?? '')
    // `--text-sm--line-height` and `--font-sans--font-feature-settings` are
    // sub-properties of a key, not keys.
    .filter((key) => !key.includes('--'));
  return [...new Set(keys)];
}

const utilityNames = (prefix: string) =>
  [...themeCss.matchAll(new RegExp(`^@utility ${prefix}-([a-z0-9-]+)`, 'gm'))].map(
    (match) => match[1] ?? '',
  );

const shadows = themeKeys('shadow');
const eases = themeKeys('ease');
const durations = themeKeys('transition-duration');
const animations = themeKeys('animate');
const textSizes = themeKeys('text');
const radii = themeKeys('radius');
const trackings = themeKeys('tracking');
const fontWeights = themeKeys('font-weight');
const fontFamilies = themeKeys('font').filter((key) => !key.startsWith('weight-'));
const colors = themeKeys('color');
const textStyles = utilityNames('text-style');

describe('the theme the tests read', () => {
  test('has every token namespace cn has to know', () => {
    for (const keys of [
      shadows,
      eases,
      durations,
      animations,
      textSizes,
      radii,
      trackings,
      fontWeights,
      fontFamilies,
      colors,
      textStyles,
    ]) {
      expect(keys.length).toBeGreaterThan(0);
    }
    expect(shadows).toContain('control');
    expect(shadows).toContain('overlay');
    expect(eases).toContain('press');
    expect(durations).toContain('moderate');
    expect(textStyles).toContain('card-title');
  });
});

describe('cn knows every theme key', () => {
  test('a theme shadow is a shadow, not a shadow colour', () => {
    expect(cn('shadow-control', 'shadow-primary/20')).toBe('shadow-control shadow-primary/20');
    for (const key of shadows) {
      expect(cn(`shadow-${key}`, 'shadow-primary/20')).toBe(`shadow-${key} shadow-primary/20`);
      expect(cn(`shadow-${key}`, 'shadow-[0_0_0_1px_red]')).toBe('shadow-[0_0_0_1px_red]');
    }
  });

  test('a theme ease overrides the ease before it', () => {
    expect(cn('ease-press', 'ease-out')).toBe('ease-out');
    for (const key of eases) {
      expect(cn(`ease-${key}`, 'ease-linear')).toBe('ease-linear');
      expect(cn('ease-linear', `ease-${key}`)).toBe(`ease-${key}`);
    }
  });

  test('a named duration overrides the duration before it', () => {
    expect(cn('duration-fast', 'duration-moderate')).toBe('duration-moderate');
    for (const key of durations) {
      expect(cn(`duration-${key}`, 'duration-200')).toBe('duration-200');
      expect(cn('duration-200', `duration-${key}`)).toBe(`duration-${key}`);
    }
  });

  test('a theme animation overrides the animation before it', () => {
    for (const key of animations) {
      expect(cn(`animate-${key}`, 'animate-none')).toBe('animate-none');
    }
  });

  test('a theme text size is a size, not a colour', () => {
    for (const key of textSizes) {
      expect(cn(`text-${key}`, 'text-[20px]')).toBe('text-[20px]');
      expect(cn(`text-${key}`, 'text-primary')).toBe(`text-${key} text-primary`);
    }
  });

  test('a theme colour is a colour, not a size', () => {
    for (const key of colors) {
      expect(cn(`text-${key}`, 'text-sm')).toBe(`text-${key} text-sm`);
      expect(cn(`text-${key}`, 'text-[color:red]')).toBe('text-[color:red]');
      // `shadow-overlay` is the overlay shadow, not the `overlay` colour:
      // Tailwind reads a shadow key first.
      if (!shadows.includes(key)) {
        expect(cn('shadow-control', `shadow-${key}`)).toBe(`shadow-control shadow-${key}`);
      }
    }
  });

  test('a text style is neither a size nor a colour, and the last one wins', () => {
    for (const key of textStyles) {
      expect(cn(`text-style-${key}`, 'text-primary')).toBe(`text-style-${key} text-primary`);
      expect(cn(`text-style-${key}`, 'text-xs')).toBe(`text-style-${key} text-xs`);
      expect(cn('text-style-page-title', `text-style-${key}`)).toBe(`text-style-${key}`);
    }
  });

  test('theme radii, tracking, weights and font families merge with their siblings', () => {
    for (const key of radii) {
      expect(cn(`rounded-${key}`, 'rounded-[3px]')).toBe('rounded-[3px]');
    }
    for (const key of trackings) {
      expect(cn(`tracking-${key}`, 'tracking-[1px]')).toBe('tracking-[1px]');
    }
    for (const key of fontWeights) {
      expect(cn(`font-${key}`, 'font-[650]')).toBe('font-[650]');
    }
    for (const key of fontFamilies) {
      expect(cn(`font-${key}`, 'font-bold')).toBe(`font-${key} font-bold`);
      expect(cn(`font-${key}`, 'font-[family-name:Inter]')).toBe('font-[family-name:Inter]');
    }
  });
});
