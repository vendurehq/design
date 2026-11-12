import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { LiveIndicator } from './live-indicator.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('LiveIndicator', () => {
  test('a 7px success dot with a pulsing ring by default', () => {
    const markup = html(<LiveIndicator />);

    expect(markup).toContain('size-1.75');
    expect(markup).toContain('text-success-text');
    expect(markup).toContain('motion-safe:after:animate-live-pulse');
  });

  test('reduced motion draws no ring', () => {
    expect(html(<LiveIndicator />)).toContain('motion-reduce:after:hidden');
  });

  test('pulse={false} leaves a still dot', () => {
    const markup = html(<LiveIndicator pulse={false} />);

    expect(markup).not.toContain('animate-live-pulse');
    expect(markup).not.toContain('after:');
  });

  test('each tone colours the dot; warning takes the indicator amber', () => {
    expect(html(<LiveIndicator tone="info" />)).toContain('text-info-text');
    expect(html(<LiveIndicator tone="critical" />)).toContain('text-destructive-text');
    expect(html(<LiveIndicator tone="warning" />)).toContain('text-warning-indicator');
  });

  test('a visible label: the dot is hidden, the label is read', () => {
    const markup = html(<LiveIndicator>Streaming</LiveIndicator>);

    expect(markup).toContain('Streaming');
    expect(markup).toMatch(/<span data-slot="live-indicator" data-tone="success" class/);
    expect(markup).toContain('aria-hidden="true" data-slot="live-indicator-dot"');
    expect(markup).not.toContain('sr-only');
  });

  test('label without children is screen-reader text', () => {
    const markup = html(<LiveIndicator label="Live" />);

    expect(markup).toContain('<span class="sr-only">Live</span>');
    expect(markup).not.toMatch(/data-slot="live-indicator"[^>]*aria-hidden/);
  });

  test('no label and no children: hidden from assistive technology', () => {
    expect(html(<LiveIndicator />)).toMatch(/data-slot="live-indicator"[^>]*aria-hidden="true"/);
  });
});
