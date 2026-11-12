import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Checkbox } from './checkbox.tsx';

// The fill reveals the mark: the mark is always drawn and its indicator takes
// the fill's clip, so it must stay mounted while unchecked.
describe('Checkbox mark', () => {
  const indicator = (html: string) =>
    html.match(/<span[^>]*data-slot="checkbox-indicator"[^>]*>/)?.[0] ?? '';

  test('stays mounted while unchecked, clipped to the fill', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Accept" />);
    const classes = indicator(html);
    expect(classes).toContain('[clip-path:var(--checkbox-clip)]');
    expect(classes).toContain('absolute -inset-px');
    expect(classes).toContain('[transition:clip-path_var(--transition-duration-fast)_var(--ease-soft)]');
    expect(classes).toContain('data-checked:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)]');
    expect(html).toContain('d="M4 12l5 5L20 6"');
    expect(html).not.toContain('stroke-dashoffset');
  });

  test('the check and the indeterminate line are two paths, both always there', () => {
    for (const html of [
      renderToStaticMarkup(<Checkbox aria-label="All" />),
      renderToStaticMarkup(<Checkbox aria-label="All" indeterminate />),
      renderToStaticMarkup(<Checkbox aria-label="All" defaultChecked />),
    ]) {
      expect(html).toContain('d="M4 12l5 5L20 6"');
      expect(html).toContain('d="M5 12h14"');
    }
  });

  // Keyed on `data-checked` alone: the shared `data-checked` variant also
  // matches `data-state`, and inside a group selector Chromium then restyles
  // the whole subtree of any element whose `data-state` changes (every row of
  // a DataTable at select all).
  test('the line shows only while indeterminate; leaving, the swap waits for the hole', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Accept" />);
    const check = html.match(/<path d="M4 12l5 5L20 6"[^>]*>/)?.[0] ?? '';
    const line = html.match(/<path d="M5 12h14"[^>]*>/)?.[0] ?? '';
    expect(check).toContain('group-data-indeterminate/checkbox:opacity-0');
    expect(line).toContain('opacity-0 group-data-indeterminate/checkbox:opacity-100');
    expect(check).toContain('[transition:opacity_0s_linear_var(--transition-duration-fast)]');
    expect(check).toContain('group-data-[checked]/checkbox:[transition-delay:0s]');
    expect(check).not.toContain('group-data-checked');
  });
});

describe('Checkbox fill', () => {
  const root = (html: string) => html.match(/<span[^>]*data-slot="checkbox"[^>]*>/)?.[0] ?? '';

  // The fill closes in around a round hole that shrinks to the middle. Only
  // the clip moves; no scale, no fade, nothing that changes layout.
  test('closes in around a circle, with a square where shape() is missing', () => {
    const classes = root(renderToStaticMarkup(<Checkbox aria-label="Accept" />));
    expect(classes).toContain('[--checkbox-hole:1]');
    expect(classes).toContain('supports-[clip-path:shape(from_0_0,line_to_1px_1px)]:[--checkbox-clip:shape(evenodd_from_');
    expect(classes).toContain('arc_to_calc(50%_+_var(--checkbox-hole)*(70.711%_+_1px))_50%_of_1px_cw');
    expect(classes).toContain('[--checkbox-clip:polygon(evenodd,');
    expect(classes).toContain('before:[clip-path:var(--checkbox-clip)]');
    expect(classes).toContain('data-checked:[--checkbox-hole:0]');
    expect(classes).toContain('data-indeterminate:[--checkbox-hole:0]');
    expect(classes).toContain('data-checked:before:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)]');
    expect(classes).toContain('before:[transition:clip-path_var(--transition-duration-fast)_var(--ease-soft)]');
    expect(classes).not.toMatch(/(^|\s)before:(scale-|opacity-0)/);
    expect(classes).not.toContain('data-checked:bg-primary');
  });

  // Transitions, not keyframes, so a fast check, uncheck, check reverses from
  // wherever it is instead of restarting.
  test('moves by transitions only', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Accept" />);
    expect(html).not.toMatch(/animate-|\[animation:/);
  });

  // Reduced motion: the fill and the mark are whole; both only fade, together.
  test('reduced motion keeps a plain fade', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Accept" />);
    const classes = root(html);
    expect(classes).toContain('motion-reduce:[--checkbox-hole:0]');
    expect(classes).toContain('motion-reduce:before:opacity-0');
    expect(classes).toContain('motion-reduce:data-checked:before:opacity-100');
    expect(classes).toContain('motion-reduce:before:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft)]');
    const mark = html.match(/<span[^>]*data-slot="checkbox-indicator"[^>]*>/)?.[0] ?? '';
    expect(mark).toContain('motion-reduce:opacity-0');
    expect(mark).toContain('motion-reduce:data-checked:opacity-100');
    expect(mark).toContain('motion-reduce:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft)]');
  });
});
