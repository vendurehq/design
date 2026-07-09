'use client';

import type { Table } from '@tanstack/react-table';
import { Button } from '@vendure-io/ui/components/atoms/button';
import { Input } from '@vendure-io/ui/components/atoms/input';
import { Popover, PopoverContent, PopoverTrigger } from '@vendure-io/ui/components/atoms/popover';
import { Chip } from '@vendure-io/ui/components/molecules/chip';
import type {
  DataTableFilterColumn,
  DataTableFilterValue,
} from '@vendure-io/ui/components/molecules/data-table/data-table-types';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChevronLeftIcon, ListFilterIcon } from 'lucide-react';
import * as React from 'react';

// The two filter surfaces. `DataTableAddFilter` is the core-owned column picker
// + value editor (rendered only when `filters.columns` is declared).
// `DataTableAppliedFilters` is the chip row — an applied filter is a `Chip` with
// `onRemove`, by decision there is no `FilterChip`. Both write through the live
// TanStack column API (`setFilterValue`), so the controlled `columnFilters`
// state stays the single source of truth.

/** The default text editor: emits `{ [firstOperator ?? 'contains']: value }`. */
function DefaultFilterInput<TData>({
  column,
  value,
  onChange,
}: {
  column: DataTableFilterColumn<TData>;
  value: DataTableFilterValue | undefined;
  onChange: (next: DataTableFilterValue | undefined) => void;
}) {
  const operator = column.operators?.[0] ?? 'contains';
  const current = value?.[operator];

  return (
    <Input
      autoFocus
      value={typeof current === 'string' ? current : ''}
      placeholder="Value"
      onChange={(event) => {
        const next = event.target.value;
        onChange(next ? { [operator]: next } : undefined);
      }}
    />
  );
}

interface DataTableAddFilterProps<TData> {
  table: Table<TData>;
  columns: DataTableFilterColumn<TData>[];
  label?: string;
}

function DataTableAddFilter<TData>({
  table,
  columns,
  label = 'Add filter',
}: DataTableAddFilterProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const active = columns.find((column) => column.id === activeId) ?? null;
  const tableColumn = active ? table.getColumn(active.id) : undefined;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setActiveId(null);
      }}
    >
      <PopoverTrigger
        data-slot="data-table-add-filter"
        render={
          <Button variant="outline" size="sm">
            <ListFilterIcon />
            {label}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-64 gap-2 p-2">
        {active ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground -ml-1 flex items-center gap-1 text-xs"
              onClick={() => setActiveId(null)}
            >
              <ChevronLeftIcon className="size-3" />
              {active.label}
            </button>
            {active.renderInput ? (
              active.renderInput({
                value: tableColumn?.getFilterValue() as DataTableFilterValue | undefined,
                onChange: (next) => tableColumn?.setFilterValue(next),
                column: active,
              })
            ) : (
              <DefaultFilterInput
                column={active}
                value={tableColumn?.getFilterValue() as DataTableFilterValue | undefined}
                onChange={(next) => tableColumn?.setFilterValue(next)}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {columns.map((column) => (
              <Button
                key={column.id}
                variant="ghost"
                size="sm"
                className="justify-start font-normal"
                onClick={() => setActiveId(column.id)}
              >
                {column.label}
              </Button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** String form of a column label, for accessible names that need a string. */
function labelText(label: React.ReactNode, fallback: string): string {
  return typeof label === 'string' ? label : fallback;
}

interface DataTableAppliedFiltersProps<TData> {
  table: Table<TData>;
  columns?: DataTableFilterColumn<TData>[];
  inlineChipLimit?: number;
  removeLabel?: (columnLabel: string) => string;
  collapsedLabel?: (count: number) => string;
}

function DataTableAppliedFilters<TData>({
  table,
  columns,
  inlineChipLimit = Number.POSITIVE_INFINITY,
  removeLabel = (columnLabel) => `Remove ${columnLabel} filter`,
  collapsedLabel = (count) => `${count} filters`,
}: DataTableAppliedFiltersProps<TData>) {
  const applied = table.getState().columnFilters;
  if (applied.length === 0) return null;

  const columnMap = new Map((columns ?? []).map((column) => [column.id, column]));

  const chipFor = (filter: (typeof applied)[number]) => {
    const column = columnMap.get(filter.id);
    const text = labelText(column?.label, filter.id);
    const content = column?.formatChip ? (
      column.formatChip(filter.value as DataTableFilterValue)
    ) : (
      <>
        {column?.label ?? filter.id}: {JSON.stringify(filter.value)}
      </>
    );

    return (
      <Chip
        key={filter.id}
        onRemove={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
        removeLabel={removeLabel(text)}
      >
        {content}
      </Chip>
    );
  };

  const inline = applied.slice(0, inlineChipLimit);
  const overflow = applied.slice(inlineChipLimit);

  return (
    <>
      {inline.map(chipFor)}
      {overflow.length > 0 && (
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm">
                {collapsedLabel(overflow.length)}
              </Button>
            }
          />
          <PopoverContent align="start" className={cn('w-auto max-w-72 flex-row flex-wrap gap-2')}>
            {overflow.map(chipFor)}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}

export { DataTableAddFilter, DataTableAppliedFilters };
