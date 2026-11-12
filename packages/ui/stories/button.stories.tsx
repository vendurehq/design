import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';
import { type ReactNode, useState } from 'react';
import { Bold, Check, ChevronRight, Copy, Italic, Loader2, Mail, MoreHorizontal, Pin, Trash2, Underline } from 'lucide-react';
import { Button, ButtonLabelSwap } from '../src/components/atoms/button.tsx';
import { ButtonGroup } from '../src/components/atoms/button-group.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../src/components/atoms/input-group.tsx';
import {
  type ColumnDef,
  DataTable,
  DataTableRowLink,
} from '../src/components/molecules/data-table/data-table.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../src/components/atoms/tooltip.tsx';

const meta = {
  title: 'Atoms/General/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Button' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};

export const DestructiveOutline: Story = {
  args: { variant: 'destructive-outline', children: 'Tear down…' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link' },
};

export const SizeXs: Story = {
  args: { size: 'xs', children: 'Extra Small' },
};

export const SizeSm: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const SizeLg: Story = {
  args: { size: 'lg', children: 'Large' },
};

export const Icon: Story = {
  args: { size: 'icon', variant: 'outline', 'aria-label': 'Next', children: <ChevronRight /> },
};

export const IconXs: Story = {
  args: { size: 'icon-xs', variant: 'outline', 'aria-label': 'Next', children: <ChevronRight /> },
};

export const IconSm: Story = {
  args: { size: 'icon-sm', variant: 'outline', 'aria-label': 'Next', children: <ChevronRight /> },
};

export const IconLg: Story = {
  args: { size: 'icon-lg', variant: 'outline', 'aria-label': 'Next', children: <ChevronRight /> },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail /> Send Email
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="animate-spin" /> Please wait
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

const DISABLED_WITH_REASON = [
  { variant: 'default', label: 'Deploy', reason: 'A build is running. Deploy again when it ends.' },
  { variant: 'outline', label: 'Roll back', reason: 'There is no earlier deployment to roll back to.' },
  { variant: 'ghost', label: 'Restart', reason: 'The environment is asleep.' },
  {
    variant: 'destructive-outline',
    label: 'Delete…',
    reason: 'The environment has infrastructure. Tear it down first.',
  },
] as const;

function DisabledWithReasonRow() {
  return (
    <TooltipProvider>
      <div className="flex gap-3">
        {DISABLED_WITH_REASON.map(({ variant, label, reason }) => (
          <Tooltip key={variant}>
            <TooltipTrigger
              render={
                <Button variant={variant} disabled focusableWhenDisabled>
                  {label}
                </Button>
              }
            />
            <TooltipContent>{reason}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

/**
 * A disabled button that says why. `disabled` with `focusableWhenDisabled`
 * renders `aria-disabled="true"` in place of the native attribute: the button
 * keeps its tab stop and the pointer, so the tooltip opens, and Base UI ignores
 * the click and every key but Tab. It looks like a native disabled button:
 * half opacity, no shadow, a not-allowed cursor, and no hover or press change.
 * The test runner hovers and presses each one with a real mouse and checks
 * that the look holds and the tooltip opens.
 */
export const DisabledWithReason: Story = {
  parameters: {
    hoverText: DISABLED_WITH_REASON.map(({ label, reason }) => ({
      text: label,
      expectTooltip: reason,
      keepsLook: true,
    })),
  },
  render: () => <DisabledWithReasonRow />,
};

/** The same buttons in light and dark. Pinned to the light page theme. */
export const DisabledWithReasonLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>{() => <DisabledWithReasonRow />}</LightAndDark>
  ),
};

// Passing `render` swaps the underlying element for an anchor. The Button
// defaults nativeButton to false in this case, so Base UI doesn't warn.
export const AsLink: Story = {
  args: {
    variant: 'outline',
    render: <a href="https://vendure.io" />,
    children: 'Rendered as a link',
  },
};

function PlanCard() {
  const [selected, setSelected] = useState(false);
  return (
    <div className="bg-card relative flex w-80 items-center justify-between gap-3 rounded-xl border p-4 [transition:background-color_var(--transition-duration-fast)_var(--ease-default),scale_var(--transition-duration-moderate)_var(--ease-press)] hover:bg-muted motion-safe:active:scale-[0.985]">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">Starter plan</span>
        <span className="text-muted-foreground text-xs">2 vCPU, 4 GB memory</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="after:absolute after:inset-0 active:scale-none"
        onClick={() => setSelected((value) => !value)}
      >
        <ButtonLabelSwap
          labels={[
            'Select',
            <>
              <Check />
              Selected
            </>,
          ]}
          active={selected ? 1 : 0}
        />
      </Button>
    </div>
  );
}

/**
 * A button that stretches its `::after` over a card makes the whole card its
 * click target. The card shows it is one target: it takes the `muted` row
 * fill on hover, and a press scales the card to 0.985, not the button. The
 * button takes `active:scale-none`: any `scale` other than `none` makes the
 * button the containing block of its `::after`, which then shrinks to the
 * button between mousedown and mouseup, and a press on the card text clicks
 * nothing. The card is already the containing block, so its scale is safe.
 * `ButtonLabelSwap` crossfades "Select" and "Selected" and eases the button
 * to the new width. With reduced motion the card does not scale and the
 * labels only crossfade. The test runner presses the card text with a real
 * mouse, once with full motion and once with reduced motion emulated.
 */
export const StretchedClickArea: Story = {
  parameters: {
    pressText: [
      { text: 'Starter plan', expectButton: 'Selected' },
      { text: 'Starter plan', expectButton: 'Select', reducedMotion: true },
    ],
  },
  render: () => <PlanCard />,
};

/**
 * The button follows its label's size, also when the label changes size
 * without a swap: a web font that loads after the first paint, or a label
 * whose text changes. The play function makes the active label larger and
 * expects the button to grow with it.
 */
export const LabelFollowsItsSize: Story = {
  render: () => (
    <Button variant="outline">
      <ButtonLabelSwap labels={['Deploy', 'Deployed']} active={0} />
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Deploy' });
    const swap = button.querySelector<HTMLElement>('[data-slot=button-label-swap]');
    const label = button.querySelector<HTMLElement>('[data-swap=in]');
    if (!swap || !label) throw new Error('No label swap rendered');
    await waitFor(() => expect(swap.style.width).toBe(`${label.offsetWidth}px`));
    label.style.fontSize = '1.5rem';
    await waitFor(() => expect(swap.style.width).toBe(`${label.offsetWidth}px`));
  },
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
 * Rest and invalid (`aria-invalid`), in light and dark. Dark mode uses the full
 * destructive border, not a 50% one that was weaker than the rest border.
 * Pinned to the light page theme so the left panel stays light.
 */
export const Invalid: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="flex gap-3">
          <Button variant="outline">Choose file</Button>
          <Button variant="outline" aria-invalid>
            Choose file
          </Button>
        </div>
      )}
    </LightAndDark>
  ),
};

/**
 * The destructive variant is a solid fill: destructive-foreground on
 * destructive, which reaches 4.5:1 in both modes. Hover mixes a shade darker.
 * Pinned to the light page theme.
 */
export const DestructiveLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="flex gap-3">
          <Button variant="destructive">Delete order</Button>
          <Button variant="destructive" size="sm">
            Remove
          </Button>
        </div>
      )}
    </LightAndDark>
  ),
};

const TEXT_SIZES = ['lg', 'default', 'sm', 'xs'] as const;
const ICON_SIZES = ['icon-lg', 'icon', 'icon-sm', 'icon-xs'] as const;

function QuietDestructiveSizes({ disabled }: { disabled?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TEXT_SIZES.map((size) => (
        <Button key={size} variant="destructive-outline" size={size} disabled={disabled}>
          <Trash2 data-icon="inline-start" />
          Tear down…
        </Button>
      ))}
      {ICON_SIZES.map((size) => (
        <Button
          key={size}
          variant="destructive-outline"
          size={size}
          disabled={disabled}
          aria-label={`Delete, ${size}`}
        >
          <Trash2 />
        </Button>
      ))}
    </div>
  );
}

/**
 * The quiet destructive variant, `destructive-outline`: the outline button
 * with a red label and icon. Use it for a dangerous action that a page shows
 * at rest, such as a danger zone. Hover and press tint the fill red; focus
 * shows the ring. Disabled is half opacity, so it does not read as an alarm.
 * Every size at rest, then disabled, then a danger zone on a card. The solid
 * `destructive` stays for the confirm in the dialog. Pinned to the light page
 * theme so the left panel stays light.
 */
export const DestructiveOutlineLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="flex flex-col gap-4">
          <QuietDestructiveSizes />
          <QuietDestructiveSizes disabled />
          <div className="bg-card divide-y rounded-xl border">
            {[
              { title: 'Tear down the environment', action: 'Tear down…', disabled: false },
              { title: 'Delete the environment', action: 'Delete…', disabled: true },
            ].map(({ title, action, disabled }) => (
              <div key={title} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-sm">{title}</span>
                <Button variant="destructive-outline" disabled={disabled}>
                  <Trash2 data-icon="inline-start" />
                  {action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </LightAndDark>
  ),
};

const VARIANTS = [
  'default',
  'outline',
  'secondary',
  'ghost',
  'destructive',
  'destructive-outline',
  'brand',
  'link',
] as const;

/**
 * Every variant at the default (34px) and sm (28px) sizes, with the matching
 * icon-only squares, in light and dark. Press any button to see the 0.97
 * scale; it is off under reduced motion. Pinned to the light page theme.
 */
export const AllVariantsLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="flex flex-col gap-3">
          {(['default', 'sm'] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-2">
              {VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
              <Button variant="outline" size={size === 'sm' ? 'icon-sm' : 'icon'} aria-label="Next">
                <ChevronRight />
              </Button>
            </div>
          ))}
        </div>
      )}
    </LightAndDark>
  ),
};

/** A toggle whose name says whether the last press hit it. */
function PinToggle({ name, size }: { name: string; size: 'icon-xs' | 'icon-sm' }) {
  const [pinned, setPinned] = useState(false);
  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={`${pinned ? 'Unpin' : 'Pin'} ${name}`}
      aria-pressed={pinned}
      onClick={() => setPinned((value) => !value)}
    >
      <Pin />
    </Button>
  );
}

type Deployment = { id: string; name: string; commit: string };

const deployments: Deployment[] = [
  { id: 'd1', name: 'storefront-production', commit: '8f3c2a1d9e7b4c6a' },
  { id: 'd2', name: 'storefront-staging', commit: '1b9e4d7c2a6f8e3b' },
];

const deploymentColumns: ColumnDef<Deployment>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <DataTableRowLink href={`#/deployments/${row.original.id}`}>{row.original.name}</DataTableRowLink>
    ),
  },
  {
    accessorKey: 'commit',
    header: 'Commit',
    cell: ({ row }) => <IdChip value={row.original.commit} copyLabel="Copy commit" />,
  },
];

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

/**
 * The icon sizes `icon-xs` (24px) and `icon-sm` (28px) take a click area of
 * 40 × 40px around the icon. It is an invisible `::before`, so the button
 * keeps its size, focus ring and press scale, and the layout does not move.
 * Next to another control (a toolbar, a ButtonGroup, a field and its clear
 * button) the area keeps the button's own width, so neighbours never share a
 * point; above and below it still reaches 40px. In a vertical ButtonGroup it
 * keeps the button's height too. Inside an InputGroup and in the copy chips
 * it is off: the field and the chip are the target there.
 *
 * The test runner presses with a real mouse just inside the edge of the area
 * (7px off a 24px button, 5px off a 28px button) and expects a hit, and just
 * outside it and expects a miss. In the toolbar a press beside a button misses.
 */
export const SmallIconClickArea: Story = {
  parameters: {
    pressNear: [
      { button: 'Pin note', edge: 'top', distance: 7, expectButton: 'Unpin note' },
      { button: 'Unpin note', edge: 'left', distance: 7, expectButton: 'Pin note' },
      { button: 'Pin note', edge: 'bottom', distance: 10, expectButton: 'Pin note' },
      { button: 'Pin card', edge: 'right', distance: 5, expectButton: 'Unpin card' },
      { button: 'Unpin card', edge: 'bottom', distance: 5, expectButton: 'Pin card' },
      { button: 'Pin card', edge: 'top', distance: 8, expectButton: 'Pin card' },
      { button: 'Pin toolbar', edge: 'top', distance: 5, expectButton: 'Unpin toolbar' },
      { button: 'Unpin toolbar', edge: 'left', distance: 2, expectButton: 'Unpin toolbar' },
    ],
  },
  render: () => (
    <div className="flex w-[34rem] flex-col gap-6">
      <div className="flex gap-10">
        <Labelled label="icon-xs">
          <PinToggle name="note" size="icon-xs" />
        </Labelled>
        <Labelled label="icon-sm">
          <PinToggle name="card" size="icon-sm" />
        </Labelled>
        <Labelled label="Toolbar">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Bold">
              <Bold />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Italic">
              <Italic />
            </Button>
            <PinToggle name="toolbar" size="icon-sm" />
            <Button variant="ghost" size="icon-sm" aria-label="Underline">
              <Underline />
            </Button>
          </div>
        </Labelled>
        <Labelled label="ButtonGroup">
          <ButtonGroup>
            <Button variant="outline" size="icon-sm" aria-label="Copy">
              <Copy />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="More">
              <MoreHorizontal />
            </Button>
          </ButtonGroup>
        </Labelled>
      </div>
      <Labelled label="InputGroup">
        <InputGroup>
          <InputGroupInput aria-label="Token" defaultValue="tok_8f3c2a1d" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Copy token">
              <Copy />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Labelled>
      <DataTable<Deployment>
        rows={deployments}
        columns={deploymentColumns}
        getRowId={(deployment) => deployment.id}
        rowActions={(deployment) => (
          <Button variant="ghost" size="icon-sm" aria-label={`More for ${deployment.name}`}>
            <MoreHorizontal />
          </Button>
        )}
      />
    </div>
  ),
};
