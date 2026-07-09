'use client';

import type { Column, Table } from '@tanstack/react-table';
import { Button } from '@vendure-io/ui/components/atoms/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@vendure-io/ui/components/atoms/dropdown-menu';
import { SlidersHorizontalIcon } from 'lucide-react';

// The column-visibility gear. Lists only hideable columns (`getCanHide()`), so
// the always-on `select`/`actions` display columns never appear here. Labels
// come from a string `ColumnDef.header`, falling back to the column id — `meta`
// is deliberately never read (it belongs to the consumer, make-or-break #7).

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  triggerLabel?: string;
  heading?: string;
}

function columnLabel<TData>(column: Column<TData, unknown>): string {
  const header = column.columnDef.header;
  return typeof header === 'string' ? header : column.id;
}

function DataTableViewOptions<TData>({
  table,
  triggerLabel = 'Columns',
  heading = 'Toggle columns',
}: DataTableViewOptionsProps<TData>) {
  const hideableColumns = table.getAllColumns().filter((column) => column.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="data-table-view-options"
        render={
          <Button variant="outline" size="sm">
            <SlidersHorizontalIcon />
            {triggerLabel}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        {/* Base UI ties `GroupLabel` to a `Group` via context: the heading names
            the toggle group and errors if rendered outside one. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>{heading}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {hideableColumns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(checked)}
            >
              {columnLabel(column)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DataTableViewOptions };
