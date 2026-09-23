import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState } from './empty-state.tsx';

/** Class tokens of the element that carries `data-slot="empty-state"`. */
function rootClasses(html: string): string[] {
  const tag = html.match(/<[^>]*data-slot="empty-state"[^>]*>/)?.[0] ?? '';
  return (tag.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean);
}

describe('EmptyState border', () => {
  test('draws the dashed box by default', () => {
    const classes = rootClasses(renderToStaticMarkup(<EmptyState title="No orders" />));
    expect(classes).toContain('border');
    expect(classes).toContain('border-dashed');
  });

  test('bordered={false} removes the box so a table can own its perimeter', () => {
    const classes = rootClasses(
      renderToStaticMarkup(<EmptyState bordered={false} title="No orders" />),
    );
    expect(classes).not.toContain('border');
    expect(classes).toContain('rounded-none');
  });

  test('bordered is not forwarded to the DOM', () => {
    const html = renderToStaticMarkup(<EmptyState bordered={false} title="No orders" />);
    expect(html).not.toContain('bordered');
  });
});
