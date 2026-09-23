import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderTitle,
} from './page-header.tsx';

test('PageHeader wraps the actions below the title when the row is too narrow', () => {
  const html = renderToStaticMarkup(
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Products</PageHeaderTitle>
      </PageHeaderContent>
      <PageHeaderActions>Actions</PageHeaderActions>
    </PageHeader>,
  );
  const header = html.match(/<header[^>]*>/)?.[0] ?? '';
  expect(header).toContain('flex-wrap');
});
