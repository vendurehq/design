import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Combobox, ComboboxInput, ComboboxList, ComboboxTrigger, ComboboxValue } from './combobox.tsx';
import { FormatProvider } from '../molecules/format-provider.tsx';
import { slotTokens } from '../../test/slot-tokens.ts';

describe('ComboboxTrigger field styling', () => {
  test('a standalone trigger looks like a form field', () => {
    const html = renderToStaticMarkup(
      <Combobox items={['DE', 'FR']}>
        <ComboboxTrigger>
          <ComboboxValue placeholder="Select a country" />
        </ComboboxTrigger>
      </Combobox>,
    );
    const classes = slotTokens(html, 'combobox-trigger');
    for (const token of [
      'bg-muted',
      'shadow-[inset_0_0_0_1px_var(--border)]',
      'rounded-lg',
      'data-[size=default]:h-8.5',
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-2',
      'focus-visible:outline-ring',
      'aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)]',
      'data-placeholder:text-faint-foreground',
    ]) {
      expect(classes).toContain(token);
    }
    expect(html).toContain('data-size="default"');
  });

  test('size="sm" is 28px, the Button sm height', () => {
    const combobox = renderToStaticMarkup(
      <Combobox items={['DE']}>
        <ComboboxTrigger size="sm" />
      </Combobox>,
    );
    expect(combobox).toContain('data-size="sm"');
    expect(slotTokens(combobox, 'combobox-trigger')).toContain('data-[size=sm]:h-7');
  });

  test('the inline trigger button of ComboboxInput stays a ghost icon button', () => {
    const html = renderToStaticMarkup(
      <Combobox items={['DE']}>
        <ComboboxInput placeholder="Search" />
      </Combobox>,
    );
    const button = html.match(/<button[^>]*>/)?.[0] ?? '';
    expect(button).not.toBe('');
    expect(button).not.toContain('shadow-[inset_0_0_0_1px_var(--border)]');
    expect(button).not.toContain('h-8.5');
  });
});

describe('ComboboxInput trigger name', () => {
  test('the icon-only trigger has a default accessible name', () => {
    const html = renderToStaticMarkup(
      <Combobox items={['DE']}>
        <ComboboxInput aria-label="Country" />
      </Combobox>,
    );
    const button = html.match(/<button[^>]*>/)?.[0] ?? '';
    expect(button).toContain('aria-label="Open options"');
    expect(html.match(/<input[^>]*>/)?.[0]).toContain('aria-label="Country"');
  });

  test('triggerLabel overrides the name', () => {
    const html = renderToStaticMarkup(
      <Combobox items={['DE']}>
        <ComboboxInput triggerLabel="Show countries" />
      </Combobox>,
    );
    expect(html.match(/<button[^>]*>/)?.[0]).toContain('aria-label="Show countries"');
  });
});

describe('Combobox isLoading', () => {
  const list = (props: { isLoading?: boolean; loadingLabel?: string }) => (
    <Combobox items={['DE']} open onLoadMore={() => {}} {...props}>
      <ComboboxList>{(item: string) => <div key={item}>{item}</div>}</ComboboxList>
    </Combobox>
  );
  const status = (html: string) => html.match(/data-slot="combobox-status"[^>]*>([^<]*)</)?.[1];

  test('isLoading shows the loading row, marks the list busy and announces "Loading…"', () => {
    const html = renderToStaticMarkup(list({ isLoading: true }));
    expect(html).toContain('data-slot="combobox-loading"');
    expect(html).toContain('aria-busy="true"');
    expect(status(html)).toBe('Loading…');
  });

  test('without isLoading there is no loading row and nothing to announce', () => {
    const html = renderToStaticMarkup(list({}));
    expect(html).not.toContain('data-slot="combobox-loading"');
    expect(status(html)).toBe('');
  });

  test('the announcement reads messages.combobox.loading, and loadingLabel wins', () => {
    const messages = { combobox: { loading: 'Wird geladen…' } };
    const fromMessages = renderToStaticMarkup(
      <FormatProvider messages={messages}>{list({ isLoading: true })}</FormatProvider>,
    );
    expect(status(fromMessages)).toBe('Wird geladen…');
    const fromProp = renderToStaticMarkup(
      <FormatProvider messages={messages}>{list({ isLoading: true, loadingLabel: 'Chargement…' })}</FormatProvider>,
    );
    expect(status(fromProp)).toBe('Chargement…');
  });

  test('the 2.x loading prop is gone', () => {
    const props: React.ComponentProps<typeof Combobox<string>> = {
      items: ['DE'],
      // @ts-expect-error `loading` was renamed to `isLoading`.
      loading: true,
    };
    expect(props).toBeDefined();
  });
});
