import type { Meta, StoryObj } from '@storybook/react';
import { LayoutGrid, List, WrapText } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { Toggle } from '../src/components/atoms/toggle.tsx';
import { ToggleGroup, ToggleGroupItem } from '../src/components/atoms/toggle-group.tsx';

/**
 * Guidance, not props. A segmented control is a ToggleGroup; one pressed button
 * is a Toggle. For the component API, see the ToggleGroup stories.
 */
const meta = {
  title: 'Atoms/Forms/ToggleGroup/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, by convention) ───────────

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>
      {intro ? <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{intro}</p> : null}
      {children}
    </section>
  );
}

function Example({
  verdict,
  caption,
  children,
}: {
  verdict: 'do' | 'dont';
  caption: string;
  children: ReactNode;
}) {
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
      <div>{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── stories ──────────────────────────────────────────────────────────────────

export const SegmentedControl: Story = {
  name: '1 · A segmented control is a ToggleGroup',
  render: () => (
    <Section
      title="Two to five options that change the view at once"
      intro="Use a ToggleGroup for a time range, a list or grid switch, or a status filter. Each item has a text label or an aria-label. Pass multiple when the options combine."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Example verdict="do" caption="ToggleGroup: one pressed item, arrow keys move between them.">
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup variant="outline" spacing={0} defaultValue={['7d']} aria-label="Time range">
              <ToggleGroupItem value="24h">24h</ToggleGroupItem>
              <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
              <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup defaultValue={['list']} aria-label="Layout">
              <ToggleGroupItem value="list" aria-label="List">
                <List />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid">
                <LayoutGrid />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </Example>
        <Example verdict="dont" caption="Buttons that swap variants: no pressed state for assistive tech, no group.">
          <div className="flex gap-1">
            <Button size="sm" variant="outline">
              24h
            </Button>
            <Button size="sm">7 days</Button>
            <Button size="sm" variant="outline">
              30 days
            </Button>
          </div>
        </Example>
      </div>
    </Section>
  ),
};

export const OneToggle: Story = {
  name: '2 · One option on its own is a Toggle',
  render: () => (
    <Section
      title="A single on/off button in a toolbar"
      intro="A Toggle carries aria-pressed. A setting saved with a form is a Switch or a Checkbox instead."
    >
      <Example verdict="do" caption="Toggle: wrap lines in a log viewer.">
        <Toggle variant="outline" aria-label="Wrap lines">
          <WrapText />
        </Toggle>
      </Example>
    </Section>
  ),
};
