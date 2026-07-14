import type {
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  HeaderContext,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  Table,
  TableOptions,
  VisibilityState,
} from '@tanstack/react-table';
import type * as React from 'react';

// Pure type module for the DataTable molecule. Kept runtime-free so it can be
// imported by both `data-table.tsx` and its sub-components without an import
// cycle. `data-table.tsx` re-exports everything here (plus the consumer-facing
// TanStack types) so columns can be authored from a single import.

/**
 * Controlled OR uncontrolled, per capability. `value` present → controlled: the
 * prop is the source of truth on every render (no internal seeding). `defaultValue`
 * → uncontrolled: the core seeds its own state and `onChange` (if given) only
 * observes. Never mix `value` with `defaultValue`.
 */
export type ControlledState<T> =
  | { value: T; onChange: OnChangeFn<T>; defaultValue?: never }
  | { value?: never; onChange?: OnChangeFn<T>; defaultValue?: T };

/* --- capability configs; PRESENCE of the config is the only feature switch --- */

export type DataTableSorting = ControlledState<SortingState> & {
  /** 'server' (default) → manualSorting, emit only. 'client' → TanStack sorts `rows`. */
  mode?: 'server' | 'client';
};

export type DataTableColumnVisibility = ControlledState<VisibilityState> & {
  /**
   * Defaults to true. Set false when a consumer renders its own column-settings
   * control through `toolbar(table)` while the core still consumes visibility.
   */
  showViewOptions?: boolean;
};

export type DataTableRowSelection<TData> = ControlledState<RowSelectionState> & {
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  /** Display-column id for the generated selection column. Default: 'select'. */
  selectColumnId?: string;
};

/**
 * 1-based, mirrors the Phase-1 `TablePagination` (composed verbatim). Always
 * controlled via `page`/`onPageChange` — no `defaultValue` branch, because page
 * is typically URL-owned.
 */
export interface DataTablePagination {
  mode?: 'server' | 'client'; // default 'server'
  page: number; // 1-based
  pageSize: number;
  totalItems?: number; // required in server mode
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void; // presence renders the size selector
  pageSizeOptions?: number[]; // default [10, 25, 50, 100]
  getPageHref?: (page: number) => string;
  formatRange?: (range: { start: number; end: number; total: number }) => string;
}

/**
 * Open operator vocabulary — the core never interprets it; it only stores it in
 * `ColumnFiltersState` and renders chips. Matches the donor's `{ [operator]: value }`.
 */
export type DataTableFilterOperator =
  | 'eq'
  | 'notEq'
  | 'contains'
  | 'notContains'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'in'
  | 'notIn'
  | 'regex'
  | 'isNull'
  | (string & {});

export type DataTableFilterValue = Partial<Record<DataTableFilterOperator, unknown>>;

/** Declares one filterable column to the add-filter menu + chip row. */
export interface DataTableFilterColumn<TData = unknown> {
  id: string; // must match a ColumnDef.id / accessorKey
  label: React.ReactNode;
  operators?: DataTableFilterOperator[];
  /**
   * Editor for this column's value. Default: a text `Input` emitting
   * `{ [operators?.[0] ?? 'contains']: value }`. The dashboard passes its own
   * typed editors here.
   */
  renderInput?: (ctx: {
    value: DataTableFilterValue | undefined;
    onChange: (next: DataTableFilterValue | undefined) => void;
    column: DataTableFilterColumn<TData>;
  }) => React.ReactNode;
  /**
   * Chip summary. Default: `${label}: ${JSON.stringify(value)}`. The dashboard
   * passes its human-readable-operator formatter here.
   */
  formatChip?: (value: DataTableFilterValue) => React.ReactNode;
}

export type DataTableFilters<TData> = ControlledState<ColumnFiltersState> & {
  mode?: 'server' | 'client'; // default 'server'
  /**
   * Optional. Present → the core renders the add-filter menu. Absent → the core
   * renders ONLY the applied-chip row (the dashboard supplies its own add-filter
   * in `toolbar`).
   */
  columns?: DataTableFilterColumn<TData>[];
  /** Collapse chips past this many into an "N filters" popover. Default Infinity. */
  inlineChipLimit?: number;
  /**
   * Defaults to true when `columns` is present. Set false when a consumer uses
   * `columns` for chip labels/formatting but renders its own add-filter UI.
   */
  showAddFilter?: boolean;
  /** Defaults to true. Set false when a consumer renders its own applied-filter UI. */
  showAppliedFilters?: boolean;
};

export interface DataTableBulkActionContext<TData> {
  /**
   * `row.original` for EVERY selected row across pages (resolved from the core's
   * selection cache). Named `selection` to match the donor's `BulkActionContext`.
   */
  selection: TData[];
  selectedRowIds: string[];
  table: Table<TData>;
  clearSelection: () => void; // table.resetRowSelection()
}

export interface DataTableLabels {
  empty?: string; // 'No results'
  selectAllRows?: string; // 'Select all rows'
  selectRow?: (index: number) => string; // (i) => `Select row ${i + 1}`
  rowActions?: string; // 'Open row actions'
  columnsTrigger?: string; // 'Columns'
  columnsHeading?: string; // 'Toggle columns'
  addFilter?: string; // 'Add filter'
  removeFilter?: (columnLabel: string) => string; // (l) => `Remove ${l} filter`
  sortLabel?: (columnLabel: string) => string; // (c) => `Sort by ${c}`
  filtersCollapsed?: (count: number) => string; // (n) => `${n} filters`
  pagination?: {
    // forwarded to TablePagination
    navLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    pageSizeLabel?: string;
  };
}

export interface DataTableProps<TData> {
  rows: TData[]; // current page (server) or full set (client). The core never fetches.
  // biome-ignore lint/suspicious/noExplicitAny: matches TanStack's ColumnDef value-type convention
  columns: ColumnDef<TData, any>[]; // `meta` passed through untouched. THE cell/header seam.
  /** TanStack getRowId. Required with server pagination + rowSelection. */
  getRowId?: (row: TData, index: number) => string;

  isLoading?: boolean; // skeleton rows only while `rows` is empty; never blanks populated rows
  skeletonRowCount?: number; // default 10

  // capability configs — omit → capability + its UI vanish
  pagination?: DataTablePagination;
  sorting?: DataTableSorting;
  filters?: DataTableFilters<TData>;
  columnVisibility?: DataTableColumnVisibility;
  rowSelection?: DataTableRowSelection<TData>;

  // slots
  /** First child of the internal `ListHeader` (title zone) — compose `PageHeader` here. */
  header?: React.ReactNode;
  /** Controls row (search, faceted filters, custom buttons). Render-prop gets the live table. */
  toolbar?: React.ReactNode | ((table: Table<TData>) => React.ReactNode);
  /** Overlay content when selection is non-empty. Only meaningful with `rowSelection` wired. */
  bulkActions?: (ctx: DataTableBulkActionContext<TData>) => React.ReactNode;
  /**
   * Per-row actions → appends an actions column. First arg is `row.original`
   * (matches the issue's `rowActions={(row) => …}`); `ctx` gives the TanStack row + table.
   */
  rowActions?: (row: TData, ctx: { row: Row<TData>; table: Table<TData> }) => React.ReactNode;
  /**
   * Right-click accelerator: wraps each row in a context menu whose content is
   * the returned nodes (author with `ContextMenuItem`/`ContextMenuSeparator`
   * from the context-menu atom). Unlike `rowActions`, the trigger is the row
   * itself, so the consumer supplies only the menu items — the core owns the
   * `ContextMenu` chrome. Additive to `rowActions`: keep the visible `...` button
   * as the discoverable, keyboard- and touch-accessible path and use this as a
   * power-user shortcut for the same actions. `ctx` mirrors `rowActions`.
   */
  contextActions?: (row: TData, ctx: { row: Row<TData>; table: Table<TData> }) => React.ReactNode;
  /** Replaces the built-in "No results" cell. */
  emptyState?: React.ReactNode;

  /**
   * Row-render seam. Overrides how each row's JSX is produced, so consumers can
   * layer content the default cell grid can't express — full-width utility rows
   * (a single `TableCell` with `colSpan={ctx.columnCount}`), or per-row wrappers
   * (draggable / expandable rows). `ctx.defaultRow` is the built-in `<TableRow>`;
   * return it to keep the default rendering for a given row. Called for every row
   * in the current model. Complements `setTableOptions` (which shapes the row
   * MODEL) by owning the row JSX — together they restore the donor's
   * `isUtilityRow`/`renderUtilityRow`/`DraggableRow` seam without the core reading
   * `meta`.
   */
  renderRow?: (
    row: Row<TData>,
    ctx: { table: Table<TData>; columnCount: number; defaultRow: React.ReactNode },
  ) => React.ReactNode;

  /**
   * Escape hatch (donor's `setTableOptions` name kept for port recognisability):
   * mutate `TableOptions` before `useReactTable` — expanded rows, drag meta,
   * utility rows. Applied last.
   */
  setTableOptions?: (options: TableOptions<TData>) => TableOptions<TData>;

  /**
   * The table's frame. `'card'` (default) renders the band anatomy on a real
   * `Card`: a `CardHeader` (border-b) hosting the header/controls/chips zones,
   * `CardTable` hosting the table flush to the card edges, and a `CardFooter`
   * (border-t) hosting pagination when it is wired — no footer means the last
   * row sits flush against the card's bottom edge. `'plain'` keeps the same
   * band structure but strips the card chrome (border, background, radius),
   * for tables embedded in an existing card such as dashboard widgets.
   */
  frame?: 'card' | 'plain';
  /**
   * Extra `<TableRow>`s appended inside `TableBody` after the data rows — e.g.
   * an order table's subtotal/shipping/total rows. Rendered only alongside
   * real rows, never with the skeleton or empty states, and has no interaction
   * with selection, sorting, or pagination.
   */
  footerRows?: React.ReactNode;

  labels?: DataTableLabels;
  className?: string; // the frame root (data-slot="data-table")
}

/**
 * Cell/header helper types — the donor's `DataTableDisplayComponent` shape, so
 * registry-resolved display components drop straight into `ColumnDef.cell`.
 */
export type DataTableCellComponent<TData, TValue = unknown> = (
  ctx: CellContext<TData, TValue>,
) => React.ReactNode;
export type DataTableHeaderComponent<TData, TValue = unknown> = (
  ctx: HeaderContext<TData, TValue>,
) => React.ReactNode;
