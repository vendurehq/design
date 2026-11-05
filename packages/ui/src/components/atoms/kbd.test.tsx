import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Kbd } from './kbd.tsx';

test('Kbd is 12px medium text on the muted tint with a hairline and the md radius', () => {
  const html = renderToStaticMarkup(<Kbd>Esc</Kbd>);
  const tokens = (html.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/);
  expect(tokens).toEqual(
    expect.arrayContaining([
      'text-xs',
      'font-medium',
      'rounded-md',
      'bg-muted',
      'text-muted-foreground',
      'inset-ring',
      'inset-ring-border',
      'px-1.25',
      'h-5',
    ]),
  );
  expect(tokens).not.toContain('text-2xs');
  expect(tokens).not.toContain('rounded-sm');
});
