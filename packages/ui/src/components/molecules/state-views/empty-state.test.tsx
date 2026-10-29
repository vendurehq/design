import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState } from './empty-state.tsx';
import { ErrorState } from './error-state.tsx';

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

describe('compact state views', () => {
  test('EmptyState compact drops the illustration and icon and tightens spacing', () => {
    const html = renderToStaticMarkup(
      <EmptyState size="compact" icon={<svg />} title="No domains" description="Add one." />,
    );
    expect(html).not.toContain('data-slot="empty-icon"');
    expect(html).toContain('data-size="compact"');
    expect(rootClasses(html)).toContain('p-4');
    expect(rootClasses(html)).not.toContain('p-12');
    expect(html).toContain('No domains');
    expect(html).toContain('Add one.');
  });

  test('EmptyState default keeps the illustration', () => {
    const html = renderToStaticMarkup(<EmptyState title="No domains" />);
    expect(html).toContain('data-slot="empty-icon"');
    expect(html).toContain('data-size="default"');
  });

  test('ErrorState compact drops the illustration and icon and keeps role=alert and retry', () => {
    const html = renderToStaticMarkup(
      <ErrorState size="compact" title="Couldn't load usage" onRetry={() => {}} />,
    );
    expect(html).not.toContain('data-slot="empty-icon"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('Try again');
    expect(errorClasses(html)).toContain('p-4');
  });

  test('ErrorState bordered={false} sits flush, with no box', () => {
    const classes = errorClasses(renderToStaticMarkup(<ErrorState bordered={false} />));
    expect(classes).not.toContain('border');
    expect(classes).toContain('rounded-none');
    expect(renderToStaticMarkup(<ErrorState bordered={false} />)).not.toContain('bordered');
  });

  test('ErrorState draws its box by default', () => {
    expect(errorClasses(renderToStaticMarkup(<ErrorState />))).toContain('border');
  });
});

function errorClasses(html: string): string[] {
  const tag = html.match(/<[^>]*data-slot="error-state"[^>]*>/)?.[0] ?? '';
  return (tag.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean);
}
