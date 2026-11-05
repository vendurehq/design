import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Kbd } from './kbd.tsx';
import {
  Command,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandItemDetail,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command.tsx';

// cmdk 1.1.1 writes data-selected="true" or data-selected="false" on every item. A bare
// data-selected: variant compiles to [data-selected] and matches both, so every item looked
// highlighted. The highlight must key on the "true" value.

/** Class tokens of the first element that carries the given data-slot, entity-decoded. */
function classTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
  return (tag.match(/class="([^"]*)"/)?.[1] ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .split(/\s+/)
    .filter(Boolean);
}

function render() {
  return renderToStaticMarkup(
    <Command>
      <CommandList>
        <CommandItem value="orders">
          Orders
          <CommandShortcut>⌘O</CommandShortcut>
        </CommandItem>
      </CommandList>
    </Command>,
  );
}

describe('CommandItem highlight', () => {
  test('cmdk renders an unselected item with data-selected="false"', () => {
    expect(render()).toContain('data-selected="false"');
  });

  test('the highlight only applies to data-selected="true"', () => {
    const item = classTokens(render(), 'command-item');
    expect(item).toEqual(
      expect.arrayContaining(['data-[selected=true]:bg-accent', 'data-[selected=true]:text-accent-foreground']),
    );
    expect(item.filter((token) => token.startsWith('data-selected:'))).toEqual([]);
  });

  test('the shortcut only brightens on the highlighted item', () => {
    const shortcut = classTokens(render(), 'command-shortcut');
    expect(shortcut).toContain('group-data-[selected=true]/command-item:text-foreground');
    expect(shortcut).not.toContain('group-data-selected/command-item:text-foreground');
  });
});

// A listbox allows only option and group children (axe aria-required-children).
describe('CommandSeparator', () => {
  test('is not a separator role inside the listbox', () => {
    const html = renderToStaticMarkup(
      <Command>
        <CommandList>
          <CommandGroup heading="Orders">
            <CommandItem>Open orders</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    const separator = html.match(/<[^>]*data-slot="command-separator"[^>]*>/)?.[0] ?? '';
    expect(separator).toContain('role="none"');
    expect(html).not.toContain('role="separator"');
  });
});

describe('CommandInput', () => {
  test('keeps its wrapper and input-group slots, unboxed', () => {
    const html = renderToStaticMarkup(
      <Command>
        <CommandInput placeholder="Search" />
      </Command>,
    );
    expect(html).toContain('data-slot="command-input-wrapper"');
    expect(html).toContain('data-slot="input-group"');
    expect(html).toContain('data-slot="input-group-addon"');
    expect(classTokens(html, 'command-input-wrapper')).toContain('border-b');
    expect(classTokens(html, 'input-group')).toEqual(
      expect.arrayContaining(['border-0!', 'bg-transparent!', 'ring-0!', 'in-data-[slot=dialog-content]:h-13.5!']),
    );
  });
});

describe('CommandList', () => {
  test('eases to the height cmdk measures, and not under reduced motion', () => {
    const list = classTokens(render(), 'command-list');
    expect(list).toEqual(
      expect.arrayContaining([
        'h-(--cmdk-list-height)',
        'transition-[height]',
        'ease-drawer',
        'motion-reduce:transition-none',
      ]),
    );
  });

  test('has no sliding highlight by default', () => {
    const html = render();
    expect(html).not.toContain('data-slot="command-highlight"');
    expect(html).not.toContain('data-highlight=');
  });

  test('slidingHighlight renders one hidden highlight that replaces the item fill', () => {
    const html = renderToStaticMarkup(
      <Command>
        <CommandList slidingHighlight>
          <CommandItem value="orders">Orders</CommandItem>
          <CommandItem value="customers">Customers</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(html).toContain('data-highlight="slide"');
    expect(html.match(/data-slot="command-highlight"/g)).toHaveLength(1);
    const highlight = html.match(/<div[^>]*data-slot="command-highlight"[^>]*>/)?.[0] ?? '';
    expect(highlight).toContain('aria-hidden="true"');
    expect(highlight).toContain('role="none"');
    expect(classTokens(html, 'command-highlight')).toEqual(
      expect.arrayContaining(['data-instant:transition-none!', 'motion-reduce:data-ready:transition-opacity']),
    );
    expect(classTokens(html, 'command-item')).toContain('in-data-[highlight=slide]:data-[selected=true]:bg-transparent!');
  });
});

describe('CommandFooter', () => {
  test('renders key hints with Kbd', () => {
    const html = renderToStaticMarkup(
      <CommandFooter>
        <span>
          <Kbd>Esc</Kbd> Close
        </span>
      </CommandFooter>,
    );
    expect(html).toContain('data-slot="command-footer"');
    expect(html).toContain('data-slot="kbd"');
    expect(classTokens(html, 'command-footer')).toContain('border-t');
  });
});

describe('CommandItemDetail', () => {
  const html = renderToStaticMarkup(
    <Command>
      <CommandList>
        <CommandItem value="database">
          Database
          <CommandItemDetail>Production · Acme</CommandItemDetail>
        </CommandItem>
      </CommandList>
    </Command>,
  );

  test('shows on the highlighted item only', () => {
    expect(classTokens(html, 'command-item-detail')).toEqual(
      expect.arrayContaining([
        'opacity-0',
        'group-data-[selected=true]/command-item:opacity-100',
        'group-data-[selected=true]/command-item:delay-40',
        'motion-reduce:translate-x-0',
        'motion-reduce:blur-none',
      ]),
    );
  });

  test('takes the place of the check mark', () => {
    expect(html).toContain('group-has-data-[slot=command-item-detail]/command-item:hidden');
  });
});
