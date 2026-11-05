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
// (IdChip, CopyableText: their value shows on hover and stays selectable),
// except the row link itself. Any other element that must stay hoverable above
// the link takes `data-list-row-control`. The class names stay literal so
// Tailwind can scan them.
const LIFT_CONTROLS =
  '[&_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-slot=tooltip-trigger],[data-slot=id-chip],[data-slot=copyable-text],[data-list-row-control]):not([data-slot=list-row-link])]:relative [&_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-slot=tooltip-trigger],[data-slot=id-chip],[data-slot=copyable-text],[data-list-row-control]):not([data-slot=list-row-link])]:z-10';

// A row the user just added (`data-new`) enters once: its height opens from 0
// so the rows below glide down, then its content fades in from a 3px blur.
// @starting-style runs it on mount only, so a list never animates on page
// load unless the caller marks rows. `interpolate-size` lets the height run to
// `auto`, which keeps a two-line row exact; a browser without it skips the
// height and keeps the fade. Reduced motion keeps the fade only.
const ENTER_NEW =
  'data-new:overflow-clip data-new:[interpolate-size:allow-keywords] motion-safe:data-new:[transition:height_var(--transition-duration-slow)_var(--ease-drawer),min-height_var(--transition-duration-slow)_var(--ease-drawer),opacity_var(--transition-duration-normal)_var(--ease-default)_var(--transition-duration-fast),filter_var(--transition-duration-slow)_var(--ease-out)_var(--transition-duration-fast),background-color_var(--transition-duration-fast)_var(--ease-default)] motion-safe:data-new:starting:h-0 motion-safe:data-new:starting:min-h-0 motion-safe:data-new:starting:blur-[3px] data-new:starting:opacity-0 motion-reduce:data-new:[transition:opacity_var(--transition-duration-normal)_var(--ease-default),background-color_var(--transition-duration-fast)_var(--ease-default)]';

/**
 * One row of a list: 48px high, or taller with a ListRowMeta line. With a
 * ListRowLink inside, the whole row opens the link and takes a `muted` hover
 * fill; keyboard focus on the link draws an inset ring around the row.
 *
 * Set `data-new` on a row the user just added (a new backup, a new push) and
 * it enters once: the height opens, then the content fades in. Mark only rows
 * added while the page is open, never rows of the first render.
 */
function ListRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-row"
      className={cn(
        'group/list-row relative flex min-h-12 items-center gap-3 border-t border-border px-4 text-sm first:border-t-0',
        'has-data-[slot=list-row-meta]:py-2.5',
        'transition-colors duration-(--transition-duration-fast) ease-(--ease-default)',
        'has-data-[slot=list-row-link]:cursor-pointer has-data-[slot=list-row-link]:hover:bg-muted',
        'has-[[data-slot=list-row-link]:focus-visible]:outline-solid has-[[data-slot=list-row-link]:focus-visible]:outline-2 has-[[data-slot=list-row-link]:focus-visible]:-outline-offset-2 has-[[data-slot=list-row-link]:focus-visible]:outline-ring',
        LIFT_CONTROLS,
        ENTER_NEW,
        className,
      )}
      {...props}
    />
  );
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
        "[&>svg:not([class*='opacity-']):not([class*='text-'])]:text-foreground [&>svg:not([class*='opacity-']):not([class*='text-'])]:opacity-55 [&>svg:not([class*='opacity-']):not([class*='text-'])]:transition-opacity [&>svg:not([class*='opacity-']):not([class*='text-'])]:duration-(--transition-duration-moderate) group-hover/list-row:[&>svg:not([class*='opacity-']):not([class*='text-'])]:opacity-85 group-focus-within/list-row:[&>svg:not([class*='opacity-']):not([class*='text-'])]:opacity-85",
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

const titleClassName = 'min-w-0 max-w-full truncate text-left text-sm font-medium text-foreground';

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
      className={cn('truncate text-xs text-muted-foreground', className)}
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

// Hover-revealed controls stay visible while the row has focus, while one of
// them has its menu open, and on touch screens, where there is no hover.
const revealOnRowHover =
  'opacity-0 transition-opacity duration-(--transition-duration-moderate) ease-(--ease-default) group-hover/list-row:opacity-100 group-focus-within/list-row:opacity-100 [@media(hover:none)]:opacity-100';

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

/** The trailing chevron of a linked row. Decorative: the link carries the name. */
function ListRowChevron({ className, ...props }: React.ComponentProps<typeof ChevronRight>) {
  return (
    <ChevronRight
      data-slot="list-row-chevron"
      aria-hidden="true"
      strokeWidth={1.75}
      className={cn('size-4 shrink-0 text-muted-foreground', revealOnRowHover, className)}
      {...props}
    />
  );
}

export {
  ListRow,
  ListRowActions,
  ListRowChevron,
  ListRowContent,
  ListRowLeading,
  ListRowLink,
  ListRowMeta,
  ListRowTitle,
  ListRowTrailing,
};
