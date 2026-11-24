import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Switch } from './switch.tsx';

const track = (html: string) => html.match(/<span[^>]*data-slot="switch"[^>]*>/)?.[0] ?? '';
const thumb = (html: string) => html.match(/<span[^>]*data-slot="switch-thumb"[^>]*>/)?.[0] ?? '';

describe('Switch motion', () => {
  const html = renderToStaticMarkup(<Switch aria-label="Airplane mode" />);

  // Same tokens as the Checkbox: the `--ease-*` and `--transition-duration-*`
  // variables, never a raw duration or cubic-bezier.
  test('track and thumb transition with motion tokens only', () => {
    for (const classes of [track(html), thumb(html)]) {
      expect(classes).not.toMatch(/\[transition:[^\]]*\b\d+m?s\b/);
      expect(classes).not.toContain('cubic-bezier');
      expect(classes).not.toMatch(/(^|\s)transition(-transform|-\[|\s|")/);
    }
    expect(track(html)).toContain('data-checked:[transition:background-color_var(--transition-duration-normal)_var(--ease-out)');
    expect(thumb(html)).toContain('[transition:translate_var(--transition-duration-moderate)_var(--ease-out),scale_var(--transition-duration-fast)_var(--ease-press)');
    expect(thumb(html)).toContain('data-checked:[transition:translate_var(--transition-duration-normal)_var(--ease-out)');
  });

  test('the thumb slides with translate, not a margin or a position', () => {
    expect(thumb(html)).toContain('group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)]');
    expect(thumb(html)).not.toMatch(/(^|\s)(left|right|ml|mr)-/);
  });

  // The thumb stretches toward the middle of the track from the side it rests
  // on, only for an enabled switch.
  test('a press stretches the thumb from its resting side, not while disabled', () => {
    const classes = thumb(html);
    expect(classes).toContain('origin-left data-checked:origin-right');
    expect(classes).toContain('motion-safe:group-[:active:not([data-disabled])]/switch:scale-x-[1.15]');
  });

  test('moves by transitions only', () => {
    expect(html).not.toMatch(/animate-|\[animation:/);
  });

  // Reduced motion: the slide and the stretch are gone; only colours fade.
  test('reduced motion keeps colour fades only', () => {
    const classes = thumb(html);
    expect(classes).toContain('motion-reduce:[transition:background-color_var(--transition-duration-fast)_var(--ease-soft)]');
    expect(classes).toContain('motion-reduce:data-checked:[transition:background-color_var(--transition-duration-normal)_var(--ease-soft)]');
    expect(classes).not.toMatch(/motion-reduce:[^\s]*(translate|scale)/);
    expect(classes).toContain('motion-safe:group-[');
  });
});
