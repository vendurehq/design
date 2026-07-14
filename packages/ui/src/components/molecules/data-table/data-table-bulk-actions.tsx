'use client';

import type { Table } from '@tanstack/react-table';
import {
  getSelectedOriginals,
  getSelectedRowIds,
} from '@vendure-io/ui/components/molecules/data-table/data-table-helpers';
import type { DataTableBulkActionContext } from '@vendure-io/ui/components/molecules/data-table/data-table-types';
import { cn } from '@vendure-io/ui/lib/utils';
import * as React from 'react';

// The selection bar that replaces the controls row inside the header band
// while rows are selected (returns null with an empty selection; the core
// decides where it renders). The cross-page selection cache lives here (donor
// parity): `rows` only ever holds the current page, so we accumulate
// `row.original` by id as pages are seen, letting `bulkActions` receive every
// selected original — not just the ones still on screen.

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

  const ctx: DataTableBulkActionContext<TData> = {
    selection: getSelectedOriginals(selection, cache),
    selectedRowIds,
    table,
    clearSelection: () => table.resetRowSelection(),
  };

  return (
    // A plain band row, not a box: it takes the controls row's place inside
    // the header band, so it carries no chrome of its own. min-h-9 matches
    // the controls row's h-9 inputs so the swap holds the band height steady.
    <div
      data-slot="data-table-bulk-actions"
      className={cn('flex min-h-9 flex-wrap items-center gap-2', className)}
      {...props}
    >
      {render(ctx)}
    </div>
  );
}

export { DataTableBulkActions, useSelectionCache };
