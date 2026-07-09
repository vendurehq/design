import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppShell, AppShellContent, AppShellHeader, AppShellMain } from './app-shell.tsx';
import { SkipLink } from './skip-link.tsx';

test('AppShell exposes a matching skip link and focus target', () => {
  const html = renderToStaticMarkup(
    <>
      <SkipLink />
      <AppShell>
        <AppShellContent>
          <AppShellHeader>Header</AppShellHeader>
          <AppShellMain>Content</AppShellMain>
        </AppShellContent>
      </AppShell>
    </>,
  );
  expect(html).toContain('href="#main-content"');
  expect(html).toContain('id="main-content"');
  expect(html).toContain('tabindex="-1"');
  expect(html).toContain('data-slot="app-shell-header"');
});
