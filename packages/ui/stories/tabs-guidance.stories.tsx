import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsLink, TabsList, TabsNav, TabsTrigger } from '../src/components/atoms/tabs.tsx';
import { ToggleGroup, ToggleGroupItem } from '../src/components/atoms/toggle-group.tsx';

/**
 * Guidance, not props. Tabs for panels of one page, TabsNav for routes, and a
 * ToggleGroup for a filter. For the component API, see the Tabs stories.
 */
const meta = {
  title: 'Atoms/Data Display/Tabs/Guidance',
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

const noop = (event: { preventDefault: () => void }) => event.preventDefault();

export const PanelsOrRoutes: Story = {
  name: '1 · Panels or routes',
  render: () => (
    <Section
      title="Tabs switch panels; TabsNav switches pages"
      intro="When the URL stays the same, use Tabs with a TabsContent per tab. When each tab is its own route, use TabsNav with a TabsLink per route: a nav of links with aria-current, not a tablist."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Example verdict="do" caption="Tabs: the panels belong to one page.">
          <Tabs defaultValue="details">
            <TabsList variant="line">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-3 text-sm">
              Name, slug and description.
            </TabsContent>
            <TabsContent value="variants" className="pt-3 text-sm">
              Three variants.
            </TabsContent>
          </Tabs>
        </Example>
        <Example verdict="do" caption="TabsNav: each tab is a route. The router link marks the current one.">
          <TabsNav aria-label="Project sections">
            <TabsLink href="#overview" onClick={noop} active>
              Overview
            </TabsLink>
            <TabsLink href="#deployments" onClick={noop}>
              Deployments
            </TabsLink>
            <TabsLink href="#settings" onClick={noop}>
              Settings
            </TabsLink>
          </TabsNav>
        </Example>
      </div>
    </Section>
  ),
};

export const NotHandBuilt: Story = {
  name: '2 · Do not build tabs from buttons',
  render: () => (
    <Section
      title="A row of buttons with an underline is not a tab bar"
      intro="Hand-built tabs miss the tablist roles, the arrow keys and the shared underline. A control that narrows the same list is a filter, not a tab: use a ToggleGroup."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Example verdict="dont" caption="Buttons that swap an underline class: no roles, no arrow keys.">
          <div className="flex gap-4 border-b text-sm">
            <button type="button" className="border-foreground border-b-2 pb-2 font-medium">
              Details
            </button>
            <button type="button" className="text-muted-foreground pb-2">
              Variants
            </button>
          </div>
        </Example>
        <Example verdict="do" caption="A filter of one list: a ToggleGroup, not tabs.">
          <ToggleGroup variant="outline" spacing={0} defaultValue={['open']} aria-label="Order status">
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="open">Open</ToggleGroupItem>
            <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
          </ToggleGroup>
        </Example>
      </div>
    </Section>
  ),
};
