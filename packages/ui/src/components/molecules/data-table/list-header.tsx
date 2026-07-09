import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

// The three-zone list-page header: title row / control row / chip row. Ships
// layout, not logic — TanStack-free, fetch-agnostic, router-agnostic.
//
// By decision, the title row is NOT re-implemented here: it complements
// `PageHeader` rather than competing with it, so consumers compose the existing
// `PageHeader` compound as the first child. The chip row is rendered by the
// consumer only when filters are active — ListHeaderChips does no
// `React.Children` introspection and holds no active-filter logic.

/**
 * Root of the list-page header: a vertical stack of zones. Render free children
 * top to bottom — typically `PageHeader`, then `ListHeaderControls`, then
 * (only when filters are active) `ListHeaderChips`.
 */
function ListHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="list-header" className={cn('flex flex-col gap-4', className)} {...props} />
  );
}

/**
 * The control row: a horizontal flex row for search input, filter triggers, and
 * view options. Layout only — children are free.
 */
function ListHeaderControls({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-header-controls"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

/**
 * The chip row: a horizontal wrapping flex row of applied-filter `Chip`s. Dumb
 * by design — render it only when filters are active; it does not inspect its
 * children or decide when to appear.
 */
function ListHeaderChips({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-header-chips"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

export { ListHeader, ListHeaderControls, ListHeaderChips };
