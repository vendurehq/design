import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChevronLeft } from 'lucide-react';
import type * as React from 'react';

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
function PageHeaderBackLink({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-back-link"
      className={cn('flex items-center text-style-body text-muted-foreground', className)}
      {...props}
    />
  );
}

// The v3 look: 13px medium text in `muted-foreground` after a 15px left
// chevron at 45%. On hover or keyboard focus the text reaches full foreground
// and the chevron full strength, and the chevron moves 2px back, the way the
// link goes. Colour eases in `quick` on `soft`; the chevron fades in `moderate`
// on `soft` and moves in `normal` on the strong ease-out. With reduced motion
// only the colour and opacity change. In a right-to-left layout the chevron
// points and moves right.

/**
 * The link up one level, above the title: "Deployments", "All profiles".
 * Renders an `<a>` with a leading chevron; pass `render` to use a router link.
 */
function PageHeaderBack({ className, render, children, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(
          'group/page-header-back inline-flex cursor-pointer items-center gap-1.5 text-style-body font-medium text-muted-foreground',
          'transition-colors duration-(--transition-duration-quick) ease-(--ease-soft)',
          'hover:text-foreground focus-visible:text-foreground',
          'rounded-md outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className,
        ),
        children: (
          <>
            <ChevronLeft
              aria-hidden="true"
              data-slot="page-header-back-chevron"
              className={cn(
                'size-3.75 shrink-0 opacity-45 rtl:-scale-x-100',
                '[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft),translate_var(--transition-duration-normal)_var(--ease-out)]',
                'group-hover/page-header-back:opacity-100 group-hover/page-header-back:-translate-x-0.5 rtl:group-hover/page-header-back:translate-x-0.5',
                'group-focus-visible/page-header-back:opacity-100 group-focus-visible/page-header-back:-translate-x-0.5 rtl:group-focus-visible/page-header-back:translate-x-0.5',
                'motion-reduce:translate-none!',
              )}
            />
            {children}
          </>
        ),
      },
      props,
    ),
    state: { slot: 'page-header-back' },
  });
}

export {
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
  PageHeaderBackLink,
  PageHeaderBack,
  PageHeaderFacts,
  PageHeaderFact,
};
