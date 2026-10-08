import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { InlineCode } from './inline-code.tsx';

test('InlineCode renders a code element on the code-inline tokens', () => {
  const html = renderToStaticMarkup(<InlineCode>runMigrations</InlineCode>);
  expect(html).toStartWith('<code data-slot="inline-code"');
  expect(html).toContain('bg-code-inline');
  expect(html).toContain('border-code-inline-border');
  expect(html).toContain('>runMigrations</code>');
});

test('InlineCode merges className and spreads props', () => {
  const html = renderToStaticMarkup(
    <InlineCode className="px-2" title="Config key">
      port
    </InlineCode>,
  );
  expect(html).toContain('title="Config key"');
  expect(html).toContain('px-2');
  expect(html).not.toContain('px-1');
});
