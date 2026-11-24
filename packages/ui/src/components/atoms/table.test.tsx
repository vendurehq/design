import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Table, TableFooter, TableRow } from './table.tsx';

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

// The scroll cue is measured in the browser after mount, so a server render
// (and a table that fits) has no cue: no `data-overflow-*` mark and no mask.
// The mask only applies behind those marks. The stories OverflowAtRest,
// OverflowScrolled and OverflowRightToLeft scroll real tables and check the
// marks and the computed mask in the browser.
describe('Table scroll cue', () => {
  const containerTokens = (html: string) =>
    (html.match(/data-slot="table-container"[^>]*class="([^"]*)"/)?.[1] ?? '').split(/\s+/);

  test('a table that has not overflowed shows no cue', () => {
    const html = renderToStaticMarkup(<Table />);
    // An attribute, not the variant in the class list.
    expect(html).not.toMatch(/\sdata-overflow-(start|end)[\s=>]/);
    expect(html).not.toContain('tabindex');
    // No mask outside the overflow marks: a fitting table is not masked.
    const unconditionalMasks = containerTokens(html).filter((token) => token.startsWith('[mask-image'));
    expect(unconditionalMasks).toEqual([]);
  });

  test('each edge fades only behind its own overflow mark', () => {
    const tokens = containerTokens(renderToStaticMarkup(<Table />));
    expect(tokens).toEqual(
      expect.arrayContaining([
        'data-overflow-start:[mask-image:var(--table-fade)]',
        'data-overflow-end:[mask-image:var(--table-fade)]',
      ]),
    );
  });

  test('the fade follows the reading direction and needs no surface colour', () => {
    const tokens = containerTokens(renderToStaticMarkup(<Table />));
    const fades = tokens.filter((token) => token.includes('--table-fade:'));
    expect(fades).toHaveLength(2);
    expect(fades.find((token) => !token.startsWith('rtl:'))).toContain('to_right');
    expect(fades.find((token) => token.startsWith('rtl:'))).toContain('to_left');
    // A mask fades to transparent, so the fade never names a background.
    for (const fade of fades) {
      expect(fade).not.toMatch(/bg-|--color-|var\(--(background|card|muted)/);
    }
  });

  test('the fade is at most 32px and as wide as the hidden content', () => {
    const tokens = containerTokens(renderToStaticMarkup(<Table />));
    expect(tokens).toEqual(
      expect.arrayContaining([
        '[--table-fade-start:min(var(--table-overflow-start,0px),calc(var(--spacing)*8))]',
        '[--table-fade-end:min(var(--table-overflow-end,0px),calc(var(--spacing)*8))]',
      ]),
    );
  });

  test('the focus ring keeps an opaque frame under the mask', () => {
    const tokens = containerTokens(renderToStaticMarkup(<Table />));
    expect(tokens).toEqual(
      expect.arrayContaining([
        'focus-visible:outline-2',
        'focus-visible:-outline-offset-2',
        'focus-visible:[mask-size:100%_100%,2px_100%,2px_100%,100%_2px,100%_2px]',
      ]),
    );
  });
});

// `pinFirstColumn` keeps the first cell of each row in place. The stories
// PinnedFirstColumn, PinnedFirstColumnScrolled and PinnedFirstColumnRightToLeft
// scroll real tables and check the position, the edge and the start fade.
describe('Table pinFirstColumn', () => {
  const container = (html: string) => html.match(/<div data-slot="table-container"[^>]*>/)?.[0] ?? '';
  const tokens = (html: string) => (container(html).match(/class="([^"]*)"/)?.[1] ?? '')
    .replaceAll('&amp;', '&')
    .replaceAll('&gt;', '>')
    .split(/\s+/);

  test('is off by default and marks the container when on', () => {
    expect(container(renderToStaticMarkup(<Table />))).not.toMatch(/\sdata-pin-first-column=/);
    expect(container(renderToStaticMarkup(<Table pinFirstColumn />))).toContain('data-pin-first-column=""');
    // The prop is not passed on to the <table>.
    expect(renderToStaticMarkup(<Table pinFirstColumn />)).not.toMatch(/<table[^>]*pin/i);
  });

  test('pins the first cell of each row, and a data-pinned cell with it, on an opaque, overridable surface', () => {
    expect(tokens(renderToStaticMarkup(<Table pinFirstColumn />))).toEqual(
      expect.arrayContaining([
        '[&[data-pin-first-column]_tr>:is(:first-child,[data-pinned])]:sticky',
        '[&[data-pin-first-column]_tr>:is(:first-child,[data-pinned])]:start-0',
        '[&[data-pin-first-column]_tr>:is(:first-child,[data-pinned])]:[background-color:var(--table-surface,var(--card))]',
        '[&[data-pin-first-column]_tr>:is(:first-child,[data-pinned])]:[background-image:linear-gradient(var(--table-row-fill,transparent),var(--table-row-fill,transparent))]',
      ]),
    );
  });

  test('pinned cells stack above raised row controls, the first cell on top, inside an isolated container', () => {
    const list = tokens(renderToStaticMarkup(<Table pinFirstColumn />));
    expect(list).toEqual(
      expect.arrayContaining([
        '[&[data-pin-first-column]]:isolate',
        '[&[data-pin-first-column]_tr>:is(:first-child,[data-pinned])]:z-12',
        '[&[data-pin-first-column]_tr>[data-pinned]:not(:first-child)]:z-11',
      ]),
    );
    // The other cells are not isolated: a row-wide link layer in one of them
    // must stay under the controls of every cell.
    expect(list.filter((token) => token.endsWith(':isolate'))).toEqual(['[&[data-pin-first-column]]:isolate']);
  });

  test('the first pinned cell draws the selected-row bar, and the row does not', () => {
    const list = tokens(renderToStaticMarkup(<Table pinFirstColumn />));
    expect(list).toEqual(
      expect.arrayContaining([
        '[&[data-pin-first-column]_tr]:before:hidden',
        '[&[data-pin-first-column]_tr]:after:hidden',
        '[&[data-pin-first-column]_tr>:first-child]:before:absolute',
        '[&[data-pin-first-column]_tr>:first-child]:before:start-0',
        '[&[data-pin-first-column]_tr>:first-child]:before:bg-brand-indicator',
        '[&[data-pin-first-column]_tr[data-state=selected]>:first-child]:before:[clip-path:inset(0_0_calc(50%_-_0.5px)_0)]!',
        '[&[data-pin-first-column]_tr[data-state=selected]>:first-child]:after:[clip-path:inset(calc(50%_-_0.5px)_0_0_0)]!',
        '[&[data-pin-first-column]_[data-state=selected]+tr>:first-child]:before:[clip-path:inset(0_0_100%_0)]',
        '[&[data-pin-first-column]_tr[data-next-selected]>:first-child]:after:[clip-path:inset(100%_0_0_0)]',
        'motion-safe:[&[data-pin-first-column]_tr[data-state=selected]>:first-child]:before:opacity-100',
        'motion-reduce:[&[data-pin-first-column]_tr[data-state=selected]>:first-child]:after:opacity-100',
        'rtl:[&[data-pin-first-column]_tr>:first-child]:before:origin-right',
      ]),
    );
  });

  test('the cell bar is the row bar, state for state', () => {
    // Every utility of the row's bar has its twin on the first pinned cell.
    const row = renderToStaticMarkup(
      <table>
        <tbody>
          <TableRow />
        </tbody>
      </table>,
    )
      .replaceAll('&amp;', '&')
      .match(/<tr [^>]*class="([^"]*)"/)?.[1]
      ?.split(/\s+/)
      .filter((token) => /(^|:)(before|after):/.test(token)) ?? [];
    const cell = tokens(renderToStaticMarkup(<Table pinFirstColumn />)).filter((token) =>
      /:first-child\]:(before|after):/.test(token),
    );
    expect(row.length).toBeGreaterThan(30);
    expect(cell).toHaveLength(row.length);
  });

  test('shows an edge only while scrolled, on the inline-end side, and drops the start fade', () => {
    expect(tokens(renderToStaticMarkup(<Table pinFirstColumn />))).toEqual(
      expect.arrayContaining([
        '[--table-pin-edge:inset_0_0_0_transparent]',
        'data-overflow-start:[--table-pin-edge:inset_-1px_0_0_var(--input)]',
        'rtl:data-overflow-start:[--table-pin-edge:inset_1px_0_0_var(--input)]',
        'motion-safe:[&[data-pin-first-column]_tr>:is(:first-child,[data-pinned])]:[transition:box-shadow_var(--transition-duration-fast)_var(--ease-soft)]',
        '[&[data-pin-first-column]]:[--table-fade-start:0px]',
      ]),
    );
  });

  test('pinned cells draw their part of the focus ring, which they cover', () => {
    expect(tokens(renderToStaticMarkup(<Table pinFirstColumn />))).toEqual(
      expect.arrayContaining([
        '[&[data-pin-first-column]:focus-visible]:[--table-pin-ring-x:inset_2px_0_0_var(--ring)]',
        'rtl:[&[data-pin-first-column]:focus-visible]:[--table-pin-ring-x:inset_-2px_0_0_var(--ring)]',
      ]),
    );
  });

  test('rows hand their hover, selected and footer fill to the pinned cell', () => {
    const html = renderToStaticMarkup(
      <table>
        <TableFooter>
          <TableRow />
        </TableFooter>
      </table>,
    ).replaceAll('&amp;', '&');
    expect(html).toContain('hover:[--table-row-fill:color-mix(in_oklab,var(--muted)_50%,transparent)]');
    expect(html).toContain('data-[state=selected]:[--table-row-fill:var(--muted)]');
    expect(html).toMatch(/data-slot="table-footer"[^>]*\[--table-row-fill:color-mix\(in_oklab,var\(--muted\)_50%,transparent\)\]/);
  });
});
