import type { Meta, StoryObj } from '@storybook/react';
import { CircleSlashIcon, MoreHorizontalIcon, SearchIcon, StoreIcon } from 'lucide-react';
import { flexRender } from '@tanstack/react-table';
import { Fragment, useMemo, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { Card, CardAction, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import { ContextMenuItem, ContextMenuSeparator } from '../src/components/atoms/context-menu.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '../src/components/atoms/input-group.tsx';
import { TableCell, TableRow } from '../src/components/atoms/table.tsx';
import {
  type ColumnDef,
  type ColumnFiltersState,
  DataTable,
  type DataTableFilterColumn,
  type DataTableProps,
  DataTableRowLink,
  DataTableSkeletonLine,
  type RowSelectionState,
  type SortingState,
  type TableInstance,
  type VisibilityState,
} from '../src/components/molecules/data-table/data-table.tsx';
import { AnonymizedToken } from '../src/components/molecules/anonymized-token.tsx';
import { ElapsedTime } from '../src/components/molecules/elapsed-time.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import { Money } from '../src/components/molecules/money.tsx';
import { RelativeTime } from '../src/components/molecules/relative-time.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import { cn } from '../src/lib/utils.ts';
import type { Tone } from '../src/lib/state-dictionary.ts';

// Realistic commerce data: a page of orders, the canonical DataTable use case in
// a Vendure surface. `total` is in minor units (cents), rendered through <Money>.

type OrderState = 'PaymentSettled' | 'PaymentAuthorized' | 'Shipped' | 'Delivered' | 'Cancelled';

interface Order {
  id: string;
  code: string;
  customer: string;
  state: OrderState;
  items: number;
  total: number; // minor units (cents)
}

const STATE_TONE: Record<OrderState, 'success' | 'info' | 'progress' | 'neutral' | 'critical'> = {
  PaymentSettled: 'success',
  PaymentAuthorized: 'info',
  Shipped: 'progress',
  Delivered: 'neutral',
  Cancelled: 'critical',
};

const orders: Order[] = [
  {
    id: '1',
    code: 'ORD-1024',
    customer: 'Ada Lovelace',
    state: 'PaymentSettled',
    items: 3,
    total: 12900,
  },
  { id: '2', code: 'ORD-1025', customer: 'Grace Hopper', state: 'Shipped', items: 1, total: 4500 },
  {
    id: '3',
    code: 'ORD-1026',
    customer: 'Alan Turing',
    state: 'PaymentAuthorized',
    items: 5,
    total: 28750,
  },
  {
    id: '4',
    code: 'ORD-1027',
    customer: 'Katherine Johnson',
    state: 'Delivered',
    items: 2,
    total: 9900,
  },
  {
    id: '5',
    code: 'ORD-1028',
    customer: 'Margaret Hamilton',
    state: 'Cancelled',
    items: 4,
    total: 15400,
  },
  {
    id: '6',
    code: 'ORD-1029',
    customer: 'Barbara Liskov',
    state: 'PaymentSettled',
    items: 1,
    total: 3200,
  },
  {
    id: '7',
    code: 'ORD-1030',
    customer: 'Radia Perlman',
    state: 'Shipped',
    items: 6,
    total: 41200,
  },
  { id: '8', code: 'ORD-1031', customer: 'Hedy Lamarr', state: 'Delivered', items: 2, total: 7800 },
];

// A larger set for the pagination story.
const pagedOrders: Order[] = Array.from({ length: 43 }, (_, index) => {
  // The modulo keeps the index in bounds, which the indexed-access check can't see.
  const base = orders[index % orders.length] as Order;
  return {
    ...base,
    id: `p${index + 1}`,
    code: `ORD-${2000 + index}`,
  };
});

const columns: ColumnDef<Order>[] = [
  { accessorKey: 'code', header: 'Order' },
  { accessorKey: 'customer', header: 'Customer' },
  {
    accessorKey: 'state',
    header: 'Status',
    cell: ({ row }) => {
      const state = row.original.state;
      return <StatusBadge tone={STATE_TONE[state]}>{state}</StatusBadge>;
    },
  },
  {
    accessorKey: 'items',
    header: 'Items',
    cell: ({ row }) => <span className="tabular-nums">{row.original.items}</span>,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => <Money value={row.original.total} currency="USD" locale="en-US" />,
  },
];

const filterColumns: DataTableFilterColumn<Order>[] = [
  {
    id: 'code',
    label: 'Order',
    operators: ['contains'],
    formatChip: (value) => (
      <>
        Order <span className="text-muted-foreground">contains {String(value.contains)}</span>
      </>
    ),
  },
  {
    id: 'customer',
    label: 'Customer',
    operators: ['contains'],
    formatChip: (value) => (
      <>
        Customer <span className="text-muted-foreground">contains {String(value.contains)}</span>
      </>
    ),
  },
];

const meta = {
  title: 'Molecules/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  // Every story is render-based (DataTable is generic over the row type, which
  // args can't express), so these args exist only to satisfy the required-prop
  // contract of `Story`.
  args: {
    rows: orders,
    columns: columns as ColumnDef<unknown>[],
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Plain static table — no capability configs. All rows render, headers are
// passive labels, and an empty set falls back to "No results".
export const PlainTable: Story = {
  render: () => <DataTable<Order> rows={orders} columns={columns} getRowId={(order) => order.id} />,
};

// Server pagination — 1-based `page` owned by the story (as a URL would own it).
// `totalItems` reflects the full result; the story slices the current page.
export const ServerPagination: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const pageRows = useMemo(
      () => pagedOrders.slice((page - 1) * pageSize, page * pageSize),
      [page, pageSize],
    );
    return (
      <DataTable<Order>
        rows={pageRows}
        columns={columns}
        getRowId={(order) => order.id}
        pagination={{
          page,
          pageSize,
          totalItems: pagedOrders.length,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />
    );
  },
};

// No pagination — the footer vanishes entirely and every row renders.
export const NoPagination: Story = {
  render: () => <DataTable<Order> rows={orders} columns={columns} getRowId={(order) => order.id} />,
};

// Sorting absent — headers stay plain text, no sort button, no `aria-sort`.
export const SortingAbsent: Story = {
  render: () => <DataTable<Order> rows={orders} columns={columns} getRowId={(order) => order.id} />,
};

// Controlled sorting (client mode) — state lives in the story, so the tri-state
// header toggle actually reorders the rows in the canvas.
export const ControlledSorting: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'total', desc: true }]);
    return (
      <DataTable<Order>
        rows={orders}
        columns={columns}
        getRowId={(order) => order.id}
        sorting={{ value: sorting, onChange: setSorting, mode: 'client' }}
      />
    );
  },
};

// Loading — skeleton rows fill the body while `rows` is empty. `isLoading` never
// blanks populated rows, so a refetch with `keepPreviousData` stays stable.
export const Loading: Story = {
  render: () => (
    <DataTable<Order>
      rows={[]}
      columns={columns}
      getRowId={(order) => order.id}
      isLoading
      skeletonRowCount={6}
    />
  ),
};

/** Body row heights of the DataTable inside `[data-testid=testId]`. */
function bodyRowHeights(canvasElement: HTMLElement, testId: string) {
  return Array.from(
    within(canvasElement).getByTestId(testId).querySelectorAll('tbody [data-slot="table-row"]'),
    (row) => row.getBoundingClientRect().height,
  );
}

/** Compares loaded and loading rows row by row: the last row has no bottom border. */
async function expectSameRowHeights(canvasElement: HTMLElement, rowCount: number) {
  const loading = bodyRowHeights(canvasElement, 'loading');
  await expect(loading).toHaveLength(rowCount);
  await expect(loading).toEqual(bodyRowHeights(canvasElement, 'loaded'));
}

// One-line cells (text, Money) need no `skeletonCells`: the default loading
// line is one line box tall, so loaded (top) and loading (bottom) rows are the
// same height.
const oneLineColumns = columns.filter((column) => column.header !== 'Status');

export const LoadingMatchesOneLineRows: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div data-testid="loaded">
        <DataTable<Order> rows={orders.slice(0, 3)} columns={oneLineColumns} getRowId={(o) => o.id} />
      </div>
      <div data-testid="loading">
        <DataTable<Order>
          rows={[]}
          columns={oneLineColumns}
          getRowId={(o) => o.id}
          isLoading
          skeletonRowCount={3}
        />
      </div>
    </div>
  ),
  play: ({ canvasElement }) => expectSameRowHeights(canvasElement, 3),
};

const twoLineColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.customer}</span>
        <span className="text-muted-foreground text-xs">{row.original.code}</span>
      </div>
    ),
  },
  {
    accessorKey: 'state',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge tone={STATE_TONE[row.original.state]}>{row.original.state}</StatusBadge>
    ),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => <Money value={row.original.total} currency="USD" locale="en-US" />,
  },
];

// One skeleton line per text line; `text-xs` sizes the sub-line like the loaded one.
const twoLineSkeletons = {
  customer: (
    <div className="flex flex-col">
      <DataTableSkeletonLine className="w-36" />
      <DataTableSkeletonLine className="w-20 text-xs" />
    </div>
  ),
};

const twoLineRowActions = (order: Order) => (
  <Button variant="ghost" size="icon-sm">
    <MoreHorizontalIcon />
    <span className="sr-only">Open menu for {order.code}</span>
  </Button>
);

// A two-line cell (a title over a muted sub-line) is taller than one line, so it
// gets a `skeletonCells` entry; the badge and money columns keep the default.
// Loaded (top) and loading (bottom) rows are the same height.
export const LoadingMatchesRowShape: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div data-testid="loaded">
        <DataTable<Order>
          rows={orders.slice(0, 3)}
          columns={twoLineColumns}
          getRowId={(order) => order.id}
          rowSelection={{}}
          rowActions={twoLineRowActions}
        />
      </div>
      <div data-testid="loading">
        <DataTable<Order>
          rows={[]}
          columns={twoLineColumns}
          getRowId={(order) => order.id}
          rowSelection={{}}
          rowActions={twoLineRowActions}
          isLoading
          skeletonRowCount={3}
          skeletonCells={twoLineSkeletons}
        />
      </div>
    </div>
  ),
  play: ({ canvasElement }) => expectSameRowHeights(canvasElement, 3),
};

// Empty — no rows, not loading: a custom empty slot replaces the default cell.
export const Empty: Story = {
  render: () => (
    <DataTable<Order>
      rows={[]}
      columns={columns}
      getRowId={(order) => order.id}
      emptyState={
        <div className="text-muted-foreground py-6 text-sm">
          No orders match the current filters.
        </div>
      }
    />
  ),
};

// Row actions — a per-row menu appended as a trailing actions column. The first
// argument is `row.original`; the second gives the live TanStack row + table.
export const RowActions: Story = {
  render: () => (
    <DataTable<Order>
      rows={orders}
      columns={columns}
      getRowId={(order) => order.id}
      rowActions={(order) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontalIcon />
                <span className="sr-only">Open menu for {order.code}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View order</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Cancel order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  ),
};

// One action list, two triggers. `rowActions` renders the discoverable `...`
// button (keyboard- and touch-accessible); `contextActions` exposes the SAME
// actions on right-click of the whole row as a power-user accelerator. Driving
// both from a single `orderActions` list keeps the two menus from drifting.
const orderActions = (order: Order) => [
  { label: `View ${order.code}` },
  { label: 'Edit' },
  { label: 'Cancel order', destructive: true },
];

// Row actions reachable two ways — the trailing `...` button AND a right-click
// context menu on the row. Right-click any row to open the same menu.
export const RowActionsWithContextMenu: Story = {
  render: () => (
    <DataTable<Order>
      rows={orders}
      columns={columns}
      getRowId={(order) => order.id}
      rowActions={(order) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontalIcon />
                <span className="sr-only">Open menu for {order.code}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {orderActions(order).map((action) => (
              <Fragment key={action.label}>
                {action.destructive && <DropdownMenuSeparator />}
                <DropdownMenuItem variant={action.destructive ? 'destructive' : 'default'}>
                  {action.label}
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      contextActions={(order) =>
        orderActions(order).map((action) => (
          <Fragment key={action.label}>
            {action.destructive && <ContextMenuSeparator />}
            <ContextMenuItem variant={action.destructive ? 'destructive' : 'default'}>
              {action.label}
            </ContextMenuItem>
          </Fragment>
        ))
      }
    />
  ),
};

// Row selection + bulk actions — a controlled `RowSelectionState`, a leading
// checkbox column, and replace-on-select: while rows are selected the bulk bar
// takes the controls row's place in the header band (select a row to watch the
// search input and Columns trigger swap out); clearing the selection restores them.
export const RowSelection: Story = {
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({});
    return (
      <DataTable<Order>
        rows={orders}
        columns={columns}
        getRowId={(order) => order.id}
        rowSelection={{ value: selection, onChange: setSelection }}
        toolbar={
          <InputGroup className="flex-1">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <SearchIcon />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="Search orders" />
          </InputGroup>
        }
        columnVisibility={{ defaultValue: {} }}
        bulkActions={({ selection: selected, clearSelection }) => (
          <>
            <span className="text-sm font-medium">{selected.length} selected</span>
            <Button variant="outline" size="sm">
              Mark as shipped
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </>
        )}
      />
    );
  },
};

// Column visibility — a controlled `VisibilityState` and the "Columns" column picker.
// Toggling an item hides its column live; the checkbox column is never listed.
export const ColumnVisibility: Story = {
  render: () => {
    const [visibility, setVisibility] = useState<VisibilityState>({ items: false });
    return (
      <DataTable<Order>
        rows={orders}
        columns={columns}
        getRowId={(order) => order.id}
        header={
          <PageHeader>
            <PageHeaderContent>
              <PageHeaderTitle>Orders</PageHeaderTitle>
              <PageHeaderDescription>Choose which columns to show.</PageHeaderDescription>
            </PageHeaderContent>
          </PageHeader>
        }
        columnVisibility={{ value: visibility, onChange: setVisibility }}
      />
    );
  },
};

// Toolbar with everything — search, the add-filter menu and the column picker.
// The column picker stays at the end of the row; the search takes the slack.
export const ToolbarWithSearchFiltersAndColumns: Story = {
  render: () => {
    const [filters, setFilters] = useState<ColumnFiltersState>([]);
    return (
      <DataTable<Order>
        rows={orders}
        columns={columns}
        getRowId={(order) => order.id}
        header={
          <PageHeader>
            <PageHeaderContent>
              <PageHeaderTitle>Orders</PageHeaderTitle>
              <PageHeaderDescription>Search, filter and choose columns.</PageHeaderDescription>
            </PageHeaderContent>
          </PageHeader>
        }
        toolbar={
          <InputGroup className="flex-1">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <SearchIcon />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="Search orders" />
          </InputGroup>
        }
        filters={{ value: filters, onChange: setFilters, columns: filterColumns }}
        columnVisibility={{ defaultValue: {} }}
      />
    );
  },
};

// Add filter and Columns with no search input: Add filter stays at the start
// of the row, the column picker at the end.
export const ToolbarWithFiltersAndColumns: Story = {
  render: () => {
    const [filters, setFilters] = useState<ColumnFiltersState>([]);
    return (
      <DataTable<Order>
        rows={orders}
        columns={columns}
        getRowId={(order) => order.id}
        header={
          <PageHeader>
            <PageHeaderContent>
              <PageHeaderTitle>Orders</PageHeaderTitle>
              <PageHeaderDescription>Filter and choose columns.</PageHeaderDescription>
            </PageHeaderContent>
          </PageHeader>
        }
        filters={{ value: filters, onChange: setFilters, columns: filterColumns }}
        columnVisibility={{ defaultValue: {} }}
      />
    );
  },
};

// Filters with applied chips — a controlled `ColumnFiltersState` seeded with one
// filter, the core add-filter menu (from `filters.columns`), and the chip row.
// An applied filter is a `Chip` with `onRemove`, by decision — not a FilterChip.
export const FiltersWithAppliedChips: Story = {
  render: () => {
    const [filters, setFilters] = useState<ColumnFiltersState>([
      { id: 'customer', value: { contains: 'Ada' } },
    ]);
    return (
      <DataTable<Order>
        rows={orders}
        columns={columns}
        getRowId={(order) => order.id}
        header={
          <PageHeader>
            <PageHeaderContent>
              <PageHeaderTitle>Orders</PageHeaderTitle>
              <PageHeaderDescription>Filter with the chip row.</PageHeaderDescription>
            </PageHeaderContent>
            <PageHeaderActions>
              <Button>New order</Button>
            </PageHeaderActions>
          </PageHeader>
        }
        toolbar={
          <InputGroup className="flex-1">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <SearchIcon />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="Search orders" />
          </InputGroup>
        }
        filters={{
          value: filters,
          onChange: setFilters,
          columns: filterColumns,
          inlineChipLimit: 2,
        }}
      />
    );
  },
};

// footerRows — presentational rows appended after the data rows: the
// order-detail totals shape. They render only alongside real rows (never with
// the skeleton or empty states) and ignore selection, sorting, and pagination.
export const FooterRows: Story = {
  render: () => {
    const items = orders.slice(0, 4);
    const subtotal = items.reduce((sum, order) => sum + order.total, 0);
    const shipping = 950;
    return (
      <DataTable<Order>
        rows={items}
        columns={columns}
        getRowId={(order) => order.id}
        footerRows={({ columnCount }) => (
          <>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount - 1} className="text-muted-foreground text-right">
                Subtotal
              </TableCell>
              <TableCell>
                <Money value={subtotal} currency="USD" locale="en-US" />
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount - 1} className="text-muted-foreground text-right">
                Shipping
              </TableCell>
              <TableCell>
                <Money value={shipping} currency="USD" locale="en-US" />
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount - 1} className="text-right font-medium">
                Total
              </TableCell>
              <TableCell className="font-medium">
                <Money value={subtotal + shipping} currency="USD" locale="en-US" />
              </TableCell>
            </TableRow>
          </>
        )}
      />
    );
  },
};

// onTableReady — capture the referentially stable TanStack table instance for
// controls that live OUTSIDE the DataTable (saved-view controls, an external
// toolbar) without rendering a slot just to reach the table. The callback fires
// once after mount; the captured instance stays live, so the external "Clear
// sorting" button drives the same table the header sort toggles do.
export const OnTableReady: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'total', desc: true }]);
    const [table, setTable] = useState<TableInstance<Order> | null>(null);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={sorting.length === 0}
            onClick={() => table?.resetSorting()}
          >
            Clear sorting
          </Button>
        </div>
        <DataTable<Order>
          rows={orders}
          columns={columns}
          getRowId={(order) => order.id}
          sorting={{ value: sorting, onChange: setSorting, mode: 'client' }}
          onTableReady={setTable}
        />
      </div>
    );
  },
};

// frame="plain" — the same band structure without the card chrome, for a table
// embedded in an existing card (dashboard-widget shape): the host card is the
// frame, and the table still bleeds to its edges.
export const PlainFrame: Story = {
  render: () => (
    <Card className="w-[640px]">
      <CardHeader>
        <CardTitle>Latest orders</CardTitle>
        <CardAction>
          <Button variant="ghost" size="xs">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <DataTable<Order>
        rows={orders.slice(0, 5)}
        columns={columns}
        getRowId={(order) => order.id}
        frame="plain"
      />
    </Card>
  ),
};

// Cell text lines up with its header text, also in styled cells. Each styled
// atom (StatusBadge, Badge, Button, IdChip) sets `--content-inset`, the
// distance from its box to its first letter, and the cell pulls it back by
// that much. The Status chips' 27px inset reaches past the cell padding, so
// that column indents its header and its plain "Draft" cell instead: no chip
// leaves its cell. The name comes first and the status directly after it, so
// no chip sits against the card border. The Hidden chip sits one wrapper deep, as in a tooltip
// trigger. The Channel column mixes a Badge with an icon and plain text. The
// play function measures every column, row by row.
interface Product {
  id: string;
  name: string;
  state: 'Live' | 'Hidden' | 'Draft';
  channel: string | null;
  sku: string;
}

const products: Product[] = [
  { id: 'prod_8f2k1m9qz4', name: 'Laptop Stand', state: 'Live', channel: 'Default', sku: 'LS-001' },
  { id: 'prod_3n7c0w2yx8', name: 'USB-C Hub', state: 'Hidden', channel: null, sku: 'HUB-07' },
  { id: 'prod_5t9b4r6vd1', name: 'Desk Lamp', state: 'Draft', channel: 'Outlet', sku: 'DL-220' },
];

const alignmentColumns: ColumnDef<Product>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'state',
    header: 'Status',
    cell: ({ row }) =>
      row.original.state === 'Draft' ? (
        <span className="text-muted-foreground">Draft</span>
      ) : row.original.state === 'Hidden' ? (
        // One wrapper deep, as inside a tooltip trigger: the chip still lines up.
        <span className="inline-flex">
          <StatusBadge tone="neutral">Hidden</StatusBadge>
        </span>
      ) : (
        <StatusBadge tone="success">Live</StatusBadge>
      ),
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ row }) =>
      row.original.channel ? (
        <Badge>
          <StoreIcon data-icon="inline-start" />
          {row.original.channel}
        </Badge>
      ) : (
        'None'
      ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    enableSorting: false,
    cell: ({ row }) => <Badge variant="outline">{row.original.sku}</Badge>,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    enableSorting: false,
    cell: ({ row }) => <IdChip value={row.original.id} />,
  },
  {
    id: 'variants',
    header: 'Variants',
    enableSorting: false,
    cell: () => (
      <Button variant="outline" size="sm">
        Edit variants
      </Button>
    ),
  },
];

// The left edge of the first visible letter in an element. Screen-reader-only
// and aria-hidden text does not count: nobody sees it.
function textLeft(element: Element): number {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent?.trim() &&
      !node.parentElement?.closest('.sr-only, [aria-hidden="true"]')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const node = walker.nextNode();
  if (!node?.textContent) throw new Error(`No visible text in ${element.outerHTML}`);
  const range = document.createRange();
  const start = node.textContent.search(/\S/);
  range.setStart(node, start);
  range.setEnd(node, start + 1);
  return range.getBoundingClientRect().left;
}

export const CellTextAlignment: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([]);
    return (
      <DataTable<Product>
        rows={products}
        columns={alignmentColumns}
        getRowId={(product) => product.id}
        sorting={{ value: sorting, onChange: setSorting, mode: 'client' }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const headers = [...canvasElement.querySelectorAll('thead th')];
    await expect(headers).toHaveLength(alignmentColumns.length);
    for (const row of canvasElement.querySelectorAll('tbody tr')) {
      const cells = [...row.querySelectorAll('td')];
      for (const [index, cell] of cells.entries()) {
        const header = headers[index] as Element;
        const offset = textLeft(cell) - textLeft(header);
        await expect(Math.abs(offset), `${header.textContent}: ${cell.textContent}`).toBeLessThanOrEqual(0.5);
        // Nothing leaves its cell: the content box (also one wrapper deep)
        // starts inside the cell.
        const first = cell.firstElementChild;
        // In the first column the chip keeps the card inset clear, less one
        // gutter (the cell's end padding).
        const style = getComputedStyle(cell);
        const indent = Number.parseFloat(cell.style.getPropertyValue('--column-indent')) || 0;
        const padding = Number.parseFloat(style.paddingLeft) - indent;
        const clear = padding - Math.min(padding, Number.parseFloat(style.paddingRight));
        for (const content of [first, first?.firstElementChild]) {
          if (!content) continue;
          const offset = content.getBoundingClientRect().left - cell.getBoundingClientRect().left;
          await expect(offset, `${header.textContent} box`).toBeGreaterThanOrEqual(clear - 0.5);
        }
      }
    }
  },
};

// Product variants: every row opens its variant. The name is a DataTableRowLink,
// whose link covers the row; the SKU copy chip, the select checkbox, the
// Product link and the actions menu sit above it and keep their own action.
interface Variant {
  id: string;
  name: string;
  sku: string;
  enabled: boolean;
  price: number; // minor units (cents)
  product: { id: string; name: string };
}

const variants: Variant[] = [
  {
    id: '1',
    name: 'Laptop 13 inch 8GB',
    sku: 'L2201308',
    enabled: true,
    price: 155880,
    product: { id: 'laptop', name: 'Laptop' },
  },
  {
    id: '2',
    name: 'Laptop 15 inch 8GB',
    sku: 'L2201508',
    enabled: true,
    price: 167880,
    product: { id: 'laptop', name: 'Laptop' },
  },
  {
    id: '3',
    name: 'Tablet 32GB',
    sku: 'TBL200032',
    enabled: false,
    price: 39480,
    product: { id: 'tablet', name: 'Tablet' },
  },
  {
    id: '4',
    name: 'Wireless Optical Mouse',
    sku: '834444',
    enabled: true,
    price: 2279,
    product: { id: 'mouse', name: 'Wireless Optical Mouse' },
  },
];

const variantColumns: ColumnDef<Variant>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <DataTableRowLink href={`#/variants/${row.original.id}`}>{row.original.name}</DataTableRowLink>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <IdChip
        value={row.original.sku}
        truncate="none"
        reveal="row"
        copyLabel="Copy SKU"
      />
    ),
  },
  {
    accessorKey: 'enabled',
    header: 'Status',
    cell: ({ row }) =>
      row.original.enabled ? (
        <StatusBadge tone="success" reveal="row">
          Enabled
        </StatusBadge>
      ) : (
        <StatusBadge tone="neutral">Disabled</StatusBadge>
      ),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => <Money value={row.original.price} currency="USD" locale="en-US" />,
  },
  {
    id: 'product',
    header: 'Product',
    cell: ({ row }) => (
      <a
        href={`#/products/${row.original.product.id}`}
        className="underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
      >
        {row.original.product.name}
      </a>
    ),
  },
];

function stubClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async () => {} },
  });
}

// The topmost element at the centre of `element`, as a real pointer hits it.
function hitAt(element: Element): Element {
  const box = element.getBoundingClientRect();
  const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  if (!hit) throw new Error(`Nothing at the centre of ${element.outerHTML}`);
  return hit;
}

// `userEvent.click` moves a pointer onto the element first and never moves it
// off. On a copy chip that hover can open the chip's tooltip, and only a
// pointer leaving the chip closes it again. The test runner's real mouse never
// entered the chip, so after the play function it cannot close that tooltip.
async function clickCopyChip(chip: Element) {
  await userEvent.click(chip);
  await userEvent.unhover(chip);
}

function clearHash() {
  history.replaceState(null, '', `${location.pathname}${location.search}`);
}

/**
 * The whole row opens the item. Render a `DataTableRowLink` around the name:
 * a click on any point of the row opens it, and the row has one tab stop. A
 * chevron appears at the end of a hovered or focused row. The SKU chip copies,
 * the checkbox selects, the Product link opens the product and the `...` menu
 * opens; none of them opens the variant. The test runner also presses the
 * price text with a real mouse and expects the variant to open.
 */
export const RowLink: Story = {
  parameters: { pressRowText: { text: '$1,678.80', expectHash: '#/variants/2' } },
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({});
    return (
      <DataTable<Variant>
        rows={variants}
        columns={variantColumns}
        getRowId={(variant) => variant.id}
        rowSelection={{ value: selection, onChange: setSelection }}
        rowActions={(variant) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontalIcon />
                  <span className="sr-only">Open menu for {variant.name}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete variant</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    stubClipboard();
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Laptop 13 inch 8GB' });
    const row = link.closest('tr') as HTMLTableRowElement;
    const rowCanvas = within(row);
    clearHash();

    await step('one link per row, named by the item name', async () => {
      for (const tableRow of canvasElement.querySelectorAll('tbody tr')) {
        await expect(tableRow.querySelectorAll('[data-slot=data-table-row-link]')).toHaveLength(1);
      }
      await expect(row.querySelector('[data-slot=data-table-row-chevron]')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    await step('a click on plain cell text opens the item', async () => {
      const hit = hitAt(rowCanvas.getByText('$1,558.80'));
      await expect(hit).toBe(link);
      await userEvent.click(hit);
      await expect(location.hash).toBe('#/variants/1');
      clearHash();
    });

    await step('a click on a row-revealed status badge opens the item', async () => {
      // Row 2 holds no focus, so its badge rests transparent, which gives it
      // its own stacking context.
      const secondLink = canvas.getByRole('link', { name: 'Laptop 15 inch 8GB' });
      const secondRow = within(secondLink.closest('tr') as HTMLTableRowElement);
      await expect(hitAt(secondRow.getByText('Enabled'))).toBe(secondLink);
    });

    await step('the SKU chip copies and does not open the item', async () => {
      const hit = hitAt(rowCanvas.getByText('L2201308'));
      await expect(hit).toBe(rowCanvas.getByRole('button', { name: 'Copy SKU L2201308' }));
      await clickCopyChip(hit);
      await expect(location.hash).toBe('');
    });

    await step('the Product link opens the product', async () => {
      const product = rowCanvas.getByRole('link', { name: 'Laptop' });
      await expect(hitAt(product)).toBe(product);
      await userEvent.click(product);
      await expect(location.hash).toBe('#/products/laptop');
      clearHash();
    });

    await step('the checkbox selects and does not open the item', async () => {
      // The cell re-renders on selection, so query the checkbox each time.
      const checkbox = () => canvas.getByRole('checkbox', { name: 'Select row 1' });
      await expect(hitAt(checkbox()).closest('[data-slot=checkbox]')).toBe(checkbox());
      await userEvent.click(checkbox());
      await waitFor(() => expect(checkbox()).toHaveAttribute('aria-checked', 'true'));
      await expect(location.hash).toBe('');
      await userEvent.click(checkbox());
      await waitFor(() => expect(checkbox()).toHaveAttribute('aria-checked', 'false'));
    });

    await step('the actions menu opens and does not open the item', async () => {
      const trigger = canvas.getByRole('button', { name: 'Open menu for Laptop 13 inch 8GB' });
      await expect(hitAt(trigger).closest('button')).toBe(trigger);
      await userEvent.click(trigger);
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
      await expect(location.hash).toBe('');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    });
  },
};

// Access tokens: every row opens its token. The token preview is an
// AnonymizedToken, which copies from any point of the chip, as IdChip does.
interface AccessToken {
  id: string;
  name: string;
  token: string;
  lastUsed: string;
}

const accessTokens: AccessToken[] = [
  { id: 'ci', name: 'CI deploys', token: 'vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7', lastUsed: 'Today' },
  { id: 'staging', name: 'Staging sync', token: 'vc_pat_2bH4kL6nP8rT0vX3zB5dF7hJ9mQ1sU4wY6', lastUsed: 'Yesterday' },
];

const accessTokenColumns: ColumnDef<AccessToken>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <DataTableRowLink href={`#/tokens/${row.original.id}`}>{row.original.name}</DataTableRowLink>
    ),
  },
  {
    accessorKey: 'token',
    header: 'Token',
    cell: ({ row }) => (
      <AnonymizedToken
        value={row.original.token}
        copyLabel={`Copy ${row.original.name} token`}
        copiedLabel="Token copied"
      />
    ),
  },
  { accessorKey: 'lastUsed', header: 'Last used' },
];

/**
 * An AnonymizedToken in a linked row copies from any point of the chip and
 * does not open the row. The test runner presses the token text with a real
 * mouse (`pressText`) and expects the copy and no navigation.
 */
export const RowLinkWithToken: Story = {
  parameters: { pressText: { text: 'vc_pat_7...5dE7', expectButton: 'Token copied' } },
  render: () => (
    <DataTable<AccessToken>
      rows={accessTokens}
      columns={accessTokenColumns}
      getRowId={(token) => token.id}
    />
  ),
  play: async ({ canvasElement }) => {
    stubClipboard();
    const canvas = within(canvasElement);
    const row = within(
      canvas.getByRole('link', { name: 'CI deploys' }).closest('tr') as HTMLTableRowElement,
    );
    clearHash();
    const hit = hitAt(row.getByText('vc_pat_7...5dE7'));
    await expect(hit).toBe(row.getByRole('button', { name: 'Copy CI deploys token' }));
    await clickCopyChip(hit);
    await expect(location.hash).toBe('');
  },
};

// Orders: the order code is both the row's name and the key people look an
// order up by. The visible code is an IdChip with `reveal="row"`; the
// DataTableRowLink holds the code as screen-reader text only, so the row keeps
// one link named by the code. A click on the chip copies; a click anywhere
// else opens the order.
interface OrderRow {
  code: string;
  customer: string;
  state: OrderState;
  total: number; // minor units (cents)
}

const orderRows: OrderRow[] = [
  { code: 'YVWJLP9HGJHH7EVK', customer: 'Trevor Donnelly', state: 'PaymentSettled', total: 37000 },
  { code: 'AX3KCVNM39QM6R1A', customer: 'Hilario Thompson', state: 'PaymentAuthorized', total: 3999 },
  { code: '314NGLFNXPVUXEBN', customer: 'Eliezer Kulas', state: 'Shipped', total: 34600 },
];

const orderRowColumns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <>
        <DataTableRowLink href={`#/orders/${row.original.code}`}>
          <span className="sr-only">{row.original.code}</span>
        </DataTableRowLink>
        <IdChip
          value={row.original.code}
          truncate="none"
          reveal="row"
          copyLabel="Copy order code"
        />
      </>
    ),
  },
  { accessorKey: 'customer', header: 'Customer' },
  {
    accessorKey: 'state',
    header: 'State',
    cell: ({ row }) => (
      <StatusBadge tone={STATE_TONE[row.original.state]}>{row.original.state}</StatusBadge>
    ),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => <Money value={row.original.total} currency="USD" locale="en-US" />,
  },
];

/**
 * A lookup key that names the row. The order code is the item's name and the
 * key people search by, so it shows as an IdChip with `reveal="row"`: plain
 * text at rest, a copy chip on row hover or focus. The DataTableRowLink holds
 * the code as `sr-only` text, so the row keeps one link named by the code and
 * its end chevron. A click on the chip copies and the row does not open; a
 * click anywhere else opens the order. The test runner presses the customer
 * name with a real mouse and expects the order to open.
 */
export const LookupKeyNamesTheRow: Story = {
  parameters: {
    pressRowText: { text: 'Hilario Thompson', expectHash: '#/orders/AX3KCVNM39QM6R1A' },
  },
  render: () => (
    <DataTable<OrderRow> rows={orderRows} columns={orderRowColumns} getRowId={(order) => order.code} />
  ),
  play: async ({ canvasElement, step }) => {
    stubClipboard();
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'YVWJLP9HGJHH7EVK' });
    const row = within(link.closest('tr') as HTMLTableRowElement);
    clearHash();

    await step('the row has one link, named by the code', async () => {
      await expect(link.closest('tr')?.querySelectorAll('a')).toHaveLength(1);
    });

    await step('a click on the code copies and does not open the order', async () => {
      const hit = hitAt(row.getByText('YVWJLP9HGJHH7EVK', { selector: 'code, span:not(.sr-only)' }));
      await expect(hit).toBe(row.getByRole('button', { name: 'Copy order code YVWJLP9HGJHH7EVK' }));
      await clickCopyChip(hit);
      await expect(location.hash).toBe('');
    });

    await step('a click anywhere else opens the order', async () => {
      await expect(hitAt(row.getByText('Trevor Donnelly'))).toBe(link);
    });
  },
};

/**
 * Keyboard selection: Space toggles the focused checkbox and focus stays on
 * it, so a keyboard user selects several rows with Space and Tab. The
 * selection and the row actions are passed inline, as most consumers do; the
 * cells must not remount when the selection changes.
 */
export const KeyboardSelection: Story = {
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({});
    return (
      <DataTable<Variant>
        rows={variants}
        columns={variantColumns}
        getRowId={(variant) => variant.id}
        rowSelection={{ value: selection, onChange: setSelection }}
        rowActions={(variant) => (
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontalIcon />
            <span className="sr-only">Open menu for {variant.name}</span>
          </Button>
        )}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // Query live each time: a remounted checkbox is a new DOM node.
    const checkbox = (name: string) => canvas.getByRole('checkbox', { name });
    // Press Space on a checkbox, wait for the new state, and expect the same
    // node to be in the document and focused.
    const toggleWithSpace = async (name: string, checked: 'true' | 'false') => {
      const before = checkbox(name);
      before.focus();
      await userEvent.keyboard(' ');
      await waitFor(() => expect(checkbox(name)).toHaveAttribute('aria-checked', checked));
      await expect(document.activeElement).toBe(checkbox(name));
      await expect(checkbox(name)).toBe(before);
    };
    // Cells that must survive a selection change as the same DOM nodes.
    const survivors = [
      canvas.getByRole('link', { name: 'Laptop 13 inch 8GB' }),
      canvas.getByRole('button', { name: 'Copy SKU L2201308' }),
      canvas.getAllByText('Enabled')[0] as HTMLElement,
      canvas.getByRole('button', { name: 'Open menu for Laptop 13 inch 8GB' }),
    ];

    await step('Space toggles a row checkbox and keeps focus on it', async () => {
      await toggleWithSpace('Select row 1', 'true');
    });

    await step('Tab moves on from the toggled checkbox to the next stop in its row', async () => {
      await userEvent.tab();
      await expect(document.activeElement).toBe(survivors[0]);
    });

    await step('a second row is added with Space', async () => {
      await toggleWithSpace('Select row 2', 'true');
      await expect(checkbox('Select row 1')).toHaveAttribute('aria-checked', 'true');
    });

    await step('Space on select all keeps focus on it', async () => {
      await toggleWithSpace('Select all rows', 'true');
      await toggleWithSpace('Select all rows', 'false');
    });

    await step('other cells do not remount on a selection change', async () => {
      for (const node of survivors) await expect(node.isConnected).toBe(true);
    });

    // Leave the toggled checkbox focused and checked for the screenshot.
    await toggleWithSpace('Select row 1', 'true');
  },
};

// Selection motion. This table has no toolbar, so the bulk bar opens a band of
// its own: the band eases its height open on the first selection and closed
// on the last, and the rows glide instead of jumping. Each selected row draws
// a brand-colour bar on its leading edge. The bar grows from where it touches
// a selected row: down from a selected row above, up from one below, from both
// ends when it closes a gap, and out from its middle when it touches none.
// Alone it also fades in and widens against the edge; next to a selection it
// only extends, so the line has no seam.
// Deselecting plays the same motion backwards. The play function selects rows
// 2 and 4, so rows 1, 3, 5 and 7 show each case's starting clip.
export const SelectionMotion: Story = {
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({});
    return (
      <DataTable<Order>
        rows={orders}
        columns={columns}
        getRowId={(order) => order.id}
        rowSelection={{ value: selection, onChange: setSelection }}
        bulkActions={({ selection: selected, clearSelection }) => (
          <>
            <span className="text-sm font-medium">{selected.length} selected</span>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </>
        )}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rows = () => [...canvasElement.querySelectorAll<HTMLElement>('tbody tr')];
    const clips = (row: HTMLElement) => [
      getComputedStyle(row, '::before').clipPath,
      getComputedStyle(row, '::after').clipPath,
    ];
    const FULL = ['inset(0px 0px calc(50% - 0.5px))', 'inset(calc(50% - 0.5px) 0px 0px)'];

    await step('selecting rows 2 and 4 opens the bulk band', async () => {
      await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 2' }));
      await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 4' }));
      await expect(await canvas.findByText('2 selected')).toBeVisible();
    });

    await step('a selected row shows the whole bar in the brand colour', async () => {
      const row = rows()[1] as HTMLElement;
      await waitFor(() => expect(clips(row)).toEqual(FULL));
      // Resolve the token through a probe, so both sides use the computed form.
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--brand-indicator)';
      row.append(probe);
      const brand = getComputedStyle(probe).backgroundColor;
      probe.remove();
      await expect(getComputedStyle(row, '::before').backgroundColor).toBe(brand);
      await expect(getComputedStyle(row, '::after').backgroundColor).toBe(brand);
    });

    await step('each unselected row starts its bar where it touches a selection', async () => {
      const [below, , gap, , above, , alone] = rows() as HTMLElement[];
      await waitFor(() => {
        // A selected row below: both halves start at the bottom.
        expect(clips(below as HTMLElement)).toEqual(['inset(100% 0px 0px)', 'inset(100% 0px 0px)']);
        // Selected rows on both sides: the halves start at their own ends.
        expect(clips(gap as HTMLElement)).toEqual(['inset(0px 0px 100%)', 'inset(100% 0px 0px)']);
        // A selected row above: both halves start at the top.
        expect(clips(above as HTMLElement)).toEqual(['inset(0px 0px 100%)', 'inset(0px 0px 100%)']);
        // No selected neighbour: both halves start in the middle.
        expect(clips(alone as HTMLElement)).toEqual(['inset(50% 0px)', 'inset(50% 0px)']);
      });
    });

    await step('a bar that grows alone fades and widens in; one that extends a selection does not', async () => {
      const [below, selected, gap, , above, , alone] = rows() as HTMLElement[];
      const look = (row: HTMLElement) =>
        ['::before', '::after'].map((part) => {
          const style = getComputedStyle(row, part);
          return `${style.opacity} ${style.scale}`;
        });
      await waitFor(() => {
        // At rest a selected bar has no opacity or scale of its own.
        expect(look(selected as HTMLElement)).toEqual(['1 none', '1 none']);
        // Next to a selection the bar starts opaque and full width: no seam.
        for (const row of [below, gap, above]) expect(look(row as HTMLElement)).toEqual(['1 none', '1 none']);
        // Alone it starts transparent and half as wide.
        expect(look(alone as HTMLElement)).toEqual(['0 0.5 1', '0 0.5 1']);
      });
    });
  },
};

// Select all and clear all from the header checkbox ripple down the page, row
// by row: the bar grows down from the header as one line, and each row's fill
// and checkbox follow it. Clear all retracts it in the same order, quicker. A
// page of 50 rows ripples as fast as one of 10. Reduced motion: no ripple. The
// header checkbox's tooltip says what a press does: select all on this page,
// or clear the selection on this page. One page of 10 or 50 rows, so both
// sizes can be compared. With a header, the bulk bar replaces the header
// controls, as on a list page, and the rows stay put.
// A row the consumer renders itself, as a draggable row does: it sets its own
// inline `transform` and `opacity`, takes the ripple from `ctx.ripple` and each
// cell's classes from `ctx.cellProps`. The ripple timing is custom properties
// only, so spreading it first loses nothing.
const renderCustomRippleRow: NonNullable<DataTableProps<Order>['renderRow']> = (
  row,
  { ripple, cellProps },
) => (
  <TableRow
    data-custom-row=""
    data-state={row.getIsSelected() ? 'selected' : undefined}
    className={cn('group/row', ripple.className)}
    style={{ ...ripple.style, transform: 'translate3d(0, 0, 0)', opacity: 1 }}
  >
    {row.getVisibleCells().map((cell) => (
      // The table hands over each cell's classes: the zero-width select cell,
      // the leading cell's checkbox gutter, the content inset. None is copied.
      <TableCell key={cell.id} {...cellProps(cell.column.id)}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </TableCell>
    ))}
  </TableRow>
);

function RippleTable({ count, custom = false }: { count: number; custom?: boolean }) {
  const [selection, setSelection] = useState<RowSelectionState>({});
  const rows = useMemo(() => pagedOrders.concat(pagedOrders).slice(0, count), [count]);
  return (
    <DataTable<Order>
      rows={rows}
      renderRow={custom ? renderCustomRippleRow : undefined}
      columns={columns}
      getRowId={(order, index) => `${order.id}-${index}`}
      header={
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>Orders</PageHeaderTitle>
          </PageHeaderContent>
        </PageHeader>
      }
      rowSelection={{ value: selection, onChange: setSelection }}
      bulkActions={({ selection: selected, clearSelection }) => (
        <>
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear
          </Button>
        </>
      )}
    />
  );
}

// Where each row starts in the ripple: its bar's transition delay, in ms.
const rippleStarts = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll<HTMLElement>('tbody tr')].map((row) => {
    const delay = getComputedStyle(row, '::before').transitionDelay;
    return delay.endsWith('ms') ? Number.parseFloat(delay) : Number.parseFloat(delay) * 1000;
  });

// Select all starts at the top row and travels down, and its last row starts
// within `normal` (200ms) however many rows the page has. Clear all takes the
// same order within `fast` (100ms).
const playSelectAllRipple: Story['play'] = async ({ canvasElement, step, parameters }) => {
  const canvas = within(canvasElement);
  const expectedCustomRows = parameters.customRows as number | undefined;
  const table = canvasElement.querySelector('table[data-slot=table]') as HTMLElement;
  const expectRipple = (starts: number[], ceiling: number) => {
    expect(starts[0]).toBe(0);
    expect(starts[1]).toBeGreaterThan(0);
    for (let index = 1; index < starts.length; index++) {
      expect(starts[index]).toBeGreaterThanOrEqual(starts[index - 1] as number);
    }
    expect(Math.max(...starts)).toBeLessThanOrEqual(ceiling);
  };

  if (expectedCustomRows != null) {
    await step('the rows are the consumer\'s own, each with its own inline transform', async () => {
      const customRows = canvasElement.querySelectorAll<HTMLElement>('tbody tr[data-custom-row]');
      await expect(customRows).toHaveLength(expectedCustomRows);
      for (const row of customRows) {
        await expect(row.style.transform).toBe('translate3d(0px, 0px, 0px)');
        await expect(row.style.getPropertyValue('--ripple-at')).not.toBe('');
      }
    });
  }

  await step('select all ripples down from the header checkbox', async () => {
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }));
    await expect(table).toHaveAttribute('data-select-ripple', 'select');
    expectRipple(rippleStarts(canvasElement), 200);
  });

  await step('clear all ripples down in half the time', async () => {
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }));
    await expect(table).toHaveAttribute('data-select-ripple', 'clear');
    expectRipple(rippleStarts(canvasElement), 100);
  });

  await step('the ripple ends, and a row click is not delayed', async () => {
    await waitFor(() => expect(table).not.toHaveAttribute('data-select-ripple'));
    await expect(Math.max(...rippleStarts(canvasElement))).toBe(0);
  });

  if (expectedCustomRows != null) {
    await step('the custom rows kept their own transform through the ripple', async () => {
      for (const row of canvasElement.querySelectorAll<HTMLElement>('tbody tr[data-custom-row]')) {
        await expect(row.style.transform).toBe('translate3d(0px, 0px, 0px)');
      }
    });
  }
};

export const SelectAllRipple10: Story = {
  name: 'Select all ripple · 10 rows',
  render: () => <RippleTable count={10} />,
  play: playSelectAllRipple,
};

export const SelectAllRipple50: Story = {
  name: 'Select all ripple · 50 rows',
  render: () => <RippleTable count={50} />,
  play: playSelectAllRipple,
};

// Rows the consumer renders through `renderRow` take the same ripple from
// `ctx.ripple`: the same order from the top, within the same 200ms and 100ms.
// Each row sets its own inline `transform` and `opacity`, as a draggable row
// does, and keeps them. A row that ignores `ctx.ripple` changes at once.
export const SelectAllRippleCustomRows10: Story = {
  name: 'Select all ripple · custom rows · 10 rows',
  parameters: { customRows: 10 },
  render: () => <RippleTable count={10} custom />,
  play: playSelectAllRipple,
};

export const SelectAllRippleCustomRows50: Story = {
  name: 'Select all ripple · custom rows · 50 rows',
  parameters: { customRows: 50 },
  render: () => <RippleTable count={50} custom />,
  play: playSelectAllRipple,
};

// Body row heights for RowBarHeights: odd, even and fractional, as real rows
// have (a thumbnail, a wrapped line, a zoomed page).
const BAR_ROW_CONTENT_HEIGHTS = [24, 25, 23.5, 30, 24, 25, 24];

// Resolves a computed clip-path inset edge (`50%`, `0px`, `calc(50% - 0.5px)`)
// to pixels along a row of the given height.
function insetEdgePx(edge: string, height: number) {
  const calc = edge.match(/^calc\(([\d.]+)% ([+-]) ([\d.]+)px\)$/);
  if (calc) {
    const [, percent, sign, px] = calc;
    return (height * Number(percent)) / 100 + (sign === '-' ? -1 : 1) * Number(px);
  }
  if (edge.endsWith('%')) return (height * Number.parseFloat(edge)) / 100;
  return Number.parseFloat(edge);
}

/**
 * The bar on a selected row is one unbroken line for every row height: odd,
 * even and fractional, one row selected alone and several selected next to
 * each other. The bar is drawn as two halves; where they meet they overlap
 * by a pixel, so a row of an odd height has no lighter 1px notch in the
 * middle. The test measures the overlap in pixels.
 */
export const RowBarHeights: Story = {
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({
      '1': true,
      '2': true,
      '3': true,
      '5': true,
    });
    const rows = orders.slice(0, BAR_ROW_CONTENT_HEIGHTS.length);
    return (
      <DataTable<Order>
        rows={rows}
        columns={[
          { accessorKey: 'code', header: 'Order' },
          {
            accessorKey: 'customer',
            header: 'Customer',
            cell: ({ row }) => (
              <div
                className="flex items-center"
                style={{ height: BAR_ROW_CONTENT_HEIGHTS[row.index] }}
              >
                {row.original.customer}
              </div>
            ),
          },
        ]}
        getRowId={(order) => order.id}
        rowSelection={{ value: selection, onChange: setSelection }}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('tbody tr')];

    await step('the rows have odd, even and fractional heights', async () => {
      const heights = rows.map((row) => row.getBoundingClientRect().height);
      await expect(heights.some((h) => Number.isInteger(h) && h % 2 === 1)).toBe(true);
      await expect(heights.some((h) => Number.isInteger(h) && h % 2 === 0)).toBe(true);
      await expect(heights.some((h) => !Number.isInteger(h))).toBe(true);
    });

    await step('on every selected row the two halves overlap by at least 1px', async () => {
      for (const row of rows.filter((r) => r.dataset.state === 'selected')) {
        const height = row.getBoundingClientRect().height;
        const top = getComputedStyle(row, '::before').clipPath.match(/^inset\((.+)\)$/)?.[1];
        const bottom = getComputedStyle(row, '::after').clipPath.match(/^inset\((.+)\)$/)?.[1];
        // Computed form of `inset(a b c d)` drops repeated values: read the
        // top edge of the bottom half and the bottom edge of the top half.
        const edges = (inset: string) => {
          const parts = inset.split(/ (?![^(]*\))/);
          const [t = '0px', r = t, b = t] = parts;
          return { top: t, bottom: b, right: r };
        };
        const topHalfEnd = height - insetEdgePx(edges(top ?? '').bottom, height);
        const bottomHalfStart = insetEdgePx(edges(bottom ?? '').top, height);
        await expect(topHalfEnd - bottomHalfStart).toBeGreaterThanOrEqual(1);
      }
    });
  },
};

/**
 * While rows are selected, a click on a row selects it or deselects it and
 * does not open the item, so many rows can be selected fast. Shift+click
 * selects the range from the last clicked row. The name still opens the item:
 * with a click (see NameOpensWhileSelecting), the keyboard (Enter), and
 * Cmd/Ctrl+click or a middle click (new tab). Row controls keep their own action, and the row hides its
 * chevron while rows are selected. With nothing selected, the row opens the
 * item as before (the test runner checks that with a real mouse press).
 */
export const ClickSelectsWhileSelecting: Story = {
  parameters: { pressRowText: { text: '$1,678.80', expectHash: '#/variants/2' } },
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({});
    return (
      <DataTable<Variant>
        rows={variants}
        columns={variantColumns}
        getRowId={(variant) => variant.id}
        rowSelection={{ value: selection, onChange: setSelection }}
        rowActions={(variant) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontalIcon />
                  <span className="sr-only">Open menu for {variant.name}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    stubClipboard();
    const canvas = within(canvasElement);
    // One session, so a held Shift or Control applies to the next click.
    const user = userEvent.setup();
    const checkbox = (n: number) => canvas.getByRole('checkbox', { name: `Select row ${n}` });
    const checked = (n: number) => checkbox(n).getAttribute('aria-checked') === 'true';
    const rowOf = (n: number) => checkbox(n).closest('tr') as HTMLTableRowElement;
    // A plain cell of row n, hit-tested: the stretched link sits over it.
    const cellHit = (n: number) => {
      const cell = rowOf(n).querySelector('[data-column-id=price]') as Element;
      return hitAt(cell);
    };
    clearHash();

    await step('with nothing selected, a click on a row opens it', async () => {
      await userEvent.click(cellHit(1));
      await expect(location.hash).toBe('#/variants/1');
      clearHash();
    });

    await step('while a row is selected, a click on another row selects it', async () => {
      await userEvent.click(checkbox(1));
      await waitFor(() => expect(checked(1)).toBe(true));
      await userEvent.click(cellHit(2));
      await waitFor(() => expect(checked(2)).toBe(true));
      await expect(location.hash).toBe('');
    });

    await step('a second click on the row deselects it', async () => {
      await userEvent.click(cellHit(2));
      await waitFor(() => expect(checked(2)).toBe(false));
      await expect(location.hash).toBe('');
    });

    await step('Shift+click selects the range from the last clicked row', async () => {
      await userEvent.click(cellHit(2));
      await waitFor(() => expect(checked(2)).toBe(true));
      await user.keyboard('{Shift>}');
      await user.click(cellHit(4));
      await user.keyboard('{/Shift}');
      await waitFor(() => expect([checked(2), checked(3), checked(4)]).toEqual([true, true, true]));
      await expect(location.hash).toBe('');
    });

    await step('the row hides its chevron while rows are selected', async () => {
      const chevron = rowOf(1).querySelector('[data-slot=data-table-row-chevron]') as Element;
      await expect(getComputedStyle(chevron).display).toBe('none');
    });

    await step('Cmd or Ctrl+click on the name still opens the link', async () => {
      const link = rowOf(3).querySelector('[data-slot=data-table-row-link]') as HTMLElement;
      let prevented: boolean | undefined;
      // Read the outcome after React has handled the click, then stop the new tab.
      const record = (event: MouseEvent) => {
        prevented = event.defaultPrevented;
        event.preventDefault();
      };
      window.addEventListener('click', record, { once: true });
      await user.keyboard('{Control>}');
      await user.click(link);
      await user.keyboard('{/Control}');
      await expect(prevented).toBe(false);
      await expect(checked(3)).toBe(true);
    });

    await step('Enter on the name still opens the item', async () => {
      const link = rowOf(3).querySelector('[data-slot=data-table-row-link]') as HTMLElement;
      link.focus();
      await userEvent.keyboard('{Enter}');
      await expect(location.hash).toBe('#/variants/3');
      await expect(checked(3)).toBe(true);
      clearHash();
    });

    await step('row controls keep their own action', async () => {
      const trigger = within(rowOf(1)).getByRole('button', { name: /^Open menu for/ });
      await userEvent.click(trigger);
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
      await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Duplicate' }));
      await expect(checked(1)).toBe(true);
      await expect(location.hash).toBe('');
    });

    // Clear the selection, so the runner's real mouse press checks that a row
    // opens again once nothing is selected.
    await step('with the selection cleared, a click opens the row again', async () => {
      // Every row is selected by now, so one click on "Select all" clears them.
      const all = canvas.getByRole('checkbox', { name: 'Select all rows' });
      await expect(all).toHaveAttribute('aria-checked', 'true');
      await userEvent.click(all);
      await waitFor(() => expect(all).toHaveAttribute('aria-checked', 'false'));
      const chevron = rowOf(1).querySelector('[data-slot=data-table-row-chevron]') as Element;
      await expect(getComputedStyle(chevron).display).not.toBe('none');
    });
  },
};

/**
 * While rows are selected, the item's name still opens the item: a click on
 * the name opens it, a click anywhere else on the row selects the row.
 * Hovering the row shows a small chevron after the name; hovering or focusing
 * the name colours it and the chevron blue (`info-text`) and moves the
 * chevron 2px. The chevron takes no space, so the name and the column do not
 * move. With nothing selected the whole row opens the item, as before. The
 * cell that opens the item is the one with `DataTableRowLink` around the name.
 * The test runner presses the name of row 2 and then its price with a real
 * mouse: the first opens the item, the second selects the row.
 */
export const NameOpensWhileSelecting: Story = {
  parameters: {
    pressRowText: { text: 'Laptop 15 inch 8GB', expectHash: '#/variants/2' },
    pressSelectsRow: { text: '$1,678.80', expectChecked: 'Select row 2' },
  },
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({});
    return (
      <DataTable<Variant>
        rows={variants}
        columns={variantColumns}
        getRowId={(variant) => variant.id}
        rowSelection={{ value: selection, onChange: setSelection }}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const checkbox = (n: number) => canvas.getByRole('checkbox', { name: `Select row ${n}` });
    const checked = (n: number) => checkbox(n).getAttribute('aria-checked') === 'true';
    const rowOf = (n: number) => checkbox(n).closest('tr') as HTMLTableRowElement;
    const nameOf = (n: number) =>
      rowOf(n).querySelector('[data-slot=data-table-row-link]') as HTMLElement;
    const markOf = (n: number) =>
      rowOf(n).querySelector('[data-slot=data-table-row-link-mark] svg') as SVGElement;
    const priceHit = (n: number) =>
      hitAt(rowOf(n).querySelector('[data-column-id=price]') as Element);
    const size = (element: Element) => {
      const box = element.getBoundingClientRect();
      return `${box.width}x${box.height}`;
    };
    clearHash();
    const nameSize = size(nameOf(3));
    const cellSize = size(nameOf(3).closest('td') as Element);

    await step('with nothing selected, the name link covers the row and no chevron shows', async () => {
      await expect(getComputedStyle(nameOf(3), '::after').display).not.toBe('none');
      await expect(getComputedStyle(markOf(3)).opacity).toBe('0');
    });

    await step('while a row is selected, only the name is the link', async () => {
      await user.click(checkbox(1));
      await waitFor(() => expect(checked(1)).toBe(true));
      await expect(getComputedStyle(nameOf(3), '::after').display).toBe('none');
      await expect(nameOf(3)).toHaveAttribute('href', '#/variants/3');
    });

    await step('the chevron takes no space: the name and its cell keep their size', async () => {
      await expect(size(nameOf(3))).toBe(nameSize);
      await expect(size(nameOf(3).closest('td') as Element)).toBe(cellSize);
    });

    await step('a click on the name opens the item and keeps the selection', async () => {
      await user.click(nameOf(3));
      await expect(location.hash).toBe('#/variants/3');
      await expect([checked(1), checked(3)]).toEqual([true, false]);
      clearHash();
    });

    await step('a click anywhere else on the row selects it', async () => {
      await user.click(priceHit(3));
      await waitFor(() => expect(checked(3)).toBe(true));
      await expect(location.hash).toBe('');
    });

    await step('Shift+click on a name extends the selection', async () => {
      await user.keyboard('{Shift>}');
      await user.click(nameOf(4));
      await user.keyboard('{/Shift}');
      await waitFor(() => expect(checked(4)).toBe(true));
      await expect(location.hash).toBe('');
    });

    await step('the name is the next tab stop after the checkbox, and Enter opens it', async () => {
      checkbox(2).focus();
      await user.tab();
      await expect(document.activeElement).toBe(nameOf(2));
      await expect(canvas.getByRole('link', { name: 'Laptop 15 inch 8GB' })).toBe(nameOf(2));
      await user.keyboard('{Enter}');
      await expect(location.hash).toBe('#/variants/2');
      await expect(checked(2)).toBe(false);
      clearHash();
      nameOf(2).blur();
    });
  },
};

// A square product thumbnail, as a list's featured asset cell shows it. Inline,
// so the story loads no image.
const THUMBNAIL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'%3E%3Crect width='50' height='50' fill='%23d4d4d8'/%3E%3C/svg%3E";

const productRowColumns: ColumnDef<Variant>[] = [
  {
    id: 'featuredAsset',
    header: () => <span className="sr-only">Featured asset</span>,
    cell: () => <img alt="" src={THUMBNAIL} width={50} height={50} className="rounded-sm" />,
  },
  variantColumns[0] as ColumnDef<Variant>,
  variantColumns[1] as ColumnDef<Variant>,
  variantColumns[2] as ColumnDef<Variant>,
];

/**
 * A product list inside an app shell, built as the Vendure Dashboard builds
 * it: a thumbnail cell, the name as the row link, a copy chip and a row menu,
 * in a `<main tabindex="-1">` (the skip link target). While a row is selected,
 * a click on the thumbnail, beside the name or on a plain cell selects the row
 * and does not open it; the copy chip and the row menu keep their own action.
 * The test runner presses the name of row 2 with a real mouse and expects it
 * to open the item.
 */
export const ClickSelectsInAppShell: Story = {
  parameters: { pressRowText: { text: 'Laptop 15 inch 8GB', expectHash: '#/variants/2' } },
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({ '1': true });
    return (
      <main tabIndex={-1} className="outline-none">
        <DataTable<Variant>
          rows={variants}
          columns={productRowColumns}
          getRowId={(variant) => variant.id}
          rowSelection={{ value: selection, onChange: setSelection }}
          rowActions={(variant) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu for {variant.name}</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </main>
    );
  },
  play: async ({ canvasElement, step }) => {
    stubClipboard();
    const canvas = within(canvasElement);
    const checkbox = (n: number) => canvas.getByRole('checkbox', { name: `Select row ${n}` });
    const checked = (n: number) => checkbox(n).getAttribute('aria-checked') === 'true';
    const rowOf = (n: number) => checkbox(n).closest('tr') as HTMLTableRowElement;
    const cellHit = (n: number, column: string) =>
      hitAt(rowOf(n).querySelector(`[data-column-id=${column}]`) as Element);
    clearHash();
    await expect(checked(1)).toBe(true);

    // The centre of the name cell is beside the name, not on it.
    for (const column of ['featuredAsset', 'name', 'enabled']) {
      await step(`a click on the ${column} cell selects the row, a second click deselects it`, async () => {
        await userEvent.click(cellHit(3, column));
        await waitFor(() => expect(checked(3)).toBe(true));
        await expect(location.hash).toBe('');
        await userEvent.click(cellHit(3, column));
        await waitFor(() => expect(checked(3)).toBe(false));
        await expect(location.hash).toBe('');
      });
    }

    await step('the copy chip copies and does not select', async () => {
      await clickCopyChip(within(rowOf(4)).getByRole('button', { name: 'Copy SKU 834444' }));
      await expect(checked(4)).toBe(false);
      await expect(location.hash).toBe('');
    });

    await step('the row menu opens and does not select', async () => {
      const trigger = within(rowOf(4)).getByRole('button', { name: /^Open menu for/ });
      await userEvent.click(trigger);
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
      await expect(checked(4)).toBe(false);
    });
  },
};

/**
 * The click area of a select checkbox is its whole cell: the full row height,
 * from the table's start edge to where the next cell's content starts, for
 * the row checkboxes and for select-all. The checkbox looks the same, and
 * keyboard focus stays on it. Here the next cell is a thumbnail, as on a
 * product list. The test runner presses each corner of the slot with a real
 * mouse and expects each press to toggle the checkbox, never to open the row.
 */
export const SelectCellClickArea: Story = {
  parameters: { pressSelectCell: { checkbox: 'Select row 2', header: 'Select all rows' } },
  render: () => {
    const [selection, setSelection] = useState<RowSelectionState>({});
    return (
      <DataTable<Variant>
        rows={variants}
        columns={productRowColumns}
        getRowId={(variant) => variant.id}
        rowSelection={{ value: selection, onChange: setSelection }}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Select row 2' });
    const area = (checkbox.closest('td') as HTMLElement).querySelector(
      '[data-slot=data-table-select-area]',
    ) as HTMLElement;

    await step('the click area is not a tab stop', async () => {
      await expect(area).toHaveAttribute('aria-hidden', 'true');
      await expect(area.tabIndex).toBe(-1);
    });

    await step('a click on the area toggles the row, focus stays where it was', async () => {
      await userEvent.click(area);
      await waitFor(() => expect(checkbox).toHaveAttribute('aria-checked', 'true'));
      await userEvent.click(area);
      await waitFor(() => expect(checkbox).toHaveAttribute('aria-checked', 'false'));
      await expect(location.hash).toBe('');
    });

    await step('Space on the focused checkbox still toggles it', async () => {
      checkbox.focus();
      await userEvent.keyboard(' ');
      await waitFor(() => expect(checkbox).toHaveAttribute('aria-checked', 'true'));
      await userEvent.keyboard(' ');
      await waitFor(() => expect(checkbox).toHaveAttribute('aria-checked', 'false'));
      checkbox.blur();
    });
  },
};

// A deployments table: every row has a status, so the status is the tone icon
// and a neutral label, with the one time that matters for the state under it.
// A live or waiting state counts up every second; a finished state shows when
// it finished, relative to now; a state that continues shows how long it has
// lasted. The exact times are in a tooltip on the time, which is a tab stop,
// so the table needs no Duration or Created column.

type DeploymentTiming =
  | { kind: 'live'; started: number }
  | { kind: 'waiting'; queued: number }
  | { kind: 'finished'; started: number; finished: number }
  | { kind: 'since'; since: number };

interface Deployment {
  id: string;
  name: string;
  status: string;
  tone: Tone;
  icon?: React.ReactNode;
  environment: string;
  timing: DeploymentTiming;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const LOADED = Date.now();

const deployments: Deployment[] = [
  {
    id: 'ready',
    name: 'feat: add a minimal Vendure Cloud app',
    status: 'Ready',
    tone: 'success',
    environment: 'Production',
    timing: { kind: 'finished', started: LOADED - 2 * MINUTE - 42 * SECOND, finished: LOADED - 2 * MINUTE },
  },
  {
    id: 'building',
    name: 'build: move @vendure/core to devDependencies',
    status: 'Building',
    tone: 'progress',
    environment: 'Preview',
    timing: { kind: 'live', started: LOADED - 75 * SECOND },
  },
  {
    id: 'deploying',
    name: 'feat: add a deploy hook to the CLI',
    status: 'Deploying',
    tone: 'progress',
    environment: 'Preview',
    timing: { kind: 'live', started: LOADED - 31 * SECOND },
  },
  {
    id: 'queued',
    name: 'docs: refresh README branding',
    status: 'Queued',
    tone: 'neutral',
    environment: 'Preview',
    timing: { kind: 'waiting', queued: LOADED - 9 * MINUTE - 4 * SECOND },
  },
  {
    id: 'failed',
    name: 'fix: type the server app from @vendure/core',
    status: 'Failed',
    tone: 'critical',
    environment: 'Production',
    timing: { kind: 'finished', started: LOADED - 63 * MINUTE, finished: LOADED - 62 * MINUTE },
  },
  {
    id: 'canceled',
    name: 'revert: undo the Vendure Cloud build changes',
    status: 'Canceled',
    tone: 'neutral',
    icon: <CircleSlashIcon />,
    environment: 'Preview',
    timing: { kind: 'finished', started: LOADED - DAY - 8 * SECOND, finished: LOADED - DAY },
  },
  {
    id: 'degraded',
    name: 'chore: bump the worker plugin to 3.1',
    status: 'Degraded',
    tone: 'warning',
    environment: 'Production',
    timing: { kind: 'since', since: LOADED - 13 * DAY },
  },
];

// The second line: the one time that matters for the state. Each time opens
// its own tooltip with the exact times, beside the status block, and is a tab
// stop: StatusBadge's `detail` sets both.
// The words around a time belong to the app, so they are translated with the
// rest of the page. German puts its word after the duration ("13 Tage lang"):
// "seit" would need the dative ("seit 13 Tagen"), which a unit formatter does
// not give.
interface DeploymentWords {
  waiting: (time: React.ReactNode) => React.ReactNode;
  lasting: (time: React.ReactNode) => React.ReactNode;
}

const englishWords: DeploymentWords = {
  waiting: (time) => <>Waiting {time}</>,
  lasting: (time) => <>for {time}</>,
};

function DeploymentTime({
  timing,
  words = englishWords,
}: {
  timing: DeploymentTiming;
  words?: DeploymentWords;
}) {
  switch (timing.kind) {
    case 'live':
      return <ElapsedTime since={timing.started} tooltip />;
    case 'waiting':
      return words.waiting(<ElapsedTime since={timing.queued} tooltip />);
    case 'finished':
      return <RelativeTime value={timing.finished} start={timing.started} />;
    case 'since':
      return words.lasting(<RelativeTime value={timing.since} display="duration" />);
  }
}

const deploymentColumns: ColumnDef<Deployment>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        appearance="icon"
        tone={row.original.tone}
        icon={row.original.icon}
        detail={<DeploymentTime timing={row.original.timing} />}
      >
        {row.original.status}
      </StatusBadge>
    ),
  },
  { accessorKey: 'environment', header: 'Environment' },
];

// The left edge of the first rendered letter of an element.
function textStart(element: Element): number {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().left;
}

/**
 * A deployments table: one row per state, two of them live. The status is the
 * tone icon and a neutral label, and the second line holds the one time that
 * matters for the state: a count for Building, Deploying and Queued, how long
 * ago a finished deployment finished, and how long Degraded has lasted. Hover
 * or focus a time for the exact times: when a count started, or when a
 * finished deployment ran and how long it took. The tooltip opens beside the
 * status, so the label stays readable.
 */
export const Deployments: Story = {
  render: () => (
    <DataTable<Deployment>
      rows={deployments}
      columns={deploymentColumns}
      getRowId={(deployment) => deployment.id}
      frame="card"
    />
  ),
  play: async ({ canvasElement, step }) => {
    const badges = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-slot=status-badge][data-detail]'),
    ];

    await step('every row shows a two-line status', async () => {
      await expect(badges).toHaveLength(deployments.length);
    });

    await step('the icon is centred against both lines (0 ±0.5px)', async () => {
      for (const badge of badges) {
        const icon = (
          badge.querySelector('[data-slot=status-badge-marker] svg') as SVGElement
        ).getBoundingClientRect();
        const label = (
          badge.querySelector('[data-slot=status-badge-label]') as HTMLElement
        ).getBoundingClientRect();
        const detail = (
          badge.querySelector('[data-slot=status-badge-detail]') as HTMLElement
        ).getBoundingClientRect();
        const blockMiddle = (label.top + detail.bottom) / 2;
        const iconMiddle = (icon.top + icon.bottom) / 2;
        await expect(Math.abs(iconMiddle - blockMiddle)).toBeLessThanOrEqual(0.5);
      }
    });

    await step('a row with a two-line status is 46px high, with its divider', async () => {
      // The last row has no divider.
      for (const badge of badges.slice(0, -1)) {
        const row = badge.closest('tr') as HTMLElement;
        await expect(Math.abs(row.getBoundingClientRect().height - 46)).toBeLessThanOrEqual(0.5);
      }
    });

    await step('every time is a tab stop that opens its tooltip', async () => {
      for (const badge of badges) {
        const detail = badge.querySelector('[data-slot=status-badge-detail]') as HTMLElement;
        const time = detail.querySelector('time') as HTMLElement;
        await expect(time.tabIndex).toBe(0);
        await expect(time.hasAttribute('data-base-ui-tooltip-trigger')).toBe(true);
      }
    });

    await step('the tooltip opens beside the status: its label, its time and the rows next to it stay readable', async () => {
      const overlaps = (a: DOMRect, b: DOMRect) =>
        a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      // The first, a middle and the last row.
      for (const index of [0, 3, badges.length - 1]) {
        const badge = badges[index] as HTMLElement;
        const time = badge.querySelector('[data-slot=status-badge-detail] time') as HTMLElement;
        await userEvent.hover(time);
        const popup = await waitFor(
          () => {
            const node = document.querySelector<HTMLElement>('[data-slot=tooltip-content][data-open]');
            if (!node) throw new Error('no tooltip yet');
            return node;
          },
          { timeout: 2000 },
        );
        await waitFor(() => expect(popup.hasAttribute('data-starting-style')).toBe(false));
        const tip = popup.getBoundingClientRect();
        const label = badge.querySelector('[data-slot=status-badge-label]') as HTMLElement;
        await expect(overlaps(tip, label.getBoundingClientRect())).toBe(false);
        await expect(overlaps(tip, time.getBoundingClientRect())).toBe(false);
        for (const neighbour of [badges[index - 1], badges[index + 1]]) {
          if (neighbour) await expect(overlaps(tip, neighbour.getBoundingClientRect())).toBe(false);
        }
        // It starts after the status block, centred on it (0 ±0.5px).
        const block = badge.getBoundingClientRect();
        await expect(tip.left).toBeGreaterThanOrEqual(block.right);
        await expect(
          Math.abs((tip.top + tip.bottom) / 2 - (block.top + block.bottom) / 2),
        ).toBeLessThanOrEqual(0.5);
        await userEvent.unhover(time);
      }
    });

    await step('the label lines up with the header, the time with the label', async () => {
      const header = [...canvasElement.querySelectorAll('thead th')].find(
        (th) => th.textContent === 'Status',
      ) as HTMLElement;
      const headerStart = textStart(header);
      for (const badge of badges) {
        const label = badge.querySelector('[data-slot=status-badge-label]') as HTMLElement;
        const detail = badge.querySelector('[data-slot=status-badge-detail]') as HTMLElement;
        await expect(Math.abs(textStart(label) - headerStart)).toBeLessThanOrEqual(0.5);
        await expect(Math.abs(textStart(detail) - textStart(label))).toBeLessThanOrEqual(0.5);
      }
    });

    await step('a live timer counts up', async () => {
      const timer = canvasElement.querySelector('[data-slot=elapsed-time]') as HTMLElement;
      const before = timer.getAttribute('datetime');
      await waitFor(() => expect(timer.getAttribute('datetime')).not.toBe(before), {
        timeout: 2500,
      });
    });
  },
};

const germanStatus: Record<string, string> = {
  ready: 'Bereit',
  building: 'Wird gebaut',
  deploying: 'Wird ausgerollt',
  queued: 'In der Warteschlange',
  failed: 'Fehlgeschlagen',
  canceled: 'Abgebrochen',
  degraded: 'Eingeschränkt',
};

const germanWords: DeploymentWords = {
  waiting: (time) => <>Wartet {time}</>,
  lasting: (time) => <>{time} lang</>,
};

const germanColumns: ColumnDef<Deployment>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        appearance="icon"
        tone={row.original.tone}
        icon={row.original.icon}
        detail={<DeploymentTime timing={row.original.timing} words={germanWords} />}
      >
        {germanStatus[row.original.id]}
      </StatusBadge>
    ),
  },
  { accessorKey: 'environment', header: 'Umgebung' },
];

/**
 * The deployments table in German. Every time takes its language from the
 * FormatProvider: the count, how long ago, how long a state has lasted and
 * the tooltip. The words around a time ("Wartet", "lang") are the app's.
 */
export const DeploymentsInGerman: Story = {
  render: () => (
    <FormatProvider locale="de-DE">
      <DataTable<Deployment>
        rows={deployments}
        columns={germanColumns}
        getRowId={(deployment) => deployment.id}
        frame="card"
      />
    </FormatProvider>
  ),
  play: async ({ canvasElement, step }) => {
    // innerText leaves out the hidden accessible descriptions.
    const details = canvasElement.querySelectorAll<HTMLElement>('[data-slot=status-badge-detail]');
    const detail = (id: string) =>
      details[deployments.findIndex((deployment) => deployment.id === id)]?.innerText ?? '';

    await step('every time is in German', async () => {
      await expect(detail('degraded')).toMatch(/^13 Tage lang$/);
      await expect(detail('failed')).toMatch(/^vor 1 Stunde$/);
      await waitFor(() => expect(detail('queued')).toMatch(/^Wartet 9\s?Min/));
    });
  },
};
