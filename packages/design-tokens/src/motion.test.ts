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
  test('the brand line grows from the start edge and fades, once, in 420ms on the out curve', () => {
    expect(duration.pageSwitch).toBe('420ms');
    expect(animation.pageSwitchLine).toBe(
      `page-switch-line ${duration.pageSwitch} ${easing.out} forwards`,
    );
    expect(keyframes.pageSwitchLine).toEqual({
      '0%': { transform: 'scaleX(0)', opacity: '1' },
      '60%': { transform: 'scaleX(1)', opacity: '1' },
      '100%': { transform: 'scaleX(1)', opacity: '0' },
    });
  });

  test('the new content fades up from 35% in 240ms and settles out of a 3px blur and drop in 280ms', () => {
    expect(duration.pageReloadFade).toBe('240ms');
    expect(duration.pageReloadSettle).toBe('280ms');
    expect(animation.pageReload).toBe(
      `page-reload-fade ${duration.pageReloadFade} ${easing.out}, page-reload-settle ${duration.pageReloadSettle} ${easing.out}`,
    );
    expect(keyframes.pageReloadFade).toEqual({ from: { opacity: '0.35' } });
    expect(keyframes.pageReloadSettle).toEqual({
      from: { filter: 'blur(3px)', transform: 'translateY(3px)' },
    });
  });

  test('with reduced motion the content only fades', () => {
    expect(animation.pageReloadFade).toBe(
      `page-reload-fade ${duration.pageReloadFade} ${easing.out}`,
    );
  });

  test('the reload runs once and holds no start state', () => {
    for (const value of [animation.pageReload, animation.pageReloadFade]) {
      expect(value).not.toMatch(/infinite|backwards|both|forwards/);
    }
  });
});

describe('Live pulse', () => {
  test('repeats a 2.4s run on the out curve', () => {
    expect(duration.livePulse).toBe('2.4s');
    expect(animation.livePulse).toBe(`live-pulse ${duration.livePulse} ${easing.out} infinite`);
  });
});

describe('Match flash', () => {
  test('runs once in 1.4s on the flash curve, the CSS ease-out', () => {
    expect(duration.matchFlash).toBe('1.4s');
    expect(easing.flash).toBe('cubic-bezier(0, 0, 0.58, 1)');
    expect(animation.matchFlash).toBe(`match-flash ${duration.matchFlash} ${easing.flash}`);
    expect(animation.matchFlash).not.toMatch(/infinite|backwards|both|forwards/);
  });

  test('holds a bar and a 22% fill for 30%, then fades, and moves nothing', () => {
    const { '0%': start, '30%': hold } = keyframes.matchFlash;
    expect(hold).toEqual(start);
    expect(start.boxShadow).toBe('inset 2px 0 0 var(--match-flash-color, var(--brand-indicator))');
    expect(start.backgroundColor).toContain('22%');
    expect(Object.keys(start)).not.toContain('transform');
  });
});
