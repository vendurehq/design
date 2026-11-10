import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontalIcon, SearchIcon, StoreIcon } from 'lucide-react';
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
  DataTableRowLink,
  DataTableSkeletonLine,
  type RowSelectionState,
  type SortingState,
  type TableInstance,
  type VisibilityState,
} from '../src/components/molecules/data-table/data-table.tsx';
import { AnonymizedToken } from '../src/components/molecules/anonymized-token.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import { Money } from '../src/components/molecules/money.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

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
// leaves its cell, and in the first column no chip enters the card inset. The Hidden chip sits one wrapper deep, as in a tooltip
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
  { accessorKey: 'name', header: 'Name' },
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
    id: 'variants',
    header: 'Variants',
    enableSorting: false,
    cell: () => (
      <Button variant="outline" size="sm">
        Edit variants
      </Button>
    ),
  },
  {
    accessorKey: 'id',
    header: 'ID',
    enableSorting: false,
    cell: ({ row }) => <IdChip value={row.original.id} />,
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
      await userEvent.click(hit);
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
}

const accessTokens: AccessToken[] = [
  { id: 'ci', name: 'CI deploys', token: 'vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7' },
  { id: 'staging', name: 'Staging sync', token: 'vc_pat_2bH4kL6nP8rT0vX3zB5dF7hJ9mQ1sU4wY6' },
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
    await userEvent.click(hit);
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
      await userEvent.click(hit);
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
    const FULL = ['inset(0px 0px 50%)', 'inset(50% 0px 0px)'];

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
  },
};

/**
 * While rows are selected, a click on a row selects it or deselects it and
 * does not open the item, so many rows can be selected fast. Shift+click
 * selects the range from the last clicked row. The name link still opens the
 * item with the keyboard (Enter) and with Cmd/Ctrl+click or a middle click
 * (new tab). Row controls keep their own action, and the row hides its
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
