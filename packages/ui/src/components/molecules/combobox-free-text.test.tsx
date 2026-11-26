import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComboboxFreeText, type ComboboxFreeTextProps } from './combobox-free-text.tsx';
import { FormatProvider } from './format-provider.tsx';

const SPINNER = 'role="status"';
const spinnerLabel = (html: string) => html.match(/role="status" aria-label="([^"]*)"/)?.[1];

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

  test('the spinner announces "Loading…", messages.comboboxFreeText.loading, or loadingLabel', () => {
    expect(spinnerLabel(render({ isLoading: true }))).toBe('Loading…');
    const messages = { comboboxFreeText: { loading: 'Wird geladen…' } };
    const fromMessages = renderToStaticMarkup(
      <FormatProvider messages={messages}>
        <ComboboxFreeText value="" onValueChange={() => {}} items={undefined} />
      </FormatProvider>,
    );
    expect(spinnerLabel(fromMessages)).toBe('Wird geladen…');
    const fromProp = renderToStaticMarkup(
      <FormatProvider messages={messages}>
        <ComboboxFreeText value="" onValueChange={() => {}} items={undefined} loadingLabel="Chargement…" />
      </FormatProvider>,
    );
    expect(spinnerLabel(fromProp)).toBe('Chargement…');
  });

  test('the 2.x loading alias is gone', () => {
    const props: ComboboxFreeTextProps = {
      value: '',
      onValueChange: () => {},
      items: [],
      // @ts-expect-error `loading` was removed; use `isLoading`.
      loading: true,
    };
    expect(render(props)).not.toContain(SPINNER);
  });
});

describe('ComboboxFreeText input naming', () => {
  test('aria-label, aria-labelledby and name reach the input', () => {
    const html = render({ 'aria-label': 'Owner email', 'aria-labelledby': 'owner-label', name: 'owner' });
    const input = html.match(/<input[^>]*>/)?.[0] ?? '';
    expect(input).toContain('aria-label="Owner email"');
    expect(input).toContain('aria-labelledby="owner-label"');
    expect(input).toContain('name="owner"');
  });
});
