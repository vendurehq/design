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
        copyLabel={`Copy SKU of ${row.original.name}`}
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
      await expect(hit).toBe(rowCanvas.getByRole('button', { name: 'Copy SKU of Laptop 13 inch 8GB' }));
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
      canvas.getByRole('button', { name: 'Copy SKU of Laptop 13 inch 8GB' }),
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
