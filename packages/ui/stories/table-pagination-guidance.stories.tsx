import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { TablePagination } from '../src/components/molecules/data-table/table-pagination.tsx';

/**
 * Guidance, not props. TablePagination is the standalone pagination footer for
 * collection views that are not using DataTable. This page rules on when to use
 * it, which capabilities appear when callbacks or hrefs are wired, and how to
 * choose between button and anchor navigation. For API examples, see the
 * TablePagination stories.
 */
const meta = {
  title: 'Molecules/TablePagination/Guidance',
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
    need: 'A table with sorting, filtering, selection, or column visibility',
    reach: 'DataTable pagination',
    why: 'The DataTable engine already owns the footer wiring. See DataTable / Guidance.',
  },
  {
    need: 'A card list, activity list, or plain collection with server pages',
    reach: 'TablePagination',
    why: 'The view has pages but no columns to model. Use the standalone footer.',
  },
  {
    need: 'A short, fully loaded collection',
    reach: 'No pagination footer',
    why: 'Render every item. A disabled footer adds chrome without giving the user a choice.',
  },
];

const CAPABILITIES: { capability: string; appearsWhen: string; omitWhen: string }[] = [
  {
    capability: 'Range text',
    appearsWhen: 'Always. It reports the clamped visible range.',
    omitWhen: 'Never. Even range-only mode is valid for a read-only paged result.',
  },
  {
    capability: 'Prev/next controls',
    appearsWhen: '`onPageChange` or `getPageHref` is passed.',
    omitWhen: 'There is no way for the user to change pages.',
  },
  {
    capability: 'Page-size selector',
    appearsWhen: '`onPageSizeChange` is passed.',
    omitWhen: 'The page size is fixed by the route, API, or product decision.',
  },
];

function ButtonModeDemo() {
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(25);

  return (
    <TablePagination
      page={page}
      pageSize={pageSize}
      totalItems={132}
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
    />
  );
}

// ── stories ──────────────────────────────────────────────────────────────────

export const StandaloneOrDataTable: Story = {
  name: '1 · Standalone footer or DataTable',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Use TablePagination when the list has pages but no table engine"
        intro="TablePagination is the footer for composed collection views: card grids, activity feeds, and plain lists. If the view is a DataTable, configure DataTable pagination instead. If the collection is small and already loaded, skip pagination entirely."
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
        title="A footer only earns its space when there is another page"
        intro="Do not render pagination as decoration. If the result fits on one loaded page and the user cannot navigate, the footer is noise."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="A paged activity list gets the standalone footer because it has no columns, sorting, or selection."
          >
            <div className="flex flex-col gap-3">
              <div className="rounded-md border p-3 text-sm">Order #1042 was fulfilled</div>
              <div className="rounded-md border p-3 text-sm">Payment was captured</div>
              <TablePagination
                page={2}
                pageSize={25}
                totalItems={132}
                getPageHref={(page) => `/activity?page=${page}`}
              />
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="A short, fully rendered list does not need a range or disabled navigation."
          >
            <div className="flex flex-col gap-3">
              <div className="rounded-md border p-3 text-sm">Default channel</div>
              <div className="rounded-md border p-3 text-sm">Wholesale channel</div>
              <TablePagination page={1} pageSize={25} totalItems={2} onPageChange={() => {}} />
            </div>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const CapabilitiesAreWired: Story = {
  name: '2 · Capabilities are wired',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Props are capabilities, not feature flags"
        intro="The footer renders only what the consumer wires. Range text is always present. Page-size and navigation controls appear only when their callbacks or href factory exist."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Capability</th>
                <th className="p-3 font-medium">Appears when</th>
                <th className="p-3 font-medium">Omit when</th>
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map(({ capability, appearsWhen, omitWhen }) => (
                <tr key={capability} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{capability}</td>
                  <td className="p-3 text-xs">{appearsWhen}</td>
                  <td className="text-muted-foreground p-3 text-xs">{omitWhen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Wire only the actions the user can take"
        intro="A range-only footer is valid when the view is paged elsewhere or the footer is informational. The moment the user can change the page or page size, wire the matching capability."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Button mode wires page and page-size changes, so both controls render."
          >
            <ButtonModeDemo />
          </Example>
          <Example
            verdict="dont"
            caption="A fixed page size with a fake handler renders a selector that cannot be persisted or respected."
          >
            <TablePagination
              page={1}
              pageSize={25}
              totalItems={132}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const ButtonOrAnchorNavigation: Story = {
  name: '3 · Button or anchor navigation',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Use anchors for route navigation; use buttons for local state"
        intro="The navigation mode follows the state owner. If changing page means changing the URL, pass getPageHref and render real links. If page state lives in the current client view, pass onPageChange and render buttons."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Anchor mode exposes real URLs for server-rendered or shareable pages."
          >
            <TablePagination
              page={3}
              pageSize={25}
              totalItems={132}
              getPageHref={(page) => `/orders?page=${page}`}
            />
          </Example>
          <Example
            verdict="dont"
            caption="Button state for a URL-owned page hides navigation from links, prefetching, and browser affordances."
          >
            <TablePagination page={3} pageSize={25} totalItems={132} onPageChange={() => {}} />
          </Example>
        </div>
      </Section>
    </div>
  ),
};
