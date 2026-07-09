import type { Column, ColumnDef, RowSelectionState, Table } from '@tanstack/react-table';
import type { ControlledState } from '@vendure-io/ui/components/molecules/data-table/data-table-types';

// Pure, TanStack-shaped logic for the DataTable core. No JSX and no React state,
// so each function is unit-testable in isolation (the getRange/clampPage
// precedent from table-pagination.tsx).

// biome-ignore lint/suspicious/noExplicitAny: matches TanStack's ColumnDef value-type convention
type AnyColumnDef<TData> = ColumnDef<TData, any>;

/**
 * A capability config is controlled when it carries a `value`. Controlled means
 * the prop is the source of truth on every render; uncontrolled (`defaultValue`
 * or nothing) means the core owns the state.
 */
export function isControlled<T>(config: ControlledState<T> | undefined): boolean {
  return config?.value !== undefined;
}

/**
 * Prepend a `select` column and append an `actions` column around the
 * consumer's data columns, keeping `columns` about data only. The display
 * columns are built in `data-table.tsx` (they render JSX); this helper owns the
 * ordering so it can be tested without a DOM.
 */
export function buildDisplayColumns<TData>(
  columns: AnyColumnDef<TData>[],
  display: { select?: AnyColumnDef<TData>; actions?: AnyColumnDef<TData> },
): AnyColumnDef<TData>[] {
  return [
    ...(display.select ? [display.select] : []),
    ...columns,
    ...(display.actions ? [display.actions] : []),
  ];
}

/**
 * Hideable data columns for the column-visibility menu. Group columns are not
 * listed because their visibility is derived from leaf columns.
 */
export function getHideableLeafColumns<TData>(table: Table<TData>): Column<TData, unknown>[] {
  return table.getAllLeafColumns().filter((column) => column.getCanHide());
}

/** Resolve a render-prop-or-node slot against the live table instance. */
export function resolveSlot<TData, TSlot>(
  slot: TSlot | ((table: Table<TData>) => TSlot) | undefined,
  table: Table<TData>,
): TSlot | undefined {
  return typeof slot === 'function' ? (slot as (table: Table<TData>) => TSlot)(table) : slot;
}

/**
 * Materialise the current selection into row originals via the cross-page cache.
 * Selected ids missing from the cache (never-seen pages) are skipped rather than
 * yielding `undefined` holes.
 */
export function getSelectedOriginals<TData>(
  selection: RowSelectionState,
  cache: Map<string, TData>,
): TData[] {
  const originals: TData[] = [];
  for (const id of getSelectedRowIds(selection)) {
    const original = cache.get(id);
    if (original !== undefined) originals.push(original);
  }
  return originals;
}

/** The ids flagged `true` in a `RowSelectionState`. */
export function getSelectedRowIds(selection: RowSelectionState): string[] {
  return Object.keys(selection).filter((id) => selection[id]);
}
