import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { TablePagination } from './table-pagination.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

// The rendered text with tags stripped, so assertions target the range string.
const rangeText = (node: React.ReactElement) => html(node).replace(/<[^>]+>/g, '');

const noop = () => {};

describe('TablePagination range math', () => {
  test('first full page', () => {
    expect(rangeText(<TablePagination page={1} pageSize={25} totalItems={132} />)).toContain(
      '1–25 of 132',
    );
  });

  test('last partial page clamps the end to totalItems', () => {
    expect(rangeText(<TablePagination page={6} pageSize={25} totalItems={132} />)).toContain(
      '126–132 of 132',
    );
  });

  test('exact multiple fills the page without over-counting', () => {
    expect(rangeText(<TablePagination page={2} pageSize={50} totalItems={100} />)).toContain(
      '51–100 of 100',
    );
  });

  test('empty result renders "0 of 0"', () => {
    expect(rangeText(<TablePagination page={1} pageSize={25} totalItems={0} />)).toContain(
      '0 of 0',
    );
  });

  test('page beyond the last is clamped for the range', () => {
    // page 99 of a 132-item / 25-per-page set clamps to the last page (6).
    expect(rangeText(<TablePagination page={99} pageSize={25} totalItems={132} />)).toContain(
      '126–132 of 132',
    );
  });
});

describe('TablePagination capability rendering', () => {
  test('no page-size selector without onPageSizeChange', () => {
    const markup = html(<TablePagination page={1} pageSize={25} totalItems={132} />);
    expect(markup).not.toContain('Items per page');
    expect(markup).not.toContain('select-trigger');
  });

  test('page-size selector renders with onPageSizeChange', () => {
    const markup = html(
      <TablePagination page={1} pageSize={25} totalItems={132} onPageSizeChange={noop} />,
    );
    expect(markup).toContain('Items per page');
    expect(markup).toContain('data-slot="select-trigger"');
  });

  test('selector trigger reflects the current pageSize', () => {
    // The option list lives in a portal (absent from static markup); the trigger
    // shows the selected value, which is what we can assert here.
    const markup = html(
      <TablePagination
        page={1}
        pageSize={20}
        totalItems={132}
        onPageSizeChange={noop}
        pageSizeOptions={[20, 40]}
      />,
    );
    expect(markup).toContain('>20<');
  });

  test('no prev/next controls when neither onPageChange nor getPageHref is wired', () => {
    const markup = html(<TablePagination page={2} pageSize={25} totalItems={132} />);
    expect(markup).not.toContain('Go to previous page');
    expect(markup).not.toContain('Go to next page');
  });

  test('button mode renders <button> controls, no anchors', () => {
    const markup = html(
      <TablePagination page={2} pageSize={25} totalItems={132} onPageChange={noop} />,
    );
    expect(markup).toContain('Go to previous page');
    expect(markup).toContain('Go to next page');
    expect(markup).toContain('<button');
    expect(markup).not.toContain('<a ');
  });

  test('the page-size selector and prev/next share the default 34px control height', () => {
    const markup = html(
      <TablePagination
        page={2}
        pageSize={25}
        totalItems={132}
        onPageChange={noop}
        onPageSizeChange={noop}
      />,
    );
    expect(markup).toMatch(
      /data-slot="select-trigger"[^>]*data-size="default"|data-size="default"[^>]*data-slot="select-trigger"/,
    );
    for (const slot of ['table-pagination-previous', 'table-pagination-next']) {
      const tag = markup.match(new RegExp(`<button[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
      expect(tag).toContain('size-8.5');
    }
  });
});

describe('TablePagination anchor mode', () => {
  const href = (page: number) => `/products?page=${page}`;

  test('renders real anchors from getPageHref', () => {
    const markup = html(
      <TablePagination page={2} pageSize={25} totalItems={132} getPageHref={href} />,
    );
    expect(markup).toContain('href="/products?page=1"');
    expect(markup).toContain('href="/products?page=3"');
  });

  test('getPageHref wins over onPageChange for navigation rendering', () => {
    const markup = html(
      <TablePagination
        page={2}
        pageSize={25}
        totalItems={132}
        getPageHref={href}
        onPageChange={noop}
      />,
    );
    expect(markup).toContain('href="/products?page=1"');
    expect(markup).toContain('href="/products?page=3"');
  });

  test('disabled first edge is a non-link with aria-disabled', () => {
    const markup = html(
      <TablePagination page={1} pageSize={25} totalItems={132} getPageHref={href} />,
    );
    // Previous points at page 0 → disabled, so no such href, but next is a link.
    expect(markup).not.toContain('href="/products?page=0"');
    expect(markup).toContain('aria-disabled');
    expect(markup).toContain('href="/products?page=2"');
  });

  test('disabled last edge is a non-link with aria-disabled', () => {
    const markup = html(
      <TablePagination page={6} pageSize={25} totalItems={132} getPageHref={href} />,
    );
    expect(markup).not.toContain('href="/products?page=7"');
    expect(markup).toContain('href="/products?page=5"');
    expect(markup).toContain('aria-disabled');
  });

  test('the disabled edge span carries no aria-label (role-less element)', () => {
    // Page 1: prev is the disabled <span> (no label), next is a real labelled link.
    const markup = html(
      <TablePagination page={1} pageSize={25} totalItems={132} getPageHref={href} />,
    );
    expect(markup).toContain('data-slot="table-pagination-previous"');
    expect(markup).not.toContain('aria-label="Go to previous page"');
    expect(markup).toContain('aria-label="Go to next page"');
  });
});

describe('TablePagination navigation landmark & sub-part slots', () => {
  test('prev/next sit in a nav landmark with the default label', () => {
    const markup = html(
      <TablePagination page={2} pageSize={25} totalItems={132} onPageChange={noop} />,
    );
    expect(markup).toContain('<nav');
    expect(markup).toContain('aria-label="Pagination"');
  });

  test('navLabel overrides the landmark name', () => {
    const markup = html(
      <TablePagination
        page={2}
        pageSize={25}
        totalItems={132}
        onPageChange={noop}
        navLabel="Paginering"
      />,
    );
    expect(markup).toContain('aria-label="Paginering"');
    expect(markup).not.toContain('aria-label="Pagination"');
  });

  test('no nav landmark when prev/next are not wired', () => {
    const markup = html(<TablePagination page={1} pageSize={25} totalItems={132} />);
    expect(markup).not.toContain('<nav');
  });

  test('prev/next controls carry sub-part data-slots', () => {
    const markup = html(
      <TablePagination page={2} pageSize={25} totalItems={132} onPageChange={noop} />,
    );
    expect(markup).toContain('data-slot="table-pagination-previous"');
    expect(markup).toContain('data-slot="table-pagination-next"');
  });
});

describe('TablePagination formatRange', () => {
  test('override replaces the default range string', () => {
    const out = rangeText(
      <TablePagination
        page={1}
        pageSize={25}
        totalItems={132}
        formatRange={({ start, end, total }) => `${start}-${end} / ${total}`}
      />,
    );
    expect(out).toContain('1-25 / 132');
  });

  test('override receives a zeroed range for an empty result', () => {
    const out = rangeText(
      <TablePagination
        page={1}
        pageSize={25}
        totalItems={0}
        formatRange={({ start, end, total }) => `${start}|${end}|${total}`}
      />,
    );
    expect(out).toContain('0|0|0');
  });
});

describe('TablePagination disabled edges (button mode)', () => {
  test('previous is disabled on page 1', () => {
    const markup = html(
      <TablePagination page={1} pageSize={25} totalItems={132} onPageChange={noop} />,
    );
    // The prev button carries the disabled attribute.
    expect(markup).toMatch(/Go to previous page[^>]*disabled|disabled[^>]*Go to previous page/);
  });

  test('next is disabled on the last page', () => {
    const markup = html(
      <TablePagination page={6} pageSize={25} totalItems={132} onPageChange={noop} />,
    );
    expect(markup).toMatch(/Go to next page[^>]*disabled|disabled[^>]*Go to next page/);
  });
});

describe('TablePagination labels', () => {
  test('English label defaults', () => {
    const markup = html(
      <TablePagination
        page={2}
        pageSize={25}
        totalItems={132}
        onPageChange={noop}
        onPageSizeChange={noop}
      />,
    );
    expect(markup).toContain('Go to previous page');
    expect(markup).toContain('Go to next page');
    expect(markup).toContain('Items per page');
  });

  test('label overrides are applied', () => {
    const markup = html(
      <TablePagination
        page={2}
        pageSize={25}
        totalItems={132}
        onPageChange={noop}
        onPageSizeChange={noop}
        previousLabel="Vorige"
        nextLabel="Volgende"
        pageSizeLabel="Per pagina"
      />,
    );
    expect(markup).toContain('Vorige');
    expect(markup).toContain('Volgende');
    expect(markup).toContain('Per pagina');
    expect(markup).not.toContain('Go to previous page');
  });
});

describe('TablePagination one-line footer', () => {
  test('the default range groups digits', () => {
    expect(rangeText(<TablePagination page={1} pageSize={10} totalItems={123456} />)).toBe(
      '1–10 of 123,456',
    );
    expect(rangeText(<TablePagination page={12346} pageSize={10} totalItems={123456} />)).toBe(
      '123,451–123,456 of 123,456',
    );
  });

  test('the range and the page-size label never wrap; the label hides in a narrow footer', () => {
    const markup = html(
      <TablePagination page={1} pageSize={10} totalItems={20} onPageSizeChange={noop} />,
    );
    expect(markup).toMatch(/data-slot="table-pagination"[^>]*@container\/table-pagination/);
    expect(markup).toMatch(/data-slot="table-pagination-range"[^>]*whitespace-nowrap/);
    expect(markup).toMatch(
      /whitespace-nowrap @max-md\/table-pagination:sr-only[^>]*>Items per page</,
    );
  });
});

describe('TablePagination loading', () => {
  /** The opening tag of the element with `data-slot="<slot>"`. */
  const tag = (markup: string, slot: string) =>
    markup.match(new RegExp(`<[a-z]+[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';

  test('an unknown total shows a skeleton range, not "0 of 0", and disables prev/next', () => {
    const markup = html(
      <TablePagination page={1} pageSize={25} totalItems={undefined} onPageChange={noop} />,
    );
    expect(
      rangeText(<TablePagination page={1} pageSize={25} totalItems={undefined} />),
    ).not.toContain('of');
    expect(markup).toMatch(/data-slot="table-pagination-range"[^>]*>.*data-slot="skeleton"/);
    expect(tag(markup, 'table-pagination-previous')).toContain('disabled=""');
    expect(tag(markup, 'table-pagination-next')).toContain('disabled=""');
  });

  test('an unknown total renders no links in anchor mode', () => {
    const markup = html(
      <TablePagination
        page={2}
        pageSize={25}
        totalItems={undefined}
        getPageHref={(page) => `/products?page=${page}`}
      />,
    );
    expect(markup).not.toContain('href=');
  });

  test('isLoading keeps the range and marks it and the nav pending', () => {
    const markup = html(
      <TablePagination page={2} pageSize={25} totalItems={132} onPageChange={noop} isLoading />,
    );
    expect(
      rangeText(<TablePagination page={2} pageSize={25} totalItems={132} isLoading />),
    ).toContain('26–50 of 132');
    expect(tag(markup, 'table-pagination-range')).toContain('data-pending=""');
    expect(markup).toMatch(/<nav[^>]*data-pending=""/);
  });

  test('isLoading makes prev/next aria-disabled, not disabled, so they keep focus', () => {
    const markup = html(
      <TablePagination page={2} pageSize={25} totalItems={132} onPageChange={noop} isLoading />,
    );
    for (const slot of ['table-pagination-previous', 'table-pagination-next']) {
      const button = tag(markup, slot);
      expect(button).toContain('aria-disabled="true"');
      expect(button).not.toContain('disabled=""');
    }
  });

  test('not loading: nothing is pending', () => {
    const markup = html(
      <TablePagination page={2} pageSize={25} totalItems={132} onPageChange={noop} />,
    );
    expect(markup).not.toContain('data-pending=""');
    expect(markup).not.toContain('aria-disabled="true"');
  });
});
