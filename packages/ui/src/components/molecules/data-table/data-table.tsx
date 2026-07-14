'use client';

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
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
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
import {
  buildDisplayColumns,
  getSelectedRowIds,
  resolveSlot,
} from '@vendure-io/ui/components/molecules/data-table/data-table-helpers';
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
import { cn } from '@vendure-io/ui/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';

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

// Opacity-only fade for the controls/bulk replace-on-select swap: crossfades
// stay legible under prefers-reduced-motion, unlike movement.
const bandRowFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.1, ease: 'easeOut' },
} as const;

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

  // Resolve labels once per `labels` identity so the derived closures are stable
  // deps for the display-column memo below.
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

  // Inject the select/actions display columns around the data columns. `meta` on
  // the consumer's columns is never touched — it's the dashboard's field-info seam.
  const displayColumns = React.useMemo(() => {
    // biome-ignore lint/suspicious/noExplicitAny: matches TanStack's ColumnDef value-type convention
    const selectColumn: ColumnDef<TData, any> | undefined = rowSelection
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
              aria-label={l.selectAllRows}
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover/header-row:opacity-100 focus-visible:opacity-100 data-checked:opacity-100 data-indeterminate:opacity-100"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onCheckedChange={(checked) => row.toggleSelected(checked)}
              aria-label={l.selectRow(row.index)}
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 data-checked:opacity-100"
            />
          ),
        }
      : undefined;

    // biome-ignore lint/suspicious/noExplicitAny: matches TanStack's ColumnDef value-type convention
    const actionsColumn: ColumnDef<TData, any> | undefined = rowActions
      ? {
          id: 'actions',
          enableSorting: false,
          enableHiding: false,
          header: () => <span className="sr-only">{l.rowActions}</span>,
          cell: ({ row, table }) => rowActions(row.original, { row, table }),
        }
      : undefined;

    return buildDisplayColumns(columns, { select: selectColumn, actions: actionsColumn });
  }, [
    columns,
    rowSelection,
    rowActions,
    selectColumnId,
    l.selectAllRows,
    l.selectRow,
    l.rowActions,
  ]);

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

  const selectionCache = useSelectionCache(table);

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
  const columnClass = (id: string): string | undefined => {
    // `pl-0!`: the select cell is the first child, so CardTable's edge-cell
    // padding would otherwise widen the zero-width cell and push the whole
    // gutter arrangement out; important because CardTable's descendant rule
    // out-specifies a plain utility on the cell.
    if (id === selectColumnId) return 'relative w-0 p-0 pl-0!';
    if (id === leadingColumnId) return 'pl-8';
    // Actions cells drop vertical padding so a row-action button (taller than a
    // text line) sits inside the natural row height rather than inflating every
    // row; `align-middle` on the cell keeps it centred.
    if (id === 'actions') return 'py-0';
    return undefined;
  };

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
  // selectable table must not render an empty band. (Deliberate trade-off:
  // for a table with no header content at all, the band pops in on first
  // selection rather than reserving empty space.)
  const showBulk =
    rowSelection != null &&
    bulkActions != null &&
    getSelectedRowIds(table.getState().rowSelection).length > 0;

  const bands = (
    <>
      {(showHeader || showBulk) && (
        <CardHeader className="border-b">
          <ListHeader>
            {header}
            {/* Replace-on-select: while rows are selected the bulk bar takes
                the controls row's place (title and applied-filter chips stay).
                The swap fades out then in — one --transition-duration-fast
                (100ms) per phase; mode="wait" keeps the rows sequential so
                they never stack. */}
            {(showControls || (rowSelection != null && bulkActions != null)) && (
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
        <Table>
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
                      className={columnClass(headerCell.column.id)}
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
                  {Array.from({ length: Math.max(columnCount, 1) }).map((__, cellIndex) => (
                    <TableCell key={`skeleton-cell-${cellIndex}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
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
                      className="group/row"
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={columnClass(cell.column.id)}>
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
      className={cn(
        'flex flex-col gap-(--card-gap)',
        !(showHeader || showBulk) && 'pt-(--card-gap)',
        className,
      )}
    >
      {bands}
    </div>
  ) : (
    <Card data-slot="data-table" className={className}>
      {bands}
    </Card>
  );
}

export { DataTable };

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
  Table,
  TableOptions,
  VisibilityState,
} from '@tanstack/react-table';
// Re-export the full DataTable type surface so a consumer imports everything
// (props, capability configs, contexts, labels) from this one module.
export type * from '@vendure-io/ui/components/molecules/data-table/data-table-types';
