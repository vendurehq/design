import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { SecretValue } from './secret-value.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('SecretValue', () => {
  const loadValue = async () => 'postgres://user:secret@db.internal/shop';

  test('renders a fixed mask at rest, not a prefix or suffix', () => {
    const markup = html(<SecretValue loadValue={loadValue} />);

    expect(markup).toContain('data-slot="secret-value"');
    expect(markup).toContain('••••••••');
    expect(markup).toContain('data-state="hidden"');
    expect(markup).not.toContain('postgres');
  });

  test('names the hidden value and offers a reveal button and copy', () => {
    const markup = html(<SecretValue loadValue={loadValue} />);

    expect(markup).toContain('<span class="sr-only">Hidden value</span>');
    expect(markup).toContain('aria-label="Show value"');
    expect(markup).toContain('aria-label="Copy value"');
  });

  test('labels are configurable for host i18n', () => {
    const markup = html(
      <SecretValue
        loadValue={loadValue}
        hiddenLabel="Verborgen"
        showLabel="Anzeigen"
        copyLabel="Kopieren"
      />,
    );

    expect(markup).toContain('Verborgen');
    expect(markup).toContain('aria-label="Anzeigen"');
    expect(markup).toContain('aria-label="Kopieren"');
  });

  test('copy can be turned off; reveal stays', () => {
    const markup = html(<SecretValue loadValue={loadValue} copyable={false} />);

    expect(markup).not.toContain('data-slot="copy-button"');
    expect(markup).toContain('data-slot="secret-value-reveal"');
  });

  test('never puts a value in a title', () => {
    expect(html(<SecretValue loadValue={loadValue} />)).not.toContain('title=');
  });
});
