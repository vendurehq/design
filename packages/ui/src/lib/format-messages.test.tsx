import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { FormatProvider } from '../components/molecules/format-provider.tsx';
import { defaultMessages, type FormatMessages, useMessages } from './format-messages.ts';

function Probe(props: { label?: string }) {
  const t = useMessages('searchTrigger', { label: props.label });
  return <>{`${t.label}|${t.commandPalette}`}</>;
}

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('useMessages', () => {
  test('without a provider it returns the English defaults', () => {
    expect(html(<Probe />)).toBe('Search|command palette');
  });

  test('the provider messages replace the defaults they name', () => {
    const markup = html(
      <FormatProvider messages={{ searchTrigger: { label: 'Suchen' } }}>
        <Probe />
      </FormatProvider>,
    );
    expect(markup).toBe('Suchen|command palette');
  });

  test('the label prop wins over the provider messages', () => {
    const markup = html(
      <FormatProvider messages={{ searchTrigger: { label: 'Suchen' } }}>
        <Probe label="Finden" />
      </FormatProvider>,
    );
    expect(markup).toBe('Finden|command palette');
  });

  test('an undefined text in messages keeps the default', () => {
    const markup = html(
      <FormatProvider messages={{ searchTrigger: { label: undefined } }}>
        <Probe />
      </FormatProvider>,
    );
    expect(markup).toBe('Search|command palette');
  });

  test('an empty string is a real text, not a fallback', () => {
    const markup = html(
      <FormatProvider messages={{ searchTrigger: { commandPalette: '' } }}>
        <Probe />
      </FormatProvider>,
    );
    expect(markup).toBe('Search|');
  });

  test('it does not mutate the English defaults', () => {
    html(
      <FormatProvider messages={{ searchTrigger: { label: 'Suchen' } }}>
        <Probe />
      </FormatProvider>,
    );
    expect(defaultMessages.searchTrigger.label).toBe('Search');
  });

  test('messages are typed: unknown groups and texts are errors', () => {
    const ok: FormatMessages = { passwordInput: { showPassword: 'Passwort anzeigen' } };
    // @ts-expect-error unknown group
    const badGroup: FormatMessages = { dialogg: { close: 'Schließen' } };
    // @ts-expect-error unknown text in a known group
    const badKey: FormatMessages = { passwordInput: { show: 'Anzeigen' } };
    // @ts-expect-error texts are strings
    const badValue: FormatMessages = { copyButton: { copy: 1 } };
    expect([ok, badGroup, badKey, badValue]).toHaveLength(4);
  });
});
