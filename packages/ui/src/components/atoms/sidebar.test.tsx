import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from './sidebar.tsx';

// Regression pins for the collapsed-geometry and icon-sizing fixes (PRs #52/#53).
// The assertions target class tokens on the specific rendered element rather than
// raw markup substrings; true geometry regressions are covered by the visual
// suite in apps/storybook.

/** Class tokens of the first element carrying the given data-slot, entity-decoded. */
function classTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .split(/\s+/)
    .filter(Boolean);
}

describe('Sidebar geometry', () => {
  test('does not add another inset margin when collapsed', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider defaultOpen={false}>
        <SidebarInset>Content</SidebarInset>
      </SidebarProvider>,
    );

    expect(classTokens(html, 'sidebar-inset')).not.toContain('peer-data-[state=collapsed]:ml-2');
  });
});

describe('SidebarMenuButton icons', () => {
  test('styles only the leading navigation icon', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenuButton>
          <HomeIcon />
          <span>Home</span>
          <ChevronRightIcon />
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    const tokens = classTokens(html, 'sidebar-menu-button');
    expect(tokens).toContain('[&_svg]:size-4');
    expect(tokens).toContain('[&>svg:first-child]:size-4.5');
    expect(tokens).toContain('[&>svg:first-child]:[stroke-width:1.75]');
    expect(tokens).toContain('data-active:[&>svg:first-child]:text-brand-indicator');
    expect(tokens).not.toContain('[&_svg]:size-4.5');
  });
});

describe('SidebarMenuButton active state', () => {
  test('the active item gets a sidebar-primary bar, not only the hover fill', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenuButton isActive>Orders</SidebarMenuButton>
      </SidebarProvider>,
    );
    expect(html).toContain('data-active=""');
    expect(classTokens(html, 'sidebar-menu-button')).toEqual(
      expect.arrayContaining(['before:bg-sidebar-primary', 'data-active:before:opacity-100']),
    );
  });

  test('the outline variant border reads the oklch token directly', () => {
    const tokens = classTokens(
      renderToStaticMarkup(
        <SidebarProvider>
          <SidebarMenuButton variant="outline">Orders</SidebarMenuButton>
        </SidebarProvider>,
      ),
      'sidebar-menu-button',
    );
    // A colour function around the oklch variable made the value invalid.
    expect(tokens.filter((token) => token.includes('shadow-['))).toEqual([
      'shadow-[0_0_0_1px_var(--sidebar-border)]',
      'hover:shadow-[0_0_0_1px_var(--sidebar-accent)]',
    ]);
  });
});

describe('Sidebar rail', () => {
  test('is 232px wide expanded and 60px as an icon rail', () => {
    const html = renderToStaticMarkup(<SidebarProvider>Content</SidebarProvider>);
    expect(html).toContain('--sidebar-width:14.5rem');
    expect(html).toContain('--sidebar-width-icon:3.75rem');
  });

  test('changes width on the drawer curve, and not under reduced motion', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <Sidebar collapsible="icon">Nav</Sidebar>
      </SidebarProvider>,
    );
    for (const slot of ['sidebar-gap', 'sidebar-container']) {
      const tokens = classTokens(html, slot);
      expect(tokens).toEqual(
        expect.arrayContaining([
          'ease-drawer',
          'duration-(--transition-duration-slow)',
          'motion-reduce:transition-none',
        ]),
      );
      expect(tokens).not.toContain('ease-linear');
    }
  });

  test('labels fade in place when collapsed instead of the button shrinking', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider defaultOpen={false}>
        <SidebarGroupLabel>Shop</SidebarGroupLabel>
        <SidebarMenuButton>
          <HomeIcon />
          <span>Home</span>
        </SidebarMenuButton>
      </SidebarProvider>,
    );
    const button = classTokens(html, 'sidebar-menu-button');
    expect(button).toContain('group-data-[collapsible=icon]:[&>span:last-child]:opacity-0');
    expect(button).not.toContain('group-data-[collapsible=icon]:size-8!');
    const label = classTokens(html, 'sidebar-group-label');
    expect(label).toContain('group-data-[collapsible=icon]:opacity-0');
    expect(label).not.toContain('group-data-[collapsible=icon]:-mt-8');
  });
});

describe('SidebarMenu sliding indicator', () => {
  function menu(slidingIndicator?: boolean) {
    return renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenu slidingIndicator={slidingIndicator}>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>Orders</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarProvider>,
    );
  }

  test('is off by default', () => {
    const html = menu();
    expect(html).not.toContain('data-slot="sidebar-menu-indicator"');
    expect(html).not.toContain('data-active-indicator');
  });

  test('renders one hidden pill and lets it replace the item fill and bar', () => {
    const html = menu(true);
    expect(html).toContain('data-active-indicator="pill"');
    expect(html.match(/data-slot="sidebar-menu-indicator"/g)).toHaveLength(1);
    const indicator = html.match(/<li[^>]*data-slot="sidebar-menu-indicator"[^>]*>/)?.[0] ?? '';
    expect(indicator).toContain('aria-hidden="true"');
    expect(classTokens(html, 'sidebar-menu-indicator')).toEqual(
      expect.arrayContaining(['data-ready:ease-drawer', 'motion-reduce:data-ready:transition-opacity']),
    );
    expect(classTokens(html, 'sidebar-menu-button')).toEqual(
      expect.arrayContaining([
        'in-data-[active-indicator=pill]:before:hidden',
        'in-data-[active-indicator=pill]:data-active:bg-transparent!',
      ]),
    );
  });
});
