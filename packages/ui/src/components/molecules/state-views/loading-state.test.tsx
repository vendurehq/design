import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { FormatProvider } from '../format-provider.tsx';
import { LoadingState } from './loading-state.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('LoadingState', () => {
  test('renders the default "Loading…" sr-only label', () => {
    const markup = html(<LoadingState />);

    expect(markup).toContain('<span class="sr-only">Loading…</span>');
  });

  test('overrides the sr-only label via loadingLabel', () => {
    const markup = html(<LoadingState loadingLabel="Wird geladen…" />);

    expect(markup).toContain('<span class="sr-only">Wird geladen…</span>');
    expect(markup).not.toContain('Loading…');
  });

  test('loadingLabel is independent of the visible label', () => {
    const markup = html(<LoadingState label="Fetching orders" loadingLabel="Wird geladen…" />);

    expect(markup).toContain('Fetching orders');
    expect(markup).toContain('Wird geladen…');
  });

  test('reads messages.loadingState.loading, and loadingLabel wins', () => {
    const messages = { loadingState: { loading: 'Wird geladen…' } };
    expect(
      html(
        <FormatProvider messages={messages}>
          <LoadingState />
        </FormatProvider>,
      ),
    ).toContain('<span class="sr-only">Wird geladen…</span>');
    expect(
      html(
        <FormatProvider messages={messages}>
          <LoadingState loadingLabel="Chargement…" />
        </FormatProvider>,
      ),
    ).toContain('<span class="sr-only">Chargement…</span>');
  });
});

describe('LoadingState delay', () => {
  test('waits 150ms by default before it shows', () => {
    const markup = html(<LoadingState />);

    expect(markup).toContain('--loading-state-delay:150ms');
    expect(markup).toContain('[animation:page-fade_');
    expect(markup).toContain('motion-reduce:[animation-duration:0s]');
  });

  test('fades in over the page-fade duration token', () => {
    const markup = html(<LoadingState />);

    expect(markup).toContain('[animation:page-fade_var(--transition-duration-page-fade)_');
    expect(markup).not.toContain('--transition-duration-normal');
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

  test('falls back to the rows bars when children is false', () => {
    const markup = html(<LoadingState rows={3}>{false}</LoadingState>);

    expect(markup.match(/h-14 w-full/g)).toHaveLength(3);
  });

  test('falls back to the rows bars for a conditional part that is off', () => {
    const isAdmin = false;
    const markup = html(
      <LoadingState rows={2}>{isAdmin && <div data-testid="part" />}</LoadingState>,
    );

    expect(markup).not.toContain('data-testid="part"');
    expect(markup.match(/h-14 w-full/g)).toHaveLength(2);
  });

  test('falls back to the rows bars when children is an empty array', () => {
    const markup = html(<LoadingState rows={2}>{[]}</LoadingState>);

    expect(markup.match(/h-14 w-full/g)).toHaveLength(2);
  });
});
