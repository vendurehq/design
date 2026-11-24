import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { LoadingState } from './loading-state.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('LoadingState', () => {
  test('renders the default "Loading…" sr-only label', () => {
    const markup = html(<LoadingState />);

    expect(markup).toContain('<span class="sr-only">Loading…</span>');
  });

  test('overrides the sr-only label via srLabel for host i18n', () => {
    const markup = html(<LoadingState srLabel="Wird geladen…" />);

    expect(markup).toContain('<span class="sr-only">Wird geladen…</span>');
    expect(markup).not.toContain('Loading…');
  });

  test('srLabel is independent of the visible label', () => {
    const markup = html(<LoadingState label="Fetching orders" srLabel="Wird geladen…" />);

    expect(markup).toContain('Fetching orders');
    expect(markup).toContain('Wird geladen…');
  });
});

describe('LoadingState delay', () => {
  test('waits 150ms by default before it shows', () => {
    const markup = html(<LoadingState />);

    expect(markup).toContain('--loading-state-delay:150ms');
    expect(markup).toContain('[animation:page-fade_');
    expect(markup).toContain('motion-reduce:[animation-duration:0s]');
  });

  test('takes a custom delay', () => {
    expect(html(<LoadingState delay={400} />)).toContain('--loading-state-delay:400ms');
  });

  test('delay={0} shows at once, with no entry animation', () => {
    const markup = html(<LoadingState delay={0} />);

    expect(markup).not.toContain('--loading-state-delay');
    expect(markup).not.toContain('[animation:page-fade_');
  });

  test('keeps a consumer style next to the delay', () => {
    expect(html(<LoadingState style={{ minHeight: 200 }} />)).toContain('min-height:200px');
  });
});

describe('LoadingState children', () => {
  test('renders skeleton parts instead of the bars', () => {
    const markup = html(
      <LoadingState>
        <div data-testid="part" />
      </LoadingState>,
    );

    expect(markup).toContain('data-testid="part"');
    expect(markup).not.toContain('h-14');
    expect(markup).toContain('<span class="sr-only">Loading…</span>');
  });

  test('without children draws the rows bars', () => {
    expect(html(<LoadingState rows={2} />).match(/h-14 w-full/g)).toHaveLength(2);
  });
});
