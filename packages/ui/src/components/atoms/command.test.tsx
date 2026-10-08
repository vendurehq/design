import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Command, CommandGroup, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './command.tsx';

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
