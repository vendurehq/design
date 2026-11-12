import { describe, expect, test } from 'bun:test';
import type * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AlertDialog, AlertDialogTrigger } from '../components/atoms/alert-dialog.tsx';
import { Button } from '../components/atoms/button.tsx';
import { Collapsible, CollapsibleTrigger } from '../components/atoms/collapsible.tsx';
import { ContextMenu, ContextMenuTrigger } from '../components/atoms/context-menu.tsx';
import { Dialog, DialogTrigger } from '../components/atoms/dialog.tsx';
import { Drawer, DrawerTrigger } from '../components/atoms/drawer.tsx';
import { DropdownMenu, DropdownMenuTrigger } from '../components/atoms/dropdown-menu.tsx';
import { HoverCard, HoverCardTrigger } from '../components/atoms/hover-card.tsx';
import { Popover, PopoverTrigger } from '../components/atoms/popover.tsx';
import { Sheet, SheetTrigger } from '../components/atoms/sheet.tsx';
import { Tooltip, TooltipTrigger } from '../components/atoms/tooltip.tsx';

type Trigger = (props: {
  render?: React.ReactElement;
  children?: React.ReactNode;
}) => React.ReactElement;

const triggers: [string, Trigger][] = [
  [
    'tooltip-trigger',
    (p) => (
      <Tooltip>
        <TooltipTrigger {...p} />
      </Tooltip>
    ),
  ],
  [
    'popover-trigger',
    (p) => (
      <Popover>
        <PopoverTrigger {...p} />
      </Popover>
    ),
  ],
  [
    'hover-card-trigger',
    (p) => (
      <HoverCard>
        <HoverCardTrigger {...p} />
      </HoverCard>
    ),
  ],
  [
    'dropdown-menu-trigger',
    (p) => (
      <DropdownMenu>
        <DropdownMenuTrigger {...p} />
      </DropdownMenu>
    ),
  ],
  [
    'dialog-trigger',
    (p) => (
      <Dialog>
        <DialogTrigger {...p} />
      </Dialog>
    ),
  ],
  [
    'alert-dialog-trigger',
    (p) => (
      <AlertDialog>
        <AlertDialogTrigger {...p} />
      </AlertDialog>
    ),
  ],
  [
    'sheet-trigger',
    (p) => (
      <Sheet>
        <SheetTrigger {...p} />
      </Sheet>
    ),
  ],
  [
    'drawer-trigger',
    (p) => (
      <Drawer>
        <DrawerTrigger {...p} />
      </Drawer>
    ),
  ],
  [
    'collapsible-trigger',
    (p) => (
      <Collapsible>
        <CollapsibleTrigger {...p} />
      </Collapsible>
    ),
  ],
  [
    'context-menu-trigger',
    (p) => (
      <ContextMenu>
        <ContextMenuTrigger {...p} />
      </ContextMenu>
    ),
  ],
];

// The opening tag of the trigger: the element whose text is "Open".
const firstTag = (element: React.ReactElement) =>
  renderToStaticMarkup(element).match(/<[a-z][^>]*>(?=Open)/)?.[0] ?? '';

describe.each(triggers)('%s', (slot, Trigger) => {
  test('a Button passed as render keeps its own slot, and the trigger stays findable', () => {
    const tag = firstTag(<Trigger render={<Button />}>Open</Trigger>);
    expect(tag).toContain('data-slot="button"');
    expect(tag).toContain(`data-${slot}=""`);
  });

  test('without render, or with an HTML element, the trigger slot stays', () => {
    for (const tag of [
      firstTag(<Trigger>Open</Trigger>),
      firstTag(<Trigger render={<span />}>Open</Trigger>),
    ]) {
      expect(tag).toContain(`data-slot="${slot}"`);
      expect(tag).toContain(`data-${slot}=""`);
    }
  });

  test('a data-slot on the render element wins', () => {
    expect(firstTag(<Trigger render={<span data-slot="own" />}>Open</Trigger>)).toContain(
      'data-slot="own"',
    );
  });
});
