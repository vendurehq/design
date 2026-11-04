import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Kbd } from './kbd.tsx';

test('Kbd is 11px micro text on a muted fill with the md radius', () => {
  const html = renderToStaticMarkup(<Kbd>Esc</Kbd>);
  const tokens = (html.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/);
  expect(tokens).toEqual(expect.arrayContaining(['text-2xs', 'rounded-md', 'bg-muted', 'text-muted-foreground']));
  expect(tokens).not.toContain('text-xs');
  expect(tokens).not.toContain('rounded-sm');
});
