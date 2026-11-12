import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../src/components/atoms/alert-dialog.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '../src/components/atoms/combobox.tsx';
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuTrigger } from '../src/components/atoms/context-menu.tsx';
import { DirectionProvider, useDirection } from '../src/components/atoms/direction.tsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../src/components/atoms/dialog.tsx';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '../src/components/atoms/drawer.tsx';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../src/components/atoms/dropdown-menu.tsx';
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarTrigger } from '../src/components/atoms/menubar.tsx';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../src/components/atoms/hover-card.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/atoms/popover.tsx';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../src/components/atoms/sheet.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src/components/atoms/select.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../src/components/atoms/tooltip.tsx';

const meta = {
  title: 'Atoms/Layout/Direction',
  component: DirectionProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function DirectionDisplay() {
  const direction = useDirection();
  return (
    <div className="rounded-md border p-4">
      <p className="text-sm">
        Current direction: <strong>{direction}</strong>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        This content is rendered inside a DirectionProvider with RTL direction.
        Text alignment and layout should follow right-to-left conventions.
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="space-y-4">
        <h3 className="text-lg font-semibold">RTL Content</h3>
        <DirectionDisplay />
        <div className="flex gap-2">
          <div className="rounded-md border p-3 flex-1">
            <p className="text-sm font-medium">First Item</p>
            <p className="text-xs text-muted-foreground">Should appear on the right</p>
          </div>
          <div className="rounded-md border p-3 flex-1">
            <p className="text-sm font-medium">Second Item</p>
            <p className="text-xs text-muted-foreground">Should appear on the left</p>
          </div>
        </div>
      </div>
    </DirectionProvider>
  ),
};

const fruits = ['Apple', 'Banana', 'Blueberry'];

/**
 * Popups render in a portal at the end of the body, outside the provider's
 * element. They still take the provider's direction: `start` lines a popup up
 * with the trigger's right edge, and the items read right to left. This holds
 * when the document itself is left to right, as on this page.
 */
export const PopupsFollowTheProvider: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="grid grid-cols-2 justify-items-center gap-x-16 gap-y-10 px-72 pb-72">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Menu</DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Select items={fruits.map((fruit) => ({ value: fruit, label: fruit }))}>
          <SelectTrigger aria-label="Fruit" className="w-20">
            <SelectValue placeholder="Fruit" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start" className="min-w-40">
            {fruits.map((fruit) => (
              <SelectItem key={fruit} value={fruit}>
                {fruit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>Popover</PopoverTrigger>
          <PopoverContent align="start">Popover content</PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>Tip</TooltipTrigger>
          <TooltipContent align="start">A tooltip wider than its trigger</TooltipContent>
        </Tooltip>
        <HoverCard>
          <HoverCardTrigger delay={0} className="underline underline-offset-4" href="#">
            Card
          </HoverCardTrigger>
          <HoverCardContent align="start" alignOffset={0}>Hover card content</HoverCardContent>
        </HoverCard>
        <Combobox items={fruits}>
          <ComboboxInput aria-label="Search fruit" placeholder="Fruit" className="w-32" />
          <ComboboxContent>
            <ComboboxList>
              {(fruit: string) => (
                <ComboboxItem key={fruit} value={fruit}>
                  {fruit}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <ContextMenu>
          <ContextMenuTrigger className="rounded-md border border-dashed px-4 py-3 text-sm">Right-click here</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Centre</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(document.documentElement).direction).toBe('ltr');
    const canvas = within(canvasElement);
    const popupOf = (slot: string) =>
      waitFor(() => {
        const popup = document.querySelector<HTMLElement>(`[data-slot="${slot}"][data-open]`);
        expect(popup).not.toBeNull();
        return popup as HTMLElement;
      });
    // The popup reads right to left, and with an edge given, that edge lines
    // up with the trigger's edge on that side.
    const expectRtl = async (popup: HTMLElement, trigger: HTMLElement, edge?: 'left' | 'right') => {
      await expect(getComputedStyle(popup).direction).toBe('rtl');
      if (!edge) return;
      await waitFor(() => {
        const box = popup.getBoundingClientRect();
        expect(box.width).toBeGreaterThan(trigger.getBoundingClientRect().width + 8);
        expect(Math.abs(box[edge] - trigger.getBoundingClientRect()[edge])).toBeLessThan(1);
      });
    };
    const close = async (slot: string) => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(document.querySelector(`[data-slot="${slot}"][data-open]`)).toBeNull());
    };

    const menu = canvas.getByRole('button', { name: 'Menu' });
    await userEvent.click(menu);
    await expectRtl(await popupOf('dropdown-menu-content'), menu, 'right');
    await close('dropdown-menu-content');

    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await userEvent.click(select);
    await expectRtl(await popupOf('select-content'), select, 'right');
    await close('select-content');

    const popover = canvas.getByRole('button', { name: 'Popover' });
    await userEvent.click(popover);
    await expectRtl(await popupOf('popover-content'), popover, 'right');
    await close('popover-content');

    const tip = canvas.getByRole('button', { name: 'Tip' });
    await userEvent.hover(tip);
    await expectRtl(await popupOf('tooltip-content'), tip, 'right');
    await userEvent.unhover(tip);

    const card = canvas.getByText('Card');
    await userEvent.hover(card);
    await expectRtl(await popupOf('hover-card-content'), card, 'right');
    await userEvent.unhover(card);

    const search = canvas.getByRole('combobox', { name: 'Search fruit' });
    await userEvent.click(search);
    await userEvent.keyboard('{ArrowDown}');
    await expectRtl(await popupOf('combobox-content'), search, 'right');
    await close('combobox-content');

    const area = canvas.getByText('Right-click here');
    await userEvent.pointer({ keys: '[MouseRight]', target: area });
    await expectRtl(await popupOf('context-menu-content'), area);
    await close('context-menu-content');

    // Without an align the menu opens toward the centre: this trigger sits in
    // the left half, so the menu lines up with its left edge in either direction.
    const centre = canvas.getByRole('button', { name: 'Centre' });
    await userEvent.click(centre);
    await expectRtl(await popupOf('dropdown-menu-content'), centre, 'left');
    await close('dropdown-menu-content');
  },
};

/**
 * Dialogs, sheets and drawers render in a portal at the end of the body, outside
 * the provider's element. They still take the provider's direction, so their text
 * reads right to left. This holds when the document itself is left to right, as
 * on this page. A sheet and a drawer keep their `side`: it is physical.
 */
export const ModalsFollowTheProvider: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>Dialog description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="outline" />}>Alert dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alert title</AlertDialogTitle>
              <AlertDialogDescription>Alert description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet title</SheetTitle>
              <SheetDescription>Sheet description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Drawer swipeDirection="right">
          <DrawerTrigger render={<Button variant="outline" />}>Drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer title</DrawerTitle>
              <DrawerDescription>Drawer description</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(document.documentElement).direction).toBe('ltr');
    const canvas = within(canvasElement);
    const surfaces = [
      { trigger: 'Dialog', slot: 'dialog-content' },
      { trigger: 'Alert dialog', slot: 'alert-dialog-content' },
      { trigger: 'Sheet', slot: 'sheet-content' },
      { trigger: 'Drawer', slot: 'drawer-popup' },
    ];
    for (const { trigger, slot } of surfaces) {
      await userEvent.click(canvas.getByRole('button', { name: trigger }));
      const surface = await waitFor(() => {
        const found = document.querySelector<HTMLElement>(`[data-slot="${slot}"][data-open]`);
        expect(found).not.toBeNull();
        return found as HTMLElement;
      });
      await expect(getComputedStyle(surface).direction).toBe('rtl');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(document.querySelector(`[data-slot="${slot}"]`)).toBeNull());
    }
  },
};

type Dir = 'ltr' | 'rtl';

/** A checked checkbox item and a checked radio item in each of the three menus. */
function MenuMarks({ dir }: { dir: Dir }) {
  const label = dir === 'rtl' ? 'right to left' : 'left to right';
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir} className="flex items-start gap-6 px-24 pt-6 pb-56">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>{`Dropdown, ${label}`}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>Show grid</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="list">
              <DropdownMenuRadioItem value="list">List view</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ContextMenu>
          <ContextMenuTrigger className="rounded-lg border border-dashed px-4 py-2 text-sm">{`Context, ${label}`}</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem checked>Show grid</ContextMenuCheckboxItem>
            <ContextMenuRadioGroup value="list">
              <ContextMenuRadioItem value="list">List view</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>{`Menubar, ${label}`}</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked>Show grid</MenubarCheckboxItem>
              <MenubarRadioGroup value="list">
                <MenubarRadioItem value="list">List view</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </DirectionProvider>
  );
}

/** The box of an item's own text, without its mark. */
function textBox(item: HTMLElement) {
  const node = [...item.childNodes].reverse().find((child) => child.textContent?.trim() && !(child instanceof HTMLElement && child.classList.contains('absolute')));
  const range = document.createRange();
  range.selectNodeContents(node as Node);
  return range.getBoundingClientRect();
}

/**
 * Checks the mark of each checked item: DropdownMenu and ContextMenu put it at
 * the end of the row, Menubar at the start, in both directions, and the text
 * keeps its start padding.
 */
async function expectMenuMarks(canvasElement: HTMLElement, dir: Dir) {
  const label = dir === 'rtl' ? 'right to left' : 'left to right';
  const canvas = within(canvasElement);
  const menus = [
    { name: `Dropdown, ${label}`, open: (el: HTMLElement) => userEvent.click(el), markAt: 'end', textStart: 8 },
    { name: `Context, ${label}`, open: (el: HTMLElement) => userEvent.pointer({ keys: '[MouseRight]', target: el }), markAt: 'end', textStart: 8 },
    { name: `Menubar, ${label}`, open: (el: HTMLElement) => userEvent.click(el), markAt: 'start', textStart: 32 },
  ] as const;
  for (const menu of menus) {
    await menu.open(canvas.getByText(menu.name));
    const items = await waitFor(() => {
      const found = [...document.querySelectorAll<HTMLElement>('[role=menuitemcheckbox][aria-checked=true],[role=menuitemradio][aria-checked=true]')];
      expect(found).toHaveLength(2);
      return found;
    });
    for (const item of items) {
      const mark = (item.querySelector('span.absolute') as HTMLElement).getBoundingClientRect();
      const text = textBox(item);
      const row = item.getBoundingClientRect();
      const atEnd = menu.markAt === 'end';
      if ((dir === 'rtl') === atEnd) {
        // The mark is left of the text.
        await expect(mark.right).toBeLessThanOrEqual(text.left);
      } else {
        await expect(mark.left).toBeGreaterThanOrEqual(text.right);
      }
      const start = dir === 'rtl' ? row.right - text.right : text.left - row.left;
      // Within the side bearing of the first glyph.
      await expect(Math.abs(start - menu.textStart)).toBeLessThan(2);
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelectorAll('[role=menuitemcheckbox]')).toHaveLength(0));
  }
}

/** Right to left: check and radio marks of the three menus. */
export const MenuMarksRightToLeft: Story = {
  render: () => <MenuMarks dir="rtl" />,
  play: async ({ canvasElement }) => expectMenuMarks(canvasElement, 'rtl'),
};

/** Left to right, the same menus: the look this change keeps. */
export const MenuMarksLeftToRight: Story = {
  render: () => <MenuMarks dir="ltr" />,
  play: async ({ canvasElement }) => expectMenuMarks(canvasElement, 'ltr'),
};
