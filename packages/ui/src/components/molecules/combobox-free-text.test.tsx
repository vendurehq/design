import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComboboxFreeText, type ComboboxFreeTextProps } from './combobox-free-text.tsx';
import { FormatProvider } from './format-provider.tsx';

const SPINNER = 'animate-spin';
/** The text of the always-mounted status, or undefined when it is missing. */
const status = (html: string) =>
  html.match(/data-slot="combobox-free-text-status"[^>]*>([^<]*)</)?.[1];

function render(props: Partial<ComboboxFreeTextProps>) {
  return renderToStaticMarkup(
    <ComboboxFreeText value="" onValueChange={() => {}} items={[]} {...props} />,
  );
}

describe('ComboboxFreeText loading', () => {
  test('isLoading shows the spinner over the current items', () => {
    expect(render({ isLoading: true })).toContain(SPINNER);
    expect(render({ items: [{ value: 'a', label: 'A' }], isLoading: true })).toContain(SPINNER);
  });

  test('loaded items without isLoading show no spinner', () => {
    expect(render({})).not.toContain(SPINNER);
    expect(render({ items: [{ value: 'a', label: 'A' }] })).not.toContain(SPINNER);
  });

  test('items={undefined} is the first load: the spinner shows', () => {
    expect(render({ items: undefined })).toContain(SPINNER);
  });

  test('the status stays mounted and is empty when not loading', () => {
    expect(status(render({}))).toBe('');
    expect(status(render({ items: [{ value: 'a', label: 'A' }] }))).toBe('');
  });

  test('the spinner is decorative: only the status speaks', () => {
    const html = render({ items: undefined });
    expect(html.match(/role="status"/g)).toHaveLength(1);
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  test('the status reads "Loading…", messages.comboboxFreeText.loading, or loadingLabel', () => {
    expect(status(render({ isLoading: true }))).toBe('Loading…');
    expect(status(render({ items: undefined }))).toBe('Loading…');
    const messages = { comboboxFreeText: { loading: 'Wird geladen…' } };
    const fromMessages = renderToStaticMarkup(
      <FormatProvider messages={messages}>
        <ComboboxFreeText value="" onValueChange={() => {}} items={undefined} />
      </FormatProvider>,
    );
    expect(status(fromMessages)).toBe('Wird geladen…');
    const fromProp = renderToStaticMarkup(
      <FormatProvider messages={messages}>
        <ComboboxFreeText
          value=""
          onValueChange={() => {}}
          items={undefined}
          loadingLabel="Chargement…"
        />
      </FormatProvider>,
    );
    expect(status(fromProp)).toBe('Chargement…');
  });
});

describe('ComboboxFreeText input naming', () => {
  test('aria-label, aria-labelledby and name reach the input', () => {
    const html = render({
      'aria-label': 'Owner email',
      'aria-labelledby': 'owner-label',
      name: 'owner',
    });
    const input = html.match(/<input[^>]*>/)?.[0] ?? '';
    expect(input).toContain('aria-label="Owner email"');
    expect(input).toContain('aria-labelledby="owner-label"');
    expect(input).toContain('name="owner"');
  });
});
