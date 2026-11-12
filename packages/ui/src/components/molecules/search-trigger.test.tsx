import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { SearchTrigger } from './search-trigger.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('SearchTrigger', () => {
  test('a 28px button that looks like a field, with the word and the shortcut', () => {
    const markup = html(<SearchTrigger />);

    expect(markup).toContain('<button type="button" data-slot="search-trigger"');
    expect(markup).toContain('h-7');
    expect(markup).toContain('bg-muted');
    expect(markup).toContain('text-foreground-secondary');
    expect(markup).toContain('>Search</span>');
    expect(markup).toContain('data-slot="kbd"');
  });

  test('the accessible name says what it opens, and it announces a dialog', () => {
    const markup = html(<SearchTrigger />);

    expect(markup).toContain('aria-label="Search (command palette)"');
    expect(markup).toContain('aria-haspopup="dialog"');
  });

  test('a custom label and accessible name', () => {
    const markup = html(<SearchTrigger label="Suchen" aria-label="Suchen (Befehlspalette)" />);

    expect(markup).toContain('>Suchen</span>');
    expect(markup).toContain('aria-label="Suchen (Befehlspalette)"');
  });

  test('the server render shows Ctrl and the Control shortcut', () => {
    const markup = html(<SearchTrigger />);

    expect(markup).toContain('Ctrl K');
    expect(markup).toContain('aria-keyshortcuts="Control+K"');
  });

  test('shortcutKey={null} shows no shortcut', () => {
    const markup = html(<SearchTrigger shortcutKey={null} />);

    expect(markup).not.toContain('data-slot="kbd"');
    expect(markup).not.toContain('aria-keyshortcuts');
  });

  test('the focus ring is the standard 2px ring', () => {
    expect(html(<SearchTrigger />)).toContain(
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    );
  });

  test('collapse: below md by default, never, or always', () => {
    expect(html(<SearchTrigger />)).toContain('max-md:w-7');
    expect(html(<SearchTrigger />)).toContain('max-md:hidden');
    const never = html(<SearchTrigger collapse="never" />);
    expect(never).not.toContain('max-md:');
    const always = html(<SearchTrigger collapse="always" />);
    expect(always).toContain('w-7');
    expect(always).not.toContain('w-55');
    expect(always).toContain('<span class="truncate hidden">Search</span>');
  });
});
