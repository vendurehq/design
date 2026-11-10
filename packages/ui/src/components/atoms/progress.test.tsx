import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Tone } from '../../lib/state-dictionary.ts';
import { Progress, type ProgressTone, ProgressValue } from './progress.tsx';
import { slotTag, tagTokens } from '../../test/slot-tokens.ts';

describe('Progress', () => {
  test('the track is 4px high in the accent tint for every tone', () => {
    for (const tone of ['default', 'success', 'critical'] as const) {
      const track = tagTokens(slotTag(renderToStaticMarkup(<Progress tone={tone} value={40} />), 'progress-track'));
      expect(track).toContain('h-1');
      expect(track).toContain('bg-accent');
    }
  });

  test('a known value scales a full-width fill, so it grows with a transform', () => {
    const html = renderToStaticMarkup(<Progress value={40} />);
    expect(slotTag(html, 'progress-track')).toContain('--progress-scale:0.4');
    const fill = tagTokens(slotTag(html, 'progress-indicator'));
    expect(fill).toContain('w-full!');
    expect(fill).toContain('scale-x-(--progress-scale,1)');
    expect(fill).toContain('motion-safe:transition-[scale]');
    expect(fill).toContain('motion-safe:not-data-indeterminate:starting:scale-x-0');
    expect(fill).toContain('motion-safe:duration-progress-fill');
    expect(fill).toContain('motion-safe:ease-out');
  });

  test('right to left: the fill grows from the right, the band sweeps in reverse, the value sits at the end', () => {
    const fill = tagTokens(slotTag(renderToStaticMarkup(<Progress value={null} />), 'progress-indicator'));
    expect(fill).toEqual(expect.arrayContaining(['origin-left', 'rtl:origin-right', 'motion-safe:data-indeterminate:rtl:after:[animation-direction:reverse]']));
    const value = tagTokens(slotTag(renderToStaticMarkup(<Progress value={40}><ProgressValue /></Progress>), 'progress-value'));
    expect(value).toContain('ms-auto');
    expect(value).not.toContain('ml-auto');
  });

  test('a value outside min and max clamps the scale', () => {
    expect(slotTag(renderToStaticMarkup(<Progress value={150} />), 'progress-track')).toContain('--progress-scale:1');
    expect(slotTag(renderToStaticMarkup(<Progress value={5} min={10} max={20} />), 'progress-track')).toContain(
      '--progress-scale:0',
    );
  });

  test('tones fill with their text slot; neutral is a muted fill at 55%', () => {
    const fill = (tone: Parameters<typeof Progress>[0]['tone']) =>
      tagTokens(slotTag(renderToStaticMarkup(<Progress tone={tone} value={100} />), 'progress-indicator'));
    expect(fill('success')).toContain('[--progress-fill:var(--success-text)]');
    expect(fill('critical')).toContain('[--progress-fill:var(--destructive-text)]');
    expect(fill('info')).toContain('[--progress-fill:var(--info-text)]');
    expect(fill('neutral')).toEqual(expect.arrayContaining(['[--progress-fill:var(--muted-foreground)]', 'opacity-55']));
  });

  test('takes every glossary tone; progress, the running step, fills in the info colour', () => {
    const tones: ProgressTone[] = ['default', ...(['neutral', 'info', 'success', 'warning', 'critical', 'progress'] satisfies Tone[])];
    for (const tone of tones) {
      const fill = tagTokens(slotTag(renderToStaticMarkup(<Progress tone={tone} value={null} />), 'progress-indicator'));
      expect(fill.some((c) => c.startsWith('[--progress-fill:'))).toBe(true);
    }
    const fill = tagTokens(slotTag(renderToStaticMarkup(<Progress tone="progress" value={null} />), 'progress-indicator'));
    expect(fill).toContain('[--progress-fill:var(--info-text)]');
  });

  test('the root and the track say the tone', () => {
    const html = renderToStaticMarkup(<Progress tone="success" value={90} />);
    expect(slotTag(html, 'progress')).toContain('data-tone="success"');
    expect(slotTag(html, 'progress-track')).toContain('data-tone="success"');
  });

  test('a known value is not indeterminate', () => {
    expect(slotTag(renderToStaticMarkup(<Progress value={40} />), 'progress-indicator')).not.toContain(
      'data-indeterminate=""',
    );
  });

  test('indeterminate: a 40% fill and a band that sweeps only with motion', () => {
    const tag = slotTag(renderToStaticMarkup(<Progress value={null} />), 'progress-indicator');
    expect(tag).toContain('data-indeterminate=""');
    const fill = tagTokens(tag);
    expect(fill).toContain('data-indeterminate:bg-(--progress-fill)/40');
    expect(fill.filter((c) => c.includes('animate-') && !c.startsWith('motion-safe:'))).toEqual([]);
    expect(fill).toContain('motion-safe:data-indeterminate:after:w-2/5');
    expect(fill).toContain('motion-safe:data-indeterminate:after:animate-progress-sweep');
    expect(fill.some((c) => c.includes('shimmer'))).toBe(false);
  });
});
