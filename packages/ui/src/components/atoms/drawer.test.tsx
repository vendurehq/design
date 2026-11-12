import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Button } from './button.tsx';
import { Drawer, DrawerClose, DrawerTrigger } from './drawer.tsx';
import { slotTag } from '../../test/slot-tokens.ts';

// The Drawer runs on Base UI, like every other atom: parts take the render prop (vaul used Radix),
// and state shows as Base UI attributes (aria-expanded, data-popup-open), never Radix data-state.
// The popup renders in a portal, which server rendering skips, so these tests read the trigger.
// defaultTriggerId makes the server render mark the trigger that opened the drawer.

function render(open: boolean) {
  return renderToStaticMarkup(
    <Drawer defaultOpen={open} defaultTriggerId="filters">
      <DrawerTrigger id="filters" render={<Button variant="outline" />}>
        Open filters
      </DrawerTrigger>
      <DrawerClose render={<Button variant="ghost" />}>Close filters</DrawerClose>
    </Drawer>,
  );
}

describe('Drawer', () => {
  test('DrawerTrigger renders through the render prop as a single Button', () => {
    const html = render(false);
    const trigger = slotTag(html, 'button');
    expect(trigger.startsWith('<button')).toBe(true);
    // The Button keeps its own slot; the trigger is marked with data-drawer-trigger.
    expect(trigger).toContain('data-drawer-trigger=""');
    // Button's outline variant classes reach the trigger element.
    expect(trigger).toContain('border-border');
    expect(trigger).toContain('bg-card');
    expect(trigger).not.toContain('render=');
    expect(html.match(/<button/g)?.length).toBe(2);
  });

  test('DrawerClose renders through the render prop', () => {
    const close = slotTag(render(false), 'drawer-close');
    expect(close.startsWith('<button')).toBe(true);
    expect(close).toContain('hover:bg-muted');
    expect(close).not.toContain('render=');
  });

  test('closed state: the trigger has no data-popup-open', () => {
    const trigger = slotTag(render(false), 'button');
    expect(trigger).not.toContain('data-popup-open');
    expect(trigger).not.toContain('data-state');
  });

  test('open state: the trigger has a valueless data-popup-open', () => {
    const trigger = slotTag(render(true), 'button');
    expect(trigger).toContain('data-popup-open=""');
    expect(trigger).not.toContain('data-state');
  });
});
