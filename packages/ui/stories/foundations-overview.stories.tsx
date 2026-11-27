import type { Meta, StoryObj } from '@storybook/react';
import { FileText, Search, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import { Command, CommandGroup, CommandItem, CommandList } from '../src/components/atoms/command.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../src/components/atoms/input-group.tsx';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '../src/components/atoms/popover.tsx';
import { CopyButton } from '../src/components/molecules/copyable-text.tsx';
import { DatePicker } from '../src/components/molecules/date-picker.tsx';

/**
 * What the design system has: the three shadows, the corner roles, the two
 * control sizes and the type scale. Every section is drawn in light and dark.
 */
const meta = {
  title: 'Foundations/Overview',
  parameters: { layout: 'padded' },
  globals: { theme: 'light' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
type Theme = 'light' | 'dark';

// Popups portal to the page body, outside the dark panel, so the dark copy
// puts the theme class on the popup itself.
const themed = (theme: Theme) => (theme === 'dark' ? 'dark' : undefined);

/** A section: a heading, one line, and its content in light and dark side by side. */
function Section({ title, note, children }: { title: string; note: string; children: (theme: Theme) => ReactNode }) {
  return (
    <section className="flex max-w-4xl flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className="text-style-section-title">{title}</h2>
        <p className="text-muted-foreground text-sm">{note}</p>
      </header>
      <div className="grid gap-3">
        {(['light', 'dark'] as const).map((theme) => (
          <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
            <div className="bg-background text-foreground flex h-full flex-col gap-5 rounded-2xl border p-5">
              <p className="text-muted-foreground text-xs font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
              {children(theme)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** A labelled sample: the part, its name and where it is used. */
function Sample({ name, use, children }: { name: string; use: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex min-h-14 items-center">{children}</div>
      <span className="font-mono text-xs font-medium">{name}</span>
      <span className="text-muted-foreground text-xs">{use}</span>
    </div>
  );
}

function Shadows(theme: Theme) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Sample name="shadow-control · Card" use="Resting controls on a surface: buttons, button groups, cards.">
        <Card size="sm" className="w-36">
          <CardContent>Card</CardContent>
        </Card>
      </Sample>
      <Sample name="shadow-overlay · Popover" use="Floating content: menus, popovers, dialogs, toasts.">
        <div className="h-28">
          <Popover open modal={false}>
            <PopoverTrigger render={<Button variant="outline" size="sm" />}>Details</PopoverTrigger>
            <PopoverContent className={`${themed(theme) ?? ''} w-44`} side="bottom" align="start">
              <PopoverHeader>
                <PopoverTitle>Popover</PopoverTitle>
                <PopoverDescription>shadow-overlay</PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>
      </Sample>
      <Sample name="shadow-scrolled · token" use="The rule under a sticky header while content scrolls under it.">
        <div className="bg-card flex h-16 w-36 flex-col overflow-hidden rounded-2xl border text-xs">
          <div className="bg-card shadow-scrolled px-3 py-2 font-medium">Header</div>
          <div className="text-muted-foreground px-3 py-2">Rows…</div>
        </div>
      </Sample>
    </div>
  );
}

function Corners(theme: Theme) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4">
        <Sample name="Control · rounded-xl · 8px" use="Buttons, toggles and fields.">
          <div className="flex items-center gap-2">
            <Input aria-label="Order code" placeholder="Order code" className="w-32" />
            <Button>Save</Button>
          </div>
        </Sample>
        <Sample name="Surface · rounded-2xl · 12px" use="Cards, toasts, dialogs and popups.">
          <Card className="w-44">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="text-style-section-title">€12,480</CardContent>
          </Card>
        </Sample>
        <Sample name="Pill · rounded-full" use="Badges, avatars and switches.">
          <div className="flex gap-2">
            <Badge>Active</Badge>
            <Badge variant="outline">Draft</Badge>
          </div>
        </Sample>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Sample name="Inner · 12 − 5 = 7px · DropdownMenu" use="A menu item 5px inside a 12px popup.">
          <div className="h-40">
            <DropdownMenu open modal={false}>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>Actions</DropdownMenuTrigger>
              <DropdownMenuContent className={`${themed(theme) ?? ''} min-w-44`} side="bottom" align="start">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Sample>
        <Sample name="Palette · rounded-3xl · 16px · Command" use="The command palette. Its items: 16 − 8 = 8px.">
          {/* CommandDialog opens modal at the top of the page, so the sample
              draws the same palette scope and surface inline. */}
          <div data-command-palette="" className="shadow-overlay w-52 overflow-hidden rounded-3xl">
            <Command label="Go to">
              <CommandList>
                <CommandGroup>
                  <CommandItem value="orders">
                    <FileText />
                    Orders
                  </CommandItem>
                  <CommandItem value="customers">
                    <Users />
                    Customers
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </Sample>
        <Sample name="Nested · outer − gap · CopyButton" use="A copy button inside a field: 8 − 5 = 3px.">
          <InputGroup className="w-48">
            <InputGroupInput aria-label="Token" readOnly defaultValue="vnd_live_4f2a" />
            <InputGroupAddon align="inline-end">
              <CopyButton value="vnd_live_4f2a" />
            </InputGroupAddon>
          </InputGroup>
        </Sample>
      </div>
    </div>
  );
}

function Sizes() {
  const row = (size: 'sm' | 'default') => (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs font-medium">{size === 'sm' ? 'sm · 28px' : 'default · 34px'}</span>
      <div data-size-row={size} className="flex flex-wrap items-center gap-2">
        <Button size={size === 'sm' ? 'sm' : 'default'}>Save</Button>
        <Input size={size} aria-label={`Name, ${size}`} placeholder="Name" className="w-28" />
        <InputGroup size={size} className="w-40">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput aria-label={`Search, ${size}`} placeholder="Search" />
        </InputGroup>
        <DatePicker size={size} defaultValue="2026-03-10" clearable={false} />
      </div>
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      {row('sm')}
      {row('default')}
    </div>
  );
}

const productRoles = [
  ['text-style-page-title', '22px', 'Page title'],
  ['text-style-section-title', '16px', 'Section title'],
  ['text-style-dialog-title', '16px', 'Dialog title'],
  ['text-style-card-title', '14px', 'Card title'],
  ['text-style-body', '14px', 'Body text'],
  ['text-style-caption', '12px', 'Caption'],
  ['text-style-code', '14px', 'order_code'],
] as const;

const websiteRoles = [
  ['text-style-display-xl', '60px', 'Hero'],
  ['text-style-display-lg', '48px', 'Page hero'],
  ['text-style-display-md', '36px', 'Large stat'],
  ['text-style-display-sm', '30px', 'Section heading'],
] as const;

// Primitive steps carry only a size. Components set the line height and
// weight around them; screens use the roles above.
const primitives = [
  ['text-2xs', '11px', 'Count badges'],
  ['text-xs', '12px', 'Badges, small buttons'],
  ['text-sm', '14px', 'Fields, buttons, menu items'],
  ['text-base', '16px', 'Fields on small screens, palette input'],
  ['text-lg', '18px', 'Spare: no component uses 18px'],
  ['text-xl', '20px', 'Spare: no component uses 20px'],
  ['text-2xl', '24px', 'StatCard values'],
] as const;

function TypeGroup({
  title,
  rows,
}: {
  title: string;
  rows: ReadonlyArray<readonly [string, string, string]>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs font-medium">{title}</span>
      {rows.map(([cls, px, sample]) => (
        <div key={cls} className="grid grid-cols-[11rem_3rem_1fr] items-baseline gap-3">
          <span className="font-mono text-xs">{cls}</span>
          <span className="text-muted-foreground font-mono text-xs">{px}</span>
          <span className={`${cls} truncate`}>{sample}</span>
        </div>
      ))}
    </div>
  );
}

function Type() {
  return (
    <div className="flex flex-col gap-5">
      <TypeGroup title="Roles · product" rows={productRoles} />
      <div className="border-t pt-4">
        <TypeGroup title="Roles · website only" rows={websiteRoles} />
      </div>
      <div className="border-t pt-4">
        <TypeGroup title="Primitive steps (inside components only)" rows={primitives} />
      </div>
    </div>
  );
}

export const Overview: Story = {
  render: () => (
    <div className="flex flex-col gap-12">
      <Section title="Shadows" note="Three named shadows. Tailwind's shadow-2xs … shadow-2xl steps do not exist.">
        {Shadows}
      </Section>
      <Section
        title="Corners"
        note="A shape on its own takes a role radius. A shape nested inside another with a small gap takes the outer radius minus the gap (padding + border)."
      >
        {Corners}
      </Section>
      <Section title="Sizes" note="Two control heights. Every control in a row takes the same size.">
        {Sizes}
      </Section>
      <Section
        title="Type"
        note="Screens use the text-style roles: each sets size, line height, weight and tracking. Arbitrary sizes in brackets fail the no-raw-font-sizes lint."
      >
        {Type}
      </Section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Every control in a size row has the row's height.
    for (const [size, height] of [
      ['sm', 28],
      ['default', 34],
    ] as const) {
      const row = canvasElement.querySelector(`[data-size-row="${size}"]`);
      const controls = row?.querySelectorAll<HTMLElement>(
        '[data-slot=button], [data-slot=input]:not([data-slot=input-group] *), [data-slot=input-group], [aria-haspopup=dialog]',
      );
      await expect(controls?.length).toBeGreaterThanOrEqual(4);
      for (const control of controls ?? []) {
        await expect(control.getBoundingClientRect().height).toBe(height);
      }
    }
    // The menu item nests inside its popup (12 − 5 = 7px), the copy button
    // inside its field (8 − 5 = 3px). The menu portals to the page body.
    const item = canvasElement.ownerDocument.querySelector<HTMLElement>('[role=menuitem]');
    await expect(item && getComputedStyle(item).borderTopLeftRadius).toBe('7px');
    const copy = canvasElement.querySelector<HTMLElement>('[data-slot=copy-button]');
    await expect(copy && getComputedStyle(copy).borderTopLeftRadius).toBe('3px');
  },
};
