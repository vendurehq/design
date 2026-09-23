import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { TabsLink, TabsNav } from './tabs.tsx';

describe('TabsNav and TabsLink', () => {
  test('render a labelled nav of plain links, not a tablist', () => {
    const html = renderToStaticMarkup(
      <TabsNav aria-label="Billing sections">
        <TabsLink href="/overview" active>
          Overview
        </TabsLink>
        <TabsLink href="/invoices">Invoices</TabsLink>
      </TabsNav>,
    );
    expect(html).toMatch(/^<nav[^>]*aria-label="Billing sections"/);
    expect(html).not.toContain('role="tab');
    expect(html).toContain('href="/overview"');
  });

  test('active marks the current page; inactive links carry no aria-current', () => {
    const html = renderToStaticMarkup(
      <TabsNav aria-label="Sections">
        <TabsLink href="/a" active>
          A
        </TabsLink>
        <TabsLink href="/b" active={false}>
          B
        </TabsLink>
      </TabsNav>,
    );
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*>A<\/a>/);
    expect(html).toMatch(/<a(?![^>]*aria-current)[^>]*>B<\/a>/);
  });

  test('composes a router link through render and keeps its own aria-current', () => {
    function RouterLink({ to, ...props }: React.ComponentProps<'a'> & { to: string }) {
      // Routers such as TanStack Router set aria-current on the active link themselves.
      return <a href={to} aria-current="page" data-router-link="" {...props} />;
    }
    const html = renderToStaticMarkup(
      <TabsNav aria-label="Sections">
        <TabsLink render={<RouterLink to="/settings" />}>Settings</TabsLink>
      </TabsNav>,
    );
    expect(html).toContain('href="/settings"');
    expect(html).toContain('data-router-link=""');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-slot="tabs-link"');
    expect(html).toContain('>Settings</a>');
  });
});
