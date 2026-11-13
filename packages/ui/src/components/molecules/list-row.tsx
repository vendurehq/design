import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChevronRight } from 'lucide-react';
import type * as React from 'react';

// Compound-only, like PageHeader: callers assemble the parts, so a row can hold
// any mix of leading media, a status column, a time and row actions without an
// ever-growing prop set.
//
// The row link is a stretched link. ListRowLink is the one real link or button
// of the row; its ::after covers the whole row, so a click on any point of the
// row opens it, while keyboard and screen reader users get one tab stop and one
// accessible name (the title). Interactive elements inside the row (buttons,
// links, menus, copy chips) are lifted above the stretched area, so they keep
// their own click and their own tab stop. A row without ListRowLink is static:
// no hover fill, no pointer cursor.

// Every interactive descendant, every Tooltip trigger and the copy chips
// (IdChip, AnonymizedToken, CopyableText), except the row link itself. A copy
// chip is lifted as a whole and its inner button stays static, as in a
// DataTable row: a positioned copy button becomes the containing block of its
// own stretched ::after, which then shrinks to the icon, so a click on the
// value would copy nothing. Any other element that must stay hoverable above
// the link takes `data-list-row-control`. The class names stay literal so
// Tailwind can scan them.
const LIFT_CONTROLS =
  '[&_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-tooltip-trigger],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=copyable-text],[data-list-row-control]):not([data-slot=list-row-link],[data-slot=id-chip]_*,[data-slot=anonymized-token]_*,[data-slot=copyable-text]_*)]:relative [&_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-tooltip-trigger],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=copyable-text],[data-list-row-control]):not([data-slot=list-row-link],[data-slot=id-chip]_*,[data-slot=anonymized-token]_*,[data-slot=copyable-text]_*)]:z-10';

// A row the user just added (`enter="new"`) enters once: its height opens from 0
// so the rows below glide down, then its content fades in from a 3px blur.
// @starting-style runs it on mount only, so a list never animates on page
// load unless the caller marks rows. `interpolate-size` lets the height run to
// `auto`, which keeps a two-line row exact; a browser without it skips the
// height and keeps the fade. The height opens in `row-enter` on the `height`
// curve, the curve of the Accordion panel; the content fades in `slow` on
// `soft` and unblurs on `out`, both a `fast` beat later. Reduced motion keeps
// the fade only.
const ENTER_NEW =
  'data-[enter=new]:overflow-clip data-[enter=new]:[interpolate-size:allow-keywords] motion-safe:data-[enter=new]:[transition:height_var(--transition-duration-row-enter)_var(--ease-height),min-height_var(--transition-duration-row-enter)_var(--ease-height),opacity_var(--transition-duration-slow)_var(--ease-soft)_var(--transition-duration-fast),filter_var(--transition-duration-slow)_var(--ease-out)_var(--transition-duration-fast),background-color_var(--transition-duration-fast)_var(--ease-default)] motion-safe:data-[enter=new]:starting:h-0 motion-safe:data-[enter=new]:starting:min-h-0 motion-safe:data-[enter=new]:starting:blur-[3px] data-[enter=new]:starting:opacity-0 motion-reduce:data-[enter=new]:[transition:opacity_var(--transition-duration-normal)_var(--ease-default),background-color_var(--transition-duration-fast)_var(--ease-default)]';

// Rows that a "Show older" action adds (`enter={{ stagger }}`) enter once, 28ms after
// the row above: each fades in and rises 6px out of a 3px blur on the strong
// ease-out. The delay stops growing after 12 rows, so a long page does not
// keep its last rows waiting. Reduced motion keeps a plain fade, without the
// stagger. The hover fill keeps its own timing, without the delay.
const ENTER_STAGGER =
  'motion-safe:data-[enter=stagger]:[transition:opacity_var(--transition-duration-slow)_var(--ease-out)_var(--list-row-stagger-delay),translate_var(--transition-duration-slow)_var(--ease-out)_var(--list-row-stagger-delay),filter_var(--transition-duration-slow)_var(--ease-out)_var(--list-row-stagger-delay),background-color_var(--transition-duration-fast)_var(--ease-default)] data-[enter=stagger]:starting:opacity-0 motion-safe:data-[enter=stagger]:starting:translate-y-1.5 motion-safe:data-[enter=stagger]:starting:blur-[3px] motion-reduce:data-[enter=stagger]:[transition:opacity_var(--transition-duration-normal)_var(--ease-default),background-color_var(--transition-duration-fast)_var(--ease-default)]';

const STAGGER_MS = 28;
const STAGGER_ROWS = 12;

interface ListRowProps extends React.ComponentProps<'div'> {
  /**
   * How a row added while the page is open enters. Leave it unset on rows of
   * the first render, so the list does not animate on page load.
   *
   * - `'new'`: a row the user just added (a new backup, a new push). Its
   *   height opens, then its content fades in.
   * - `{ stagger: n }`: a row that a "Show older" action adds, `n` being its
   *   position among the added rows (0, 1, 2…). It fades up 28ms after the
   *   row above it.
   */
  enter?: 'new' | { stagger: number };
}

/**
 * One row of a list: 48px high, or 60px with a ListRowMeta line. Content
 * starts 18px in and ends 16px from the edge, like a card header. With a
 * ListRowLink inside, the whole row opens the link and takes a `muted` hover
 * fill; keyboard focus on the link draws an inset ring around the row.
 *
 * A row added while the page is open takes `enter` and enters once.
 */
function ListRow({ className, enter, style, ...props }: ListRowProps) {
  const stagger = typeof enter === 'object' ? enter.stagger : undefined;
  return (
    <div
      data-slot="list-row"
      data-enter={enter === 'new' ? 'new' : enter ? 'stagger' : undefined}
      style={
        stagger !== undefined
          ? ({
              '--list-row-stagger-delay': `${Math.min(Math.max(stagger, 0), STAGGER_ROWS) * STAGGER_MS}ms`,
              ...style,
            } as React.CSSProperties)
          : style
      }
      className={cn(
        'group/list-row relative flex min-h-12 items-center gap-3 border-t border-border ps-4.5 pe-4 text-sm first:border-t-0',
        '[[data-slot=list-row-group-heading]+&]:border-t-0',
        'has-data-[slot=list-row-meta]:py-2.5',
        'transition-colors duration-fast ease-default',
        'has-data-[slot=list-row-link]:cursor-pointer has-data-[slot=list-row-link]:hover:bg-muted',
        'has-[[data-slot=list-row-link]:focus-visible]:outline-solid has-[[data-slot=list-row-link]:focus-visible]:outline-2 has-[[data-slot=list-row-link]:focus-visible]:-outline-offset-2 has-[[data-slot=list-row-link]:focus-visible]:outline-ring',
        LIFT_CONTROLS,
        ENTER_NEW,
        ENTER_STAGGER,
        className,
      )}
      {...props}
    />
  );
}

/**
 * The heading of a group of rows, such as a day ("Today", "Yesterday"): 34px,
 * in `foreground-secondary`, a step above the row meta. It takes the rule
 * above, so the first row under it drops its own. Renders a `div`; pass `render={<h3 />}` when the groups belong in the page outline.
 */
function ListRowGroupHeading({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      {
        className: cn(
          'border-t border-border pt-4 pb-1.5 ps-4.5 pe-4 text-xs leading-3 font-semibold text-foreground-secondary first:border-t-0',
          className,
        ),
      },
      props,
    ),
    state: { slot: 'list-row-group-heading' },
  });
}

/**
 * Leading icon, avatar or status mark. Icons default to 16px. A plain icon is
 * decorative: it renders quieter than the title (55%, 85% while the row is
 * hovered or focused). An icon with its own `text-*` colour, such as a tone
 * icon, keeps it at full strength.
 */
function ListRowLeading({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-row-leading"
      className={cn(
        "flex shrink-0 items-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        "[&>svg:not([class*='opacity-']):not([class*='text-'])]:text-foreground [&>svg:not([class*='opacity-']):not([class*='text-'])]:opacity-55 [&>svg:not([class*='opacity-']):not([class*='text-'])]:transition-opacity [&>svg:not([class*='opacity-']):not([class*='text-'])]:duration-moderate group-hover/list-row:[&>svg:not([class*='opacity-']):not([class*='text-'])]:opacity-85 group-focus-within/list-row:[&>svg:not([class*='opacity-']):not([class*='text-'])]:opacity-85",
        className,
      )}
      {...props}
    />
  );
}

/** The text column: the title (ListRowLink or ListRowTitle) and an optional ListRowMeta. */
function ListRowContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-row-content"
      className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)}
      {...props}
    />
  );
}

const titleClassName = 'min-w-0 max-w-full truncate text-start text-sm font-medium text-foreground';

/**
 * The row link and the row's title. Renders a `<button>` for an `onClick`
 * handler; pass `render={<a href="…" />}` (or a router link element) to open a
 * URL. Its children are the accessible name of the row, so keep them to the
 * title: put secondary text in ListRowMeta.
 */
function ListRowLink({ className, render, ...props }: useRender.ComponentProps<'button'>) {
  return useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(
      {
        // A native button submits its form by default; a rendered anchor or
        // router link takes no type.
        type: render ? undefined : 'button',
        className: cn(
          titleClassName,
          'cursor-pointer outline-none after:absolute after:inset-0',
          className,
        ),
      },
      props,
    ),
    state: { slot: 'list-row-link' },
  });
}

/** The title of a static row, one that opens nothing. Same type as ListRowLink. */
function ListRowTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="list-row-title" className={cn(titleClassName, className)} {...props} />;
}

/** The secondary line under the title (who, how long). Makes the row a two-line row. */
function ListRowMeta({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="list-row-meta"
      className={cn('truncate text-xs leading-4.5 text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Always-visible end columns: a status, a time, a count. Tabular figures keep times aligned. */
function ListRowTrailing({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-row-trailing"
      className={cn(
        'flex shrink-0 items-center gap-3 text-muted-foreground tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

// Hover-revealed controls fade in `quick` on `soft`. They stay visible while
// the row has focus, while one of them has its menu open, and on touch
// screens, where there is no hover.
const revealOnRowHover =
  'opacity-0 transition-opacity duration-quick ease-soft group-hover/list-row:opacity-100 group-focus-within/list-row:opacity-100 [@media(hover:none)]:opacity-100';

/** Secondary row actions. Hidden until the row is hovered or has focus. */
function ListRowActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-row-actions"
      className={cn(
        'relative z-10 flex shrink-0 items-center gap-1',
        revealOnRowHover,
        'has-[[aria-expanded=true]]:opacity-100',
        className,
      )}
      {...props}
    />
  );
}

// ListRowSwap stacks its value and its action in one grid cell, so the cell
// keeps the width of the wider one and nothing in the row moves. The swap is
// sequenced, not a crossfade: the outgoing one fades in `row-swap-out`, the
// incoming one fades in `quick` after `row-swap-delay`, both on `soft`, so the
// value and the action never show at once. The rest state carries the leave
// timing (the action out first, the value back after it); the shown state
// carries the enter timing. The action shows while the row is hovered, while
// anything in the row has keyboard focus and while the action's menu is open;
// on a touch screen it always shows. Reduced motion swaps at once. The value
// only fades, so a screen reader still reads it. The class names stay literal
// so Tailwind can scan them.
const SWAP_VALUE_CLASS = [
  'col-start-1 row-start-1 whitespace-nowrap text-foreground-secondary tabular-nums',
  'transition-opacity duration-quick ease-soft delay-(--transition-duration-row-swap-delay) motion-reduce:transition-none',
  'group-hover/list-row:opacity-0 group-hover/list-row:duration-row-swap-out group-hover/list-row:delay-0',
  'group-has-[:focus-visible]/list-row:opacity-0 group-has-[:focus-visible]/list-row:duration-row-swap-out group-has-[:focus-visible]/list-row:delay-0',
  'group-has-[[aria-expanded=true]]/list-row-swap:opacity-0 group-has-[[aria-expanded=true]]/list-row-swap:duration-row-swap-out group-has-[[aria-expanded=true]]/list-row-swap:delay-0',
  '[@media(hover:none)]:opacity-0',
].join(' ');

const SWAP_ACTION_CLASS = [
  'col-start-1 row-start-1 flex items-center gap-1 opacity-0',
  'transition-opacity duration-row-swap-out ease-soft motion-reduce:transition-none',
  'group-hover/list-row:opacity-100 group-hover/list-row:duration-quick group-hover/list-row:delay-(--transition-duration-row-swap-delay)',
  'group-has-[:focus-visible]/list-row:opacity-100 group-has-[:focus-visible]/list-row:duration-quick group-has-[:focus-visible]/list-row:delay-(--transition-duration-row-swap-delay)',
  'group-has-[[aria-expanded=true]]/list-row-swap:opacity-100',
  '[@media(hover:none)]:opacity-100',
].join(' ');

interface ListRowSwapProps extends React.ComponentProps<'div'> {
  /** What the cell shows at rest: a size, a count, a time. */
  value: React.ReactNode;
  /** The action that takes the value's place: one `sm` Button or a menu trigger. */
  children: React.ReactNode;
}

/**
 * The last value of a row that turns into an action: at rest the cell shows
 * `value`; while the row is hovered, holds keyboard focus or has the action's
 * menu open, the value fades out and the action (`children`) fades in its
 * place. On a touch screen the action always shows. The cell is as wide as
 * the wider of the two, so nothing in the row moves. Place it last in the
 * row, after ListRowTrailing. Give the action a name that says which row it
 * acts on (`aria-label="Restore to today, 01:00"`).
 */
function ListRowSwap({ value, children, className, ...props }: ListRowSwapProps) {
  return (
    <div
      data-slot="list-row-swap"
      className={cn('group/list-row-swap grid shrink-0 items-center justify-items-end', className)}
      {...props}
    >
      {/* `dir="auto"` keeps a Latin value ("1.82 GB") in its own order inside a right-to-left row. */}
      <span data-slot="list-row-swap-value" dir="auto" className={SWAP_VALUE_CLASS}>
        {value}
      </span>
      <div data-slot="list-row-swap-action" className={SWAP_ACTION_CLASS}>
        {children}
      </div>
    </div>
  );
}

// The row-end chevron of ListRow and of a DataTable row with a row link: one
// recipe, so the two cannot drift. Hidden at rest; while its row is hovered
// or holds keyboard focus it fades in and slides 3px toward the end (fade only
// under reduced motion). On a touch screen it always shows. The row is the
// ListRow (`group/list-row`) or the DataTable row (`group/row`). The class
// names stay literal so Tailwind can scan them.
const ROW_CHEVRON_CLASS = [
  'size-3.75 shrink-0 text-muted-foreground opacity-0 rtl:-scale-x-100',
  'transition-[opacity,translate] duration-fast ease-out',
  'motion-safe:-translate-x-0.75 motion-safe:rtl:translate-x-0.75',
  'group-hover/list-row:translate-x-0 group-hover/list-row:opacity-100 group-has-[:focus-visible]/list-row:translate-x-0 group-has-[:focus-visible]/list-row:opacity-100',
  'group-hover/row:translate-x-0 group-hover/row:opacity-100 group-has-[:focus-visible]/row:translate-x-0 group-has-[:focus-visible]/row:opacity-100',
  '[@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100',
].join(' ');

/**
 * The trailing chevron of a linked row: 15px. While the row is hovered or
 * holds keyboard focus, it fades in and slides 3px toward the end in 100ms
 * (fade only under reduced motion). Decorative: the link carries the name.
 * DataTableRowLink renders the same chevron.
 */
function ListRowChevron({ className, ...props }: React.ComponentProps<typeof ChevronRight>) {
  return (
    <ChevronRight
      data-slot="list-row-chevron"
      aria-hidden="true"
      strokeWidth={1.75}
      className={cn(ROW_CHEVRON_CLASS, className)}
      {...props}
    />
  );
}

export {
  ListRow,
  ListRowActions,
  ListRowChevron,
  ListRowContent,
  ListRowGroupHeading,
  ListRowLeading,
  ListRowLink,
  ListRowMeta,
  ListRowSwap,
  ListRowTitle,
  ListRowTrailing,
};
export type { ListRowProps, ListRowSwapProps };
