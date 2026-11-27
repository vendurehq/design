import type { Meta, StoryObj } from '@storybook/react';
import { Copy, FileText, Search, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import { Command, CommandGroup, CommandItem, CommandList } from '../src/components/atoms/command.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../src/components/atoms/input-group.tsx';
import { DatePicker } from '../src/components/molecules/date-picker.tsx';
import { menuItem } from '../src/lib/menu-item.tsx';

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

/** A section: a heading, one line, and its content in light and dark side by side. */
function Section({ title, note, children }: { title: string; note: string; children: () => ReactNode }) {
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
              {children()}
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

function Shadows() {
  const surface = 'bg-card flex h-16 w-36 items-center justify-center rounded-2xl text-xs';
  return (
    <div className="grid grid-cols-3 gap-4">
      <Sample name="shadow-control" use="Resting controls on a surface: buttons, button groups, cards.">
        <div className={`${surface} shadow-control`}>Card</div>
      </Sample>
      <Sample name="shadow-overlay" use="Floating content: menus, popovers, dialogs, toasts.">
        <div className={`${surface} bg-popover shadow-overlay`}>Popover</div>
      </Sample>
      <Sample name="shadow-scrolled" use="The rule under a sticky header while content scrolls under it.">
        <div className="bg-card flex h-16 w-36 flex-col overflow-hidden rounded-2xl text-xs">
          <div className="bg-card shadow-scrolled px-3 py-2 font-medium">Header</div>
          <div className="text-muted-foreground px-3 py-2">Rows…</div>
        </div>
      </Sample>
    </div>
  );
}

function Corners() {
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
        <Sample name="Inner · 12 − 5 = 7px" use="A menu item 5px inside a 12px popup.">
          <div
            role="menu"
            aria-label="Order actions"
            className="bg-popover text-popover-foreground shadow-overlay w-44 rounded-2xl p-1.25"
          >
            {['Edit', 'Duplicate', 'Archive'].map((label, index) => (
              <div
                key={label}
                role="menuitem"
                tabIndex={-1}
                className={`${menuItem} ${index === 0 ? 'bg-muted text-foreground' : ''}`}
              >
                {label}
              </div>
            ))}
          </div>
        </Sample>
        <Sample name="Palette · rounded-3xl · 16px" use="The command palette. Its items: 16 − 8 = 8px.">
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
        <Sample name="Nested · outer − gap" use="A chip or button inside a field takes its corner from the field.">
          <InputGroup className="w-48">
            <InputGroupInput aria-label="Token" defaultValue="vnd_live_4f2a" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Copy">
                <Copy />
              </InputGroupButton>
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

const scale = [
  ['text-2xs', '11px', 'Dense metadata'],
  ['text-xs', '12px', 'Captions, badges, small buttons'],
  ['text-sm', '14px', 'Body text, fields, buttons'],
  ['text-base', '16px', 'Section and dialog titles'],
  ['text-lg', '18px', 'Large text'],
  ['text-xl', '20px', 'Large text'],
  ['text-2xl', '24px', 'Page headlines'],
  ['text-3xl', '30px', 'Display sm'],
  ['text-4xl', '36px', 'Display md'],
  ['text-5xl', '48px', 'Display lg (largest)'],
] as const;

const roles = [
  ['text-style-page-title', '22px', 'Page title'],
  ['text-style-section-title', '16px', 'Section title'],
  ['text-style-card-title', '14px', 'Card title'],
  ['text-style-body', '14px', 'Body'],
  ['text-style-caption', '12px', 'Caption'],
] as const;

function Type() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {scale.map(([cls, px, role]) => (
          <div key={cls} className="grid grid-cols-[6rem_3rem_1fr] items-baseline gap-3">
            <span className="font-mono text-xs">{cls}</span>
            <span className="text-muted-foreground font-mono text-xs">{px}</span>
            <span className={`${cls} truncate`}>{role}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 border-t pt-4">
        {roles.map(([cls, px, role]) => (
          <div key={cls} className="grid grid-cols-[11rem_3rem_1fr] items-baseline gap-3">
            <span className="font-mono text-xs">{cls}</span>
            <span className="text-muted-foreground font-mono text-xs">{px}</span>
            <span className={cls}>{role}</span>
          </div>
        ))}
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
        note="The scale ends at text-5xl. Arbitrary sizes in brackets fail the no-raw-font-sizes lint."
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
    // The menu item nests inside its popup: 12 − 5 = 7px.
    const item = canvasElement.querySelector<HTMLElement>('[role=menuitem]');
    await expect(item && getComputedStyle(item).borderTopLeftRadius).toBe('7px');
  },
};
