import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '../src/components/atoms/combobox.tsx';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../src/components/atoms/context-menu.tsx';
import { DirectionProvider, useDirection } from '../src/components/atoms/direction.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../src/components/atoms/dropdown-menu.tsx';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../src/components/atoms/hover-card.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/atoms/popover.tsx';
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
