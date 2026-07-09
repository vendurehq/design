import type { Meta, StoryObj } from '@storybook/react';
import { ListFilterIcon, PlusIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '../src/components/atoms/input-group.tsx';
import { Chip } from '../src/components/molecules/chip.tsx';
import {
  ListHeader,
  ListHeaderChips,
  ListHeaderControls,
} from '../src/components/molecules/data-table/list-header.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';

/**
 * Guidance, not props. ListHeader is the list-page chrome for collection views
 * that need a title zone, controls, and applied-filter chips without the
 * DataTable engine. This page rules on when to use it, where each zone starts
 * and ends, and when the chip row appears. For API examples, see the ListHeader
 * stories.
 */
const meta = {
  title: 'Molecules/ListHeader/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, by convention) ──────────

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
      <div className="flex flex-col gap-4">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

type ReachRow = { need: string; reach: string; why: string };

const REACH_FOR: ReachRow[] = [
  {
    need: 'A single entity, settings screen, or section landing page',
    reach: 'PageHeader',
    why: 'There is no collection chrome. Keep the title, description, and actions in the PageHeader contract.',
  },
  {
    need: 'A collection with search, filters, or view controls but no table engine',
    reach: 'ListHeader',
    why: 'You need the list-page zones without TanStack state. Compose PageHeader, controls, and active-filter chips directly.',
  },
  {
    need: 'A collection with sorting, selection, filtering, column visibility, or table pagination',
    reach: 'DataTable',
    why: 'The table engine should own the wiring. See DataTable / Guidance for when to use the engine.',
  },
];

const ZONES: { zone: string; holds: string; rule: string }[] = [
  {
    zone: 'Title zone',
    holds: 'A PageHeader compound',
    rule: 'ListHeader does not re-create title semantics. Put PageHeader first so PageHeader / Guidance still governs title, description, badges, and actions.',
  },
  {
    zone: 'Controls row',
    holds: 'Search, filter triggers, sort/view controls',
    rule: 'Controls belong below the title so the PageHeader actions slot stays reserved for page-level commands.',
  },
  {
    zone: 'Chip row',
    holds: 'Applied filters as removable Chips',
    rule: 'Render it only when filters are active. Each Chip removes one applied filter and follows Chip / Guidance.',
  },
];

// ── stories ──────────────────────────────────────────────────────────────────

export const HeaderOrListHeader: Story = {
  name: '1 · Header, list header, or DataTable',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Use ListHeader when the collection needs chrome, not an engine"
        intro="ListHeader is for collection pages that need search, filters, view controls, and applied-filter chips, but do not need DataTable's TanStack instance. If the page is not a collection, use PageHeader alone. If the collection has table capabilities, use DataTable and let it assemble the same pieces."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">You need</th>
                <th className="p-3 font-medium">Reach for</th>
                <th className="p-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {REACH_FOR.map(({ need, reach, why }) => (
                <tr key={need} className="border-b align-top last:border-0">
                  <td className="p-3 text-xs">{need}</td>
                  <td className="p-3 font-mono text-xs">{reach}</td>
                  <td className="text-muted-foreground p-3 text-xs">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Controls sit below the title, not inside the title actions"
        intro="The PageHeader actions slot is for commands that affect the whole view, like creating or exporting. Search and filter controls operate on the collection below, so they get their own row."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="The title names the collection, the primary command stays in PageHeaderActions, and collection controls sit in their own row."
          >
            <ListHeader>
              <PageHeader>
                <PageHeaderContent>
                  <PageHeaderTitle>Customers</PageHeaderTitle>
                  <PageHeaderDescription>
                    Search and segment customer records.
                  </PageHeaderDescription>
                </PageHeaderContent>
                <PageHeaderActions>
                  <Button>
                    <PlusIcon />
                    New customer
                  </Button>
                </PageHeaderActions>
              </PageHeader>
              <ListHeaderControls>
                <InputGroup className="flex-1">
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <SearchIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search customers" />
                </InputGroup>
                <Button variant="outline">
                  <ListFilterIcon />
                  Filter
                </Button>
              </ListHeaderControls>
            </ListHeader>
          </Example>
          <Example
            verdict="dont"
            caption="Search and filter controls crowd the PageHeader actions slot and compete with the page-level command."
          >
            <PageHeader>
              <PageHeaderContent>
                <PageHeaderTitle>Customers</PageHeaderTitle>
                <PageHeaderDescription>Search and segment customer records.</PageHeaderDescription>
              </PageHeaderContent>
              <PageHeaderActions>
                <InputGroup className="w-48">
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <SearchIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search" />
                </InputGroup>
                <Button variant="outline">
                  <ListFilterIcon />
                  Filter
                </Button>
                <Button>
                  <PlusIcon />
                  New customer
                </Button>
              </PageHeaderActions>
            </PageHeader>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const ZonesAndOwnership: Story = {
  name: '2 · Zones and ownership',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Three zones, no logic"
        intro="ListHeader ships layout only. It does not own search text, active filters, fetch state, or routing. The consumer decides which controls to render and whether the chip row exists."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Zone</th>
                <th className="p-3 font-medium">Holds</th>
                <th className="p-3 font-medium">Rule</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map(({ zone, holds, rule }) => (
                <tr key={zone} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{zone}</td>
                  <td className="p-3 text-xs">{holds}</td>
                  <td className="text-muted-foreground p-3 text-xs">{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Render the chip row only when filters are active"
        intro="An empty chip row is not a placeholder. If no filters are active, omit ListHeaderChips and let the controls row close the header."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="No active filters, so the header ends after the controls row."
          >
            <ListHeader>
              <PageHeader>
                <PageHeaderContent>
                  <PageHeaderTitle>Products</PageHeaderTitle>
                  <PageHeaderDescription>Browse the catalog.</PageHeaderDescription>
                </PageHeaderContent>
              </PageHeader>
              <ListHeaderControls>
                <InputGroup className="flex-1">
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <SearchIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search products" />
                </InputGroup>
                <Button variant="outline">
                  <SlidersHorizontalIcon />
                  View
                </Button>
              </ListHeaderControls>
            </ListHeader>
          </Example>
          <Example
            verdict="dont"
            caption="An empty chip row creates spacing for a state that is not present."
          >
            <ListHeader>
              <PageHeader>
                <PageHeaderContent>
                  <PageHeaderTitle>Products</PageHeaderTitle>
                  <PageHeaderDescription>Browse the catalog.</PageHeaderDescription>
                </PageHeaderContent>
              </PageHeader>
              <ListHeaderControls>
                <InputGroup className="flex-1">
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <SearchIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search products" />
                </InputGroup>
              </ListHeaderControls>
              <ListHeaderChips aria-label="No filters applied" />
            </ListHeader>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const AppliedFilterChips: Story = {
  name: '3 · Applied filter chips',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The chip row is for filters the user can remove"
        intro="ListHeaderChips is a row of applied-filter Chips. It is not a place for statuses, totals, or static metadata. If a label cannot be removed from the current query, it is not an applied-filter chip."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Each chip names one active filter and has an accessible remove label."
          >
            <ListHeaderChips>
              <Chip onRemove={() => {}} removeLabel="Remove status filter">
                Status <span className="text-muted-foreground">is Active</span>
              </Chip>
              <Chip onRemove={() => {}} removeLabel="Remove group filter">
                Group <span className="text-muted-foreground">is Wholesale</span>
              </Chip>
            </ListHeaderChips>
          </Example>
          <Example
            verdict="dont"
            caption="Static facts and statuses do not belong in the applied-filter row. State words belong on StatusBadge, and totals belong near the collection."
          >
            <ListHeaderChips>
              <Chip>Active</Chip>
              <Chip>423 products</Chip>
              <Chip>Last synced today</Chip>
            </ListHeaderChips>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
