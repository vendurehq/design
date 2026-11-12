import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Table, TableRow } from './table.tsx';

// DataTable marks selected rows with data-state="selected" (TanStack), so the
// selector is live. Selected must stay distinct from the bg-muted/50 hover.
describe('TableRow selected state', () => {
  test('uses the muted fill and a brand-colour leading bar', () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <TableRow data-state="selected" />
        </tbody>
      </table>,
    );
    const tokens = (html.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/);
    expect(tokens).toEqual(
      expect.arrayContaining([
        'hover:bg-muted/50',
        'data-[state=selected]:bg-muted',
        'before:bg-brand-indicator',
        'after:bg-brand-indicator',
        'data-[state=selected]:before:[clip-path:inset(0_0_calc(50%_-_0.5px)_0)]!',
        'data-[state=selected]:after:[clip-path:inset(calc(50%_-_0.5px)_0_0_0)]!',
      ]),
    );
    // A box-shadow cannot grow from an edge; the bar is drawn by the pseudo-elements.
    expect(tokens.some((token) => token.includes('shadow-[inset'))).toBe(false);
    expect(tokens).not.toContain('data-[state=selected]:bg-accent');
  });
});

// The container becomes a tab stop only when it overflows (measured in the
// browser after mount, then tracked with a ResizeObserver), so a server render
// has no tabindex.
// The bar grows from where the row touches a selected row. The row above is
// read with a sibling selector, the row below from `data-next-selected`, which
// TableBody sets; the story SelectionMotion checks the computed values in the
// browser.
describe('TableRow selection bar origin', () => {
  test('each neighbour case has its own starting clip', () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <TableRow />
        </tbody>
      </table>,
    );
    const tokens = (html.match(/class="([^"]*)"/)?.[1] ?? '').replaceAll('&amp;', '&').split(/\s+/);
    expect(tokens).toEqual(
      expect.arrayContaining([
        // Alone: from the middle.
        'before:[clip-path:inset(50%_0_50%_0)]',
        // A selected row above: from the top.
        '[[data-state=selected]+&]:before:[clip-path:inset(0_0_100%_0)]',
        // A selected row below: from the bottom.
        'data-next-selected:after:[clip-path:inset(100%_0_0_0)]',
        // Both: each half from its own end.
        '[[data-state=selected]+&[data-next-selected]]:before:[clip-path:inset(0_0_100%_0)]',
        '[[data-state=selected]+&[data-next-selected]]:after:[clip-path:inset(100%_0_0_0)]',
      ]),
    );
    // No :has() on the row state: in Chromium it restyles every row and cell
    // when a row's selection changes. No custom property on the row either.
    expect(tokens.some((token) => token.includes(':has('))).toBe(false);
    expect(tokens.some((token) => /^[^:]*\[--bar-clip/.test(token))).toBe(false);
  });
});

describe('Table container', () => {
  test('has an inset focus ring and no tab stop until it overflows', () => {
    const html = renderToStaticMarkup(
      <Table>
        <tbody>
          <TableRow />
        </tbody>
      </Table>,
    );
    const container = html.match(/<div[^>]*data-slot="table-container"[^>]*>/)?.[0] ?? '';
    expect(container).not.toContain('tabindex');
    // Inset: the card around the table clips anything outside the container.
    expect(container).toContain('focus-visible:outline-2');
    expect(container).toContain('focus-visible:-outline-offset-2');
    expect(container).toContain('focus-visible:outline-ring');
  });
});
