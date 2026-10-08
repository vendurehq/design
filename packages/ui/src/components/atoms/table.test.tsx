import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Table, TableRow } from './table.tsx';

// DataTable marks selected rows with data-state="selected" (TanStack), so the
// selector is live. Selected must stay distinct from the bg-muted/50 hover.
describe('TableRow selected state', () => {
  test('uses the accent fill and a primary leading bar', () => {
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
        'data-[state=selected]:bg-accent',
        'data-[state=selected]:shadow-[inset_2px_0_0_var(--primary)]',
      ]),
    );
    expect(tokens).not.toContain('data-[state=selected]:bg-muted');
  });
});

// The container becomes a tab stop only when it overflows (measured in the
// browser after mount, then tracked with a ResizeObserver), so a server render
// has no tabindex.
describe('Table container', () => {
  test('has a focus ring and no tab stop until it overflows', () => {
    const html = renderToStaticMarkup(
      <Table>
        <tbody>
          <TableRow />
        </tbody>
      </Table>,
    );
    const container = html.match(/<div[^>]*data-slot="table-container"[^>]*>/)?.[0] ?? '';
    expect(container).not.toContain('tabindex');
    expect(container).toContain('focus-visible:ring-2');
    expect(container).toContain('focus-visible:ring-ring');
  });
});
