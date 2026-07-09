'use client';

import type { Column } from '@tanstack/react-table';
import { Button } from '@vendure-io/ui/components/atoms/button';
import { cn } from '@vendure-io/ui/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import type * as React from 'react';

// The sortable header control rendered inside a `<TableHead>`. When the column
// can't sort it degrades to plain text — the header stays a passive label, no
// button, no affordance it can't honour. The `aria-sort` state lives on the
// enclosing `<TableHead>` (set by `data-table.tsx`), not here.

interface DataTableColumnHeaderProps<TData, TValue>
  extends Omit<React.ComponentProps<'button'>, 'title'> {
  column: Column<TData, TValue>;
  /** Accessible name for the sort toggle, e.g. `Sort by Name`. */
  sortLabel?: string;
}

function DataTableColumnHeader<TData, TValue>({
  column,
  sortLabel,
  className,
  children,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn('font-medium', className)}>{children}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-slot="data-table-column-header"
      aria-label={sortLabel}
      // Tri-state cycle asc → desc → none is TanStack's default toggle (removal
      // enabled). We only wire the click; the engine owns the state machine.
      onClick={column.getToggleSortingHandler()}
      className={cn('-ml-2.5 h-8 gap-1.5 data-[slot=data-table-column-header]:px-2.5', className)}
      {...props}
    >
      {children}
      {sorted === 'asc' ? (
        <ArrowUpIcon />
      ) : sorted === 'desc' ? (
        <ArrowDownIcon />
      ) : (
        <ChevronsUpDownIcon className="text-muted-foreground" />
      )}
    </Button>
  );
}

export { DataTableColumnHeader };
