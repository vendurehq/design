import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/atoms/button.tsx';
import { Popover, PopoverContent, PopoverDescription, PopoverTrigger } from '../src/components/atoms/popover.tsx';

/**
 * Guidance, not props. When to set `align` on a popover. For the component
 * API, see the Popover stories.
 */
const meta = {
  title: 'Atoms/Overlays/Popover/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DoNotSetAlign: Story = {
  name: 'Do not set align unless there is a reason',
  render: () => (
    <section className="max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">Do not set align unless there is a reason</h2>
      <p className="text-muted-foreground mb-4 text-sm">
        Without an align, a popover opens toward the centre of the screen: a trigger in the right half lines up its
        right edge, a trigger in the left half its left edge. Set align only to pin an edge for a reason of the
        layout. An explicit align always wins, and align=&quot;center&quot; brings back the old look.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-success-subtle-foreground mb-3 text-xs font-semibold tracking-wide uppercase">Do</p>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>No align</PopoverTrigger>
            <PopoverContent>
              <PopoverDescription>It opens toward the centre of the screen.</PopoverDescription>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground mt-3 text-sm">Leave align out. It fits wherever the trigger sits.</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-destructive-subtle-foreground mb-3 text-xs font-semibold tracking-wide uppercase">Don&apos;t</p>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>align=&quot;start&quot;</PopoverTrigger>
            <PopoverContent align="start">
              <PopoverDescription>Pinned to the left edge, even for a trigger on the right.</PopoverDescription>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground mt-3 text-sm">
            Do not copy align=&quot;start&quot; by habit. It runs past the content for a trigger in the right half.
          </p>
        </div>
      </div>
    </section>
  ),
};
