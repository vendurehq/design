import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../src/components/atoms/hover-card.tsx';

/**
 * Guidance, not props. When to set `align` on a hover card. For the component
 * API, see the HoverCard stories.
 */
const meta = {
  title: 'Atoms/Overlays/HoverCard/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DoNotSetAlign: Story = {
  name: 'Do not set align unless there is a reason',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <section className="p-4">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">Do not set align unless there is a reason</h2>
      <p className="text-muted-foreground mb-4 max-w-2xl text-sm">
        Without an align, a hover card opens toward the centre of the screen: a trigger in the right half lines up its
        right edge, a trigger in the left half its left edge. Set align only to pin an edge for a reason of the
        layout. An explicit align always wins, and align=&quot;center&quot; brings back the old look.
      </p>
      <div className="me-60 grid gap-4">
        <div className="h-52 rounded-lg border p-4">
          <p className="text-success-subtle-foreground mb-3 text-xs font-semibold tracking-wide uppercase">Do</p>
          <div className="flex justify-end">
            <HoverCard defaultOpen>
              <HoverCardTrigger href="#" className="underline underline-offset-4">
                No align
              </HoverCardTrigger>
              <HoverCardContent>It lines up with the trigger&apos;s right edge and stays inside the card.</HoverCardContent>
            </HoverCard>
          </div>
        </div>
        <div className="h-52 rounded-lg border p-4">
          <p className="text-destructive-subtle-foreground mb-3 text-xs font-semibold tracking-wide uppercase">Don&apos;t</p>
          <div className="flex justify-end">
            <HoverCard defaultOpen>
              <HoverCardTrigger href="#" className="underline underline-offset-4">
                align=&quot;start&quot;
              </HoverCardTrigger>
              <HoverCardContent align="start">
                Pinned to the trigger&apos;s left edge, it runs past the card on the right.
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </div>
    </section>
  ),
};
