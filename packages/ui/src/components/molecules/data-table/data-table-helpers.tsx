import type { Column, ColumnDef, RowSelectionState, Table } from '@tanstack/react-table';
import type {
  ControlledState,
  DataTableClearFilters,
  DataTableColumnMeta,
} from '@vendure-io/ui/components/molecules/data-table/data-table-types';

// Pure, TanStack-shaped logic for the DataTable core. No JSX and no React state,
// so each function is unit-testable in isolation (the getRange/clampPage
// precedent from table-pagination.tsx).

/**
 * The pending look of a range or a table body whose next content is loading:
 * after `--transition-duration-slow` (300ms) it fades to half opacity, so a
 * read that ends sooner shows nothing. Leaving pending is immediate. Under
 * reduced motion the dim still waits, then steps instead of fading. Set
 * `data-pending` on the element to turn it on.
 */
export const PENDING_CLASS =
  '[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft)] data-pending:opacity-50 data-pending:[transition-delay:var(--transition-duration-slow)] motion-reduce:[transition-duration:0s]';

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
/**
 * The "Clear filters" button after the chips, or undefined when it is off.
 * `emptyCell`: the table shows its empty state (no rows, not loading). The
 * button hides there unless the consumer sets `hidden`. Default click: remove
 * every applied filter.
 */
export function resolveClearFilters<TData>(
  option: boolean | DataTableClearFilters | undefined,
  table: Pick<Table<TData>, 'setColumnFilters'>,
  emptyCell: boolean,
): { hidden: boolean; onClear: () => void } | undefined {
  if (!option) return undefined;
  const config = option === true ? {} : option;
  return {
    hidden: config.hidden ?? emptyCell,
    onClear: config.onClear ?? (() => table.setColumnFilters([])),
  };
}

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

/**
 * How far each column must indent its header and cells, so that cell content
 * that pulls back by its own start inset (`--content-inset`) stays inside the
 * column gutter. Keyed by `data-column-id`; a column that needs no indent is
 * left out.
 *
 * Content may pull back into its start padding by up to the gutter between
 * two columns: the cell's end padding. In a middle column that reaches the
 * cell edge. The first column's start padding is the card's inset and the
 * leading column's holds the selection checkbox, so there the content keeps
 * the rest of the padding clear. A bigger pull-back (a chip with a leading
 * icon) indents the column by the rest instead, and its header and plain-text
 * cells follow.
 *
 * The measure reads boxes, so it also covers a consumer's own margin. It
 * checks the cell's first element and that element's first element (content
 * one wrapper deep). The result does not change with the indent already
 * applied, so a second measure returns the same result.
 */
export function measureColumnIndents(table: HTMLTableElement): Record<string, number> {
  const indents: Record<string, number> = {};
  // Array.from, not for…of: a consumer's lib may not type NodeList as iterable.
  const cells = Array.from(
    table.querySelectorAll<HTMLElement>(':scope > tbody > tr > td[data-column-id]'),
  );
  for (const cell of cells) {
    const id = cell.dataset.columnId;
    const first = cell.firstElementChild;
    // A pinned table's row-link overlay host comes after the content, so it is
    // first only in a cell without content elements. It is not content: its
    // overlay spans the whole row.
    const host =
      (first as HTMLElement | null)?.dataset?.slot === 'data-table-row-link-overlay-host';
    if (id == null || first == null || host) continue;
    const style = getComputedStyle(cell);
    const rtl = style.direction === 'rtl';
    const start = (rect: DOMRect) => (rtl ? -rect.right : rect.left);
    const cellStart = start(cell.getBoundingClientRect());
    const indent = Number.parseFloat(cell.style.getPropertyValue('--column-indent')) || 0;
    const padding = Number.parseFloat(style.paddingInlineStart) - indent;
    const gutter = Math.min(padding, Number.parseFloat(style.paddingInlineEnd));
    // The nearest the content may start to the cell edge, without the indent.
    const clear = padding - gutter;
    for (const content of [first, first.firstElementChild]) {
      if (content == null) continue;
      const rect = content.getBoundingClientRect();
      if (rect.width === 0) continue;
      // Rounded to a hundredth of a pixel, so float noise never moves the text.
      const need = Math.round((clear + indent - (start(rect) - cellStart)) * 100) / 100;
      if (need > (indents[id] ?? 0)) indents[id] = need;
    }
  }
  return indents;
}

/** Shallow equality of two indent maps, so an unchanged measure keeps its state. */
export function sameIndents(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}

/**
 * The side a column aligns to, from its `meta.align` (see DataTableColumnMeta).
 * TanStack types `meta` as the consumer's own ColumnMeta, so it is read loosely.
 */
export function columnAlign(meta: unknown): NonNullable<DataTableColumnMeta['align']> {
  return (meta as DataTableColumnMeta | undefined)?.align === 'end' ? 'end' : 'start';
}

/** A column's width from its `meta.width` (see DataTableColumnMeta), if it sets one. */
export function columnWidth(meta: unknown): DataTableColumnMeta['width'] {
  return cssLength((meta as DataTableColumnMeta | undefined)?.width);
}

/**
 * A column's minimum width: its `meta.minWidth`, else its `meta.width`, so a
 * set width is also a floor (see DataTableColumnMeta).
 */
export function columnMinWidth(meta: unknown): DataTableColumnMeta['minWidth'] {
  const column = meta as DataTableColumnMeta | undefined;
  return cssLength(column?.minWidth) ?? cssLength(column?.width);
}

function cssLength(value: unknown): number | string | undefined {
  return typeof value === 'number' || typeof value === 'string' ? value : undefined;
}
