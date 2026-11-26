import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { AnonymizedToken } from './anonymized-token.tsx';
import { FormatProvider } from './format-provider.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('AnonymizedToken', () => {
  test('renders a blurred truncated preview without exposing the full value', () => {
    const value = 'abcdefghijklmnop';
    const markup = html(<AnonymizedToken value={value} />);

    expect(markup).toContain('abcdefgh...mnop');
    expect(markup).toContain('blur-[1px]');
    expect(markup).not.toContain(value);
  });

  test('copies the full token through an explicit copy button', () => {
    const markup = html(<AnonymizedToken value="abcdefghijklmnop" />);

    expect(markup).toContain('aria-label="Copy token"');
    expect(markup).toContain('data-slot="copy-button"');
  });

  test('can render without the copy affordance', () => {
    const markup = html(<AnonymizedToken value="abcdefghijklmnop" copyable={false} />);

    expect(markup).not.toContain('data-slot="copy-button"');
  });

  test('short values are still shortened', () => {
    const value = 'short';
    const markup = html(<AnonymizedToken value={value} />);

    expect(markup).toContain('sh...');
    expect(markup).not.toContain(value);
  });

  test('preview configuration changes the truncated preview only', () => {
    const markup = html(
      <AnonymizedToken
        value="abcdefghijklmnop"
        previewPrefixLength={4}
        previewSuffixLength={4}
        previewSeparator="--"
      />,
    );

    expect(markup).toContain('abcd--mnop');
    expect(markup).not.toContain('abcdefghijklmnop');
  });

  test('renders a fallback for missing values', () => {
    const markup = html(<AnonymizedToken value={null} fallback="No token" />);

    expect(markup).toContain('No token');
  });
});

describe('AnonymizedToken while the token is not known', () => {
  test('undefined renders a chip-sized skeleton, not the fallback', () => {
    const markup = html(<AnonymizedToken value={undefined} />);

    expect(markup).toContain('data-slot="skeleton"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('<span class="sr-only">Loading token</span>');
    expect(markup).not.toContain('—');
    expect(markup).not.toContain('data-slot="copy-button"');
  });

  test('the loading text can be translated', () => {
    expect(html(<AnonymizedToken value={undefined} loadingLabel="Token lädt" />)).toContain(
      '<span class="sr-only">Token lädt</span>',
    );
  });

  test('the loading text comes from FormatProvider messages, and the prop wins', () => {
    const inProvider = (node: React.ReactElement) =>
      html(
        <FormatProvider messages={{ anonymizedToken: { loading: 'Lädt' } }}>{node}</FormatProvider>,
      );

    expect(inProvider(<AnonymizedToken value={undefined} />)).toContain(
      '<span class="sr-only">Lädt</span>',
    );
    expect(inProvider(<AnonymizedToken value={undefined} loadingLabel="Token" />)).toContain(
      '<span class="sr-only">Token</span>',
    );
  });

  test('the skeleton is valid inside a paragraph', () => {
    expect(
      html(
        <p>
          Key <AnonymizedToken value={undefined} />
        </p>,
      ),
    ).not.toContain('<div');
  });

  test('null and an empty string render the fallback, an em dash by default', () => {
    for (const value of [null, '']) {
      const markup = html(<AnonymizedToken value={value} />);
      expect(markup).toContain('>—</span>');
      expect(markup).not.toContain('aria-busy');
    }
  });
});
