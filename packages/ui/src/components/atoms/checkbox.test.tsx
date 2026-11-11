import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Checkbox } from './checkbox.tsx';

// The mark is drawn, so it must exist while unchecked (the indicator stays
// mounted) and its path must start on the short stroke of the check.
describe('Checkbox mark', () => {
  test('stays mounted while unchecked, ready to draw', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Accept" />);
    expect(html).toContain('data-slot="checkbox-indicator"');
    expect(html).toContain('d="M4 12l5 5L20 6"');
    expect(html).toContain('pathLength="1"');
  });

  // Both marks stay mounted, so checked and indeterminate cross-draw: one
  // undraws while the other draws, with no blank frame between them.
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

  test('the check draws only when checked and not indeterminate', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Accept" />);
    const check = html.match(/<path d="M4 12l5 5L20 6"[^>]*>/)?.[0] ?? '';
    const line = html.match(/<path d="M5 12h14"[^>]*>/)?.[0] ?? '';
    expect(check).toContain(
      'group-data-checked/checkbox:group-not-data-indeterminate/checkbox:[stroke-dashoffset:0]',
    );
    expect(line).toContain('group-data-indeterminate/checkbox:[stroke-dashoffset:0]');
    expect(line).not.toContain('group-data-checked');
  });
});

describe('Checkbox fill', () => {
  const root = (html: string) => html.match(/<span[^>]*data-slot="checkbox"[^>]*>/)?.[0] ?? '';

  // The fill closes in around a round hole that shrinks to the middle. Only
  // the clip moves; no scale, no fade, nothing that changes layout.
  test('closes in around a circle, with a square where shape() is missing', () => {
    const classes = root(renderToStaticMarkup(<Checkbox aria-label="Accept" />));
    expect(classes).toContain('before:[--checkbox-hole:1]');
    expect(classes).toContain('supports-[clip-path:shape(from_0_0,line_to_1px_1px)]:before:[clip-path:shape(evenodd_from_');
    expect(classes).toContain('arc_to_calc(50%_+_var(--checkbox-hole)*(70.711%_+_1px))_50%_of_1px_cw');
    expect(classes).toContain('before:[clip-path:polygon(evenodd,');
    expect(classes).toContain('data-checked:before:[--checkbox-hole:0]');
    expect(classes).toContain('data-indeterminate:before:[--checkbox-hole:0]');
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

  // Reduced motion: the fill is whole and the mark drawn; both only fade.
  test('reduced motion keeps a plain fade', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Accept" />);
    const classes = root(html);
    expect(classes).toContain('motion-reduce:before:[--checkbox-hole:0]');
    expect(classes).toContain('motion-reduce:before:opacity-0');
    expect(classes).toContain('motion-reduce:data-checked:before:opacity-100');
    expect(classes).toContain('motion-reduce:before:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft)]');
    expect(html).toContain('motion-reduce:[stroke-dashoffset:0]');
    expect(html).toContain('motion-reduce:group-data-indeterminate/checkbox:opacity-100');
  });
});
