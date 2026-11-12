'use client';

import type { Table } from '@tanstack/react-table';
import type { DataTableBulkActionContext } from '@vendure-io/ui/components/molecules/data-table/data-table-types';
import { cn } from '@vendure-io/ui/lib/utils';
import * as React from 'react';
// Relative: `data-table-helpers` is closed in the package exports.
import { getSelectedOriginals, getSelectedRowIds } from './data-table-helpers.tsx';

// The selection bar that replaces the controls row inside the header band
// while rows are selected (returns null with an empty selection; the core
// decides where it renders). The cross-page selection cache lives here (donor
// parity): `rows` only ever holds the current page, so we accumulate
// `row.original` by id as pages are seen, letting `bulkActions` receive every
// selected original — not just the ones still on screen.

/**
 * Keep the latest border-box height of an element. DataTable no longer uses
 * it (the bulk bar shares the controls row's grid cell); it stays exported
 * for consumers. Example: hold a bulk bar at the height of the row it
 * replaces, so the table below does not move. A
 * ResizeObserver follows the row while it shows (it can wrap on a narrow
 * card); the last height stays once the row has left.
 */
function useHeldHeight(): [React.RefCallback<HTMLElement>, number | undefined] {
  const [height, setHeight] = React.useState<number>();
  const ref = React.useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setHeight(node.offsetHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, height];
}

/**
 * Accumulate `row.original` keyed by row id across page changes. Populated during
 * render (idempotent map writes) so the current render's `bulkActions` can
 * resolve the full selection synchronously.
 */
function useSelectionCache<TData>(table: Table<TData>): Map<string, TData> {
  const cacheRef = React.useRef<Map<string, TData>>(new Map());
  for (const row of table.getRowModel().rows) {
    cacheRef.current.set(row.id, row.original);
  }
  return cacheRef.current;
}

interface DataTableBulkActionsProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
  cache: Map<string, TData>;
  render: (ctx: DataTableBulkActionContext<TData>) => React.ReactNode;
}

function DataTableBulkActions<TData>({
  table,
  cache,
  render,
  className,
  ...props
}: DataTableBulkActionsProps<TData>) {
  const selection = table.getState().rowSelection;
  const selectedRowIds = getSelectedRowIds(selection);
  if (selectedRowIds.length === 0) return null;

  const loaded = getSelectedOriginals(selection, cache);
  const ctx: DataTableBulkActionContext<TData> = {
    selection: loaded,
    selectedRowIds,
    selectedCount: selectedRowIds.length,
    // The cache holds a row once the table has shown it, so an id it lacks is on
    // a page not seen yet, still loading, or no longer exists.
    missingRowIds:
      loaded.length === selectedRowIds.length ? [] : selectedRowIds.filter((id) => !cache.has(id)),
    table,
    clearSelection: () => table.resetRowSelection(),
  };

  return (
    // A plain band row, not a box: it takes the controls row's place inside
    // the header band, so it carries no chrome of its own. min-h-9 is the
    // height of a bar on its own; DataTable sets min-h-0 and takes the height
    // of the row the bar covers (the controls row or the column header row).
    <div
      data-slot="data-table-bulk-actions"
      className={cn('flex min-h-9 flex-wrap items-center gap-2', className)}
      {...props}
    >
      {render(ctx)}
    </div>
  );
}

export { DataTableBulkActions, useHeldHeight, useSelectionCache };
