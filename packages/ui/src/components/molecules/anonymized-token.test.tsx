import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { AnonymizedToken } from './anonymized-token.tsx';

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
