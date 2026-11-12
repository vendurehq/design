import { describe, expect, test } from 'bun:test';
import { animation, duration, easing, keyframes } from './tokens/motion.ts';

const kebabCase = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const keyframeNames = new Set(Object.keys(keyframes).map(kebabCase));

test('every keyframe an animation runs is defined', () => {
  for (const value of Object.values(animation)) {
    for (const layer of value.split(/,\s*(?![^(]*\))/)) {
      const name = layer.trim().split(/\s+/)[0] ?? '';
      expect(keyframeNames).toContain(name);
    }
  }
});

describe('Page enter', () => {
  test('fades in over pageFade and rises over pageRise, both on the out curve', () => {
    expect(duration.pageFade).toBe('220ms');
    expect(duration.pageRise).toBe('260ms');
    expect(animation.pageEnter).toBe(
      `page-fade ${duration.pageFade} ${easing.out}, page-rise ${duration.pageRise} ${easing.out}`,
    );
  });

  test('with reduced motion it only fades', () => {
    expect(animation.pageFade).toBe(`page-fade ${duration.pageFade} ${easing.out}`);
  });

  test('moves only opacity and transform, and starts 6px low', () => {
    expect(keyframes.pageFade).toEqual({ from: { opacity: '0' } });
    expect(keyframes.pageRise).toEqual({ from: { transform: 'translateY(6px)' } });
  });

  test('runs once: no repeat and no fill that would hold the start state', () => {
    for (const value of [animation.pageEnter, animation.pageFade]) {
      expect(value).not.toMatch(/infinite|backwards|both|forwards/);
    }
  });
});

describe('Page switch', () => {
  test('the page stays dimmed for 420ms, then the new content enters', () => {
    expect(duration.pageSwitch).toBe('420ms');
  });
});

describe('Match flash', () => {
  test('runs once in 1.4s on ease-out', () => {
    expect(animation.matchFlash).toBe('match-flash 1.4s ease-out');
    expect(animation.matchFlash).not.toMatch(/infinite|backwards|both|forwards/);
  });

  test('holds a bar and a 22% fill for 30%, then fades, and moves nothing', () => {
    const step = keyframes.matchFlash['0%, 30%'];
    expect(step.boxShadow).toBe('inset 2px 0 0 var(--match-flash-color, var(--brand-indicator))');
    expect(step.background).toContain('22%');
    expect(Object.keys(step)).not.toContain('transform');
  });
});
