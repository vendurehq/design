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

/**
 * The keys DataTable reads from a column's `meta`. DataTable does not augment
 * TanStack's `ColumnMeta`, so a consumer's own meta keys keep working; write
 * `meta: { align: 'end' } satisfies DataTableColumnMeta` for a checked value.
 */
export interface DataTableColumnMeta {
  /**
   * Which side of the column its header, sort control and cells line up on.
   * `'end'` is for numbers (totals, quantities), so their digits line up.
   * Logical, so it flips in right-to-left. Defaults to `'start'`.
   */
  align?: 'start' | 'end';
  /**
   * The column's width: a number in px or a CSS length (`'8rem'`). The column
   * has it while the skeleton shows and once the rows arrive, so the headers
   * do not move when the data replaces the skeleton. Give one to each column
   * whose content has a known width (a code, a status, a date, a total) and
   * leave the widest text column without, so it takes the rest of the row.
   * Wider content still widens the column (the table keeps its automatic
   * layout). It is also the column's minimum: a table narrower than its
   * columns scrolls sideways instead of squeezing them. TanStack's `size` is
   * not read: TanStack gives every column a default `size`, so a set one can't
   * be told from the default.
   */
  width?: number | string;
  /**
   * The column's minimum width, for a text column without a `width`: it still
   * takes the rest of the row, but never gets narrower than this, so in a
   * narrow table it keeps a readable width and the same width while the
   * skeleton shows and once the rows arrive.
   */
  minWidth?: number | string;
  /**
   * The `--content-inset` of the column's cell content: how far it pulls back
   * so its first letter lines up with the header. For a default-size
   * StatusBadge: `'status-badge'` (chip with an icon), `'status-badge-dot'`
   * (chip with a dot) or `'status-icon'` (`appearance="icon"`). Otherwise a
   * number in px or a CSS length. When the pull-back is wider than the cell's gutter, the column's
   * header and cells indent by the rest. With this set, that indent applies in
   * every state, so the header does not move when the rows replace the
   * skeleton. Without it the table measures the indent from the loaded cells,
   * so the header moves once they arrive.
   */
  contentInset?: 'status-badge' | 'status-badge-dot' | 'status-icon' | number | string;
}

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
interface DataTablePaginationBase {
  page: number; // 1-based
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void; // presence renders the size selector
  pageSizeOptions?: number[]; // default [10, 25, 50, 100]
  getPageHref?: (page: number) => string;
  formatRange?: (range: { start: number; end: number; total: number }) => string;
}

/** The server pages, sorts and filters. The table shows one page of `rows`. */
export interface DataTableServerPagination extends DataTablePaginationBase {
  mode?: 'server';
  /**
   * The number of rows on all pages. `null` while it is not known (the first
   * page has not loaded yet): the footer range is a skeleton until then. Do
   * not pass 0 for "not known": 0 means the list is empty.
   */
  totalItems: number | null;
}

/** `rows` is the full set. The table pages it. */
export interface DataTableClientPagination extends DataTablePaginationBase {
  mode: 'client';
}

export type DataTablePagination = DataTableServerPagination | DataTableClientPagination;

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
  /**
   * Makes the column's applied-filter chip editable. Present → the chip label
   * is a button that opens this editor, and the consumer renders the whole
   * popup (a Popover, a Combobox, a Dialog) controlled by `open`. Anchor a
   * positioned popup to `anchor`, the chip. Absent → the chip only removes.
   */
  renderEditor?: (ctx: DataTableFilterEditorContext<TData>) => React.ReactNode;
}

export interface DataTableFilterEditorContext<TData = unknown> {
  /** Whether the editor is open. The chip label opens it. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The applied-filter chip, to anchor a positioned popup to. */
  anchor: React.RefObject<HTMLElement | null>;
  value: DataTableFilterValue | undefined;
  onChange: (next: DataTableFilterValue | undefined) => void;
  column: DataTableFilterColumn<TData>;
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
  /**
   * A "Clear filters" button after the applied-filter chips. Off by default.
   * `true` or an object turns it on. It shows only with a chip: a search has
   * the clear of its own field. While the table shows its empty state (no
   * rows, not loading), the empty state holds the only "Clear filters", so the
   * button hides. The chip line keeps the button's height either way, so the
   * table does not move when it shows or hides.
   */
  clearFilters?: boolean | DataTableClearFilters;
};

export interface DataTableClearFilters {
  /** Runs on click. Default: removes every applied filter. */
  onClear?: () => void;
  /**
   * Hides the button while a chip applies. Default: true while the table
   * shows its empty state (no rows, not loading). Set it when the consumer
   * knows better, e.g. loading passed through `emptyState`.
   */
  hidden?: boolean;
}

export interface DataTableBulkActionContext<TData> {
  /**
   * `row.original` of the selected rows the table has loaded, from the core's
   * selection cache. Use it to DISPLAY rows. It can be SHORTER than
   * `selectedRowIds`: a selection spans pages, it can be restored before its
   * rows load, and a stored id can name a row that no longer exists. Act on
   * `selectedRowIds`; read `missingRowIds` before an action that needs row data.
   */
  selection: TData[];
  /** The id of EVERY selected row, loaded or not. Act on these. */
  selectedRowIds: string[];
  /** `selectedRowIds.length`. Show this as the count: it is never below what the action receives. */
  selectedCount: number;
  /**
   * The selected ids with no row object in `selection`. Empty when `selection`
   * has a row for every id. When it is not empty, an action that needs row data
   * must load these rows or tell the user: it must not act on fewer rows than
   * `selectedCount` says.
   */
  missingRowIds: string[];
  table: Table<TData>;
  clearSelection: () => void; // table.resetRowSelection()
}

/**
 * The select all / clear all ripple timing of one row, handed to `renderRow`.
 * Put both on the `<tr>` you render so it ripples like a built-in row:
 * `className` merged into yours, `style` spread before yours. `style` holds
 * only custom properties (`--ripple-at`, `--ripple-span`), so it never
 * collides with an inline `transform`, `transition` or `opacity` of the row.
 * The row also needs `data-state="selected"` while selected, as the built-in
 * rows have.
 */
export interface DataTableRowRipple {
  className: string;
  style: React.CSSProperties;
}

/**
 * What a built-in body cell of one column carries, handed to `renderRow` as
 * `ctx.cellProps(columnId)`. Spread it on the `<td>` you render
 * (`<TableCell {...cellProps(cell.column.id)}>`) and the cell matches the
 * built-in row: the select cell is the zero-width cell the checkbox floats
 * over, the leading data cell carries the checkbox gutter, and every cell
 * lines its content up with the header. With `pinFirstColumn`, the leading
 * data cell carries `data-pinned`, so it stays at the edge with the select
 * cell. Merge your own classes with `cn`.
 */
export interface DataTableRowCellProps {
  'data-column-id': string;
  'data-content-inset-cell': string;
  'data-pinned': '' | undefined;
  className: string;
  style: React.CSSProperties | undefined;
}

/**
 * What a built-in row carries for click-to-select, handed to `renderRow` as
 * `ctx.selectProps`. Spread it on the `<tr>` you render and the row behaves
 * like a built-in row: while rows are selected a click on the row selects it,
 * a click on the name (`DataTableRowLink`) opens the item, Shift+click extends
 * the selection, and row controls keep their own action. A press that starts
 * on a row control (a drag handle with `role="button"` or
 * `data-table-row-control`) or moves more than 4px before release never
 * selects, so a drag never does. Spread it before your own handlers: an
 * `onClickCapture`, `onMouseDown` or `onPointerDown` of yours replaces the
 * table's.
 */
export interface DataTableRowSelectProps {
  'data-click-selects': '' | undefined;
  onClickCapture: React.MouseEventHandler<HTMLElement>;
  onMouseDown: React.MouseEventHandler<HTMLElement>;
  onPointerDown: React.PointerEventHandler<HTMLElement>;
}

export interface DataTableLabels {
  empty?: string; // 'No results'
  selectAllRows?: string; // 'Select all rows'
  /** Tooltip on the header checkbox while not every row on the page is selected. */
  selectAllOnPage?: string; // 'Select all on this page'
  /** Tooltip on the header checkbox while every row on the page is selected. */
  clearPageSelection?: string; // 'Clear selection on this page'
  selectRow?: (index: number) => string; // (i) => `Select row ${i + 1}`
  rowActions?: string; // 'Open row actions'
  columnsTrigger?: string; // 'Columns'
  columnsHeading?: string; // 'Toggle columns'
  addFilter?: string; // 'Add filter'
  clearFilters?: string; // 'Clear filters'
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
  /**
   * The current page (server) or the full set (client). The core never
   * fetches. `undefined` until the first load finishes: the body shows
   * skeleton rows. `[]` is a loaded empty list and shows the empty state, also
   * while a new load runs. Do not pass `[]` for "not loaded".
   */
  rows: TData[] | undefined;
  /**
   * THE cell/header seam. `meta` is passed through; the DataTable reads
   * `meta.align` and `meta.width` (see `DataTableColumnMeta`).
   */
  // biome-ignore lint/suspicious/noExplicitAny: matches TanStack's ColumnDef value-type convention
  columns: ColumnDef<TData, any>[];
  /** TanStack getRowId. Required with server pagination + rowSelection. */
  getRowId?: (row: TData, index: number) => string;

  /**
   * A load is running. With `rows` loaded (a page, sort or filter change that
   * keeps the previous rows, or the empty state) they stay: the body is
   * `aria-busy`, the rows and the footer range dim after a short delay, and
   * prev/next ignore presses. Never blanks loaded rows. Before the first load
   * (`rows` is `undefined`) the body shows skeleton rows with or without it.
   */
  isLoading?: boolean;
  /**
   * Skeleton rows before the first load of a table without `pagination`.
   * Default 10. With `pagination` the count comes from the page size (and the
   * total remembered under `rowCountKey`), so this prop is not used.
   */
  skeletonRowCount?: number;
  /**
   * Remembers the list's total row count (all pages), in local storage under
   * this key. Before the next first load the body draws as many skeleton rows
   * as the current page will have: the page size, fewer on a short last page,
   * so the table does not change height when the rows arrive. A page that
   * will be empty renders the empty state (`emptyState` or "No results")
   * hidden and inert instead, so the body has its exact height and the empty
   * result shows in place.
   *
   * - The total is read once, when the table mounts (or the key changes),
   *   before the first paint. With nothing remembered a paginated table draws
   *   one full page, any other table `skeletonRowCount`.
   * - Each finished load (`isLoading` false, `rows` and the total known)
   *   stores the total: `pagination.totalItems` in server mode, else the row
   *   count after client filtering.
   * - The remembered total only sets the skeleton row count. The footer never
   *   shows it: it can be out of date.
   * - Blocked or full storage is ignored. A server render draws the default.
   *
   * The key names the list and anything that scopes its rows, such as a
   * channel, the filters or the search: `${route}:${channelId}:${filterHash}`.
   * Rows taller than one text line still need `skeletonCells`. Without the
   * prop the first visit of every mount draws the default.
   */
  rowCountKey?: string;
  /**
   * Per-column loading cells, keyed by column id, for cells that are not one
   * text line tall (a title over a muted sub-line, an avatar, a button), so the
   * loading rows keep the loaded row height and the table does not jump when
   * data arrives. Stack `DataTableSkeletonLine`s for multi-line cells.
   *
   * Keys are TanStack column ids: the column's `id`, else its `accessorKey`
   * with `.` replaced by `_` (`customer.name` → `customer_name`). Unknown keys
   * warn in development.
   *
   * A missing or `undefined` entry renders the default: one
   * `DataTableSkeletonLine`, as tall as one text line, so one-line columns
   * (text, Money) need no entry. `null` renders an empty cell. The
   * generated actions cell (key `actions`) defaults to an icon-button-sized
   * block and can be overridden; the generated select cell is always empty.
   */
  skeletonCells?: Record<string, React.ReactNode>;

  // capability configs — omit → capability + its UI vanish
  pagination?: DataTablePagination;
  sorting?: DataTableSorting;
  filters?: DataTableFilters<TData>;
  columnVisibility?: DataTableColumnVisibility;
  rowSelection?: DataTableRowSelection<TData>;
  /**
   * Keeps the row selection in session storage under this key, so it survives a
   * reload and a visit to another page in the same tab. Needs `rowSelection`.
   *
   * - On the first load the table restores the ids stored under the key and
   *   reports them through `rowSelection.onChange`.
   * - Every change is stored, with the ids of rows on other pages: a selection
   *   can span pages. An empty selection removes the entry.
   * - A new key switches to the selection stored under it, or to none. Nothing
   *   from the old key carries over.
   * - No navigation and no request. Blocked or full storage is ignored.
   *
   * The key names the list and anything that scopes its rows, such as a channel
   * or a project: `${route}:${channelId}`. Without the prop nothing changes.
   */
  selectionStorageKey?: string;

  // slots
  /** First child of the internal `ListHeader` (title zone) — compose `PageHeader` here. */
  header?: React.ReactNode;
  /** Controls row (search, faceted filters, custom buttons). Render-prop gets the live table. */
  toolbar?: React.ReactNode | ((table: Table<TData>) => React.ReactNode);
  /**
   * Replaces the controls row inside the header band while selection is
   * non-empty, at the row's height (title and applied-filter chips stay).
   * Without a controls row it covers the column header row instead. Either
   * way the table does not move. Keep the bar one line of `h-8` or smaller
   * controls, so it fits the 40px header row. Only meaningful with
   * `rowSelection` wired.
   */
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
   *
   * A row you render yourself changes with the others when select all or clear
   * all ripples down the page only if it takes `ctx.ripple` (see
   * {@link DataTableRowRipple}); a row that ignores it changes at once.
   * `ctx.cellProps(columnId)` gives each cell the built-in cell's classes (see
   * {@link DataTableRowCellProps}), so the row's select cell and leading cell
   * never drift from the table's own. `ctx.selectProps` (see
   * {@link DataTableRowSelectProps}) gives the row click-to-select while rows
   * are selected; a row without it keeps opening the item from anywhere on it.
   * A row with a `DataTableRowLink` needs nothing more: the table raises its
   * buttons, links, inputs and copy chips above the stretched link, as it does
   * on a built-in row. With `pinFirstColumn`, render `ctx.rowLinkHost(columnId)`
   * at the end of every cell too, so the whole row opens the item (see
   * `pinFirstColumn`).
   */
  renderRow?: (
    row: Row<TData>,
    ctx: {
      table: Table<TData>;
      columnCount: number;
      defaultRow: React.ReactNode;
      ripple: DataTableRowRipple;
      cellProps: (columnId: string) => DataTableRowCellProps;
      /**
       * Where a `DataTableRowLink` draws the anchor that opens the item from
       * the cells on the other side of the pinned edge. Render it as the last
       * child of every cell: `{ctx.rowLinkHost(cell.column.id)}`. It is `null`
       * without `pinFirstColumn`, and in the cells that need no host.
       */
      rowLinkHost: (columnId: string) => React.ReactNode;
      selectProps: DataTableRowSelectProps;
    },
  ) => React.ReactNode;

  /**
   * Escape hatch (donor's `setTableOptions` name kept for port recognisability):
   * mutate `TableOptions` before `useReactTable` — expanded rows, drag meta,
   * utility rows. Applied last.
   */
  setTableOptions?: (options: TableOptions<TData>) => TableOptions<TData>;

  /**
   * Receives the core's TanStack {@link Table} instance so consumers (saved-view
   * controls, external toolbars) can drive it without rendering a slot to
   * capture it — the supported alternative to reading `table` off the `toolbar`
   * render-prop purely for its side effect.
   *
   * Fires from an effect after the first commit — never during render or SSR —
   * so it is safe to call setState from here. `useReactTable` returns a
   * referentially stable instance for the component's lifetime, so this fires
   * once per mount (twice under React StrictMode in development, like any
   * effect — keep the callback idempotent): never on a plain rerender, and not
   * again when the callback prop's identity changes. Treat it as a "ready"
   * capture, not a subscription — the latest callback as of that single fire is
   * used (an inline function is fine), but a callback swapped in after mount is
   * never invoked. TanStack mutates the instance in place as state changes, so
   * the reference you capture here stays current — read live state through it
   * (e.g. inside an event handler) rather than expecting a fresh object on each
   * change.
   */
  onTableReady?: (table: Table<TData>) => void;

  /**
   * The table's frame. `'card'` (default) renders the band anatomy on a real
   * `Card`: a `CardHeader` (border-b) hosting the header/controls/chips zones,
   * `CardTable` hosting the table flush to the card edges, and a `CardFooter`
   * (border-t) hosting pagination when it is wired — no footer means the last
   * row sits flush against the card's bottom edge. `'plain'` renders the same
   * band structure without any card chrome, for a table embedded in an
   * existing card (e.g. a dashboard widget): it MUST sit inside a `Card`,
   * whose spacing variables (`--card-px`/`--card-gap`) drive the bands and
   * edge-cell alignment — the host card is the frame.
   */
  frame?: 'card' | 'plain';
  /**
   * Keeps the first column in place while the others scroll sideways (Table's
   * `pinFirstColumn`). The select checkbox is pinned with it, and a selected
   * row's bar stays on the pinned edge. A `DataTableRowLink` still opens the
   * item from every cell: the name stays the row's one link, and the cells
   * that scroll under the pinned column open it through a second anchor with
   * the same href, hidden from assistive technology and the tab order. A row
   * from `renderRow` that renders its own cells gets that anchor when it
   * renders `ctx.rowLinkHost(cell.column.id)` after the content of every cell;
   * without it, only the cells on the link's side of the pinned edge open the
   * item.
   */
  pinFirstColumn?: boolean;
  /**
   * The rows open an item through `DataTableRowLink`. The table then keeps the
   * row chevron's slot after the last column in every state: while the
   * skeleton shows, when empty and with rows. Without it the slot appears only
   * once a row with a link renders, so on the first load every column moves
   * sideways by the slot's width when the rows arrive.
   */
  rowLinks?: boolean;
  /**
   * Extra `<TableRow>`s appended inside `TableBody` after the data rows — e.g.
   * an order table's subtotal/shipping/total rows. Rendered only alongside
   * real rows, never with the skeleton or empty states, and has no interaction
   * with selection, sorting, or pagination. Use the function form to receive
   * `columnCount` for `colSpan`s — display columns (select, actions) are
   * injected around your columns, so a hard-coded count desyncs. Rows are
   * presentational: give them `hover:bg-transparent`.
   */
  footerRows?: React.ReactNode | ((ctx: { columnCount: number }) => React.ReactNode);

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
