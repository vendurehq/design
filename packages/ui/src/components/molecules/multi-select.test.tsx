import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormatProvider } from './format-provider.tsx';
import { MultiSelect, type MultiSelectProps } from './multi-select.tsx';

const SKELETON = 'data-slot="multi-select-value-skeleton"';
const fruits = ['Apple', 'Banana'];

function render(props: Partial<MultiSelectProps<string>>) {
  return renderToStaticMarkup(<MultiSelect<string> items={fruits} {...props} />);
}
const trigger = (html: string) => html.match(/<button[^>]*data-slot="select-trigger"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

describe('MultiSelect while the options load', () => {
  test('a selected value shows a skeleton and "Loading…", not a blank or a raw value', () => {
    const html = trigger(render({ items: undefined, defaultValue: ['Apple'] }));
    expect(html).toContain(SKELETON);
    expect(html).toContain('<span class="sr-only">Loading…</span>');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('Apple');
  });

  test('with nothing selected, the trigger shows the placeholder', () => {
    const html = trigger(render({ items: undefined, placeholder: 'Pick fruit' }));
    expect(html).toContain('Pick fruit');
    expect(html).not.toContain(SKELETON);
  });

  test('loaded items show the selected labels and no busy state', () => {
    const html = trigger(render({ defaultValue: ['Apple', 'Banana'] }));
    expect(html).toContain('Apple');
    expect(html).toContain('Banana');
    expect(html).not.toContain(SKELETON);
    expect(html).not.toContain('aria-busy');
  });

  test('[] is a loaded, empty list: no skeleton', () => {
    expect(trigger(render({ items: [], defaultValue: ['Apple'] }))).not.toContain(SKELETON);
  });

  test('the text reads messages.multiSelect.loading, and loadingLabel wins', () => {
    const messages = { multiSelect: { loading: 'Wird geladen…' } };
    const fromMessages = renderToStaticMarkup(
      <FormatProvider messages={messages}>
        <MultiSelect<string> items={undefined} defaultValue={['Apple']} />
      </FormatProvider>,
    );
    expect(fromMessages).toContain('<span class="sr-only">Wird geladen…</span>');
    const fromProp = renderToStaticMarkup(
      <FormatProvider messages={messages}>
        <MultiSelect<string> items={undefined} defaultValue={['Apple']} loadingLabel="Chargement…" />
      </FormatProvider>,
    );
    expect(fromProp).toContain('<span class="sr-only">Chargement…</span>');
  });
});
