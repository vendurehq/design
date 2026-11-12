import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarProvider,
} from './sidebar.tsx';
import { slotTokens } from '../../test/slot-tokens.ts';

// Regression pins for the collapsed-geometry and icon-sizing fixes (PRs #52/#53).
// The assertions target class tokens on the specific rendered element rather than
// raw markup substrings; true geometry regressions are covered by the visual
// suite in apps/storybook.

describe('Sidebar geometry', () => {
  test('does not add another inset margin when collapsed', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider defaultOpen={false}>
        <SidebarInset>Content</SidebarInset>
      </SidebarProvider>,
    );

    expect(slotTokens(html, 'sidebar-inset')).not.toContain('peer-data-[state=collapsed]:ml-2');
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

    const tokens = slotTokens(html, 'sidebar-menu-button');
    expect(tokens).toContain('[&_svg]:size-4');
    expect(tokens).toContain('[&>svg:first-child]:[stroke-width:1.75]');
    expect(tokens).toContain('data-active:[&>svg:first-child]:text-brand-indicator');
    expect(tokens.some((token) => token.includes('size-4.5'))).toBe(false);
  });
});

describe('SidebarMenuButton hover fill', () => {
  test('the fill and text ease in the fast duration, like a ListRow', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenuButton>Orders</SidebarMenuButton>
      </SidebarProvider>,
    );
    const tokens = slotTokens(html, 'sidebar-menu-button');
    expect(tokens).toEqual(
      expect.arrayContaining([
        'transition-[width,height,padding,background-color,color]',
        'duration-fast',
        'ease-default',
      ]),
    );
  });
});

describe('SidebarMenuButton weight', () => {
  test('items are medium weight at rest, not only when active', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenuButton>Orders</SidebarMenuButton>
      </SidebarProvider>,
    );
    const tokens = slotTokens(html, 'sidebar-menu-button');
    expect(tokens).toContain('font-medium');
    expect(tokens).not.toContain('data-active:font-medium');
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
    expect(slotTokens(html, 'sidebar-menu-button')).toEqual(
      expect.arrayContaining(['before:bg-sidebar-primary', 'data-active:before:opacity-100']),
    );
  });

  test('the outline variant border reads the oklch token directly', () => {
    const tokens = slotTokens(
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

  test('an active sub-item has no bar: the guide line of the sub-list is next to it', () => {
    const tokens = slotTokens(
      renderToStaticMarkup(
        <SidebarProvider>
          <SidebarMenuSubButton isActive>Products</SidebarMenuSubButton>
        </SidebarProvider>,
      ),
      'sidebar-menu-sub-button',
    );
    expect(tokens.filter((token) => token.includes('before:'))).toEqual([]);
    expect(tokens).toEqual(expect.arrayContaining(['data-active:bg-sidebar-accent']));
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
      const tokens = slotTokens(html, slot);
      expect(tokens).toEqual(
        expect.arrayContaining([
          'ease-drawer',
          'duration-slow',
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
    const button = slotTokens(html, 'sidebar-menu-button');
    expect(button).toContain('group-data-[collapsible=icon]:[&>span]:opacity-0');
    expect(button).not.toContain('group-data-[collapsible=icon]:size-8!');
    const label = slotTokens(html, 'sidebar-group-label');
    expect(label).toContain('group-data-[collapsible=icon]:opacity-0');
    expect(label).not.toContain('group-data-[collapsible=icon]:-mt-8');
  });

  test('a group label closes its height on the height curve', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarGroupLabel>Shop</SidebarGroupLabel>
      </SidebarProvider>,
    );
    const label = slotTokens(html, 'sidebar-group-label');
    expect(label).toEqual(expect.arrayContaining(['transition-[height,opacity]', 'ease-height']));
    expect(label).not.toContain('ease-drawer');
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

  test('is off with slidingIndicator={false}: the item keeps its fill and bar', () => {
    const html = menu(false);
    expect(html).not.toContain('data-slot="sidebar-menu-indicator"');
    expect(html).not.toContain('data-active-indicator');
  });

  test('is on by default: one hidden pill replaces the item fill and bar', () => {
    const html = menu();
    expect(html).toContain('data-active-indicator="pill"');
    expect(html.match(/data-slot="sidebar-menu-indicator"/g)).toHaveLength(1);
    const indicator = html.match(/<li[^>]*data-slot="sidebar-menu-indicator"[^>]*>/)?.[0] ?? '';
    expect(indicator).toContain('aria-hidden="true"');
    expect(slotTokens(html, 'sidebar-menu-indicator')).toEqual(
      expect.arrayContaining(['shadow-control', 'motion-reduce:data-ready:transition-opacity']),
    );
    expect(slotTokens(html, 'sidebar-menu-button')).toEqual(
      expect.arrayContaining([
        'in-data-[active-indicator=pill]:before:hidden',
        'in-data-[active-indicator=pill]:data-active:bg-transparent!',
      ]),
    );
  });
});

describe('Sidebar spacing and labels, the v3 look', () => {
  const html = renderToStaticMarkup(
    <SidebarProvider>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          <SidebarMenu slidingIndicator>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>Source</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarProvider>,
  );

  test('items and the group sit 10px in, so the icon stays 20px from the edge', () => {
    expect(slotTokens(html, 'sidebar-menu-button')).toContain('px-2.5');
    expect(slotTokens(html, 'sidebar-menu-button')).not.toContain('px-3');
    expect(slotTokens(html, 'sidebar-group')).toEqual(expect.arrayContaining(['px-2.5', 'py-2']));
  });

  test('a group label is 12px medium muted text, 20px below the group above and 4px above its items', () => {
    const label = slotTokens(html, 'sidebar-group-label');
    expect(label).toEqual(
      expect.arrayContaining(['text-muted-foreground', 'text-xs', 'font-medium', 'h-5.5', 'leading-4.5', 'items-start', 'px-2.5']),
    );
    expect(label).not.toContain('text-sidebar-foreground/70');
    expect(slotTokens(html, 'sidebar-content')).toContain('gap-1');
  });

  test('the pill slides in 280ms on the drawer curve and fades in 150ms', () => {
    expect(slotTokens(html, 'sidebar-menu-indicator')).toContain(
      'data-ready:[transition:transform_var(--transition-duration-sidebar-pill)_var(--ease-drawer),height_var(--transition-duration-sidebar-pill)_var(--ease-drawer),opacity_var(--transition-duration-moderate)_var(--ease-soft)]',
    );
  });
});

describe('One active icon', () => {
  test('a group with an active nested item lights its icon unless that item shows its own', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenuButton hasActiveChild>
          <HomeIcon />
          <span>Home</span>
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    const tokens = slotTokens(html, 'sidebar-menu-button');
    const hasOwnIcon =
      'not-group-has-[[data-slot=sidebar-menu-sub-button][data-active]>svg:first-child]/menu-item:[&>svg:first-child]:text-brand-indicator';
    expect(tokens).toContain(`data-has-active-child:${hasOwnIcon}`);
    // The unconditional form would light both icons.
    expect(tokens).not.toContain('data-has-active-child:[&>svg:first-child]:text-brand-indicator');
  });

  test('the icon rail lights the group icon, since its nested items are hidden', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenuButton hasActiveChild>Home</SidebarMenuButton>
      </SidebarProvider>,
    );

    const tokens = slotTokens(html, 'sidebar-menu-button');
    expect(tokens).toContain(
      'group-data-[collapsible=icon]:data-has-active-child:[&>svg:first-child]:text-brand-indicator',
    );
  });

  test('an active nested item lights its own icon', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenuSubButton isActive>Products</SidebarMenuSubButton>
      </SidebarProvider>,
    );

    expect(slotTokens(html, 'sidebar-menu-sub-button')).toContain(
      'data-active:[&>svg]:text-brand-indicator',
    );
  });
});
