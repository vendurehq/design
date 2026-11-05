import type { Meta, StoryObj } from '@storybook/react';
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

const pages = [
  { label: 'Orders', icon: ShoppingCart, detail: 'Sales · Default channel' },
  { label: 'Products', icon: Package, detail: 'Catalog · Default channel' },
  { label: 'Customers', icon: Users, detail: 'Customers · Default channel' },
  { label: 'Analytics', icon: BarChart3, detail: 'Insights' },
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
      <CommandInput placeholder="Search pages and settings..." />
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
      <CommandFooter aria-hidden="true">
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
 * CommandItemDetail, shown on the highlighted item only. CommandList's
 * slidingHighlight follows the selection and eases the list's scroll with
 * it; hold an arrow key and it keeps up without restarting. Type to filter:
 * the old results fade out with a blur while new ones fade in, rows that stay
 * keep still, and the list eases to its new height. The palette drops 6px
 * from 98% as it opens and closes in 110ms. Under reduced motion it only
 * fades, the highlight and the scroll jump, new results only fade and the
 * height changes at once.
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
};

/**
 * The sliding highlight and the footer without the dialog. Move with the
 * arrow keys or the pointer. Pinned to the light page theme.
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
