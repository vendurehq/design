import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { AnonymizedToken, revealReducer } from './anonymized-token.tsx';

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

describe('AnonymizedToken with loadValue', () => {
  const loadValue = async () => 'postgres://user:secret@db.internal/shop';

  test('renders a fixed mask at rest, not a prefix or suffix', () => {
    const markup = html(<AnonymizedToken loadValue={loadValue} />);

    expect(markup).toContain('••••••••');
    expect(markup).toContain('data-state="hidden"');
    expect(markup).not.toContain('postgres');
    expect(markup).not.toContain('blur-[1px]');
  });

  test('names the hidden value and offers a reveal button and copy', () => {
    const markup = html(<AnonymizedToken loadValue={loadValue} />);

    expect(markup).toContain('<span class="sr-only">Hidden value</span>');
    expect(markup).toContain('aria-label="Show value"');
    expect(markup).toContain('aria-label="Copy token"');
  });

  test('labels are configurable for host i18n', () => {
    const markup = html(
      <AnonymizedToken loadValue={loadValue} hiddenLabel="Verborgen" showLabel="Anzeigen" />,
    );

    expect(markup).toContain('Verborgen');
    expect(markup).toContain('aria-label="Anzeigen"');
  });

  test('copy can be turned off; reveal stays', () => {
    const markup = html(<AnonymizedToken loadValue={loadValue} copyable={false} />);

    expect(markup).not.toContain('data-slot="copy-button"');
    expect(markup).toContain('data-slot="anonymized-token-reveal"');
  });
});

describe('revealReducer', () => {
  test('click: hidden → loading → revealed', () => {
    const loading = revealReducer({ status: 'hidden' }, { type: 'load' });
    expect(loading).toEqual({ status: 'loading' });
    expect(revealReducer(loading, { type: 'loaded', value: 'secret' })).toEqual({
      status: 'revealed',
      value: 'secret',
    });
  });

  test('error, then retry by clicking again', () => {
    const failed = revealReducer({ status: 'loading' }, { type: 'failed' });
    expect(failed).toEqual({ status: 'error' });
    const retry = revealReducer(failed, { type: 'load' });
    expect(retry).toEqual({ status: 'loading' });
    expect(revealReducer(retry, { type: 'loaded', value: 'secret' })).toEqual({
      status: 'revealed',
      value: 'secret',
    });
  });

  test('hide clears the loaded value', () => {
    const hidden = revealReducer({ status: 'revealed', value: 'secret' }, { type: 'hide' });
    expect(hidden).toEqual({ status: 'hidden' });
    expect(JSON.stringify(hidden)).not.toContain('secret');
  });

  test('a load that settles after hide is dropped', () => {
    const hidden = revealReducer({ status: 'loading' }, { type: 'hide' });
    expect(revealReducer(hidden, { type: 'loaded', value: 'secret' })).toEqual({
      status: 'hidden',
    });
    expect(revealReducer(hidden, { type: 'failed' })).toEqual({ status: 'hidden' });
  });
});
