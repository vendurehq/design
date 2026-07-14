import type { Meta, StoryObj } from '@storybook/react';
import { ArchiveIcon, Trash2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '../src/components/atoms/card.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/atoms/table.tsx';
import {
  type ColumnDef,
  DataTable,
  type SortingState,
} from '../src/components/molecules/data-table/data-table.tsx';
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';

/**
 * Guidance, not props. The DataTable molecule is the batteries-included list
 * engine: one TanStack instance that assembles ListHeader, the Table atom,
 * TablePagination, and Chip into a working collection view. This page rules on
 * when to reach for it versus composing those primitives yourself, on which
 * capabilities to switch on (each is off until its config is passed), on who owns
 * the state behind every capability (the consumer owns URL, fetching, and
 * persistence; the core never fetches), on the frame (the card is the table's
 * frame; frame="plain" only inside an existing card), and on where the line
 * falls between this core and richer consumer table shells. For the
 * prop-by-prop API, see the DataTable stories.
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

// ── data (a realistic products collection, reused across examples) ────────────

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: string;
};

const PRODUCTS: Product[] = [
  { id: '1', name: 'Merino Crew Sweater', sku: 'AP-MCS-001', stock: 'In stock' },
  { id: '2', name: 'Oxford Shirt', sku: 'AP-OXS-014', stock: 'Low stock' },
  { id: '3', name: 'Wool Overcoat', sku: 'AP-WOC-039', stock: 'In stock' },
  { id: '4', name: 'Leather Belt', sku: 'AC-LBT-102', stock: 'Out of stock' },
];

const productColumns: ColumnDef<Product>[] = [
  { accessorKey: 'name', header: 'Product' },
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'stock', header: 'Availability' },
];

// A tiny controlled-sorting host: the URL would own `sorting` in a real page; a
// local state stands in for it here so the controlled example is live.
function ControlledSortingTable() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  return (
    <DataTable
      rows={PRODUCTS}
      columns={productColumns}
      getRowId={(p) => p.id}
      sorting={{ value: sorting, onChange: setSorting, mode: 'client' }}
    />
  );
}

// ── decision-table data ───────────────────────────────────────────────────────

type ReachRow = { need: string; reach: string; why: string };

const REACH_FOR: ReachRow[] = [
  {
    need: 'A collection you sort, select, filter, or paginate',
    reach: 'DataTable',
    why: 'The engine you want. It owns the TanStack instance and wires ListHeader, the Table atom, TablePagination, and Chip together for you.',
  },
  {
    need: 'A short, static reference grid (no sorting, no selection)',
    reach: 'Table atom',
    why: "Rows you only read. DataTable's column model, sort engine, and selection cache are dead weight here. Render the atom directly.",
  },
  {
    need: 'A list page whose only interaction is prev/next paging',
    reach: 'ListHeader + TablePagination',
    why: 'No columns to model. Compose the header and footer primitives directly rather than stand up a table engine to render plain rows.',
  },
  {
    need: 'A single entity or settings screen',
    reach: 'PageHeader alone',
    why: 'No collection at all. There is nothing to filter or paginate, so there is no DataTable to reach for. See the PageHeader guidance.',
  },
];

type CapabilityRow = { capability: string; enableWhen: string; skipWhen: string };

const CAPABILITIES: CapabilityRow[] = [
  {
    capability: 'sorting',
    enableWhen: 'A column is meaningfully orderable and the backend (or client) can sort by it.',
    skipWhen: 'Order is fixed or curated; sortable headers on an unsortable column mislead.',
  },
  {
    capability: 'rowSelection',
    enableWhen:
      'A bulkActions overlay or a selection-consuming rowAction will act on the checked rows.',
    skipWhen: 'Nothing consumes the selection: dead checkboxes that lead nowhere.',
  },
  {
    capability: 'filters',
    enableWhen:
      'Users narrow a large set; pass `columns` for the built-in add-filter menu, or omit it and supply your own trigger in `toolbar`.',
    skipWhen: 'The set is small enough to scan, or search alone suffices.',
  },
  {
    capability: 'columnVisibility',
    enableWhen:
      'The table is wide enough that hiding columns is a real need, and you persist the choice.',
    skipWhen: 'A handful of columns that always fit; the gear is clutter.',
  },
  {
    capability: 'pagination',
    enableWhen: 'The backend paginates. Always controlled: `page`/`onPageChange` are required.',
    skipWhen: 'The full set is already in `rows` and short. Render every row, no footer.',
  },
];

type OwnershipRow = { state: string; controlled: string; job: string };

const OWNERSHIP: OwnershipRow[] = [
  {
    state: 'sorting',
    controlled: 'Controlled (URL) or uncontrolled',
    job: 'Server mode: push the new sort to the URL and refetch. Client mode: hand it `defaultValue` and let the core sort `rows`.',
  },
  {
    state: 'filters',
    controlled: 'Controlled (URL)',
    job: 'Push filters to the URL, reset pagination to page 1, and refetch. The core stores opaque `{ [operator]: value }` and never interprets it.',
  },
  {
    state: 'columnVisibility',
    controlled: 'Controlled (persisted)',
    job: 'Persist the visibility map to user settings and prune the GraphQL selection set yourself; the core only shows and hides.',
  },
  {
    state: 'rowSelection',
    controlled: 'Controlled (local)',
    job: 'Hold selection in local state so bulk actions can read it. Pass `getRowId` so ids survive across pages.',
  },
  {
    state: 'pagination',
    controlled: 'Always controlled (URL)',
    job: 'Own `page`/`pageSize` in the route and refetch on change. Pagination is 1-based, with no uncontrolled branch.',
  },
];

type DashboardRow = { capability: string; lives: string; how: string };

const DASHBOARD_MAP: DashboardRow[] = [
  {
    capability: 'Generated / custom-field / registry columns',
    lives: 'Shell only',
    how: 'The shell resolves them to `ColumnDef`s (cell components baked in) and hands the array to `columns`.',
  },
  {
    capability: 'Typed filter editors, human-readable chip text',
    lives: 'Layered via slot',
    how: 'Injected through `filters.columns[].renderInput` / `formatChip`, or rendered into `toolbar(table)`.',
  },
  {
    capability: 'Faceted filters, global search, saved views, refresh',
    lives: 'Layered via slot',
    how: 'Rendered into `toolbar(table)`, a render-prop over the live table, driving `column.setFilterValue` and friends.',
  },
  {
    capability: 'Bulk actions (permissions, confirm, registry merge)',
    lives: 'Core chrome + slot',
    how: 'The core owns the overlay and cross-page selection cache; content comes from `bulkActions({ selection, table, clearSelection })`.',
  },
  {
    capability: 'Row actions, delete mutations',
    lives: 'Core slot',
    how: '`rowActions(row, { row, table })` appends the actions column; the mutation wiring stays in the shell.',
  },
  {
    capability: 'GraphQL, query pruning, URL sync, persistence',
    lives: 'Shell only',
    how: 'The shell owns all of it and feeds the core through the controlled pairs; the core never fetches, routes, or persists.',
  },
  {
    capability: 'Expanded rows, drag reorder, utility rows',
    lives: 'Layered via escape hatch',
    how: '`setTableOptions` mutates `TableOptions` before `useReactTable`, preserving the donor row-render seams.',
  },
];

type NotRow = { myth: string; reality: string };

const WHAT_ITS_NOT: NotRow[] = [
  {
    myth: 'A data fetcher',
    reality:
      'The route or loader owns the query. `rows` is the current page (server) or the full set (client); the core renders what it is handed.',
  },
  {
    myth: 'A URL-state owner',
    reality:
      'Controlled configs report intent through `onChange`; the consumer maps that to the URL. The core holds no route state.',
  },
  {
    myth: 'A persistence layer',
    reality:
      'Column visibility, page size, and saved views are persisted by the shell. The core forgets everything on unmount.',
  },
  {
    myth: 'A filter interpreter',
    reality:
      'Operator values are opaque. The core stores and renders them as chips; the backend decides what `contains` or `between` means.',
  },
  {
    myth: 'A consumer table shell',
    reality:
      'Registries, permissions, GraphQL, and extensions resolve in the shell before props reach the core. This is the presentation and interaction engine only.',
  },
];

// ── 1 · DataTable vs the primitives it composes ───────────────────────────────

export const WhenToReachForIt: Story = {
  name: '1 · DataTable vs composing the primitives',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Reach for DataTable when you need the engine"
        intro="DataTable is not a fourth primitive next to ListHeader, the Table atom, and TablePagination. It is the molecule that assembles all three around one TanStack instance. Reach for it when you need sorting, selection, filtering, column visibility, or server pagination over a real collection. Compose the primitives yourself only when you deliberately do not want that engine: a static grid the user only reads, or a paginated list with no columns to model."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
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
        title="The engine, or a plain Table"
        intro="A collection you interact with is a DataTable: pass rows and columns, switch on the capabilities you need, and the header, sort affordances, and footer come with it. A short reference grid you only read is the Table atom. Wrapping it in DataTable stands up a column model and selection cache for rows that never move."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="A products list with client sorting and a header: DataTable owns the sortable columns and the ListHeader title zone through the header slot."
          >
            <DataTable
              rows={PRODUCTS}
              columns={productColumns}
              getRowId={(p) => p.id}
              sorting={{ defaultValue: [], mode: 'client' }}
              header={
                <PageHeader>
                  <PageHeaderContent>
                    <PageHeaderTitle>Products</PageHeaderTitle>
                    <PageHeaderDescription>Everything in the catalog.</PageHeaderDescription>
                  </PageHeaderContent>
                </PageHeader>
              }
            />
          </Example>
          <Example
            verdict="dont"
            caption="Three fixed rows nobody sorts or selects. DataTable's engine is dead weight. Render the Table atom directly and keep the surface honest about what it does."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setting</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Currency</TableCell>
                  <TableCell>USD</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Weight unit</TableCell>
                  <TableCell>kg</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · capabilities are opt-in ───────────────────────────────────────────────

export const Capabilities: Story = {
  name: '2 · Capabilities are opt-in',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Presence of the config is the only switch"
        intro="Every capability is off until you pass its config, and passing the config turns on both the behavior and its chrome: `sorting` makes headers sortable, `rowSelection` adds the checkbox column, `pagination` renders the footer. There are no feature flags and no disabled placeholders. A capability you do not wire simply is not there. So wire only what a user can act on."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Capability</th>
                <th className="p-3 font-medium">Enable when</th>
                <th className="p-3 font-medium">Skip when</th>
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map(({ capability, enableWhen, skipWhen }) => (
                <tr key={capability} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{capability}</td>
                  <td className="p-3 text-xs">{enableWhen}</td>
                  <td className="text-muted-foreground p-3 text-xs">{skipWhen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Enable selection only when something acts on it"
        intro="Row selection exists to feed an action: a bulk overlay, or a row action that operates on the checked set. Wire `rowSelection` together with the thing that consumes it. Checkboxes with nowhere to go are a control that promises an action the table cannot perform."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Selection plus a bulkActions overlay: checking rows reveals archive and delete, so the checkboxes lead somewhere real."
          >
            <DataTable
              rows={PRODUCTS}
              columns={productColumns}
              getRowId={(p) => p.id}
              rowSelection={{ defaultValue: {} }}
              bulkActions={({ selection, clearSelection }) => (
                <>
                  <span className="text-sm font-medium">{selection.length} selected</span>
                  <Button size="sm" variant="outline">
                    <ArchiveIcon />
                    Archive
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2Icon />
                    Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    Clear
                  </Button>
                </>
              )}
            />
          </Example>
          <Example
            verdict="dont"
            caption="rowSelection wired with no bulkActions and no selection-consuming rowAction. The checkbox column renders, users tick rows, and nothing can ever act on them."
          >
            <DataTable
              rows={PRODUCTS}
              columns={productColumns}
              getRowId={(p) => p.id}
              rowSelection={{ defaultValue: {} }}
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · who owns the state ────────────────────────────────────────────────────

export const ControlledState: Story = {
  name: '3 · Who owns the state',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Controlled means the prop is the source of truth every render"
        intro="Each capability is either controlled, where you pass `value` and `onChange` and the prop drives every render, or uncontrolled, where you pass `defaultValue` and the core owns the state. Controlled is not a seed: the core reads `value` on every render, so pushing new state from the URL, a saved view, or a reset flows straight through. The consumer owns the URL, the fetching, and any persistence; DataTable renders the numbers it is handed and never fetches."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">State</th>
                <th className="p-3 font-medium">Typically</th>
                <th className="p-3 font-medium">Consumer's job</th>
              </tr>
            </thead>
            <tbody>
              {OWNERSHIP.map(({ state, controlled, job }) => (
                <tr key={state} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{state}</td>
                  <td className="p-3 text-xs">{controlled}</td>
                  <td className="text-muted-foreground p-3 text-xs">{job}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Control the state the URL owns; default only what is ephemeral"
        intro="If back/forward, a shareable link, or a saved view must reproduce the table, that state belongs in the URL and must be controlled: `value` bound to the route, `onChange` pushing to it. Reserve `defaultValue` for genuinely uncontrolled, ephemeral state (a client-only sort of an in-memory list). Using `defaultValue` for URL-owned state silently forks the table from the address bar."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Controlled sorting: `value` comes from the route (local state stands in here), `onChange` writes back. New sorts are shareable and survive navigation."
          >
            <ControlledSortingTable />
          </Example>
          <Example
            verdict="dont"
            caption="defaultValue seeds a sort the core then owns alone. The URL never learns about it, so a shared link and the back button both land on a differently-sorted table."
          >
            <DataTable
              rows={PRODUCTS}
              columns={productColumns}
              getRowId={(p) => p.id}
              sorting={{ defaultValue: [{ id: 'name', desc: false }], mode: 'client' }}
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 4 · relationship to consumer shells, and what it is not ───────────────────

export const DashboardRelationship: Story = {
  name: '4 · Consumer table shells, and what DataTable is not',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Consumer shells wrap this core; they do not replace it"
        intro="A richer application table is a shell around this molecule. Generated columns, registries, GraphQL, saved views, and permissions resolve in that shell and reach the core through props and slots: columns as `ColumnDef`s, everything else through `toolbar`, `bulkActions`, `rowActions`, and the `setTableOptions` escape hatch. The core stays the presentation and interaction engine; the data layer stays outside it."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Consumer capability</th>
                <th className="p-3 font-medium">Lives in</th>
                <th className="p-3 font-medium">How it reaches the core</th>
              </tr>
            </thead>
            <tbody>
              {DASHBOARD_MAP.map(({ capability, lives, how }) => (
                <tr key={capability} className="border-b align-top last:border-0">
                  <td className="p-3 text-xs">{capability}</td>
                  <td className="p-3 font-mono text-xs">{lives}</td>
                  <td className="text-muted-foreground p-3 text-xs">{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="What DataTable is not"
        intro="Keeping these outside the core is what lets one molecule serve multiple consumer surfaces. It renders and it interacts; it does not own data, routes, or persistence."
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

// ── 5 · the frame: card or plain ──────────────────────────────────────────────

export const FrameChoice: Story = {
  name: '5 · The frame: card or plain',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The card is the table's frame — never a second box"
        intro="DataTable renders its own card frame: a header band anchoring the controls, the rows flush to the card edges, and a footer band for pagination. The default frame=&quot;card&quot; is right everywhere the table stands on its own — list pages, detail-page blocks, sheets. Switch to frame=&quot;plain&quot; only when the table sits inside a card that already exists (a dashboard widget, an insights panel): the band structure stays, the chrome comes from the host. If you are wrapping a DataTable in a Card, you want plain — two frames is a box in a box."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="A widget card hosts the table with frame=&quot;plain&quot;: the host card is the only frame, and the rows still bleed to its edges."
          >
            <Card>
              <CardHeader>
                <CardTitle>Latest orders</CardTitle>
                <CardAction>
                  <Button variant="ghost" size="xs">
                    View all
                  </Button>
                </CardAction>
              </CardHeader>
              <DataTable
                rows={PRODUCTS.slice(0, 3)}
                columns={productColumns}
                getRowId={(p) => p.id}
                frame="plain"
              />
            </Card>
          </Example>
          <Example
            verdict="dont"
            caption="The default card frame inside another card draws a border and background inside a border and background — the box-in-box the frame exists to remove."
          >
            <Card>
              <CardHeader>
                <CardTitle>Latest orders</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  rows={PRODUCTS.slice(0, 3)}
                  columns={productColumns}
                  getRowId={(p) => p.id}
                />
              </CardContent>
            </Card>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
