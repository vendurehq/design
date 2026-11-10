'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Table as TanStackTable,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { Card, CardFooter, CardHeader, CardTable } from '@vendure-io/ui/components/atoms/card';
import { Checkbox } from '@vendure-io/ui/components/atoms/checkbox';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@vendure-io/ui/components/atoms/context-menu';
import { Skeleton } from '@vendure-io/ui/components/atoms/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vendure-io/ui/components/atoms/table';
import {
  DataTableBulkActions,
  useSelectionCache,
} from '@vendure-io/ui/components/molecules/data-table/data-table-bulk-actions';
import { DataTableColumnHeader } from '@vendure-io/ui/components/molecules/data-table/data-table-column-header';
import {
  DataTableAddFilter,
  DataTableAppliedFilters,
} from '@vendure-io/ui/components/molecules/data-table/data-table-filters';
import type {
  ControlledState,
  DataTableProps,
} from '@vendure-io/ui/components/molecules/data-table/data-table-types';
import { DataTableViewOptions } from '@vendure-io/ui/components/molecules/data-table/data-table-view-options';
import {
  ListHeader,
  ListHeaderChips,
  ListHeaderControls,
} from '@vendure-io/ui/components/molecules/data-table/list-header';
import { TablePagination } from '@vendure-io/ui/components/molecules/data-table/table-pagination';
import { ListRowChevron } from '@vendure-io/ui/components/molecules/list-row';
import { cn } from '@vendure-io/ui/lib/utils';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import * as React from 'react';
// Relative: `data-table-helpers` is closed in the package exports.
import {
  buildDisplayColumns,
  getSelectedRowIds,
  measureColumnIndents,
  resolveSlot,
  sameIndents,
} from './data-table-helpers.tsx';

// Id of the generated row-actions column. Public: it is the `skeletonCells` key
// for the actions cell.
const ACTIONS_COLUMN_ID = 'actions';

/**
 * One text line of loading placeholder: a box exactly one line box tall (`1lh`
 * of the inherited font) with a bar centred in it, so a skeleton line is as tall
 * as the text line it stands in for. Size the line with a text utility
 * (`text-xs` for a muted sub-line) and its width with `w-*`. DataTable uses it as
 * the default loading cell; stack several for multi-line `skeletonCells`.
 */
function DataTableSkeletonLine({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="data-table-skeleton-line"
      className={cn('flex h-[1lh] w-full items-center', className)}
      {...props}
    >
      <Skeleton className="h-[0.8lh] w-full" />
    </div>
  );
}

// The row link is a stretched link, like ListRowLink: one real link per row,
// whose ::after covers the row (the row is `relative`), so a click on any point
// of the row opens it, while keyboard and screen reader users get one tab stop
// and one accessible name (the item name). The link itself is never positioned
// or transformed: a link with `position`, `transform` or `scale` (a pressed
// Button) becomes the containing block of its ::after, which then shrinks to
// the link text. The ::after takes z-index 1: cell content with its own
// stacking context (opacity below 1, as a `reveal="row"` StatusBadge at rest
// or mid-fade) would otherwise paint over it and swallow the click.

// Interactive elements of a linked row stack above the stretched ::after, so
// they keep their own click and their own tab stop: buttons and secondary
// links, Tooltip triggers and the copy chips (IdChip, AnonymizedToken,
// CopyableText: the whole chip stays the copy target, so their inner button
// stays static). The select checkbox is already positioned above it. Any other element that must stay
// clickable above the link takes `data-table-row-control`. The class names
// stay literal so Tailwind can scan them.
const LINKED_ROW_CLASS = cn(
  'has-data-[slot=data-table-row-link]:relative has-data-[slot=data-table-row-link]:cursor-pointer',
  // While rows are selected, a click selects: the row does not look like a link.
  'in-data-selecting:cursor-default!',
  'has-data-[slot=data-table-row-link]:[&_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-slot=tooltip-trigger],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=copyable-text],[data-table-row-control]):not([data-slot=data-table-row-link],[data-slot=checkbox],[data-slot=id-chip]_*,[data-slot=anonymized-token]_*,[data-slot=copyable-text]_*)]:relative',
  'has-data-[slot=data-table-row-link]:[&_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-slot=tooltip-trigger],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=copyable-text],[data-table-row-control]):not([data-slot=data-table-row-link],[data-slot=checkbox],[data-slot=id-chip]_*,[data-slot=anonymized-token]_*,[data-slot=copyable-text]_*)]:z-10',
  // Only the first row link of a row stretches. A later one (a variant's
  // Product, rendered by the same link component) is a plain link above it,
  // underlined on hover, without a chevron.
  '[&_td:has([data-slot=data-table-row-link])~td_[data-slot=data-table-row-link]]:relative [&_td:has([data-slot=data-table-row-link])~td_[data-slot=data-table-row-link]]:z-10 [&_td:has([data-slot=data-table-row-link])~td_[data-slot=data-table-row-link]]:underline-offset-4 [&_td:has([data-slot=data-table-row-link])~td_[data-slot=data-table-row-link]]:hover:underline [&_td:has([data-slot=data-table-row-link])~td_[data-slot=data-table-row-chevron]]:hidden',
);

// A table with a row link keeps a slot for the row chevron after the last
// cell of every row, header included, so the chevron never covers a cell and
// a row without a link lines up with the others. The chevron is 15px and sits
// one 12px gap after the last cell, like ListRowChevron. Important: CardTable
// sets the edge padding with a descendant rule.
const ROW_CHEVRON_SLOT_CLASS =
  '[&:has([data-slot=data-table-row-link])_tr>*:last-child]:pe-[calc(var(--card-px)+--spacing(7))]!';

/**
 * Opens the row's item from any point of the row. Render it in the cell that
 * names the item, around the name: its children are the accessible name of
 * the row. Only the first one of a row stretches; one in a later cell (the
 * variant's Product) is a plain link above it. Pass `href`, or `render={<Link to="…" />}` for a
 * router link. Do not render it as a Button.
 *
 * Its ::after stretches over the row. Buttons, links, inputs, Tooltip
 * triggers, the select checkbox and the copy chips (IdChip, AnonymizedToken,
 * CopyableText) in the row sit above it and keep their own action; mark any other control
 * with `data-table-row-control`. Keyboard focus draws an inset ring around the
 * row. While the row is hovered or holds keyboard focus, a chevron appears at
 * the end of the row: it fades in and slides 3px toward the end (fade only
 * under reduced motion). It is decorative: the link carries the name.
 */
function DataTableRowLink({
  className,
  render,
  children,
  ...props
}: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(
          'cursor-pointer font-medium text-foreground outline-none in-data-selecting:cursor-default',
          'after:absolute after:inset-0 after:z-1 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring focus-visible:after:outline-solid',
          className,
        ),
        children: (
          <>
            {children}
            <ListRowChevron
              data-slot="data-table-row-chevron"
              className="pointer-events-none absolute end-(--card-px) top-1/2 -translate-y-1/2 in-data-selecting:hidden"
            />
          </>
        ),
      },
      props,
    ),
    state: { slot: 'data-table-row-link' },
  });
}

// The composition root. Owns the single `useReactTable` instance and the
// controlled/uncontrolled bridge, then lays out the card-framed table anatomy:
// a CardHeader band (header → controls → chips → bulk overlay), a CardTable
// hosting the Table flush to the card edges, and a CardFooter band for
// pagination. `frame="plain"` keeps the band structure without the card
// chrome. Every capability follows the Phase-1 rule verbatim: a feature
// renders only if its config is wired — no feature flags, no disabled
// placeholders. Only this folder imports TanStack; the composed
// ListHeader/TablePagination/Chip primitives stay TanStack-free.

/**
 * Bridge a capability config to a `[value, onChange]` pair TanStack can consume
 * as fully controlled. Controlled configs (`value`) are the source of truth every
 * render; uncontrolled configs (`defaultValue` or nothing) get internal state the
 * core owns, with any `onChange` observing. This fixes the donor's seed-then-emit
 * bug: the prop, not a one-time seed, drives every render.
 */
function useControlledTableState<T>(
  config: ControlledState<T> | undefined,
  fallback: T,
): readonly [T, OnChangeFn<T>] {
  const controlled = config?.value !== undefined;
  const [internal, setInternal] = React.useState<T>(config?.defaultValue ?? fallback);
  const value = controlled ? (config?.value as T) : internal;
  const onChange = React.useCallback<OnChangeFn<T>>(
    (updater) => {
      if (!controlled) setInternal((old) => functionalUpdate(updater, old));
      config?.onChange?.(updater);
    },
    [controlled, config],
  );
  return [value, onChange] as const;
}

/** A string label for a column, from a string `header`, else the column id. */
function headerLabelText<TData>(column: Column<TData, unknown>): string {
  const header = column.columnDef.header;
  return typeof header === 'string' ? header : column.id;
}

// The controls/bulk replace-on-select swap: the outgoing row drifts slightly
// up as it fades, the incoming row rises in from below — a subtle vertical
// hand-off (4px) rather than a plain crossfade.
const bandRowFade = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.1, ease: 'easeOut' },
} as const;

// The bulk-only band (a selectable table with no header content) opens and
// closes its height in --transition-duration-normal (200ms) on --ease-height,
// while its content takes `bandRowFade`. Reduced motion skips the height.
const bulkBandOpen = {
  initial: { height: 0 },
  animate: { height: 'auto' },
  exit: { height: 0 },
  transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] },
} as const;

// While rows are selected, a click on a row selects it instead of opening it.
// These elements in a row keep their own click: the same list the linked row
// lifts above its stretched link, plus the select checkbox and menu items. The
// row link itself is not one of them: a click on it selects too.
const ROW_CONTROL_SELECTOR =
  'a:not([data-slot=data-table-row-link]),button,input,select,textarea,[role=button],[role=checkbox],[role=menuitem],[tabindex]:not([data-slot=data-table-row-link]),[data-slot=tooltip-trigger],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=copyable-text],[data-table-row-control]';

/**
 * Toggles a row from a click on it or on its checkbox. With `extend` (Shift),
 * when the last clicked row is on this page, every row between the two takes
 * the clicked row's new state. The clicked row becomes the next anchor.
 */
function selectFromClick<TData>(
  table: TanStackTable<TData>,
  row: Row<TData>,
  extend: boolean,
  anchor: React.MutableRefObject<string | null>,
  value = !row.getIsSelected(),
) {
  const pageRows = table.getRowModel().rows;
  const from =
    extend && anchor.current != null ? pageRows.findIndex((r) => r.id === anchor.current) : -1;
  const to = pageRows.findIndex((r) => r.id === row.id);
  anchor.current = row.id;
  if (from < 0 || to < 0) {
    row.toggleSelected(value);
    return;
  }
  const range = pageRows.slice(Math.min(from, to), Math.max(from, to) + 1);
  table.setRowSelection((old) => {
    const next = { ...old };
    for (const r of range) {
      if (!r.getCanSelect()) continue;
      if (value) next[r.id] = true;
      else delete next[r.id];
    }
    return next;
  });
}

function ariaSort<TData>(
  hasSorting: boolean,
  column: Column<TData, unknown>,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!hasSorting || !column.getCanSort()) return undefined;
  const sorted = column.getIsSorted();
  return sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';
}

function DataTable<TData>({
  rows,
  columns,
  getRowId,
  isLoading,
  skeletonRowCount = 10,
  skeletonCells,
  pagination,
  sorting,
  filters,
  columnVisibility,
  rowSelection,
  header,
  toolbar,
  bulkActions,
  rowActions,
  contextActions,
  emptyState,
  renderRow,
  setTableOptions,
  onTableReady,
  frame = 'card',
  footerRows,
  labels,
  className,
}: DataTableProps<TData>) {
  const warnedMissingPaginatedSelectionRowId = React.useRef(false);
  if (
    process.env.NODE_ENV !== 'production' &&
    rowSelection != null &&
    pagination != null &&
    pagination.mode !== 'client' &&
    getRowId == null &&
    !warnedMissingPaginatedSelectionRowId.current
  ) {
    warnedMissingPaginatedSelectionRowId.current = true;
    console.warn(
      '[DataTable] rowSelection with server pagination requires getRowId. ' +
        "TanStack's default page-index row ids can resolve bulkActions selection to the wrong row after changing pages.",
    );
  }

  // Resolve labels once per `labels` identity.
  const l = React.useMemo(
    () => ({
      empty: labels?.empty ?? 'No results',
      selectAllRows: labels?.selectAllRows ?? 'Select all rows',
      selectRow: labels?.selectRow ?? ((index: number) => `Select row ${index + 1}`),
      rowActions: labels?.rowActions ?? 'Open row actions',
      columnsTrigger: labels?.columnsTrigger ?? 'Columns',
      columnsHeading: labels?.columnsHeading ?? 'Toggle columns',
      addFilter: labels?.addFilter ?? 'Add filter',
      removeFilter:
        labels?.removeFilter ?? ((columnLabel: string) => `Remove ${columnLabel} filter`),
      sortLabel: labels?.sortLabel ?? ((columnLabel: string) => `Sort by ${columnLabel}`),
      filtersCollapsed: labels?.filtersCollapsed ?? ((count: number) => `${count} filters`),
      pagination: labels?.pagination,
    }),
    [labels],
  );

  const [sortingState, onSortingChange] = useControlledTableState<SortingState>(sorting, []);
  const [filtersState, onColumnFiltersChange] = useControlledTableState<ColumnFiltersState>(
    filters,
    [],
  );
  const [visibilityState, onColumnVisibilityChange] = useControlledTableState<VisibilityState>(
    columnVisibility,
    {},
  );
  const [selectionState, onRowSelectionChange] = useControlledTableState<RowSelectionState>(
    rowSelection,
    {},
  );
  const selectColumnId = rowSelection?.selectColumnId ?? 'select';

  // The display-column cells read labels and `rowActions` through this ref, so
  // the column defs below depend only on which display columns exist. A new
  // cell function is a new component type to React: it remounts the cell, and
  // a checkbox toggled from the keyboard loses focus. Consumers pass
  // `rowSelection`, `rowActions` and `labels` inline, so those identities
  // change on every selection change.
  // The last row a click selected or deselected: the start of a Shift+click range.
  const selectionAnchor = React.useRef<string | null>(null);
  const displayProps = React.useRef({ l, rowActions });
  displayProps.current = { l, rowActions };
  const hasRowSelection = rowSelection != null;
  const hasRowActions = rowActions != null;

  // Inject the select/actions display columns around the data columns. `meta` on
  // the consumer's columns is never touched — it's the dashboard's field-info seam.
  const displayColumns = React.useMemo(() => {
    // biome-ignore lint/suspicious/noExplicitAny: matches TanStack's ColumnDef value-type convention
    const selectColumn: ColumnDef<TData, any> | undefined = hasRowSelection
      ? {
          id: selectColumnId,
          enableSorting: false,
          enableHiding: false,
          // The checkboxes stay hidden until they're relevant: a header/row
          // checkbox reveals on hover of its row (the enclosing `group/*`), on
          // keyboard focus, or once it carries a checked/indeterminate state —
          // so an idle table reads as content, not a selection grid. They're
          // floated absolutely over the (zero-width) select cell so an empty
          // selection reserves no gutter — no left gap to read as a bug.
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
              onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
              aria-label={displayProps.current.l.selectAllRows}
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 opacity-0 group-hover/header-row:opacity-100 focus-visible:opacity-100 data-checked:opacity-100 data-indeterminate:opacity-100"
            />
          ),
          cell: ({ row, table }) => (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onCheckedChange={(checked, details) =>
                selectFromClick(
                  table,
                  row,
                  Boolean((details.event as MouseEvent | KeyboardEvent | undefined)?.shiftKey),
                  selectionAnchor,
                  checked,
                )
              }
              aria-label={displayProps.current.l.selectRow(row.index)}
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-checked:opacity-100"
            />
          ),
        }
      : undefined;

    // biome-ignore lint/suspicious/noExplicitAny: matches TanStack's ColumnDef value-type convention
    const actionsColumn: ColumnDef<TData, any> | undefined = hasRowActions
      ? {
          id: ACTIONS_COLUMN_ID,
          enableSorting: false,
          enableHiding: false,
          header: () => <span className="sr-only">{displayProps.current.l.rowActions}</span>,
          cell: ({ row, table }) => displayProps.current.rowActions?.(row.original, { row, table }),
        }
      : undefined;

    return buildDisplayColumns(columns, { select: selectColumn, actions: actionsColumn });
  }, [columns, hasRowSelection, hasRowActions, selectColumnId]);

  const state: Partial<TableState> = {};
  if (sorting) state.sorting = sortingState;
  if (filters) state.columnFilters = filtersState;
  if (columnVisibility) state.columnVisibility = visibilityState;
  if (rowSelection) state.rowSelection = selectionState;
  if (pagination) {
    state.pagination = { pageIndex: pagination.page - 1, pageSize: pagination.pageSize };
  }

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    if (!pagination) return;
    const current: PaginationState = {
      pageIndex: pagination.page - 1,
      pageSize: pagination.pageSize,
    };
    const next = functionalUpdate(updater, current);
    if (next.pageSize !== current.pageSize) pagination.onPageSizeChange?.(next.pageSize);
    if (next.pageIndex !== current.pageIndex) pagination.onPageChange(next.pageIndex + 1);
  };

  const baseOptions: TableOptions<TData> = {
    data: rows,
    columns: displayColumns,
    state,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: sorting != null,
    enableFilters: filters != null,
    // Server mode (default) emits only; client mode enables the matching engine.
    manualSorting: sorting ? sorting.mode !== 'client' : undefined,
    manualFiltering: filters ? filters.mode !== 'client' : undefined,
    manualPagination: pagination ? pagination.mode !== 'client' : undefined,
    rowCount: pagination && pagination.mode !== 'client' ? pagination.totalItems : undefined,
  };

  if (sorting) {
    baseOptions.onSortingChange = onSortingChange;
    if (sorting.mode === 'client') baseOptions.getSortedRowModel = getSortedRowModel();
  }
  if (filters) {
    baseOptions.onColumnFiltersChange = onColumnFiltersChange;
    if (filters.mode === 'client') baseOptions.getFilteredRowModel = getFilteredRowModel();
  }
  if (columnVisibility) baseOptions.onColumnVisibilityChange = onColumnVisibilityChange;
  if (rowSelection) {
    baseOptions.onRowSelectionChange = onRowSelectionChange;
    baseOptions.enableRowSelection = rowSelection.enableRowSelection ?? true;
  }
  if (pagination) {
    baseOptions.onPaginationChange = onPaginationChange;
    if (pagination.mode === 'client') baseOptions.getPaginationRowModel = getPaginationRowModel();
  }

  const table = useReactTable(setTableOptions ? setTableOptions(baseOptions) : baseOptions);

  // Hand the table instance to the consumer once it exists. A ref holds the
  // latest callback so the effect can key on `table` alone — do NOT add
  // `onTableReady` to the deps: that would re-fire the "ready" notification
  // whenever an inline callback gets a new identity on rerender.
  const onTableReadyRef = React.useRef(onTableReady);
  onTableReadyRef.current = onTableReady;
  React.useEffect(() => {
    onTableReadyRef.current?.(table);
  }, [table]);

  const selectionCache = useSelectionCache(table);
  const reduceMotion = useReducedMotion();

  const bodyRows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;

  // The select checkbox is floated absolutely over a zero-width cell, so the
  // gutter it needs is folded into the leading data column as left padding —
  // an idle table reads as an intentional indent, not an empty checkbox cell,
  // and the revealed checkbox never overlaps the first column's content.
  const leadingColumnId =
    rowSelection != null
      ? table.getVisibleLeafColumns().find((column) => column.id !== selectColumnId)?.id
      : undefined;
  // Which generated display column an id belongs to, if any. Consumer columns
  // can't collide: buildDisplayColumns only injects these when configured.
  const generatedColumn = (id: string): 'select' | 'actions' | undefined => {
    if (rowSelection != null && id === selectColumnId) return 'select';
    if (rowActions != null && id === ACTIONS_COLUMN_ID) return 'actions';
    return undefined;
  };
  const columnClass = (id: string): string | undefined => {
    const generated = generatedColumn(id);
    // `pl-0!`: the select cell is the first child, so CardTable's edge-cell
    // padding would otherwise widen the zero-width cell and push the whole
    // gutter arrangement out; important because CardTable's descendant rule
    // out-specifies a plain utility on the cell.
    if (generated === 'select') return 'relative w-0 p-0 pl-0!';
    // Every other cell adds its column's indent (`--column-indent`, see
    // `columnIndents`) to its start padding. CardTable's edge-cell padding
    // adds it too.
    if (id === leadingColumnId) return 'pl-[calc(var(--spacing)*8+var(--column-indent,0px))]';
    // Actions cells drop vertical padding so a row-action button (taller than a
    // text line) sits inside the natural row height rather than inflating every
    // row; `align-middle` on the cell keeps it centred.
    return cn(
      'pl-[calc(var(--spacing)*2+var(--column-indent,0px))]',
      generated === 'actions' && 'py-0',
    );
  };
  // The cell text lines up with the header text. A styled cell content (a
  // Badge, a StatusBadge chip, a Button, an IdChip) sets `--content-inset` to
  // the distance from its box to its first letter, and the cell pulls its
  // first element back by that much (`contentInsetPull` in the atoms covers
  // content one wrapper deep). The rule has zero specificity, so a margin the
  // content sets itself still wins. The cell resets the variable, so a plain
  // wrapper element does not inherit one.
  const bodyCellClass = '[--content-inset:0px] [:where(&>:first-child)]:-ms-(--content-inset)';

  // A pull-back that reaches past the cell's start padding indents the whole
  // column instead (see measureColumnIndents), so no content leaves its cell.
  // Measured before paint, whenever the rows or the visible columns change.
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [columnIndents, setColumnIndents] = React.useState<Record<string, number>>({});
  const visibleColumnKey = table
    .getVisibleLeafColumns()
    .map((column) => column.id)
    .join(' ');
  // biome-ignore lint/correctness/useExhaustiveDependencies: the rows and visible columns are what change the cell content
  React.useLayoutEffect(() => {
    if (!tableRef.current) return;
    const next = measureColumnIndents(tableRef.current);
    setColumnIndents((current) => (sameIndents(current, next) ? current : next));
  }, [bodyRows, visibleColumnKey, isLoading]);
  const columnIndentStyle = (id: string): React.CSSProperties | undefined =>
    columnIndents[id]
      ? ({ '--column-indent': `${columnIndents[id]}px` } as React.CSSProperties)
      : undefined;

  // Loading cells follow the real column layout (same ids, same cell classes),
  // so a consumer's `skeletonCells` entry can match its loaded cell's height.
  const skeletonCell = (id: string): React.ReactNode => {
    const generated = generatedColumn(id);
    // The checkbox is hidden at rest and the cell is zero-width, so there is
    // nothing to stand in for — and no room for an override.
    if (generated === 'select') return null;
    // `null` is a deliberate empty cell; only a missing/undefined entry falls back.
    const custom = skeletonCells?.[id];
    if (custom !== undefined) return custom;
    if (generated === 'actions') return <Skeleton className="size-8" />;
    return <DataTableSkeletonLine />;
  };

  const warnedUnknownSkeletonCells = React.useRef(false);
  if (
    process.env.NODE_ENV !== 'production' &&
    skeletonCells != null &&
    !warnedUnknownSkeletonCells.current
  ) {
    const knownIds = new Set(
      table
        .getAllLeafColumns()
        .map((column) => column.id)
        .filter((id) => generatedColumn(id) !== 'select'),
    );
    const unknownKeys = Object.keys(skeletonCells).filter((key) => !knownIds.has(key));
    if (unknownKeys.length > 0) {
      warnedUnknownSkeletonCells.current = true;
      console.warn(
        `[DataTable] skeletonCells keys match no column: ${unknownKeys.join(', ')}. ` +
          "Keys are column ids: `id`, else `accessorKey` with '.' replaced by '_' " +
          "(`customer.name` → `customer_name`). The select column can't be overridden.",
      );
    }
  }

  const toolbarNode = toolbar != null ? resolveSlot(toolbar, table) : undefined;
  const showViewOptions = columnVisibility != null && columnVisibility.showViewOptions !== false;
  const hasFilterMenu = Boolean(
    filters?.showAddFilter !== false && filters?.columns && filters.columns.length > 0,
  );
  const showControls = toolbar != null || showViewOptions || hasFilterMenu;
  const showChips =
    filters != null &&
    filters.showAppliedFilters !== false &&
    table.getState().columnFilters.length > 0;
  const showHeader = header != null || showControls || showChips;
  // Unlike the other zones, the bulk bar exists only while rows are selected,
  // so it opens the header band on its own only then — a controls-less
  // selectable table must not render an empty band. That band eases its
  // height open and closed (see `bulkBandOpen`), so the rows glide down and
  // back instead of jumping.
  const selecting =
    rowSelection != null && getSelectedRowIds(table.getState().rowSelection).length > 0;
  const showBulk = selecting && bulkActions != null;

  // While rows are selected, a plain click on a row (the stretched row link
  // included) selects or deselects it and does not open the item: capture
  // phase, so a router link never sees the click. Clicks that still open the
  // item: the keyboard (Enter fires a click with detail 0), Cmd/Ctrl/Alt+click,
  // and the middle button (auxclick). Row controls keep their own click, and a
  // click inside a portal (an open row menu) is not the row's.
  const onRowClickCapture = (row: Row<TData>) => (event: React.MouseEvent<HTMLElement>) => {
    if (!selecting || !row.getCanSelect()) return;
    if (event.button !== 0 || event.detail === 0) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as Element;
    if (!event.currentTarget.contains(target) || target.closest(ROW_CONTROL_SELECTOR)) return;
    event.preventDefault();
    event.stopPropagation();
    selectFromClick(table, row, event.shiftKey, selectionAnchor);
  };
  // Shift+press would also extend the page's text selection across the rows.
  const onRowMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    if (selecting && event.shiftKey && !(event.target as Element).closest(ROW_CONTROL_SELECTOR)) {
      event.preventDefault();
    }
  };

  const bulkOnlyBand = !showHeader && rowSelection != null && bulkActions != null;

  const bands = (
    <>
      {bulkOnlyBand && (
        <MotionConfig reducedMotion="user">
          <AnimatePresence initial={false}>
            {showBulk && (
              // The band and the card gap below it open together: the wrapper
              // pulls the gap back with a negative margin, and in a card the
              // header adds it back inside, so at height 0 the band takes no
              // space. A plain frame keeps its top padding instead.
              <motion.div
                key="bulk-band"
                className="-mb-(--card-gap) overflow-hidden"
                {...bulkBandOpen}
                transition={reduceMotion ? { duration: 0 } : bulkBandOpen.transition}
              >
                <CardHeader className={cn('border-b', frame !== 'plain' && 'mb-(--card-gap)')}>
                  <ListHeader>
                    <motion.div {...bandRowFade}>
                      <DataTableBulkActions
                        table={table}
                        cache={selectionCache}
                        render={bulkActions}
                      />
                    </motion.div>
                  </ListHeader>
                </CardHeader>
              </motion.div>
            )}
          </AnimatePresence>
        </MotionConfig>
      )}
      {showHeader && (
        <CardHeader className="border-b">
          <ListHeader>
            {header}
            {/* Replace-on-select: while rows are selected the bulk bar takes
                the controls row's place (title and applied-filter chips stay).
                The swap fades out then in — one --transition-duration-fast
                (100ms) per phase; mode="wait" keeps the rows sequential so
                they never stack. Under reduced motion MotionConfig drops the
                4px rise and keeps the fade. */}
            {(showControls || (rowSelection != null && bulkActions != null)) && (
              <MotionConfig reducedMotion="user">
                <AnimatePresence initial={false} mode="wait">
                  {showBulk && bulkActions ? (
                    <motion.div key="bulk-actions" {...bandRowFade}>
                      <DataTableBulkActions
                        table={table}
                        cache={selectionCache}
                        render={bulkActions}
                      />
                    </motion.div>
                  ) : showControls ? (
                    <motion.div key="controls" {...bandRowFade}>
                      <ListHeaderControls>
                        {toolbarNode}
                        {hasFilterMenu && filters?.columns && (
                          <DataTableAddFilter
                            table={table}
                            columns={filters.columns}
                            label={l.addFilter}
                          />
                        )}
                        {showViewOptions && (
                          <DataTableViewOptions
                            table={table}
                            triggerLabel={l.columnsTrigger}
                            heading={l.columnsHeading}
                          />
                        )}
                      </ListHeaderControls>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </MotionConfig>
            )}
            {showChips && (
              <ListHeaderChips>
                <DataTableAppliedFilters
                  table={table}
                  columns={filters?.columns}
                  inlineChipLimit={filters?.inlineChipLimit}
                  removeLabel={l.removeFilter}
                  collapsedLabel={l.filtersCollapsed}
                />
              </ListHeaderChips>
            )}
          </ListHeader>
        </CardHeader>
      )}

      <CardTable>
        <Table
          ref={tableRef}
          className={ROW_CHEVRON_SLOT_CLASS}
          data-selecting={selecting ? '' : undefined}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/header-row">
                {headerGroup.headers.map((headerCell) => {
                  const content = headerCell.isPlaceholder
                    ? null
                    : flexRender(headerCell.column.columnDef.header, headerCell.getContext());
                  return (
                    <TableHead
                      key={headerCell.id}
                      aria-sort={ariaSort(sorting != null, headerCell.column)}
                      data-column-id={headerCell.column.id}
                      className={columnClass(headerCell.column.id)}
                      style={columnIndentStyle(headerCell.column.id)}
                    >
                      {sorting != null && !headerCell.isPlaceholder ? (
                        <DataTableColumnHeader
                          column={headerCell.column}
                          sortLabel={l.sortLabel(headerLabelText(headerCell.column))}
                        >
                          {content}
                        </DataTableColumnHeader>
                      ) : (
                        content
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && rows.length === 0 ? (
              Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columnCount === 0 ? (
                    <TableCell>
                      <DataTableSkeletonLine />
                    </TableCell>
                  ) : (
                    table.getVisibleLeafColumns().map((column) => (
                      <TableCell
                        key={column.id}
                        data-column-id={column.id}
                        className={columnClass(column.id)}
                        style={columnIndentStyle(column.id)}
                      >
                        {skeletonCell(column.id)}
                      </TableCell>
                    ))
                  )}
                </TableRow>
              ))
            ) : bodyRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={Math.max(columnCount, 1)}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyState ?? l.empty}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {bodyRows.map((row) => {
                  const rowNode = (
                    <TableRow
                      className={cn('group/row', LINKED_ROW_CLASS)}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      onClickCapture={onRowClickCapture(row)}
                      onMouseDown={onRowMouseDown}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          data-column-id={cell.column.id}
                          data-content-inset-cell=""
                          className={cn(columnClass(cell.column.id), bodyCellClass)}
                          style={columnIndentStyle(cell.column.id)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                  // Right-click accelerator: the row itself is the context-menu
                  // trigger, so the consumer supplies only the items and the core
                  // owns the menu chrome.
                  const defaultRow = contextActions ? (
                    <ContextMenu>
                      <ContextMenuTrigger render={rowNode} />
                      <ContextMenuContent>
                        {contextActions(row.original, { row, table })}
                      </ContextMenuContent>
                    </ContextMenu>
                  ) : (
                    rowNode
                  );
                  // Row-render seam: consumers can swap the default row for a
                  // full-width utility row or a per-row wrapper the cell grid can't
                  // express. Returning `defaultRow` keeps the built-in rendering.
                  return (
                    <React.Fragment key={row.id}>
                      {renderRow ? renderRow(row, { table, columnCount, defaultRow }) : defaultRow}
                    </React.Fragment>
                  );
                })}
                {typeof footerRows === 'function' ? footerRows({ columnCount }) : footerRows}
              </>
            )}
          </TableBody>
        </Table>
      </CardTable>

      {pagination && (
        <CardFooter className="border-t">
          <TablePagination
            className="w-full"
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems ?? table.getPrePaginationRowModel().rows.length}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            pageSizeOptions={pagination.pageSizeOptions}
            getPageHref={pagination.getPageHref}
            formatRange={pagination.formatRange}
            navLabel={l.pagination?.navLabel}
            previousLabel={l.pagination?.previousLabel}
            nextLabel={l.pagination?.nextLabel}
            pageSizeLabel={l.pagination?.pageSizeLabel}
          />
        </CardFooter>
      )}
    </>
  );

  // `plain` renders a chrome-less stack instead of a Card so the bands and
  // CardTable consume the HOST card's spacing variables (--card-px /
  // --card-gap): edge cells align with the host's padding regardless of its
  // size, and a trailing CardTable's negative margin reaches through the
  // host's bottom padding so the last row sits flush against the host's edge.
  // With no header band the leading CardTable's negative margin would eat the
  // host's flex gap too and press the rows against the preceding content, so
  // the stack restores that one gap as padding.
  return frame === 'plain' ? (
    <div
      data-slot="data-table"
      className={cn('flex flex-col gap-(--card-gap)', !showHeader && 'pt-(--card-gap)', className)}
    >
      {bands}
    </div>
  ) : (
    <Card data-slot="data-table" className={className}>
      {bands}
    </Card>
  );
}

export { DataTable, DataTableRowLink, DataTableSkeletonLine };

// Re-export the consumer-facing TanStack types so columns can be authored from
// the same import as `DataTable` — no direct `@tanstack/react-table` dependency
// in consumer code just to type a `ColumnDef`.
export type {
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  HeaderContext,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  // Not `Table`: that name is the Table atom. This is the TanStack instance
  // type, as `onTableReady` hands it over.
  Table as TableInstance,
  TableOptions,
  VisibilityState,
} from '@tanstack/react-table';
// Re-export the full DataTable type surface so a consumer imports everything
// (props, capability configs, contexts, labels) from this one module.
export type * from '@vendure-io/ui/components/molecules/data-table/data-table-types';
