import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
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
import {
  type ColumnDef,
  type ColumnFiltersState,
  DataTable,
  type DataTableFilterColumn,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '../src/components/molecules/data-table/data-table.tsx';
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
  const base = orders[index % orders.length];
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
// checkbox column, and an overlay that surfaces the selection to `bulkActions`.
export const RowSelection: Story = {
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

// Column visibility — a controlled `VisibilityState` and the "Columns" gear.
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
              <PageHeaderDescription>Toggle columns from the gear.</PageHeaderDescription>
            </PageHeaderContent>
          </PageHeader>
        }
        columnVisibility={{ value: visibility, onChange: setVisibility }}
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
