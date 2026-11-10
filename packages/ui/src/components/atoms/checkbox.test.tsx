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

  test('draws a line when indeterminate', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="All" indeterminate />);
    expect(html).toContain('d="M5 12h14"');
  });

  test('the fill grows in and is never scaled from 0', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Accept" />);
    const root = html.match(/<span[^>]*data-slot="checkbox"[^>]*>/)?.[0] ?? '';
    expect(root).toContain('before:scale-70');
    expect(root).toContain('data-checked:before:scale-100');
    expect(root).not.toContain('data-checked:bg-primary');
  });
});
