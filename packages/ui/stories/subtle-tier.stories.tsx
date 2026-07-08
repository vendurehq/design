import type { Meta, StoryObj } from '@storybook/react';

// Class strings are static per tone so Tailwind's scanner picks them up.
const tones = [
  {
    label: 'Archived',
    classes: 'bg-neutral-subtle text-neutral-subtle-foreground border-neutral-border',
  },
  { label: 'Syncing', classes: 'bg-info-subtle text-info-subtle-foreground border-info-border' },
  {
    label: 'Active',
    classes: 'bg-success-subtle text-success-subtle-foreground border-success-border',
  },
  {
    label: 'Pending',
    classes: 'bg-warning-subtle text-warning-subtle-foreground border-warning-border',
  },
  {
    label: 'Failed',
    classes: 'bg-destructive-subtle text-destructive-subtle-foreground border-destructive-border',
  },
];

function SubtleBadge({ label, classes }: { label: string; classes: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

function SubtleBadgeRow() {
  return (
    <div className="flex flex-wrap gap-2">
      {tones.map((tone) => (
        <SubtleBadge key={tone.label} {...tone} />
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Subtle Tier',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Badges: Story = {
  render: () => <SubtleBadgeRow />,
};

// Dark subtle backgrounds are alpha mixes, so the subtle treatment must hold
// up on every tier of the surface ramp, not just the canvas.
export const OnSurfaceTiers: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['bg-background', 'bg-surface', 'bg-surface-raised', 'bg-overlay'] as const).map(
        (surface) => (
          <div key={surface} className={`rounded-lg border p-4 ${surface}`}>
            <p className="text-muted-foreground mb-2 text-xs">{surface}</p>
            <SubtleBadgeRow />
          </div>
        ),
      )}
    </div>
  ),
};
