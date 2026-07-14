import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { CopyableText } from './copyable-text.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('CopyableText', () => {
  test('renders the copy button with the default "Copy" label', () => {
    const markup = html(<CopyableText value="sku-123" />);

    expect(markup).toContain('data-slot="copy-button"');
    expect(markup).toContain('aria-label="Copy"');
  });

  // `copiedLabel` takes the same forwarding path but is only rendered once the
  // copied state flips after a clipboard interaction, which a static render
  // cannot reach — so only the `copyLabel` side is asserted here.
  test('forwards copyLabel to the inner CopyButton for host i18n', () => {
    const markup = html(<CopyableText value="sku-123" copyLabel="Kopieren" />);

    expect(markup).toContain('aria-label="Kopieren"');
    expect(markup).not.toContain('aria-label="Copy"');
  });

  test('renders children beside the copy button', () => {
    const markup = html(<CopyableText value="sku-123">SKU-123</CopyableText>);

    expect(markup).toContain('SKU-123');
    expect(markup).toContain('data-slot="copyable-text"');
  });
});
