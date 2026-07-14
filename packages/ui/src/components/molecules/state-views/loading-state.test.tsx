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
