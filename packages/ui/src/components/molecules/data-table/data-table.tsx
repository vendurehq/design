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
import { Tooltip, TooltipContent, TooltipTrigger } from '@vendure-io/ui/components/atoms/tooltip';
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
  DataTableRowCellProps,
  DataTableRowRipple,
  DataTableRowSelectProps,
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
import { ChevronRight } from 'lucide-react';
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
// Relative: `data-table-selection-storage` is closed in the package exports.
import { useSelectionStorage } from './data-table-selection-storage.tsx';

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
// clickable above the link takes `data-table-row-control`. The rules sit on
// the table, not on the built-in row, so a row from `renderRow` gets them too.
// The class names stay literal so Tailwind can scan them.
const LINKED_ROW_CLASS = cn(
  '[&_tr:has([data-slot=data-table-row-link])]:relative [&_tr:has([data-slot=data-table-row-link])]:cursor-pointer',
  // While rows are selected, a click selects: the row does not look like a link.
  // Keyed on its own attribute, which a press on the select-all checkbox sets
  // before the click (useSelectAllRipple): the cursor is inherited, so its
  // change restyles every cell of every row.
  '[&[data-selecting-cursor]_tr]:cursor-default!',
  '[&_tr:has([data-slot=data-table-row-link])_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-tooltip-trigger],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=copyable-text],[data-table-row-control]):not([data-slot=data-table-row-link],[data-slot=checkbox],[data-slot=id-chip]_*,[data-slot=anonymized-token]_*,[data-slot=copyable-text]_*)]:relative',
  '[&_tr:has([data-slot=data-table-row-link])_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-tooltip-trigger],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=copyable-text],[data-table-row-control]):not([data-slot=data-table-row-link],[data-slot=checkbox],[data-slot=id-chip]_*,[data-slot=anonymized-token]_*,[data-slot=copyable-text]_*)]:z-10',
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
 *
 * While rows are selected, a click on a built-in row selects it, and only
 * the name opens the item. A row from `renderRow` does the same when it
 * spreads `ctx.selectProps`; without it, its link keeps covering the row. The link stops stretching over the row and the row-end
 * chevron hides. Hovering the row shows a small chevron after the name;
 * hovering or focusing the name colours it and the chevron blue, and the
 * chevron moves 2px toward the end. The blue is `brand-text`, the brand
 * step that reads as text: `brand-indicator` is a mark colour and reads below
 * 3:1 as text on a light selected row. The chevron overlays the
 * cell's padding, so the name and the column do not move. The name stays a
 * tab stop and a link, and its focus ring is drawn around the name.
 *
 * A link with no visible text (its children are `sr-only`, as when the cell
 * shows the item's code as a copy chip) has no name to click. While rows are
 * selected its target is the row-end chevron: it covers the chevron slot at
 * the end of the row, the full row height, the chevron stays on row hover and
 * turns blue on the target's hover or focus, and the focus ring goes around
 * the slot. A click anywhere else on the row selects it.
 */
function DataTableRowLink({
  className,
  render,
  children,
  ...props
}: useRender.ComponentProps<'a'>) {
  // A link whose text is all screen-reader only (a code shown as a copy chip
  // next to it) has no visible name to click while rows are selected. Then its
  // target is the row-end chevron instead.
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const [nameless, setNameless] = React.useState(false);
  React.useLayoutEffect(() => {
    const link = linkRef.current;
    if (link) setNameless(link.getBoundingClientRect().width < 1);
  });
  return useRender({
    defaultTagName: 'a',
    render,
    ref: linkRef,
    props: mergeProps<'a'>(
      {
        className: cn(
          'group/row-link cursor-pointer font-medium text-foreground outline-none',
          'after:absolute after:inset-0 after:z-1 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring focus-visible:after:outline-solid',
          // While rows are selected only the name is the link (see above).
          'in-data-click-selects:after:hidden in-data-click-selects:rounded-sm in-data-click-selects:transition-colors in-data-click-selects:duration-quick in-data-click-selects:ease-soft',
          'in-data-click-selects:hover:text-brand-text in-data-click-selects:focus-visible:text-brand-text',
          'in-data-click-selects:focus-visible:outline-2 in-data-click-selects:focus-visible:outline-offset-2 in-data-click-selects:focus-visible:outline-ring in-data-click-selects:focus-visible:outline-solid',
          // Without a visible name, the link covers the row-end chevron slot
          // instead: the full row height, as wide as the slot. Its focus ring
          // is drawn around that slot.
          'in-data-click-selects:data-nameless:after:block in-data-click-selects:data-nameless:after:start-auto in-data-click-selects:data-nameless:after:w-[calc(var(--card-px)+--spacing(7))] in-data-click-selects:data-nameless:after:rounded-md',
          'in-data-click-selects:data-nameless:focus-visible:outline-none',
          className,
        ),
        children: (
          <>
            {children}
            {/* An empty inline box at the end of the name, so the chevron after
                the name is placed without taking any space. */}
            <span aria-hidden="true" data-slot="data-table-row-link-mark" className="relative">
              <ChevronRight
                strokeWidth={1.75}
                className={cn(
                  'pointer-events-none absolute start-1 top-1/2 size-3.75 -translate-y-1/2 opacity-0 rtl:-scale-x-100',
                  '[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft),translate_var(--transition-duration-normal)_var(--ease-out)]',
                  'in-data-click-selects:group-hover/row:opacity-45 in-data-click-selects:group-hover/row-link:opacity-100 in-data-click-selects:group-focus-visible/row-link:opacity-100',
                  'in-data-click-selects:group-hover/row-link:translate-x-0.5 in-data-click-selects:group-focus-visible/row-link:translate-x-0.5 rtl:in-data-click-selects:group-hover/row-link:-translate-x-0.5 rtl:in-data-click-selects:group-focus-visible/row-link:-translate-x-0.5',
                  'motion-reduce:translate-x-0!',
                )}
              />
            </span>
            <ListRowChevron
              data-slot="data-table-row-chevron"
              className={cn(
                'pointer-events-none absolute end-(--card-px) top-1/2 -translate-y-1/2 in-data-selecting:hidden',
                // The target of a link without a visible name while rows are
                // selected: shown on row hover, blue on its own hover or focus.
                'in-data-click-selects:group-data-nameless/row-link:block in-data-click-selects:group-data-nameless/row-link:transition-[opacity,translate,color]',
                'in-data-click-selects:group-data-nameless/row-link:group-hover/row-link:text-brand-text in-data-click-selects:group-data-nameless/row-link:group-focus-visible/row-link:text-brand-text',
              )}
            />
          </>
        ),
      },
      props,
    ),
    // `nameless` renders as `data-nameless` while true.
    state: { slot: 'data-table-row-link', nameless },
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

// The bulk bar enters after what it replaces has faded out: `bandRowFade`
// after one --transition-duration-fast. It covers the controls row's place, or
// with no controls row (no header, or a title only) the column header row, so
// it never opens a row of its own and the table never moves.
const bulkBarFade = {
  ...bandRowFade,
  animate: { ...bandRowFade.animate, transition: { ...bandRowFade.transition, delay: 0.1 } },
} as const;

// The controls row while the bulk bar takes its place: faded out, then hidden;
// back only after the bar has left.
const controlsSwap = {
  hidden: {
    ...bandRowFade.exit,
    transition: bandRowFade.transition,
    transitionEnd: { visibility: 'hidden' },
  },
  shown: {
    ...bandRowFade.animate,
    visibility: 'visible',
    transition: { ...bandRowFade.transition, delay: 0.1 },
  },
} as const;

// The labels under a covering bulk bar: hidden (so their sort controls leave
// the tab order) once they have faded out, and back only after the bar left.
const HEADER_LABEL_UNDER_BULK_CLASS =
  'transition-[opacity,visibility] duration-fast ease-soft delay-(--transition-duration-fast) in-data-bulk-over-header:invisible in-data-bulk-over-header:opacity-0 in-data-bulk-over-header:delay-0';

// While rows are selected, a click on a row selects it instead of opening it.
// These elements in a row keep their own click: the same list the linked row
// lifts above its stretched link, plus the select checkbox and menu items. The
// row link is not one of them: while rows are selected it does not stretch,
// and the click handler lets a click on the name through. Only a
// control inside the row counts: an ancestor of the table that matches (an app
// shell's `<main tabindex="-1">`, the skip link target) is not a row control.
const ROW_CONTROL_SELECTOR =
  '[data-slot=data-table-select-area],a:not([data-slot=data-table-row-link]),button,input,select,textarea,[role=button],[role=checkbox],[role=menuitem],[tabindex]:not([data-slot=data-table-row-link]),[data-tooltip-trigger],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=copyable-text],[data-table-row-control]';

// The click area of a select checkbox is its whole cell: the full height of
// the row, from the table's start edge to where the leading cell's content
// starts (its gutter, `--spacing(8)` plus its indent). The select cell is
// zero-width, so the area is floated over that gutter, under the checkbox and
// above the row link's stretched ::after. It is not focusable: keyboard focus
// and the focus ring stay on the checkbox. The checkbox's own enlarged hit
// area is turned off here, since it reached past the gutter into the content.
const SELECT_AREA_CLASS =
  'absolute inset-y-0 start-0 z-10 w-[calc(var(--spacing)*8+var(--column-indent,0px))]';
const SELECT_CHECKBOX_HIT_CLASS = 'after:hidden';

// Select all and clear all from the header checkbox ripple down the page: the
// change starts at the header checkbox and travels down, row by row. A row's
// fill, bar and checkbox move together, each with its own transition, only
// delayed. The selection itself changes at once, so a click during the ripple
// lands on the final state; only the look lags behind, for at most the
// ripple's length plus a row's own transition.
//
// The table carries `data-select-ripple` (select or clear) while it runs.
// `--select-ripple-length` is when the last row starts: `normal` (200ms) for
// select all, `fast` (100ms) for clear all and for the keyboard
// (`data-select-ripple-quick`). It does not grow with the number of rows: 50
// rows take as long as 10, each row gets a shorter share (see
// SELECT_RIPPLE_ROWS). The rows start on an
// ease-out (sine) curve: a row's start is `asin(index / rows)` of the length,
// so the first rows below the header follow each other fastest and the ripple
// settles towards the bottom. Each row carries its start and its share as
// fractions (`--ripple-at`, `--ripple-span`, see rippleTiming).
//
// The bar reads as one line that grows down from the header: each row's two
// halves grow from the row's top edge, linearly, over the row's share, so the
// next row picks up exactly where this one ends. Clearing retracts the line
// from the top in the same order. Each row's bar also fades in and widens as
// it does alone (see the bar in atoms/table), from the row's delay, so the
// newest part of the line is the faintest and thinnest; clearing fades it in
// `fast`. A row the select ripple has not reached yet
// starts from its top edge with no transition, so it does not first slide
// from its middle; that start is set, and the style flushed, before the
// selection changes (useSelectAllRipple). Only `clip-path`, `opacity`, `scale` and the
// row's existing colour transition move; nothing changes layout.
const SELECT_RIPPLE_TABLE_CLASS =
  '[--select-ripple-length:var(--transition-duration-fast)] data-[select-ripple=select]:[--select-ripple-length:var(--transition-duration-normal)] data-select-ripple-quick:[--select-ripple-length:var(--transition-duration-fast)]!';
const SELECT_RIPPLE_ROW_CLASS = cn(
  '[--row-ripple-delay:calc(var(--select-ripple-length)*var(--ripple-at,0))] [--row-ripple-span:calc(var(--select-ripple-length)*var(--ripple-span,0))]',
  'in-data-select-ripple:[transition-delay:var(--row-ripple-delay)]',
  'in-data-[select-ripple=select]:before:[transition:clip-path_var(--row-ripple-span)_linear_var(--row-ripple-delay),opacity_var(--transition-duration-moderate)_var(--ease-soft)_var(--row-ripple-delay),scale_var(--transition-duration-moderate)_var(--ease-out)_var(--row-ripple-delay)]! in-data-[select-ripple=select]:after:[transition:clip-path_var(--row-ripple-span)_linear_var(--row-ripple-delay),opacity_var(--transition-duration-moderate)_var(--ease-soft)_var(--row-ripple-delay),scale_var(--transition-duration-moderate)_var(--ease-out)_var(--row-ripple-delay)]!',
  'in-data-[select-ripple=clear]:before:[transition:clip-path_var(--row-ripple-span)_linear_var(--row-ripple-delay),opacity_var(--transition-duration-fast)_var(--ease-soft)_var(--row-ripple-delay),scale_var(--transition-duration-fast)_var(--ease-soft)_var(--row-ripple-delay)]! in-data-[select-ripple=clear]:after:[transition:clip-path_var(--row-ripple-span)_linear_var(--row-ripple-delay),opacity_var(--transition-duration-fast)_var(--ease-soft)_var(--row-ripple-delay),scale_var(--transition-duration-fast)_var(--ease-soft)_var(--row-ripple-delay)]!',
  'in-data-[select-ripple=select]:not-data-[state=selected]:before:[clip-path:inset(0_0_100%_0)]! in-data-[select-ripple=select]:not-data-[state=selected]:after:[clip-path:inset(0_0_100%_0)]!',
  'in-data-[select-ripple=select]:not-data-[state=selected]:before:[transition:none]! in-data-[select-ripple=select]:not-data-[state=selected]:after:[transition:none]!',
  'in-data-[select-ripple=clear]:not-data-[state=selected]:before:[clip-path:inset(100%_0_0_0)]! in-data-[select-ripple=clear]:not-data-[state=selected]:after:[clip-path:inset(100%_0_0_0)]!',
);
// The row checkbox keeps its own transitions (the fill, the mark revealed with
// it, the fade in) and only takes the row's delay. Row checkboxes are never
// indeterminate, so their mark never swaps and needs no delay.
const SELECT_RIPPLE_CHECKBOX_CLASS =
  'in-data-select-ripple:[transition-delay:var(--row-ripple-delay)]! in-data-select-ripple:before:[transition-delay:var(--row-ripple-delay)]! in-data-select-ripple:[&>[data-slot=checkbox-indicator]]:[transition-delay:var(--row-ripple-delay)]!';
// Long enough for the last row to start (`normal`) and finish its slowest
// transition (the checkbox fill and mark, under 400ms).
const SELECT_RIPPLE_SETTLE_MS = 700;

// The ripple spreads over at most this many rows, about two screens of rows.
// Spread over all 50 rows of a long page, the rows on screen would pass in a
// few milliseconds and the page would look like it changed at once; this way
// the rows on screen ripple the same on a page of 20 or of 50. Rows below it
// start together at the end of the ripple, usually out of view.
const SELECT_RIPPLE_ROWS = 20;

/** Where a row starts in the ripple and its share of it, as fractions of the length. */
function rippleTiming(index: number, count: number): React.CSSProperties {
  const rows = Math.min(count, SELECT_RIPPLE_ROWS);
  const at = (position: number) => Math.asin(Math.min(position / rows, 1)) / (Math.PI / 2);
  const start = Math.min(index, rows - 1);
  return {
    '--ripple-at': at(start).toFixed(4),
    '--ripple-span': (at(start + 1) - at(start)).toFixed(4),
  } as React.CSSProperties;
}

/**
 * Select all and clear all with the ripple. While a ripple runs, the next one
 * takes over from wherever each row is: the transitions retarget, nothing
 * restarts from zero. Reduced motion: no ripple, the rows change together.
 * Any other selection change (a row click) ends the ripple first, so it is
 * not delayed.
 *
 * It also owns `data-selecting-cursor`, the row cursor while rows are
 * selected. A press on the select-all checkbox prepares the click in the
 * frames between press and release, where nothing else happens: it sets the
 * ripple's start and the row cursor the click will need. The click then
 * changes only the rows' selection. The pointer is on the header meanwhile,
 * so no row shows its cursor early. A press that ends without a click puts
 * both back. A click without a prepared frame (Space, a fast synthetic click)
 * does the same work in its own frame.
 */
function useSelectAllRipple(
  tableRef: React.RefObject<HTMLTableElement | null>,
  /** Whether rows are selected, as of the last render. */
  selectingRef: React.RefObject<boolean>,
) {
  const reduceMotion = useReducedMotion();
  const reduceMotionRef = React.useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;
  const timer = React.useRef<number | undefined>(undefined);
  const prepared = React.useRef<SelectAllPrep | null>(null);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  // Every commit puts the cursor in line with the selection, unless a press
  // is waiting for its click.
  React.useLayoutEffect(() => {
    if (prepared.current == null) {
      tableRef.current?.toggleAttribute('data-selecting-cursor', selectingRef.current);
    }
  });
  return React.useMemo(() => {
    const end = () => {
      window.clearTimeout(timer.current);
      const element = tableRef.current;
      if (!element) return;
      delete element.dataset.selectRipple;
      delete element.dataset.selectRippleQuick;
    };
    const setRipple = (element: HTMLElement, value: boolean, quick: boolean) => {
      element.dataset.selectRipple = value ? 'select' : 'clear';
      if (quick) element.dataset.selectRippleQuick = '';
      else delete element.dataset.selectRippleQuick;
    };
    // `quick` asks for the keyboard's ripple. A click after a pointer press is
    // never quick: Base UI hands the checkbox's click over as its hidden
    // input's click, with detail 0, which reads as the keyboard.
    const toggleAll = <TData,>(table: TanStackTable<TData>, value: boolean, keyboard: boolean) => {
      const prep = prepared.current;
      prepared.current = null;
      const quick = keyboard && prep == null;
      const element = tableRef.current;
      if (!element || reduceMotionRef.current) {
        end();
        table.toggleAllPageRowsSelected(value);
        return;
      }
      // Prepared for this click, and a frame has shown the start: nothing to
      // flush. Otherwise a fresh select ripple lets the rows take their start
      // (the bar at the top edge) before the selection changes, or they would
      // transition from their middle. A running ripple is not flushed: its
      // rows retarget from where they are.
      const ready = prep?.shown === true && prep.value === value;
      const running = !ready && element.dataset.selectRipple != null;
      setRipple(element, value, quick);
      if (!ready && !running) void element.offsetHeight;
      table.toggleAllPageRowsSelected(value);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(end, SELECT_RIPPLE_SETTLE_MS);
    };
    // A press on the select-all checkbox: `value` is what its click will set,
    // `selectingAfter` whether rows stay selected after it.
    const prepare = (value: boolean, selectingAfter: boolean) => {
      const element = tableRef.current;
      if (!element || prepared.current != null) return;
      const prep: SelectAllPrep = {
        value,
        shown: false,
        ripple: element.dataset.selectRipple,
      };
      prepared.current = prep;
      // After the frame that shows the press, so the press stays quick.
      requestAnimationFrame(() =>
        window.setTimeout(() => {
          if (prepared.current !== prep) return;
          element.toggleAttribute('data-selecting-cursor', selectingAfter);
          if (!reduceMotionRef.current && prep.ripple == null) setRipple(element, value, false);
          requestAnimationFrame(() =>
            window.setTimeout(() => {
              if (prepared.current === prep) prep.shown = true;
            }),
          );
        }),
      );
      // The click, if there is one, comes in the same task as the release.
      const release = () => {
        window.removeEventListener('pointerup', release, true);
        window.removeEventListener('pointercancel', release, true);
        window.setTimeout(() => {
          if (prepared.current !== prep) return;
          prepared.current = null;
          if (prep.ripple == null) {
            delete element.dataset.selectRipple;
            delete element.dataset.selectRippleQuick;
          }
          element.toggleAttribute('data-selecting-cursor', selectingRef.current);
        });
      };
      window.addEventListener('pointerup', release, true);
      window.addEventListener('pointercancel', release, true);
    };
    return { toggleAll, end, prepare };
  }, [tableRef, selectingRef]);
}

type SelectAllPrep = {
  value: boolean;
  /** A frame has shown the prepared start since the press. */
  shown: boolean;
  /** A running ripple at the press; without one, a press with no click removes the prepared start. */
  ripple: string | undefined;
};

/**
 * A press on the select-all checkbox: its click selects the whole page unless
 * all of it is selected, and rows stay selected after it unless it clears the
 * last of them (rows selected on other pages stay).
 */
function prepareSelectAll<TData>(
  table: TanStackTable<TData>,
  ripple: { prepare: (value: boolean, selectingAfter: boolean) => void },
) {
  const value = !table.getIsAllPageRowsSelected();
  const pageIds = new Set(table.getRowModel().rows.map((row) => row.id));
  const otherPages = getSelectedRowIds(table.getState().rowSelection).some(
    (id) => !pageIds.has(id),
  );
  ripple.prepare(value, value || otherPages);
}

/** A checkbox toggled with Space: a keyboard event, or a click with no pointer (detail 0). */
function fromKeyboard(event: Event | undefined): boolean {
  return (
    (typeof KeyboardEvent !== 'undefined' && event instanceof KeyboardEvent) ||
    (typeof MouseEvent !== 'undefined' && event instanceof MouseEvent && event.detail === 0)
  );
}

// How far a press may move before release and still count as a click on the row.
const ROW_PRESS_SLOP = 4;

function isRowControl(target: Element, row: Element): boolean {
  const control = target.closest(ROW_CONTROL_SELECTOR);
  return control != null && row.contains(control);
}

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
  selectionStorageKey,
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
      selectAllOnPage: labels?.selectAllOnPage ?? 'Select all on this page',
      clearPageSelection: labels?.clearPageSelection ?? 'Clear selection on this page',
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
  const storedRowSelection = useSelectionStorage(selectionStorageKey, rowSelection);
  const [selectionState, onRowSelectionChange] = useControlledTableState<RowSelectionState>(
    storedRowSelection,
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
  const tableRef = React.useRef<HTMLTableElement>(null);
  const selectingRef = React.useRef(false);
  const selectAllRipple = useSelectAllRipple(tableRef, selectingRef);
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
            <>
              <span
                aria-hidden
                data-slot="data-table-select-area"
                className={SELECT_AREA_CLASS}
                onPointerDown={() => prepareSelectAll(table, selectAllRipple)}
                onClick={() =>
                  selectAllRipple.toggleAll(table, !table.getIsAllPageRowsSelected(), false)
                }
              />
              {/* The tooltip says what a press does now. Some rows selected
                  (indeterminate) is not all: a press selects the rest of the
                  page, as with none selected. All selected: a press clears
                  this page only; rows selected on other pages stay. The
                  accessible name stays `selectAllRows`. */}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Checkbox
                      data-slot="checkbox"
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={
                        table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
                      }
                      onPointerDown={() => prepareSelectAll(table, selectAllRipple)}
                      onCheckedChange={(checked, details) =>
                        selectAllRipple.toggleAll(table, checked, fromKeyboard(details.event))
                      }
                      aria-label={displayProps.current.l.selectAllRows}
                      className={cn(
                        'absolute top-1/2 start-2 z-10 -translate-y-1/2 opacity-0 group-hover/header-row:opacity-100 focus-visible:opacity-100 data-checked:opacity-100 data-indeterminate:opacity-100',
                        SELECT_CHECKBOX_HIT_CLASS,
                      )}
                    />
                  }
                />
                <TooltipContent>
                  {table.getIsAllPageRowsSelected()
                    ? displayProps.current.l.clearPageSelection
                    : displayProps.current.l.selectAllOnPage}
                </TooltipContent>
              </Tooltip>
            </>
          ),
          cell: ({ row, table }) => (
            <>
              {row.getCanSelect() && (
                <span
                  aria-hidden
                  data-slot="data-table-select-area"
                  className={SELECT_AREA_CLASS}
                  onClick={(event) => {
                    selectAllRipple.end();
                    selectFromClick(table, row, event.shiftKey, selectionAnchor);
                  }}
                  // Shift+press would also extend the page's text selection.
                  onMouseDown={(event) => {
                    if (event.shiftKey) event.preventDefault();
                  }}
                />
              )}
              <Checkbox
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onCheckedChange={(checked, details) => {
                  selectAllRipple.end();
                  selectFromClick(
                    table,
                    row,
                    Boolean((details.event as MouseEvent | KeyboardEvent | undefined)?.shiftKey),
                    selectionAnchor,
                    checked,
                  );
                }}
                aria-label={displayProps.current.l.selectRow(row.index)}
                className={cn(
                  'absolute top-1/2 start-2 z-10 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-checked:opacity-100',
                  SELECT_CHECKBOX_HIT_CLASS,
                  SELECT_RIPPLE_CHECKBOX_CLASS,
                )}
              />
            </>
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
  }, [columns, hasRowSelection, hasRowActions, selectColumnId, selectAllRipple]);

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
    // `ps-0!`: the select cell is the first child, so CardTable's edge-cell
    // padding would otherwise widen the zero-width cell and push the whole
    // gutter arrangement out; important because CardTable's descendant rule
    // out-specifies a plain utility on the cell.
    if (generated === 'select') return 'relative w-0 p-0 ps-0!';
    // Every other cell adds its column's indent (`--column-indent`, see
    // `columnIndents`) to its start padding. CardTable's edge-cell padding
    // adds it too.
    if (id === leadingColumnId) return 'ps-[calc(var(--spacing)*8+var(--column-indent,0px))]';
    // Actions cells drop vertical padding so a row-action button (taller than a
    // text line) sits inside the natural row height rather than inflating every
    // row; `align-middle` on the cell keeps it centred.
    return cn(
      'ps-[calc(var(--spacing)*2+var(--column-indent,0px))]',
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
  // A cell with a two-line status (StatusBadge `appearance="icon"` with a
  // `detail`) drops to 6px vertical padding, so its 33px block fits the 48px
  // row minimum and the row stays 48px, the same as a one-line row.
  const bodyCellClass =
    '[--content-inset:0px] [:where(&>:first-child)]:-ms-(--content-inset) has-[[data-slot=status-badge][data-detail]]:py-1.5';

  // A pull-back that reaches past the cell's start padding indents the whole
  // column instead (see measureColumnIndents), so no content leaves its cell.
  // Measured before paint, whenever the rows or the visible columns change.
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
  const columnIndentStyle = (columnId: string): React.CSSProperties | undefined => {
    // The select cell's click area ends where the leading cell's content
    // starts, so it takes the leading column's indent.
    const id =
      generatedColumn(columnId) === 'select' && leadingColumnId != null
        ? leadingColumnId
        : columnId;
    return columnIndents[id]
      ? ({ '--column-indent': `${columnIndents[id]}px` } as React.CSSProperties)
      : undefined;
  };

  // What a built-in body cell of this column carries. Handed to `renderRow` as
  // `ctx.cellProps`, so a row a consumer renders itself takes the select cell's
  // and the leading cell's classes from here instead of copying them.
  const bodyCellProps = (columnId: string): DataTableRowCellProps => ({
    'data-column-id': columnId,
    'data-content-inset-cell': '',
    className: cn(columnClass(columnId), bodyCellClass),
    style: columnIndentStyle(columnId),
  });

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
  // The bulk bar exists only while rows are selected. It takes the controls
  // row's place, or, with no controls row, covers the column header row (see
  // `bulkBarFade`): it never opens a band of its own, so the table never
  // moves when the first row is selected or the last one cleared.
  const selecting =
    rowSelection != null && getSelectedRowIds(table.getState().rowSelection).length > 0;
  selectingRef.current = selecting;
  const showBulk = selecting && bulkActions != null;

  // While rows are selected, a plain click on a row selects or deselects it
  // and does not open the item: capture phase, so a router link never sees the
  // click. Clicks that still open the item: a click on the name (the row link,
  // which no longer stretches over the row), the keyboard (Enter fires a click
  // with detail 0), Cmd/Ctrl/Alt+click, and the middle button (auxclick). Row controls keep their own click, and a
  // click inside a portal (an open row menu) is not the row's.
  // A press that starts on a row control (a drag handle) or moves before it is
  // released is not a click on the row: a drag never selects.
  const rowPress = React.useRef<{ x: number; y: number; onControl: boolean } | null>(null);
  const onRowPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    rowPress.current = {
      x: event.clientX,
      y: event.clientY,
      onControl: isRowControl(event.target as Element, event.currentTarget),
    };
  };
  const onRowClickCapture = (row: Row<TData>) => (event: React.MouseEvent<HTMLElement>) => {
    const press = rowPress.current;
    rowPress.current = null;
    if (!selecting || !row.getCanSelect()) return;
    if (event.button !== 0 || event.detail === 0) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (
      press != null &&
      (press.onControl ||
        Math.hypot(event.clientX - press.x, event.clientY - press.y) > ROW_PRESS_SLOP)
    ) {
      return;
    }
    const target = event.target as Element;
    if (!event.currentTarget.contains(target) || isRowControl(target, event.currentTarget)) return;
    // The name: the row link does not stretch while rows are selected, so a
    // click that lands in it was on the name, and opens the item. Shift+click
    // on it still extends the selection.
    if (!event.shiftKey && target.closest('[data-slot=data-table-row-link]')) return;
    event.preventDefault();
    event.stopPropagation();
    selectAllRipple.end();
    selectFromClick(table, row, event.shiftKey, selectionAnchor);
  };
  // Shift+press would also extend the page's text selection across the rows.
  const onRowMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    if (
      selecting &&
      event.shiftKey &&
      !isRowControl(event.target as Element, event.currentTarget)
    ) {
      event.preventDefault();
    }
  };
  // Click-to-select for one row: the built-in row spreads it, and `renderRow`
  // hands the same props over as `ctx.selectProps`.
  const rowSelectProps = (row: Row<TData>): DataTableRowSelectProps => ({
    // DataTableRowLink keys its look on this attribute: only the name opens
    // the item while a click on the row selects it.
    'data-click-selects': selecting && row.getCanSelect() ? '' : undefined,
    onClickCapture: onRowClickCapture(row),
    onMouseDown: onRowMouseDown,
    onPointerDown: onRowPointerDown,
  });

  // No controls row for the bulk bar to replace: it covers the column header row.
  const bulkOverHeader = !showControls && rowSelection != null && bulkActions != null;
  const bulkRender = showBulk ? bulkActions : undefined;

  const bands = (
    <>
      {showHeader && (
        <CardHeader className="border-b">
          <ListHeader>
            {header}
            {/* Replace-on-select: while rows are selected the bulk bar takes
                the controls row's place (title and applied-filter chips stay).
                Both share one grid cell, and the controls row stays mounted
                (faded, hidden and inert), so the cell keeps the row's height
                from the first frame, with nothing to measure. The bar is
                centred in it; -my-1 lets a bar up to 8px taller (a 32px bar
                over a 28px row) overhang the band's padding instead of growing
                the band. Only a bar that wraps grows it. The swap fades out
                then in, one --transition-duration-fast (100ms) per phase.
                Under reduced motion MotionConfig drops the 4px rise and keeps
                the fade. */}
            {showControls && (
              <MotionConfig reducedMotion="user">
                <div className="grid">
                  <motion.div
                    className="[grid-area:1/1]"
                    initial={false}
                    animate={bulkRender ? controlsSwap.hidden : controlsSwap.shown}
                    inert={bulkRender ? true : undefined}
                  >
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
                  <AnimatePresence initial={false}>
                    {bulkRender && (
                      <motion.div
                        key="bulk-actions"
                        {...bulkBarFade}
                        className="-my-1 self-center [grid-area:1/1]"
                      >
                        <DataTableBulkActions
                          table={table}
                          cache={selectionCache}
                          render={bulkRender}
                          className="min-h-0"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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

      <CardTable className={bulkOverHeader ? 'relative isolate' : undefined}>
        {bulkOverHeader && (
          // Over the column header row (h-10, as TableHead), after the select
          // slot: the bar starts where the leading column's label starts, and
          // the wrapper lets the pointer through to the select-all checkbox.
          // First in the DOM, so the bar comes before the rows in tab order.
          <MotionConfig reducedMotion="user">
            <AnimatePresence initial={false}>
              {bulkRender && (
                <motion.div
                  key="bulk-over-header"
                  {...bulkBarFade}
                  className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-10 items-center ps-8 pe-(--card-px)"
                >
                  <DataTableBulkActions
                    table={table}
                    cache={selectionCache}
                    render={bulkRender}
                    className="pointer-events-auto min-h-0 flex-nowrap"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </MotionConfig>
        )}
        <Table
          ref={tableRef}
          className={cn(LINKED_ROW_CLASS, ROW_CHEVRON_SLOT_CLASS, SELECT_RIPPLE_TABLE_CLASS)}
          data-selecting={selecting ? '' : undefined}
          data-bulk-over-header={bulkOverHeader && showBulk ? '' : undefined}
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
                      className={cn(
                        columnClass(headerCell.column.id),
                        generatedColumn(headerCell.column.id) !== 'select' &&
                          HEADER_LABEL_UNDER_BULK_CLASS,
                      )}
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
                {bodyRows.map((row, rowIndex) => {
                  const ripple: DataTableRowRipple = {
                    className: SELECT_RIPPLE_ROW_CLASS,
                    style: rippleTiming(rowIndex, bodyRows.length),
                  };
                  const selectProps = rowSelectProps(row);
                  const rowNode = (
                    <TableRow
                      className={cn('group/row', ripple.className)}
                      style={ripple.style}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      {...selectProps}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} {...bodyCellProps(cell.column.id)}>
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
                      {renderRow
                        ? renderRow(row, {
                            table,
                            columnCount,
                            defaultRow,
                            ripple,
                            cellProps: bodyCellProps,
                            selectProps,
                          })
                        : defaultRow}
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
