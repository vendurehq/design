import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxValue } from './combobox.tsx';

/** Class tokens of the first element that carries the given data-slot. */
function classTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
  return (tag.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean);
}

describe('ComboboxTrigger field styling', () => {
  test('a standalone trigger looks like a form field', () => {
    const html = renderToStaticMarkup(
      <Combobox items={['DE', 'FR']}>
        <ComboboxTrigger>
          <ComboboxValue placeholder="Select a country" />
        </ComboboxTrigger>
      </Combobox>,
    );
    const classes = classTokens(html, 'combobox-trigger');
    for (const token of [
      'border',
      'border-input',
      'rounded-md',
      'data-[size=default]:h-9',
      'focus-visible:ring-3',
      'aria-invalid:border-destructive',
      'data-placeholder:text-muted-foreground',
    ]) {
      expect(classes).toContain(token);
    }
    expect(html).toContain('data-size="default"');
  });

  test('size="sm" uses the small field height', () => {
    const combobox = renderToStaticMarkup(
      <Combobox items={['DE']}>
        <ComboboxTrigger size="sm" />
      </Combobox>,
    );
    expect(combobox).toContain('data-size="sm"');
    expect(classTokens(combobox, 'combobox-trigger')).toContain('data-[size=sm]:h-8');
  });

  test('the inline trigger button of ComboboxInput stays a ghost icon button', () => {
    const html = renderToStaticMarkup(
      <Combobox items={['DE']}>
        <ComboboxInput placeholder="Search" />
      </Combobox>,
    );
    const button = html.match(/<button[^>]*>/)?.[0] ?? '';
    expect(button).not.toBe('');
    expect(button).not.toContain('border-input');
    expect(button).not.toContain('h-9');
  });
});
