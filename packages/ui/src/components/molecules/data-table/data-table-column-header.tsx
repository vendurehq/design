'use client';

import type { Column } from '@tanstack/react-table';
import { Button } from '@vendure-io/ui/components/atoms/button';
import { cn } from '@vendure-io/ui/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import type * as React from 'react';

// The sortable header control rendered inside a `<TableHead>`. When the column
// can't sort it degrades to plain text — the header stays a passive label, no
// button, no affordance it can't honour. Both take their size, weight and
// colour from the `<TableHead>`. The `aria-sort` state lives on the
// enclosing `<TableHead>` (set by `data-table.tsx`), not here.

interface DataTableColumnHeaderProps<TData, TValue>
  extends Omit<React.ComponentProps<'button'>, 'title'> {
  column: Column<TData, TValue>;
  /** Accessible name for the sort toggle, e.g. `Sort by Name`. */
  sortLabel?: string;
  /**
   * `'end'` puts the sort icon before the label and pulls the button forward,
   * so the label ends where the column's end-aligned cells end.
   */
  align?: 'start' | 'end';
}

function DataTableColumnHeader<TData, TValue>({
  column,
  sortLabel,
  align = 'start',
  className,
  children,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={className}>{children}</span>;
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
      // Pulls back by the button's own `--content-inset` (its padding and its
      // 1px border), so the label starts where a plain header label would. An
      // end-aligned header pulls forward instead and puts the icon first, so
      // the label ends where the cells end.
      data-align={align}
      className={cn(
        // The label takes the header's colour; hover still darkens it.
        'h-8 gap-1.5 text-inherit data-[slot=data-table-column-header]:px-2.5',
        align === 'end' ? '-me-(--content-inset) flex-row-reverse' : '-ms-(--content-inset)',
        className,
      )}
      {...props}
    >
      {children}
      {/* Active sort reads at full intensity; the idle affordance stays faint so
          it hints without competing with the header label. */}
      {sorted === 'asc' ? (
        <ArrowUpIcon />
      ) : sorted === 'desc' ? (
        <ArrowDownIcon />
      ) : (
        <ChevronsUpDownIcon className="text-muted-foreground/40" />
      )}
    </Button>
  );
}

export { DataTableColumnHeader };
