import type { Meta, StoryObj } from '@storybook/react';
import { type ReactNode, useState } from 'react';
import { Check, ChevronRight, Loader2, Mail } from 'lucide-react';
import { Button, ButtonLabelSwap } from '../src/components/atoms/button.tsx';

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

// Passing `render` swaps the underlying element for an anchor. The Button
// defaults nativeButton to false in this case, so Base UI doesn't warn.
export const AsLink: Story = {
  args: {
    variant: 'outline',
    // biome-ignore lint/a11y/useAnchorContent: Button injects the label via render
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

const VARIANTS = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'brand', 'link'] as const;

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
