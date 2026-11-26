import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { PaginationLink } from './pagination.tsx';

describe('PaginationLink', () => {
  test('active marks the current page', () => {
    const html = renderToStaticMarkup(
      <PaginationLink href="#" active>
        2
      </PaginationLink>,
    );
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-active="true"');
  });

  test('an inactive link carries no aria-current', () => {
    const html = renderToStaticMarkup(<PaginationLink href="#">3</PaginationLink>);
    expect(html).not.toContain('aria-current');
  });

  test('isActive was renamed to active', () => {
    renderToStaticMarkup(
      // @ts-expect-error `isActive` was renamed to `active`
      <PaginationLink href="#" isActive>
        2
      </PaginationLink>,
    );
  });
});
