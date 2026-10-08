import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu.tsx';

/** Class tokens of the first element that carries the given data-slot, entity-decoded. */
function classTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
  return (tag.match(/class="([^"]*)"/)?.[1] ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .split(/\s+/)
    .filter(Boolean);
}

const html = renderToStaticMarkup(
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Catalog</NavigationMenuTrigger>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="#" active>
          Orders
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>,
);

describe('NavigationMenu', () => {
  test('the active link matches the valueless data-active Base UI emits', () => {
    expect(html).toContain('data-active=""');
    const link = classTokens(html, 'navigation-menu-link');
    expect(link).toEqual(
      expect.arrayContaining(['data-active:text-foreground', 'data-active:font-medium', 'data-active:after:opacity-100']),
    );
    expect(link.filter((token) => token.startsWith('data-[active=true]'))).toEqual([]);
  });

  test('links and triggers show a full-strength focus ring, not a suppressed outline', () => {
    for (const slot of ['navigation-menu-link', 'navigation-menu-trigger']) {
      const tokens = classTokens(html, slot);
      expect(tokens).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:ring-ring']));
      expect(tokens).not.toContain('focus-visible:outline-1');
    }
  });

  test('the trigger is transparent, so it does not show as a patch on cards', () => {
    const trigger = classTokens(html, 'navigation-menu-trigger');
    expect(trigger).toContain('bg-transparent');
    expect(trigger).not.toContain('bg-background');
  });

  test('the list carries no aria-orientation (not allowed on a list)', () => {
    const list = html.match(/<ul[^>]*>/)?.[0] ?? '';
    expect(list).toContain('data-slot="navigation-menu-list"');
    expect(list).not.toContain('aria-orientation');
  });
});
