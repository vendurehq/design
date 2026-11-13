import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTokens } from '../../test/slot-tokens.ts';
import { IssuedSecret, IssuedSecretFooter, type IssuedSecretGuard } from './issued-secret.tsx';

// The guard's transitions run in the mounted stories
// (issued-secret-interactions.stories.tsx). These tests pin the markup of
// each guard state.

const KEY = 'vk_test_example_0000';

function guard(state: Partial<IssuedSecretGuard> = {}): IssuedSecretGuard {
  return {
    copied: false,
    warned: false,
    markCopied: () => {},
    requestClose: () => {},
    closeAnyway: () => {},
    onOpenChange: () => {},
    ...state,
  };
}

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('IssuedSecret', () => {
  test('never renders the value', () => {
    const markup = html(<IssuedSecret guard={guard()} secretName="API key" value={KEY} />);
    expect(markup).not.toContain(KEY);
    expect(markup).not.toContain('title=');
    expect(markup).toContain('Copy API key');
    expect(markup).toContain('You can copy the API key only now.');
  });

  test('never renders any format value, only labels and hints', () => {
    const markup = html(
      <IssuedSecret
        guard={guard()}
        secretName="API key"
        formats={[
          { label: 'Copy as environment variable', hint: 'For a .env file.', value: `KEY=${KEY}` },
          { label: 'Copy key only', value: KEY },
        ]}
      />,
    );
    expect(markup).not.toContain(KEY);
    expect(markup).toContain('Copy as environment variable');
    expect(markup).toContain('For a .env file.');
    expect(markup.match(/data-slot="issued-secret-copy"/g)).toHaveLength(2);
  });

  test('the first copy button is the primary until a copy', () => {
    const before = html(<IssuedSecret guard={guard()} secretName="API key" value={KEY} />);
    const after = html(
      <IssuedSecret guard={guard({ copied: true })} secretName="API key" value={KEY} />,
    );
    expect(slotTokens(before, 'issued-secret-copy')).toContain('bg-primary');
    expect(slotTokens(after, 'issued-secret-copy')).not.toContain('bg-primary');
    expect(slotTokens(after, 'issued-secret-copy')).toContain('bg-card');
  });

  test('shows the warning only while warned', () => {
    expect(html(<IssuedSecret guard={guard()} secretName="API key" value={KEY} />)).not.toContain(
      'issued-secret-warning',
    );
    const warned = html(
      <IssuedSecret guard={guard({ warned: true })} secretName="API key" value={KEY} />,
    );
    expect(warned).toContain('The API key is not copied');
    expect(warned).toContain('role="alert"');
  });

  test('every built-in text can be replaced', () => {
    const markup = html(
      <IssuedSecret
        guard={guard({ warned: true })}
        secretName="API-Schlüssel"
        value={KEY}
        copyLabel="Kopieren"
        notice="Nur jetzt."
        warningTitle="Nicht kopiert"
        warningDescription="Jetzt kopieren."
        aria-label="Neuer Schlüssel"
      />,
    );
    for (const text of [
      'Kopieren',
      'Nur jetzt.',
      'Nicht kopiert',
      'Jetzt kopieren.',
      'Neuer Schlüssel',
    ]) {
      expect(markup).toContain(text);
    }
    expect(markup).not.toContain('Copy API');
  });
});

describe('IssuedSecretFooter', () => {
  test('Done is quiet before a copy and primary after it', () => {
    expect(
      slotTokens(html(<IssuedSecretFooter guard={guard()} />), 'issued-secret-done'),
    ).toContain('bg-card');
    expect(
      slotTokens(
        html(<IssuedSecretFooter guard={guard({ copied: true })} />),
        'issued-secret-done',
      ),
    ).toContain('bg-primary');
  });

  test('after the warning, "Close without copying" replaces Done', () => {
    const markup = html(<IssuedSecretFooter guard={guard({ warned: true })} />);
    expect(markup).toContain('Close without copying');
    expect(markup).not.toContain('issued-secret-done');
  });

  test('"Close without copying" is the quiet destructive button: the copy stays the one filled button', () => {
    const closeAnyway = slotTokens(
      html(<IssuedSecretFooter guard={guard({ warned: true })} />),
      'issued-secret-close-anyway',
    );
    expect(closeAnyway).toContain('text-destructive-text');
    expect(closeAnyway).toContain('bg-card');
    expect(closeAnyway).not.toContain('bg-destructive');
  });

  test('labels can be replaced', () => {
    expect(html(<IssuedSecretFooter guard={guard()} doneLabel="Fertig" />)).toContain('Fertig');
    expect(
      html(
        <IssuedSecretFooter
          guard={guard({ warned: true })}
          closeAnywayLabel="Trotzdem schließen"
        />,
      ),
    ).toContain('Trotzdem schließen');
  });
});
