import type { Meta, StoryObj } from '@storybook/react';
import { Copy, Search } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { Checkbox } from '../src/components/atoms/checkbox.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import { DatePicker } from '../src/components/molecules/date-picker.tsx';
import { DateRangePicker } from '../src/components/molecules/date-range-picker.tsx';
import { DateTimePicker } from '../src/components/molecules/date-time-picker.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../src/components/atoms/input-group.tsx';

/**
 * The review page of the v3 freeze of shadows, radii, button and input sizes,
 * and the type scale (OSS-1490). Each story is one numbered change: the old
 * look on the left, the new look on the right, in light and dark. A "before"
 * panel rebuilds the old value on that panel only, with a class override or an
 * inline style, because the old classes no longer compile. Popups, the drawer
 * and the dialog are drawn as static surfaces with the component's classes, so
 * they stay open on the page. Answer each number with yes or no.
 */
const meta = {
  title: 'Foundations/Freeze review (OSS-1490)',
  parameters: { layout: 'padded' },
  globals: { theme: 'light' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Theme = 'light' | 'dark';

interface Option {
  label: string;
  recommended?: boolean;
  render: (theme: Theme) => ReactNode;
}

/** One numbered item: its options side by side, in light (top) and dark (bottom). */
function Item({ id, title, why, options }: { id: string; title: string; why: string; options: Option[] }) {
  return (
    <section data-review-item={id} className="flex max-w-5xl flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className="text-style-section-title">
          {id}. {title}
        </h2>
        <p className="text-muted-foreground text-sm">{why}</p>
      </header>
      {(['light', 'dark'] as const).map((theme) => (
        <div
          key={theme}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        >
          {options.map((option) => (
            <div key={option.label} className={theme === 'dark' ? 'dark' : undefined}>
              <div className="bg-background text-foreground flex h-full flex-col gap-4 rounded-2xl border p-5">
                <p className="flex items-center gap-2 text-xs font-medium">
                  <span>{option.label}</span>
                  {option.recommended && <Badge variant="outline">Recommended</Badge>}
                  <span className="text-muted-foreground ms-auto">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </p>
                <div className="flex flex-1 flex-col items-start justify-center gap-3">{option.render(theme)}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

const before = (render: Option['render']): Option => ({ label: 'Before', render });
const after = (render: Option['render']): Option => ({ label: 'After', render });

/** A field next to a button, the row the field radius has to match. */
function FieldRow({ field, button, theme }: { field?: string; button?: string; theme: Theme }) {
  return (
    <div className="flex items-center gap-2">
      <Input aria-label={`Order code, ${theme}`} placeholder="Order code" className={`w-44 ${field ?? ''}`} />
      <Button className={button}>Search</Button>
    </div>
  );
}

/** A menu drawn open in place, with the classes of DropdownMenuContent and its items. */
function MenuSurface({ radius, item = 'rounded-lg', style }: { radius: string; item?: string; style?: CSSProperties }) {
  return (
    <div className={`bg-popover text-popover-foreground shadow-overlay w-56 p-1.25 ${radius}`} style={style}>
      {['Edit', 'Duplicate', 'Archive'].map((label, index) => (
        <div
          key={label}
          className={`flex min-h-8.5 items-center px-2 py-1.5 text-sm ${item} ${index === 0 ? 'bg-muted text-foreground' : 'text-foreground-secondary'}`}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

/** A dialog drawn in place, with the classes of DialogContent. */
function DialogSurface({ radius, style }: { radius?: string; style?: CSSProperties }) {
  return (
    <div className={`bg-overlay shadow-overlay flex w-72 flex-col gap-3 p-5 ${radius ?? ''}`} style={style}>
      <p className="text-style-dialog-title">Archive order?</p>
      <p className="text-muted-foreground text-sm">The order leaves the list. You can restore it later.</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Archive</Button>
      </div>
    </div>
  );
}

/** A search field with an xs button in it. */
function GroupWithButton({ theme, button, size }: { theme: Theme; button?: string; size?: 'sm' }) {
  return (
    <InputGroup size={size} className="w-64">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput aria-label={`Token, ${theme}`} placeholder="Token" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="xs" className={button}>
          <Copy /> Copy
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

// The old Tailwind shadow steps, rebuilt on the before panels only.
const oldShadowSm = '0 1px 3px 0 color-mix(in oklab, black 10%, transparent), 0 1px 2px -1px color-mix(in oklab, black 10%, transparent)';
const oldShadowMd = '0 4px 6px -1px color-mix(in oklab, black 10%, transparent), 0 2px 4px -2px color-mix(in oklab, black 10%, transparent)';
const oldShadowLg = '0 10px 15px -3px color-mix(in oklab, black 10%, transparent), 0 4px 6px -4px color-mix(in oklab, black 10%, transparent)';

// The lint examples, built from parts so the lint does not flag this file.
const arbitrarySize = ['text', '[13px]'].join('-');
const oversizedSize = ['text', '7xl'].join('-');

const shadowCard = 'bg-card flex h-14 w-36 items-center justify-center rounded-2xl text-xs';

/**
 * The review page: every item on one page, in order. The single-item stories
 * below hold the same content, one per screenshot.
 */
export const AllItems: Story = {
  name: 'All items',
  render: () => (
    <div className="flex flex-col gap-12">
      <p className="text-muted-foreground max-w-5xl text-sm">
        D2 (popup radius) and the nested menu-item corners are on hold and not part of this PR. Menus, the dialog, the sidebar, the combobox chips and the calendar labels are drawn as static
        stand-ins with the component's classes, so they stay open on this page. The real components are in their own
        stories.
      </p>
      {items.map(([id, item]) => (
        <div key={id} className="flex flex-col gap-6">
          {groups[id] && <h1 className="text-style-page-title border-b pb-2">{groups[id]}</h1>}
          {item()}
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

export const D1: Story = {
  name: 'D1. Field and button corners',
  render: () => (
    <Item
      id="D1"
      title="Field and button corners: fields to 8px (decided: A)"
      why="A field and a button in one row should have the same corner. Today fields are 6px and buttons 8px."
      options={[
        before((theme) => <FieldRow theme={theme} field="rounded-lg" />),
        { label: 'A: fields 8px', recommended: true, render: (theme) => <FieldRow theme={theme} /> },
        { label: 'B: buttons 6px', render: (theme) => <FieldRow theme={theme} field="rounded-lg" button="rounded-lg" /> },
      ]}
    />
  ),
};

export const D2: Story = {
  name: 'D2. Menu popup radius',
  render: () => (
    <Item
      id="D2"
      title="Menu popup radius (on hold, not in this PR): popup 12px with derived items, a new 10px token, or 8px with 4px items"
      why="Option A: the popup is a 12px surface and each item derives its corner from it, 12 − 5px padding = 7px. This PR keeps popups at 8px until this is decided."
      options={[
        before(() => <MenuSurface radius="rounded-xl" />),
        { label: 'A: 12px', recommended: true, render: () => <MenuSurface radius="rounded-2xl" /> },
        { label: 'B: 10px (new token)', render: () => <MenuSurface radius="" style={{ borderRadius: 10 }} /> },
        { label: 'C: 8px, 4px items', render: () => <MenuSurface radius="rounded-xl" item="rounded-md" /> },
      ]}
    />
  ),
};

export const D3: Story = {
  name: 'D3. Dialog radius',
  render: () => (
    <Item
      id="D3"
      title="Dialog: 12px (recommended, no change), or 14px as in the approved design"
      why="12px is the surface radius of a Card and a toast. 14px needs a new token for one component."
      options={[
        { label: 'A: 12px (today)', recommended: true, render: () => <DialogSurface radius="rounded-2xl" /> },
        { label: 'B: 14px (new token)', render: () => <DialogSurface style={{ borderRadius: 14 }} /> },
      ]}
    />
  ),
};

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export const S1: Story = {
  name: 'S1. Only three shadows',
  render: () => (
    <Item
      id="S1"
      title="Remove the Tailwind shadow-2xs … shadow-2xl steps"
      why="Only shadow-control, shadow-overlay and shadow-scrolled remain, so every surface picks one of three. shadow-sm, shadow-md and the rest no longer compile."
      options={[
        before(() => (
          <div className="flex flex-wrap gap-4 p-2">
            <div className={shadowCard} style={{ boxShadow: oldShadowSm }}>shadow-sm</div>
            <div className={shadowCard} style={{ boxShadow: oldShadowMd }}>shadow-md</div>
            <div className={shadowCard} style={{ boxShadow: oldShadowLg }}>shadow-lg</div>
          </div>
        )),
        after(() => (
          <div className="flex flex-wrap gap-4 p-2">
            <div className={`${shadowCard} shadow-control`}>shadow-control</div>
            <div className={`${shadowCard} shadow-overlay`}>shadow-overlay</div>
            <div className={`${shadowCard} shadow-scrolled rounded-none`}>shadow-scrolled</div>
          </div>
        )),
      ]}
    />
  ),
};

export const S2: Story = {
  name: 'S2. Floating sidebar',
  render: () => {
    const sidebar = (style?: CSSProperties, extra = '') => (
      <div
        className={`bg-sidebar text-sidebar-foreground ring-sidebar-border flex w-48 flex-col gap-1 rounded-lg p-2 text-sm ring-1 ${extra}`}
        style={style}
      >
        <span className="bg-sidebar-accent rounded-lg px-2.5 py-2 font-medium">Orders</span>
        <span className="px-2.5 py-2">Products</span>
      </div>
    );
    return (
      <Item
        id="S2"
        title="Floating sidebar: shadow-sm → shadow-control"
        why="The floating sidebar is a resting surface, like a Card, so it takes the control lift."
        options={[before(() => sidebar({ boxShadow: oldShadowSm })), after(() => sidebar(undefined, 'shadow-control'))]}
      />
    );
  },
};

export const S3: Story = {
  name: 'S3. Navigation menu indicator',
  render: () => {
    // Drawn 4 times larger, so the shadow under the 8px arrow is visible.
    const indicator = (style?: CSSProperties) => (
      <div className="flex h-24 w-full items-center justify-center">
        <div className="bg-border size-2 rotate-45 rounded-tl-sm" style={{ ...style, zoom: 4 }} />
      </div>
    );
    return (
      <Item
        id="S3"
        title="Navigation menu indicator: drop shadow-md"
        why="The arrow under an open navigation menu item drew a drop shadow. The popup already has the overlay shadow."
        options={[before(() => indicator({ boxShadow: oldShadowMd })), after(() => indicator())]}
      />
    );
  },
};

export const S4: Story = {
  name: 'S4. Field hairline',
  render: () => (
    <Item
      id="S4"
      title="Field hairline: shadow-[inset_0_0_0_1px_var(--border)] → inset-ring inset-ring-border"
      why="Same 1px line in the same colour, written with the ring utility the outline Button uses. No visible change; a shadow class on a field no longer replaces its hairline."
      options={[
        before((theme) => (
          <Input
            aria-label={`Name, before, ${theme}`}
            defaultValue="Hairline"
            className="inset-ring-0 shadow-[inset_0_0_0_1px_var(--border)] w-56"
          />
        )),
        after((theme) => <Input aria-label={`Name, after, ${theme}`} defaultValue="Hairline" className="w-56" />),
      ]}
    />
  ),
};

export const S5: Story = {
  name: 'S5. Sidebar outline button',
  render: () => {
    const button = (extra: string) => (
      <div className="bg-sidebar w-48 rounded-lg p-2">
        <span className={`bg-background text-sidebar-foreground flex h-8 items-center rounded-lg px-2.5 text-sm ${extra}`}>
          New order
        </span>
      </div>
    );
    return (
      <Item
        id="S5"
        title="Sidebar outline button: an edge shadow → ring ring-sidebar-border"
        why="Same 1px edge, written as a ring, so the button has no shadow class left."
        options={[
          before(() => button('shadow-[0_0_0_1px_var(--sidebar-border)]')),
          after(() => button('ring ring-sidebar-border')),
        ]}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Radii
// ---------------------------------------------------------------------------

export const R1: Story = {
  name: 'R1. Fields 6 → 8px',
  render: () => (
    <Item
      id="R1"
      title="Fields 6 → 8px (Input, Textarea, Select, Combobox, NativeSelect, InputOTP, the date pickers)"
      why="Follows D1: every field gets the 8px control corner of a Button."
      options={[
        before((theme) => <FieldRow theme={theme} field="rounded-lg" />),
        after((theme) => <FieldRow theme={theme} />),
      ]}
    />
  ),
};

export const R2: Story = {
  name: 'R2. Button inside a field',
  render: () => (
    <Item
      id="R2"
      title="InputGroupButton: its corner nests inside the field"
      why="The corner is the field's 8px minus the gap to the field edge: 3px for an xs button in a 34px field, 6px in a 28px field. The buttons are shown with their hover fill so the corner is visible."
      options={[
        before((theme) => <GroupWithButton theme={theme} button="rounded-lg bg-accent" />),
        after((theme) => <GroupWithButton theme={theme} button="bg-accent" />),
      ]}
    />
  ),
};

export const R4: Story = {
  name: 'R4. Badge pill and no 4xl radius',
  render: () => (
    <Item
      id="R4"
      title="Badge rounded-4xl → rounded-full; remove the 4xl radius and rounded-xs"
      why="A Badge is a pill. The 4xl token had no other user, and the theme now resets Tailwind's own radius steps."
      options={[
        before(() => (
          <div className="flex gap-2">
            <Badge className="rounded-[1.5rem]">Paid</Badge>
            <Badge variant="outline" className="rounded-[1.5rem]">
              Draft
            </Badge>
          </div>
        )),
        after(() => (
          <div className="flex gap-2">
            <Badge>Paid</Badge>
            <Badge variant="outline">Draft</Badge>
          </div>
        )),
      ]}
    />
  ),
};

export const R5: Story = {
  name: 'R5. Checkbox and chart keys use tokens',
  render: () => (
    <Item
      id="R5"
      title="Checkbox rounded-[4px] → rounded-md; chart legend keys rounded-[2px] → rounded-sm"
      why="Same corners, named from the radius scale instead of written in px. No visible change."
      options={[
        before((theme) => (
          <div className="flex items-center gap-3">
            <Checkbox aria-label={`Accept, before, ${theme}`} defaultChecked className="rounded-[4px]" />
            <span className="bg-chart-1 size-2 rounded-[2px]" />
          </div>
        )),
        after((theme) => (
          <div className="flex items-center gap-3">
            <Checkbox aria-label={`Accept, after, ${theme}`} defaultChecked />
            <span className="bg-chart-1 size-2 rounded-sm" />
          </div>
        )),
      ]}
    />
  ),
};

export const R6: Story = {
  name: 'R6. Combobox chips follow the field',
  render: () => {
    const chips = (field: string, chip: string) => (
      <div className={`bg-muted inset-ring inset-ring-border flex min-h-8.5 w-64 items-center gap-1.5 p-1.25 text-sm ${field}`}>
        {['DE', 'FR'].map((code) => (
          <span key={code} className={`bg-accent text-foreground flex h-6 items-center px-2 text-xs font-medium ${chip}`}>
            {code}
          </span>
        ))}
      </div>
    );
    return (
      <Item
        id="R6"
        title="Combobox chips: 1px → 3px corner"
        why="A chip sits 5px inside the field, so its corner is the field's corner minus 5px. The field goes to 8px, so the chip goes to 3px."
        options={[
          before(() => chips('rounded-lg', 'rounded-[calc(var(--radius-lg)-5px)]')),
          after(() => chips('rounded-xl', 'rounded-[calc(var(--radius-xl)-5px)]')),
        ]}
      />
    );
  },
};

export const R8: Story = {
  name: 'R8. Radius rules',
  render: () => {
    const roles = [
      ['Control', 'rounded-xl', '8px', 'buttons, toggles, fields'],
      ['Surface', 'rounded-2xl', '12px', 'cards, toasts, dialogs'],
      ['Palette', 'rounded-3xl', '16px', 'command palette'],
      ['Pill', 'rounded-full', 'full', 'badges, avatars, switches'],
    ];
    return (
      <Item
        id="R8"
        title="New guidance rules: Radius roles, and nested corners follow outer − gap"
        why="A shape on its own takes a role radius. A shape nested with a small gap takes the outer radius minus the gap (padding + border). When the gap is as big as the outer radius, the inner shape keeps its role radius. Both rules are in the token guidance, the docs and the vendure-tokens skill."
        options={[
          before(() => <p className="text-muted-foreground text-sm">No rule. Seven radius steps, picked per component.</p>),
          after(() => (
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-wrap gap-3">
                {roles.map(([role, cls, px, use]) => (
                  <div key={role} className="flex w-24 flex-col items-start gap-1.5">
                    <div className={`bg-muted inset-ring inset-ring-border size-12 ${cls}`} />
                    <span className="text-xs font-medium">
                      {role} · {px}
                    </span>
                    <span className="text-muted-foreground text-2xs">{use}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted inset-ring inset-ring-border flex h-8.5 w-40 items-center rounded-xl p-1.25">
                  <span className="bg-accent flex h-6 items-center rounded-[calc(var(--radius-xl)-5px)] px-2 text-xs font-medium">
                    DE
                  </span>
                </div>
                <span className="text-muted-foreground font-mono text-xs">8px − 5px = 3px</span>
              </div>
            </div>
          )),
        ]}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Buttons and inputs
// ---------------------------------------------------------------------------

export const B1: Story = {
  name: 'B1. Input size sm',
  render: () => (
    <Item
      id="B1"
      title='Input size="sm" (28px)'
      why="A row of small buttons had no text field of the same height. The approved design uses 28px search fields."
      options={[
        before((theme) => (
          <div className="flex items-center gap-2">
            <Input aria-label={`Search, before, ${theme}`} placeholder="Search" className="w-44" />
            <Button size="sm" variant="outline">
              Filter
            </Button>
          </div>
        )),
        after((theme) => (
          <div className="flex items-center gap-2">
            <Input size="sm" aria-label={`Search, after, ${theme}`} placeholder="Search" className="w-44" />
            <Button size="sm" variant="outline">
              Filter
            </Button>
          </div>
        )),
      ]}
    />
  ),
};

export const B2: Story = {
  name: 'B2. InputGroup size sm',
  render: () => (
    <Item
      id="B2"
      title='InputGroup size="sm" (28px)'
      why="The same 28px height for a field with an icon or a button in it. The input and the buttons inside follow the group."
      options={[
        before((theme) => (
          <div className="flex items-center gap-2">
            <GroupWithButton theme={theme} />
            <Button size="sm" variant="outline">
              Filter
            </Button>
          </div>
        )),
        after((theme) => (
          <div className="flex items-center gap-2">
            <GroupWithButton theme={theme} size="sm" />
            <Button size="sm" variant="outline">
              Filter
            </Button>
          </div>
        )),
      ]}
    />
  ),
};

export const B3: Story = {
  name: 'B3. Button in a field: 12px text',
  render: () => (
    <Item
      id="B3"
      title="InputGroupButton xs and sm text 14 → 12px"
      why="A button inside a field uses the text size of a Button of the same height: 12px at 24 and 28px."
      options={[
        before((theme) => <GroupWithButton theme={theme} button="text-sm" />),
        after((theme) => <GroupWithButton theme={theme} />),
      ]}
    />
  ),
};

export const B4: Story = {
  name: 'B4. Date picker size sm',
  render: () => {
    const pickers = (size?: 'sm') => (
      <div className="flex w-full flex-col items-start gap-2">
        <div className="flex w-full items-center gap-2">
          <Input size={size} placeholder="Search" className="w-32" />
          <DatePicker size={size} defaultValue="2026-03-10" clearable={false} />
        </div>
        <DateTimePicker size={size} defaultValue="2026-03-10T12:00:00.000Z" clearable={false} />
        <DateRangePicker size={size} defaultValue={{ from: '2026-03-10', to: '2026-03-17' }} clearable={false} />
      </div>
    );
    return (
      <Item
        id="B4"
        title='DatePicker, DateTimePicker and DateRangePicker size="sm" (28px)'
        why="A dense filter row with a small Input had no 28px date picker. The trigger and the time field follow the size."
        options={[before(() => pickers()), after(() => pickers('sm'))]}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export const T1: Story = {
  name: 'T1. Lint: font sizes from the scale',
  render: () => (
    <Item
      id="T1"
      title="design-lint: no-raw-font-sizes"
      why="The lint now fails an arbitrary font size and text-6xl to text-9xl in className strings, cn() and cva() calls. Sizes come from text-2xs … text-5xl or a type role."
      options={[
        before(() => (
          <pre className="bg-muted rounded-lg p-3 font-mono text-xs">
            {`<p className="${arbitrarySize}">  passes\n<p className="${oversizedSize}">     passes`}
          </pre>
        )),
        after(() => (
          <pre className="bg-muted rounded-lg p-3 font-mono text-xs">
            {`<p className="${arbitrarySize}">  error\n<p className="${oversizedSize}">     error\n<p className="text-sm">      passes`}
          </pre>
        )),
      ]}
    />
  ),
};

export const T2: Story = {
  name: 'T2. Calendar weekday labels',
  render: () => {
    const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const row = (style: CSSProperties | undefined, extra: string) => (
      <div className="flex gap-1">
        {days.map((day) => (
          <span key={day} className={`text-muted-foreground w-8 text-center font-normal ${extra}`} style={style}>
            {day}
          </span>
        ))}
      </div>
    );
    return (
      <Item
        id="T2"
        title="Calendar weekday and week-number labels: 12.8px → 12px (text-xs)"
        why="0.8rem was the one off-scale size in a component. text-xs is the small text step."
        options={[before(() => row({ fontSize: '0.8rem' }, '')), after(() => row(undefined, 'text-xs'))]}
      />
    );
  },
};

export const T3: Story = {
  name: 'T3. Storybook demo labels',
  render: () => {
    const label = (style: CSSProperties | undefined, extra: string) => (
      <span className={`text-muted-foreground font-mono tracking-wide ${extra}`} style={style}>
        RAIL · 60px
      </span>
    );
    return (
      <Item
        id="T3"
        title="Story-only labels 10px and 11px → 11px (text-2xs)"
        why="The AppShell and MultiSelect guidance stories used off-scale sizes. Storybook only; no component change."
        options={[before(() => label({ fontSize: 10 }, '')), after(() => label(undefined, 'text-2xs'))]}
      />
    );
  },
};

const groups: Record<string, string> = {
  D1: 'Decisions',
  S1: 'Shadows',
  R1: 'Radii',
  B1: 'Buttons and inputs',
  T1: 'Type',
};

// Order of the review page. A function per item, so `AllItems` can render it.
const items: [string, () => ReactNode][] = [
  ['D1', () => D1.render?.({} as never, {} as never)],
  ['D2', () => D2.render?.({} as never, {} as never)],
  ['D3', () => D3.render?.({} as never, {} as never)],
  ['S1', () => S1.render?.({} as never, {} as never)],
  ['S2', () => S2.render?.({} as never, {} as never)],
  ['S3', () => S3.render?.({} as never, {} as never)],
  ['S4', () => S4.render?.({} as never, {} as never)],
  ['S5', () => S5.render?.({} as never, {} as never)],
  ['R1', () => R1.render?.({} as never, {} as never)],
  ['R2', () => R2.render?.({} as never, {} as never)],
  ['R4', () => R4.render?.({} as never, {} as never)],
  ['R5', () => R5.render?.({} as never, {} as never)],
  ['R6', () => R6.render?.({} as never, {} as never)],
  ['R8', () => R8.render?.({} as never, {} as never)],
  ['B1', () => B1.render?.({} as never, {} as never)],
  ['B2', () => B2.render?.({} as never, {} as never)],
  ['B3', () => B3.render?.({} as never, {} as never)],
  ['B4', () => B4.render?.({} as never, {} as never)],
  ['T1', () => T1.render?.({} as never, {} as never)],
  ['T2', () => T2.render?.({} as never, {} as never)],
  ['T3', () => T3.render?.({} as never, {} as never)],
];
