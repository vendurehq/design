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
  CommandItemLabel,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command.tsx';
import { slotTokens } from '../../test/slot-tokens.ts';

// cmdk 1.1.1 writes data-selected="true" or data-selected="false" on every item. A bare
// data-selected: variant compiles to [data-selected] and matches both, so every item looked
// highlighted. The highlight must key on the "true" value.

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
    const item = slotTokens(render(), 'command-item');
    expect(item).toEqual(
      expect.arrayContaining([
        'data-[selected=true]:bg-muted',
        'not-in-data-command-palette:data-[selected=true]:text-accent-foreground',
      ]),
    );
    expect(item.filter((token) => token.includes('data-selected:'))).toEqual([]);
  });

  test('the highlight is a Highlight outline in forced colors', () => {
    const item = slotTokens(render(), 'command-item');
    expect(item).toEqual(
      expect.arrayContaining([
        'not-in-data-[highlight=slide]:data-[selected=true]:forced-colors:outline-solid',
        'not-in-data-[highlight=slide]:data-[selected=true]:forced-colors:outline-[Highlight]',
      ]),
    );
    // outline-hidden keeps a transparent outline in forced colors: every row would be outlined.
    expect(item).not.toContain('outline-hidden');
  });

  test('palette styles key on the palette, not on any dialog', () => {
    const html = render();
    expect(html).not.toContain('in-data-[slot=dialog-content]');
    const item = slotTokens(html, 'command-item');
    expect(item).toContain('in-data-command-palette:data-[selected=true]:text-foreground');
    expect(item.filter((token) => token.endsWith('!') && token.includes(':text-'))).toEqual([]);
  });

  test('palette items are quiet at rest and turn foreground with a brand icon on the highlight', () => {
    const item = slotTokens(render(), 'command-item');
    expect(item).toEqual(
      expect.arrayContaining([
        'in-data-command-palette:text-foreground-secondary',
        'in-data-command-palette:data-[selected=true]:text-foreground',
        "in-data-command-palette:data-[selected=true]:[&>svg:not([class*='opacity-'])]:text-brand-indicator",
      ]),
    );
  });

  test('only the label is medium weight in the palette', () => {
    const html = renderToStaticMarkup(
      <Command>
        <CommandList>
          <CommandItem value="orders">
            <CommandItemLabel>Orders</CommandItemLabel>
            <CommandItemDetail>Sales</CommandItemDetail>
          </CommandItem>
        </CommandList>
      </Command>,
    );
    expect(slotTokens(html, 'command-item-label')).toContain('in-data-command-palette:font-medium');
    expect(slotTokens(html, 'command-item').filter((token) => token.includes('font-'))).toEqual([]);
  });

  test('the shortcut only brightens on the highlighted item', () => {
    const shortcut = slotTokens(render(), 'command-shortcut');
    expect(shortcut).toContain('group-data-[selected=true]/command-item:text-foreground');
    expect(shortcut).not.toContain('group-data-selected/command-item:text-foreground');
  });
});

// A checked item draws the MenuCheck of every menu and list. The check's span
// carries data-checked only for a checked item: cmdk writes data-selected on every
// item, so the check must not key on the item's own attributes.
describe('CommandItem check', () => {
  function item(checked?: boolean | string) {
    return renderToStaticMarkup(
      <Command>
        <CommandList>
          <CommandItem value="orders" data-checked={checked}>
            Orders
          </CommandItem>
        </CommandList>
      </Command>,
    );
  }

  test('draws MenuCheck, not the lucide check', () => {
    const html = item(true);
    expect(html).toContain('data-slot="menu-check"');
    expect(html).not.toContain('lucide-check');
  });

  test('the check shows only for a checked item', () => {
    expect(item(true)).toMatch(/data-slot="command-item-check" data-checked=""/);
    expect(item('true')).toMatch(/data-slot="command-item-check" data-checked=""/);
    expect(item()).not.toMatch(/data-slot="command-item-check" data-checked/);
    expect(item(false)).not.toMatch(/data-slot="command-item-check" data-checked/);
  });

  test('the check hides when the item has a shortcut or a detail', () => {
    const check = slotTokens(item(true), 'command-item-check');
    expect(check).toEqual(
      expect.arrayContaining([
        'group/menu-check',
        'group-has-data-[slot=command-shortcut]/command-item:hidden',
        'group-has-data-[slot=command-item-detail]/command-item:hidden',
      ]),
    );
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
    expect(slotTokens(html, 'command-input-wrapper')).toContain('border-b');
    expect(slotTokens(html, 'input-group')).toEqual(
      expect.arrayContaining(['border-0!', 'bg-transparent!', 'ring-0!', 'in-data-command-palette:h-13.5!']),
    );
  });
});

describe('CommandInput end slot', () => {
  test('renders nothing at the end without `end`', () => {
    const html = renderToStaticMarkup(
      <Command>
        <CommandInput placeholder="Search" />
      </Command>,
    );
    expect(html).not.toContain('data-align="inline-end"');
  });

  test('renders `end` in an end addon after the input', () => {
    const html = renderToStaticMarkup(
      <Command>
        <CommandInput placeholder="Search" end={<Kbd>Esc</Kbd>} />
      </Command>,
    );
    const end = html.indexOf('data-align="inline-end"');
    expect(end).toBeGreaterThan(html.indexOf('data-slot="command-input"'));
    expect(html.slice(end)).toContain('data-slot="kbd"');
    expect(html.slice(end)).toContain('Esc');
  });

  test('does not pass `end` to the input element', () => {
    const html = renderToStaticMarkup(
      <Command>
        <CommandInput placeholder="Search" end={<Kbd>Esc</Kbd>} />
      </Command>,
    );
    expect(html).not.toContain(' end=');
  });
});

describe('CommandList', () => {
  test('eases to the height cmdk measures, and not under reduced motion', () => {
    const list = slotTokens(render(), 'command-list');
    expect(list).toEqual(
      expect.arrayContaining([
        'h-(--cmdk-list-height)',
        'transition-[height]',
        'ease-height',
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
    expect(slotTokens(html, 'command-highlight')).toEqual(
      expect.arrayContaining([
        'data-ready:transition-opacity',
        'will-change-transform',
        'bg-muted',
        'forced-colors:outline-[Highlight]',
      ]),
    );
    // The follower moves it from script, not through a CSS transition.
    expect(slotTokens(html, 'command-highlight').some((token) => token.includes('transition-[transform'))).toBe(false);
    expect(slotTokens(html, 'command-item')).toContain('in-data-[highlight=slide]:data-[selected=true]:bg-transparent!');
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
    expect(slotTokens(html, 'command-footer')).toContain('border-t');
  });
});

describe('CommandFooter end slot', () => {
  test('renders `end` after the hints, pushed to the right', () => {
    const html = renderToStaticMarkup(
      <CommandFooter end={<span>Toggle</span>}>
        <span>Close</span>
      </CommandFooter>,
    );
    expect(html.indexOf('Toggle')).toBeGreaterThan(html.indexOf('Close'));
    expect(slotTokens(html, 'command-footer-end')).toContain('ms-auto');
  });

  test('renders no end element without `end`', () => {
    const html = renderToStaticMarkup(
      <CommandFooter>
        <span>Close</span>
      </CommandFooter>,
    );
    expect(html).not.toContain('command-footer-end');
  });
});

describe('palette results', () => {
  test('have no copy of the old results and no enter transition', () => {
    const html = render();
    expect(html).not.toContain('command-results-ghost');
    expect(slotTokens(html, 'command-list').some((token) => token.includes('results-ready'))).toBe(false);
  });

  test('the palette list takes its content height at once', () => {
    expect(slotTokens(render(), 'command-list')).toEqual(
      expect.arrayContaining(['in-data-command-palette:h-auto', 'in-data-command-palette:transition-none']),
    );
  });

  test('palette rows change tint with the selection, without a transition', () => {
    const item = slotTokens(render(), 'command-item');
    expect(item.some((token) => token.startsWith('in-data-command-palette:transition-['))).toBe(false);
    expect(item).toContain("in-data-command-palette:[&>svg:not([class*='opacity-'])]:transition-none!");
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

  test('shows on every row, with no reveal on selection or hover', () => {
    const detail = slotTokens(html, 'command-item-detail');
    expect(detail.some((token) => /opacity|transition|delay|blur|translate|selected|hover/.test(token))).toBe(false);
  });

  test('truncates before the label does', () => {
    expect(slotTokens(html, 'command-item-detail')).toEqual(
      expect.arrayContaining(['truncate', 'min-w-0', 'max-w-[45%]']),
    );
    expect(slotTokens(html, 'command-item-detail')).not.toContain('shrink-0');
  });

  test('takes the place of the check mark', () => {
    expect(html).toContain('group-has-data-[slot=command-item-detail]/command-item:hidden');
  });
});
