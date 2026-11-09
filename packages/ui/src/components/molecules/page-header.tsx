import type { useRender } from '@base-ui/react/use-render';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';
import { DirectionLink } from './direction-link.tsx';

// Compound-only, by decision: there is no simple-props sugar and
// no dual-mode root. Callers assemble the parts, which keeps one way to build a
// header and lets variance in the wild (back links, badge rows beside the title,
// mono subtitles) live as free children rather than as an ever-growing prop set.

/**
 * The header row: title/description on the left, actions on the right. The row
 * wraps, so on a narrow screen the actions move below the title instead of
 * squeezing it.
 */
function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="page-header"
      className={cn('flex flex-wrap items-start justify-between gap-4', className)}
      {...props}
    />
  );
}

/** Left column holding the title, description, and any inline badges. */
function PageHeaderContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-content"
      className={cn('flex min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn('text-style-page-title break-words', className)}
      {...props}
    />
  );
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-header-description"
      className={cn('text-sm text-foreground-secondary', className)}
      {...props}
    />
  );
}

/** Right-hand action slot (buttons, menus). Moves below the title when the row has no room. */
function PageHeaderActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn('flex shrink-0 items-center gap-2', className)}
      {...props}
    />
  );
}

/**
 * The facts under the title: branch, region, host, owner. 13px text in
 * `foreground-secondary`, 18px between facts and 6px between rows when they
 * wrap. Put it in PageHeaderContent, below the title.
 */
function PageHeaderFacts({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-facts"
      className={cn(
        'flex flex-wrap items-center gap-x-4.5 gap-y-1.5 text-style-body text-foreground-secondary',
        className,
      )}
      {...props}
    />
  );
}

/** One fact: an optional leading icon at 45% and its text, 7px apart. */
function PageHeaderFact({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="page-header-fact"
      className={cn(
        'inline-flex min-w-0 items-center gap-1.75 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:stroke-[1.75] [&>svg]:opacity-45',
        className,
      )}
      {...props}
    />
  );
}

/** Optional row rendered above the header: holds a PageHeaderBack. */
function PageHeaderBackRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-back-row"
      className={cn('flex items-center text-style-body text-muted-foreground', className)}
      {...props}
    />
  );
}

/**
 * The link up one level, above the title: "Deployments", "All profiles".
 * Renders an `<a>` with a leading chevron in `muted-foreground`; the look,
 * motion and right-to-left handling are ArrowLink's, pointing back. Pass
 * `render` to use a router link.
 */
function PageHeaderBack({ className, ...props }: useRender.ComponentProps<'a'>) {
  return (
    <DirectionLink
      direction="back"
      slot="page-header-back"
      iconSlot="page-header-back-chevron"
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
  PageHeaderBackRow,
  PageHeaderBack,
  PageHeaderFacts,
  PageHeaderFact,
};
