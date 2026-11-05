import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SidebarInset } from '../atoms/sidebar.tsx';
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

test('AppShell keeps its canvas inset visible while main scrolls', () => {
  const html = renderToStaticMarkup(
    <AppShell>
      <AppShellContent>
        <AppShellMain>Content</AppShellMain>
      </AppShellContent>
    </AppShell>,
  );

  expect(html).toContain('h-svh');
  expect(html).toContain('overflow-hidden');
  expect(html).toContain('min-h-0 min-w-0 flex-1 overflow-auto');
});

test('AppShellMain can leave scroll ownership to its container', () => {
  const html = renderToStaticMarkup(<AppShellMain scrollOwner="container">Content</AppShellMain>);

  expect(html).toContain('min-w-0 flex-1 outline-none');
  expect(html).not.toContain('overflow-auto');
  expect(html).toContain('id="main-content"');
  expect(html).toContain('tabindex="-1"');
});

test('SidebarInset can be structural when AppShellMain owns the landmark', () => {
  const html = renderToStaticMarkup(
    <SidebarInset render={<div />}>
      <AppShellHeader>Header</AppShellHeader>
      <AppShellMain>Content</AppShellMain>
    </SidebarInset>,
  );

  expect(html.match(/<main/g)).toHaveLength(1);
  expect(html).toContain('data-slot="sidebar-inset"');
  expect(html).toContain('data-slot="app-shell-main"');
});

test('AppShellHeader is a 52px opaque sticky bar with an inset hairline', () => {
  const html = renderToStaticMarkup(<AppShellHeader>Header</AppShellHeader>);
  const tag = html.match(/<header[^>]*>/)?.[0] ?? '';
  const tokens = (tag.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/);

  expect(tokens).toEqual(
    expect.arrayContaining([
      'h-13',
      'sticky',
      'top-0',
      'bg-background',
      'in-data-[slot=app-shell-content]:bg-surface',
      'shadow-[inset_0_-1px_0_var(--border)]',
    ]),
  );
  expect(tokens).not.toContain('h-12');
  expect(tokens.filter((token) => /backdrop-blur|\/85$|^border-b$/.test(token))).toEqual([]);
});
