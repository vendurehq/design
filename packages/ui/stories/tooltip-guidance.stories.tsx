import type { Meta, StoryObj } from '@storybook/react';
import { InfoIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/atoms/popover.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../src/components/atoms/tooltip.tsx';

/**
 * Guidance, not props. What a tooltip may hold, and where longer content
 * goes instead. For the component API, see the Tooltip stories.
 */
const meta = {
  title: 'Atoms/Overlays/Tooltip/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>
      {intro ? <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{intro}</p> : null}
      {children}
    </section>
  );
}

function Example({ verdict, caption, children }: { verdict: 'do' | 'dont'; caption: string; children: ReactNode }) {
  const isDo = verdict === 'do';
  return (
    <div className="rounded-lg border p-4">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-wide ${
          isDo ? 'text-success-subtle-foreground' : 'text-destructive-subtle-foreground'
        }`}
      >
        {isDo ? 'Do' : "Don't"}
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

export const AShortHint: Story = {
  name: 'A short hint',
  render: () => (
    <Section
      title="A short hint, at most 320px"
      intro="A tooltip names a control or adds a short hint. Nobody can select or click inside it, so it holds nothing to read in full: no paragraphs, no long values, no controls. It is never wider than 320px."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Example verdict="do" caption="Name an icon button, or add a hint of a few words.">
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Sync details" />}>
              <InfoIcon />
            </TooltipTrigger>
            <TooltipContent>Runs every night at 02:00</TooltipContent>
          </Tooltip>
        </Example>
        <Example
          verdict="do"
          caption="Put longer content that the user reads or acts on in a Popover, or on the page."
        >
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>How the sync works</PopoverTrigger>
            <PopoverContent className="text-sm">
              The sync copies the catalog from the main channel to every storefront channel. It
              runs every night at 02:00 and skips products that are not enabled.
            </PopoverContent>
          </Popover>
        </Example>
      </div>
    </Section>
  ),
};
