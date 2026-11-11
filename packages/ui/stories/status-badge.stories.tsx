import type { Meta, StoryObj } from '@storybook/react';
import { CircleSlashIcon, MoonStarIcon } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/atoms/tooltip.tsx';
import { type ColumnDef, DataTable } from '../src/components/molecules/data-table/data-table.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import { commonStates, type Tone } from '../src/lib/state-dictionary.ts';

const meta = {
  title: 'Molecules/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: {
    tone: 'neutral',
    appearance: 'chip',
    size: 'default',
    dot: false,
    children: 'Status',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'critical', 'progress'],
    },
    appearance: { control: 'inline-radio', options: ['chip', 'bare', 'text', 'dot'] },
    size: { control: 'inline-radio', options: ['default', 'lg'] },
    dot: { control: 'boolean' },
    reveal: { control: 'inline-radio', options: ['always', 'row'] },
    children: { control: 'text' },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const TONES: { tone: Tone; label: string }[] = [
  { tone: 'neutral', label: 'Draft' },
  { tone: 'info', label: 'Shipped' },
  { tone: 'success', label: 'Active' },
  { tone: 'warning', label: 'Awaiting approval' },
  { tone: 'critical', label: 'Failed' },
  { tone: 'progress', label: 'Deploying' },
];

export const Playground: Story = {};

// Every tone as a chip: a faint tone wash on the muted fill, a tone outline,
// a tinted label and the tone's own icon.
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TONES.map(({ tone, label }) => (
        <StatusBadge key={tone} tone={tone}>
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

// The leading dot replaces the tone icon, for a group of chips that is not a
// list column (a column uses `appearance="icon"`). Progress ignores the prop
// and keeps its spinner.
export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TONES.map(({ tone, label }) => (
        <StatusBadge key={tone} tone={tone} dot>
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

// `progress` renders a spinner, also with `dot` and with `icon={false}`. It
// turns once every 1.6s and stands still under prefers-reduced-motion.
export const Progress: Story = {
  args: { tone: 'progress', children: 'Deploying' },
};

// The default tone icons, and `icon` for a state whose shape says more than
// its tone icon.
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge tone="success">Live</StatusBadge>
      <StatusBadge tone="progress">Building</StatusBadge>
      <StatusBadge tone="warning">Degraded</StatusBadge>
      <StatusBadge tone="critical">Failed</StatusBadge>
      <StatusBadge tone="neutral" icon={<CircleSlashIcon />}>
        Cancelled
      </StatusBadge>
      <StatusBadge tone="neutral" icon={<MoonStarIcon />}>
        Asleep
      </StatusBadge>
    </div>
  ),
};

// `icon={false}`: an inline chip whose label already names the tone. A list
// column uses `appearance="icon"` instead. `progress` keeps its spinner, so it
// never looks like `info`.
const INLINE: { text: string; tone: Tone; label: string }[] = [
  { text: 'The last deploy', tone: 'critical', label: 'Failed' },
  { text: 'The rollback is', tone: 'progress', label: 'In progress' },
  { text: 'The staging environment is', tone: 'success', label: 'Healthy' },
];

export const WithoutIcon: Story = {
  render: () => (
    <div className="text-foreground-secondary flex flex-col gap-2 text-sm">
      {INLINE.map(({ text, tone, label }) => (
        <p key={label} className="flex items-center gap-1.5">
          {text}
          <StatusBadge tone={tone} icon={false}>
            {label}
          </StatusBadge>
        </p>
      ))}
    </div>
  ),
};

// `size="lg"` (28px, 14px icon) for the status beside a page title.
export const Large: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge size="lg" tone="success">
        Live
      </StatusBadge>
      <StatusBadge size="lg" tone="progress">
        Building
      </StatusBadge>
      <StatusBadge size="lg" tone="warning">
        Degraded
      </StatusBadge>
      <StatusBadge size="lg" tone="critical">
        Failed
      </StatusBadge>
      <StatusBadge size="lg" tone="neutral" icon={<MoonStarIcon />}>
        Asleep
      </StatusBadge>
    </div>
  ),
};

// `appearance="bare"`: the chip's icon and tinted label without the box, for a
// state inside a tinted or accent surface.
export const BareAppearance: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {TONES.map(({ tone, label }) => (
          <StatusBadge key={tone} tone={tone} appearance="bare">
            {label}
          </StatusBadge>
        ))}
      </div>
      <div className="flex max-w-md items-center justify-between gap-3 rounded-xl border border-[color-mix(in_oklab,var(--info-text)_30%,var(--border))] bg-[color-mix(in_oklab,var(--info-text)_6%,var(--card))] px-4 py-3">
        <span className="text-sm font-medium">Add Klarna payment handler</span>
        <StatusBadge tone="progress" appearance="bare">
          Building
        </StatusBadge>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector('[data-slot=status-badge]');
    await expect(badge).not.toBeNull();
    const style = getComputedStyle(badge as Element);
    // No fill: the computed background has zero alpha.
    await expect(style.backgroundColor.replace(/\s/g, '').endsWith(',0)')).toBe(true);
    await expect(style.paddingLeft).toBe('0px');
    await expect(style.boxShadow).toBe('none');
    await expect(badge?.querySelector('[data-slot=status-badge-marker]')).not.toBeNull();
  },
};

// A StatusBadge inside a Button, for a status that opens its details. The
// Button sizes every icon inside it to 16px; the marker keeps its own 13px
// icon (14px in `lg`) and its stroke.
export const InsideAButton: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="ghost">
        <StatusBadge tone="warning">Degraded</StatusBadge>
      </Button>
      <Button variant="ghost">
        <StatusBadge tone="neutral" icon={<MoonStarIcon />}>
          Asleep
        </StatusBadge>
      </Button>
      <Button variant="ghost" size="lg">
        <StatusBadge tone="progress" size="lg">
          Building
        </StatusBadge>
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const icons = [...canvasElement.querySelectorAll('[data-slot=status-badge-marker] svg')];
    await expect(icons.length).toBe(3);
    const sizes = icons.map((icon) => getComputedStyle(icon).width);
    await expect(sizes).toEqual(['13px', '13px', '14px']);
    for (const icon of icons) {
      await expect(getComputedStyle(icon).strokeWidth).toBe('2px');
    }
  },
};

// A badge that explains its state in a tooltip is a control: a tab stop with
// the focus ring. A chip also takes the hover fill, in place of its tone
// wash. A badge that opens nothing stays a plain label.
export const WithTooltip: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex items-center gap-4 p-8">
        <Tooltip>
          <TooltipTrigger render={<StatusBadge tone="warning">Degraded</StatusBadge>} />
          <TooltipContent>Worker restarting since 09:12</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <StatusBadge tone="critical" appearance="text">
                Failed
              </StatusBadge>
            }
          />
          <TooltipContent>Build failed at install</TooltipContent>
        </Tooltip>
        <StatusBadge tone="success">Live</StatusBadge>
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByText('Degraded');
    // The hover fill needs a real pointer (CSS :hover); the unit tests cover
    // its class. Keyboard focus is checked here.
    await userEvent.tab();
    await expect(chip).toHaveFocus();
    await expect(getComputedStyle(chip).outlineWidth).toBe('2px');
    await waitFor(() =>
      expect(within(document.body).getByText('Worker restarting since 09:12')).toBeVisible(),
    );
    await userEvent.tab();
    await expect(canvas.getByText('Failed')).toHaveFocus();
    await expect(canvas.getByText('Live')).not.toHaveAttribute('tabindex');
  },
};

// `appearance="icon"`: the tone icon with no box, then the label in neutral
// text, for a status every row of a table has. `detail` adds a second line in
// small muted text; the icon centres against both lines.
export const IconAppearance: Story = {
  render: () => (
    <div className="flex gap-10">
      <div className="flex flex-col gap-3">
        {TONES.map(({ tone, label }) => (
          <StatusBadge key={tone} tone={tone} appearance="icon">
            {label}
          </StatusBadge>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {TONES.map(({ tone, label }) => (
          <StatusBadge key={tone} tone={tone} appearance="icon" detail="2 minutes ago">
            {label}
          </StatusBadge>
        ))}
      </div>
    </div>
  ),
};

// `appearance="text"`: the word alone, in the tone colour. Not for a table
// column, which uses `appearance="icon"`. The progress spinner sits after the
// word.
export const TextAppearance: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {TONES.map(({ tone, label }) => (
        <StatusBadge key={tone} tone={tone} appearance="text">
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

// `appearance="dot"`: a lone 7px dot. The label is still in the DOM as
// screen-reader text, so the state is never colour-only for assistive tech.
export const DotAppearance: Story = {
  render: () => (
    <div className="flex flex-col gap-2 text-sm">
      {TONES.map(({ tone, label }) => (
        <span key={tone} className="inline-flex items-center gap-2">
          <StatusBadge tone={tone} appearance="dot">
            {label}
          </StatusBadge>
          <span aria-hidden className="text-muted-foreground">
            {tone}
          </span>
        </span>
      ))}
    </div>
  ),
};

// A status chip beside classification Badges. Solid/brand chips stay on Badge;
// StatusBadge takes only a faint wash of its tone over the muted fill.
export const AlongsideBadge: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone="success" dot>
        Active
      </StatusBadge>
      <Badge variant="outline">Production</Badge>
      <StatusBadge tone="warning" dot>
        Degraded
      </StatusBadge>
      <Badge variant="outline">Staging</Badge>
    </div>
  ),
};

// StatusBadge in a list: the status column comes right after the name, as the
// tone icon and a neutral label, so the column stays calm and a failure still
// stands out by its icon.
const ROWS: { name: string; env: string; tone: Tone; state: string }[] = [
  { name: 'checkout-api', env: 'Production', tone: 'success', state: 'Running' },
  { name: 'search-worker', env: 'Production', tone: 'progress', state: 'Deploying' },
  { name: 'staff-console', env: 'Staging', tone: 'warning', state: 'Degraded' },
  { name: 'legacy-import', env: 'Staging', tone: 'critical', state: 'Failed' },
  { name: 'analytics-sync', env: 'Production', tone: 'neutral', state: 'Disabled' },
];

export const InAList: Story = {
  render: () => (
    <div className="w-full max-w-xl overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
            <th className="p-3 font-medium">Service</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Environment</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ name, env, tone, state }) => (
            <tr key={name} className="border-b align-middle last:border-0">
              <td className="p-3 font-mono text-xs">{name}</td>
              <td className="w-32 p-3">
                <StatusBadge tone={tone} appearance="icon">
                  {state}
                </StatusBadge>
              </td>
              <td className="p-3">{env}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

interface Variant {
  id: string;
  name: string;
  sku: string;
  enabled: boolean;
  price: string;
}

const VARIANTS: Variant[] = [
  { id: '1', name: 'Laptop 13 inch 8GB', sku: 'L2201308', enabled: true, price: '$1,558.80' },
  { id: '2', name: 'Laptop 15 inch 8GB', sku: 'L2201508', enabled: true, price: '$1,678.80' },
  { id: '3', name: 'Laptop 13 inch 16GB', sku: 'L2201316', enabled: false, price: '$2,638.80' },
  { id: '4', name: 'Tablet 32GB', sku: 'TBL200032', enabled: true, price: '$394.80' },
];

const variantColumns: ColumnDef<Variant>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <a href={`#${row.original.sku}`} className="hover:underline">
        {row.original.name}
      </a>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    enableSorting: false,
    cell: ({ row }) => <IdChip value={row.original.sku} truncate="none" reveal="row" />,
  },
  {
    accessorKey: 'enabled',
    header: 'Status',
    enableSorting: false,
    // Enabled is the normal state: it shows on row hover. Disabled always shows.
    cell: ({ row }) => {
      const state = row.original.enabled ? 'enabled' : 'disabled';
      return (
        <StatusBadge
          tone={commonStates.toneFor(state)}
          reveal={row.original.enabled ? 'row' : 'always'}
        >
          {commonStates.labelFor(state)}
        </StatusBadge>
      );
    },
  },
  { accessorKey: 'price', header: 'Price', enableSorting: false },
];

// The left edge of the first visible letter in an element.
function textLeft(element: Element): number {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const node = walker.nextNode();
  if (!node?.textContent) throw new Error(`No text in ${element.outerHTML}`);
  const range = document.createRange();
  const start = node.textContent.search(/\S/);
  range.setStart(node, start);
  range.setEnd(node, start + 1);
  return range.getBoundingClientRect().left;
}

/**
 * Quiet normal, loud abnormal. Pass `reveal="row"` for the normal state of a
 * list column, here Enabled, and leave it out for the others. At rest only
 * the Disabled row shows its badge. Hover a row, or tab to its link, and its
 * Enabled badge fades in with the SKU chip (150ms, ease-out). The badge keeps
 * its place, so nothing moves and its label lines up with the Status header.
 * On a touch screen every badge shows.
 */
export const RevealInDataTable: Story = {
  args: { reveal: 'row' },
  render: () => (
    <DataTable<Variant>
      rows={VARIANTS}
      columns={variantColumns}
      getRowId={(variant) => variant.id}
    />
  ),
  play: async ({ canvasElement }) => {
    const badges = [...canvasElement.querySelectorAll('[data-slot=status-badge]')];
    const opacity = (element: Element) => getComputedStyle(element).opacity;
    const [enabled, , disabled, otherEnabled] = badges as HTMLElement[];

    // At rest: only Disabled shows.
    await expect(badges).toHaveLength(VARIANTS.length);
    await expect(opacity(enabled as Element)).toBe('0');
    await expect(opacity(disabled as Element)).toBe('1');

    // Every badge, hidden or not, lines up with the Status header.
    const header = [...canvasElement.querySelectorAll('thead th')].find(
      (th) => th.textContent === 'Status',
    );
    if (!header) throw new Error('No Status header');
    for (const badge of badges) {
      const offset = textLeft(badge) - textLeft(header);
      await expect(Math.abs(offset), badge.textContent ?? '').toBeLessThanOrEqual(0.5);
    }

    // Keyboard focus in a row reveals its badge, and only its badge.
    const link = enabled?.closest('tr')?.querySelector('a');
    link?.focus({ focusVisible: true } as FocusOptions);
    if (link?.matches(':focus-visible')) {
      await waitFor(() => expect(opacity(enabled as Element)).toBe('1'));
      await expect(opacity(otherEnabled as Element)).toBe('0');
    }
    link?.blur();
  },
};

