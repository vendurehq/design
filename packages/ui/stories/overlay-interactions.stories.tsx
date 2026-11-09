import type { Meta, StoryObj } from '@storybook/react';
import { LogOutIcon, SettingsIcon } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../src/components/atoms/alert-dialog.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '../src/components/atoms/combobox.tsx';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../src/components/atoms/context-menu.tsx';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../src/components/atoms/hover-card.tsx';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../src/components/atoms/navigation-menu.tsx';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '../src/components/atoms/popover.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/atoms/select.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/atoms/tooltip.tsx';

// Mounted tests for the v3 overlay look. Each story opens its overlay and reads
// computed styles in a real browser (CI step "Storybook a11y smoke test"), so a
// change to the radius, the shadow, the item size or the motion fails here.
// Overlays render in a portal on `body`, so queries run against `document.body`.

const meta = {
  title: 'Atoms/Overlays/Interactions',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);

/** The element that carries the given data-slot, once it is in the document. */
async function findSlot(slot: string): Promise<HTMLElement> {
  let element: HTMLElement | null = null;
  await waitFor(() => {
    element = document.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
    expect(element).not.toBeNull();
  });
  return element as unknown as HTMLElement;
}

/**
 * The shared overlay surface: the overlay shadow, no ring, and the entrance
 * transition. Base UI holds transitions off while it positions a menu or a
 * select, so the transition checks wait for the popup to settle.
 */
async function expectOverlaySurface(element: HTMLElement, radius: string) {
  const style = getComputedStyle(element);
  await expect(style.borderTopLeftRadius).toBe(radius);
  await expect(style.boxShadow).not.toBe('none');
  await waitFor(() => {
    expect(style.transitionProperty).toContain('opacity');
    expect(style.transitionProperty).toContain('scale');
    // The strong ease-out token.
    expect(style.transitionTimingFunction).toContain('cubic-bezier(0.19, 1, 0.22, 1)');
  });
}

export const TooltipLook: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline" />}>Copy</TooltipTrigger>
        <TooltipContent>Copy the order code</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async () => {
    const tooltip = await findSlot('tooltip-content');
    const style = getComputedStyle(tooltip);
    await expect(style.borderTopLeftRadius).toBe('6px');
    await expect(style.fontSize).toBe('12px');
    await expect(style.fontWeight).toBe('500');
    // The v3 look metrics: 7px by 10px padding, 17px lines.
    await expect(style.paddingTop).toBe('7px');
    await expect(style.paddingBottom).toBe('7px');
    await expect(style.paddingLeft).toBe('10px');
    await expect(style.lineHeight).toBe('17px');
    // Opens in 125ms on the CSS `ease` curve (ease-soft).
    await expect(style.transitionDuration).toBe('0.125s');
    await expect(style.transitionTimingFunction).toMatch(/^(ease|cubic-bezier\(0\.25, 0\.1, 0\.25, 1\))$/);
    // No arrow element inside the popup.
    await expect(tooltip.children.length).toBe(0);
  },
};

/**
 * The menu motion every popup shares: opacity in 160ms, scale and translate in
 * 200ms, from 2px away from the trigger. Waits for Base UI to turn the
 * transition on after positioning.
 */
async function expectPopupMotion(element: HTMLElement) {
  const style = getComputedStyle(element);
  await waitFor(() => {
    // The NavigationMenu popup also resizes, so it lists width and height after these.
    expect(style.transitionProperty).toMatch(/^opacity, scale, translate(,|$)/);
    expect(style.transitionDuration).toMatch(/^0\.16s, 0\.2s, 0\.2s(,|$)/);
  });
}

export const PopoverLook: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Dimensions</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the size of the label.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Dimensions' }));
    const popover = await findSlot('popover-content');
    await expectOverlaySurface(popover, '8px');
    await expectPopupMotion(popover);
  },
};

export const DropdownMenuLook: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Show archived</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Actions' }));
    const menu = await findSlot('dropdown-menu-content');
    await expectOverlaySurface(menu, '8px');
    await expectPopupMotion(menu);
    await expect(getComputedStyle(menu).paddingTop).toBe('5px');
    // offsetWidth ignores the entrance scale. Short items still get a 240px menu.
    await expect(menu.offsetWidth).toBeGreaterThanOrEqual(240);

    const item = body().getByRole('menuitem', { name: 'Settings' });
    const itemStyle = getComputedStyle(item);
    // offsetHeight ignores the entrance scale.
    await expect(item.offsetHeight).toBe(34);
    await expect(itemStyle.borderTopLeftRadius).toBe('6px');
    await expect(itemStyle.fontSize).toBe('13px');
    const icon = item.querySelector('svg') as SVGElement;
    await expect(getComputedStyle(icon).strokeWidth).toBe('1.75px');
    await expect(getComputedStyle(icon).width).toBe('15px');
    await expect(itemStyle.columnGap).toBe('10px');

    // The destructive item reads in the destructive-text slot.
    const destructive = body().getByRole('menuitem', { name: 'Log out' });
    const probe = document.createElement('span');
    probe.className = 'text-destructive-text';
    destructive.append(probe);
    await expect(getComputedStyle(destructive).color).toBe(getComputedStyle(probe).color);
    // It hovers with a 10% destructive tint, in light and dark.
    probe.className = 'bg-destructive/10';
    await userEvent.hover(destructive);
    await waitFor(() => expect(getComputedStyle(destructive).backgroundColor).toBe(getComputedStyle(probe).backgroundColor));
    probe.remove();
  },
};

export const SelectLook: Story = {
  render: () => (
    <Select
      defaultValue="eur"
      items={[
        { value: 'eur', label: 'Euro' },
        { value: 'usd', label: 'US dollar' },
      ]}
    >
      <SelectTrigger aria-label="Currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectItem value="eur">Euro</SelectItem>
        <SelectItem value="usd">US dollar</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Currency' }));
    const popup = await findSlot('select-content');
    await expectOverlaySurface(popup, '8px');
    await expectPopupMotion(popup);
    const option = await body().findByRole('option', { name: 'US dollar' });
    await expect(option.offsetHeight).toBe(34);
  },
};

/**
 * A Select with a value opens over its trigger when there is room. Near the
 * edge of the viewport Base UI places the list below the trigger instead, and
 * then it fades in like the other popups.
 */
export const SelectFallbackLook: Story = {
  render: () => (
    <Select
      defaultValue="usd"
      items={[
        { value: 'eur', label: 'Euro' },
        { value: 'usd', label: 'US dollar' },
      ]}
    >
      <SelectTrigger aria-label="Currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="eur">Euro</SelectItem>
        <SelectItem value="usd">US dollar</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Currency' }));
    const popup = await findSlot('select-content');
    await waitFor(() => expect(popup.dataset.side).toBe('bottom'));
    await expectPopupMotion(popup);
  },
};

/** With room around the trigger, the list sits over it and opens at once. */
export const SelectAlignedLook: Story = {
  render: () => (
    <div className="pt-60">
      <Select
        defaultValue="usd"
        items={[
          { value: 'eur', label: 'Euro' },
          { value: 'usd', label: 'US dollar' },
        ]}
      >
        <SelectTrigger aria-label="Currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="eur">Euro</SelectItem>
          <SelectItem value="usd">US dollar</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Currency' }));
    const popup = await findSlot('select-content');
    await waitFor(() => expect(popup.dataset.side).toBe('none'));
    await expect(getComputedStyle(popup).transitionProperty).toBe('none');
  },
};

export const ComboboxLook: Story = {
  render: () => (
    <Combobox items={['Austria', 'France', 'Germany']}>
      <ComboboxTrigger aria-label="Country" className="w-64">
        <ComboboxValue placeholder="Select a country" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput aria-label="Search countries" placeholder="Search" showTrigger={false} />
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Country' }));
    const popup = await findSlot('combobox-content');
    await expectOverlaySurface(popup, '8px');
    await expectPopupMotion(popup);
    // The overlay shadow alone, with no ring on top.
    const probe = document.createElement('div');
    probe.className = 'shadow-overlay';
    popup.parentElement?.append(probe);
    await expect(getComputedStyle(popup).boxShadow).toBe(getComputedStyle(probe).boxShadow);
    probe.remove();
    // Items are 34px, as in Select and DropdownMenu.
    const option = await body().findByRole('option', { name: 'France' });
    await expect(option.offsetHeight).toBe(34);
  },
};

export const HoverCardLook: Story = {
  render: () => (
    // Open from the start: a hover waits out the open delay.
    <HoverCard defaultOpen>
      <HoverCardTrigger render={<Button variant="link" />}>Acme Inc.</HoverCardTrigger>
      <HoverCardContent>Customer since 2021 · 48 orders</HoverCardContent>
    </HoverCard>
  ),
  play: async () => {
    const card = await findSlot('hover-card-content');
    await expectOverlaySurface(card, '8px');
    await expectPopupMotion(card);
  },
};

export const ContextMenuLook: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex h-24 w-64 items-center justify-center rounded-lg border border-dashed text-sm">
          Order #1042
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Copy order code</ContextMenuItem>
        <ContextMenuItem>Open customer</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.pointer({ keys: '[MouseRight]', target: within(canvasElement).getByText('Order #1042') });
    const menu = await findSlot('context-menu-content');
    await expectOverlaySurface(menu, '8px');
    await expectPopupMotion(menu);
  },
};

export const NavigationMenuLook: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Catalog</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1 p-2">
              <li>
                <NavigationMenuLink href="#">Products</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Collections</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Catalog' }));
    const content = await findSlot('navigation-menu-content');
    // The popup that holds the content has no slot of its own: it is the
    // nearest ancestor on the overlay shadow.
    let popup = content.parentElement;
    while (popup && !popup.className.includes('shadow-overlay')) popup = popup.parentElement;
    await expect(popup).not.toBeNull();
    await expectOverlaySurface(popup as HTMLElement, '8px');
    await expectPopupMotion(popup as HTMLElement);
    // Close it before the a11y scan: the open menu's focus guards are
    // aria-hidden and tabbable, which axe flags.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('[data-slot="navigation-menu-content"]')).toBeNull());
  },
};

export const AlertDialogLook: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>Discard</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard draft?</AlertDialogTitle>
          <AlertDialogDescription>Your unsaved changes will be lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Discard' }));
    const dialog = await body().findByRole('alertdialog');
    await expectOverlaySurface(dialog, '12px');
    const style = getComputedStyle(dialog);
    await expect(style.paddingTop).toBe('20px');
    await expect(style.maxWidth).toBe('440px');
    await expect(getComputedStyle(within(dialog).getByRole('heading')).fontSize).toBe('16px');
    // The scrim fades with the dialog.
    const scrim = await findSlot('alert-dialog-overlay');
    await expect(getComputedStyle(scrim).transitionProperty).toContain('opacity');
  },
};
