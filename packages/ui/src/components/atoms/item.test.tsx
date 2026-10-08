import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Item, ItemGroup } from './item.tsx';

// axe aria-required-children: a role="list" group needs listitem children, and
// Item cannot be a listitem because it renders any element (often a link).
describe('ItemGroup', () => {
  test('sets no list role by default', () => {
    const html = renderToStaticMarkup(
      <ItemGroup>
        <Item render={<a href="/orders" />}>Orders</Item>
      </ItemGroup>,
    );
    expect(html).not.toContain('role="list"');
  });

  test('passes a role through when the consumer builds a real list', () => {
    const html = renderToStaticMarkup(<ItemGroup role="list" />);
    expect(html).toContain('role="list"');
  });
});
