import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu.tsx';
import { slotTokens } from '../../test/slot-tokens.ts';

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
    const link = slotTokens(html, 'navigation-menu-link');
    expect(link).toEqual(
      expect.arrayContaining(['data-active:text-foreground', 'data-active:font-medium', 'data-active:after:opacity-100']),
    );
    expect(link.filter((token) => token.startsWith('data-[active=true]'))).toEqual([]);
  });

  test('links and triggers show a full-strength focus ring, not a suppressed outline', () => {
    for (const slot of ['navigation-menu-link', 'navigation-menu-trigger']) {
      const tokens = slotTokens(html, slot);
      expect(tokens).toEqual(
        expect.arrayContaining(['focus-visible:outline-solid', 'focus-visible:outline-2', 'focus-visible:outline-ring']),
      );
      expect(tokens).not.toContain('focus-visible:outline-1');
    }
  });

  test('the trigger is transparent, so it does not show as a patch on cards', () => {
    const trigger = slotTokens(html, 'navigation-menu-trigger');
    expect(trigger).toContain('bg-transparent');
    expect(trigger).not.toContain('bg-background');
  });

  test('the list carries no aria-orientation (not allowed on a list)', () => {
    const list = html.match(/<ul[^>]*>/)?.[0] ?? '';
    expect(list).toContain('data-slot="navigation-menu-list"');
    expect(list).not.toContain('aria-orientation');
  });
});
