import type { Meta, StoryObj } from '@storybook/react';
import { ListFilterIcon, PlusIcon, SearchIcon, TagIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '../src/components/atoms/input-group.tsx';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../src/components/atoms/pagination.tsx';
import { Chip } from '../src/components/molecules/chip.tsx';
import {
  ListHeader,
  ListHeaderChips,
  ListHeaderControls,
} from '../src/components/molecules/data-table/list-header.tsx';
import { TablePagination } from '../src/components/molecules/data-table/table-pagination.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';

/**
 * Guidance, not props. One page for the DataTable family because the decision
 * layer is shared: ListHeader and TablePagination are the layout and value-prop
 * shell of a list page, not a table engine. This page rules on which header a
 * page gets (ListHeader for lists, PageHeader alone for details), on the three
 * zones and the chip row that appears only when filters are applied, on the
 * capability-props contract that decides which pagination controls render, and
 * on what these primitives deliberately are not. For each component's API, see
 * its own stories page.
 */
const meta = {
  title: 'Molecules/DataTable/Guidance',
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

// A search field reused across the header examples; not part of the family, just
// realistic filler for the control row.
function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <InputGroup className="flex-1">
      <InputGroupAddon align="inline-start">
        <InputGroupText>
          <SearchIcon />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder={placeholder} />
    </InputGroup>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

type HeaderChoice = { page: string; header: string; why: string };

const HEADER_CHOICES: HeaderChoice[] = [
  {
    page: 'List / collection page',
    header: 'ListHeader',
    why: 'Orders, Customers, Products: a collection you search, filter, and paginate. Needs the control row and the conditional chip row on top of a title row.',
  },
  {
    page: 'Detail / settings page',
    header: 'PageHeader alone',
    why: 'A single entity (one order, one product) or a settings screen. There is no collection to filter or paginate, so there is no control or chip row to add.',
  },
];

type Zone = { zone: string; component: string; holds: string };

const ZONES: Zone[] = [
  {
    zone: 'Title row',
    component: 'PageHeader (composed)',
    holds: 'The list name, its actions, and any description — the existing PageHeader compound, dropped in as the first child. Not re-implemented here.',
  },
  {
    zone: 'Control row',
    component: 'ListHeaderControls',
    holds: 'Search input, filter triggers, view options. A layout-only flex row; the controls themselves are free children.',
  },
  {
    zone: 'Chip row',
    component: 'ListHeaderChips',
    holds: 'The applied-filter Chips. Rendered by the consumer only when filters are active — there is no empty chip-row placeholder.',
  },
];

type ContractRow = { feature: string; renders: string; absent: string };

const PAGINATION_CONTRACT: ContractRow[] = [
  {
    feature: 'Range text ("1–25 of 132")',
    renders: 'Always',
    absent: 'The one guaranteed element; the footer’s reason to exist.',
  },
  {
    feature: 'Page-size selector',
    renders: 'onPageSizeChange is wired',
    absent: 'No size control — the backend serves a fixed page size.',
  },
  {
    feature: 'Previous / next',
    renders: 'onPageChange or getPageHref is wired',
    absent: 'Range text only — no controls to move between pages.',
  },
  {
    feature: 'The whole footer',
    renders: 'The backend can paginate at all',
    absent: 'Render no TablePagination. Its absence is the switch, never a disabled placeholder.',
  },
];

type PaginationSibling = { component: string; use: string; vocabulary: string };

const PAGINATION_SIBLINGS: PaginationSibling[] = [
  {
    component: 'TablePagination',
    use: 'List pages and data tables: orders, customers, products.',
    vocabulary:
      'Range text plus prev/next, capability-gated. Sequential paging, where the total count and "the next page" are what a user needs — not a specific page number.',
  },
  {
    component: 'Pagination (atom)',
    use: 'Long-form and content contexts: paginated articles, search results.',
    vocabulary:
      'Numbered page links with an ellipsis, for jumping to an arbitrary page. Reach for it only where landing on page 7 directly is meaningful — never under a list-page table.',
  },
];

type NotRow = { myth: string; reality: string };

const WHAT_ITS_NOT: NotRow[] = [
  {
    myth: 'A TanStack table',
    reality: 'These take value props (page, pageSize, totalItems), not a table instance. No column model, no row model, no sorting engine.',
  },
  {
    myth: 'A data fetcher',
    reality: 'The route or loader owns the query. The components never fetch; they render the numbers they are handed.',
  },
  {
    myth: 'Filter logic',
    reality: 'The consumer decides what a filter is and computes the active set. ListHeaderChips holds no filter state and does no children introspection.',
  },
  {
    myth: 'A URL-state owner',
    reality: 'Page and filter state live in the route. getPageHref and onPageChange only report intent; the consumer maps that to the URL.',
  },
  {
    myth: 'The full DataTable',
    reality: 'Columns, sorting, row selection, and the toolbar wiring are a later phase. This is the layout and pagination shell only.',
  },
];

// ── 1 · which header for which page ───────────────────────────────────────────

export const WhichHeader: Story = {
  name: '1 · Which header for which page',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="ListHeader for lists, PageHeader for details"
        intro="ListHeader is the three-zone header of a list page: a title row, a control row, and a chip row. PageHeader alone is the header of a detail or settings page, where there is no collection to filter. ListHeader does not replace PageHeader — the title row is a PageHeader composed as the first child, so there is one header vocabulary, not two."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Page</th>
                <th className="p-3 font-medium">Header</th>
                <th className="p-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {HEADER_CHOICES.map(({ page, header, why }) => (
                <tr key={page} className="border-b align-top last:border-0">
                  <td className="p-3 text-xs">{page}</td>
                  <td className="p-3 font-mono text-xs">{header}</td>
                  <td className="text-muted-foreground p-3 text-xs">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="The three zones, top to bottom"
        intro="ListHeader is a vertical stack: PageHeader, then ListHeaderControls, then (only when filters are applied) ListHeaderChips. Each zone is layout only — it holds free children and no logic."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Zone</th>
                <th className="p-3 font-medium">Component</th>
                <th className="p-3 font-medium">Holds</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map(({ zone, component, holds }) => (
                <tr key={zone} className="border-b align-top last:border-0">
                  <td className="p-3 text-xs">{zone}</td>
                  <td className="p-3 font-mono text-xs">{component}</td>
                  <td className="text-muted-foreground p-3 text-xs">{holds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Compose PageHeader; never build a second header"
        intro="The title row carries everything a detail page's header does — the name, the one primary action, the description — so it is the PageHeader compound, unchanged (see PageHeader / Guidance for the one-primary-action rule). Hand-rolling a bespoke title bar inside ListHeader forks the header vocabulary and drifts from the one primary-action contract."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="The title row is a PageHeader composed as the first child: one primary action, consistent with every detail page. The control row sits below it."
          >
            <ListHeader>
              <PageHeader>
                <PageHeaderContent>
                  <PageHeaderTitle>Orders</PageHeaderTitle>
                  <PageHeaderDescription>Track and fulfill customer orders.</PageHeaderDescription>
                </PageHeaderContent>
                <PageHeaderActions>
                  <Button variant="outline">Export</Button>
                  <Button>
                    <PlusIcon />
                    New order
                  </Button>
                </PageHeaderActions>
              </PageHeader>
              <ListHeaderControls>
                <SearchField placeholder="Search orders" />
                <Button variant="outline">
                  <ListFilterIcon />
                  Filter
                </Button>
              </ListHeaderControls>
            </ListHeader>
          </Example>
          <Example
            verdict="dont"
            caption="A hand-rolled title bar re-invents what PageHeader already owns: two filled buttons compete, the type scale drifts, and the list page no longer matches the detail pages next to it."
          >
            <ListHeader>
              <div className="flex items-center justify-between border-b pb-4">
                <h1 className="text-2xl font-bold">Orders</h1>
                <div className="flex gap-2">
                  <Button>Export</Button>
                  <Button>New order</Button>
                </div>
              </div>
              <ListHeaderControls>
                <SearchField placeholder="Search orders" />
                <Button variant="outline">
                  <ListFilterIcon />
                  Filter
                </Button>
              </ListHeaderControls>
            </ListHeader>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · the chip row is applied filters ───────────────────────────────────────

export const TheChipRow: Story = {
  name: '2 · The chip row is the Chip molecule',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Applied filters are Chips, rendered only when active"
        intro="There is deliberately no FilterChip component. A removable applied filter is the Chip molecule: onRemove plus removeLabel for the × , and the field/operator as secondary text in a muted span (see Chip / Guidance). The consumer renders ListHeaderChips only while filters are applied — there is no empty chip-row placeholder holding blank space above the table."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Each applied filter is a Chip: the × removes it, and the field reads as muted secondary text. The row is present only because filters are active."
          >
            <ListHeaderChips>
              <Chip icon={<TagIcon />} onRemove={() => {}} removeLabel="Remove Status is Paid">
                Paid <span className="text-muted-foreground">in Status</span>
              </Chip>
              <Chip icon={<TagIcon />} onRemove={() => {}} removeLabel="Remove Channel is Europe">
                Europe <span className="text-muted-foreground">in Channel</span>
              </Chip>
            </ListHeaderChips>
          </Example>
          <Example
            verdict="dont"
            caption="A bespoke filter pill re-invents the Chip: no accessible remove button, no shared styling, and none of the removability contract the Chip guarantees."
          >
            <ListHeaderChips>
              <span className="bg-muted inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs">
                Status: Paid ✕
              </span>
              <span className="bg-muted inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs">
                Channel: Europe ✕
              </span>
            </ListHeaderChips>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · pagination renders by capability ──────────────────────────────────────

export const CapabilityProps: Story = {
  name: '3 · Pagination renders by capability',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="TablePagination vs the Pagination atom"
        intro="The library ships both a TablePagination molecule and a numbered-links Pagination atom, and they are not interchangeable. A list page or data table always uses TablePagination: sequential prev/next with a running range, where the count and the next page are what matters. The numbered Pagination atom — page links with an ellipsis for jumping to an arbitrary page — is for long-form and content contexts, and never sits under a list-page table. TablePagination deliberately excludes numbered links precisely because arbitrary-page jumps are not a list-table concern."
      >
        <div className="mb-4 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Component</th>
                <th className="p-3 font-medium">Use for</th>
                <th className="p-3 font-medium">Vocabulary</th>
              </tr>
            </thead>
            <tbody>
              {PAGINATION_SIBLINGS.map(({ component, use, vocabulary }) => (
                <tr key={component} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{component}</td>
                  <td className="p-3 text-xs">{use}</td>
                  <td className="text-muted-foreground p-3 text-xs">{vocabulary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="A data table paginates with TablePagination: the running range answers “where am I in 132 orders?”, and prev/next walk the result."
          >
            <TablePagination page={2} pageSize={25} totalItems={132} onPageChange={() => {}} />
          </Example>
          <Example
            verdict="dont"
            caption="Numbered page links under a list table invite jumping to page 6 of a live-filtered result — a meaningless target — and drop the range and total the table actually needs."
          >
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Example>
        </div>
      </Section>

      <Section
        title="A feature renders only if its prop is wired"
        intro="TablePagination has no feature flags. Each control is gated by the presence of its callback: wire the prop and the control appears; omit it and the control is simply absent. When the backend cannot paginate at all, render no TablePagination — the prop's absence is the switch, never a disabled placeholder for a capability the backend lacks."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Feature</th>
                <th className="p-3 font-medium">Renders when</th>
                <th className="p-3 font-medium">Absent means</th>
              </tr>
            </thead>
            <tbody>
              {PAGINATION_CONTRACT.map(({ feature, renders, absent }) => (
                <tr key={feature} className="border-b align-top last:border-0">
                  <td className="p-3 text-xs">{feature}</td>
                  <td className="p-3 font-mono text-xs">{renders}</td>
                  <td className="text-muted-foreground p-3 text-xs">{absent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Absence is the switch, not a disabled control"
        intro="A backend that serves a fixed page size has no page-size capability. Express that by omitting onPageSizeChange, which drops the selector entirely. A disabled selector is worse than no selector: it advertises a control the user can never use."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Fixed page size, so onPageSizeChange is omitted and no selector renders. Prev/next stay because onPageChange is wired. The footer shows only what the backend can actually do."
          >
            <TablePagination page={2} pageSize={25} totalItems={132} onPageChange={() => {}} />
          </Example>
          <Example
            verdict="dont"
            caption="Wiring onPageSizeChange to render a selector for a size the backend ignores dangles a dead control. If the capability isn't there, the prop shouldn't be either."
          >
            <TablePagination
              page={2}
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

// ── 4 · anchor vs button, and what these are not ──────────────────────────────

export const AnchorVsButton: Story = {
  name: '4 · Anchor mode, button mode, and what these are not',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="getPageHref for links, onPageChange for client tables"
        intro="Prev/next render as real <a href> elements when getPageHref is set, so full-page and RSC navigation work with a plain click (getPageHref wins over onPageChange for how the controls render). Pass onPageChange instead for a client-driven table that updates in place. Either way the route owns the page state — the component reports the target page, it does not store it."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Anchor mode: getPageHref makes prev/next real links, so a full-page products list paginates through the router with no client state."
          >
            <TablePagination
              page={3}
              pageSize={25}
              totalItems={132}
              getPageHref={(page) => `/products?page=${page}`}
            />
          </Example>
          <Example
            verdict="do"
            caption="Button mode: onPageChange drives a client table that re-renders in place. The handler updates the route's state; the component holds none of its own."
          >
            <TablePagination
              page={3}
              pageSize={25}
              totalItems={132}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
            />
          </Example>
        </div>
      </Section>

      <Section
        title="What these primitives are not"
        intro="ListHeader and TablePagination are layout and value props. They carry no table engine, no data fetching, and no filter logic — that keeps them router-agnostic and reusable across every list surface. Reach for the full DataTable molecule, a later phase, when you need columns and sorting."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Not</th>
                <th className="p-3 font-medium">What it actually is</th>
              </tr>
            </thead>
            <tbody>
              {WHAT_ITS_NOT.map(({ myth, reality }) => (
                <tr key={myth} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{myth}</td>
                  <td className="text-muted-foreground p-3 text-xs">{reality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};
