import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { FormatProvider } from './format-provider.tsx';
import { PasswordInput } from './password-input.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('PasswordInput', () => {
  test('the reveal toggle has the English label by default', () => {
    const markup = html(<PasswordInput />);

    expect(markup).toContain('type="password"');
    expect(markup).toContain('aria-label="Show password"');
  });

  test('reads the toggle label from FormatProvider messages', () => {
    const markup = html(
      <FormatProvider messages={{ passwordInput: { showPassword: 'Passwort anzeigen' } }}>
        <PasswordInput />
      </FormatProvider>,
    );

    expect(markup).toContain('aria-label="Passwort anzeigen"');
  });

  test('the showPasswordLabel prop wins over FormatProvider messages', () => {
    const markup = html(
      <FormatProvider messages={{ passwordInput: { showPassword: 'Passwort anzeigen' } }}>
        <PasswordInput showPasswordLabel="Reveal" />
      </FormatProvider>,
    );

    expect(markup).toContain('aria-label="Reveal"');
  });
});
