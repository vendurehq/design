import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { type ReactNode, useState } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandItemDetail,
  CommandItemLabel,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '../src/components/atoms/command.tsx';
import { Kbd, KbdGroup } from '../src/components/atoms/kbd.tsx';
import { checkCheckMark } from './menu-checked-row.ts';
import {
  BarChart3,
  Calculator,
  Calendar,
  CreditCard,
  Globe,
  Map as MapIcon,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Smile,
  Truck,
  User,
  Users,
  Wallet,
} from 'lucide-react';

const meta = {
  title: 'Atoms/Menus/Command',
  component: Command,
  tags: ['autodocs'],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Command className="max-w-md rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar />
            Calendar
          </CommandItem>
          <CommandItem>
            <Smile />
            Search Emoji
          </CommandItem>
          <CommandItem>
            <Calculator />
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            Profile
            <CommandShortcut>Ctrl+P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard />
            Billing
            <CommandShortcut>Ctrl+B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings />
            Settings
            <CommandShortcut>Ctrl+S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Only the highlighted item (the first one until you move with the arrow keys)
 * gets the accent fill. Pinned to the light page theme.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <Command className="rounded-lg border" label={`Commands, ${theme}`}>
          <CommandList>
            <CommandGroup heading="Orders">
              <CommandItem>
                <Calendar />
                Open orders
                <CommandShortcut>Ctrl+O</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <User />
                Customers
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <Settings />
                Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </LightAndDark>
  ),
};

const themes = ['Light', 'Dark', 'System'];

/**
 * A checked item (`data-checked`) draws the check of every menu and list: the
 * 14px MenuCheck at 0.9 opacity, which draws in when the item becomes checked.
 * Pick another theme to see it move. The check hides on an item with a
 * shortcut or a detail.
 */
function CheckedItemDemo() {
  const [theme, setTheme] = useState('System');
  return (
    <Command className="max-w-xs rounded-lg border" label="Theme">
      <CommandList>
        <CommandGroup heading="Theme">
          {themes.map((name) => (
            <CommandItem key={name} value={name} data-checked={theme === name} onSelect={() => setTheme(name)}>
              {name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export const CheckedItem: Story = {
  render: () => <CheckedItemDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('.lucide-check')).toBeNull();
    await checkCheckMark(canvas.getByRole('option', { name: 'System' }), canvas.getByRole('option', { name: 'Light' }));
  },
};

const pages = [
  { label: 'Orders', icon: ShoppingCart, detail: 'Sales · Default channel' },
  { label: 'Products', icon: Package, detail: 'Catalog · Default channel' },
  { label: 'Customers', icon: Users, detail: 'Customers · Default channel' },
  {
    label: 'Analytics',
    icon: BarChart3,
    detail: 'Insights · Sales, conversion and traffic reports for every channel and currency',
  },
];
const account = [
  { label: 'Profile', icon: User },
  { label: 'Billing', icon: CreditCard },
  { label: 'Settings', icon: Settings },
];
const settings = [
  { label: 'Channels', icon: Globe },
  { label: 'Zones', icon: MapIcon },
  { label: 'Tax rates', icon: Percent },
  { label: 'Payment methods', icon: Wallet },
  { label: 'Shipping methods', icon: Truck },
];

/** The palette body: grouped results with a sliding highlight, then the key hints. */
function PaletteBody() {
  return (
    <Command>
      <CommandInput placeholder="Search pages and settings..." end={<Kbd aria-hidden="true">Esc</Kbd>} />
      <CommandList slidingHighlight>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map(({ label, icon: Icon, detail }) => (
            <CommandItem key={label} value={label}>
              <Icon />
              <CommandItemLabel>{label}</CommandItemLabel>
              <CommandItemDetail>{detail}</CommandItemDetail>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Account">
          {account.map(({ label, icon: Icon }) => (
            <CommandItem key={label}>
              <Icon />
              <CommandItemLabel>{label}</CommandItemLabel>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Settings">
          {settings.map(({ label, icon: Icon }) => (
            <CommandItem key={label}>
              <Icon />
              <CommandItemLabel>{label}</CommandItemLabel>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <CommandFooter
        aria-hidden="true"
        end={
          <span className="flex items-center gap-1">
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            Toggle
          </span>
        }
      >
        <span>
          <KbdGroup>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
          </KbdGroup>
          Navigate
        </span>
        <span>
          <Kbd>↵</Kbd>
          Open
        </span>
        <span>
          <Kbd>Esc</Kbd>
          Close
        </span>
      </CommandFooter>
    </Command>
  );
}

/**
 * The command palette: CommandDialog at 600px, 12% from the top, with an
 * unboxed input, 40px items and CommandFooter key hints. Items are quiet at
 * rest, with a medium CommandItemLabel; the highlighted item's label turns
 * foreground and its icon turns the brand indicator. These styles apply in
 * CommandDialog only: a Command elsewhere, even in a dialog, keeps the accent
 * highlight. A page item names where it lives with
 * CommandItemDetail, muted, on every row. Type to filter:
 * each keystroke shows the new results at once, at their new height, with the
 * highlight already on the first result. The highlight and the row tint move
 * with the selection in the same frame, also on a held arrow key.
 * Only the dialog moves: it drops 6px from 98% as it opens and closes in
 * 110ms. Under reduced motion it only fades.
 */
export const Palette: Story = {
  parameters: { docs: { story: { inline: false, height: '560px' } } },
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open the palette
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <PaletteBody />
        </CommandDialog>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const input = await body.findByRole('combobox');
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
    const list = document.querySelector<HTMLElement>('[cmdk-list]');
    if (!list) throw new Error('The palette has no list');
    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const animated = () =>
      document
        .getAnimations()
        .map((animation) => (animation.effect as KeyframeEffect | null)?.target)
        .filter((target) => target instanceof Element && list.contains(target));
    const expectHighlightOnSelection = () => {
      const selected = list.querySelector('[cmdk-item][data-selected="true"]');
      const highlight = list.querySelector('[data-slot=command-highlight]');
      if (!selected || !highlight) throw new Error('No selected item or highlight');
      return expect(highlight.getBoundingClientRect().top).toBeCloseTo(selected.getBoundingClientRect().top, 0);
    };

    // Every row shows its detail, not only the selected one.
    const details = Array.from(list.querySelectorAll<HTMLElement>('[data-slot=command-item-detail]'));
    await expect(details.length).toBeGreaterThan(1);
    for (const detail of details) {
      await expect(detail).toBeVisible();
      await expect(getComputedStyle(detail).opacity).toBe('1');
    }

    // A keystroke shows the new results at once: no copy of the old results,
    // nothing fading or blurring in, the list already at its new height and
    // the highlight already on the first result.
    await userEvent.type(input, 'se', { delay: 30 });
    await nextFrame();
    await expect(list.querySelector('[data-slot=command-results-ghost]')).toBeNull();
    await expect(animated()).toEqual([]);
    const sizer = list.querySelector<HTMLElement>('[cmdk-list-sizer]');
    await expect(list.clientHeight).toBe(Math.min(sizer?.offsetHeight ?? 0, Number.parseFloat(getComputedStyle(list).maxHeight)));
    await expectHighlightOnSelection();

    // A held arrow key: the highlight keeps up on every step.
    for (const _ of [1, 2, 3]) {
      await userEvent.keyboard('{ArrowDown}');
      await nextFrame();
      await expectHighlightOnSelection();
      await expect(animated()).toEqual([]);
    }
    await userEvent.clear(input);
  },
};

/**
 * The sliding highlight and the footer without the dialog. Outside the
 * palette the highlight eases from item to item. Move with the arrow keys or
 * the pointer. Pinned to the light page theme.
 */
export const SlidingHighlight: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="overflow-hidden rounded-xl border">
          <PaletteBody />
        </div>
      )}
    </LightAndDark>
  ),
};
